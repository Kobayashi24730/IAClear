# app.py  
from fastapi import FastAPI  
from fastapi.middleware.cors import CORSMiddleware  
from fastapi.responses import FileResponse, JSONResponse  
from pydantic import BaseModel  
from openai import OpenAI  
from dotenv import load_dotenv  
import os  
import tempfile  
import json  
import traceback  
from typing import Dict, Any  
  
from reportlab.lib.pagesizes import A4  
from reportlab.lib import colors  
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak  
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle  
from reportlab.lib.units import cm  
  
load_dotenv()  
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")  
if not OPENAI_API_KEY:  
    raise RuntimeError("OPENAI_API_KEY não definido no .env")  
  
client = OpenAI(api_key=OPENAI_API_KEY)  
  
app = FastAPI(title="FisiQIA Backend - Leis de Newton")  
  
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],
)
  
  
respostas_sessao: Dict[str, Dict[str, Any]] = {}  
  
class Pergunta(BaseModel):  
    projeto: str  
    session_id: str  
  
TOPICOS_PERMITIDOS = [  
    "leis de newton", "força", "movimento", "massa", "aceleração",  
    "inércia", "gravitacional", "peso", "física", "dinâmica",  
    "projetos", "resumos", "mapas mentais", "equações", "experimentos",  
    "segunda lei", "terceira lei", "primeira lei", "lei da ação e reação",  
    "queda livre", "atrito"  
]  
  
def validar_tema(prompt: str) -> bool:  
    prompt_lower = prompt.lower()  
    return any(topico in prompt_lower for topico in TOPICOS_PERMITIDOS)  
  
async def gerar_resposta_raw(prompt: str, max_tokens: int = 1200):  
    """  
    Retorna a string bruta gerada pelo modelo.  
    """  
    try:  
        completion = client.chat.completions.create(  
            model="gpt-4o-mini",  
            messages=[{"role":"user","content":prompt}],  
            max_tokens=max_tokens  
        )  
        return completion.choices[0].message.content  
    except Exception as e:  
  
        print("ERRO gerar_resposta_raw:", e)  
        traceback.print_exc()  
        return f"Erro ao gerar resposta: {e}"  
  
async def gerar_resposta_com_books(prompt: str, max_tokens: int = 1500):  
    """  
    Peça ao modelo que retorne JSON com campos:  
    {  
      "content": "<texto principal - sem marcações>",  
      "books": ["Livro 1 - Autor", "Livro 2 - Autor", ...],  
      "notes": "<observações opcionais>"  
    }  
    Se não for possível parsear JSON, devolve {"content": raw_text, "books": []}  
    """  
    system_instruction = (  
        "Você é um assistente que prioriza informações provenientes de livros e fontes acadêmicas. "  
        "Ao responder, gere um JSON com três campos: content, books e notes. "  
        "content: o texto completo, explicado, sem markdown. "  
        "books: uma lista (array) dos livros, nomes e autores ou fontes principais usadas como referência (mínimo quando possível). "  
        "notes: observações curtas (opcional). "  
        "Retorne apenas JSON válido, sem texto extra."  
    )  
  
    messages = [  
        {"role":"system","content":system_instruction},  
        {"role":"user","content":prompt}  
    ]  
    try:  
        completion = client.chat.completions.create(  
            model="gpt-4o-mini",  
            messages=messages,  
            max_tokens=max_tokens  
        )  
        raw = completion.choices[0].message.content  
  
        try:  
            parsed = json.loads(raw)  
  
            content = parsed.get("content", "").strip()  
            books = parsed.get("books", [])  
            notes = parsed.get("notes", "")  
            if not isinstance(books, list):  
                books = []  
            return {"content": content, "books": books, "notes": notes}  
        except Exception:  
  
            return {"content": raw, "books": [], "notes": "Resposta não em JSON; conteúdo bruto retornado."}  
    except Exception as e:  
        print("ERRO gerar_resposta_com_books:", e)  
        traceback.print_exc()  
        return {"content": f"Erro ao gerar resposta: {e}", "books": [], "notes": ""}  
  
def salvar_resposta(session_id: str, campo: str, content: str, books=None, notes=""):  
    if books is None:  
        books = []  
    if session_id not in respostas_sessao:  
        respostas_sessao[session_id] = {"projeto": None}  
    respostas_sessao[session_id][campo] = {"text": content, "books": books, "notes": notes}  
  
async def checar_consistencia_via_model(session_data: Dict[str, Any]):  
    """  
    Envia as seções ao modelo pedindo um JSON:  
    { "consistent": true/false, "mismatch": ["materiais","montagem"], "explanation": "..."}  
    """  
  
    partes = []  
    for chave in ["visao","materiais","montagem","procedimento"]:  
        if chave in session_data:  
            partes.append(f"--- {chave.upper()} ---\n{session_data[chave]['text']}\n")  
    prompt = (  
        "Você receberá diferentes respostas geradas para mesmo projeto em seções separadas. "  
        "Verifique se todas as seções tratam do MESMO tema/projeto e se são coerentes entre si.\n\n"  
        "Responda apenas com um JSON válido com os campos:\n"  
        '  { "consistent": true/false, "mismatch": ["nome_da_secao",...], "explanation": "texto curto" }\n\n'  
        "Se estiver tudo consistente, consistent:true e mismatch:[]\n\n"  
        "Se quiser, use as informações abaixo para avaliar:\n\n" + "\n".join(partes)  
    )  
  
    try:  
        completion = client.chat.completions.create(  
            model="gpt-4o-mini",  
            messages=[{"role":"user","content":prompt}],  
            max_tokens=400  
        )  
        raw = completion.choices[0].message.content  
        try:  
            result = json.loads(raw)  
  
            consistent = bool(result.get("consistent", False))  
            mismatch = result.get("mismatch", [])  
            explanation = result.get("explanation", "")  
            return {"consistent": consistent, "mismatch": mismatch, "explanation": explanation}  
        except Exception:  
  
            texts = [session_data[k]["text"].lower() for k in session_data if k in ["visao","materiais","montagem","procedimento"]]  
  
            counts = []  
            for t in texts:  
                cnt = sum(1 for w in TOPICOS_PERMITIDOS if w in t)  
                counts.append(cnt)  
  
            if len(counts) < 2:  
                return {"consistent": True, "mismatch": [], "explanation": "Poucas seções para comparar."}  
            import statistics  
            if statistics.pstdev(counts) > 1.5:  
                return {"consistent": False, "mismatch": [], "explanation": "Heurística detectou baixa concordância entre seções."}  
            return {"consistent": True, "mismatch": [], "explanation": "Heurística detectou concordância."}  
    except Exception as e:  
        print("ERRO checar_consistencia_via_model:", e)  
        traceback.print_exc()  
        return {"consistent": True, "mismatch": [], "explanation": "Erro ao checar consistência; assumindo consistente."}  
  
@app.post("/visao")  
async def visao(data: Pergunta):  
    if not validar_tema(data.projeto):  
        return JSONResponse({"resposta": "❌ Tema não permitido. Só assuntos relacionados às Leis de Newton."}, status_code=400)  
    prompt = (  
        f"Escreva uma visão geral clara, bem estruturada e agradável sobre o projeto '{data.projeto}'. "  
        "Priorize informação baseada em livros e fontes acadêmicas; ao final, retorne um JSON com campos: content (texto), books (lista de livros usados, autor e ano quando possível), notes (opcional). Retorne apenas JSON."  
    )  
    generated = await gerar_resposta_com_books(prompt)  
    salvar_resposta(data.session_id, "visao", generated["content"], generated["books"], generated.get("notes",""))  
  
    if data.session_id not in respostas_sessao:  
        respostas_sessao[data.session_id] = {}  
    respostas_sessao[data.session_id]["projeto"] = data.projeto  
    return {"resposta": generated}  
  
@app.post("/materiais")  
async def materiais(data: Pergunta):  
    if not validar_tema(data.projeto):  
        return JSONResponse({"resposta": "❌ Tema não permitido."}, status_code=400)  
    prompt = (  
        f"Liste, com quantidades e descrições curtas, os materiais necessários para o projeto '{data.projeto}'. "  
        "Priorize materiais acessíveis. Ao final, retorne JSON: {\"content\": \"...\", \"books\": [...], \"notes\":\"...\"}. Sem markdown."  
    )  
    generated = await gerar_resposta_com_books(prompt)  
    salvar_resposta(data.session_id, "materiais", generated["content"], generated["books"], generated.get("notes",""))  
    respostas_sessao[data.session_id]["projeto"] = data.projeto  
    return {"resposta": generated}  
  
@app.post("/montagem")  
async def montagem(data: Pergunta):  
    if not validar_tema(data.projeto):  
        return JSONResponse({"resposta": "❌ Tema não permitido."}, status_code=400)  
    prompt = (  
        f"Explique passo a passo a montagem do projeto '{data.projeto}', descrevendo diagramas ou componentes importantes. "  
        "Retorne JSON: {\"content\":\"...\",\"books\":[...],\"notes\":\"...\"}."  
    )  
    generated = await gerar_resposta_com_books(prompt)  
    salvar_resposta(data.session_id, "montagem", generated["content"], generated["books"], generated.get("notes",""))  
    respostas_sessao[data.session_id]["projeto"] = data.projeto  
    return {"resposta": generated}  
  
@app.post("/procedimento")  
async def procedimento(data: Pergunta):  
    if not validar_tema(data.projeto):  
        return JSONResponse({"resposta": "❌ Tema não permitido."}, status_code=400)  
    prompt = (  
        f"Descreva o procedimento do projeto '{data.projeto}' de forma didática e segura. "  
        "Retorne JSON: {\"content\":\"...\",\"books\":[...],\"notes\":\"...\"}."  
    )  
    generated = await gerar_resposta_com_books(prompt)  
    salvar_resposta(data.session_id, "procedimento", generated["content"], generated["books"], generated.get("notes",""))  
    respostas_sessao[data.session_id]["projeto"] = data.projeto  
    return {"resposta": generated}  
  
@app.post("/relatorio")  
async def gerar_pdf(data: Pergunta):  
    session = respostas_sessao.get(data.session_id, {})  
    projeto_nome = data.projeto or session.get("projeto", "Projeto")  
  
    faltantes = [sec for sec in ("visao","materiais","montagem","procedimento") if sec not in session]  
    if faltantes:  
        return JSONResponse({  
            "resposta": "❌ Ainda não existem respostas para todas as seções.",  
            "faltantes": faltantes,  
            "instrucao": "Chame as rotas /visao, /materiais, /montagem e /procedimento usando o mesmo session_id antes de gerar o relatório."  
        }, status_code=400)  
  
  
    consist_check = await checar_consistencia_via_model(session)  
    if not consist_check.get("consistent", True):  
        return JSONResponse({  
            "resposta": "⚠️ Inconsistência detectada entre as respostas das seções.",  
            "mismatch": consist_check.get("mismatch", []),  
            "explanation": consist_check.get("explanation", ""),  
            "instrucao": "Revise as seções listadas (re-pesquise com o mesmo projeto) para torná-las coerentes antes de gerar o relatório."  
        }, status_code=400)  
  
  
    visao = session["visao"]["text"]  
    materiais = session["materiais"]["text"]  
    montagem = session["montagem"]["text"]  
    procedimento = session["procedimento"]["text"]  
  
  
    livros = []  
    for sec in ("visao","materiais","montagem","procedimento"):  
        for b in session.get(sec, {}).get("books", []) or []:  
            if isinstance(b, str) and b.strip():  
                livros.append(b.strip())  
  
    seen = set()  
    livros_unicos = []  
    for b in livros:  
        if b not in seen:  
            livros_unicos.append(b)  
            seen.add(b)  
  
  
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")  
    pdf_path = tmp.name  
    tmp.close()  
  
    doc = SimpleDocTemplate(  
        pdf_path,  
        pagesize=A4,  
        leftMargin=2*cm,  
        rightMargin=2*cm,  
        topMargin=2*cm,  
        bottomMargin=2*cm  
    )  
  
    styles = getSampleStyleSheet()  
    estilo_titulo = ParagraphStyle("Titulo", parent=styles["Heading1"], fontSize=18, spaceAfter=12)  
    estilo_sub = ParagraphStyle("SubTitulo", parent=styles["Heading2"], fontSize=13, textColor=colors.HexColor("#003366"), spaceAfter=8)  
    estilo_texto = ParagraphStyle("Texto", parent=styles["BodyText"], fontSize=11, leading=16, spaceAfter=6)  
  
    story = []  
    story.append(Paragraph(f"Relatório Técnico — {projeto_nome}", estilo_titulo))  
    story.append(Paragraph("Gerado por: FisiQIA (IA sugerida)", styles["Normal"]))  
    story.append(Spacer(1, 12))  
  
  
    def add_section(title, content_text):  
        story.append(Paragraph(title, estilo_sub))  
        paragraphs = [p.strip() for p in content_text.split("\n\n") if p.strip()]  
        for p in paragraphs:  
  
            story.append(Paragraph(p.replace("\n","<br/>"), estilo_texto))  
        story.append(Spacer(1, 8))  
  
    add_section("Visão Geral", visao)  
    add_section("Materiais", materiais)  
    add_section("Montagem", montagem)  
    add_section("Procedimento", procedimento)  
  
  
    if livros_unicos:  
        story.append(PageBreak())  
        story.append(Paragraph("Referências / Livros consultados (prioritários):", estilo_sub))  
        for livro in livros_unicos:  
            story.append(Paragraph(f"• {livro}", estilo_texto))  
        story.append(Spacer(1, 12))  
  
    doc.build(story)  
  
    return FileResponse(pdf_path, filename="relatorio.pdf", media_type="application/pdf")  
  

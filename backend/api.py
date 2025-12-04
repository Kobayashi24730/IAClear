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
    allow_methods=["*"],
    allow_headers=["*"],
)

# memória de sessão
respostas_sessao: Dict[str, Dict[str, Any]] = {}

# ---------------- MODELS ----------------

class Pergunta(BaseModel):
    projeto: str
    session_id: str

# ---------------- VALIDAÇÃO ----------------

TOPICOS_PERMITIDOS = [
    "leis de newton", "força", "movimento", "massa", "aceleração", "inércia",
    "gravitacional", "peso", "física", "dinâmica", "projetos", "resumos",
    "mapas mentais", "equações", "experimentos", "segunda lei", "terceira lei",
    "primeira lei", "lei da ação e reação", "queda livre", "atrito"
]

def validar_tema(prompt: str) -> bool:
    prompt_lower = prompt.lower()
    return any(topico in prompt_lower for topico in TOPICOS_PERMITIDOS)

# ---------------- OPENAI ----------------

async def gerar_resposta_raw(prompt: str, max_tokens: int = 1200):
    try:
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=max_tokens
        )
        return completion.choices[0].message.content

    except Exception as e:
        print("ERRO gerar_resposta_raw:", e)
        traceback.print_exc()
        return f"Erro ao gerar resposta: {e}"

async def gerar_resposta_com_books(prompt: str, max_tokens: int = 1500):
    system_instruction = (
        "Você deve responder APENAS em JSON válido com os campos "
        "{content, books, notes}. "
        "books deve conter autores e obras acadêmicas se possível."
    )

    try:
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": prompt}
            ],
            max_tokens=max_tokens
        )

        raw = completion.choices[0].message.content.strip()

        try:
            parsed = json.loads(raw)
            return {
                "content": parsed.get("content", "").strip(),
                "books": parsed.get("books", []),
                "notes": parsed.get("notes", "")
            }
        except:
            return {"content": raw, "books": [], "notes": "JSON inválido retornado"}

    except Exception as e:
        print("ERRO gerar_resposta_com_books:", e)
        return {"content": f"Erro ao gerar resposta: {e}", "books": [], "notes": ""}

# ---------------- ARMAZENAMENTO ----------------

def salvar_resposta(session_id: str, campo: str, content: str, books=None, notes=""):
    if books is None:
        books = []
    if session_id not in respostas_sessao:
        respostas_sessao[session_id] = {"projeto": None}
    respostas_sessao[session_id][campo] = {"text": content, "books": books, "notes": notes}

# ---------------- ROTAS IA ----------------

@app.post("/visao")
async def visao(data: Pergunta):
    if not validar_tema(data.projeto):
        return JSONResponse({"erro": "Tema negado. Permitido somente assuntos das Leis de Newton."}, 400)

    prompt = f"Explique de forma acadêmica a visão geral do projeto '{data.projeto}'."
    generated = await gerar_resposta_com_books(prompt)

    salvar_resposta(data.session_id, "visao", generated["content"], generated["books"])
    respostas_sessao[data.session_id]["projeto"] = data.projeto

    return {"resposta": generated}


@app.post("/materiais")
async def materiais(data: Pergunta):
    if not validar_tema(data.projeto):
        return JSONResponse({"erro": "Tema negado. Permitido somente assuntos das Leis de Newton."}, 400)

    prompt = f"Liste materiais para o projeto '{data.projeto}' com quantidades."
    generated = await gerar_resposta_com_books(prompt)

    salvar_resposta(data.session_id, "materiais", generated["content"], generated["books"])
    respostas_sessao[data.session_id]["projeto"] = data.projeto

    return {"resposta": generated}

@app.post("/montagem")
async def montagem(data: Pergunta):
    if not validar_tema(data.projeto):
        return JSONResponse({"erro": "Tema negado. Permitido somente assuntos das Leis de Newton."}, 400)

    prompt = f"Explique o passo a passo de montagem do projeto '{data.projeto}'."
    generated = await gerar_resposta_com_books(prompt)

    salvar_resposta(data.session_id, "montagem", generated["content"], generated["books"])
    respostas_sessao[data.session_id]["projeto"] = data.projeto

    return {"resposta": generated}

@app.post("/procedimento")
async def procedimento(data: Pergunta):
    if not validar_tema(data.projeto):
        return JSONResponse({"erro": "Tema negado. Permitido somente assuntos das Leis de Newton."}, 400)

    prompt = f"Explique o procedimento experimental do projeto '{data.projeto}'."
    generated = await gerar_resposta_com_books(prompt)

    salvar_resposta(data.session_id, "procedimento", generated["content"], generated["books"])
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

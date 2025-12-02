from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv
import os
import tempfile

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY

# =========================================================
# LOAD .ENV
# =========================================================
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY)

# =========================================================
# FASTAPI SETUP
# =========================================================
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================================================
# MEMORY (SESSÕES)
# =========================================================
respostas_sessao = {}
temas_sessao = {}

class Pergunta(BaseModel):
    projeto: str
    session_id: str


# =========================================================
# TÓPICOS PERMITIDOS
# =========================================================
TOPICOS_PERMITIDOS = [
    "leis de newton", "força", "movimento", "massa", "aceleração",
    "inércia", "gravitacional", "peso", "física", "dinâmica",
    "primeira lei", "segunda lei", "terceira lei", 
    "lei da ação e reação", "queda livre", "atrito"
]

def validar_tema(prompt: str) -> bool:
    prompt = prompt.lower()
    return any(t in prompt for t in TOPICOS_PERMITIDOS)


# =========================================================
# IA – PRIORIDADE DE CONTEÚDOS BASEADOS EM LIVROS
# =========================================================
async def gerar_resposta(prompt: str, max_tokens: int = 1400):

    referencia = (
        "Use como base principalmente os seguintes livros clássicos de Física:\n"
        "• Fundamentos da Física – Halliday, Resnick & Walker\n"
        "• Física: Volume 1 – Tipler & Mosca\n"
        "• Física – Sears & Zemansky\n"
        "• Mecânica – Landau & Lifshitz\n"
        "Explique com precisão científica e clareza didática. "
        "No final da resposta, adicione: 'Referências Utilizadas:' seguido da lista acima."
    )

    final_prompt = f"{referencia}\n\n{prompt}"

    try:
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": final_prompt}],
            max_tokens=max_tokens
        )
        return completion.choices[0].message.content

    except Exception as e:
        return f"Erro ao gerar resposta: {e}"


def salvar_resposta(session_id: str, campo: str, valor: str, tema: str):
    if session_id not in respostas_sessao:
        respostas_sessao[session_id] = {}
        temas_sessao[session_id] = tema

    respostas_sessao[session_id][campo] = valor


# =========================================================
# ENDPOINTS
# =========================================================
@app.post("/visao")
async def visao(data: Pergunta):

    if not validar_tema(data.projeto):
        return {"resposta": "❌ Tema não permitido. Use temas relacionados às Leis de Newton."}

    resposta = await gerar_resposta(
        f"Escreva uma visão geral sobre o projeto {data.projeto}, "
        "com introdução, propósito e impacto. Texto claro e científico. Sem markdown."
    )

    salvar_resposta(data.session_id, "visao", resposta, data.projeto.lower())

    return {"resposta": resposta}


@app.post("/materiais")
async def materiais(data: Pergunta):

    if not validar_tema(data.projeto):
        return {"resposta": "❌ Tema não permitido."}

    resposta = await gerar_resposta(
        f"Liste materiais necessários para o projeto {data.projeto}, "
        'com quantidades e explicações técnicas. Sem markdown.'
    )

    salvar_resposta(data.session_id, "materiais", resposta, data.projeto.lower())

    return {"resposta": resposta}


@app.post("/montagem")
async def montagem(data: Pergunta):

    if not validar_tema(data.projeto):
        return {"resposta": "❌ Tema não permitido."}

    resposta = await gerar_resposta(
        f"Descreva o passo a passo da montagem do projeto {data.projeto} com clareza. Sem markdown."
    )

    salvar_resposta(data.session_id, "montagem", resposta, data.projeto.lower())

    return {"resposta": resposta}


@app.post("/procedimento")
async def procedimento(data: Pergunta):

    if not validar_tema(data.projeto):
        return {"resposta": "❌ Tema não permitido."}

    resposta = await gerar_resposta(
        f"Explique o procedimento experimental completo do projeto {data.projeto}. Sem markdown."
    )

    salvar_resposta(data.session_id, "procedimento", resposta, data.projeto.lower())

    return {"resposta": resposta}


# =========================================================
# RELATÓRIO PDF BONITO E VERIFICAÇÃO DE TEMA
# =========================================================
@app.post("/relatorio")
async def gerar_pdf(data: Pergunta):

    session = respostas_sessao.get(data.session_id)
    tema_base = temas_sessao.get(data.session_id)

    if not session:
        return {"erro": "❌ Nenhuma resposta foi gerada nesta sessão."}

    
    if data.projeto.lower() != tema_base:
        return {
            "erro": "❌ As respostas geradas não correspondem ao mesmo tema.",
            "solucao": "Gere novamente /visao, /materiais, /montagem e /procedimento usando o MESMO tema."
        }

    visao = session.get("visao")
    materiais = session.get("materiais")
    montagem = session.get("montagem")
    procedimento = session.get("procedimento")

    
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    pdf_path = tmp.name
    tmp.close()

    
    styles = getSampleStyleSheet()

    estilo_titulo = ParagraphStyle(
        "Titulo",
        parent=styles["Title"],
        alignment=TA_CENTER,
        fontSize=22,
        textColor=colors.darkblue,
        spaceAfter=20
    )

    estilo_subtitulo = ParagraphStyle(
        "Subtitulo",
        parent=styles["Heading2"],
        fontSize=16,
        textColor=colors.red,
        spaceAfter=12
    )

    estilo_texto = ParagraphStyle(
        "Texto",
        parent=styles["BodyText"],
        alignment=TA_JUSTIFY,
        fontSize=12,
        leading=16
    )

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        leftMargin=45,
        rightMargin=45,
        topMargin=50,
        bottomMargin=50
    )

    conteudo = []

    conteudo.append(Paragraph(f"Relatório Técnico – {data.projeto}", estilo_titulo))

    conteudo.append(Paragraph("Visão Geral", estilo_subtitulo))
    conteudo.append(Paragraph(visao, estilo_texto))
    conteudo.append(Spacer(1, 18))

    conteudo.append(Paragraph("Materiais", estilo_subtitulo))
    conteudo.append(Paragraph(materiais, estilo_texto))
    conteudo.append(Spacer(1, 18))

    conteudo.append(Paragraph("Montagem", estilo_subtitulo))
    conteudo.append(Paragraph(montagem, estilo_texto))
    conteudo.append(Spacer(1, 18))

    conteudo.append(Paragraph("Procedimento", estilo_subtitulo))
    conteudo.append(Paragraph(procedimento, estilo_texto))

    doc.build(conteudo)

    return FileResponse(pdf_path, filename="relatorio.pdf", media_type="application/pdf")

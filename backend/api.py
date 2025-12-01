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
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import cm

# ---------------------------------------
# Load .env
# ---------------------------------------
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY)

# ---------------------------------------
# FastAPI Setup
# ---------------------------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------
# Temporary Memory
# ---------------------------------------
respostas_sessao = {}

# ---------------------------------------
# Model (request)
# ---------------------------------------
class Pergunta(BaseModel):
    projeto: str
    session_id: str

# ---------------------------------------
# Tópicos permitidos (Leis de Newton + palavras relacionadas)
# ---------------------------------------
TOPICOS_PERMITIDOS = [
    "leis de newton", "força", "movimento", "massa", "aceleração",
    "inércia", "gravitacional", "peso", "física", "dinâmica",
    "projetos", "resumos", "mapas mentais", "equações", "experimentos",
    "segunda lei", "terceira lei", "primeira lei", "lei da ação e reação",
    "queda livre", "atrito"
]

def validar_tema(prompt: str) -> bool:
    prompt_lower = prompt.lower()
    return any(t in prompt_lower for t in TOPICOS_PERMITIDOS)

# ---------------------------------------
# GPT function (resposta detalhada)
# ---------------------------------------
async def gerar_resposta(prompt: str, max_tokens: int = 2000):
    try:
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=max_tokens,
            timeout=30
        )
        return completion.choices[0].message.content
    except Exception as e:
        print("❌ ERRO GPT:", e)
        return f"Erro ao gerar resposta: {e}"

def salvar_resposta(session_id: str, campo: str, valor: str):
    if session_id not in respostas_sessao:
        respostas_sessao[session_id] = {}
    respostas_sessao[session_id][campo] = valor


# ---------------------------------------
# ROUTES (validadas por tema)
# ---------------------------------------
@app.post("/visao")
async def visao(data: Pergunta):
    if not validar_tema(data.projeto):
        return {"resposta": "❌ Apenas pesquisas sobre as Leis de Newton são permitidas."}

    prompt = (
        f"Crie uma visão geral detalhada sobre o projeto: {data.projeto}. "
        "Explique propósito, impacto e benefícios."
    )
    resposta = await gerar_resposta(prompt)
    salvar_resposta(data.session_id, "visao", resposta)
    return {"resposta": resposta}


@app.post("/materiais")
async def materiais(data: Pergunta):
    if not validar_tema(data.projeto):
        return {"resposta": "❌ Apenas pesquisas sobre as Leis de Newton são permitidas."}

    prompt = (
        f"Liste todos os materiais necessários para o projeto '{data.projeto}', "
        "detalhando quantidade, baixo custo e acessibilidade."
    )
    resposta = await gerar_resposta(prompt)
    salvar_resposta(data.session_id, "materiais", resposta)
    return {"resposta": resposta}


@app.post("/montagem")
async def montagem(data: Pergunta):
    if not validar_tema(data.projeto):
        return {"resposta": "❌ Apenas pesquisas sobre as Leis de Newton são permitidas."}

    prompt = (
        f"Explique a montagem do projeto '{data.projeto}' com instruções passo a passo. "
    )
    resposta = await gerar_resposta(prompt)
    salvar_resposta(data.session_id, "montagem", resposta)
    return {"resposta": resposta}


@app.post("/procedimento")
async def procedimento(data: Pergunta):
    if not validar_tema(data.projeto):
        return {"resposta": "❌ Apenas pesquisas sobre as Leis de Newton são permitidas."}

    prompt = (
        f"Explique o procedimento do projeto '{data.projeto}' de forma didática, "
        "clara e organizada."
    )
    resposta = await gerar_resposta(prompt)
    salvar_resposta(data.session_id, "procedimento", resposta)
    return {"resposta": resposta}


# ---------------------------------------
# PDF BONITO E AJUSTADO
# ---------------------------------------
@app.post("/relatorio")
async def gerar_pdf(data: Pergunta):

    session = respostas_sessao.get(data.session_id, {})

    visao_txt = session.get("visao", "Nenhuma resposta gerada.")
    materiais_txt = session.get("materiais", "Nenhuma resposta gerada.")
    montagem_txt = session.get("montagem", "Nenhuma resposta gerada.")
    procedimento_txt = session.get("procedimento", "Nenhuma resposta gerada.")

    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    pdf_path = tmp.name

    # Documento com margens bonitas
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        rightMargin=2*cm,
        leftMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm
    )

    styles = getSampleStyleSheet()
    story = []

    # Título principal
    story.append(Paragraph(f"<para align='center'><b><font size=18>Relatório Técnico</font></b></para>", styles["Title"]))
    story.append(Spacer(1, 12))
    story.append(Paragraph(f"<b>Projeto:</b> {data.projeto}", styles["Heading2"]))
    story.append(Spacer(1, 20))

    # Função auxiliar para criar seções
    def add_section(title, text):
        story.append(Paragraph(f"<b><font size=14>{title}</font></b>", styles["Heading2"]))
        story.append(Spacer(1, 6))
        story.append(Paragraph(text.replace("\n", "<br/>"), styles["BodyText"]))
        story.append(Spacer(1, 18))

    add_section("Visão Geral", visao_txt)
    add_section("Materiais", materiais_txt)
    add_section("Montagem", montagem_txt)
    add_section("Procedimento", procedimento_txt)

    doc.build(story)

    return FileResponse(pdf_path, filename="relatorio.pdf", media_type="application/pdf")

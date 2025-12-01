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
# Model (no pergunta text)
# ---------------------------------------
class Pergunta(BaseModel):
    projeto: str
    session_id: str


# ---------------------------------------
# GPT function
# ---------------------------------------
async def gerar_resposta(prompt: str):
    try:
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=500,
            timeout=12
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
# ROUTES (Autogeradas)
# ---------------------------------------

@app.post("/visao")
async def visao(data: Pergunta):
    prompt = f"Crie uma visão geral objetiva, clara e detalhada sobre o projeto: {data.projeto}."
    resposta = await gerar_resposta(prompt)
    salvar_resposta(data.session_id, "visao", resposta)
    return {"resposta": resposta}


@app.post("/materiais")
async def materiais(data: Pergunta):
    prompt = f"Liste todos os materiais necessários para o projeto '{data.projeto}', priorizando itens baratos."
    resposta = await gerar_resposta(prompt)
    salvar_resposta(data.session_id, "materiais", resposta)
    return {"resposta": resposta}


@app.post("/montagem")
async def montagem(data: Pergunta):
    prompt = f"Explique de forma clara a montagem completa do projeto '{data.projeto}', incluindo descrição de diagramas."
    resposta = await gerar_resposta(prompt)
    salvar_resposta(data.session_id, "montagem", resposta)
    return {"resposta": resposta}


@app.post("/procedimento")
async def procedimento(data: Pergunta):
    prompt = f"Explique o procedimento passo a passo do projeto '{data.projeto}' de forma didática e organizada."
    resposta = await gerar_resposta(prompt)
    salvar_resposta(data.session_id, "procedimento", resposta)
    return {"resposta": resposta}


# ---------------------------------------
# PDF
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
    tmp.close()

    c = canvas.Canvas(pdf_path, pagesize=A4)
    width, height = A4

    # Header
    c.setFillColor(colors.red)
    c.rect(0, 0, 25, height, fill=True)

    c.setFillColor(colors.black)
    c.setFont("Helvetica-Bold", 20)
    c.drawString(40, height - 50, f"Relatório Técnico - {data.projeto}")

    c.setFont("Helvetica-Bold", 12)
    c.drawRightString(width - 40, height - 40, "Gerado pelo IA Clear")

    texto = f"""
============================
VISÃO GERAL
============================
{visao_txt}

============================
MATERIAIS
============================
{materiais_txt}

============================
MONTAGEM
============================
{montagem_txt}

============================
PROCEDIMENTO
============================
{procedimento_txt}
"""

    c.setFont("Helvetica", 11)
    y = height - 120

    for linha in texto.split("\n"):
        if y < 40:
            c.showPage()
            c.setFont("Helvetica", 11)
            y = height - 40

        c.drawString(40, y, linha)
        y -= 14

    c.save()

    return FileResponse(pdf_path, filename="relatorio.pdf", media_type="application/pdf")

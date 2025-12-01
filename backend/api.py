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
# Carregar .env
# ---------------------------------------
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

client = OpenAI(api_key=OPENAI_API_KEY)

# ---------------------------------------
# FastAPI Config
# ---------------------------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

# ---------------------------------------
# Armazenamento temporário das respostas
# (por sessão enviada pelo frontend)
# ---------------------------------------
respostas_sessao = {}

# ---------------------------------------
# Modelo da requisição
# ---------------------------------------
class Pergunta(BaseModel):
    pergunta: str
    projeto: str
    session_id: str

# ---------------------------------------
# GPT
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

# ---------------------------------------
# Função para salvar respostas
# ---------------------------------------
def salvar_resposta(session_id: str, campo: str, valor: str):
    if session_id not in respostas_sessao:
        respostas_sessao[session_id] = {}
    respostas_sessao[session_id][campo] = valor

# ---------------------------------------
# Rotas GPT
# ---------------------------------------

@app.post("/visao")
async def visao(data: Pergunta):
    prompt = f"Faça uma visão geral detalhada sobre o projeto: {data.projeto}."
    resposta = await gerar_resposta(prompt)
    salvar_resposta(data.session_id, "visao", resposta)
    return {"resposta": resposta}


@app.post("/materiais")
async def materiais(data: Pergunta):
    prompt = f"Liste os materiais de baixo custo recomendados para o projeto: {data.projeto}."
    resposta = await gerar_resposta(prompt)
    salvar_resposta(data.session_id, "materiais", resposta)
    return {"resposta": resposta}


@app.post("/montagem")
async def montagem(data: Pergunta):
    prompt = f"Explique a montagem, esquemas e diagramas necessários para o projeto: {data.projeto}."
    resposta = await gerar_resposta(prompt)
    salvar_resposta(data.session_id, "montagem", resposta)
    return {"resposta": resposta}


@app.post("/procedimento")
async def procedimento(data: Pergunta):
    prompt = f"Descreva o procedimento passo a passo para o projeto: {data.projeto}."
    resposta = await gerar_resposta(prompt)
    salvar_resposta(data.session_id, "procedimento", resposta)
    return {"resposta": resposta}


@app.post("/relatorio")
async def gerar_pdf(data: Pergunta):
    session = respostas_sessao.get(data.session_id, {})

    visao_txt = session.get("visao", "Nenhuma resposta gerada.")
    materiais_txt = session.get("materiais", "Nenhuma resposta gerada.")
    montagem_txt = session.get("montagem", "Nenhuma resposta gerada.")
    procedimento_txt = session.get("procedimento", "Nenhuma resposta gerada.")

    # Criar PDF temporário
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    pdf_path = tmp.name
    tmp.close()

    c = canvas.Canvas(pdf_path, pagesize=A4)
    width, height = A4

    # ---------------------------
    # Cabeçalho
    #---------------------------
    c.setFillColor(colors.red)
    c.rect(0, 0, 25, height, fill=True)
    c.setFillColor(colors.black)
    c.setFont("Helvetica-Bold", 22)
    c.drawString(40, height - 50, "Relatório Técnico - Projeto Escolar")
    c.setFont("Helvetica-Bold", 12)
    c.drawRightString(width - 40, height - 40, "Gerado pelo Sistema IA Clear")

    # ---------------------------
    # Conteúdo
    #---------------------------
    texto_completo = f"""
PROJETO: {data.projeto}

============================
VISÃO GERAL
============================
{visao_txt}

============================
MATERIAIS UTILIZADOS
============================
{materiais_txt}

============================
MONTAGEM / DIAGRAMA
============================
{montagem_txt}

============================
PROCEDIMENTO
============================
{procedimento_txt}
"""

    c.setFont("Helvetica", 11)

    y = height - 120
    for linha in texto_completo.split("\n"):
        if y < 40:
            c.showPage()
            c.setFont("Helvetica", 11)
            y = height - 40
        c.drawString(40, y, linha)
        y -= 14

    c.save()

    return FileResponse(
        pdf_path,
        filename="relatorio_projeto.pdf",
        media_type="application/pdf"
    )

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.pdfgen import canvas
import tempfile

# ---------------------------
# Carregar variáveis do .env
# ---------------------------
load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

client = OpenAI(api_key=OPENAI_API_KEY)

# ---------------------------
# FastAPI
# ---------------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

# ---------------------------
# Modelo de Requisição
# ---------------------------
class Pergunta(BaseModel):
    pergunta: str
    projeto: str

# ---------------------------
# Função GPT
# ---------------------------
async def gerar_resposta(prompt: str):
    try:
        print("➡ Enviando prompt:", prompt[:200])
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=400,
            timeout=12
        )
        resposta = completion.choices[0].message.content
        print("⬅ Resposta obtida")
        return resposta
    except Exception as e:
        print("❌ ERRO GPT:", e)
        return f"Erro ao gerar resposta: {e}"

# ---------------------------
# Rotas de GPT
# ---------------------------
@app.post("/visao")
async def visao(data: Pergunta):
    prompt = f"Faça uma visão geral detalhada sobre o projeto: {data.projeto}. Pergunta extra do usuário: {data.pergunta}."
    return {"resposta": await gerar_resposta(prompt)}

@app.post("/materiais")
async def materiais(data: Pergunta):
    prompt = f"Liste materiais de baixo custo para o projeto: {data.projeto}. Pergunta extra do usuário: {data.pergunta}."
    return {"resposta": await gerar_resposta(prompt)}

@app.post("/montagem")
async def montagem(data: Pergunta):
    prompt = f"Explique montagem, esquema e diagrama do projeto: {data.projeto}. Pergunta extra do usuário: {data.pergunta}."
    return {"resposta": await gerar_resposta(prompt)}

@app.post("/procedimento")
async def procedimento(data: Pergunta):
    prompt = f"Descreva o procedimento passo a passo para o projeto: {data.projeto}. Pergunta extra do usuário: {data.pergunta}."
    return {"resposta": await gerar_resposta(prompt)}

# ---------------------------
# Rota de PDF
# ---------------------------
@app.post("/relatorio")
async def gerar_pdf(data: Pergunta):
    texto = data.pergunta or ""
    projeto = data.projeto or "Relatório"

    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    path = tmp.name
    tmp.close()

    c = canvas.Canvas(path, pagesize=A4)
    width, height = A4

    # Cabeçalho simples
    c.setFillColor(colors.red)
    c.rect(0, 0, 25, height, fill=True)
    c.setFillColor(colors.black)
    c.setFont("Helvetica-Bold", 26)
    c.drawString(40, height - 60, "HR Incident Report")
    c.setFont("Helvetica-Bold", 14)
    c.drawRightString(width - 40, height - 50, "VOLKS Media")

    # Funções auxiliares
    def label(text, x, y):
        c.setFont("Helvetica-Bold", 11)
        c.drawString(x, y, text)

    def box(x, y, w, h):
        c.rect(x, y - h, w, h)

    def checkbox(text, x, y):
        c.rect(x, y, 10, 10)
        c.drawString(x + 15, y - 1, text)

    # Exemplo: Linha 1 - Data/Hora
    y = height - 140
    label("Date of Incident", 40, y)
    box(40, y - 5, 150, 22)
    label("Time of Incident", 220, y)
    box(220, y - 5, 150, 22)
    label("Location of Incident", 40, y - 40)
    box(40, y - 45, 330, 22)

    # Checkbox exemplo
    y -= 120
    checkbox_y = y - 15
    checkbox("Workplace Injury", 40, checkbox_y)
    checkbox("Harassment / Discrimination", 40, checkbox_y - 20)

    # Descrição
    label("Description of Incident", 230, y)
    box(230, y - 5, 300, 120)
    c.setFont("Helvetica", 10)
    desc_y = (height - 140) - 120
    ty = desc_y + 110
    wrapped = texto.split("\n")
    for line in wrapped:
        if len(line) > 60:
            parts = [line[i:i+60] for i in range(0, len(line), 60)]
        else:
            parts = [line]
        for p in parts:
            if ty < desc_y:
                break
            c.drawString(235, ty, p)
            ty -= 12

    c.save()
    return FileResponse(path, filename="incident_report.pdf", media_type="application/pdf")

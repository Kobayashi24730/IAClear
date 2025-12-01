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
from fastapi.responses import StreamingResponse
import io

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
async def gerar_pdf(dados: Pergunta):
    texto = dados.pergunta or ""
    projeto = dados.projeto or "Relatório"

    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    largura, altura = A4
    
    c.setFillColor(colors.red)
    c.rect(0, 0, 25, altura, fill=True)
    c.setFillColor(colors.black)
    c.setFont("Helvetica-Bold", 26)
    c.drawString(40, altura - 60, "Relatório de Incidente de RH")
    c.setFont("Helvetica-Bold", 14)
    c.drawRightString(largura - 40, altura - 50, "VOLKS Media")

    def label(texto, x, y):
        c.setFont("Helvetica-Bold", 11)
        c.drawString(x, y, texto)

    def caixa(x, y, w, h):
        c.rect(x, y - h, w, h)

    def checkbox(texto, x, y):
        c.rect(x, y, 10, 10)
        c.drawString(x + 15, y - 1, texto)

    y = altura - 140
    label("Data do Incidente", 40, y)
    caixa(40, y - 5, 150, 22)
    label("Hora do Incidente", 220, y)
    caixa(220, y - 5, 150, 22)
    label("Local do Incidente", 40, y - 40)
    caixa(40, y - 45, 330, 22)

    checkbox_y = y - 120
    checkbox("Lesão no local de trabalho", 40, checkbox_y)
    checkbox("Assédio / Discriminação", 40, checkbox_y - 20)

    label("Descrição do incidente", 230, y - 120)
    caixa(230, y - 125, 300, 120)
    c.setFont("Helvetica", 10)
    ty = y - 125 + 110
    desc_y = y - 125
    for line in texto.split("\n"):
        parts = [line[i:i+60] for i in range(0, len(line), 60)]
        for p in parts:
            if ty < desc_y:
                break
            c.drawString(235, ty, p)
            ty -= 12

    c.showPage()
    c.save()
    buffer.seek(0)
    
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=incident_report.pdf"}
    )

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
# Temporary memory
# ---------------------------------------
respostas_sessao = {}

# ---------------------------------------
# Model
# ---------------------------------------
class Pergunta(BaseModel):
    projeto: str
    session_id: str

# ---------------------------------------
# Tópicos permitidos
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
    return any(topico in prompt_lower for topico in TOPICOS_PERMITIDOS)

# ---------------------------------------
# GPT função
# ---------------------------------------
async def gerar_resposta(prompt: str, max_tokens: int = 1500):
    try:
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=max_tokens
        )
        return completion.choices[0].message.content
    except Exception as e:
        return f"Erro ao gerar resposta: {e}"

def salvar_resposta(session_id: str, campo: str, valor: str):
    if session_id not in respostas_sessao:
        respostas_sessao[session_id] = {}
    respostas_sessao[session_id][campo] = valor

# ---------------------------------------
# ENDPOINTS
# ---------------------------------------
@app.post("/visao")
async def visao(data: Pergunta):
    if not validar_tema(data.projeto):
        return {"resposta": "❌ Tema não permitido. Só aceitamos assuntos relacionados às Leis de Newton."}

    prompt = (
        f"Escreva uma visão geral clara, bonita e bem estruturada sobre o projeto '{data.projeto}', "
        "com introdução, propósito e impacto. Sem markdown."
    )
    resposta = await gerar_resposta(prompt)
    salvar_resposta(data.session_id, "visao", resposta)
    return {"resposta": resposta}

@app.post("/materiais")
async def materiais(data: Pergunta):
    if not validar_tema(data.projeto):
        return {"resposta": "❌ Tema não permitido."}

    prompt = (
        f"Liste os materiais necessários para o projeto '{data.projeto}', "
        "com quantidades e breve descrição. Sem markdown."
    )
    resposta = await gerar_resposta(prompt)
    salvar_resposta(data.session_id, "materiais", resposta)
    return {"resposta": resposta}

@app.post("/montagem")
async def montagem(data: Pergunta):
    if not validar_tema(data.projeto):
        return {"resposta": "❌ Tema não permitido."}

    prompt = (
        f"Descreva passo a passo a montagem do projeto '{data.projeto}', "
        "de forma didática e organizada. Sem markdown."
    )
    resposta = await gerar_resposta(prompt)
    salvar_resposta(data.session_id, "montagem", resposta)
    return {"resposta": resposta}

@app.post("/procedimento")
async def procedimento(data: Pergunta):
    if not validar_tema(data.projeto):
        return {"resposta": "❌ Tema não permitido."}

    prompt = (
        f"Explique o procedimento completo do projeto '{data.projeto}', "
        "organizado, seguro e reprodutível. Sem markdown."
    )
    resposta = await gerar_resposta(prompt)
    salvar_resposta(data.session_id, "procedimento", resposta)
    return {"resposta": resposta}

# ---------------------------------------
# PDF BONITO
# ---------------------------------------
@app.post("/relatorio")
async def gerar_pdf(data: Pergunta):

    session = respostas_sessao.get(data.session_id, {})

    visao = session.get("visao", "Nenhum conteúdo gerado.")
    materiais = session.get("materiais", "Nenhum conteúdo gerado.")
    montagem = session.get("montagem", "Nenhum conteúdo gerado.")
    procedimento = session.get("procedimento", "Nenhum conteúdo gerado.")

    # Arquivo temporário
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    pdf_path = tmp.name
    tmp.close()

    # Configuração do documento
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        leftMargin=40,
        rightMargin=40,
        topMargin=50,
        bottomMargin=50
    )

    styles = getSampleStyleSheet()
    titulo = ParagraphStyle(
        "Titulo",
        parent=styles["Heading1"],
        fontSize=20,
        spaceAfter=20
    )
    subtitulo = ParagraphStyle(
        "Subtitulo",
        parent=styles["Heading2"],
        fontSize=15,
        textColor=colors.red,
        spaceAfter=10
    )
    texto = ParagraphStyle(
        "Texto",
        parent=styles["BodyText"],
        fontSize=12,
        leading=16
    )

    conteudo = []

    conteudo.append(Paragraph(f"Relatório Técnico – {data.projeto}", titulo))

    conteudo.append(Paragraph("Visão Geral", subtitulo))
    conteudo.append(Paragraph(visao, texto))
    conteudo.append(Spacer(1, 12))

    conteudo.append(Paragraph("Materiais", subtitulo))
    conteudo.append(Paragraph(materiais, texto))
    conteudo.append(Spacer(1, 12))

    conteudo.append(Paragraph("Montagem", subtitulo))
    conteudo.append(Paragraph(montagem, texto))
    conteudo.append(Spacer(1, 12))

    conteudo.append(Paragraph("Procedimento", subtitulo))
    conteudo.append(Paragraph(procedimento, texto))

    doc.build(conteudo)

    return FileResponse(pdf_path, filename="relatorio.pdf", media_type="application/pdf")

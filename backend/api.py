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
    """
    Retorna True se o prompt contém pelo menos um tópico permitido,
    incluindo palavras relacionadas.
    """
    prompt_lower = prompt.lower()
    for topico in TOPICOS_PERMITIDOS:
        if topico in prompt_lower:
            return True
    return False

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
        return {"resposta": "❌ Pesquisa fora do tema permitido. "
                            "Somente são aceitas pesquisas sobre as Leis de Newton."}
    
    prompt = (
        f"Crie uma visão geral detalhada e objetiva sobre o projeto: {data.projeto}. "
        f"Seja completo, explique propósito, impacto e benefícios esperados."
    )
    resposta = await gerar_resposta(prompt)
    salvar_resposta(data.session_id, "visao", resposta)
    return {"resposta": resposta}

@app.post("/materiais")
async def materiais(data: Pergunta):
    if not validar_tema(data.projeto):
        return {"resposta": "❌ Pesquisa fora do tema permitido. "
                            "Somente são aceitas pesquisas sobre as Leis de Newton."}
    
    prompt = (
        f"Liste todos os materiais necessários para o projeto '{data.projeto}', "
        f"priorizando itens acessíveis e de baixo custo, detalhando quantidades e unidades."
    )
    resposta = await gerar_resposta(prompt)
    salvar_resposta(data.session_id, "materiais", resposta)
    return {"resposta": resposta}

@app.post("/montagem")
async def montagem(data: Pergunta):
    if not validar_tema(data.projeto):
        return {"resposta": "❌ Pesquisa fora do tema permitido. "
                            "Somente são aceitas pesquisas sobre as Leis de Newton."}
    
    prompt = (
        f"Explique de forma detalhada a montagem completa do projeto '{data.projeto}', "
        f"incluindo instruções passo a passo e descrição de diagramas ou componentes importantes."
    )
    resposta = await gerar_resposta(prompt)
    salvar_resposta(data.session_id, "montagem", resposta)
    return {"resposta": resposta}

@app.post("/procedimento")
async def procedimento(data: Pergunta):
    if not validar_tema(data.projeto):
        return {"resposta": "❌ Pesquisa fora do tema permitido. "
                            "Somente são aceitas pesquisas sobre as Leis de Newton."}
    
    prompt = (
        f"Explique o procedimento do projeto '{data.projeto}' de forma didática e organizada, "
        f"passo a passo, garantindo que qualquer pessoa possa reproduzir com segurança."
    )
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
# ---------------------------------------
# ROUTES (validadas por tema)
# ---------------------------------------
@app.post("/visao")
async def visao(data: Pergunta):
    if not validar_tema(data.projeto):
        return {"resposta": "❌ Pesquisa fora do tema permitido. "
                            "Somente são aceitas pesquisas sobre as Leis de Newton."}
    
    prompt = (
        f"Crie uma visão geral detalhada e objetiva sobre o projeto: {data.projeto}. "
        f"Seja completo, explique propósito, impacto e benefícios esperados."
    )
    resposta = await gerar_resposta(prompt)
    salvar_resposta(data.session_id, "visao", resposta)
    return {"resposta": resposta}

@app.post("/materiais")
async def materiais(data: Pergunta):
    if not validar_tema(data.projeto):
        return {"resposta": "❌ Pesquisa fora do tema permitido. "
                            "Somente são aceitas pesquisas sobre as Leis de Newton."}
    
    prompt = (
        f"Liste todos os materiais necessários para o projeto '{data.projeto}', "
        f"priorizando itens acessíveis e de baixo custo, detalhando quantidades e unidades."
    )
    resposta = await gerar_resposta(prompt)
    salvar_resposta(data.session_id, "materiais", resposta)
    return {"resposta": resposta}

@app.post("/montagem")
async def montagem(data: Pergunta):
    if not validar_tema(data.projeto):
        return {"resposta": "❌ Pesquisa fora do tema permitido. "
                            "Somente são aceitas pesquisas sobre as Leis de Newton."}
    
    prompt = (
        f"Explique de forma detalhada a montagem completa do projeto '{data.projeto}', "
        f"incluindo instruções passo a passo e descrição de diagramas ou componentes importantes."
    )
    resposta = await gerar_resposta(prompt)
    salvar_resposta(data.session_id, "montagem", resposta)
    return {"resposta": resposta}

@app.post("/procedimento")
async def procedimento(data: Pergunta):
    if not validar_tema(data.projeto):
        return {"resposta": "❌ Pesquisa fora do tema permitido. "
                            "Somente são aceitas pesquisas sobre as Leis de Newton."}
    
    prompt = (
        f"Explique o procedimento do projeto '{data.projeto}' de forma didática e organizada, "
        f"passo a passo, garantindo que qualquer pessoa possa reproduzir com segurança."
    )
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

    return FileResponse(pdf_path, filename="relatorio.pdf", media_type="application/pdf")    materiais_txt = session.get("materiais", "Nenhuma resposta gerada.")
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

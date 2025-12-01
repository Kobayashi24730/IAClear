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
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.lib.enums import TA_JUSTIFY


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

luindo instruções passo a passo e descrição de diagramas ou componentes importantes."
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


@app.post("/relatorio")
async def gerar_pdf(data: Pergunta):
    session = respostas_sessao.get(data.session_id, {})

    visao_txt = session.get("visao", "Nenhuma resposta gerada.")
    materiais_txt = session.get("materiais", "Nenhuma resposta gerada.")
    montagem_txt = session.get("montagem", "Nenhuma resposta gerada.")
    procedimento_txt = session.get("procedimento", "Nenhuma resposta gerada.")

    # Arquivo temporário
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    pdf_path = tmp.name
    tmp.close()

    # Documento PDF (usa engine moderna com quebra automática)
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        rightMargin=2*cm,
        leftMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm
    )

    styles = getSampleStyleSheet()
    estilo_titulo = styles["Title"]
    estilo_secao = styles["Heading2"]

    estilo_texto = styles["BodyText"]
    estilo_texto.alignment = TA_JUSTIFY  # justificado

    conteudo = []

    # ----------- Título -----------
    conteudo.append(Paragraph(f"Relatório Técnico - {data.projeto}", estilo_titulo))
    conteudo.append(Spacer(1, 15))

    # Função para adicionar seções
    def add_secao(titulo, texto):
        conteudo.append(Paragraph(titulo, estilo_secao))
        conteudo.append(Spacer(1, 8))
        conteudo.append(Paragraph(texto.replace("\n", "<br/>"), estilo_texto))
        conteudo.append(Spacer(1, 20))

    # ----------- Seções -----------
    add_secao("Visão Geral", visao_txt)
    add_secao("Materiais", materiais_txt)
    add_secao("Montagem", montagem_txt)
    add_secao("Procedimento", procedimento_txt)

    # ----------- Rodapé com paginação -----------
    def rodape(canvas, doc):
        canvas.saveState()
        canvas.setFont("Helvetica", 9)
        canvas.drawRightString(A4[0] - 2*cm, 1.5*cm, f"Página {doc.page}")
        canvas.restoreState()

    # Gera o PDF
    doc.build(conteudo, onLaterPages=rodape, onFirstPage=rodape)

    return FileResponse(pdf_path, filename="relatorio.pdf", media_type="application/pdf")

from fastapi import FastAPI
from pydantic import BaseModel
from api import buscar_contexto, client

app = FastAPI()

class Pergunta(BaseModel):
    pergunta: str


@app.post("/perguntar")
def perguntar(req: Pergunta):

    contexto = buscar_contexto(req.pergunta)

    prompt = f"""
    Use SOMENTE o texto abaixo para responder:

    {contexto}

    Pergunta: {req.pergunta}
    """

    resposta = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2
    )

    return {"resposta": resposta.choices[0].message["content"]}

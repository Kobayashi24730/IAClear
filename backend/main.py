from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

from api import app as api_app

# Reutiliza seu app do api.py
app = FastAPI()

# Inclui todas as rotas do seu api.py
app.mount("/api", api_app)

# Caminho do dist
DIST_PATH = os.path.join(os.path.dirname(__file__), "../frontend/dist")

# Servir arquivos estáticos
app.mount("/static", StaticFiles(directory=DIST_PATH), name="static")

# Rota principal → entregar index.html
@app.get("/")
def serve_frontend():
    return FileResponse(os.path.join(DIST_PATH, "index.html"))

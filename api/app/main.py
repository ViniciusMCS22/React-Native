# api/app/main.py
# Ponto de entrada da API. Rodar (de dentro da pasta api/):
#   uvicorn app.main:app --reload --host 0.0.0.0
# Documentacao interativa (Swagger): http://localhost:8000/docs

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, SessaoLocal, atualizar_banco_antigo, engine
from .rotas import auth, exemplos, obras, sinapi
from .seed import criar_obra_exemplo, criar_usuarios_teste, popular_sinapi

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")


@asynccontextmanager
async def ciclo_de_vida(_: FastAPI):
    # Fase de prototipo: cria as tabelas direto. Quando o modelo estabilizar,
    # trocar por migracoes (Alembic), como ja e feito no banco do aplicativo.
    Base.metadata.create_all(engine)
    atualizar_banco_antigo()
    with SessaoLocal() as sessao:
        criar_usuarios_teste(sessao)
        popular_sinapi(sessao)
        criar_obra_exemplo(sessao)
    yield


app = FastAPI(
    title="Gestao de Insumos - API",
    version="0.1.0",
    description="API REST do aplicativo de Gestao de Insumos e Aquisicoes.",
    lifespan=ciclo_de_vida,
)

# O app nativo nao precisa de CORS; isto e para o Expo Web e o futuro painel web.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(auth.router)
app.include_router(exemplos.router)
app.include_router(obras.router)
app.include_router(sinapi.router)


@app.get("/saude", tags=["Infra"])
def saude():
    """Usado pelo app para saber se a API esta no ar."""
    return {"status": "ok"}

# api/app/schemas.py
# Formato dos dados que entram e saem da API (validados pelo Pydantic).

from pydantic import BaseModel, Field

from .models import Perfil


class LoginEntrada(BaseModel):
    email: str = Field(min_length=3, max_length=254)
    senha: str = Field(min_length=1, max_length=128)


class RenovarEntrada(BaseModel):
    token_renovacao: str


class UsuarioSaida(BaseModel):
    id: str
    nome: str
    email: str
    perfil: Perfil
    permissoes: list[str]


class TokensSaida(BaseModel):
    token_acesso: str
    token_renovacao: str
    tipo: str = "bearer"
    expira_em_segundos: int
    usuario: UsuarioSaida

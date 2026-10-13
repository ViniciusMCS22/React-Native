# api/app/seed.py
# Usuarios de TESTE, um por perfil. Criados so em desenvolvimento (AMBIENTE),
# e apenas os que ainda nao existem (pelo e-mail): adicionar um usuario novo
# aqui faz ele aparecer no proximo inicio da API, sem apagar o banco.
# Nunca use estas senhas fora do ambiente de desenvolvimento.

from sqlalchemy import select
from sqlalchemy.orm import Session

from .config import AMBIENTE
from .models import Perfil, Usuario
from .seguranca import gerar_hash

USUARIOS_TESTE = [
    {"nome": "Gestor de Teste", "email": "master@teste.com", "senha": "Master@123", "perfil": Perfil.master},
    {"nome": "Orçamentista de Teste", "email": "orcamento@teste.com", "senha": "Orcamento@123", "perfil": Perfil.orcamentista},
    {"nome": "Cliente de Teste", "email": "cliente@teste.com", "senha": "Cliente@123", "perfil": Perfil.cliente},
    {"nome": "Desenvolvedor", "email": "dev@teste.com", "senha": "Dev@12345", "perfil": Perfil.desenvolvedor},
]


def criar_usuarios_teste(sessao: Session) -> None:
    if AMBIENTE != "desenvolvimento":
        return
    existentes = set(sessao.scalars(select(Usuario.email)).all())
    for dados in USUARIOS_TESTE:
        if dados["email"] in existentes:
            continue
        sessao.add(
            Usuario(
                nome=dados["nome"],
                email=dados["email"],
                senha_hash=gerar_hash(dados["senha"]),
                perfil=dados["perfil"],
            )
        )
    sessao.commit()

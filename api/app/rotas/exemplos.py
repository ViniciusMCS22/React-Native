# api/app/rotas/exemplos.py
# Rotas de TESTE para conferir as permissoes de cada perfil antes de existirem
# as rotas reais (obras, orcamentos, compras). Os dados sao ficticios.
# Teste no Swagger (/docs): faca login, clique em "Authorize" e chame cada uma.

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import obter_sessao
from ..models import Usuario
from ..permissoes import exigir

router = APIRouter(prefix="/exemplos", tags=["Exemplos de permissao"])


@router.get("/painel")
def ver_painel(usuario: Usuario = Depends(exigir("paineis:ver"))):
    """Todos os perfis."""
    return {"mensagem": f"Painel liberado para {usuario.nome}.", "obras_no_prazo": 3}


@router.get("/orcamento")
def ver_orcamento(usuario: Usuario = Depends(exigir("orcamentos:ver"))):
    """Master e orcamentista. O cliente recebe 403."""
    return {"mensagem": "Orçamento detalhado (dado técnico).", "itens": 128}


@router.put("/orcamento")
def editar_orcamento(usuario: Usuario = Depends(exigir("orcamentos:editar"))):
    """Master e orcamentista."""
    return {"mensagem": f"Orçamento alterado por {usuario.nome} (simulação)."}


@router.post("/compras/aprovar")
def aprovar_compra(usuario: Usuario = Depends(exigir("compras:aprovar"))):
    """Somente master."""
    return {"mensagem": f"Compra aprovada por {usuario.nome} (simulação)."}


@router.get("/usuarios")
def listar_usuarios(
    _: Usuario = Depends(exigir("usuarios:gerenciar")),
    sessao: Session = Depends(obter_sessao),
):
    """Somente master. Esta le do banco de verdade."""
    usuarios = sessao.scalars(select(Usuario).order_by(Usuario.nome)).all()
    return [
        {"nome": u.nome, "email": u.email, "perfil": u.perfil.value, "ativo": u.ativo}
        for u in usuarios
    ]

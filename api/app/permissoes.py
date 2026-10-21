
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from .database import obter_sessao
from .models import Perfil, Usuario
from .seguranca import TokenInvalido, ler_token


PERMISSOES: dict[Perfil, set[str]] = {
    Perfil.master: {
        "obras:ver_todas",
        "orcamentos:ver",
        "orcamentos:editar",
        "orcamentos:importar",
        "obras:vincular",
        "parametros:editar",
        "compras:aprovar",
        "registros:edicao_justificada",
        "registros:exclusao_logica",
        "aquisicoes:ver",
        "cotacoes:registrar",
        "analises:executar",
        "paineis:ver",
        "relatorios:ver",
        "usuarios:gerenciar",
    },
    Perfil.orcamentista: {
        "orcamentos:ver",
        "orcamentos:editar",
        "aquisicoes:ver",
        "cotacoes:registrar",
        "analises:executar",
        "paineis:ver",
        "relatorios:ver",
    },
    
    Perfil.cliente: {
        "paineis:ver",
        "relatorios:ver",
    },
}


PERMISSOES[Perfil.desenvolvedor] = set().union(*PERMISSOES.values())


def permissoes_do(usuario: Usuario) -> list[str]:
    return sorted(PERMISSOES.get(usuario.perfil, set()))


_bearer = HTTPBearer(auto_error=False)


def usuario_atual(
    credenciais: HTTPAuthorizationCredentials | None = Depends(_bearer),
    sessao: Session = Depends(obter_sessao),
) -> Usuario:
    """Dependencia: exige 'Authorization: Bearer <token de acesso>'."""
    nao_autenticado = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Faça login para continuar.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if credenciais is None:
        raise nao_autenticado
    try:
        dados = ler_token(credenciais.credentials, "acesso")
    except TokenInvalido as e:
        nao_autenticado.detail = str(e)
        raise nao_autenticado from e

    usuario = sessao.get(Usuario, dados["sub"])
    if usuario is None or not usuario.ativo:
        raise nao_autenticado
    return usuario


def exigir(permissao: str):
    """Uso: @router.get(..., dependencies=[Depends(exigir("orcamentos:editar"))])
    ou como parametro, para tambem receber o usuario."""

    def verificar(usuario: Usuario = Depends(usuario_atual)) -> Usuario:
        if permissao not in PERMISSOES.get(usuario.perfil, set()):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Seu perfil não tem permissão para esta ação.",
            )
        return usuario

    return verificar

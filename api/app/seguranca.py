# api/app/seguranca.py
# Hash de senha (RNF10) e emissao/validacao de tokens JWT (RNF11).

from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

from .config import ACESSO_MINUTOS, JWT_ALGORITMO, JWT_SEGREDO, RENOVACAO_DIAS
from .models import Usuario

# Hash calculado uma vez para comparar quando o e-mail nao existe. Assim a
# resposta leva o mesmo tempo nos dois casos e nao revela quais e-mails existem.
_HASH_FICTICIO = bcrypt.hashpw(b"senha-ficticia", bcrypt.gensalt()).decode()


def gerar_hash(senha: str) -> str:
    return bcrypt.hashpw(senha.encode(), bcrypt.gensalt()).decode()


def conferir_senha(senha: str, senha_hash: str | None) -> bool:
    return bcrypt.checkpw(senha.encode(), (senha_hash or _HASH_FICTICIO).encode())


class TokenInvalido(Exception):
    pass


def criar_token_acesso(usuario: Usuario) -> str:
    agora = datetime.now(timezone.utc)
    return jwt.encode(
        {
            "sub": usuario.id,
            "perfil": usuario.perfil.value,
            "tipo": "acesso",
            "iat": agora,
            "exp": agora + timedelta(minutes=ACESSO_MINUTOS),
        },
        JWT_SEGREDO,
        algorithm=JWT_ALGORITMO,
    )


def criar_token_renovacao(usuario: Usuario, jti: str) -> tuple[str, datetime]:
    agora = datetime.now(timezone.utc)
    expira_em = agora + timedelta(days=RENOVACAO_DIAS)
    token = jwt.encode(
        {"sub": usuario.id, "jti": jti, "tipo": "renovacao", "iat": agora, "exp": expira_em},
        JWT_SEGREDO,
        algorithm=JWT_ALGORITMO,
    )
    return token, expira_em


def ler_token(token: str, tipo_esperado: str) -> dict:
    """Valida assinatura, expiracao e tipo. Um token de renovacao nao pode ser
    usado como token de acesso, e vice-versa."""
    try:
        dados = jwt.decode(token, JWT_SEGREDO, algorithms=[JWT_ALGORITMO])
    except jwt.ExpiredSignatureError as e:
        raise TokenInvalido("Sessão expirada.") from e
    except jwt.InvalidTokenError as e:
        raise TokenInvalido("Token inválido.") from e
    if dados.get("tipo") != tipo_esperado:
        raise TokenInvalido("Token inválido.")
    return dados

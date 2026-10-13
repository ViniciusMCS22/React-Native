# api/app/rotas/auth.py
# Login, renovacao de sessao, logout e dados do usuario logado.

import logging
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.orm import Session

from ..config import ACESSO_MINUTOS, BLOQUEIO_MINUTOS, MAX_TENTATIVAS_LOGIN
from ..database import obter_sessao
from ..models import TokenRenovacao, Usuario, agora_utc, como_utc, novo_id
from ..permissoes import permissoes_do, usuario_atual
from ..schemas import LoginEntrada, RenovarEntrada, TokensSaida, UsuarioSaida
from ..seguranca import (
    TokenInvalido,
    conferir_senha,
    criar_token_acesso,
    criar_token_renovacao,
    ler_token,
)

log = logging.getLogger("api.auth")
router = APIRouter(prefix="/auth", tags=["Autenticacao"])


def _usuario_saida(usuario: Usuario) -> UsuarioSaida:
    return UsuarioSaida(
        id=usuario.id,
        nome=usuario.nome,
        email=usuario.email,
        perfil=usuario.perfil,
        permissoes=permissoes_do(usuario),
    )


def _emitir_tokens(sessao: Session, usuario: Usuario) -> TokensSaida:
    # O jti vai dentro do token assinado, entao e gerado antes de gravar.
    jti = novo_id()
    token_renovacao, expira_em = criar_token_renovacao(usuario, jti)
    sessao.add(TokenRenovacao(jti=jti, usuario_id=usuario.id, expira_em=expira_em))
    sessao.commit()
    return TokensSaida(
        token_acesso=criar_token_acesso(usuario),
        token_renovacao=token_renovacao,
        expira_em_segundos=ACESSO_MINUTOS * 60,
        usuario=_usuario_saida(usuario),
    )


@router.post("/login", response_model=TokensSaida)
def login(dados: LoginEntrada, sessao: Session = Depends(obter_sessao)):
    email = dados.email.strip().lower()
    usuario = sessao.scalar(select(Usuario).where(Usuario.email == email))
    agora = agora_utc()

    # RNF20: conta bloqueada temporariamente.
    bloqueado_ate = como_utc(usuario.bloqueado_ate) if usuario else None
    if bloqueado_ate and bloqueado_ate > agora:
        minutos = max(1, int((bloqueado_ate - agora).total_seconds() // 60) + 1)
        raise HTTPException(
            status_code=status.HTTP_423_LOCKED,
            detail=f"Muitas tentativas sem sucesso. Tente de novo em {minutos} min.",
        )

    # Confere a senha mesmo sem usuario, para o tempo de resposta ser igual.
    senha_ok = conferir_senha(dados.senha, usuario.senha_hash if usuario else None)

    if usuario is None or not senha_ok or not usuario.ativo:
        if usuario is not None:
            usuario.tentativas_falhas += 1
            if usuario.tentativas_falhas >= MAX_TENTATIVAS_LOGIN:
                usuario.bloqueado_ate = agora + timedelta(minutes=BLOQUEIO_MINUTOS)
                usuario.tentativas_falhas = 0
                log.warning("Conta bloqueada por tentativas de login: %s", email)
            sessao.commit()
        log.info("Login recusado: %s", email)
        # Mesma mensagem para e-mail inexistente e senha errada (nao revela qual).
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou senha incorretos.",
        )

    usuario.tentativas_falhas = 0
    usuario.bloqueado_ate = None
    log.info("Login ok: %s (%s)", email, usuario.perfil.value)
    return _emitir_tokens(sessao, usuario)


@router.post("/renovar", response_model=TokensSaida)
def renovar(dados: RenovarEntrada, sessao: Session = Depends(obter_sessao)):
    """Troca um token de renovacao valido por um par novo (rotacao).
    O token usado fica revogado e nao pode ser usado de novo."""
    sessao_expirada = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Sessão expirada. Faça login novamente.",
    )
    try:
        carga = ler_token(dados.token_renovacao, "renovacao")
    except TokenInvalido as e:
        raise sessao_expirada from e

    registro = sessao.get(TokenRenovacao, carga.get("jti"))
    if registro is None or registro.usuario_id != carga.get("sub"):
        raise sessao_expirada

    if registro.revogado:
        # Reuso de um token ja trocado: pode ter sido roubado. Derruba todas
        # as sessoes desse usuario por seguranca.
        sessao.execute(
            update(TokenRenovacao)
            .where(TokenRenovacao.usuario_id == registro.usuario_id)
            .values(revogado=True)
        )
        sessao.commit()
        log.warning("Reuso de token de renovacao do usuario %s", registro.usuario_id)
        raise sessao_expirada

    usuario = sessao.get(Usuario, registro.usuario_id)
    if usuario is None or not usuario.ativo:
        raise sessao_expirada

    registro.revogado = True
    return _emitir_tokens(sessao, usuario)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(dados: RenovarEntrada, sessao: Session = Depends(obter_sessao)):
    """Revoga o token de renovacao. Sempre responde 204, mesmo se ja invalido."""
    try:
        carga = ler_token(dados.token_renovacao, "renovacao")
    except TokenInvalido:
        return
    registro = sessao.get(TokenRenovacao, carga.get("jti"))
    if registro is not None:
        registro.revogado = True
        sessao.commit()


@router.get("/me", response_model=UsuarioSaida)
def eu(usuario: Usuario = Depends(usuario_atual)):
    return _usuario_saida(usuario)

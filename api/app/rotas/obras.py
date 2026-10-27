# api/app/rotas/obras.py
# Obras e seus insumos. O calculo fica em app/orcamento.py.
#
# Permissoes (app/permissoes.py):
#   ver obras, resumo e indice de depreciacao : 'paineis:ver' (todos os perfis)
#   ver a lista de insumos e a depreciacao por item : 'orcamentos:ver'
#   criar obra, adicionar/alterar/remover insumos   : 'orcamentos:editar'
#                                                    (master, orcamentista, dev)
#   apagar obra                                     : 'obras:excluir' (master, dev)
#                                                    + nome da obra + senha
#
# Ainda nao ha vinculo usuario-obra: todo perfil ve todas as obras. Quando
# houver, 'obras:ver_todas' (master) continua vendo todas e os outros so as
# vinculadas.

import logging
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from .. import orcamento
from ..config import BLOQUEIO_MINUTOS, EXCLUSAO_SEM_SENHA, MAX_TENTATIVAS_LOGIN
from ..database import obter_sessao
from ..models import Obra, ObraInsumo, Usuario, agora_utc, como_utc
from ..permissoes import PERMISSOES, exigir
from ..seguranca import conferir_senha
from ..schemas import (
    ExcluirObraEntrada,
    InsumoEntrada,
    InsumoSaida,
    ObraEntrada,
    ObraSaida,
    QuantidadeEntrada,
)

log = logging.getLogger("api.obras")
router = APIRouter(prefix="/obras", tags=["Obras"])


def _buscar_obra(sessao: Session, obra_id: str) -> Obra:
    obra = sessao.scalars(
        select(Obra)
        .options(selectinload(Obra.insumos))
        .where(Obra.id == obra_id, Obra.excluido_em.is_(None))
    ).first()
    if obra is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Obra não encontrada.")
    return obra


def _buscar_insumo(obra: Obra, insumo_id: str) -> ObraInsumo:
    insumo = next(
        (i for i in orcamento.insumos_ativos(obra) if i.id == insumo_id), None
    )
    if insumo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Insumo não encontrado nesta obra."
        )
    return insumo


def _saida(obra: Obra) -> dict:
    return {
        "id": obra.id,
        "nome": obra.nome,
        "cliente": obra.cliente,
        "local": obra.local,
        "contrato": obra.contrato,
        "responsavel": obra.responsavel,
        "situacao": obra.situacao,
        "area_construida_m2": obra.area_construida_m2,
        "data_inicio": obra.data_inicio,
        "data_termino_prevista": obra.data_termino_prevista,
        "bdi_percentual": obra.bdi_percentual,
        "sinapi_uf": obra.sinapi_uf,
        "sinapi_regime": obra.sinapi_regime,
        "sinapi_mes_referencia": obra.sinapi_mes_referencia,
        "resumo": orcamento.resumo_obra(obra),
    }


@router.get("", response_model=list[ObraSaida])
def listar_obras(
    _: Usuario = Depends(exigir("paineis:ver")),
    sessao: Session = Depends(obter_sessao),
):
    obras = sessao.scalars(
        select(Obra)
        .options(selectinload(Obra.insumos))
        .where(Obra.excluido_em.is_(None))
        .order_by(Obra.nome)
    ).all()
    return [_saida(o) for o in obras]


@router.post("", response_model=ObraSaida, status_code=status.HTTP_201_CREATED)
def criar_obra(
    dados: ObraEntrada,
    usuario: Usuario = Depends(exigir("orcamentos:editar")),
    sessao: Session = Depends(obter_sessao),
):
    """Cria a obra com a tabela SINAPI mais recente da UF e do regime. O preco
    de cada insumo vem do SINAPI; um codigo sem preco cancela a criacao inteira."""
    uf = dados.uf.upper()
    regime = orcamento.regime_para_nova_obra(sessao, uf, dados.regime)
    if regime is None:
        qual = f" ({orcamento.REGIMES[dados.regime]})" if dados.regime else ""
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=f"Não há tabela SINAPI-{uf}{qual} carregada na API.",
        )
    mes = orcamento.ultimo_mes_sinapi(sessao, uf, regime)

    campos = dados.model_dump(exclude={"uf", "regime", "insumos"})
    obra = Obra(
        **campos,
        sinapi_uf=uf,
        sinapi_regime=regime,
        sinapi_mes_referencia=mes,
        criado_por_id=usuario.id,
    )
    sessao.add(obra)
    for item in dados.insumos:
        orcamento.adicionar_insumo(sessao, obra, item.codigo.strip(), item.quantidade)
    sessao.commit()
    return _saida(_buscar_obra(sessao, obra.id))


@router.get("/{obra_id}", response_model=ObraSaida)
def ver_obra(
    obra_id: str,
    _: Usuario = Depends(exigir("paineis:ver")),
    sessao: Session = Depends(obter_sessao),
):
    return _saida(_buscar_obra(sessao, obra_id))


@router.get("/{obra_id}/insumos", response_model=list[InsumoSaida])
def listar_insumos(
    obra_id: str,
    _: Usuario = Depends(exigir("orcamentos:ver")),
    sessao: Session = Depends(obter_sessao),
):
    return orcamento.lista_insumos(_buscar_obra(sessao, obra_id))


@router.post("/{obra_id}/insumos", response_model=list[InsumoSaida], status_code=status.HTTP_201_CREATED)
def adicionar_insumo(
    obra_id: str,
    dados: InsumoEntrada,
    _: Usuario = Depends(exigir("orcamentos:editar")),
    sessao: Session = Depends(obter_sessao),
):
    """Devolve a lista atualizada (a participacao de todos muda)."""
    obra = _buscar_obra(sessao, obra_id)
    orcamento.adicionar_insumo(sessao, obra, dados.codigo.strip(), dados.quantidade)
    sessao.commit()
    return orcamento.lista_insumos(_buscar_obra(sessao, obra_id))


@router.patch("/{obra_id}/insumos/{insumo_id}", response_model=list[InsumoSaida])
def alterar_quantidade(
    obra_id: str,
    insumo_id: str,
    dados: QuantidadeEntrada,
    _: Usuario = Depends(exigir("orcamentos:editar")),
    sessao: Session = Depends(obter_sessao),
):
    """Muda so a quantidade. O preco-base (retrato) continua o mesmo."""
    obra = _buscar_obra(sessao, obra_id)
    _buscar_insumo(obra, insumo_id).quantidade = dados.quantidade
    sessao.commit()
    return orcamento.lista_insumos(_buscar_obra(sessao, obra_id))


@router.delete("/{obra_id}/insumos/{insumo_id}", status_code=status.HTTP_204_NO_CONTENT)
def remover_insumo(
    obra_id: str,
    insumo_id: str,
    _: Usuario = Depends(exigir("orcamentos:editar")),
    sessao: Session = Depends(obter_sessao),
):
    obra = _buscar_obra(sessao, obra_id)
    orcamento.remover_insumo(_buscar_insumo(obra, insumo_id))
    sessao.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/{obra_id}/depreciacao")
def ver_depreciacao(
    obra_id: str,
    usuario: Usuario = Depends(exigir("paineis:ver")),
    sessao: Session = Depends(obter_sessao),
):
    """Compara o retrato de precos da obra com a tabela SINAPI mais nova.
    Sem 'orcamentos:ver' (cliente) vem so o indice e os totais, sem os itens.
    Devolve null se a obra nao tem insumos ou nao ha tabela SINAPI."""
    resultado = orcamento.depreciacao_obra(sessao, _buscar_obra(sessao, obra_id))
    if resultado is not None and "orcamentos:ver" not in PERMISSOES.get(usuario.perfil, set()):
        resultado["itens"] = []
    return resultado



def _conferir_senha_para_excluir(sessao: Session, usuario: Usuario, senha: str) -> None:
    """Mesma regra de bloqueio do login (RNF20): errar a senha varias vezes
    bloqueia a conta por alguns minutos. Senha em branco so passa em
    desenvolvimento (config.EXCLUSAO_SEM_SENHA)."""
    agora = agora_utc()
    bloqueado_ate = como_utc(usuario.bloqueado_ate)
    if bloqueado_ate and bloqueado_ate > agora:
        minutos = max(1, int((bloqueado_ate - agora).total_seconds() // 60) + 1)
        raise HTTPException(
            status_code=status.HTTP_423_LOCKED,
            detail=f"Muitas tentativas sem sucesso. Tente de novo em {minutos} min.",
        )
    if not senha and EXCLUSAO_SEM_SENHA:
        return
    if conferir_senha(senha, usuario.senha_hash):
        usuario.tentativas_falhas = 0
        return
    usuario.tentativas_falhas += 1
    if usuario.tentativas_falhas >= MAX_TENTATIVAS_LOGIN:
        usuario.bloqueado_ate = agora + timedelta(minutes=BLOQUEIO_MINUTOS)
        usuario.tentativas_falhas = 0
        log.warning("Conta bloqueada por senha errada ao apagar obra: %s", usuario.email)
    sessao.commit()
    # 403, nao 401: o app trata 401 como sessao vencida e renovaria o token.
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Senha incorreta.")


@router.post("/{obra_id}/excluir", status_code=status.HTTP_204_NO_CONTENT)
def excluir_obra(
    obra_id: str,
    dados: ExcluirObraEntrada,
    usuario: Usuario = Depends(exigir("obras:excluir")),
    sessao: Session = Depends(obter_sessao),
):
    """Apaga a obra para todos (exclusao logica, sem desfazer no app). Exige o
    nome da obra digitado igual e a senha do usuario. POST e nao DELETE porque
    leva corpo (alguns clientes HTTP descartam corpo em DELETE)."""
    obra = _buscar_obra(sessao, obra_id)
    if dados.nome_confirmacao.strip() != obra.nome.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="O nome digitado não é igual ao nome da obra.",
        )
    _conferir_senha_para_excluir(sessao, usuario, dados.senha)

    obra.excluido_em = agora_utc()
    obra.excluido_por_id = usuario.id
    sessao.commit()
    log.info("Obra apagada: %s (%s) por %s", obra.nome, obra.id, usuario.email)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

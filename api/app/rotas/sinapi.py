# api/app/rotas/sinapi.py
# Consulta a tabela SINAPI guardada na API: a importada das planilhas da Caixa
# (app/importar_sinapi.py) e a ficticia de exemplo (app/sinapi_dados.py).
# Sem `regime`, vale o mesmo regime que uma obra nova usaria.

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import busca_sinapi, orcamento
from ..database import obter_sessao
from ..models import SinapiPreco, Usuario
from ..permissoes import exigir
from ..schemas import SinapiInsumoSaida

router = APIRouter(prefix="/sinapi", tags=["SINAPI"])

_REGIME = Query(None, pattern="^(desonerado|nao_desonerado|ficticio)$")


def _regime(sessao: Session, uf: str, regime: str | None) -> str:
    escolhido = regime or orcamento.regime_para_nova_obra(sessao, uf)
    if escolhido is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Não há tabela SINAPI-{uf} carregada na API.",
        )
    return escolhido


@router.get("/meses", response_model=list[str])
def listar_meses(
    uf: str = Query("MA", min_length=2, max_length=2),
    regime: str | None = _REGIME,
    _: Usuario = Depends(exigir("orcamentos:ver")),
    sessao: Session = Depends(obter_sessao),
):
    """Meses publicados ('AAAA-MM'), do mais novo para o mais antigo."""
    uf = uf.upper()
    return sessao.scalars(
        select(SinapiPreco.mes_referencia)
        .where(SinapiPreco.uf == uf, SinapiPreco.regime == _regime(sessao, uf, regime))
        .distinct()
        .order_by(SinapiPreco.mes_referencia.desc())
    ).all()


@router.get("/insumos", response_model=list[SinapiInsumoSaida])
def buscar_insumos(
    uf: str = Query("MA", min_length=2, max_length=2),
    regime: str | None = _REGIME,
    busca: str = Query("", max_length=100),
    limite: int = Query(30, ge=1, le=100),
    _: Usuario = Depends(exigir("orcamentos:ver")),
    sessao: Session = Depends(obter_sessao),
):
    """Materiais com o preco mais recente (o que sera usado ao adicionar na
    obra). Com `busca`, os mais parecidos com o texto, mesmo com erro de
    digitacao ou sem acento (ver app/busca_sinapi.py); cada um traz a
    `semelhanca` (0 a 1). O codigo exato tambem acha."""
    uf = uf.upper()
    return busca_sinapi.buscar(sessao, uf, _regime(sessao, uf, regime), busca, limite)

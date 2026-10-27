# api/app/orcamento.py
# Regras de orcamento e depreciacao das obras. As rotas so chamam estas
# funcoes; assim a regra fica num lugar so e pode ser testada sem HTTP.
#
#   custo de um insumo   = quantidade x preco_base (preco SINAPI de quando entrou)
#   custo de material    = soma dos custos dos insumos
#   com BDI              = custo de material x (1 + BDI/100)
#
# Depreciacao (mesma regra que o app usava no banco local):
#   valor base  = soma(quantidade x preco_base)
#   valor atual = soma(quantidade x preco SINAPI mais recente da UF)
#   indice      = valor atual / valor base
# indice > 100%: o mesmo material hoje custa mais -> perda (orcamento defasado).
# indice < 100%: custa menos -> ganho. So o preco muda; a quantidade e a da obra.
# Nao ha agendamento: e calculado na hora, contra a tabela mais nova que existir.

from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .config import SINAPI_REGIME_PADRAO
from .models import Obra, ObraInsumo, SinapiPreco

# Abaixo disso (0,05%) a variacao e tratada como estavel.
TOLERANCIA = 0.0005


# --- SINAPI -------------------------------------------------------------------
# Toda consulta de preco e por UF + regime: desonerado e nao desonerado sao
# tabelas diferentes e nunca se misturam numa obra.

REGIMES = {
    "desonerado": "Desonerado",
    "nao_desonerado": "Não desonerado",
    "ficticio": "Exemplo (fictício)",
}


def ultimo_mes_sinapi(sessao: Session, uf: str, regime: str) -> str | None:
    return sessao.scalar(
        select(func.max(SinapiPreco.mes_referencia)).where(
            SinapiPreco.uf == uf, SinapiPreco.regime == regime
        )
    )


def regime_para_nova_obra(sessao: Session, uf: str, pedido: str | None = None) -> str | None:
    """O regime pedido; sem pedido, o padrao da configuracao e, se a API nao
    tiver essa tabela para a UF, o primeiro que tiver (o ficticio por ultimo)."""
    if pedido:
        return pedido if ultimo_mes_sinapi(sessao, uf, pedido) else None
    for regime in (SINAPI_REGIME_PADRAO, "desonerado", "nao_desonerado", "ficticio"):
        if ultimo_mes_sinapi(sessao, uf, regime):
            return regime
    return None


def preco_vigente(
    sessao: Session, uf: str, regime: str, codigo: str, mes: str
) -> SinapiPreco | None:
    """Preco do proprio mes ou, se nao houve publicacao nele, o ultimo anterior."""
    return sessao.scalars(
        select(SinapiPreco)
        .where(
            SinapiPreco.uf == uf,
            SinapiPreco.regime == regime,
            SinapiPreco.codigo == codigo,
            SinapiPreco.mes_referencia <= mes,
        )
        .order_by(SinapiPreco.mes_referencia.desc())
        .limit(1)
    ).first()


def historico_precos(
    sessao: Session, uf: str, regime: str, codigos: list[str], ate_mes: str
) -> dict[str, list[SinapiPreco]]:
    """Todos os precos de cada codigo ate `ate_mes`, em ordem de mes."""
    if not codigos:
        return {}
    linhas = sessao.scalars(
        select(SinapiPreco)
        .where(
            SinapiPreco.uf == uf,
            SinapiPreco.regime == regime,
            SinapiPreco.codigo.in_(codigos),
            SinapiPreco.mes_referencia <= ate_mes,
        )
        .order_by(SinapiPreco.codigo, SinapiPreco.mes_referencia)
    ).all()
    por_codigo: dict[str, list[SinapiPreco]] = {}
    for linha in linhas:
        por_codigo.setdefault(linha.codigo, []).append(linha)
    return por_codigo


def _preco_em(historico: list[SinapiPreco], mes: str) -> SinapiPreco | None:
    achado = None
    for h in historico:
        if h.mes_referencia <= mes:
            achado = h
        else:
            break
    return achado


# --- Insumos da obra ------------------------------------------------------------


def insumos_ativos(obra: Obra) -> list[ObraInsumo]:
    return [i for i in obra.insumos if i.excluido_em is None]


def adicionar_insumo(sessao: Session, obra: Obra, codigo: str, quantidade: float) -> ObraInsumo:
    """Poe um material do SINAPI na obra, com o preco mais recente da UF da obra.
    Se ele ja estiver na obra, soma a quantidade e guarda o preco medio
    ponderado (o retrato continua valendo para a parte que ja existia).
    Nao faz commit: quem chama decide (permite criar obra + insumos juntos)."""
    uf, regime = obra.sinapi_uf, obra.sinapi_regime
    mes = ultimo_mes_sinapi(sessao, uf, regime)
    preco = preco_vigente(sessao, uf, regime, codigo, mes) if mes else None
    if preco is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=f"Sem preço SINAPI-{uf} ({REGIMES.get(regime, regime)}) para o código {codigo}.",
        )

    # UNIQUE (obra_id, codigo): a linha pode existir, ate excluida.
    atual = next((i for i in obra.insumos if i.codigo == codigo), None)
    if atual is None:
        atual = ObraInsumo(
            obra=obra,
            codigo=preco.codigo,
            descricao=preco.descricao,
            unidade=preco.unidade,
            classe=preco.classe,
            quantidade=quantidade,
            preco_base=preco.preco,
            mes_preco_base=preco.mes_referencia,
        )
        sessao.add(atual)
    elif atual.excluido_em is not None:
        atual.excluido_em = None
        atual.quantidade = quantidade
        atual.preco_base = preco.preco
        atual.mes_preco_base = preco.mes_referencia
    else:
        nova_qtd = atual.quantidade + quantidade
        atual.preco_base = (
            atual.quantidade * atual.preco_base + quantidade * preco.preco
        ) / nova_qtd
        atual.quantidade = nova_qtd
    return atual


def remover_insumo(insumo: ObraInsumo) -> None:
    insumo.excluido_em = datetime.now(timezone.utc)


# --- Resumo e lista ---------------------------------------------------------------


def resumo_obra(obra: Obra) -> dict:
    insumos = insumos_ativos(obra)
    custo = sum(i.quantidade * i.preco_base for i in insumos)
    return {
        "custo_material": custo,
        "custo_material_com_bdi": custo * (1 + obra.bdi_percentual / 100),
        "qtd_insumos": len(insumos),
        "qtd_categorias": len({i.classe or "Sem categoria" for i in insumos}),
    }


def lista_insumos(obra: Obra) -> list[dict]:
    """Insumos do maior para o menor custo, com a participacao no total
    (base da curva ABC)."""
    insumos = insumos_ativos(obra)
    total = sum(i.quantidade * i.preco_base for i in insumos)
    linhas = [
        {
            "id": i.id,
            "codigo": i.codigo,
            "descricao": i.descricao,
            "unidade": i.unidade,
            "categoria": i.classe,
            "quantidade": i.quantidade,
            "preco_unitario": i.preco_base,
            "mes_preco": i.mes_preco_base,
            "custo": i.quantidade * i.preco_base,
            "participacao": (i.quantidade * i.preco_base / total) if total > 0 else 0,
        }
        for i in insumos
    ]
    linhas.sort(key=lambda linha: linha["custo"], reverse=True)
    return linhas


# --- Depreciacao --------------------------------------------------------------------


def classificar(fracao: float, tem_preco: bool = True) -> str:
    if not tem_preco:
        return "sem_preco"
    if fracao > TOLERANCIA:
        return "perda"
    if fracao < -TOLERANCIA:
        return "ganho"
    return "estavel"


def depreciacao_obra(sessao: Session, obra: Obra) -> dict | None:
    uf, regime = obra.sinapi_uf, obra.sinapi_regime
    mes_atual = ultimo_mes_sinapi(sessao, uf, regime)
    insumos = insumos_ativos(obra)
    if not mes_atual or not insumos:
        return None

    historico = historico_precos(sessao, uf, regime, [i.codigo for i in insumos], mes_atual)

    itens = []
    for i in insumos:
        atual = _preco_em(historico.get(i.codigo, []), mes_atual)
        tem_preco = atual is not None
        preco_atual = atual.preco if tem_preco else i.preco_base
        valor_base = i.quantidade * i.preco_base
        valor_atual = i.quantidade * preco_atual
        fracao = preco_atual / i.preco_base - 1 if i.preco_base > 0 else 0
        itens.append(
            {
                "id": i.id,
                "codigo": i.codigo,
                "descricao": i.descricao,
                "unidade": i.unidade,
                "quantidade": i.quantidade,
                "preco_base": i.preco_base,
                "mes_preco_base": i.mes_preco_base,
                "preco_atual": preco_atual,
                "mes_preco_atual": atual.mes_referencia if atual else None,
                "valor_base": valor_base,
                "valor_atual": valor_atual,
                "variacao": valor_atual - valor_base,
                "variacao_percentual": fracao,
                "status": classificar(fracao, tem_preco),
            }
        )
    itens.sort(key=lambda item: abs(item["variacao"]), reverse=True)

    valor_base = sum(item["valor_base"] for item in itens)
    valor_atual = sum(item["valor_atual"] for item in itens)
    indice = valor_atual / valor_base if valor_base > 0 else 1

    # Evolucao mes a mes, do mes da obra ate o atual. Antes de um insumo entrar
    # na obra, vale o proprio preco_base dele (nao houve variacao para ele).
    mes_base = obra.sinapi_mes_referencia
    meses = sorted(
        {h.mes_referencia for lista in historico.values() for h in lista if h.mes_referencia >= mes_base}
    )
    evolucao = []
    for mes in meses:
        valor = 0.0
        for i in insumos:
            p = _preco_em(historico.get(i.codigo, []), mes)
            preco = p.preco if p is not None and mes >= i.mes_preco_base else i.preco_base
            valor += i.quantidade * preco
        evolucao.append(
            {"mes": mes, "valor": valor, "indice": valor / valor_base if valor_base > 0 else 1}
        )

    return {
        "uf": uf,
        "regime": regime,
        "mes_base": mes_base,
        "mes_atual": mes_atual,
        "valor_base": valor_base,
        "valor_atual": valor_atual,
        "variacao": valor_atual - valor_base,
        "indice": indice,
        "status": classificar(indice - 1),
        "evolucao": evolucao,
        "itens": itens,
        "qtd_sem_preco_atual": sum(1 for item in itens if item["status"] == "sem_preco"),
    }

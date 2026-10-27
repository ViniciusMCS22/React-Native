# api/app/busca_sinapi.py
# Busca aproximada no catalogo SINAPI: o usuario digita do jeito dele e recebe
# os materiais mais parecidos, sem precisar escrever igual a Caixa.
#
#   "cimeto cp2"     -> CIMENTO PORTLAND ... CP II ...   (erro de digitacao)
#   "tubo pvc 50"    -> TUBO PVC ... 50 MM ...           (ordem livre)
#   "areia media"    -> AREIA MEDIA ...                  (sem acento)
#   "1379"           -> o insumo de codigo 1379
#
# Como funciona: texto e catalogo viram palavras sem acento e em minusculas,
# com letra separada de numero ("10mm" = "10 mm") e II/III/IV como 2/3/4.
# Cada palavra digitada recebe a nota da palavra mais parecida do material
# (igual = 1; comeco da palavra = 0,9; parecida, pela semelhanca de letras,
# ate 0,85). A nota do material e a media das palavras digitadas. Numeros so
# valem iguais ou como comeco (50 nao pode achar 500).
#
# O catalogo (alguns milhares de linhas) fica em memoria por UF + regime + mes
# e e remontado quando muda (nova importacao).

import re
import unicodedata
from difflib import SequenceMatcher

from sqlalchemy import func, select
from sqlalchemy.orm import Session, aliased

from .models import SinapiPreco

# Palavras que nao ajudam a achar o material.
_IGNORAR = {"de", "da", "do", "das", "dos", "para", "com", "e", "em", "a", "o", "x", "tipo"}
NOTA_MINIMA = 0.6

_indices: dict[tuple, "_Indice"] = {}


# A Caixa escreve "CP II", o usuario "cp2".
_ROMANOS = {"ii": "2", "iii": "3", "iv": "4"}


def palavras(texto: str) -> list[str]:
    sem_acento = unicodedata.normalize("NFD", texto).encode("ascii", "ignore").decode().lower()
    # Separa letra de numero: "10mm" -> "10 mm", "cp2" -> "cp 2", "9x19" -> "9 x 19".
    separado = re.sub(r"(?<=[a-z])(?=[0-9])|(?<=[0-9])(?=[a-z])", " ", sem_acento)
    resultado = []
    for p in re.split(r"[^a-z0-9]+", separado):
        if p and p not in _IGNORAR:
            resultado.append(_ROMANOS.get(p, p))
    return resultado


class _Indice:
    def __init__(self, linhas: list[SinapiPreco]):
        self.itens = [
            {
                "codigo": p.codigo,
                "descricao": p.descricao,
                "unidade": p.unidade,
                "classe": p.classe,
                "preco": p.preco,
                "mes_referencia": p.mes_referencia,
            }
            for p in linhas
        ]
        self.palavras = [palavras(f"{p.descricao} {p.unidade}") for p in linhas]
        self.vocabulario = {w for ws in self.palavras for w in ws}
        self.por_codigo = {item["codigo"]: item for item in self.itens}


def _nota_palavra(digitada: str, vocabulario: set[str]) -> dict[str, float]:
    """Nota de cada palavra do catalogo para uma palavra digitada (so as > 0)."""
    numero = digitada.isdigit()
    notas = {}
    for palavra in vocabulario:
        if palavra == digitada:
            notas[palavra] = 1.0
        elif palavra.startswith(digitada) and (len(digitada) >= 2 or numero):
            notas[palavra] = 0.9
        elif not numero and len(digitada) >= 3 and abs(len(palavra) - len(digitada)) <= 3:
            comparador = SequenceMatcher(None, digitada, palavra)
            if comparador.quick_ratio() >= 0.75:
                semelhanca = comparador.ratio()
                if semelhanca >= 0.75:
                    notas[palavra] = semelhanca * 0.85
    return notas


def _indice(sessao: Session, uf: str, regime: str) -> _Indice:
    recente = aliased(SinapiPreco)
    ultimo_mes = (
        select(func.max(recente.mes_referencia))
        .where(
            recente.uf == SinapiPreco.uf,
            recente.regime == SinapiPreco.regime,
            recente.codigo == SinapiPreco.codigo,
        )
        .scalar_subquery()
    )
    # Muda quando entra uma tabela nova: entao remonta.
    versao = sessao.execute(
        select(func.max(SinapiPreco.mes_referencia), func.count()).where(
            SinapiPreco.uf == uf, SinapiPreco.regime == regime
        )
    ).one()
    chave = (uf, regime, *versao)
    if chave not in _indices:
        linhas = sessao.scalars(
            select(SinapiPreco)
            .where(
                SinapiPreco.uf == uf,
                SinapiPreco.regime == regime,
                SinapiPreco.mes_referencia == ultimo_mes,
            )
            .order_by(SinapiPreco.descricao)
        ).all()
        _indices.clear()  # so o catalogo atual de cada uso fica em memoria
        _indices[chave] = _Indice(linhas)
    return _indices[chave]


def buscar(sessao: Session, uf: str, regime: str, texto: str, limite: int) -> list[dict]:
    """Materiais com o preco mais recente, do mais para o menos parecido.
    Sem texto, os primeiros em ordem alfabetica."""
    indice = _indice(sessao, uf, regime)
    termo = texto.strip()
    if not termo:
        return indice.itens[:limite]

    # Codigo digitado: vem primeiro.
    exato = indice.por_codigo.get(termo.lstrip("0") or "0") if termo.isdigit() else None

    digitadas = palavras(termo)
    if not digitadas:
        return [{**exato, "semelhanca": 1.0}] if exato else []
    notas = [_nota_palavra(d, indice.vocabulario) for d in digitadas]

    resultado = []
    for item, palavras_item in zip(indice.itens, indice.palavras):
        if item is exato:
            continue
        soma = 0.0
        for nota in notas:
            soma += max((nota.get(p, 0.0) for p in palavras_item), default=0.0)
        media = soma / len(digitadas)
        if media >= NOTA_MINIMA:
            # Desempate: material que comeca pela primeira palavra digitada e
            # descricao mais curta (mais generica) primeiro.
            comeca = palavras_item[:1] and notas[0].get(palavras_item[0], 0) >= 0.9
            resultado.append((media + (0.05 if comeca else 0), -len(item["descricao"]), item))

    resultado.sort(key=lambda r: (r[0], r[1]), reverse=True)
    achados = [{**item, "semelhanca": round(min(nota, 1.0), 3)} for nota, _, item in resultado]
    if exato:
        achados.insert(0, {**exato, "semelhanca": 1.0})
    return achados[:limite]

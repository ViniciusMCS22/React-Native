# api/app/importar_sinapi.py
# Importa a tabela de precos de insumos do SINAPI publicada pela Caixa.
#
# Uso (de dentro da pasta api/):
#   .venv\Scripts\python -m app.importar_sinapi sinapi\SINAPI_ref_Insumos_Composicoes_MA_202412_Desonerado.zip
#
# Aceita o .zip mensal da Caixa como foi baixado (ou as planilhas extraidas).
# Le duas planilhas de dentro dele:
#   - SINAPI_Preco_Ref_Insumos_<UF>_<AAAAMM>_<Regime>.xlsx : codigo, descricao,
#     unidade e preco mediano de cada insumo;
#   - Relatorio de Familia de Insumos : a "macro-classe" de cada codigo, usada
#     para importar SO material (o projeto nao controla mao de obra,
#     equipamento nem servicos).
# UF, mes e regime saem do nome do arquivo e sao conferidos com o cabecalho.
#
# Reimportar o mesmo mes substitui os precos dele (a Caixa as vezes republica).
# Os precos ja guardados nas obras (retrato) nao mudam.

import argparse
import io
import re
import sys
import unicodedata
import zipfile
from dataclasses import dataclass
from pathlib import Path

import openpyxl
from sqlalchemy import delete
from sqlalchemy.orm import Session

from .database import Base, SessaoLocal, atualizar_banco_antigo, engine
from .models import SinapiPreco

_NOME_INSUMOS = re.compile(
    r"SINAPI_Preco_Ref_Insumos_([A-Z]{2})_(\d{4})(\d{2})_(Desonerado|NaoDesonerado)\.xlsx$",
    re.IGNORECASE,
)


class ErroImportacao(Exception):
    pass


@dataclass
class Tabela:
    uf: str
    mes: str  # 'AAAA-MM'
    regime: str  # 'desonerado' | 'nao_desonerado'
    insumos: list[dict]
    ignorados: dict[str, int]  # macro-classe -> quantos nao sao material


def _sem_acento(texto: str) -> str:
    return unicodedata.normalize("NFD", texto).encode("ascii", "ignore").decode().upper()


def _preco(valor) -> float | None:
    """'2.208,15' -> 2208.15. Vazio -> None."""
    if valor is None:
        return None
    if isinstance(valor, (int, float)):
        return float(valor)
    texto = str(valor).strip()
    if not texto:
        return None
    return float(texto.replace(".", "").replace(",", "."))


def _arquivos(caminho: Path) -> dict[str, bytes]:
    """Nome -> conteudo das planilhas, venham do .zip ou soltas na pasta."""
    if caminho.suffix.lower() == ".zip":
        with zipfile.ZipFile(caminho) as z:
            return {
                Path(n).name: z.read(n) for n in z.namelist() if n.lower().endswith(".xlsx")
            }
    pasta = caminho.parent if caminho.is_file() else caminho
    return {p.name: p.read_bytes() for p in pasta.glob("*.xlsx")}


def _linhas(conteudo: bytes):
    planilha = openpyxl.load_workbook(io.BytesIO(conteudo), read_only=True, data_only=True)
    try:
        yield from planilha.worksheets[0].iter_rows(values_only=True)
    finally:
        planilha.close()


def _macro_classes(conteudo: bytes) -> dict[str, str]:
    """Codigo do insumo -> macro-classe (MATERIAL, MAO DE OBRA, ...)."""
    resultado = {}
    colunas = None
    for linha in _linhas(conteudo):
        celulas = [_sem_acento(str(c or "")) for c in linha]
        if colunas is None:
            # Cabecalho: a linha que tem "REPRESENTADO" e "MACRO-CLASSE".
            if any("REPRESENTADO" in c for c in celulas) and any("MACRO" in c for c in celulas):
                colunas = (
                    next(i for i, c in enumerate(celulas) if "REPRESENTADO" in c),
                    next(i for i, c in enumerate(celulas) if "MACRO" in c),
                )
            continue
        codigo, macro = linha[colunas[0]], linha[colunas[1]]
        if codigo is not None and str(codigo).strip().isdigit() and macro:
            resultado[str(int(codigo))] = _sem_acento(str(macro)).strip()
    if not resultado:
        raise ErroImportacao("Não achei o cabeçalho do Relatório de Família de Insumos.")
    return resultado


def ler_tabela(caminho: Path) -> Tabela:
    arquivos = _arquivos(caminho)
    nome_insumos = next((n for n in arquivos if _NOME_INSUMOS.search(n)), None)
    if nome_insumos is None:
        raise ErroImportacao(
            "Não achei a planilha SINAPI_Preco_Ref_Insumos_<UF>_<AAAAMM>_<Regime>.xlsx."
        )
    nome_familia = next((n for n in arquivos if "FAMILIA" in _sem_acento(n)), None)
    if nome_familia is None:
        raise ErroImportacao("Não achei o Relatório de Família de Insumos (usado para separar material).")

    uf, ano, mes, regime_arquivo = _NOME_INSUMOS.search(nome_insumos).groups()
    uf = uf.upper()
    regime = "nao_desonerado" if regime_arquivo.lower().startswith("nao") else "desonerado"
    macro = _macro_classes(arquivos[nome_familia])

    insumos, ignorados, cabecalho_ok = [], {}, False
    for linha in _linhas(arquivos[nome_insumos]):
        primeira = str(linha[0] or "").strip()
        if not cabecalho_ok:
            texto = _sem_acento(primeira)
            if texto.startswith("MES DE COLETA"):
                if f"{mes}/{ano}" not in texto:
                    raise ErroImportacao(f"O nome diz {mes}/{ano}, mas a planilha diz '{primeira}'.")
            elif "NAO DESONERADO" in texto and regime != "nao_desonerado":
                raise ErroImportacao("O nome diz Desonerado, mas a planilha é de não desonerado.")
            elif texto.startswith("CODIGO"):
                cabecalho_ok = True
            continue
        if not primeira.isdigit():
            continue  # linhas em branco e o "TOTAL DE INSUMOS" do fim
        codigo = str(int(primeira))
        classe = macro.get(codigo, "SEM CLASSE")
        if classe != "MATERIAL":
            ignorados[classe] = ignorados.get(classe, 0) + 1
            continue
        preco = _preco(linha[4])
        if preco is None:
            ignorados["SEM PRECO"] = ignorados.get("SEM PRECO", 0) + 1
            continue
        insumos.append(
            {
                "codigo": codigo,
                # A Caixa completa a descricao com espacos ate 500 caracteres.
                "descricao": " ".join(str(linha[1]).split()),
                "unidade": str(linha[2] or "").strip(),
                "preco": preco,
            }
        )

    if not cabecalho_ok or not insumos:
        raise ErroImportacao(f"Nenhum insumo lido de {nome_insumos}. O formato mudou?")
    return Tabela(uf=uf, mes=f"{ano}-{mes}", regime=regime, insumos=insumos, ignorados=ignorados)


def gravar(sessao: Session, tabela: Tabela) -> None:
    sessao.execute(
        delete(SinapiPreco).where(
            SinapiPreco.uf == tabela.uf,
            SinapiPreco.regime == tabela.regime,
            SinapiPreco.mes_referencia == tabela.mes,
        )
    )
    sessao.add_all(
        SinapiPreco(
            uf=tabela.uf,
            regime=tabela.regime,
            mes_referencia=tabela.mes,
            codigo=i["codigo"],
            descricao=i["descricao"],
            unidade=i["unidade"],
            classe=None,
            preco=i["preco"],
        )
        for i in tabela.insumos
    )
    sessao.commit()


def main(argumentos: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Importa a tabela de insumos do SINAPI (Caixa).")
    parser.add_argument("arquivo", type=Path, help="o .zip mensal da Caixa ou a planilha .xlsx")
    args = parser.parse_args(argumentos)
    if not args.arquivo.exists():
        print(f"Arquivo nao encontrado: {args.arquivo}", file=sys.stderr)
        return 1

    try:
        tabela = ler_tabela(args.arquivo)
    except (ErroImportacao, zipfile.BadZipFile) as e:
        print(f"Nao foi possivel importar: {e}", file=sys.stderr)
        return 1

    Base.metadata.create_all(engine)
    atualizar_banco_antigo()
    with SessaoLocal() as sessao:
        gravar(sessao, tabela)

    regime = "nao desonerado" if tabela.regime == "nao_desonerado" else "desonerado"
    print(f"SINAPI-{tabela.uf} {tabela.mes} ({regime}): {len(tabela.insumos)} materiais importados.")
    for classe, quantidade in sorted(tabela.ignorados.items()):
        print(f"  ignorados (nao sao material): {classe}: {quantidade}")
    return 0


if __name__ == "__main__":
    sys.exit(main())

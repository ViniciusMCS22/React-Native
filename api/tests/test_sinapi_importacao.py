# api/tests/test_sinapi_importacao.py
# Importador das planilhas da Caixa e busca aproximada, num banco em memoria
# (nao mexe no banco dos outros testes). As planilhas sao montadas aqui, no
# mesmo formato das publicadas pela Caixa.
# Rodar (de dentro da pasta api/):  .venv\Scripts\python -m pytest -q

import io
import zipfile

import openpyxl
import pytest
from sqlalchemy import create_engine, func, select
from sqlalchemy.orm import Session

from app import busca_sinapi
from app.database import Base
from app.importar_sinapi import ErroImportacao, gravar, ler_tabela
from app.models import SinapiPreco

INSUMOS = [
    # codigo, descricao (a Caixa completa com espacos), unidade, preco, macro-classe
    (1379, "CIMENTO PORTLAND COMPOSTO CP II-32" + " " * 40, "KG    ", "0,78", "MATERIAL"),
    (34, "ACO CA-50, 10,0 MM, VERGALHAO", "KG    ", "7,12", "MATERIAL"),
    (9875, "TUBO PVC, SOLDAVEL, DE 50 MM, AGUA FRIA (NBR-5648)", "M     ", "1.208,15", "MATERIAL"),
    (41096, "VIGIA DIURNO (MENSALISTA)", "MES   ", "2.208,15", "MAO DE OBRA"),
]


def _xlsx(linhas) -> bytes:
    planilha = openpyxl.Workbook()
    for linha in linhas:
        planilha.active.append(linha)
    saida = io.BytesIO()
    planilha.save(saida)
    return saida.getvalue()


def _zip(caminho, mes="12/2024", nome_mes="202412", regime="Desonerado"):
    precos = _xlsx(
        [
            ("        PRECOS DE INSUMOS - BANCO NACIONAL",),
            ("",),
            (f"MES DE COLETA: {mes}",),
            ("LOCALIDADE: 0500 - SAO LUIS",),
            ("ENCARGOS SOCIAIS DESONERADOS (%) HORISTA  82,97  MENSALISTA  46,10",),
            ("",),
            ("CODIGO  ", "DESCRICAO DO INSUMO", "UNIDADE DE MEDIDA", "ORIGEM DO PRECO", "PRECO MEDIANO R$"),
            *[(c, d, u, "CR", p) for c, d, u, p, _ in INSUMOS],
            ("",),
            (f"TOTAL DE INSUMOS : {len(INSUMOS)}",),
        ]
    )
    familias = _xlsx(
        [
            ("CAIXA ECONÔMICA FEDERAL",),
            ("(*) Coeficientes",),
            ("Cód. Insumo\nRepresentativo", "Cód. Insumo\nRepresentado", "Descrição do Insumo",
             "Unidade", "Coeficiente", "Categoria", "Macro-Classe", "Vínculo"),
            *[(c, c, d, u, 1, "REPRESENTATIVO", m, "NACIONAL CAIXA") for c, d, u, _, m in INSUMOS],
        ]
    )
    with zipfile.ZipFile(caminho, "w") as z:
        z.writestr(f"SINAPI_Preco_Ref_Insumos_MA_{nome_mes}_{regime}.xlsx", precos)
        z.writestr("_SINAPI_Relatório_Família_de_Insumos_2024_12.xlsx", familias)
        z.writestr("Notas_SINAPI.pdf", b"%PDF")
    return caminho


@pytest.fixture
def sessao():
    motor = create_engine("sqlite://")
    Base.metadata.create_all(motor)
    with Session(motor) as s:
        yield s


def test_le_uf_mes_regime_e_so_material(tmp_path):
    tabela = ler_tabela(_zip(tmp_path / "sinapi.zip"))
    assert (tabela.uf, tabela.mes, tabela.regime) == ("MA", "2024-12", "desonerado")
    assert [i["codigo"] for i in tabela.insumos] == ["1379", "34", "9875"]
    assert tabela.ignorados == {"MAO DE OBRA": 1}
    cimento, _, tubo = tabela.insumos
    assert cimento["descricao"] == "CIMENTO PORTLAND COMPOSTO CP II-32"
    assert cimento["unidade"] == "KG"
    assert tubo["preco"] == 1208.15


def test_nao_desonerado_pelo_nome(tmp_path):
    tabela = ler_tabela(_zip(tmp_path / "s.zip", regime="NaoDesonerado"))
    assert tabela.regime == "nao_desonerado"


def test_mes_do_nome_diferente_do_cabecalho(tmp_path):
    with pytest.raises(ErroImportacao):
        ler_tabela(_zip(tmp_path / "s.zip", mes="11/2024"))


def test_reimportar_o_mesmo_mes_substitui(tmp_path, sessao):
    tabela = ler_tabela(_zip(tmp_path / "s.zip"))
    gravar(sessao, tabela)
    gravar(sessao, tabela)
    assert sessao.scalar(select(func.count()).select_from(SinapiPreco)) == 3


@pytest.mark.parametrize(
    "texto, codigo",
    [
        ("cimeto cp2", "1379"),  # erro de digitacao + "cp2" = "CP II"
        ("Cimento", "1379"),
        ("vergalhao 10mm", "34"),  # "10mm" = "10,0 MM"
        ("tubo pvc 50", "9875"),
        ("agua fria pvc", "9875"),  # ordem livre
        ("9875", "9875"),  # codigo
    ],
)
def test_busca_aproximada(tmp_path, sessao, texto, codigo):
    gravar(sessao, ler_tabela(_zip(tmp_path / "s.zip")))
    achados = busca_sinapi.buscar(sessao, "MA", "desonerado", texto, 5)
    assert achados and achados[0]["codigo"] == codigo


def test_busca_sem_resultado_e_numero_nao_acha_parecido(tmp_path, sessao):
    gravar(sessao, ler_tabela(_zip(tmp_path / "s.zip")))
    assert busca_sinapi.buscar(sessao, "MA", "desonerado", "xyzabc", 5) == []
    # "500" nao pode achar o tubo de 50 mm.
    assert busca_sinapi.buscar(sessao, "MA", "desonerado", "500", 5) == []

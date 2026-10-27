# api/tests/test_obras.py
# Rodar (de dentro da pasta api/):  .venv\Scripts\python -m pytest -q

import os
import tempfile

# Banco temporario: os testes nunca tocam o gestao_insumos.db de desenvolvimento.
# (Se test_auth.py rodar antes, vale o banco temporario que ele definiu.)
os.environ.setdefault(
    "DATABASE_URL", f"sqlite:///{os.path.join(tempfile.mkdtemp(), 'teste.db')}"
)

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from sqlalchemy import update  # noqa: E402

from app import sinapi_dados  # noqa: E402
from app.database import SessaoLocal  # noqa: E402
from app.main import app  # noqa: E402
from app.models import Usuario  # noqa: E402
from app.seed import INSUMOS_EXEMPLO, USUARIOS_TESTE  # noqa: E402

CRED = {u["perfil"].value: (u["email"], u["senha"]) for u in USUARIOS_TESTE}
PRECOS = {codigo: precos for codigo, _, _, _, precos in sinapi_dados.INSUMOS}
MES_ATUAL = sinapi_dados.MESES[-1]


@pytest.fixture(scope="module")
def cliente():
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="module")
def cab(cliente):
    """Cabecalho de autorizacao de cada perfil (um login por perfil)."""
    # test_auth.py testa o bloqueio por senha errada no mesmo banco; desbloqueia.
    with SessaoLocal() as sessao:
        sessao.execute(update(Usuario).values(tentativas_falhas=0, bloqueado_ate=None))
        sessao.commit()
    cabecalhos = {}
    for perfil, (email, senha) in CRED.items():
        r = cliente.post("/auth/login", json={"email": email, "senha": senha})
        assert r.status_code == 200, r.text
        cabecalhos[perfil] = {"Authorization": f"Bearer {r.json()['token_acesso']}"}
    return cabecalhos


def casa_a(cliente, cab):
    obras = cliente.get("/obras", headers=cab["master"]).json()
    return next(o for o in obras if o["nome"] == "Casa A")


def criar(cliente, cab, perfil="orcamentista", **extra):
    corpo = {"nome": "Obra Teste", "bdi_percentual": 20, **extra}
    return cliente.post("/obras", json=corpo, headers=cab[perfil])


# --- Obra de exemplo ---------------------------------------------------------


def test_casa_a_usa_precos_do_primeiro_mes(cliente, cab):
    obra = casa_a(cliente, cab)
    esperado = sum(q * PRECOS[c][0] for c, q in INSUMOS_EXEMPLO.items())
    assert obra["sinapi_mes_referencia"] == sinapi_dados.MESES[0]
    assert obra["resumo"]["custo_material"] == pytest.approx(esperado)
    assert obra["resumo"]["custo_material_com_bdi"] == pytest.approx(esperado * 1.225)
    assert obra["resumo"]["qtd_insumos"] == len(INSUMOS_EXEMPLO)


def test_depreciacao_da_casa_a(cliente, cab):
    obra = casa_a(cliente, cab)
    d = cliente.get(f"/obras/{obra['id']}/depreciacao", headers=cab["master"]).json()
    assert d["mes_base"] == sinapi_dados.MESES[0]
    assert d["mes_atual"] == MES_ATUAL
    assert [e["mes"] for e in d["evolucao"]] == sinapi_dados.MESES
    assert d["evolucao"][0]["indice"] == pytest.approx(1)
    assert d["valor_base"] == pytest.approx(obra["resumo"]["custo_material"])
    assert d["indice"] == pytest.approx(d["valor_atual"] / d["valor_base"])

    # Prego nao tem preco no ultimo mes: usa o ultimo publicado (agosto).
    prego = next(i for i in d["itens"] if i["codigo"] == "MAT-0009")
    assert prego["mes_preco_atual"] == sinapi_dados.MESES[3]
    # Aco ficou mais barato: ganho. Cimento ficou mais caro: perda.
    status = {i["codigo"]: i["status"] for i in d["itens"]}
    assert status["MAT-0005"] == "ganho"
    assert status["MAT-0001"] == "perda"


# --- Permissoes --------------------------------------------------------------


def test_cliente_ve_obras_mas_nao_os_itens(cliente, cab):
    obra = casa_a(cliente, cab)
    assert cliente.get("/obras", headers=cab["cliente"]).status_code == 200
    assert cliente.get(f"/obras/{obra['id']}/insumos", headers=cab["cliente"]).status_code == 403
    d = cliente.get(f"/obras/{obra['id']}/depreciacao", headers=cab["cliente"]).json()
    assert d["itens"] == []
    assert d["indice"] > 0


def test_so_quem_edita_orcamento_cria_obra(cliente, cab):
    assert criar(cliente, cab, "cliente").status_code == 403
    for perfil in ("master", "orcamentista", "desenvolvedor"):
        assert criar(cliente, cab, perfil, nome=f"Obra {perfil}").status_code == 201


def test_cliente_nao_altera_insumos(cliente, cab):
    obra = casa_a(cliente, cab)
    r = cliente.post(
        f"/obras/{obra['id']}/insumos",
        json={"codigo": "MAT-0001", "quantidade": 1},
        headers=cab["cliente"],
    )
    assert r.status_code == 403


def test_sem_login_recebe_401(cliente):
    assert cliente.get("/obras").status_code == 401


# --- Criar obra e mexer nos insumos --------------------------------------------


def test_criar_obra_usa_preco_sinapi_mais_recente(cliente, cab):
    r = criar(
        cliente,
        cab,
        insumos=[{"codigo": "MAT-0001", "quantidade": 10}, {"codigo": "MAT-0009", "quantidade": 2}],
    )
    assert r.status_code == 201, r.text
    obra = r.json()
    assert obra["sinapi_mes_referencia"] == MES_ATUAL
    esperado = 10 * PRECOS["MAT-0001"][-1] + 2 * PRECOS["MAT-0009"][3]
    assert obra["resumo"]["custo_material"] == pytest.approx(esperado)
    assert obra["resumo"]["custo_material_com_bdi"] == pytest.approx(esperado * 1.2)

    itens = cliente.get(f"/obras/{obra['id']}/insumos", headers=cab["orcamentista"]).json()
    prego = next(i for i in itens if i["codigo"] == "MAT-0009")
    assert prego["mes_preco"] == sinapi_dados.MESES[3]
    assert sum(i["participacao"] for i in itens) == pytest.approx(1)

    # Obra nova: retrato = tabela atual, entao nao ha variacao.
    d = cliente.get(f"/obras/{obra['id']}/depreciacao", headers=cab["orcamentista"]).json()
    assert d["indice"] == pytest.approx(1)
    assert d["status"] == "estavel"


def test_codigo_sem_preco_cancela_a_criacao(cliente, cab):
    antes = len(cliente.get("/obras", headers=cab["master"]).json())
    r = criar(cliente, cab, nome="Obra Invalida", insumos=[{"codigo": "NAO-EXISTE", "quantidade": 1}])
    assert r.status_code == 422
    assert "NAO-EXISTE" in r.json()["detail"]
    assert len(cliente.get("/obras", headers=cab["master"]).json()) == antes


def test_quantidade_precisa_ser_positiva(cliente, cab):
    r = criar(cliente, cab, insumos=[{"codigo": "MAT-0001", "quantidade": 0}])
    assert r.status_code == 422


def test_adicionar_alterar_e_remover_insumo(cliente, cab):
    obra = criar(cliente, cab, nome="Obra Edicao").json()
    url = f"/obras/{obra['id']}/insumos"
    h = cab["orcamentista"]

    itens = cliente.post(url, json={"codigo": "MAT-0003", "quantidade": 5}, headers=h).json()
    assert len(itens) == 1 and itens[0]["quantidade"] == 5

    # O mesmo material de novo: soma a quantidade.
    itens = cliente.post(url, json={"codigo": "MAT-0003", "quantidade": 3}, headers=h).json()
    assert len(itens) == 1 and itens[0]["quantidade"] == 8
    insumo_id = itens[0]["id"]

    itens = cliente.patch(f"{url}/{insumo_id}", json={"quantidade": 2}, headers=h).json()
    assert itens[0]["quantidade"] == 2
    assert itens[0]["preco_unitario"] == pytest.approx(PRECOS["MAT-0003"][-1])

    assert cliente.delete(f"{url}/{insumo_id}", headers=h).status_code == 204
    assert cliente.get(url, headers=h).json() == []
    assert cliente.get(f"/obras/{obra['id']}", headers=h).json()["resumo"]["custo_material"] == 0
    assert cliente.get(f"/obras/{obra['id']}/depreciacao", headers=h).json() is None
    assert cliente.delete(f"{url}/{insumo_id}", headers=h).status_code == 404

    # Depois de removido, pode voltar.
    itens = cliente.post(url, json={"codigo": "MAT-0003", "quantidade": 1}, headers=h).json()
    assert len(itens) == 1 and itens[0]["quantidade"] == 1


def test_obra_inexistente(cliente, cab):
    assert cliente.get("/obras/nao-existe", headers=cab["master"]).status_code == 404


# --- SINAPI ------------------------------------------------------------------------


def test_catalogo_sinapi_com_preco_mais_recente(cliente, cab):
    catalogo = cliente.get("/sinapi/insumos", headers=cab["orcamentista"]).json()
    assert len(catalogo) == len(sinapi_dados.INSUMOS)
    cimento = next(i for i in catalogo if i["codigo"] == "MAT-0001")
    assert cimento["mes_referencia"] == MES_ATUAL
    assert cimento["preco"] == PRECOS["MAT-0001"][-1]


def test_busca_ignora_acento_e_erro_de_digitacao(cliente, cab):
    achados = cliente.get("/sinapi/insumos?busca=aco", headers=cab["orcamentista"]).json()
    assert "MAT-0005" in {i["codigo"] for i in achados}
    achados = cliente.get("/sinapi/insumos?busca=cimeto", headers=cab["orcamentista"]).json()
    assert achados[0]["codigo"] == "MAT-0001"
    assert 0 < achados[0]["semelhanca"] <= 1


def test_obra_nova_guarda_o_regime(cliente, cab):
    # Nos testes so ha a tabela ficticia: e a que a obra nova usa.
    assert criar(cliente, cab).json()["sinapi_regime"] == "ficticio"


def test_meses_sinapi(cliente, cab):
    meses = cliente.get("/sinapi/meses", headers=cab["orcamentista"]).json()
    assert meses == sorted(sinapi_dados.MESES, reverse=True)


# --- Apagar obra -------------------------------------------------------------------


def excluir(cliente, cab, obra, perfil="master", nome=None, senha=""):
    return cliente.post(
        f"/obras/{obra['id']}/excluir",
        json={"nome_confirmacao": obra["nome"] if nome is None else nome, "senha": senha},
        headers=cab[perfil],
    )


def test_so_master_e_dev_apagam_obra(cliente, cab):
    obra = criar(cliente, cab, nome="Obra Permissao").json()
    assert excluir(cliente, cab, obra, "orcamentista").status_code == 403
    assert excluir(cliente, cab, obra, "cliente").status_code == 403
    assert excluir(cliente, cab, obra, "desenvolvedor").status_code == 204


def test_apagar_exige_o_nome_igual(cliente, cab):
    obra = criar(cliente, cab, nome="Obra Nome Certo").json()
    r = excluir(cliente, cab, obra, nome="Obra Nome Errado")
    assert r.status_code == 422
    assert cliente.get(f"/obras/{obra['id']}", headers=cab["master"]).status_code == 200


def test_apagar_com_senha_errada_e_certa(cliente, cab):
    obra = criar(cliente, cab, nome="Obra Senha").json()
    r = excluir(cliente, cab, obra, senha="senha-errada")
    assert r.status_code == 403 and r.json()["detail"] == "Senha incorreta."
    assert cliente.get(f"/obras/{obra['id']}", headers=cab["master"]).status_code == 200

    assert excluir(cliente, cab, obra, senha=CRED["master"][1]).status_code == 204
    assert cliente.get(f"/obras/{obra['id']}", headers=cab["master"]).status_code == 404
    nomes = {o["nome"] for o in cliente.get("/obras", headers=cab["master"]).json()}
    assert "Obra Senha" not in nomes
    # Apagada nao aceita mais nada.
    assert excluir(cliente, cab, obra, senha=CRED["master"][1]).status_code == 404


def test_senha_em_branco_so_em_desenvolvimento(cliente, cab, monkeypatch):
    from app.rotas import obras as rotas_obras

    obra = criar(cliente, cab, nome="Obra Sem Senha").json()
    monkeypatch.setattr(rotas_obras, "EXCLUSAO_SEM_SENHA", False)
    assert excluir(cliente, cab, obra).status_code == 403
    monkeypatch.setattr(rotas_obras, "EXCLUSAO_SEM_SENHA", True)
    assert excluir(cliente, cab, obra).status_code == 204

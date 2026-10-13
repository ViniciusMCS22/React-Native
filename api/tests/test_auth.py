# api/tests/test_auth.py
# Rodar (de dentro da pasta api/):  .venv\Scripts\python -m pytest -q

import os
import tempfile

# Banco temporario: os testes nunca tocam o gestao_insumos.db de desenvolvimento.
_pasta = tempfile.mkdtemp()
os.environ["DATABASE_URL"] = f"sqlite:///{os.path.join(_pasta, 'teste.db')}"

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402
from app.seed import USUARIOS_TESTE  # noqa: E402

CRED = {u["perfil"].value: (u["email"], u["senha"]) for u in USUARIOS_TESTE}


@pytest.fixture(scope="module")
def cliente():
    with TestClient(app) as c:
        yield c


def entrar(cliente, perfil):
    email, senha = CRED[perfil]
    r = cliente.post("/auth/login", json={"email": email, "senha": senha})
    assert r.status_code == 200, r.text
    return r.json()


def cab(tokens):
    return {"Authorization": f"Bearer {tokens['token_acesso']}"}


def test_login_devolve_usuario_e_permissoes(cliente):
    t = entrar(cliente, "master")
    assert t["usuario"]["perfil"] == "master"
    assert "usuarios:gerenciar" in t["usuario"]["permissoes"]
    me = cliente.get("/auth/me", headers=cab(t))
    assert me.status_code == 200 and me.json()["email"] == CRED["master"][0]


def test_email_ignora_maiusculas_e_espacos(cliente):
    email, senha = CRED["cliente"]
    r = cliente.post("/auth/login", json={"email": f"  {email.upper()} ", "senha": senha})
    assert r.status_code == 200


def test_senha_errada_e_email_inexistente_tem_mesma_mensagem(cliente):
    r1 = cliente.post("/auth/login", json={"email": CRED["cliente"][0], "senha": "errada"})
    r2 = cliente.post("/auth/login", json={"email": "ninguem@teste.com", "senha": "errada"})
    assert r1.status_code == r2.status_code == 401
    assert r1.json() == r2.json()


def test_sem_token_recebe_401(cliente):
    assert cliente.get("/auth/me").status_code == 401
    assert cliente.get("/exemplos/painel").status_code == 401


def test_token_de_renovacao_nao_serve_como_acesso(cliente):
    t = entrar(cliente, "master")
    r = cliente.get("/auth/me", headers={"Authorization": f"Bearer {t['token_renovacao']}"})
    assert r.status_code == 401


@pytest.mark.parametrize(
    "rota, metodo, esperado",
    [
        ("/exemplos/painel", "get", {"master": 200, "orcamentista": 200, "cliente": 200, "desenvolvedor": 200}),
        ("/exemplos/orcamento", "get", {"master": 200, "orcamentista": 200, "cliente": 403, "desenvolvedor": 200}),
        ("/exemplos/orcamento", "put", {"master": 200, "orcamentista": 200, "cliente": 403, "desenvolvedor": 200}),
        ("/exemplos/compras/aprovar", "post", {"master": 200, "orcamentista": 403, "cliente": 403, "desenvolvedor": 200}),
        ("/exemplos/usuarios", "get", {"master": 200, "orcamentista": 403, "cliente": 403, "desenvolvedor": 200}),
    ],
)
def test_permissoes_por_perfil(cliente, rota, metodo, esperado):
    for perfil, status in esperado.items():
        r = getattr(cliente, metodo)(rota, headers=cab(entrar(cliente, perfil)))
        assert r.status_code == status, f"{perfil} {metodo.upper()} {rota}: {r.status_code}"


def test_renovacao_gira_o_token_e_detecta_reuso(cliente):
    t = entrar(cliente, "orcamentista")
    r = cliente.post("/auth/renovar", json={"token_renovacao": t["token_renovacao"]})
    assert r.status_code == 200
    novo = r.json()
    assert novo["token_renovacao"] != t["token_renovacao"]

    # Reusar o antigo derruba todas as sessoes do usuario, inclusive a nova.
    assert cliente.post("/auth/renovar", json={"token_renovacao": t["token_renovacao"]}).status_code == 401
    assert cliente.post("/auth/renovar", json={"token_renovacao": novo["token_renovacao"]}).status_code == 401


def test_logout_revoga_renovacao(cliente):
    t = entrar(cliente, "cliente")
    assert cliente.post("/auth/logout", json={"token_renovacao": t["token_renovacao"]}).status_code == 204
    assert cliente.post("/auth/renovar", json={"token_renovacao": t["token_renovacao"]}).status_code == 401


def test_bloqueio_apos_cinco_tentativas(cliente):
    email, senha = CRED["orcamentista"]
    for _ in range(5):
        assert cliente.post("/auth/login", json={"email": email, "senha": "x"}).status_code == 401
    # Bloqueado: nem a senha certa entra.
    r = cliente.post("/auth/login", json={"email": email, "senha": senha})
    assert r.status_code == 423
    assert "min" in r.json()["detail"]


def test_desenvolvedor_tem_todas_as_permissoes(cliente):
    from app.permissoes import PERMISSOES

    todas = set().union(*PERMISSOES.values())
    t = entrar(cliente, "desenvolvedor")
    assert set(t["usuario"]["permissoes"]) == todas

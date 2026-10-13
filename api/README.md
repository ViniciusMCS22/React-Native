# API - Gestao de Insumos

Backend em **FastAPI** com autenticacao **JWT** e controle de acesso por perfil (RBAC).
Por enquanto usa **SQLite**; para trocar por PostgreSQL basta definir `DATABASE_URL`
(ver `app/config.py`) e instalar o driver (`psycopg`).

## Rodar pela primeira vez (Windows, PowerShell)

```powershell
cd api
python -m venv .venv
.venv\Scripts\python -m pip install -r requirements-dev.txt
.venv\Scripts\python -m uvicorn app.main:app --reload --host 0.0.0.0
```

Depois da primeira vez, basta rodar `npm run api` na raiz do projeto.
O app so consegue logar com a API rodando, entao deixe este terminal aberto.

- Swagger (documentacao interativa): http://localhost:8000/docs
- `--host 0.0.0.0` deixa o celular na mesma rede Wi-Fi acessar a API.
  Se o Windows perguntar sobre o firewall, permita em **redes privadas**.

## Usuarios de teste

Criados automaticamente na primeira execucao (`app/seed.py`), um por perfil:
Master / gestor, Orcamentista / engenharia, Consulta / cliente e Desenvolvedor
(todas as permissoes de todos os perfis, calculadas automaticamente).
So sao criados com `AMBIENTE=desenvolvimento` (o padrao); em producao use `AMBIENTE=producao`.
Os e-mails e senhas estao em `app/seed.py`. Usuarios novos adicionados la sao criados
no proximo inicio da API, sem precisar apagar `gestao_insumos.db`.

## Rotas

| Metodo | Rota | Quem pode |
| --- | --- | --- |
| POST | `/auth/login` | publico |
| POST | `/auth/renovar` | quem tem token de renovacao |
| POST | `/auth/logout` | quem tem token de renovacao |
| GET | `/auth/me` | qualquer usuario logado |
| GET | `/exemplos/painel` | todos os perfis |
| GET/PUT | `/exemplos/orcamento` | master, orcamentista, desenvolvedor |
| POST | `/exemplos/compras/aprovar` | master, desenvolvedor |
| GET | `/exemplos/usuarios` | master, desenvolvedor |

As rotas `/exemplos` sao so para testar permissoes e serao substituidas pelas reais.

## Como funciona a seguranca (DRDA)

- **RNF10** - senhas com bcrypt; a senha nunca e gravada.
- **RNF11** - token de acesso de 15 min + token de renovacao de 7 dias. A cada renovacao
  o token antigo e revogado; se alguem reusar um antigo, todas as sessoes do usuario caem.
- **RNF12** - cada rota exige uma *permissao* (`app/permissoes.py`), nao um perfil.
  Para mudar o que um perfil pode fazer, edite so o dicionario `PERMISSOES`.
- **RNF20** - 5 senhas erradas seguidas bloqueiam a conta por 15 min.

## Testes

```powershell
.venv\Scripts\python -m pytest -q
```

## Pendente antes de producao

- HTTPS (RNF14): em desenvolvimento a API roda em HTTP.
- Definir `JWT_SEGREDO` fixo no ambiente (sem ele, os logins caem a cada reinicio).
- Trocar `create_all` por migracoes com Alembic.
- Vincular usuarios a empresa e obras (RF03) e filtrar os dados por isso.

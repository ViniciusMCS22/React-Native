# api/app/config.py
# Configuracoes lidas de variaveis de ambiente, com padroes para desenvolvimento.
# Em producao, JWT_SEGREDO e DATABASE_URL DEVEM ser definidos no ambiente.

import os
import secrets

# "desenvolvimento" cria os usuarios de teste (seed.py). Em producao, definir
# AMBIENTE=producao para que essas contas nunca sejam criadas.
AMBIENTE = os.getenv("AMBIENTE", "desenvolvimento")

# Trocar SQLite por PostgreSQL e so mudar esta URL, por exemplo:
#   postgresql+psycopg://usuario:senha@localhost:5432/gestao_insumos
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./gestao_insumos.db")

# Sem segredo definido, gera um aleatorio a cada execucao: os tokens deixam de
# valer quando a API reinicia, o que e aceitavel em desenvolvimento.
JWT_SEGREDO = os.getenv("JWT_SEGREDO") or secrets.token_urlsafe(48)
JWT_ALGORITMO = "HS256"

# RNF11: token de acesso curto + token de renovacao mais longo.
ACESSO_MINUTOS = int(os.getenv("ACESSO_MINUTOS", "15"))
RENOVACAO_DIAS = int(os.getenv("RENOVACAO_DIAS", "7"))

# RNF20: bloqueio temporario apos tentativas seguidas de login com erro.
MAX_TENTATIVAS_LOGIN = 5
BLOQUEIO_MINUTOS = 15

# Regime da tabela SINAPI usado nas obras novas: "desonerado" ou
# "nao_desonerado" (decisao da empresa). Se a API nao tiver tabela desse
# regime para a UF, usa a que tiver (ver orcamento.regime_para_nova_obra).
SINAPI_REGIME_PADRAO = os.getenv("SINAPI_REGIME_PADRAO", "desonerado")

# Apagar obra pede a senha do usuario. So em desenvolvimento, e para agilizar
# os testes, a senha em branco tambem e aceita. Em producao (ou com
# EXCLUSAO_SEM_SENHA=0) a senha certa e sempre obrigatoria.
EXCLUSAO_SEM_SENHA = AMBIENTE == "desenvolvimento" and os.getenv("EXCLUSAO_SEM_SENHA", "1") == "1"

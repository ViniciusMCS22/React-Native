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

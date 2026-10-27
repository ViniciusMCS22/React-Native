# api/app/database.py
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from .config import DATABASE_URL

# check_same_thread so existe no SQLite; o FastAPI usa varias threads.
_argumentos = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=_argumentos)
SessaoLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


def obter_sessao():
    """Dependencia do FastAPI: abre uma sessao por requisicao e fecha no fim."""
    sessao = SessaoLocal()
    try:
        yield sessao
    finally:
        sessao.close()



# Colunas que entraram depois da primeira versao das tabelas de obra. O
# create_all nao altera tabela existente, entao bancos de desenvolvimento
# criados antes recebem a coluna aqui. Os dados que ja existiam eram todos da
# tabela SINAPI ficticia. (Quando o modelo estabilizar: migracoes com Alembic.)
_COLUNAS_NOVAS = [
    ("sinapi_precos", "regime", "VARCHAR(20) NOT NULL DEFAULT 'ficticio'"),
    ("obras", "sinapi_regime", "VARCHAR(20) NOT NULL DEFAULT 'ficticio'"),
    ("obras", "excluido_por_id", "VARCHAR(36)"),
]


def atualizar_banco_antigo() -> None:
    inspetor = inspect(engine)
    with engine.begin() as conexao:
        for tabela, coluna, tipo in _COLUNAS_NOVAS:
            if not inspetor.has_table(tabela):
                continue
            existentes = {c["name"] for c in inspetor.get_columns(tabela)}
            if coluna not in existentes:
                conexao.execute(text(f"ALTER TABLE {tabela} ADD COLUMN {coluna} {tipo}"))

# api/app/database.py
from sqlalchemy import create_engine
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

# api/app/models.py
# Mesmas convencoes do banco do aplicativo: id TEXT (UUID) e datas em UTC.

import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


def agora_utc() -> datetime:
    return datetime.now(timezone.utc)


def como_utc(data: datetime | None) -> datetime | None:
    """O SQLite devolve datas sem fuso; o PostgreSQL devolve com. Normaliza
    para UTC para que as comparacoes funcionem nos dois."""
    if data is not None and data.tzinfo is None:
        return data.replace(tzinfo=timezone.utc)
    return data


def novo_id() -> str:
    return str(uuid.uuid4())


class Perfil(str, enum.Enum):
  
    master = "master"
    orcamentista = "orcamentista"
    cliente = "cliente"

    desenvolvedor = "desenvolvedor"


class Usuario(Base):
    __tablename__ = "usuarios"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=novo_id)
    nome: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(254), unique=True, index=True)
    # RNF10: so o hash bcrypt (com sal embutido). A senha nunca e gravada.
    senha_hash: Mapped[str] = mapped_column(String(100))
    perfil: Mapped[Perfil] = mapped_column(Enum(Perfil, native_enum=False, length=20))
    ativo: Mapped[bool] = mapped_column(Boolean, default=True)

    # RNF20
    tentativas_falhas: Mapped[int] = mapped_column(Integer, default=0)
    bloqueado_ate: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=agora_utc)
    atualizado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=agora_utc, onupdate=agora_utc
    )


class TokenRenovacao(Base):
    """Cada token de renovacao emitido. Guardar no banco permite revogar
    (logout) e detectar reuso de um token ja trocado."""

    __tablename__ = "tokens_renovacao"

    jti: Mapped[str] = mapped_column(String(36), primary_key=True, default=novo_id)
    usuario_id: Mapped[str] = mapped_column(ForeignKey("usuarios.id"), index=True)
    expira_em: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    revogado: Mapped[bool] = mapped_column(Boolean, default=False)
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=agora_utc)

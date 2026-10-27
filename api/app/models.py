# api/app/models.py
# Mesmas convencoes do banco do aplicativo: id TEXT (UUID) e datas em UTC.

import enum
import uuid
from datetime import date, datetime, timezone

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

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


# --- Obras e orcamento -------------------------------------------------------
# O projeto controla APENAS custo de material. Cada obra tem uma lista de
# insumos (material do SINAPI + quantidade). O preco de cada insumo vem do
# SINAPI no momento em que ele entra na obra e fica guardado (preco_base):
# e o "retrato" contra o qual a depreciacao compara a tabela SINAPI mais nova.
#
# Nada e apagado de verdade (excluido_em), como no banco do aplicativo.


class SinapiPreco(Base):
    """Preco publicado do SINAPI: um registro por UF + regime + mes + codigo.

    regime: 'desonerado' ou 'nao_desonerado' (a Caixa publica as duas tabelas,
    conforme o regime de tributacao da folha), ou 'ficticio' para a tabela de
    exemplo (app/sinapi_dados.py)."""

    __tablename__ = "sinapi_precos"
    __table_args__ = (UniqueConstraint("uf", "regime", "mes_referencia", "codigo"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=novo_id)
    uf: Mapped[str] = mapped_column(String(2), index=True)
    regime: Mapped[str] = mapped_column(String(20), index=True)
    mes_referencia: Mapped[str] = mapped_column(String(7), index=True)  # 'AAAA-MM'
    codigo: Mapped[str] = mapped_column(String(20), index=True)
    descricao: Mapped[str] = mapped_column(String(300))
    unidade: Mapped[str] = mapped_column(String(10))
    classe: Mapped[str | None] = mapped_column(String(80))
    preco: Mapped[float] = mapped_column(Float)


class Obra(Base):
    __tablename__ = "obras"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=novo_id)
    nome: Mapped[str] = mapped_column(String(120))
    cliente: Mapped[str] = mapped_column(String(120), default="")
    local: Mapped[str] = mapped_column(String(200), default="")
    contrato: Mapped[str | None] = mapped_column(String(60))
    responsavel: Mapped[str | None] = mapped_column(String(120))
    situacao: Mapped[str] = mapped_column(String(40), default="Planejamento")
    area_construida_m2: Mapped[float | None] = mapped_column(Float)
    data_inicio: Mapped[date | None] = mapped_column(Date)
    data_termino_prevista: Mapped[date | None] = mapped_column(Date)
    bdi_percentual: Mapped[float] = mapped_column(Float, default=0)

    # Tabela SINAPI da obra: UF, regime e o mes mais recente na criacao.
    # Todos os precos da obra (e a depreciacao) usam essa UF e esse regime.
    sinapi_uf: Mapped[str] = mapped_column(String(2))
    sinapi_regime: Mapped[str] = mapped_column(String(20))
    sinapi_mes_referencia: Mapped[str] = mapped_column(String(7))

    criado_por_id: Mapped[str | None] = mapped_column(ForeignKey("usuarios.id"))
    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=agora_utc)
    atualizado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=agora_utc, onupdate=agora_utc
    )
    # Apagar obra e exclusao logica: some do app para todos, mas o registro
    # fica (auditoria). Nao ha "desfazer" no app.
    excluido_em: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    excluido_por_id: Mapped[str | None] = mapped_column(ForeignKey("usuarios.id"))

    insumos: Mapped[list["ObraInsumo"]] = relationship(back_populates="obra")


class ObraInsumo(Base):
    """Um material na obra. Descricao, unidade e classe sao copiadas do SINAPI
    para a obra continuar legivel mesmo se a tabela mudar."""

    __tablename__ = "obra_insumos"
    __table_args__ = (UniqueConstraint("obra_id", "codigo"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=novo_id)
    obra_id: Mapped[str] = mapped_column(ForeignKey("obras.id"), index=True)
    codigo: Mapped[str] = mapped_column(String(20))
    descricao: Mapped[str] = mapped_column(String(300))
    unidade: Mapped[str] = mapped_column(String(10))
    classe: Mapped[str | None] = mapped_column(String(80))
    quantidade: Mapped[float] = mapped_column(Float)

    # Retrato: preco SINAPI quando o insumo entrou na obra e o mes desse preco.
    preco_base: Mapped[float] = mapped_column(Float)
    mes_preco_base: Mapped[str] = mapped_column(String(7))

    criado_em: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=agora_utc)
    atualizado_em: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=agora_utc, onupdate=agora_utc
    )
    excluido_em: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    obra: Mapped[Obra] = relationship(back_populates="insumos")

# api/app/schemas.py
# Formato dos dados que entram e saem da API (validados pelo Pydantic).

from datetime import date
from typing import Literal

from pydantic import BaseModel, Field

from .models import Perfil


class LoginEntrada(BaseModel):
    email: str = Field(min_length=3, max_length=254)
    senha: str = Field(min_length=1, max_length=128)


class RenovarEntrada(BaseModel):
    token_renovacao: str


class UsuarioSaida(BaseModel):
    id: str
    nome: str
    email: str
    perfil: Perfil
    permissoes: list[str]


class TokensSaida(BaseModel):
    token_acesso: str
    token_renovacao: str
    tipo: str = "bearer"
    expira_em_segundos: int
    usuario: UsuarioSaida


# --- Obras ---------------------------------------------------------------------


class InsumoEntrada(BaseModel):
    """Material do SINAPI (pelo codigo) e a quantidade, na unidade dele.
    O preco nao e informado: vem sempre do SINAPI."""

    codigo: str = Field(min_length=1, max_length=20)
    quantidade: float = Field(gt=0)


class QuantidadeEntrada(BaseModel):
    quantidade: float = Field(gt=0)


class ExcluirObraEntrada(BaseModel):
    """Confirmacao para apagar: o nome da obra digitado e a senha do usuario."""

    nome_confirmacao: str = Field(max_length=120)
    senha: str = Field(default="", max_length=128)


class ObraEntrada(BaseModel):
    nome: str = Field(min_length=1, max_length=120)
    cliente: str = Field(default="", max_length=120)
    local: str = Field(default="", max_length=200)
    contrato: str | None = Field(default=None, max_length=60)
    responsavel: str | None = Field(default=None, max_length=120)
    situacao: str = Field(default="Planejamento", max_length=40)
    area_construida_m2: float | None = Field(default=None, gt=0)
    data_inicio: date | None = None
    data_termino_prevista: date | None = None
    bdi_percentual: float = Field(default=0, ge=0, le=100)
    uf: str = Field(default="MA", min_length=2, max_length=2)
    # Sem regime, a API usa o padrao da configuracao (SINAPI_REGIME_PADRAO).
    regime: Literal["desonerado", "nao_desonerado"] | None = None
    insumos: list[InsumoEntrada] = []


class ResumoSaida(BaseModel):
    custo_material: float
    custo_material_com_bdi: float
    qtd_insumos: int
    qtd_categorias: int


class ObraSaida(BaseModel):
    id: str
    nome: str
    cliente: str
    local: str
    contrato: str | None
    responsavel: str | None
    situacao: str
    area_construida_m2: float | None
    data_inicio: date | None
    data_termino_prevista: date | None
    bdi_percentual: float
    sinapi_uf: str
    sinapi_regime: str
    sinapi_mes_referencia: str
    resumo: ResumoSaida


class InsumoSaida(BaseModel):
    id: str
    codigo: str
    descricao: str
    unidade: str
    categoria: str | None
    quantidade: float
    preco_unitario: float
    mes_preco: str
    custo: float
    participacao: float


class SinapiInsumoSaida(BaseModel):
    codigo: str
    descricao: str
    unidade: str
    classe: str | None
    preco: float
    mes_referencia: str
    # So na busca: 0 a 1, quanto o item combina com o texto digitado.
    semelhanca: float | None = None

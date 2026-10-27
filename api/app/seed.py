# api/app/seed.py
# Usuarios de TESTE, um por perfil. Criados so em desenvolvimento (AMBIENTE),
# e apenas os que ainda nao existem (pelo e-mail): adicionar um usuario novo
# aqui faz ele aparecer no proximo inicio da API, sem apagar o banco.
# Nunca use estas senhas fora do ambiente de desenvolvimento.

from datetime import date

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from . import sinapi_dados
from .config import AMBIENTE
from .models import Obra, ObraInsumo, Perfil, SinapiPreco, Usuario
from .orcamento import preco_vigente
from .seguranca import gerar_hash

USUARIOS_TESTE = [
    {"nome": "Gestor de Teste", "email": "master@teste.com", "senha": "Master@123", "perfil": Perfil.master},
    {"nome": "Orçamentista de Teste", "email": "orcamento@teste.com", "senha": "Orcamento@123", "perfil": Perfil.orcamentista},
    {"nome": "Cliente de Teste", "email": "cliente@teste.com", "senha": "Cliente@123", "perfil": Perfil.cliente},
    {"nome": "Desenvolvedor", "email": "dev@teste.com", "senha": "Dev@12345", "perfil": Perfil.desenvolvedor},
]


def criar_usuarios_teste(sessao: Session) -> None:
    if AMBIENTE != "desenvolvimento":
        return
    existentes = set(sessao.scalars(select(Usuario.email)).all())
    for dados in USUARIOS_TESTE:
        if dados["email"] in existentes:
            continue
        sessao.add(
            Usuario(
                nome=dados["nome"],
                email=dados["email"],
                senha_hash=gerar_hash(dados["senha"]),
                perfil=dados["perfil"],
            )
        )
    sessao.commit()


# --- SINAPI e obra de exemplo ------------------------------------------------


def popular_sinapi(sessao: Session) -> None:
    """Tabela SINAPI ficticia (app/sinapi_dados.py), com regime 'ficticio',
    so se ainda nao estiver no banco. Fica separada das tabelas reais
    importadas (app/importar_sinapi.py): obras novas usam a real quando houver."""
    uf = sinapi_dados.UF
    existe = select(func.count()).select_from(SinapiPreco).where(
        SinapiPreco.uf == uf, SinapiPreco.regime == "ficticio"
    )
    if sessao.scalar(existe):
        return
    for codigo, descricao, unidade, classe, precos in sinapi_dados.INSUMOS:
        for mes, preco in zip(sinapi_dados.MESES, precos):
            if preco is None:
                continue
            sessao.add(
                SinapiPreco(
                    uf=uf,
                    regime="ficticio",
                    mes_referencia=mes,
                    codigo=codigo,
                    descricao=descricao,
                    unidade=unidade,
                    classe=classe,
                    preco=preco,
                )
            )
    sessao.commit()


# Quantidades da "Casa A" do app (antes por servico, aqui ja somadas por material).
OBRA_EXEMPLO = {
    "nome": "Casa A",
    "cliente": "Particular",
    "local": "Cohama, São Luís - MA",
    "contrato": "CT-2026/014",
    "responsavel": "Vinicius Salgado",
    "situacao": "Em execução",
    "area_construida_m2": 128.5,
    "data_inicio": date(2026, 6, 1),
    "data_termino_prevista": date(2027, 2, 28),
    "bdi_percentual": 22.5,
}
INSUMOS_EXEMPLO = {
    "MAT-0001": 407.4,
    "MAT-0002": 208.32,
    "MAT-0003": 52.1,
    "MAT-0004": 25.83,
    "MAT-0005": 2475,
    "MAT-0006": 418,
    "MAT-0007": 65.75,
    "MAT-0008": 80.85,
    "MAT-0009": 44.1,
    "MAT-0010": 9240,
    "MAT-0011": 132,
    "MAT-0012": 31.5,
    "MAT-0013": 37.8,
    "MAT-0014": 16.07,
}


def criar_obra_exemplo(sessao: Session) -> None:
    """Obra de exemplo, so em desenvolvimento e com o banco sem obras.
    Usa o PRIMEIRO mes da tabela, como se tivesse sido criada meses atras:
    assim a depreciacao ja tem variacao para mostrar."""
    if AMBIENTE != "desenvolvimento" or sessao.scalar(select(func.count()).select_from(Obra)):
        return
    uf, mes = sinapi_dados.UF, sinapi_dados.MESES[0]
    obra = Obra(**OBRA_EXEMPLO, sinapi_uf=uf, sinapi_regime="ficticio", sinapi_mes_referencia=mes)
    sessao.add(obra)
    for codigo, quantidade in INSUMOS_EXEMPLO.items():
        preco = preco_vigente(sessao, uf, "ficticio", codigo, mes)
        sessao.add(
            ObraInsumo(
                obra=obra,
                codigo=codigo,
                descricao=preco.descricao,
                unidade=preco.unidade,
                classe=preco.classe,
                quantidade=quantidade,
                preco_base=preco.preco,
                mes_preco_base=preco.mes_referencia,
            )
        )
    sessao.commit()

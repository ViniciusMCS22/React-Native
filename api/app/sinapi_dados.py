# api/app/sinapi_dados.py
# Tabela SINAPI-MA FICTICIA (a mesma que o app usava no banco local), com
# cinco meses de referencia para simular a variacao de precos ao longo da obra.
# Os codigos seguem o catalogo do app (MAT-xxxx), nao os codigos reais.
#
# Quando a importacao das planilhas da Caixa existir, ela preenche a tabela
# `sinapi_precos` com os dados reais e este arquivo deixa de ser usado.
#
# Cada insumo: (codigo, descricao, unidade, classe, precos na ordem de MESES).
# None = sem preco publicado naquele mes (vale o ultimo preco conhecido).

UF = "MA"

MESES = ["2026-05", "2026-06", "2026-07", "2026-08", "2026-09"]

INSUMOS = [
    ("MAT-0001", "Cimento Portland CP II-E-32, saco 50 kg", "sc", "Aglomerantes", [38, 38.6, 39.4, 40.1, 40.5]),
    ("MAT-0002", "Cal hidratada CH-III, saco 20 kg", "sc", "Aglomerantes", [16.5, 16.5, 16.8, 17.1, 17.2]),
    ("MAT-0003", "Areia média lavada", "m3", "Agregados", [118, 121, 125, 129, 132]),
    ("MAT-0004", "Brita 1", "m3", "Agregados", [105, 105, 106.5, 108, 108]),
    ("MAT-0005", "Aço CA-50, 10,0 mm, vergalhão", "kg", "Aço", [6.4, 6.3, 6.2, 6.1, 6.05]),
    ("MAT-0006", "Aço CA-60, 5,0 mm, vergalhão", "kg", "Aço", [6.9, 6.85, 6.75, 6.7, 6.62]),
    ("MAT-0007", "Arame recozido 18 BWG", "kg", "Aço", [14.2, 14.2, 14.1, 14, 13.9]),
    ("MAT-0008", "Chapa de compensado resinado 12 mm", "m2", "Madeira", [32, 32.5, 33.1, 33.6, 34.2]),
    ("MAT-0009", "Prego 17x27 com cabeça", "kg", "Madeira", [17.5, 17.5, 17.8, 17.8, None]),
    ("MAT-0010", "Bloco cerâmico vedação 9x19x19 cm", "un", "Alvenaria", [1.1, 1.12, 1.14, 1.16, 1.18]),
    ("MAT-0011", "Piso cerâmico PEI-4, 45x45 cm", "m2", "Revestimentos", [39.9, 39.9, 38.9, 38.5, 38.5]),
    ("MAT-0012", "Argamassa colante AC-I, saco 20 kg", "sc", "Revestimentos", [22, 22.4, 22.4, 22.9, 23.1]),
    ("MAT-0013", "Rejunte cimentício", "kg", "Revestimentos", [4.8, 4.8, 4.9, 4.9, 5]),
    ("MAT-0014", "Tinta acrílica fosca, lata 18 L", "lt", "Pintura", [289, 289, 295, 299, 305]),
]

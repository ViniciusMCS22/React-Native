// src/data/sinapiMA.js
// Tabela SINAPI-MA FICTICIA, com cinco meses de referencia, para simular a
// variacao de precos ao longo da obra. Os codigos seguem o catalogo do app
// (MAT-xxxx), nao os codigos reais do SINAPI.
//
// Quando a API existir, ela preenche a tabela `sinapi_precos` com os dados
// reais e este arquivo deixa de ser usado.
//
// `precos` segue a ordem de `meses`. `null` = sem preco publicado naquele mes
// (o app usa o ultimo preco conhecido).

export const sinapiMA = {
  uf: 'MA',
  meses: ['2026-05', '2026-06', '2026-07', '2026-08', '2026-09'],
  insumos: [
    { codigo: 'MAT-0001', descricao: 'Cimento Portland CP II-E-32, saco 50 kg', unidade: 'sc', classe: 'Aglomerantes', precos: [38.0, 38.6, 39.4, 40.1, 40.5] },
    { codigo: 'MAT-0002', descricao: 'Cal hidratada CH-III, saco 20 kg', unidade: 'sc', classe: 'Aglomerantes', precos: [16.5, 16.5, 16.8, 17.1, 17.2] },
    { codigo: 'MAT-0003', descricao: 'Areia media lavada', unidade: 'm3', classe: 'Agregados', precos: [118.0, 121.0, 125.0, 129.0, 132.0] },
    { codigo: 'MAT-0004', descricao: 'Brita 1', unidade: 'm3', classe: 'Agregados', precos: [105.0, 105.0, 106.5, 108.0, 108.0] },
    { codigo: 'MAT-0005', descricao: 'Aco CA-50, 10,0 mm, vergalhao', unidade: 'kg', classe: 'Aco', precos: [6.4, 6.3, 6.2, 6.1, 6.05] },
    { codigo: 'MAT-0006', descricao: 'Aco CA-60, 5,0 mm, vergalhao', unidade: 'kg', classe: 'Aco', precos: [6.9, 6.85, 6.75, 6.7, 6.62] },
    { codigo: 'MAT-0007', descricao: 'Arame recozido 18 BWG', unidade: 'kg', classe: 'Aco', precos: [14.2, 14.2, 14.1, 14.0, 13.9] },
    { codigo: 'MAT-0008', descricao: 'Chapa de compensado resinado 12 mm', unidade: 'm2', classe: 'Madeira', precos: [32.0, 32.5, 33.1, 33.6, 34.2] },
    { codigo: 'MAT-0009', descricao: 'Prego 17x27 com cabeca', unidade: 'kg', classe: 'Madeira', precos: [17.5, 17.5, 17.8, 17.8, null] },
    { codigo: 'MAT-0010', descricao: 'Bloco ceramico vedacao 9x19x19 cm', unidade: 'un', classe: 'Alvenaria', precos: [1.1, 1.12, 1.14, 1.16, 1.18] },
    { codigo: 'MAT-0011', descricao: 'Piso ceramico PEI-4, 45x45 cm', unidade: 'm2', classe: 'Revestimentos', precos: [39.9, 39.9, 38.9, 38.5, 38.5] },
    { codigo: 'MAT-0012', descricao: 'Argamassa colante AC-I, saco 20 kg', unidade: 'sc', classe: 'Revestimentos', precos: [22.0, 22.4, 22.4, 22.9, 23.1] },
    { codigo: 'MAT-0013', descricao: 'Rejunte cimenticio', unidade: 'kg', classe: 'Revestimentos', precos: [4.8, 4.8, 4.9, 4.9, 5.0] },
    { codigo: 'MAT-0014', descricao: 'Tinta acrilica fosca, lata 18 L', unidade: 'lt', classe: 'Pintura', precos: [289.0, 289.0, 295.0, 299.0, 305.0] },
  ],
};

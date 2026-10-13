// src/data/obras.js
// Dados FICTICIOS para popular o banco na primeira abertura do app.
// Coeficientes sao ilustrativos. Os precos vem da tabela SINAPI-MA ficticia
// (src/data/sinapiMA.js). Some quando a importacao de XLSX/CSV existir.
//
// Somente MATERIAL: nao ha mao de obra, equipamento, transporte nem encargos.
// O cimento aparece em varios servicos de proposito (cenario de demonstracao
// do item 8: "identificar cimento em varios servicos").

export const obraExemplo = {
  // Obs.: se alterar este arquivo depois do primeiro uso, apague os dados do
  // app (ou desinstale do celular / limpe o Expo Go) para o seed rodar de novo.
  // A obra de exemplo e criada com a referencia SINAPI de 05/2026, simulando
  // uma obra cadastrada meses atras (ver seed.js).
  obra: {
    id: 'obra-001',
    nome: 'Casa A',
    cliente: 'Particular',
    local: 'Cohama, São Luís - MA',
    contrato: 'CT-2026/014',
    responsavel: 'Vinicius Salgado',
    situacao: 'Em execução',
    area_construida_m2: 128.5,
    data_inicio: '2026-06-01',
    data_termino_prevista: '2027-02-28',
  },

  orcamento: {
    id: 'orc-001',
    versao: 1,
    descricao: 'Orçamento-base de materiais',
    bdi_percentual: 22.5,
    // data-base, fonte e precos NAO ficam aqui: saem da tabela SINAPI-MA
    // (src/data/sinapiMA.js) no momento em que criarObra() roda.
  },

  // materiais: [codigo do insumo, coeficiente por unidade do servico, perda %]
  servicos: [
    {
      etapa: '1. Fundação', item: '1.1', codigo: 'SRV-1010', unidade: 'm3', quantidade: 12,
      descricao: 'Concreto fck 25 MPa preparado em obra - fundação',
      materiais: [['MAT-0001', 7.2, 5], ['MAT-0003', 0.62, 10], ['MAT-0004', 0.82, 5]],
    },
    {
      etapa: '1. Fundação', item: '1.2', codigo: 'SRV-1020', unidade: 'kg', quantidade: 850,
      descricao: 'Armação aço CA-50 - fundação',
      materiais: [['MAT-0005', 1.0, 10], ['MAT-0007', 0.025, 0]],
    },
    {
      etapa: '2. Estrutura', item: '2.1', codigo: 'SRV-2010', unidade: 'm3', quantidade: 18,
      descricao: 'Concreto fck 25 MPa preparado em obra - pilares e vigas',
      materiais: [['MAT-0001', 7.2, 5], ['MAT-0003', 0.62, 10], ['MAT-0004', 0.82, 5]],
    },
    {
      etapa: '2. Estrutura', item: '2.2', codigo: 'SRV-2020', unidade: 'kg', quantidade: 1400,
      descricao: 'Armação aço CA-50 - pilares e vigas',
      materiais: [['MAT-0005', 1.0, 10], ['MAT-0007', 0.025, 0]],
    },
    {
      etapa: '2. Estrutura', item: '2.3', codigo: 'SRV-2030', unidade: 'kg', quantidade: 380,
      descricao: 'Armação aço CA-60 - estribos',
      materiais: [['MAT-0006', 1.0, 10], ['MAT-0007', 0.025, 0]],
    },
    {
      etapa: '2. Estrutura', item: '2.4', codigo: 'SRV-2040', unidade: 'm2', quantidade: 210,
      descricao: 'Forma em chapa de compensado resinado',
      materiais: [['MAT-0008', 0.35, 10], ['MAT-0009', 0.2, 5]],
    },
    {
      etapa: '3. Alvenaria', item: '3.1', codigo: 'SRV-3010', unidade: 'm2', quantidade: 320,
      descricao: 'Alvenaria de vedação em bloco cerâmico 9x19x19 cm',
      materiais: [['MAT-0010', 27.5, 5], ['MAT-0001', 0.045, 5], ['MAT-0002', 0.12, 5], ['MAT-0003', 0.013, 10]],
    },
    {
      etapa: '4. Revestimento', item: '4.1', codigo: 'SRV-4010', unidade: 'm2', quantidade: 640,
      descricao: 'Chapisco em paredes, traço 1:3',
      materiais: [['MAT-0001', 0.05, 5], ['MAT-0003', 0.005, 10]],
    },
    {
      etapa: '4. Revestimento', item: '4.2', codigo: 'SRV-4020', unidade: 'm2', quantidade: 640,
      descricao: 'Reboco (massa única) em paredes, e = 2 cm',
      materiais: [['MAT-0001', 0.14, 5], ['MAT-0002', 0.25, 5], ['MAT-0003', 0.025, 10]],
    },
    {
      etapa: '5. Pisos', item: '5.1', codigo: 'SRV-5010', unidade: 'm2', quantidade: 120,
      descricao: 'Contrapiso em argamassa, e = 4 cm',
      materiais: [['MAT-0001', 0.3, 5], ['MAT-0003', 0.045, 10]],
    },
    {
      etapa: '5. Pisos', item: '5.2', codigo: 'SRV-5020', unidade: 'm2', quantidade: 120,
      descricao: 'Piso cerâmico 45x45 cm assentado com argamassa colante',
      materiais: [['MAT-0011', 1.0, 10], ['MAT-0012', 0.25, 5], ['MAT-0013', 0.3, 5]],
    },
    {
      etapa: '6. Pintura', item: '6.1', codigo: 'SRV-6010', unidade: 'm2', quantidade: 900,
      descricao: 'Pintura acrílica em paredes, duas demãos',
      materiais: [['MAT-0014', 0.017, 5]],
    },
  ],
};

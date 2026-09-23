// src/repositories/obrasRepositorio.js
// Todo acesso a dados de obra/orcamento passa por aqui. As telas nunca
// escrevem SQL. Quando a API existir, basta trocar a implementacao destas
// funcoes (ou ler do SQLite e sincronizar em segundo plano) sem mexer nas telas.
//
// Regras de calculo (somente material):
//   quantidade planejada = quantidade do servico x coeficiente x (1 + perda/100)
//   custo previsto       = quantidade planejada x preco unitario (PP)

const QTD_PLANEJADA = 's.quantidade * si.coeficiente * (1 + si.perda_percentual / 100.0)';

export async function listarObras(db) {
  return db.getAllAsync(
    `SELECT o.*,
            orc.id AS orcamento_id,
            COALESCE((
              SELECT SUM(${QTD_PLANEJADA} * si.preco_unitario)
                FROM servicos s
                JOIN servico_insumos si ON si.servico_id = s.id AND si.excluido_em IS NULL
               WHERE s.orcamento_id = orc.id AND s.excluido_em IS NULL
            ), 0) AS material_previsto
       FROM obras o
       LEFT JOIN orcamentos orc
              ON orc.obra_id = o.id AND orc.vigente = 1 AND orc.excluido_em IS NULL
      WHERE o.excluido_em IS NULL
      ORDER BY o.nome`
  );
}

export async function buscarObra(db, obraId) {
  return db.getFirstAsync(
    'SELECT * FROM obras WHERE id = ? AND excluido_em IS NULL',
    [obraId]
  );
}

// Cabecalho do orcamento vigente + totais de material.
export async function buscarResumoOrcamento(db, obraId) {
  const orcamento = await db.getFirstAsync(
    `SELECT * FROM orcamentos
      WHERE obra_id = ? AND vigente = 1 AND excluido_em IS NULL
      ORDER BY versao DESC LIMIT 1`,
    [obraId]
  );
  if (!orcamento) return null;

  const totais = await db.getFirstAsync(
    `SELECT COALESCE(SUM(${QTD_PLANEJADA} * si.preco_unitario), 0) AS custo_material,
            COUNT(DISTINCT s.id)          AS qtd_servicos,
            COUNT(DISTINCT si.insumo_id)  AS qtd_materiais,
            COUNT(DISTINCT s.etapa)       AS qtd_etapas
       FROM servicos s
       LEFT JOIN servico_insumos si ON si.servico_id = s.id AND si.excluido_em IS NULL
      WHERE s.orcamento_id = ? AND s.excluido_em IS NULL`,
    [orcamento.id]
  );

  const custoMaterial = totais?.custo_material ?? 0;
  return {
    ...orcamento,
    custo_material: custoMaterial,
    custo_material_com_bdi: custoMaterial * (1 + orcamento.bdi_percentual / 100),
    qtd_servicos: totais?.qtd_servicos ?? 0,
    qtd_materiais: totais?.qtd_materiais ?? 0,
    qtd_etapas: totais?.qtd_etapas ?? 0,
  };
}

// Lista detalhada por servico: cada servico com os materiais da composicao.
// Retorna no formato de secoes do <SectionList>.
export async function listarServicosComMateriais(db, orcamentoId) {
  const linhas = await db.getAllAsync(
    `SELECT s.id AS servico_id, s.etapa, s.item, s.codigo AS servico_codigo,
            s.descricao AS servico_descricao, s.unidade AS servico_unidade,
            s.quantidade AS servico_quantidade,
            si.id AS id, i.id AS insumo_id, i.codigo, i.descricao, i.unidade,
            si.coeficiente, si.perda_percentual, si.preco_unitario,
            ${QTD_PLANEJADA} AS quantidade_planejada,
            ${QTD_PLANEJADA} * si.preco_unitario AS custo_previsto
       FROM servicos s
       JOIN servico_insumos si ON si.servico_id = s.id AND si.excluido_em IS NULL
       JOIN insumos i ON i.id = si.insumo_id AND i.excluido_em IS NULL
      WHERE s.orcamento_id = ? AND s.excluido_em IS NULL
      ORDER BY s.item, custo_previsto DESC`,
    [orcamentoId]
  );

  const secoes = [];
  let atual = null;
  for (const l of linhas) {
    if (!atual || atual.servicoId !== l.servico_id) {
      atual = {
        servicoId: l.servico_id,
        etapa: l.etapa,
        item: l.item,
        codigo: l.servico_codigo,
        descricao: l.servico_descricao,
        unidade: l.servico_unidade,
        quantidade: l.servico_quantidade,
        custoPrevisto: 0,
        data: [],
      };
      secoes.push(atual);
    }
    atual.custoPrevisto += l.custo_previsto;
    atual.data.push(l);
  }
  return secoes;
}

// Lista consolidada por material: soma o mesmo insumo em todos os servicos
// (criterio de aceite 7.4: "consolidar a quantidade de um insumo presente em
// varias composicoes"). Ordenada pelo custo, do maior para o menor (base da
// curva ABC).
export async function listarMateriaisConsolidados(db, orcamentoId) {
  const linhas = await db.getAllAsync(
    `SELECT i.id, i.codigo, i.descricao, i.unidade, i.categoria,
            SUM(${QTD_PLANEJADA})                     AS quantidade_planejada,
            SUM(${QTD_PLANEJADA} * si.preco_unitario) AS custo_previsto,
            COUNT(DISTINCT s.id)                      AS qtd_servicos,
            MIN(si.preco_unitario)                    AS preco_min,
            MAX(si.preco_unitario)                    AS preco_max
       FROM insumos i
       JOIN servico_insumos si ON si.insumo_id = i.id AND si.excluido_em IS NULL
       JOIN servicos s ON s.id = si.servico_id AND s.excluido_em IS NULL
      WHERE s.orcamento_id = ? AND i.excluido_em IS NULL
      GROUP BY i.id
      ORDER BY custo_previsto DESC`,
    [orcamentoId]
  );

  const total = linhas.reduce((soma, l) => soma + l.custo_previsto, 0);
  let acumulado = 0;
  return linhas.map((l) => {
    acumulado += l.custo_previsto;
    return {
      ...l,
      // Preco medio ponderado de referencia (se o mesmo insumo tiver PP
      // diferente em composicoes diferentes, a media respeita as quantidades).
      preco_medio: l.quantidade_planejada > 0 ? l.custo_previsto / l.quantidade_planejada : 0,
      participacao: total > 0 ? l.custo_previsto / total : 0,
      participacao_acumulada: total > 0 ? acumulado / total : 0,
    };
  });
}

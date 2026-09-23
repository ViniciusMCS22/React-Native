// src/repositories/depreciacaoRepositorio.js
// Compara o retrato de precos guardado na criacao da obra com a tabela
// SINAPI mais recente da mesma UF.
//
//   valor base  = soma(quantidade planejada x preco-base do retrato)
//   valor atual = soma(quantidade planejada x preco SINAPI atual)
//   indice      = valor atual / valor base
//
// indice > 100%: o mesmo material hoje custa mais -> perda (orcamento defasado).
// indice < 100%: o mesmo material hoje custa menos -> ganho.
//
// So preco muda aqui; as quantidades sao as do orcamento. Efeito quantidade
// (consumo real) entra quando existirem compras/consumo registrados.

import { ultimoMesSinapi, listarHistoricoPrecos } from './sinapiRepositorio';

const QTD_PLANEJADA = 's.quantidade * si.coeficiente * (1 + si.perda_percentual / 100.0)';

// Abaixo disso (0,05%) a variacao e tratada como estavel.
const TOLERANCIA = 0.0005;

export function classificarVariacao(fracao, temPreco = true) {
  if (!temPreco) return 'semPreco';
  if (fracao > TOLERANCIA) return 'perda';
  if (fracao < -TOLERANCIA) return 'ganho';
  return 'estavel';
}

// Preco vigente num mes a partir do historico ordenado (ultimo <= mes).
function precoEm(historico, mes) {
  let achado = null;
  for (const h of historico) {
    if (h.mes_referencia <= mes) achado = h;
    else break;
  }
  return achado;
}

export async function calcularDepreciacao(db, orcamentoId) {
  const orcamento = await db.getFirstAsync(
    'SELECT id, sinapi_uf, sinapi_mes_referencia FROM orcamentos WHERE id = ?',
    [orcamentoId]
  );
  if (!orcamento?.sinapi_uf || !orcamento?.sinapi_mes_referencia) return null;

  const uf = orcamento.sinapi_uf;
  const mesBase = orcamento.sinapi_mes_referencia;
  const mesAtual = await ultimoMesSinapi(db, uf);
  if (!mesAtual) return null;

  // Quantidade total de cada material + preco-base do retrato.
  const linhas = await db.getAllAsync(
    `SELECT i.id AS insumo_id, i.codigo, i.descricao, i.unidade,
            SUM(${QTD_PLANEJADA}) AS quantidade,
            pb.preco_unitario     AS preco_base,
            pb.mes_referencia     AS mes_preco_base
       FROM servicos s
       JOIN servico_insumos si ON si.servico_id = s.id AND si.excluido_em IS NULL
       JOIN insumos i ON i.id = si.insumo_id
       LEFT JOIN orcamento_precos_base pb
              ON pb.orcamento_id = s.orcamento_id AND pb.insumo_id = i.id
      WHERE s.orcamento_id = ? AND s.excluido_em IS NULL
      GROUP BY i.id`,
    [orcamentoId]
  );

  const historico = await listarHistoricoPrecos(
    db, uf, linhas.map((l) => l.codigo), mesAtual
  );
  const historicoPorCodigo = {};
  for (const h of historico) {
    if (!historicoPorCodigo[h.codigo]) historicoPorCodigo[h.codigo] = [];
    historicoPorCodigo[h.codigo].push(h);
  }

  // Materiais sem preco-base (nao estavam no retrato) ficam fora da conta.
  const comBase = linhas.filter((l) => l.preco_base !== null && l.preco_base !== undefined);

  const itens = comBase.map((l) => {
    const atual = precoEm(historicoPorCodigo[l.codigo] ?? [], mesAtual);
    const temPreco = !!atual;
    const precoAtual = temPreco ? atual.preco : l.preco_base;
    const valorBase = l.quantidade * l.preco_base;
    const valorAtual = l.quantidade * precoAtual;
    const fracao = l.preco_base > 0 ? precoAtual / l.preco_base - 1 : 0;
    return {
      id: l.insumo_id,
      codigo: l.codigo,
      descricao: l.descricao,
      unidade: l.unidade,
      quantidade: l.quantidade,
      precoBase: l.preco_base,
      precoAtual,
      mesPrecoAtual: atual?.mes_referencia ?? null,
      valorBase,
      valorAtual,
      variacao: valorAtual - valorBase,
      variacaoPercentual: fracao,
      status: classificarVariacao(fracao, temPreco),
    };
  });
  itens.sort((a, b) => Math.abs(b.variacao) - Math.abs(a.variacao));

  const valorBase = itens.reduce((s, i) => s + i.valorBase, 0);
  const valorAtual = itens.reduce((s, i) => s + i.valorAtual, 0);
  const indice = valorBase > 0 ? valorAtual / valorBase : 1;

  // Evolucao mes a mes, do mes-base ate o atual.
  const meses = [...new Set(historico.map((h) => h.mes_referencia))]
    .filter((m) => m >= mesBase)
    .sort();
  const evolucao = meses.map((mes) => {
    const valor = comBase.reduce((s, l) => {
      const p = precoEm(historicoPorCodigo[l.codigo] ?? [], mes);
      return s + l.quantidade * (p ? p.preco : l.preco_base);
    }, 0);
    return { mes, valor, indice: valorBase > 0 ? valor / valorBase : 1 };
  });

  return {
    uf,
    mesBase,
    mesAtual,
    valorBase,
    valorAtual,
    variacao: valorAtual - valorBase,
    indice,
    status: classificarVariacao(indice - 1),
    itens,
    evolucao,
    qtdSemPrecoAtual: itens.filter((i) => i.status === 'semPreco').length,
    qtdForaDoRetrato: linhas.length - comBase.length,
  };
}

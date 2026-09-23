// src/repositories/sinapiRepositorio.js
// Leitura da tabela de precos SINAPI (por UF e mes) e gravacao do retrato
// de precos de um orcamento.

import { gerarId, agoraIso } from '../utils/id';

// Mes mais recente publicado para a UF ('AAAA-MM'), ou null se nao houver.
export async function ultimoMesSinapi(db, uf) {
  const linha = await db.getFirstAsync(
    `SELECT MAX(mes_referencia) AS mes FROM sinapi_precos
      WHERE uf = ? AND excluido_em IS NULL`,
    [uf]
  );
  return linha?.mes ?? null;
}

// Preco vigente de um codigo num mes: o do proprio mes ou, se nao houver
// publicacao naquele mes, o ultimo anterior. Retorna a linha inteira
// (com mes_referencia real do preco) ou null.
export async function precoSinapiNoMes(db, uf, codigo, mes) {
  return db.getFirstAsync(
    `SELECT * FROM sinapi_precos
      WHERE uf = ? AND codigo = ? AND mes_referencia <= ? AND excluido_em IS NULL
      ORDER BY mes_referencia DESC LIMIT 1`,
    [uf, codigo, mes]
  );
}

// Todos os precos (todos os meses) de uma lista de codigos, ate `ateMes`.
export async function listarHistoricoPrecos(db, uf, codigos, ateMes) {
  if (!codigos.length) return [];
  const marcadores = codigos.map(() => '?').join(', ');
  return db.getAllAsync(
    `SELECT codigo, mes_referencia, preco FROM sinapi_precos
      WHERE uf = ? AND mes_referencia <= ? AND excluido_em IS NULL
        AND codigo IN (${marcadores})
      ORDER BY codigo, mes_referencia`,
    [uf, ateMes, ...codigos]
  );
}

// Grava o retrato dos precos SINAPI de todos os insumos do orcamento.
// Chamar dentro de uma transacao. Registros ja existentes nao sao tocados
// (o retrato e imutavel; ha um trigger no banco garantindo isso).
export async function capturarPrecosBase(db, orcamentoId, uf, mes) {
  const insumos = await db.getAllAsync(
    `SELECT DISTINCT i.id, i.codigo
       FROM servico_insumos si
       JOIN servicos s ON s.id = si.servico_id AND s.excluido_em IS NULL
       JOIN insumos i  ON i.id = si.insumo_id
      WHERE s.orcamento_id = ? AND si.excluido_em IS NULL`,
    [orcamentoId]
  );

  const agora = agoraIso();
  const semPreco = [];
  for (const ins of insumos) {
    const preco = await precoSinapiNoMes(db, uf, ins.codigo, mes);
    if (!preco) {
      semPreco.push(ins.codigo);
      continue;
    }
    await db.runAsync(
      `INSERT OR IGNORE INTO orcamento_precos_base
         (id, orcamento_id, insumo_id, codigo, uf, mes_referencia, preco_unitario,
          criado_em, atualizado_em)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [gerarId(), orcamentoId, ins.id, ins.codigo, uf, preco.mes_referencia,
        preco.preco, agora, agora]
    );
  }
  return { semPreco };
}

// src/repositories/insumosRepositorio.js
// Edicao da lista de insumos de um orcamento (aba Insumos).
//
// No banco, material so existe dentro da composicao de um servico. Para
// permitir adicionar um insumo direto, sem escolher servico e coeficiente,
// cada orcamento ganha um servico "Materiais avulsos" com quantidade 1: assim
// o coeficiente e a propria quantidade e os calculos de custo, consolidacao e
// depreciacao continuam valendo sem nenhum caso especial.
//
// Remover e exclusao logica (excluido_em), como no resto do app: o insumo sai
// de todas as composicoes do orcamento, mas o registro continua no banco para
// sincronizacao e auditoria.
//
// Permissao: so quem tem 'orcamentos:editar' (master, orcamentista e
// desenvolvedor). A tela esconde os botoes; hoje esses dados sao locais, entao
// quando a sincronizacao existir a API tambem precisa conferir a permissao.

import { gerarId, agoraIso } from '../utils/id';
import { capturarPrecosBase } from './sinapiRepositorio';

const CODIGO_AVULSO = 'AVULSO';

// Catalogo SINAPI da UF com o preco mais recente de cada codigo. `naObra`
// indica se o insumo ja esta no orcamento.
export async function listarCatalogoSinapi(db, uf, orcamentoId) {
  return db.getAllAsync(
    `SELECT p.codigo, p.descricao, p.unidade, p.classe, p.preco, p.mes_referencia,
            EXISTS (
              SELECT 1
                FROM insumos i
                JOIN servico_insumos si ON si.insumo_id = i.id AND si.excluido_em IS NULL
                JOIN servicos s ON s.id = si.servico_id AND s.excluido_em IS NULL
               WHERE i.codigo = p.codigo AND s.orcamento_id = ?
            ) AS naObra
       FROM sinapi_precos p
      WHERE p.uf = ? AND p.excluido_em IS NULL
        AND p.mes_referencia = (
          SELECT MAX(p2.mes_referencia) FROM sinapi_precos p2
           WHERE p2.uf = p.uf AND p2.codigo = p.codigo AND p2.excluido_em IS NULL
        )
      ORDER BY p.descricao`,
    [orcamentoId, uf]
  );
}

async function garantirInsumo(db, item, agora) {
  const existente = await db.getFirstAsync('SELECT id FROM insumos WHERE codigo = ?', [
    item.codigo,
  ]);
  if (existente) return existente.id;

  const id = `ins-${item.codigo}`;
  await db.runAsync(
    `INSERT INTO insumos (id, codigo, descricao, unidade, tipo, categoria, criado_em, atualizado_em)
     VALUES (?, ?, ?, ?, 'material', ?, ?, ?)`,
    [id, item.codigo, item.descricao, item.unidade, item.classe ?? null, agora, agora]
  );
  return id;
}

async function garantirServicoAvulso(db, orcamentoId, agora) {
  const existente = await db.getFirstAsync(
    `SELECT id FROM servicos
      WHERE orcamento_id = ? AND codigo = ? AND excluido_em IS NULL`,
    [orcamentoId, CODIGO_AVULSO]
  );
  if (existente) return existente.id;

  const id = gerarId();
  await db.runAsync(
    `INSERT INTO servicos (id, orcamento_id, etapa, item, codigo, descricao, unidade,
       quantidade, criado_em, atualizado_em)
     VALUES (?, ?, 'Materiais avulsos', '99', ?, 'Materiais adicionados manualmente', 'vb', 1, ?, ?)`,
    [id, orcamentoId, CODIGO_AVULSO, agora, agora]
  );
  return id;
}

/**
 * Adiciona um insumo do catalogo ao orcamento. Se ele ja estiver entre os
 * avulsos, soma a quantidade e guarda o preco medio ponderado.
 *
 * @param orcamento   linha de `orcamentos` (precisa de id, sinapi_uf, sinapi_mes_referencia)
 * @param item        linha do catalogo ({ codigo, descricao, unidade, classe })
 * @param quantidade  > 0, na unidade do insumo
 * @param precoUnitario >= 0
 */
export async function adicionarInsumo(db, orcamento, item, quantidade, precoUnitario) {
  if (!(quantidade > 0)) throw new Error('Informe uma quantidade maior que zero.');
  if (!(precoUnitario >= 0)) throw new Error('Informe um preço unitário válido.');

  await db.withTransactionAsync(async () => {
    const agora = agoraIso();
    const insumoId = await garantirInsumo(db, item, agora);
    const servicoId = await garantirServicoAvulso(db, orcamento.id, agora);

    // UNIQUE (servico_id, insumo_id): a linha pode existir, ate excluida.
    const atual = await db.getFirstAsync(
      `SELECT id, coeficiente, preco_unitario, excluido_em FROM servico_insumos
        WHERE servico_id = ? AND insumo_id = ?`,
      [servicoId, insumoId]
    );

    if (!atual) {
      await db.runAsync(
        `INSERT INTO servico_insumos (id, servico_id, insumo_id, coeficiente,
           perda_percentual, preco_unitario, criado_em, atualizado_em)
         VALUES (?, ?, ?, ?, 0, ?, ?, ?)`,
        [gerarId(), servicoId, insumoId, quantidade, precoUnitario, agora, agora]
      );
    } else if (atual.excluido_em) {
      await db.runAsync(
        `UPDATE servico_insumos
            SET coeficiente = ?, perda_percentual = 0, preco_unitario = ?,
                excluido_em = NULL, atualizado_em = ?, sync_status = 'pendente'
          WHERE id = ?`,
        [quantidade, precoUnitario, agora, atual.id]
      );
    } else {
      const novaQtd = atual.coeficiente + quantidade;
      const precoMedio =
        (atual.coeficiente * atual.preco_unitario + quantidade * precoUnitario) / novaQtd;
      await db.runAsync(
        `UPDATE servico_insumos
            SET coeficiente = ?, preco_unitario = ?, atualizado_em = ?, sync_status = 'pendente'
          WHERE id = ?`,
        [novaQtd, precoMedio, agora, atual.id]
      );
    }

    // Insumo novo no orcamento tambem precisa de preco-base para a Depreciacao.
    if (orcamento.sinapi_uf && orcamento.sinapi_mes_referencia) {
      await capturarPrecosBase(
        db,
        orcamento.id,
        orcamento.sinapi_uf,
        orcamento.sinapi_mes_referencia
      );
    }
  });
}

// Tira o insumo de todas as composicoes do orcamento (exclusao logica).
export async function removerInsumo(db, orcamentoId, insumoId) {
  const agora = agoraIso();
  await db.runAsync(
    `UPDATE servico_insumos
        SET excluido_em = ?, atualizado_em = ?, sync_status = 'pendente'
      WHERE insumo_id = ? AND excluido_em IS NULL
        AND servico_id IN (SELECT id FROM servicos WHERE orcamento_id = ?)`,
    [agora, agora, insumoId, orcamentoId]
  );
}

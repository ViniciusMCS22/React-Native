// src/database/seed.js
// Dados iniciais do prototipo. Cada funcao so age se ainda nao houver dados,
// entao pode rodar em toda abertura do app sem duplicar nada.

import { sinapiMA } from '../data/sinapiMA';
import { obraExemplo } from '../data/obras';
import { criarObra } from '../services/criarObra';
import { capturarPrecosBase } from '../repositories/sinapiRepositorio';
import { agoraIso } from '../utils/id';

// 1. Tabela SINAPI-MA ficticia (varios meses).
export async function popularSinapiSeVazio(db) {
  const linha = await db.getFirstAsync(
    'SELECT COUNT(*) AS total FROM sinapi_precos WHERE uf = ?',
    [sinapiMA.uf]
  );
  if ((linha?.total ?? 0) > 0) return;

  const agora = agoraIso();
  await db.withTransactionAsync(async () => {
    for (const ins of sinapiMA.insumos) {
      for (let i = 0; i < sinapiMA.meses.length; i++) {
        const preco = ins.precos[i];
        if (preco === null || preco === undefined) continue;
        const mes = sinapiMA.meses[i];
        await db.runAsync(
          `INSERT INTO sinapi_precos (id, uf, mes_referencia, codigo, descricao, unidade,
             classe, preco, criado_em, atualizado_em)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            `sinapi-${sinapiMA.uf}-${mes}-${ins.codigo}`, sinapiMA.uf, mes, ins.codigo,
            ins.descricao, ins.unidade, ins.classe, preco, agora, agora,
          ]
        );
      }
    }
  });
}

// 2. Obra de exemplo, criada pelo mesmo caminho que o app usara no cadastro.
// Usa a referencia do PRIMEIRO mes da tabela para simular uma obra criada
// meses atras; assim a aba Depreciacao ja tem variacao para mostrar.
export async function popularObrasSeVazio(db) {
  const linha = await db.getFirstAsync('SELECT COUNT(*) AS total FROM obras');
  if ((linha?.total ?? 0) > 0) return;

  await criarObra(db, obraExemplo, {
    uf: sinapiMA.uf,
    mesReferencia: sinapiMA.meses[0],
  });
}

// 3. Compatibilidade: orcamentos criados antes da versao 2 do banco nao
// tinham retrato de precos. Usa a data-base deles ('MM/AAAA') para capturar.
export async function garantirPrecosBase(db) {
  const orcamentos = await db.getAllAsync(
    `SELECT o.id, o.data_base, o.sinapi_uf, o.sinapi_mes_referencia
       FROM orcamentos o
      WHERE o.excluido_em IS NULL
        AND NOT EXISTS (SELECT 1 FROM orcamento_precos_base pb WHERE pb.orcamento_id = o.id)`
  );

  for (const orc of orcamentos) {
    const uf = orc.sinapi_uf ?? 'MA';
    let mes = orc.sinapi_mes_referencia;
    if (!mes && /^\d{2}\/\d{4}$/.test(orc.data_base ?? '')) {
      const [m, ano] = orc.data_base.split('/');
      mes = `${ano}-${m}`;
    }
    if (!mes) continue;

    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `UPDATE orcamentos
            SET sinapi_uf = ?, sinapi_mes_referencia = ?, fonte_precos = ?,
                atualizado_em = ?, sync_status = 'pendente'
          WHERE id = ?`,
        [uf, mes, `SINAPI-${uf}`, agoraIso(), orc.id]
      );
      await capturarPrecosBase(db, orc.id, uf, mes);
    });
  }
}

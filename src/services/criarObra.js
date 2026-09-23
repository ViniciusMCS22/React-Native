// src/services/criarObra.js
// Cria uma obra com seu orcamento de material usando a tabela SINAPI da UF.
//
// No momento da criacao:
//   1. escolhe o mes de referencia (o mais recente publicado, por padrao);
//   2. busca o preco SINAPI de cada material nesse mes e usa como preco
//      previsto (PP) das composicoes;
//   3. guarda o RETRATO desses precos em `orcamento_precos_base`.
// Meses depois, a aba Depreciacao compara esse retrato com o SINAPI atual.
//
// Tudo roda numa transacao: ou a obra e criada inteira, ou nada e gravado.

import { gerarId, agoraIso } from '../utils/id';
import {
  ultimoMesSinapi,
  precoSinapiNoMes,
  capturarPrecosBase,
} from '../repositories/sinapiRepositorio';

// '2026-05' -> '05/2026'
function mesParaDataBase(mes) {
  const [ano, m] = mes.split('-');
  return `${m}/${ano}`;
}

/**
 * @param db  conexao expo-sqlite
 * @param dados { obra, orcamento, servicos } (formato de src/data/obras.js)
 * @param opcoes { uf = 'MA', mesReferencia } mesReferencia 'AAAA-MM' opcional
 * @returns { obraId, orcamentoId, uf, mesReferencia }
 */
export async function criarObra(db, dados, opcoes = {}) {
  const { obra, orcamento = {}, servicos = [] } = dados;
  const uf = opcoes.uf ?? 'MA';
  const mes = opcoes.mesReferencia ?? (await ultimoMesSinapi(db, uf));

  if (!obra?.nome) throw new Error('Informe o nome da obra.');
  if (!mes) throw new Error(`Nao ha tabela SINAPI-${uf} carregada no aparelho.`);

  // Valida antes de gravar: todo material precisa ter preco SINAPI no mes.
  const precos = {};
  const faltando = [];
  for (const srv of servicos) {
    for (const [codigo] of srv.materiais) {
      if (precos[codigo] !== undefined) continue;
      const preco = await precoSinapiNoMes(db, uf, codigo, mes);
      if (preco) precos[codigo] = preco;
      else faltando.push(codigo);
    }
  }
  if (faltando.length) {
    throw new Error(
      `Sem preco SINAPI-${uf} em ${mesParaDataBase(mes)} para: ${[...new Set(faltando)].join(', ')}`
    );
  }

  const agora = agoraIso();
  const obraId = obra.id ?? gerarId();
  const orcamentoId = orcamento.id ?? gerarId();

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO obras (id, nome, cliente, local, contrato, responsavel, situacao,
         area_construida_m2, data_inicio, data_termino_prevista, criado_em, atualizado_em)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        obraId, obra.nome, obra.cliente ?? '', obra.local ?? '', obra.contrato ?? null,
        obra.responsavel ?? null, obra.situacao ?? 'Planejamento',
        obra.area_construida_m2 ?? null, obra.data_inicio ?? null,
        obra.data_termino_prevista ?? null, agora, agora,
      ]
    );

    await db.runAsync(
      `INSERT INTO orcamentos (id, obra_id, versao, descricao, data_base, fonte_precos,
         bdi_percentual, vigente, sinapi_uf, sinapi_mes_referencia, criado_em, atualizado_em)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?)`,
      [
        orcamentoId, obraId, orcamento.versao ?? 1,
        orcamento.descricao ?? 'Orcamento-base de materiais',
        mesParaDataBase(mes), `SINAPI-${uf}`, orcamento.bdi_percentual ?? 0,
        uf, mes, agora, agora,
      ]
    );

    // Catalogo de insumos: reaproveita o que ja existe; cria a partir do
    // SINAPI o que ainda nao existe.
    const insumoIds = {};
    for (const codigo of Object.keys(precos)) {
      const existente = await db.getFirstAsync(
        'SELECT id FROM insumos WHERE codigo = ?',
        [codigo]
      );
      if (existente) {
        insumoIds[codigo] = existente.id;
        continue;
      }
      const p = precos[codigo];
      const id = `ins-${codigo}`;
      await db.runAsync(
        `INSERT INTO insumos (id, codigo, descricao, unidade, tipo, categoria, criado_em, atualizado_em)
         VALUES (?, ?, ?, ?, 'material', ?, ?, ?)`,
        [id, codigo, p.descricao, p.unidade, p.classe ?? null, agora, agora]
      );
      insumoIds[codigo] = id;
    }

    for (const srv of servicos) {
      const servicoId = gerarId();
      await db.runAsync(
        `INSERT INTO servicos (id, orcamento_id, etapa, item, codigo, descricao, unidade,
           quantidade, criado_em, atualizado_em)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          servicoId, orcamentoId, srv.etapa, srv.item, srv.codigo, srv.descricao,
          srv.unidade, srv.quantidade, agora, agora,
        ]
      );

      for (const [codigo, coeficiente, perda = 0] of srv.materiais) {
        await db.runAsync(
          `INSERT INTO servico_insumos (id, servico_id, insumo_id, coeficiente,
             perda_percentual, preco_unitario, criado_em, atualizado_em)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            gerarId(), servicoId, insumoIds[codigo], coeficiente, perda,
            precos[codigo].preco, agora, agora,
          ]
        );
      }
    }

    await capturarPrecosBase(db, orcamentoId, uf, mes);
  });

  return { obraId, orcamentoId, uf, mesReferencia: mes };
}

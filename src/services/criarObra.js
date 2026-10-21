

import { gerarId, agoraIso } from '../utils/id';
import {
  ultimoMesSinapi,
  precoSinapiNoMes,
  capturarPrecosBase,
} from '../repositories/sinapiRepositorio';


function mesParaDataBase(mes) {
  const [ano, m] = mes.split('-');
  return `${m}/${ano}`;
}

/**
 * @param db  
 * @param dados 
 * @param opcoes 
 * @returns { obraId, orcamentoId, uf, mesReferencia }
 */
export async function criarObra(db, dados, opcoes = {}) {
  const { obra, orcamento = {}, servicos = [] } = dados;
  const uf = opcoes.uf ?? 'MA';
  const mes = opcoes.mesReferencia ?? (await ultimoMesSinapi(db, uf));

  if (!obra?.nome) throw new Error('Informe o nome da obra.');
  if (!mes) throw new Error(`Não há tabela SINAPI-${uf} carregada no aparelho.`);

  // O material precisa ter um texto SINAPI no mes, preciso testar oque acontece na aplicação se nada for encontrado e se as msg aparecem certas...
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
      `Sem preço SINAPI-${uf} em ${mesParaDataBase(mes)} para: ${[...new Set(faltando)].join(', ')}`
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
        orcamento.descricao ?? 'Orçamento-base de materiais',
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

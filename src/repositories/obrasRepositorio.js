// src/repositories/obrasRepositorio.js
// Todo acesso a obras, insumos e SINAPI passa por aqui. As telas nunca chamam
// a API direto. Os dados vivem na API (api/app/rotas/obras.py); o calculo do
// orcamento e da depreciacao tambem e feito la (api/app/orcamento.py).
//
// Leituras: buscam na API e guardam a resposta no aparelho (cache_api). Sem
// conexao, devolvem a ultima copia com `offline: true` e a data dela.
// Escritas (criar obra, mexer em insumos): so com conexao; sem ela, o erro da
// API ("Nao foi possivel conectar...") chega na tela.

import { requisicao } from '../services/api';
import { gravarCache, lerCache } from './cacheRepositorio';

// Le da API; se nao houver conexao (status 0), usa a ultima copia salva.
async function lerComCache(db, usuarioId, caminho) {
  const chave = `${usuarioId}:${caminho}`;
  try {
    const dados = await requisicao(caminho);
    await gravarCache(db, chave, dados);
    return { dados, offline: false, atualizadoEm: null };
  } catch (e) {
    if (e.status !== 0) throw e;
    const salvo = await lerCache(db, chave);
    if (!salvo) throw e;
    return { dados: salvo.dados, offline: true, atualizadoEm: salvo.atualizadoEm };
  }
}

// Junta varias leituras: offline se qualquer uma veio do cache, e a data da
// copia mais antiga (o dado menos atual que esta na tela).
function juntarOrigem(leituras) {
  const offline = leituras.filter((l) => l?.offline);
  return {
    offline: offline.length > 0,
    atualizadoEm: offline.length ? offline.map((l) => l.atualizadoEm).sort()[0] : null,
  };
}

// Obra da API -> formato das telas. `material_previsto` e o atalho usado
// nas listas.
function converterObra(o) {
  return {
    ...o,
    material_previsto: o.resumo.custo_material,
    resumo: {
      ...o.resumo,
      bdi_percentual: o.bdi_percentual,
      sinapi_uf: o.sinapi_uf,
      sinapi_mes_referencia: o.sinapi_mes_referencia,
    },
  };
}

// Depreciacao da API (snake_case) -> formato dos componentes de variacao
// (camelCase, status iguais as chaves de `variacaoPreco` em theme/cores).
const STATUS = { estavel: 'estavel', perda: 'perda', ganho: 'ganho', sem_preco: 'semPreco' };

function converterDepreciacao(d) {
  if (!d) return null;
  return {
    uf: d.uf,
    mesBase: d.mes_base,
    mesAtual: d.mes_atual,
    valorBase: d.valor_base,
    valorAtual: d.valor_atual,
    variacao: d.variacao,
    indice: d.indice,
    status: STATUS[d.status],
    evolucao: d.evolucao,
    qtdSemPrecoAtual: d.qtd_sem_preco_atual,
    itens: d.itens.map((i) => ({
      id: i.id,
      codigo: i.codigo,
      descricao: i.descricao,
      unidade: i.unidade,
      quantidade: i.quantidade,
      precoBase: i.preco_base,
      mesPrecoBase: i.mes_preco_base,
      precoAtual: i.preco_atual,
      mesPrecoAtual: i.mes_preco_atual,
      valorBase: i.valor_base,
      valorAtual: i.valor_atual,
      variacao: i.variacao,
      variacaoPercentual: i.variacao_percentual,
      status: STATUS[i.status],
    })),
  };
}

// --- Leituras ---------------------------------------------------------------

export async function listarObras(db, usuarioId) {
  const leitura = await lerComCache(db, usuarioId, '/obras');
  return { obras: leitura.dados.map(converterObra), ...juntarOrigem([leitura]) };
}

/**
 * Tudo que as telas de uma obra precisam.
 * @param comInsumos  so quem tem 'orcamentos:ver' pode ler a lista de insumos.
 */
export async function carregarObra(db, usuarioId, obraId, { comInsumos }) {
  const base = `/obras/${encodeURIComponent(obraId)}`;
  const [obra, depreciacao, insumos] = await Promise.all([
    lerComCache(db, usuarioId, base),
    lerComCache(db, usuarioId, `${base}/depreciacao`),
    comInsumos ? lerComCache(db, usuarioId, `${base}/insumos`) : null,
  ]);
  const convertida = converterObra(obra.dados);
  return {
    obra: convertida,
    resumo: convertida.resumo,
    insumos: insumos?.dados ?? [],
    depreciacao: converterDepreciacao(depreciacao.dados),
    ...juntarOrigem([obra, depreciacao, insumos]),
  };
}

// Busca aproximada no SINAPI (feita na API, ver api/app/busca_sinapi.py):
// os materiais mais parecidos com o texto, ja com o preco mais recente.
// So online: o catalogo tem milhares de itens e nao fica no aparelho.
export async function buscarSinapi({ uf, regime, texto, limite = 30 }) {
  // Montado a mao: o URLSearchParams do React Native e incompleto.
  const parametros = Object.entries({ uf, regime, busca: texto, limite })
    .map(([chave, valor]) => `${chave}=${encodeURIComponent(valor)}`)
    .join('&');
  return requisicao(`/sinapi/insumos?${parametros}`);
}

// --- Escritas (precisam de conexao) -------------------------------------------

/** @param dados  campos de ObraEntrada (api/app/schemas.py). */
export async function criarObra(dados) {
  return converterObra(await requisicao('/obras', { metodo: 'POST', corpo: dados }));
}

export async function adicionarInsumo(obraId, codigo, quantidade) {
  return requisicao(`/obras/${encodeURIComponent(obraId)}/insumos`, {
    metodo: 'POST',
    corpo: { codigo, quantidade },
  });
}

export async function alterarQuantidade(obraId, insumoId, quantidade) {
  return requisicao(
    `/obras/${encodeURIComponent(obraId)}/insumos/${encodeURIComponent(insumoId)}`,
    { metodo: 'PATCH', corpo: { quantidade } }
  );
}

export async function removerInsumo(obraId, insumoId) {
  await requisicao(
    `/obras/${encodeURIComponent(obraId)}/insumos/${encodeURIComponent(insumoId)}`,
    { metodo: 'DELETE' }
  );
}

// Apaga a obra para todos (na API e exclusao logica, sem desfazer).
// Exige 'obras:excluir', o nome digitado igual ao da obra e a senha.
export async function excluirObra(obraId, nomeConfirmacao, senha) {
  await requisicao(`/obras/${encodeURIComponent(obraId)}/excluir`, {
    metodo: 'POST',
    corpo: { nome_confirmacao: nomeConfirmacao, senha },
  });
}

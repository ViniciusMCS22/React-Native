// src/repositories/cacheRepositorio.js
// Copia local da ultima resposta de cada leitura da API (tabela cache_api).
// Serve para mostrar dados basicos sem internet; nunca para editar.
//
// A chave inclui o id do usuario: cada perfil ve dados diferentes (o cliente
// nao recebe a lista de insumos), entao um usuario nunca le o cache de outro.

export async function lerCache(db, chave) {
  const linha = await db.getFirstAsync(
    'SELECT valor, atualizado_em FROM cache_api WHERE chave = ?',
    [chave]
  );
  if (!linha) return null;
  try {
    return { dados: JSON.parse(linha.valor), atualizadoEm: linha.atualizado_em };
  } catch {
    return null;
  }
}

export async function gravarCache(db, chave, dados) {
  await db.runAsync(
    `INSERT INTO cache_api (chave, valor, atualizado_em)
     VALUES (?, ?, ?)
     ON CONFLICT (chave) DO UPDATE SET
       valor = excluded.valor,
       atualizado_em = excluded.atualizado_em`,
    [chave, JSON.stringify(dados), new Date().toISOString()]
  );
}

// Ao sair da conta: o proximo usuario do aparelho nao herda nada.
export async function limparCache(db) {
  await db.runAsync('DELETE FROM cache_api');
}

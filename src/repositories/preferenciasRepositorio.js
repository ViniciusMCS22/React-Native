// src/repositories/preferenciasRepositorio.js
// Leitura e gravacao das preferencias do usuario. Cada preferencia e uma linha
// chave/valor; o valor vai em JSON para aceitar booleano, numero ou texto.

export async function lerPreferencias(db) {
  const linhas = await db.getAllAsync('SELECT chave, valor FROM preferencias');
  const resultado = {};
  for (const { chave, valor } of linhas) {
    try {
      resultado[chave] = JSON.parse(valor);
    } catch {
      // Valor corrompido: ignora e deixa o padrao assumir.
    }
  }
  return resultado;
}

export async function salvarPreferencia(db, chave, valor) {
  await db.runAsync(
    `INSERT INTO preferencias (chave, valor, atualizado_em)
     VALUES (?, ?, ?)
     ON CONFLICT (chave) DO UPDATE SET
       valor = excluded.valor,
       atualizado_em = excluded.atualizado_em`,
    [chave, JSON.stringify(valor), new Date().toISOString()]
  );
}

// Apaga as chaves informadas (ou todas, se nenhuma for passada).
export async function apagarPreferencias(db, chaves) {
  if (!chaves) {
    await db.runAsync('DELETE FROM preferencias');
    return;
  }
  if (chaves.length === 0) return;
  const marcadores = chaves.map(() => '?').join(', ');
  await db.runAsync(`DELETE FROM preferencias WHERE chave IN (${marcadores})`, chaves);
}

// src/database/index.js
// Ponto de entrada do banco local. O App passa `inicializarBanco` para o
// <SQLiteProvider onInit>, que roda antes de qualquer tela aparecer.
// Obras e SINAPI vem da API; aqui so ha preferencias e a copia offline.

import { VERSAO_BANCO, migracoes } from './schema';

export const NOME_BANCO = 'gestao-insumos.db';

async function migrar(db) {
  const linha = await db.getFirstAsync('PRAGMA user_version');
  let versaoAtual = linha?.user_version ?? 0;
  if (versaoAtual >= VERSAO_BANCO) return;

  if (versaoAtual === 0) {
    await db.execAsync("PRAGMA journal_mode = 'wal';");
  }

  while (versaoAtual < VERSAO_BANCO) {
    const sql = migracoes[versaoAtual];
    await db.withTransactionAsync(async () => {
      await db.execAsync(sql);
    });
    versaoAtual += 1;
    await db.execAsync(`PRAGMA user_version = ${versaoAtual}`);
  }
}

export async function inicializarBanco(db) {
  // Precisa ser ligado a cada conexao; o SQLite nao guarda essa opcao.
  await db.execAsync('PRAGMA foreign_keys = ON;');
  await migrar(db);
}

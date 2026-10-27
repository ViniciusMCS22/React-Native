// src/database/schema.js
// Estrutura do banco local (SQLite no aparelho).
//
// Desde a v5, obras, insumos e SINAPI vivem na API (api/). O app usa este
// banco so para as preferencias e para a copia offline das respostas da API
// (cache_api). As tabelas de obra abaixo ficaram das versoes anteriores.
//
// Hierarquia antiga (item 4.1 da solicitacao):
//   obra -> orcamento -> servico -> servico_insumos -> insumo
//
// O projeto controla APENAS custo de material. A tabela `insumos` tem um CHECK
// que so aceita tipo = 'material': mao de obra, equipamento, transporte e
// encargos nao entram no banco nem por engano.
//
// Preparacao para API + sincronizacao offline (fase futura):
//   - `id` e TEXT (UUID gerado no aparelho), assim um registro criado offline
//     ja nasce com o mesmo id que tera no servidor, sem conflito.
//   - `criado_em` / `atualizado_em` em ISO-8601 (UTC): a sincronizacao envia
//     tudo que mudou desde a ultima vez e resolve conflito pela data.
//   - `excluido_em`: exclusao logica. Nada e apagado de verdade, para que a
//     exclusao tambem seja sincronizada (e para a trilha de auditoria).
//   - `sync_status`: 'pendente' (ainda nao foi para a API) ou 'sincronizado'.
//
// Toda consulta de leitura deve filtrar `excluido_em IS NULL`.

export const VERSAO_BANCO = 5;

const colunasSync = `
  criado_em      TEXT NOT NULL,
  atualizado_em  TEXT NOT NULL,
  excluido_em    TEXT,
  sync_status    TEXT NOT NULL DEFAULT 'pendente'
                 CHECK (sync_status IN ('pendente', 'sincronizado'))
`;

// Cada posicao do array e uma migracao. A posicao 0 leva o banco da versao 0
// para a 1, a posicao 1 da 1 para a 2, e assim por diante. Nunca edite uma
// migracao que ja foi publicada: crie uma nova no fim do array.
export const migracoes = [
  `
  CREATE TABLE obras (
    id                     TEXT PRIMARY KEY NOT NULL,
    nome                   TEXT NOT NULL,
    cliente                TEXT NOT NULL,
    local                  TEXT NOT NULL,
    contrato               TEXT,
    responsavel            TEXT,
    situacao               TEXT NOT NULL,
    area_construida_m2     REAL,
    data_inicio            TEXT,
    data_termino_prevista  TEXT,
    ${colunasSync}
  );

  CREATE TABLE orcamentos (
    id              TEXT PRIMARY KEY NOT NULL,
    obra_id         TEXT NOT NULL REFERENCES obras(id),
    versao          INTEGER NOT NULL DEFAULT 1,
    descricao       TEXT NOT NULL,
    data_base       TEXT NOT NULL,
    fonte_precos    TEXT NOT NULL,
    bdi_percentual  REAL NOT NULL DEFAULT 0,
    vigente         INTEGER NOT NULL DEFAULT 1 CHECK (vigente IN (0, 1)),
    ${colunasSync}
  );
  CREATE INDEX idx_orcamentos_obra ON orcamentos(obra_id);

  CREATE TABLE insumos (
    id         TEXT PRIMARY KEY NOT NULL,
    codigo     TEXT NOT NULL UNIQUE,
    descricao  TEXT NOT NULL,
    unidade    TEXT NOT NULL,
    tipo       TEXT NOT NULL DEFAULT 'material' CHECK (tipo = 'material'),
    categoria  TEXT,
    ${colunasSync}
  );

  CREATE TABLE servicos (
    id            TEXT PRIMARY KEY NOT NULL,
    orcamento_id  TEXT NOT NULL REFERENCES orcamentos(id),
    etapa         TEXT NOT NULL,
    item          TEXT NOT NULL,
    codigo        TEXT NOT NULL,
    descricao     TEXT NOT NULL,
    unidade       TEXT NOT NULL,
    quantidade    REAL NOT NULL CHECK (quantidade >= 0),
    ${colunasSync}
  );
  CREATE INDEX idx_servicos_orcamento ON servicos(orcamento_id);

  -- Composicao de material de cada servico: quanto de cada insumo entra
  -- em 1 unidade do servico (coeficiente), a perda prevista e o preco
  -- unitario de referencia do orcamento (PP).
  CREATE TABLE servico_insumos (
    id                TEXT PRIMARY KEY NOT NULL,
    servico_id        TEXT NOT NULL REFERENCES servicos(id),
    insumo_id         TEXT NOT NULL REFERENCES insumos(id),
    coeficiente       REAL NOT NULL CHECK (coeficiente > 0),
    perda_percentual  REAL NOT NULL DEFAULT 0 CHECK (perda_percentual >= 0),
    preco_unitario    REAL NOT NULL CHECK (preco_unitario >= 0),
    ${colunasSync},
    UNIQUE (servico_id, insumo_id)
  );
  CREATE INDEX idx_servico_insumos_servico ON servico_insumos(servico_id);
  CREATE INDEX idx_servico_insumos_insumo ON servico_insumos(insumo_id);
  `,

  // v2: tabela de precos SINAPI por UF e mes + retrato dos precos guardado
  // na criacao da obra (base da aba Depreciacao).
  `
  -- Referencia SINAPI usada quando o orcamento foi criado.
  ALTER TABLE orcamentos ADD COLUMN sinapi_uf TEXT;
  ALTER TABLE orcamentos ADD COLUMN sinapi_mes_referencia TEXT; -- 'AAAA-MM'

  -- Precos publicados do SINAPI (um registro por UF + mes + codigo).
  -- O codigo aqui e o mesmo de insumos.codigo.
  -- Hoje e preenchida com dados ficticios; no futuro, pela API/importacao.
  CREATE TABLE sinapi_precos (
    id              TEXT PRIMARY KEY NOT NULL,
    uf              TEXT NOT NULL,
    mes_referencia  TEXT NOT NULL,
    codigo          TEXT NOT NULL,
    descricao       TEXT NOT NULL,
    unidade         TEXT NOT NULL,
    classe          TEXT,
    preco           REAL NOT NULL CHECK (preco >= 0),
    ${colunasSync},
    UNIQUE (uf, mes_referencia, codigo)
  );
  CREATE INDEX idx_sinapi_busca ON sinapi_precos(uf, codigo, mes_referencia);

  -- Retrato dos precos no momento da criacao da obra. Nao muda depois:
  -- e contra ele que a aba Depreciacao compara os precos atuais.
  CREATE TABLE orcamento_precos_base (
    id              TEXT PRIMARY KEY NOT NULL,
    orcamento_id    TEXT NOT NULL REFERENCES orcamentos(id),
    insumo_id       TEXT NOT NULL REFERENCES insumos(id),
    codigo          TEXT NOT NULL,
    uf              TEXT NOT NULL,
    mes_referencia  TEXT NOT NULL,
    preco_unitario  REAL NOT NULL CHECK (preco_unitario >= 0),
    ${colunasSync},
    UNIQUE (orcamento_id, insumo_id)
  );

  CREATE TRIGGER trg_precos_base_imutavel
  BEFORE UPDATE OF preco_unitario, mes_referencia, uf, codigo ON orcamento_precos_base
  BEGIN
    SELECT RAISE(ABORT, 'O preco-base da obra e um registro historico e nao pode ser alterado.');
  END;
  `,

  // v3: preferencias do usuario (aba Mais). Chave/valor com o valor em JSON.
  // Sao configuracoes do aparelho, nao dados da obra: por isso nao levam as
  // colunas de sincronizacao.
  `
  CREATE TABLE preferencias (
    chave          TEXT PRIMARY KEY NOT NULL,
    valor          TEXT NOT NULL,
    atualizado_em  TEXT NOT NULL
  );
  `,

  // v4: acentuacao dos dados de exemplo (src/data). O seed so roda com o banco
  // vazio, entao quem ja tinha o app precisa desta correcao. So mexe nos
  // textos antigos exatos; dados digitados pelo usuario ficam como estao.
  `
  UPDATE obras SET local = 'Cohama, São Luís - MA' WHERE local = 'Cohama, Sao Luis - MA';
  UPDATE orcamentos SET descricao = 'Orçamento-base de materiais' WHERE descricao = 'Orcamento-base de materiais';

  UPDATE insumos SET descricao = 'Areia média lavada' WHERE descricao = 'Areia media lavada';
  UPDATE insumos SET descricao = 'Aço CA-50, 10,0 mm, vergalhão' WHERE descricao = 'Aco CA-50, 10,0 mm, vergalhao';
  UPDATE insumos SET descricao = 'Aço CA-60, 5,0 mm, vergalhão' WHERE descricao = 'Aco CA-60, 5,0 mm, vergalhao';
  UPDATE insumos SET descricao = 'Prego 17x27 com cabeça' WHERE descricao = 'Prego 17x27 com cabeca';
  UPDATE insumos SET descricao = 'Bloco cerâmico vedação 9x19x19 cm' WHERE descricao = 'Bloco ceramico vedacao 9x19x19 cm';
  UPDATE insumos SET descricao = 'Piso cerâmico PEI-4, 45x45 cm' WHERE descricao = 'Piso ceramico PEI-4, 45x45 cm';
  UPDATE insumos SET descricao = 'Rejunte cimentício' WHERE descricao = 'Rejunte cimenticio';
  UPDATE insumos SET descricao = 'Tinta acrílica fosca, lata 18 L' WHERE descricao = 'Tinta acrilica fosca, lata 18 L';
  UPDATE insumos SET categoria = 'Aço' WHERE categoria = 'Aco';

  UPDATE sinapi_precos SET descricao = 'Areia média lavada' WHERE descricao = 'Areia media lavada';
  UPDATE sinapi_precos SET descricao = 'Aço CA-50, 10,0 mm, vergalhão' WHERE descricao = 'Aco CA-50, 10,0 mm, vergalhao';
  UPDATE sinapi_precos SET descricao = 'Aço CA-60, 5,0 mm, vergalhão' WHERE descricao = 'Aco CA-60, 5,0 mm, vergalhao';
  UPDATE sinapi_precos SET descricao = 'Prego 17x27 com cabeça' WHERE descricao = 'Prego 17x27 com cabeca';
  UPDATE sinapi_precos SET descricao = 'Bloco cerâmico vedação 9x19x19 cm' WHERE descricao = 'Bloco ceramico vedacao 9x19x19 cm';
  UPDATE sinapi_precos SET descricao = 'Piso cerâmico PEI-4, 45x45 cm' WHERE descricao = 'Piso ceramico PEI-4, 45x45 cm';
  UPDATE sinapi_precos SET descricao = 'Rejunte cimentício' WHERE descricao = 'Rejunte cimenticio';
  UPDATE sinapi_precos SET descricao = 'Tinta acrílica fosca, lata 18 L' WHERE descricao = 'Tinta acrilica fosca, lata 18 L';
  UPDATE sinapi_precos SET classe = 'Aço' WHERE classe = 'Aco';

  UPDATE servicos SET descricao = 'Armação aço CA-50 - fundação' WHERE descricao = 'Armacao aco CA-50 - fundação';
  UPDATE servicos SET descricao = 'Armação aço CA-50 - pilares e vigas' WHERE descricao = 'Armacao aco CA-50 - pilares e vigas';
  UPDATE servicos SET descricao = 'Armação aço CA-60 - estribos' WHERE descricao = 'Armacao aco CA-60 - estribos';
  UPDATE servicos SET descricao = 'Alvenaria de vedação em bloco cerâmico 9x19x19 cm' WHERE descricao = 'Alvenaria de vedacao em bloco ceramico 9x19x19 cm';
  UPDATE servicos SET descricao = 'Chapisco em paredes, traço 1:3' WHERE descricao = 'Chapisco em paredes, traco 1:3';
  UPDATE servicos SET descricao = 'Reboco (massa única) em paredes, e = 2 cm' WHERE descricao = 'Reboco (massa unica) em paredes, e = 2 cm';
  UPDATE servicos SET descricao = 'Piso cerâmico 45x45 cm assentado com argamassa colante' WHERE descricao = 'Piso ceramico 45x45 cm assentado com argamassa colante';
  UPDATE servicos SET descricao = 'Pintura acrílica em paredes, duas demãos' WHERE descricao = 'Pintura acrilica em paredes, duas demaos';
  `,

  // v5: obras, insumos e SINAPI passaram para a API. As tabelas acima ficam
  // (migracao publicada nao se desfaz), mas o app nao le mais delas.
  // Esta guarda a ULTIMA resposta de cada leitura da API, para mostrar dados
  // basicos sem internet. Chave = usuario + caminho, valor = JSON da resposta.
  `
  CREATE TABLE cache_api (
    chave          TEXT PRIMARY KEY NOT NULL,
    valor          TEXT NOT NULL,
    atualizado_em  TEXT NOT NULL
  );
  `,
];

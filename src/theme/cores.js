// src/theme/cores.js
// Paleta base do sistema.
//
// Regra importante: verde, amarelo, vermelho, azul e cinza sao reservados
// exclusivamente ao semaforo (item 2.6 do DRDA). Nenhum elemento decorativo
// ou de marca pode usar essas cores, senao o usuario le status onde nao ha.
// Por isso a identidade do app e grafite/branco.

export const cores = {
  grafite: '#20262E',
  grafiteClaro: '#3C4650',
  texto: '#20262E',
  textoFraco: '#5A6068',
  fundo: '#FFFFFF',
  fundoAlternativo: '#F2F4F6',
  borda: '#D8DDE3',
  branco: '#FFFFFF',
};

// Semaforo. Cada status carrega cor, fundo, rotulo e icone porque o RNF23
// proibe depender apenas da cor. Nunca use `cor` sem `rotulo` ou `icone`.
export const semaforo = {
  favoravel: {
    chave: 'favoravel',
    cor: '#1B7F3B',
    fundo: '#E4F3E9',
    rotulo: 'Dentro do previsto',
    icone: 'checkmark-circle',
  },
  atencao: {
    chave: 'atencao',
    cor: '#8A6100',
    fundo: '#FBF0D9',
    rotulo: 'Desvio em atenção',
    icone: 'alert-circle',
  },
  critico: {
    chave: 'critico',
    cor: '#B3261E',
    fundo: '#FBE6E4',
    rotulo: 'Acima do limite',
    icone: 'close-circle',
  },
  semCompra: {
    chave: 'semCompra',
    cor: '#1A4FA0',
    fundo: '#E3EBF7',
    rotulo: 'Sem compra',
    icone: 'ellipse-outline',
  },
  pendente: {
    chave: 'pendente',
    cor: '#5A6068',
    fundo: '#EDEFF2',
    rotulo: 'Sem comparação possível',
    icone: 'help-circle',
  },
};

// Variacao de preco (aba Depreciacao). Reaproveita as cores do semaforo, pois
// tambem e status. Mesma regra do RNF23: sempre mostrar rotulo e icone junto.
//   base   (azul)     : parte do valor que se manteve
//   perda  (vermelho) : quanto o mesmo material ficou mais caro
//   ganho  (verde)    : quanto o mesmo material ficou mais barato
export const variacaoPreco = {
  estavel: { chave: 'estavel', cor: semaforo.semCompra.cor, fundo: semaforo.semCompra.fundo, rotulo: 'Estável', icone: 'remove-circle' },
  perda: { chave: 'perda', cor: semaforo.critico.cor, fundo: semaforo.critico.fundo, rotulo: 'Perda', icone: 'trending-up' },
  ganho: { chave: 'ganho', cor: semaforo.favoravel.cor, fundo: semaforo.favoravel.fundo, rotulo: 'Ganho', icone: 'trending-down' },
  semPreco: { chave: 'semPreco', cor: semaforo.pendente.cor, fundo: semaforo.pendente.fundo, rotulo: 'Sem preço atual', icone: 'help-circle' },
};

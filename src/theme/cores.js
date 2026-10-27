// src/theme/cores.js
// Paleta base do sistema.
//
// Regra importante: verde, amarelo, vermelho, azul e cinza sao reservados
// exclusivamente ao semaforo (item 2.6 do DRDA). Nenhum elemento decorativo
// ou de marca pode usar essas cores, senao o usuario le status onde nao ha.
// Por isso a identidade do app e grafite/branco. O grafite puxa para o
// marinho do logotipo da Planengen, mas escuro o bastante para nao ser lido
// como o azul do semaforo.

export const cores = {
  grafite: '#1B2133',
  grafiteClaro: '#3A4256',
  texto: '#1B2133',
  textoFraco: '#5A6068',
  fundo: '#FFFFFF',
  fundoAlternativo: '#F2F4F6',
  borda: '#D8DDE3',
  branco: '#FFFFFF',
};

// Identidade Planengen. O azul da marca e proximo do azul do semaforo, entao
// so pode aparecer em SUPERFICIES DE MARCA grandes, que nunca carregam status:
//   - o <Vidro>: painel de abertura das abas (<PainelMarca>) e os cartoes
//     de marca do Login, do Sobre e do perfil no Mais;
//   - o proprio <Marca> (simbolo e nome).
// Nunca em botoes, icones, selos, textos, barras de progresso ou graficos.
// O marinho pode ser usado como cor estrutural (cabecalhos de navegacao).
export const marca = {
  azul: '#0B7BE3',
  marinho: '#141A3A',
  // Tracos de predio sobre o azul/marinho, como nos cartoes de visita.
  traco: 'rgba(255, 255, 255, 0.28)',
  // Os mesmos tracos "atras do vidro" (<Vidro>): linha translucida e um halo
  // em volta, que juntos parecem uma faixa de luz desfocada.
  tracoDesfocado: 'rgba(190, 232, 255, 0.30)',
  haloTraco: 'rgba(150, 215, 255, 0.28)',
  // Textos secundarios sobre o azul/marinho.
  textoSobreMarca: 'rgba(255, 255, 255, 0.82)',
  // Caixas translucidas sobre o azul (indicadores do <PainelMarca>).
  superficieSobreMarca: 'rgba(255, 255, 255, 0.14)',
  // Reflexo do <Vidro>: contorno (forte no alto e a esquerda, fraco embaixo e
  // a direita) e brilho diagonal (forte no canto de cima, leve no de baixo).
  bordaVidro: 'rgba(255, 255, 255, 0.15)',
  reflexoVidro: 'rgba(255, 255, 255, 0.7)',
  brilhoVidro: 'rgba(255, 255, 255, 0.24)',
  brilhoVidroBase: 'rgba(255, 255, 255, 0.10)',
  // <Vidro>: pontas do degrade atras do vidro (o meio e o `azul`), tom do
  // vidro nativo (translucido, para o degrade aparecer) e a sombra por fora.
  // As pontas ficam escuras o bastante para o texto branco manter contraste.
  vidroEscuro: '#0A3F9C',
  vidroClaro: '#2E9BF5',
  tomVidro: 'rgba(11, 123, 227, 0.25)',
  sombraVidro: 'rgba(11, 123, 227, 0.35)',
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

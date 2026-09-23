// src/screens/ObraDetalhe/styles.js
import { StyleSheet } from 'react-native';
import { cores } from '../../theme/cores';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  centro: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  conteudo: {
    padding: 16,
    paddingBottom: 32,
  },
  cabecalho: {
    gap: 16,
    marginBottom: 8,
  },
  bloco: {
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 8,
    padding: 16,
    gap: 10,
  },
  tituloBloco: {
    fontSize: 16,
    fontWeight: '600',
    color: cores.texto,
  },
  nota: {
    fontSize: 13,
    lineHeight: 19,
    color: cores.textoFraco,
    marginBottom: 4,
  },
  campo: {
    gap: 2,
  },
  rotulo: {
    fontSize: 13,
    color: cores.textoFraco,
  },
  valor: {
    fontSize: 15,
    color: cores.texto,
  },
  valorDestaque: {
    fontSize: 20,
    fontWeight: '700',
  },
  aviso: {
    fontSize: 15,
    color: cores.textoFraco,
    padding: 24,
  },

  // Seletor "Por servico / Por material"
  seletor: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: cores.grafite,
    borderRadius: 8,
    overflow: 'hidden',
  },
  seletorOpcao: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.fundo,
  },
  seletorOpcaoAtiva: {
    backgroundColor: cores.grafite,
  },
  seletorTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: cores.grafite,
  },
  seletorTextoAtivo: {
    color: cores.branco,
  },

  // Cabecalho de cada servico
  secao: {
    marginTop: 16,
    gap: 8,
  },
  etapa: {
    fontSize: 13,
    fontWeight: '700',
    color: cores.textoFraco,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  secaoCartao: {
    backgroundColor: cores.fundoAlternativo,
    borderRadius: 8,
    padding: 12,
    gap: 2,
  },
  secaoCodigo: {
    fontSize: 12,
    color: cores.textoFraco,
  },
  secaoTitulo: {
    fontSize: 15,
    fontWeight: '600',
    color: cores.texto,
  },
  secaoMeta: {
    fontSize: 13,
    color: cores.textoFraco,
  },
  secaoTotal: {
    fontSize: 15,
    fontWeight: '700',
    color: cores.texto,
  },

  // Linha de material
  item: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
    gap: 2,
  },
  linhaEntre: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: 12,
  },
  itemTitulo: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: cores.texto,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '600',
    color: cores.texto,
  },
  itemMeta: {
    fontSize: 12,
    color: cores.textoFraco,
  },

  // Aba Depreciacao
  valorForte: {
    fontSize: 17,
    fontWeight: '700',
  },
  indiceGrande: {
    fontSize: 28,
    fontWeight: '700',
  },
  notaLista: {
    marginTop: 16,
  },
  selo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  seloTexto: {
    fontSize: 12,
    fontWeight: '600',
  },
  legenda: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  legendaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendaCor: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendaTexto: {
    fontSize: 12,
    color: cores.textoFraco,
  },
  evolucao: {
    gap: 8,
    marginTop: 4,
  },
  evolucaoLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  evolucaoMes: {
    width: 60,
    fontSize: 13,
    color: cores.texto,
  },
  evolucaoBarra: {
    flex: 1,
  },
  evolucaoValor: {
    width: 56,
    fontSize: 13,
    textAlign: 'right',
    color: cores.texto,
  },
});

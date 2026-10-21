// src/screens/ObraDetalhe/styles.js
import { StyleSheet } from 'react-native';
import { cores } from '../../theme/cores';
import { espacos, raios } from '../../theme/medidas';

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
    padding: espacos.lg,
    paddingBottom: espacos.xxxl,
  },
  cabecalho: {
    gap: espacos.lg,
    marginBottom: espacos.sm,
  },
  bloco: {
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: raios.md,
    padding: espacos.lg,
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
    marginBottom: espacos.xs,
  },
  campo: {
    gap: espacos.xxs,
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
    padding: espacos.xxl,
  },

  // Seletor "Por servico / Por material"
  seletor: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: cores.grafite,
    borderRadius: raios.md,
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
    marginTop: espacos.lg,
    gap: espacos.sm,
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
    borderRadius: raios.md,
    padding: espacos.md,
    gap: espacos.xxs,
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
    paddingHorizontal: espacos.md,
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
    gap: espacos.xxs,
  },
  linhaEntre: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: espacos.md,
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
    marginTop: espacos.lg,
  },
  botaoAtivar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.xs,
    minHeight: 44,
    paddingHorizontal: espacos.xs,
  },
  botaoAtivarTexto: {
    fontSize: 15,
    fontWeight: '600',
    color: cores.branco,
  },
  legenda: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espacos.md,
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
    gap: espacos.sm,
    marginTop: espacos.xs,
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

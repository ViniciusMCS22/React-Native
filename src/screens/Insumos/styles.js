// src/screens/Insumos/styles.js
import { StyleSheet } from 'react-native';
import { cores, marca } from '../../theme/cores';
import { espacos, raios } from '../../theme/medidas';

export const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.fundoAlternativo,
  },
  centro: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  conteudo: {
    padding: espacos.lg,
    paddingBottom: espacos.xxxl,
    gap: espacos.md,
  },
  cabecalho: {
    gap: espacos.md,
  },

  cartao: {
    padding: espacos.lg,
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.fundo,
    gap: espacos.sm,
  },
  cartaoTitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: cores.texto,
  },
  campo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: espacos.md,
  },
  rotulo: {
    fontSize: 13,
    color: cores.textoFraco,
  },
  valor: {
    flexShrink: 1,
    fontSize: 14,
    color: cores.texto,
    textAlign: 'right',
  },
  valorDestaque: {
    fontSize: 17,
    fontWeight: '700',
  },
  nota: {
    fontSize: 13,
    lineHeight: 18,
    color: cores.textoFraco,
  },
  vazio: {
    fontSize: 15,
    color: cores.textoFraco,
    textAlign: 'center',
    paddingVertical: espacos.xxxl,
  },

  // Mesmo titulo de secao do Inicio (traco marinho a esquerda).
  listaTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: espacos.sm,
  },
  secaoTitulo: {
    fontSize: 13,
    fontWeight: '700',
    color: marca.marinho,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingLeft: espacos.sm,
    borderLeftWidth: 3,
    borderLeftColor: marca.marinho,
  },
  botaoAdicionar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.xs,
    minHeight: 40,
    paddingHorizontal: espacos.md,
    borderRadius: raios.md,
    backgroundColor: marca.marinho,
  },
  botaoAdicionarTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: cores.branco,
  },
  botaoPressionado: {
    opacity: 0.8,
  },
  botaoContorno: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: espacos.xs,
    minHeight: 44,
    paddingHorizontal: espacos.md,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: cores.grafite,
  },
  botaoContornoTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: cores.grafite,
  },

  // Linha de insumo
  item: {
    padding: espacos.lg,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.fundo,
    gap: espacos.md,
  },
  itemPressionado: {
    backgroundColor: cores.fundoAlternativo,
  },
  itemTopo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: espacos.sm,
  },
  itemTextos: {
    flex: 1,
    gap: espacos.xxs,
  },
  itemNome: {
    fontSize: 15,
    fontWeight: '600',
    color: cores.texto,
  },
  itemMeta: {
    fontSize: 12,
    color: cores.textoFraco,
  },
  botaoRemover: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: raios.md,
  },
  colunas: {
    flexDirection: 'row',
    gap: espacos.sm,
    paddingTop: espacos.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: cores.borda,
  },
  coluna: {
    flex: 1,
    gap: espacos.xxs,
  },
  colunaDireita: {
    alignItems: 'flex-end',
  },
  colunaValor: {
    fontSize: 14,
    color: cores.texto,
  },
  colunaTotal: {
    fontWeight: '700',
  },
});

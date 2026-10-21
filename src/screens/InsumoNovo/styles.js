// src/screens/InsumoNovo/styles.js
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

  busca: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.sm,
    minHeight: 48,
    paddingHorizontal: espacos.md,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.fundo,
  },
  buscaEntrada: {
    flex: 1,
    fontSize: 15,
    color: cores.texto,
  },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.md,
    padding: espacos.lg,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.fundo,
  },
  itemPressionado: {
    backgroundColor: cores.fundoAlternativo,
  },
  itemTopo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: espacos.md,
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
  itemPreco: {
    alignItems: 'flex-end',
  },
  itemPrecoValor: {
    fontSize: 14,
    fontWeight: '700',
    color: cores.texto,
  },
  selo: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: espacos.xxs,
    marginTop: espacos.xs,
    paddingHorizontal: espacos.sm,
    paddingVertical: espacos.xxs,
    borderRadius: raios.sm,
    backgroundColor: cores.borda,
  },
  seloTexto: {
    fontSize: 11,
    fontWeight: '600',
    color: cores.grafite,
  },

  cartao: {
    padding: espacos.lg,
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.fundo,
    gap: espacos.sm,
  },
  link: {
    fontSize: 14,
    fontWeight: '600',
    color: cores.grafite,
    textDecorationLine: 'underline',
  },

  campoForm: {
    gap: 6,
  },
  rotuloForm: {
    fontSize: 14,
    fontWeight: '600',
    color: cores.texto,
  },
  entrada: {
    minHeight: 52,
    paddingHorizontal: espacos.lg,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.fundo,
    fontSize: 16,
    color: cores.texto,
  },
  totalLinha: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingVertical: espacos.sm,
  },
  total: {
    fontSize: 20,
    fontWeight: '700',
    color: cores.texto,
  },

  botao: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: raios.md,
    backgroundColor: marca.marinho,
  },
  botaoPressionado: {
    opacity: 0.8,
  },
  botaoTexto: {
    fontSize: 17,
    fontWeight: '600',
    color: cores.branco,
  },
});

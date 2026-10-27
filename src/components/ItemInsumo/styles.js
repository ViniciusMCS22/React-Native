// src/components/ItemInsumo/styles.js
import { StyleSheet } from 'react-native';
import { cores } from '../../theme/cores';
import { espacos, raios } from '../../theme/medidas';

export const styles = StyleSheet.create({
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
  rotulo: {
    fontSize: 13,
    color: cores.textoFraco,
  },
  colunaValor: {
    fontSize: 14,
    color: cores.texto,
  },
  colunaTotal: {
    fontWeight: '700',
  },
});

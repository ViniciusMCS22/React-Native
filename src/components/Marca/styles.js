// src/components/Marca/styles.js
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  marca: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  peca: {
    position: 'absolute',
  },
  nome: {
    fontWeight: '500',
    letterSpacing: 0.6,
    includeFontPadding: false,
  },
  slogan: {
    letterSpacing: 0.3,
    opacity: 0.9,
  },
  ornamentoTopo: {
    position: 'absolute',
    top: -24,
    right: -12,
  },
  ornamentoBase: {
    position: 'absolute',
    left: -8,
  },
});

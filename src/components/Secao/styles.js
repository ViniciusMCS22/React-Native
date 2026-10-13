// src/components/Secao/styles.js
import { StyleSheet } from 'react-native';
import { cores } from '../../theme/cores';
import { espacos } from '../../theme/medidas';

export const styles = StyleSheet.create({
  secao: {
    gap: 6,
  },
  titulo: {
    fontSize: 13,
    fontWeight: '600',
    color: cores.textoFraco,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: espacos.xs,
  },
  rodape: {
    fontSize: 12,
    color: cores.textoFraco,
    marginLeft: espacos.xs,
  },
});

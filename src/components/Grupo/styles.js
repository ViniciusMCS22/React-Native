// src/components/Grupo/styles.js
import { StyleSheet } from 'react-native';
import { cores } from '../../theme/cores';
import { raios } from '../../theme/medidas';

export const styles = StyleSheet.create({
  grupo: {
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.fundo,
    overflow: 'hidden',
  },
});

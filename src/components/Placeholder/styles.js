// src/components/Placeholder/styles.js
import { StyleSheet } from 'react-native';
import { cores } from '../../theme/cores';
import { espacos, raios } from '../../theme/medidas';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.fundo,
    padding: espacos.lg,
    gap: espacos.lg,
  },
  titulo: {
    fontSize: 16,
    fontWeight: '600',
    color: cores.texto,
  },
  rodape: {
    padding: espacos.lg,
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    gap: espacos.xs,
  },
  meta: {
    fontSize: 13,
    color: cores.textoFraco,
  },
});

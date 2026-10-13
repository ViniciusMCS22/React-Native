// src/components/Placeholder/styles.js
import { StyleSheet } from 'react-native';
import { cores } from '../../theme/cores';
import { espacos } from '../../theme/medidas';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.fundo,
    padding: espacos.xxl,
    justifyContent: 'center',
  },
  titulo: {
    fontSize: 20,
    fontWeight: '600',
    color: cores.texto,
    marginBottom: espacos.sm,
  },
  descricao: {
    fontSize: 15,
    lineHeight: 22,
    color: cores.textoFraco,
  },
  rodape: {
    marginTop: espacos.xxl,
    paddingTop: espacos.lg,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
    gap: espacos.xs,
  },
  meta: {
    fontSize: 13,
    color: cores.textoFraco,
  },
});

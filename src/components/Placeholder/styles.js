// src/components/Placeholder/styles.js
import { StyleSheet } from 'react-native';
import { cores } from '../../theme/cores';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.fundo,
    padding: 24,
    justifyContent: 'center',
  },
  titulo: {
    fontSize: 20,
    fontWeight: '600',
    color: cores.texto,
    marginBottom: 8,
  },
  descricao: {
    fontSize: 15,
    lineHeight: 22,
    color: cores.textoFraco,
  },
  rodape: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
    gap: 4,
  },
  meta: {
    fontSize: 13,
    color: cores.textoFraco,
  },
});

// src/components/Botao/styles.js
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  botao: {
    backgroundColor: '#4f46e5',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  texto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  botaoLateral: {
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: '#33334d',
    borderRadius: 0,
    alignItems: 'flex-start',
    paddingHorizontal: 0,
    marginBottom: 0,
  },
  textoLateral: {
    color: '#e0e0e0',
    fontWeight: '500',
  },
});
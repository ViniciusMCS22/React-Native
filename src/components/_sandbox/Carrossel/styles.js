// src/components/Carrossel/styles.js
import { StyleSheet, Dimensions } from 'react-native';

const PADDING_TELA = 20;
export const LARGURA_CARD = Dimensions.get('window').width - PADDING_TELA * 2;
export const ALTURA_CARD = 180;

export const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 24,
  },
  janela: {
    width: LARGURA_CARD,
    height: ALTURA_CARD,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#ddd',
  },
  imagem: {
    width: LARGURA_CARD,
    height: ALTURA_CARD,
  },
  indicadores: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  ponto: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#c4c4d0',
    marginHorizontal: 4,
  },
  pontoAtivo: {
    backgroundColor: '#4f46e5',
    width: 20,
  },
});
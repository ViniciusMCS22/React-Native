// src/components/MenuLateral/styles.js
import { StyleSheet, Dimensions } from 'react-native';

export const LARGURA_MENU = Math.min(Dimensions.get('window').width * 0.75, 300);

export const styles = StyleSheet.create({
  wrapper: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  overlayArea: {
    flex: 1,
  },
  menu: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: LARGURA_MENU,
    backgroundColor: '#1e1e2e',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#33334d',
  },
  tituloMenu: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  fechar: {
    color: '#fff',
    fontSize: 20,
    paddingHorizontal: 6,
  },
  lista: {
    marginTop: 8,
  },
});
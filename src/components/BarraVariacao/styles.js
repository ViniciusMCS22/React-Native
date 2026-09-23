// src/components/BarraVariacao/styles.js
import { StyleSheet } from 'react-native';
import { cores } from '../../theme/cores';

export const styles = StyleSheet.create({
  trilho: {
    flexDirection: 'row',
    height: 20,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: cores.fundoAlternativo,
  },
  trilhoCompacto: {
    height: 8,
    borderRadius: 4,
  },
  segmento: {
    height: '100%',
  },
  // Linha que marca o 100% (valor base).
  marca: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    marginLeft: -1,
    backgroundColor: cores.grafite,
  },
  escala: {
    height: 16,
    marginTop: 4,
  },
  escalaTexto: {
    fontSize: 11,
    color: cores.textoFraco,
  },
  escala100: {
    position: 'absolute',
    top: 0,
    width: 40,
    marginLeft: -20,
    textAlign: 'center',
  },
  escala100Direita: {
    marginLeft: 0,
    textAlign: 'right',
  },
});

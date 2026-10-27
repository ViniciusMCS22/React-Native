// src/components/Vidro/styles.js
import { StyleSheet } from 'react-native';
import { marca } from '../../theme/cores';
import { raios } from '../../theme/medidas';

export const styles = StyleSheet.create({
  sombra: {
    borderRadius: raios.lg,
    boxShadow: `0 10px 24px ${marca.sombraVidro}`,
  },
  base: {
    borderRadius: raios.lg,
    overflow: 'hidden',
    backgroundColor: marca.azul,
    backgroundImage: `linear-gradient(135deg, ${marca.vidroEscuro} 0%, ${marca.azul} 55%, ${marca.vidroClaro} 100%)`,
  },
  camada: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: raios.lg,
  },

  // Reflexo por cima do vidro (todas as plataformas).
  contorno: {
    borderWidth: 1.5,
    borderTopColor: marca.reflexoVidro,
    borderLeftColor: marca.reflexoVidro,
    borderRightColor: marca.bordaVidro,
    borderBottomColor: marca.bordaVidro,
  },
  brilho: {
    backgroundImage: `linear-gradient(135deg, ${marca.brilhoVidro} 0%, rgba(255, 255, 255, 0) 45%, rgba(255, 255, 255, 0) 80%, ${marca.brilhoVidroBase} 100%)`,
  },
});

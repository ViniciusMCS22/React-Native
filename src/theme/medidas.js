// src/theme/medidas.js
// Escala de espacamentos e raios. Usar estes nomes em vez de numeros soltos
// mantem as telas alinhadas entre si e permite ajustar o app todo num lugar so.
//
// Valores fora da escala (ex.: o raio de um avatar, que depende do tamanho dele)
// podem continuar como numero no proprio styles.js.

export const espacos = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const raios = {
  sm: 4, // marcas e selos pequenos
  md: 8, // cartoes, botoes, campos
  lg: 12, // grupos e cartoes grandes
};

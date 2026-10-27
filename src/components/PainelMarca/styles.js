// src/components/PainelMarca/styles.js
import { StyleSheet } from 'react-native';
import { cores, marca } from '../../theme/cores';
import { espacos, raios } from '../../theme/medidas';

export const styles = StyleSheet.create({
  // Fundo, raio e borda vem do <Vidro>.
  painel: {
    padding: espacos.xl,
    paddingTop: espacos.xxl,
    gap: espacos.xs,
  },
  painelCompacto: {
    paddingVertical: espacos.lg,
  },
  sobretitulo: {
    fontSize: 13,
    fontWeight: '500',
    color: marca.textoSobreMarca,
  },
  titulo: {
    fontSize: 26,
    fontWeight: '700',
    color: cores.branco,
  },
  tituloCompacto: {
    fontSize: 22,
  },
  descricao: {
    fontSize: 14,
    lineHeight: 20,
    color: marca.textoSobreMarca,
    maxWidth: 300,
  },
  indicadores: {
    flexDirection: 'row',
    gap: espacos.sm,
    marginTop: espacos.md,
  },
  indicador: {
    flex: 1,
    paddingVertical: espacos.sm,
    paddingHorizontal: espacos.md,
    borderRadius: raios.md,
    backgroundColor: marca.superficieSobreMarca,
  },
  indicadorValor: {
    fontSize: 16,
    fontWeight: '700',
    color: cores.branco,
  },
  indicadorRotulo: {
    fontSize: 12,
    color: marca.textoSobreMarca,
  },
});

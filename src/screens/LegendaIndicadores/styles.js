// src/screens/LegendaIndicadores/styles.js
import { StyleSheet } from 'react-native';
import { cores } from '../../theme/cores';
import { espacos } from '../../theme/medidas';

export const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.fundoAlternativo,
  },
  conteudo: {
    padding: espacos.lg,
    paddingBottom: espacos.xxxl,
    gap: espacos.xl,
  },
  intro: {
    fontSize: 14,
    lineHeight: 20,
    color: cores.textoFraco,
  },
  // So o espaco interno; borda e fundo vem do componente Grupo.
  grupo: {
    paddingVertical: espacos.xs,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.md,
    paddingHorizontal: espacos.lg,
    paddingVertical: 10,
  },
  selo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textos: {
    flex: 1,
    gap: espacos.xxs,
  },
  rotulo: {
    fontSize: 15,
    fontWeight: '600',
  },
  explicacao: {
    fontSize: 13,
    lineHeight: 18,
    color: cores.textoFraco,
  },
});

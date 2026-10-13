// src/components/ItemConfiguracao/styles.js
import { StyleSheet } from 'react-native';
import { cores } from '../../theme/cores';
import { espacos, raios } from '../../theme/medidas';

export const styles = StyleSheet.create({
  linha: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.md,
    paddingHorizontal: espacos.lg,
    paddingVertical: espacos.md,
    backgroundColor: cores.fundo,
  },
  divisor: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: cores.borda,
  },
  pressionado: {
    backgroundColor: cores.fundoAlternativo,
  },
  desabilitado: {
    opacity: 0.5,
  },
  caixaIcone: {
    width: 32,
    height: 32,
    borderRadius: raios.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.fundoAlternativo,
  },
  textos: {
    flex: 1,
    gap: espacos.xxs,
  },
  titulo: {
    fontSize: 16,
    color: cores.texto,
  },
  descricao: {
    fontSize: 13,
    lineHeight: 18,
    color: cores.textoFraco,
  },
  direita: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.xs,
  },
  valor: {
    fontSize: 14,
    color: cores.textoFraco,
  },
});

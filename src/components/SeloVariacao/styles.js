// src/components/SeloVariacao/styles.js
import { StyleSheet } from 'react-native';
import { espacos, raios } from '../../theme/medidas';

export const styles = StyleSheet.create({
  selo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.xs,
    paddingHorizontal: espacos.sm,
    paddingVertical: 3,
    borderRadius: raios.sm,
  },
  texto: {
    fontSize: 12,
    fontWeight: '600',
  },
});

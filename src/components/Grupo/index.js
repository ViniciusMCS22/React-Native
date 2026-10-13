// src/components/Grupo/index.js
// Caixa branca com borda e cantos arredondados que agrupa linhas
// (ex.: ItemConfiguracao). Base visual das telas de configuracao.

import { View } from 'react-native';
import { styles } from './styles';

export default function Grupo({ children, style }) {
  return <View style={[styles.grupo, style]}>{children}</View>;
}

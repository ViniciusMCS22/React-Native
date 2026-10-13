// src/components/Secao/index.js
// Bloco com titulo em caixa alta, um Grupo com o conteudo e, opcionalmente,
// um texto de rodape logo abaixo.

import { View, Text } from 'react-native';
import Grupo from '../Grupo';
import { styles } from './styles';

export default function Secao({ titulo, rodape, estiloGrupo, children }) {
  return (
    <View style={styles.secao}>
      {titulo ? (
        <Text style={styles.titulo} accessibilityRole="header">
          {titulo}
        </Text>
      ) : null}
      <Grupo style={estiloGrupo}>{children}</Grupo>
      {rodape ? <Text style={styles.rodape}>{rodape}</Text> : null}
    </View>
  );
}

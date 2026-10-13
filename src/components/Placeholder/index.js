// src/components/Placeholder/index.js
// Tela ainda nao construida. Some conforme cada modulo entra nas fases 0.2.x+.

import { View, Text } from 'react-native';
import { useObraAtiva } from '../../contexts/ObraAtivaContext';
import { styles } from './styles';

export default function Placeholder({ titulo, descricao, versaoPrevista }) {
  const { obraAtiva } = useObraAtiva();

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>{titulo}</Text>
      {descricao ? <Text style={styles.descricao}>{descricao}</Text> : null}

      <View style={styles.rodape}>
        <Text style={styles.meta}>
          Obra ativa: {obraAtiva ? obraAtiva.nome : 'nenhuma selecionada'}
        </Text>
        {versaoPrevista ? (
          <Text style={styles.meta}>Previsto para a versão {versaoPrevista}</Text>
        ) : null}
      </View>
    </View>
  );
}

// src/components/Placeholder/index.js
// Tela ainda nao construida. Some conforme cada modulo entra nas fases 0.2.x+.

import { View, Text } from 'react-native';
import { useObraAtiva } from '../../contexts/ObraAtivaContext';
import PainelMarca from '../PainelMarca';
import { styles } from './styles';

export default function Placeholder({ titulo, descricao, versaoPrevista }) {
  const { obraAtiva } = useObraAtiva();

  return (
    <View style={styles.container}>
      <PainelMarca
        sobretitulo={obraAtiva ? obraAtiva.nome : 'Nenhuma obra ativa'}
        titulo={titulo}
        descricao={descricao}
      />

      <View style={styles.rodape}>
        <Text style={styles.titulo}>Em construção</Text>
        {versaoPrevista ? (
          <Text style={styles.meta}>Previsto para a versão {versaoPrevista}</Text>
        ) : null}
      </View>
    </View>
  );
}

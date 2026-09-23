// src/components/Botao/index.js
import { TouchableOpacity, Text } from 'react-native';
import { styles } from './styles';

export default function Botao({ texto, aoPressionar, variante = 'primario' }) {
  return (
    <TouchableOpacity
      style={[styles.botao, variante === 'lateral' && styles.botaoLateral]}
      onPress={aoPressionar}
      activeOpacity={0.7}
    >
      <Text style={[styles.texto, variante === 'lateral' && styles.textoLateral]}>
        {texto}
      </Text>
    </TouchableOpacity>
  );
}
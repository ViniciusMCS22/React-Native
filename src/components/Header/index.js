// src/components/Header/index.js
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from './styles';

export default function Header({ titulo, aoAbrirMenu }) {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>{titulo}</Text>
      <TouchableOpacity onPress={aoAbrirMenu} style={styles.botaoMenu} activeOpacity={0.6}>
        <Text style={styles.iconeMenu}>☰</Text>
      </TouchableOpacity>
    </View>
  );
}
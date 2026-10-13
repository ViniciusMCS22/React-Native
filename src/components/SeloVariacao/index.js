// src/components/SeloVariacao/index.js
// Etiqueta de status da variacao de preco: sempre cor + icone + texto (RNF23).

import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { variacaoPreco } from '../../theme/cores';
import { numero } from '../../utils/formatacao';
import { styles } from './styles';

// Texto do selo a partir da fracao (0.04 -> 'Perda de 4,00%').
export function textoVariacao(status, fracao) {
  if (status === 'perda') return `Perda de ${numero(Math.abs(fracao) * 100, 2)}%`;
  if (status === 'ganho') return `Ganho de ${numero(Math.abs(fracao) * 100, 2)}%`;
  if (status === 'semPreco') return 'Sem preço atual';
  return 'Mesmo valor';
}

export default function SeloVariacao({ status, texto }) {
  const s = variacaoPreco[status] ?? variacaoPreco.estavel;
  return (
    <View style={[styles.selo, { backgroundColor: s.fundo }]}>
      <Ionicons name={s.icone} size={14} color={s.cor} />
      <Text style={[styles.texto, { color: s.cor }]}>{texto ?? s.rotulo}</Text>
    </View>
  );
}

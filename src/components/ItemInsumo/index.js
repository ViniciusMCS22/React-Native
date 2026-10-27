// src/components/ItemInsumo/index.js
// Linha de um insumo da obra: nome, codigo/categoria e as colunas quantidade,
// valor unitario (preco SINAPI de quando entrou na obra) e total.
// Usada na aba Insumos e no detalhe da obra.
//
//   aoRemover : se informado, mostra a lixeira (so para 'orcamentos:editar').

import { View, Text, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { moeda, quantidade } from '../../utils/formatacao';
import { cores } from '../../theme/cores';
import { styles } from './styles';

// Pergunta antes de remover; `remover` e async e pode falhar (sem conexao).
export function confirmarRemocao(item, nomeObra, remover) {
  Alert.alert('Remover insumo', `Remover "${item.descricao}" de ${nomeObra}?`, [
    { text: 'Cancelar', style: 'cancel' },
    {
      text: 'Remover',
      style: 'destructive',
      onPress: async () => {
        try {
          await remover();
        } catch (e) {
          Alert.alert('Não foi possível remover', e.message);
        }
      },
    },
  ]);
}

export default function ItemInsumo({ item, aoAbrir, aoRemover }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.item, pressed && aoAbrir && styles.itemPressionado]}
      onPress={aoAbrir}
      disabled={!aoAbrir}
      accessibilityRole={aoAbrir ? 'button' : undefined}
      accessibilityLabel={`${item.descricao}, ${quantidade(item.quantidade, item.unidade)}, total ${moeda(item.custo)}`}
    >
      <View style={styles.itemTopo}>
        <View style={styles.itemTextos}>
          <Text style={styles.itemNome}>{item.descricao}</Text>
          <Text style={styles.itemMeta}>
            Código {item.codigo}
            {item.categoria ? ` - ${item.categoria}` : ''}
          </Text>
        </View>
        {aoRemover ? (
          <Pressable
            style={({ pressed }) => [styles.botaoRemover, pressed && styles.itemPressionado]}
            onPress={aoRemover}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Remover ${item.descricao}`}
          >
            <Ionicons name="trash-outline" size={20} color={cores.grafite} />
          </Pressable>
        ) : null}
      </View>

      <View style={styles.colunas}>
        <View style={styles.coluna}>
          <Text style={styles.rotulo}>Quantidade</Text>
          <Text style={styles.colunaValor}>{quantidade(item.quantidade, item.unidade)}</Text>
        </View>
        <View style={styles.coluna}>
          <Text style={styles.rotulo}>Unitário</Text>
          <Text style={styles.colunaValor}>{moeda(item.preco_unitario)}</Text>
        </View>
        <View style={[styles.coluna, styles.colunaDireita]}>
          <Text style={styles.rotulo}>Total</Text>
          <Text style={[styles.colunaValor, styles.colunaTotal]}>{moeda(item.custo)}</Text>
        </View>
      </View>
    </Pressable>
  );
}

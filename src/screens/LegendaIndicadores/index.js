// src/screens/LegendaIndicadores/index.js
// Explica o semaforo e a variacao de preco. Le direto de theme/cores para a
// legenda nunca divergir do que as outras telas mostram.

import { View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Secao from '../../components/Secao';
import { semaforo, variacaoPreco } from '../../theme/cores';
import { styles } from './styles';

const EXPLICACOES_SEMAFORO = {
  favoravel: 'O custo realizado está dentro do orçamento previsto.',
  atencao: 'O custo passou do previsto, mas ainda está abaixo do limite configurado.',
  critico: 'O custo ultrapassou o limite de desvio. Requer ação.',
  semCompra: 'O insumo ainda não teve nenhuma compra registrada.',
  pendente: 'Faltam dados (preço ou quantidade) para comparar.',
};

const EXPLICACOES_VARIACAO = {
  estavel: 'Parte do valor que se manteve igual.',
  perda: 'Quanto o mesmo material ficou mais caro.',
  ganho: 'Quanto o mesmo material ficou mais barato.',
  semPreco: 'Não há preço atual para comparar.',
};

function Item({ status, explicacao }) {
  return (
    <View style={styles.item}>
      <View style={[styles.selo, { backgroundColor: status.fundo }]}>
        <Ionicons name={status.icone} size={22} color={status.cor} />
      </View>
      <View style={styles.textos}>
        <Text style={[styles.rotulo, { color: status.cor }]}>{status.rotulo}</Text>
        <Text style={styles.explicacao}>{explicacao}</Text>
      </View>
    </View>
  );
}

export default function LegendaIndicadores() {
  return (
    <ScrollView style={styles.tela} contentContainerStyle={styles.conteudo}>
      <Text style={styles.intro}>
        Cada status aparece sempre com cor, ícone e texto, para que possa ser lido
        mesmo sem distinguir as cores.
      </Text>

      <Secao titulo="Semáforo de custo" estiloGrupo={styles.grupo}>
        {Object.values(semaforo).map((status) => (
          <Item
            key={status.chave}
            status={status}
            explicacao={EXPLICACOES_SEMAFORO[status.chave]}
          />
        ))}
      </Secao>

      <Secao titulo="Variação de preço" estiloGrupo={styles.grupo}>
        {Object.values(variacaoPreco).map((status) => (
          <Item
            key={status.chave}
            status={status}
            explicacao={EXPLICACOES_VARIACAO[status.chave]}
          />
        ))}
      </Secao>
    </ScrollView>
  );
}

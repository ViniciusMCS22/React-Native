// src/screens/Obras/index.js
import { View, Text, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useObraAtiva } from '../../contexts/ObraAtivaContext';
import { moeda } from '../../utils/formatacao';
import { cores } from '../../theme/cores';
import { styles } from './styles';

export default function Obras({ navigation }) {
  const { obras, obraAtivaId, selecionarObra, carregando, erro, recarregarObras } =
    useObraAtiva();

  function abrirObra(obra) {
    selecionarObra(obra.id);
    navigation.navigate('ObraDetalhe', { obraId: obra.id, nome: obra.nome });
  }

  if (carregando) {
    return (
      <View style={[styles.lista, styles.centro]}>
        <ActivityIndicator color={cores.grafite} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.lista}
      contentContainerStyle={styles.conteudo}
      data={obras}
      keyExtractor={(obra) => obra.id}
      refreshing={false}
      onRefresh={recarregarObras}
      ListHeaderComponent={
        <Text style={styles.introducao}>
          {erro
            ? `Nao foi possivel ler as obras: ${String(erro.message ?? erro)}`
            : 'Toque em uma obra para torna-la ativa. As demais abas passam a mostrar os dados dela.(Expectativa: 0.2.3)'}
        </Text>
      }
      ListEmptyComponent={
        <Text style={styles.vazio}>
          Nenhuma obra vinculada ao seu usuario. Peca ao gestor para vincular.
        </Text>
      }
      renderItem={({ item }) => {
        const ativa = item.id === obraAtivaId;
        return (
          <Pressable
            style={[styles.cartao, ativa && styles.cartaoAtivo]}
            onPress={() => abrirObra(item)}
            accessibilityRole="button"
            accessibilityState={{ selected: ativa }}
            accessibilityLabel={`${item.nome}, ${item.situacao}${
              ativa ? ', obra ativa' : ''
            }`}
          >
            <View style={styles.cartaoTopo}>
              <Text style={styles.nome}>{item.nome}</Text>
              {ativa ? (
                <View style={styles.marcaAtiva}>
                  <Ionicons name="pin" size={14} color={cores.grafite} />
                  <Text style={styles.marcaAtivaTexto}>Ativa</Text>
                </View>
              ) : null}
            </View>

            <Text style={styles.linha}>{item.local}</Text>
            <Text style={styles.linha}>Contrato {item.contrato}</Text>
            <Text style={styles.linha}>{item.situacao}</Text>
            <Text style={styles.valor}>
              Material previsto: {moeda(item.material_previsto)}
            </Text>
          </Pressable>
        );
      }}
    />
  );
}

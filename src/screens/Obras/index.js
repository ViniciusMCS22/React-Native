// src/screens/Obras/index.js
import { View, Text, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useObraAtiva } from '../../contexts/ObraAtivaContext';
import AvisoOffline from '../../components/AvisoOffline';
import { moeda } from '../../utils/formatacao';
import PainelMarca from '../../components/PainelMarca';
import { cores } from '../../theme/cores';
import { styles } from './styles';

export default function Obras({ navigation }) {
  const { temPermissao } = useAuth();
  const {
    obras,
    obraAtiva,
    obraAtivaId,
    selecionarObra,
    carregando,
    erro,
    offline,
    atualizadoEm,
    recarregarObras,
  } = useObraAtiva();
  const podeCriar = temPermissao('orcamentos:editar');
  const totalPrevisto = obras.reduce((soma, o) => soma + (o.material_previsto ?? 0), 0);

  function abrirObra(obra) {
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
        <View style={styles.cabecalho}>
          <PainelMarca
            sobretitulo="Suas obras"
            titulo={obraAtiva ? obraAtiva.nome : 'Nenhuma obra ativa'}
            descricao={obraAtiva ? 'Obra ativa, resumida no Início.' : 'Toque em "Tornar ativa" para acompanhar uma obra no Início.'}
            indicadores={[
              { rotulo: obras.length === 1 ? 'obra' : 'obras', valor: String(obras.length) },
              { rotulo: 'material previsto', valor: moeda(totalPrevisto) },
            ]}
          />
          <AvisoOffline offline={offline} atualizadoEm={atualizadoEm} />
          {podeCriar ? (
            <Pressable
              style={({ pressed }) => [styles.botaoNova, pressed && styles.botaoNovaPressionado]}
              onPress={() => navigation.navigate('NovaObra')}
              accessibilityRole="button"
            >
              <Ionicons name="add" size={20} color={cores.branco} />
              <Text style={styles.botaoNovaTexto}>Nova obra</Text>
            </Pressable>
          ) : null}
          <Text style={styles.introducao}>
            {erro
              ? `Não foi possível ler as obras: ${String(erro.message ?? erro)}`
              : 'Toque em uma obra para ver os detalhes.'}
          </Text>
        </View>
      }
      ListEmptyComponent={
        <Text style={styles.vazio}>
          Nenhuma obra vinculada ao seu usuário. Peça ao gestor para vincular.
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

            {item.local ? <Text style={styles.linha}>{item.local}</Text> : null}
            {item.contrato ? <Text style={styles.linha}>Contrato {item.contrato}</Text> : null}
            <Text style={styles.linha}>{item.situacao}</Text>
            <Text style={styles.valor}>
              Material previsto: {moeda(item.material_previsto)}
            </Text>

            {!ativa ? (
              <Pressable
                style={({ pressed }) => [styles.botaoAtivar, pressed && styles.botaoAtivarPressionado]}
                onPress={() => selecionarObra(item.id)}
                accessibilityRole="button"
                accessibilityLabel={`Tornar ${item.nome} a obra ativa`}
              >
                <Ionicons name="pin-outline" size={16} color={cores.grafite} />
                <Text style={styles.botaoAtivarTexto}>Tornar ativa</Text>
              </Pressable>
            ) : null}
          </Pressable>
        );
      }}
    />
  );
}

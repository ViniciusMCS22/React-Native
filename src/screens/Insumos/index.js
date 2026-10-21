// src/screens/Insumos/index.js
// Insumos (materiais) do orcamento da obra ativa:
//   1. Resumo geral (quantidade de insumos, valor total, BDI, categorias).
//   2. Lista consolidada: quantidade, valor unitario e total de cada insumo.
//   3. Adicionar/remover: so com 'orcamentos:editar' (master, orcamentista e
//      desenvolvedor). Para os outros perfis os botoes nem aparecem.

import { useCallback } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSQLiteContext } from 'expo-sqlite';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useObraAtiva } from '../../contexts/ObraAtivaContext';
import { useOrcamentoObra } from '../../hooks/useOrcamentoObra';
import { removerInsumo } from '../../repositories/insumosRepositorio';
import PainelMarca from '../../components/PainelMarca';
import { moeda, numero, quantidade, percentual } from '../../utils/formatacao';
import { cores } from '../../theme/cores';
import { styles } from './styles';

function Campo({ rotulo, valor, destaque }) {
  return (
    <View style={styles.campo}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <Text style={[styles.valor, destaque && styles.valorDestaque]}>{valor}</Text>
    </View>
  );
}

function Resumo({ resumo, materiais }) {
  const categorias = new Set(materiais.map((m) => m.categoria ?? 'Sem categoria'));
  const maior = materiais[0];
  return (
    <View style={styles.cartao}>
      <Text style={styles.cartaoTitulo}>Resumo geral</Text>
      <Campo rotulo="Valor total (custo direto)" valor={moeda(resumo.custo_material)} destaque />
      <Campo
        rotulo={`Com BDI (${numero(resumo.bdi_percentual, 2)}%)`}
        valor={moeda(resumo.custo_material_com_bdi)}
      />
      <Campo rotulo="Insumos diferentes" valor={String(materiais.length)} />
      <Campo rotulo="Categorias" valor={String(categorias.size)} />
      {maior ? (
        <Campo
          rotulo="Maior custo"
          valor={`${maior.descricao} (${percentual(maior.participacao)})`}
        />
      ) : null}
      <Text style={styles.nota}>
        Cada insumo tem sua unidade (sc, m³, kg...), por isso o total geral é em valor.
      </Text>
    </View>
  );
}

function ItemInsumo({ item, podeEditar, aoAbrir, aoRemover }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.item, pressed && styles.itemPressionado]}
      onPress={aoAbrir}
      accessibilityRole="button"
      accessibilityLabel={`${item.descricao}, ${quantidade(
        item.quantidade_planejada,
        item.unidade
      )}, total ${moeda(item.custo_previsto)}`}
    >
      <View style={styles.itemTopo}>
        <View style={styles.itemTextos}>
          <Text style={styles.itemNome}>{item.descricao}</Text>
          <Text style={styles.itemMeta}>
            {item.codigo} - {item.categoria ?? 'Sem categoria'}
          </Text>
        </View>
        {podeEditar ? (
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
          <Text style={styles.colunaValor}>
            {quantidade(item.quantidade_planejada, item.unidade)}
          </Text>
        </View>
        <View style={styles.coluna}>
          <Text style={styles.rotulo}>Unitário</Text>
          <Text style={styles.colunaValor}>{moeda(item.preco_medio)}</Text>
        </View>
        <View style={[styles.coluna, styles.colunaDireita]}>
          <Text style={styles.rotulo}>Total</Text>
          <Text style={[styles.colunaValor, styles.colunaTotal]}>
            {moeda(item.custo_previsto)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function Insumos({ navigation }) {
  const db = useSQLiteContext();
  const { temPermissao } = useAuth();
  const { obraAtiva, recarregarObras } = useObraAtiva();
  const { carregando, erro, resumo, materiais, recarregar } = useOrcamentoObra(obraAtiva?.id);
  const podeEditar = temPermissao('orcamentos:editar');

  // Recarrega ao voltar da tela de adicionar.
  useFocusEffect(
    useCallback(() => {
      recarregar();
    }, [recarregar])
  );

  function adicionar() {
    navigation.navigate('InsumoNovo');
  }

  function confirmarRemocao(item) {
    const emServicos =
      item.qtd_servicos > 1 ? ` Ele será retirado dos ${item.qtd_servicos} serviços em que aparece.` : '';
    Alert.alert(
      'Remover insumo',
      `Remover "${item.descricao}" do orçamento de ${obraAtiva.nome}?${emServicos}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              await removerInsumo(db, resumo.id, item.id);
              await Promise.all([recarregar(), recarregarObras()]);
            } catch (e) {
              Alert.alert('Não foi possível remover', e.message);
            }
          },
        },
      ]
    );
  }

  const painel = (
    <PainelMarca
      sobretitulo={obraAtiva ? obraAtiva.nome : 'Nenhuma obra ativa'}
      titulo="Insumos"
      descricao={obraAtiva ? 'Materiais previstos no orçamento da obra ativa.' : undefined}
      indicadores={
        resumo
          ? [
              { rotulo: materiais.length === 1 ? 'insumo' : 'insumos', valor: String(materiais.length) },
              { rotulo: 'valor total', valor: moeda(resumo.custo_material) },
            ]
          : undefined
      }
    />
  );

  if (!obraAtiva) {
    return (
      <View style={[styles.tela, styles.conteudo]}>
        {painel}
        <View style={styles.cartao}>
          <Text style={styles.cartaoTitulo}>Nenhuma obra ativa</Text>
          <Text style={styles.nota}>
            Escolha uma obra na aba Obras e toque em "Tornar ativa" para ver os insumos dela.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.botaoContorno, pressed && styles.itemPressionado]}
            onPress={() => navigation.navigate('Obras', { screen: 'ObrasLista' })}
            accessibilityRole="button"
          >
            <Text style={styles.botaoContornoTexto}>Escolher obra</Text>
            <Ionicons name="arrow-forward" size={18} color={cores.grafite} />
          </Pressable>
        </View>
      </View>
    );
  }

  if (carregando && !resumo) {
    return (
      <View style={[styles.tela, styles.centro]}>
        <ActivityIndicator color={cores.grafite} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.tela}
      contentContainerStyle={styles.conteudo}
      data={resumo ? materiais : []}
      keyExtractor={(item) => item.id}
      refreshing={false}
      onRefresh={recarregar}
      ListHeaderComponent={
        <View style={styles.cabecalho}>
          {painel}

          {erro ? (
            <Text style={styles.nota}>
              Não foi possível ler os insumos: {String(erro.message ?? erro)}
            </Text>
          ) : null}

          {resumo ? <Resumo resumo={resumo} materiais={materiais} /> : null}

          {resumo ? (
            <View style={styles.listaTopo}>
              <Text style={styles.secaoTitulo} accessibilityRole="header">
                Lista de insumos
              </Text>
              {podeEditar ? (
                <Pressable
                  style={({ pressed }) => [styles.botaoAdicionar, pressed && styles.botaoPressionado]}
                  onPress={adicionar}
                  accessibilityRole="button"
                >
                  <Ionicons name="add" size={18} color={cores.branco} />
                  <Text style={styles.botaoAdicionarTexto}>Adicionar</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}
        </View>
      }
      ListEmptyComponent={
        <Text style={styles.vazio}>
          {resumo
            ? 'Nenhum insumo no orçamento.'
            : 'Esta obra ainda não tem orçamento cadastrado.'}
        </Text>
      }
      renderItem={({ item }) => (
        <ItemInsumo
          item={item}
          podeEditar={podeEditar}
          aoAbrir={() => navigation.navigate('InsumoDetalhe', { descricao: item.descricao })}
          aoRemover={() => confirmarRemocao(item)}
        />
      )}
    />
  );
}

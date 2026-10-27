// src/screens/Insumos/index.js
// Insumos (materiais) da obra ativa, lidos da API:
//   1. Resumo geral (quantidade de insumos, valor total, BDI, categorias).
//   2. Lista: quantidade, valor unitario (SINAPI) e total de cada insumo.
//   3. Adicionar/remover: so com 'orcamentos:editar' (master, orcamentista e
//      desenvolvedor) e com internet. Para os outros perfis os botoes nem
//      aparecem; a API tambem recusa.

import { useCallback } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useObraAtiva } from '../../contexts/ObraAtivaContext';
import { useOrcamentoObra } from '../../hooks/useOrcamentoObra';
import { removerInsumo } from '../../repositories/obrasRepositorio';
import AvisoOffline from '../../components/AvisoOffline';
import ItemInsumo, { confirmarRemocao } from '../../components/ItemInsumo';
import PainelMarca from '../../components/PainelMarca';
import { moeda, numero, percentual } from '../../utils/formatacao';
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

function Resumo({ resumo, insumos }) {
  const maior = insumos[0];
  return (
    <View style={styles.cartao}>
      <Text style={styles.cartaoTitulo}>Resumo geral</Text>
      <Campo rotulo="Valor total (custo direto)" valor={moeda(resumo.custo_material)} destaque />
      <Campo
        rotulo={`Com BDI (${numero(resumo.bdi_percentual, 2)}%)`}
        valor={moeda(resumo.custo_material_com_bdi)}
      />
      <Campo rotulo="Insumos diferentes" valor={String(resumo.qtd_insumos)} />
      <Campo rotulo="Categorias" valor={String(resumo.qtd_categorias)} />
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

export default function Insumos({ navigation }) {
  const { temPermissao } = useAuth();
  const { obraAtiva, recarregarObras } = useObraAtiva();
  const { carregando, erro, resumo, insumos, offline, atualizadoEm, recarregar } =
    useOrcamentoObra(obraAtiva?.id);
  const podeEditar = temPermissao('orcamentos:editar');

  // Recarrega ao voltar da tela de adicionar.
  useFocusEffect(
    useCallback(() => {
      recarregar();
    }, [recarregar])
  );

  function adicionar() {
    navigation.navigate('InsumoNovo', { obraId: obraAtiva.id, nomeObra: obraAtiva.nome });
  }

  function remover(item) {
    confirmarRemocao(item, obraAtiva.nome, async () => {
      await removerInsumo(obraAtiva.id, item.id);
      await Promise.all([recarregar(), recarregarObras()]);
    });
  }

  const painel = (
    <PainelMarca
      sobretitulo={obraAtiva ? obraAtiva.nome : 'Nenhuma obra ativa'}
      titulo="Insumos"
      descricao={obraAtiva ? 'Materiais previstos no orçamento da obra ativa.' : undefined}
      indicadores={
        resumo
          ? [
              {
                rotulo: resumo.qtd_insumos === 1 ? 'insumo' : 'insumos',
                valor: String(resumo.qtd_insumos),
              },
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
            style={({ pressed }) => [styles.botaoContorno, pressed && styles.botaoPressionado]}
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
      data={resumo ? insumos : []}
      keyExtractor={(item) => item.id}
      refreshing={false}
      onRefresh={recarregar}
      ListHeaderComponent={
        <View style={styles.cabecalho}>
          {painel}
          <AvisoOffline offline={offline} atualizadoEm={atualizadoEm} />

          {erro ? (
            <Text style={styles.nota}>
              Não foi possível ler os insumos: {String(erro.message ?? erro)}
            </Text>
          ) : null}

          {resumo ? <Resumo resumo={resumo} insumos={insumos} /> : null}

          {resumo ? (
            <View style={styles.listaTopo}>
              <Text style={styles.secaoTitulo} accessibilityRole="header">
                Lista de insumos
              </Text>
              {podeEditar ? (
                <Pressable
                  style={({ pressed }) => [styles.botaoAdicionar, pressed && styles.botaoPressionado]}
                  onPress={adicionar}
                  disabled={offline}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: offline }}
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
        resumo ? <Text style={styles.vazio}>Nenhum insumo nesta obra.</Text> : null
      }
      renderItem={({ item }) => (
        <ItemInsumo
          item={item}
          aoAbrir={() => navigation.navigate('InsumoDetalhe', { descricao: item.descricao })}
          aoRemover={podeEditar && !offline ? () => remover(item) : undefined}
        />
      )}
    />
  );
}

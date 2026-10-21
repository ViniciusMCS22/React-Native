// src/screens/InsumoNovo/index.js
// Adiciona um insumo do catalogo SINAPI ao orcamento da obra ativa.
// Dois passos na mesma tela: escolher o insumo e informar quantidade/preco.
// So abre pela aba Insumos para quem tem 'orcamentos:editar'; a checagem
// aqui repete a regra caso alguem chegue por outro caminho.

import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  ScrollView,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useObraAtiva } from '../../contexts/ObraAtivaContext';
import { buscarResumoOrcamento } from '../../repositories/obrasRepositorio';
import { adicionarInsumo, listarCatalogoSinapi } from '../../repositories/insumosRepositorio';
import PainelMarca from '../../components/PainelMarca';
import { moeda, numero, mesReferencia } from '../../utils/formatacao';
import { cores } from '../../theme/cores';
import { styles } from './styles';

// '1.234,5' ou '1234.5' -> 1234.5. Vazio ou invalido -> NaN.
function lerNumero(texto) {
  const limpo = texto.trim();
  if (!limpo) return NaN;
  const normalizado = limpo.includes(',') ? limpo.replace(/\./g, '').replace(',', '.') : limpo;
  return Number(normalizado);
}

// Sem acento e minusculo, para a busca achar "aco" em "Aço".
function normalizar(texto) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export default function InsumoNovo({ navigation }) {
  const db = useSQLiteContext();
  const { temPermissao } = useAuth();
  const { obraAtiva, recarregarObras } = useObraAtiva();
  const podeEditar = temPermissao('orcamentos:editar');

  const [orcamento, setOrcamento] = useState(null);
  const [catalogo, setCatalogo] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const [busca, setBusca] = useState('');
  const [escolhido, setEscolhido] = useState(null);
  const [qtdTexto, setQtdTexto] = useState('');
  const [precoTexto, setPrecoTexto] = useState('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        const orc = obraAtiva ? await buscarResumoOrcamento(db, obraAtiva.id) : null;
        const lista = orc ? await listarCatalogoSinapi(db, orc.sinapi_uf ?? 'MA', orc.id) : [];
        if (!ativo) return;
        setOrcamento(orc);
        setCatalogo(lista);
      } catch (e) {
        if (ativo) setErro(e);
      } finally {
        if (ativo) setCarregando(false);
      }
    })();
    return () => {
      ativo = false;
    };
  }, [db, obraAtiva]);

  const filtrados = useMemo(() => {
    const termo = normalizar(busca.trim());
    if (!termo) return catalogo;
    return catalogo.filter(
      (c) =>
        normalizar(c.descricao).includes(termo) ||
        normalizar(c.codigo).includes(termo) ||
        normalizar(c.classe ?? '').includes(termo)
    );
  }, [catalogo, busca]);

  function escolher(item) {
    setEscolhido(item);
    setQtdTexto('');
    setPrecoTexto(numero(item.preco, 2));
  }

  const qtd = lerNumero(qtdTexto);
  const preco = lerNumero(precoTexto);
  const total = qtd > 0 && preco >= 0 ? qtd * preco : null;

  async function salvar() {
    if (!(qtd > 0)) {
      Alert.alert('Quantidade inválida', 'Informe uma quantidade maior que zero.');
      return;
    }
    if (!(preco >= 0)) {
      Alert.alert('Preço inválido', 'Informe o preço unitário, como 38,50.');
      return;
    }
    setSalvando(true);
    try {
      await adicionarInsumo(db, orcamento, escolhido, qtd, preco);
      await recarregarObras();
      navigation.goBack();
    } catch (e) {
      setSalvando(false);
      Alert.alert('Não foi possível adicionar', e.message);
    }
  }

  const painel = (
    <PainelMarca
      compacto
      sobretitulo={obraAtiva ? obraAtiva.nome : 'Nenhuma obra ativa'}
      titulo="Adicionar insumo"
      descricao={
        orcamento
          ? `Catálogo SINAPI-${orcamento.sinapi_uf ?? 'MA'}, com o preço mais recente de cada material.`
          : undefined
      }
    />
  );

  if (!podeEditar || !obraAtiva || erro || (!carregando && !orcamento)) {
    const motivo = !podeEditar
      ? 'Seu perfil não pode alterar os insumos do orçamento.'
      : !obraAtiva
      ? 'Escolha uma obra ativa antes de adicionar insumos.'
      : erro
      ? `Não foi possível ler o catálogo: ${String(erro.message ?? erro)}`
      : 'Esta obra ainda não tem orçamento cadastrado.';
    return (
      <View style={[styles.tela, styles.conteudo]}>
        {painel}
        <Text style={styles.nota}>{motivo}</Text>
      </View>
    );
  }

  if (carregando) {
    return (
      <View style={[styles.tela, styles.centro]}>
        <ActivityIndicator color={cores.grafite} />
      </View>
    );
  }

  // Passo 2: quantidade e preco do insumo escolhido.
  if (escolhido) {
    return (
      <KeyboardAvoidingView
        style={styles.tela}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
          {painel}

          <View style={styles.cartao}>
            <View style={styles.itemTopo}>
              <View style={styles.itemTextos}>
                <Text style={styles.itemNome}>{escolhido.descricao}</Text>
                <Text style={styles.itemMeta}>
                  {escolhido.codigo} - {escolhido.classe ?? 'Sem categoria'} - unidade{' '}
                  {escolhido.unidade}
                </Text>
              </View>
              <Pressable
                onPress={() => setEscolhido(null)}
                disabled={salvando}
                hitSlop={8}
                accessibilityRole="button"
              >
                <Text style={styles.link}>Trocar</Text>
              </Pressable>
            </View>
            {escolhido.naObra ? (
              <Text style={styles.nota}>
                Este insumo já está no orçamento. A quantidade informada será somada.
              </Text>
            ) : null}
          </View>

          <View style={styles.campoForm}>
            <Text style={styles.rotuloForm}>Quantidade ({escolhido.unidade})</Text>
            <TextInput
              style={styles.entrada}
              value={qtdTexto}
              onChangeText={setQtdTexto}
              placeholder="Ex.: 120"
              placeholderTextColor={cores.textoFraco}
              keyboardType="decimal-pad"
              autoFocus
              editable={!salvando}
              accessibilityLabel={`Quantidade em ${escolhido.unidade}`}
            />
          </View>

          <View style={styles.campoForm}>
            <Text style={styles.rotuloForm}>Preço unitário (R$)</Text>
            <TextInput
              style={styles.entrada}
              value={precoTexto}
              onChangeText={setPrecoTexto}
              placeholder="Ex.: 38,50"
              placeholderTextColor={cores.textoFraco}
              keyboardType="decimal-pad"
              editable={!salvando}
              accessibilityLabel="Preço unitário em reais"
            />
            <Text style={styles.nota}>
              Sugerido: SINAPI {mesReferencia(escolhido.mes_referencia)}, {moeda(escolhido.preco)}{' '}
              por {escolhido.unidade}.
            </Text>
          </View>

          <View style={styles.totalLinha}>
            <Text style={styles.rotuloForm}>Total</Text>
            <Text style={styles.total}>{total === null ? '-' : moeda(total)}</Text>
          </View>

          <Pressable
            style={({ pressed }) => [styles.botao, (pressed || salvando) && styles.botaoPressionado]}
            onPress={salvar}
            disabled={salvando}
            accessibilityRole="button"
            accessibilityState={{ busy: salvando }}
          >
            {salvando ? (
              <ActivityIndicator color={cores.branco} />
            ) : (
              <Text style={styles.botaoTexto}>Adicionar ao orçamento</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // Passo 1: escolher no catalogo.
  return (
    <FlatList
      style={styles.tela}
      contentContainerStyle={styles.conteudo}
      data={filtrados}
      keyExtractor={(item) => item.codigo}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <View style={styles.cabecalho}>
          {painel}
          <View style={styles.busca}>
            <Ionicons name="search" size={18} color={cores.textoFraco} />
            <TextInput
              style={styles.buscaEntrada}
              value={busca}
              onChangeText={setBusca}
              placeholder="Buscar por nome, código ou categoria"
              placeholderTextColor={cores.textoFraco}
              autoCorrect={false}
              accessibilityLabel="Buscar insumo"
            />
          </View>
        </View>
      }
      ListEmptyComponent={<Text style={styles.vazio}>Nenhum insumo encontrado.</Text>}
      renderItem={({ item }) => (
        <Pressable
          style={({ pressed }) => [styles.item, pressed && styles.itemPressionado]}
          onPress={() => escolher(item)}
          accessibilityRole="button"
          accessibilityLabel={`${item.descricao}, ${moeda(item.preco)} por ${item.unidade}${
            item.naObra ? ', já está na obra' : ''
          }`}
        >
          <View style={styles.itemTextos}>
            <Text style={styles.itemNome}>{item.descricao}</Text>
            <Text style={styles.itemMeta}>
              {item.codigo} - {item.classe ?? 'Sem categoria'}
            </Text>
            {item.naObra ? (
              <View style={styles.selo}>
                <Ionicons name="checkmark" size={12} color={cores.grafite} />
                <Text style={styles.seloTexto}>Já na obra</Text>
              </View>
            ) : null}
          </View>
          <View style={styles.itemPreco}>
            <Text style={styles.itemPrecoValor}>{moeda(item.preco)}</Text>
            <Text style={styles.itemMeta}>por {item.unidade}</Text>
          </View>
        </Pressable>
      )}
    />
  );
}

// src/screens/InsumoNovo/index.js
// Adiciona material a uma obra (parametro `obraId`; sem ele, a obra ativa).
//
//   - Campo de busca: digita do jeito que quiser e a API devolve os materiais
//     do SINAPI mais parecidos (erro de digitacao, sem acento, ordem livre).
//   - Embaixo, os insumos que a obra ja tem: tocar soma mais quantidade.
//   - Escolhido o material, informa so a quantidade. O preco nao e digitado:
//     a API usa o preco SINAPI mais recente (UF e regime da obra).
//
// So para 'orcamentos:editar' e com internet (a busca e feita na API).

import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  SectionList,
  ScrollView,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useObraAtiva } from '../../contexts/ObraAtivaContext';
import { useOrcamentoObra } from '../../hooks/useOrcamentoObra';
import { adicionarInsumo, buscarSinapi } from '../../repositories/obrasRepositorio';
import AvisoOffline from '../../components/AvisoOffline';
import PainelMarca from '../../components/PainelMarca';
import { lerNumero, moeda, mesReferencia, quantidade } from '../../utils/formatacao';
import { cores } from '../../theme/cores';
import { styles } from './styles';

// Espera o usuario parar de digitar antes de buscar.
const ESPERA_BUSCA_MS = 350;
const MINIMO_LETRAS = 2;

function useBuscaSinapi(uf, regime, texto) {
  const [estado, setEstado] = useState({ resultados: [], buscando: false, erro: null });
  const ultima = useRef(0);

  useEffect(() => {
    const termo = texto.trim();
    if (!uf || !regime || termo.length < MINIMO_LETRAS) {
      setEstado({ resultados: [], buscando: false, erro: null });
      return undefined;
    }
    setEstado((e) => ({ ...e, buscando: true, erro: null }));
    const numero = ++ultima.current;
    const espera = setTimeout(async () => {
      try {
        const resultados = await buscarSinapi({ uf, regime, texto: termo });
        // Descarta respostas atrasadas de buscas anteriores.
        if (numero === ultima.current) setEstado({ resultados, buscando: false, erro: null });
      } catch (erro) {
        if (numero === ultima.current) setEstado({ resultados: [], buscando: false, erro });
      }
    }, ESPERA_BUSCA_MS);
    return () => clearTimeout(espera);
  }, [uf, regime, texto]);

  return estado;
}

function LinhaMaterial({ titulo, meta, direita, selo, aoPressionar, rotuloAcessivel }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.item, pressed && styles.itemPressionado]}
      onPress={aoPressionar}
      accessibilityRole="button"
      accessibilityLabel={rotuloAcessivel}
    >
      <View style={styles.itemTextos}>
        <Text style={styles.itemNome}>{titulo}</Text>
        <Text style={styles.itemMeta}>{meta}</Text>
        {selo ? (
          <View style={styles.selo}>
            <Ionicons name="checkmark" size={12} color={cores.grafite} />
            <Text style={styles.seloTexto}>{selo}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.itemPreco}>{direita}</View>
    </Pressable>
  );
}

export default function InsumoNovo({ route, navigation }) {
  const { temPermissao } = useAuth();
  const { obraAtiva, recarregarObras } = useObraAtiva();
  const obraId = route.params?.obraId ?? obraAtiva?.id;
  const podeEditar = temPermissao('orcamentos:editar');
  const { obra, insumos, carregando, erro: erroObra, offline, atualizadoEm, recarregar } =
    useOrcamentoObra(obraId);

  const [texto, setTexto] = useState('');
  const { resultados, buscando, erro: erroBusca } = useBuscaSinapi(
    obra?.sinapi_uf,
    obra?.sinapi_regime,
    texto
  );
  // { codigo, descricao, unidade, preco?, mes_referencia?, naObra? }
  const [escolhido, setEscolhido] = useState(null);
  const [qtdTexto, setQtdTexto] = useState('');
  const [salvando, setSalvando] = useState(false);

  const naObra = new Map(insumos.map((i) => [i.codigo, i]));
  const qtd = lerNumero(qtdTexto);

  function escolher(material) {
    setEscolhido(material);
    setQtdTexto('');
  }

  async function salvar() {
    if (!(qtd > 0)) {
      Alert.alert('Quantidade inválida', 'Informe uma quantidade maior que zero.');
      return;
    }
    setSalvando(true);
    try {
      await adicionarInsumo(obraId, escolhido.codigo, qtd);
      await Promise.all([recarregar(), recarregarObras()]);
      setSalvando(false);
      setEscolhido(null);
      setTexto('');
    } catch (e) {
      setSalvando(false);
      Alert.alert('Não foi possível adicionar', e.message);
    }
  }

  const painel = (
    <PainelMarca
      compacto
      sobretitulo={obra?.nome ?? route.params?.nomeObra ?? 'Nenhuma obra'}
      titulo="Adicionar insumo"
      descricao={
        obra
          ? `Busca na tabela SINAPI-${obra.sinapi_uf}. O preço vem do SINAPI, você informa só a quantidade.`
          : undefined
      }
    />
  );

  if (!podeEditar || !obraId || erroObra || offline) {
    const motivo = !podeEditar
      ? 'Seu perfil não pode alterar os insumos do orçamento.'
      : !obraId
      ? 'Escolha uma obra antes de adicionar insumos.'
      : offline
      ? 'Adicionar insumos precisa de internet: a busca e o preço vêm da tabela SINAPI na API.'
      : `Não foi possível ler a obra: ${String(erroObra.message ?? erroObra)}`;
    return (
      <View style={[styles.tela, styles.conteudo]}>
        {painel}
        <AvisoOffline offline={offline} atualizadoEm={atualizadoEm} />
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

  // Passo 2: quantidade do material escolhido.
  if (escolhido) {
    const existente = naObra.get(escolhido.codigo);
    const preco = escolhido.preco;
    const total = qtd > 0 && preco !== undefined ? qtd * preco : null;
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
                  Código {escolhido.codigo} - unidade {escolhido.unidade}
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
            {existente ? (
              <Text style={styles.nota}>
                A obra já tem {quantidade(existente.quantidade, existente.unidade)}. A quantidade
                informada será somada.
              </Text>
            ) : null}
          </View>

          <View style={styles.campoForm}>
            <Text style={styles.rotuloForm}>
              Quantidade {existente ? 'a somar ' : ''}({escolhido.unidade})
            </Text>
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

          <View style={styles.cartao}>
            {preco !== undefined ? (
              <>
                <View style={styles.totalLinha}>
                  <Text style={styles.rotuloForm}>Preço unitário</Text>
                  <Text style={styles.precoUnitario}>
                    {moeda(preco)} / {escolhido.unidade}
                  </Text>
                </View>
                <Text style={styles.nota}>
                  SINAPI-{obra.sinapi_uf} {mesReferencia(escolhido.mes_referencia)}. Fica guardado
                  na obra como base para a depreciação.
                </Text>
                <View style={styles.totalLinha}>
                  <Text style={styles.rotuloForm}>Total</Text>
                  <Text style={styles.total}>{total === null ? '-' : moeda(total)}</Text>
                </View>
              </>
            ) : (
              <Text style={styles.nota}>
                Preço na obra: {moeda(existente.preco_unitario)} / {existente.unidade}. A
                quantidade nova usa o preço SINAPI mais recente, e a obra guarda a média.
              </Text>
            )}
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
              <Text style={styles.botaoTexto}>
                {existente ? 'Somar à obra' : 'Adicionar à obra'}
              </Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // Passo 1: buscar no SINAPI ou somar a um insumo que a obra ja tem.
  const termo = texto.trim();
  const secoes = [];
  if (termo.length >= MINIMO_LETRAS) {
    secoes.push({ chave: 'sinapi', titulo: 'Resultados do SINAPI', data: resultados });
  }
  secoes.push({ chave: 'obra', titulo: `Já nesta obra (${insumos.length})`, data: insumos });

  return (
    <SectionList
      style={styles.tela}
      contentContainerStyle={styles.conteudo}
      sections={secoes}
      keyExtractor={(item, i) => `${item.codigo}-${i}`}
      keyboardShouldPersistTaps="handled"
      stickySectionHeadersEnabled={false}
      ListHeaderComponent={
        <View style={styles.cabecalho}>
          {painel}
          <View style={styles.busca}>
            <Ionicons name="search" size={18} color={cores.textoFraco} />
            <TextInput
              style={styles.buscaEntrada}
              value={texto}
              onChangeText={setTexto}
              placeholder="Buscar material no SINAPI (ex.: cimento cp2)"
              placeholderTextColor={cores.textoFraco}
              autoCorrect={false}
              returnKeyType="search"
              accessibilityLabel="Buscar material no SINAPI"
            />
            {buscando ? <ActivityIndicator size="small" color={cores.grafite} /> : null}
            {texto && !buscando ? (
              <Pressable
                onPress={() => setTexto('')}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Limpar busca"
              >
                <Ionicons name="close-circle" size={18} color={cores.textoFraco} />
              </Pressable>
            ) : null}
          </View>
          {termo.length > 0 && termo.length < MINIMO_LETRAS ? (
            <Text style={styles.nota}>Digite ao menos {MINIMO_LETRAS} letras.</Text>
          ) : null}
        </View>
      }
      renderSectionHeader={({ section }) => (
        <Text style={styles.secaoTitulo} accessibilityRole="header">
          {section.titulo}
        </Text>
      )}
      renderSectionFooter={({ section }) => {
        if (section.data.length > 0) return null;
        if (section.chave === 'obra') {
          return <Text style={styles.nota}>A obra ainda não tem insumos.</Text>;
        }
        if (buscando) return null;
        return (
          <Text style={styles.nota}>
            {erroBusca
              ? `Não foi possível buscar: ${erroBusca.message}`
              : 'Nenhum material parecido no SINAPI. Tente outras palavras, como o nome principal do material.'}
          </Text>
        );
      }}
      renderItem={({ item, section }) =>
        section.chave === 'sinapi' ? (
          <LinhaMaterial
            titulo={item.descricao}
            meta={`Código ${item.codigo}`}
            selo={naObra.has(item.codigo) ? 'Já na obra' : null}
            aoPressionar={() => escolher(item)}
            rotuloAcessivel={`${item.descricao}, ${moeda(item.preco)} por ${item.unidade}`}
            direita={
              <>
                <Text style={styles.itemPrecoValor}>{moeda(item.preco)}</Text>
                <Text style={styles.itemMeta}>por {item.unidade}</Text>
              </>
            }
          />
        ) : (
          <LinhaMaterial
            titulo={item.descricao}
            meta={`${quantidade(item.quantidade, item.unidade)} - ${moeda(item.custo)}`}
            aoPressionar={() =>
              escolher({ codigo: item.codigo, descricao: item.descricao, unidade: item.unidade })
            }
            rotuloAcessivel={`Somar quantidade a ${item.descricao}`}
            direita={
              <View style={styles.somar}>
                <Ionicons name="add" size={16} color={cores.grafite} />
                <Text style={styles.somarTexto}>Somar</Text>
              </View>
            }
          />
        )
      }
    />
  );
}

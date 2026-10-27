// src/screens/ApagarObra/index.js
// Zona de perigo > Apagar obra (so 'obras:excluir': master e desenvolvedor).
//   1. escolhe a obra;
//   2. digita o nome dela igual e a senha da propria conta;
//   3. confirma no aviso "acao irreversivel".
// A API confere tudo de novo (nome, senha, permissao) e faz a exclusao logica:
// a obra some do app para todos, sem desfazer.

import { useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useObraAtiva } from '../../contexts/ObraAtivaContext';
import { excluirObra } from '../../repositories/obrasRepositorio';
import AvisoOffline from '../../components/AvisoOffline';
import { moeda } from '../../utils/formatacao';
import { cores, perigo } from '../../theme/cores';
import { styles } from './styles';

function Aviso({ children }) {
  return (
    <View style={styles.aviso}>
      <Ionicons name="warning-outline" size={20} color={perigo.cor} />
      <Text style={styles.avisoTexto}>{children}</Text>
    </View>
  );
}

export default function ApagarObra({ navigation }) {
  const { temPermissao } = useAuth();
  const { obras, offline, atualizadoEm, recarregarObras } = useObraAtiva();
  const [obra, setObra] = useState(null);
  const [nome, setNome] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [apagando, setApagando] = useState(false);
  const [erro, setErro] = useState(null);

  if (!temPermissao('obras:excluir')) {
    return (
      <View style={[styles.tela, styles.conteudo]}>
        <Aviso>Seu perfil não pode apagar obras.</Aviso>
      </View>
    );
  }

  function escolher(item) {
    setObra(item);
    setNome('');
    setSenha('');
    setErro(null);
  }

  const nomeConfere = obra && nome.trim() === obra.nome.trim();

  async function apagar() {
    setApagando(true);
    setErro(null);
    try {
      await excluirObra(obra.id, nome, senha);
      await recarregarObras();
      Alert.alert('Obra apagada', `A obra "${obra.nome}" foi apagada.`);
      navigation.goBack();
    } catch (e) {
      setErro(e.message);
      setApagando(false);
    }
  }

  function confirmar() {
    Alert.alert(
      'Apagar obra',
      `Você deseja apagar a obra "${obra.nome}"? Essa ação é irreversível.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sim, apagar', style: 'destructive', onPress: apagar },
      ]
    );
  }

  // Passo 1: escolher a obra.
  if (!obra) {
    return (
      <FlatList
        style={styles.tela}
        contentContainerStyle={styles.conteudo}
        data={obras}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.cabecalho}>
            <Aviso>
              Apagar uma obra remove a obra e o orçamento dela para todos os usuários. Não é
              possível desfazer.
            </Aviso>
            <AvisoOffline offline={offline} atualizadoEm={atualizadoEm} />
            <Text style={styles.secaoTitulo}>Escolha a obra</Text>
          </View>
        }
        ListEmptyComponent={<Text style={styles.nota}>Nenhuma obra cadastrada.</Text>}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.item, pressed && styles.itemPressionado]}
            onPress={() => escolher(item)}
            accessibilityRole="button"
            accessibilityLabel={`Escolher ${item.nome} para apagar`}
          >
            <View style={styles.itemTextos}>
              <Text style={styles.itemNome}>{item.nome}</Text>
              <Text style={styles.nota}>
                {[item.local, item.situacao].filter(Boolean).join(' - ')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={cores.textoFraco} />
          </Pressable>
        )}
      />
    );
  }

  // Passo 2: confirmar com o nome e a senha.
  return (
    <KeyboardAvoidingView
      style={styles.tela}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
        <View style={styles.cartao}>
          <View style={styles.itemTopo}>
            <View style={styles.itemTextos}>
              <Text style={styles.itemNome}>{obra.nome}</Text>
              <Text style={styles.nota}>
                {[obra.local, obra.situacao].filter(Boolean).join(' - ')}
              </Text>
              <Text style={styles.nota}>
                {obra.resumo.qtd_insumos} insumos - material previsto{' '}
                {moeda(obra.resumo.custo_material)}
              </Text>
            </View>
            <Pressable
              onPress={() => setObra(null)}
              disabled={apagando}
              hitSlop={8}
              accessibilityRole="button"
            >
              <Text style={styles.link}>Trocar</Text>
            </Pressable>
          </View>
        </View>

        <Aviso>Esta ação não pode ser desfeita.</Aviso>

        <View style={styles.campo}>
          <Text style={styles.rotulo}>
            Para confirmar, digite o nome da obra:{' '}
            <Text style={styles.nomeDestaque}>{obra.nome}</Text>
          </Text>
          <TextInput
            style={styles.entrada}
            value={nome}
            onChangeText={setNome}
            placeholder={obra.nome}
            placeholderTextColor={cores.textoFraco}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!apagando}
            accessibilityLabel="Nome da obra, para confirmar"
          />
        </View>

        <View style={styles.campo}>
          <Text style={styles.rotulo}>Sua senha</Text>
          <View style={styles.entradaComIcone}>
            <TextInput
              style={[styles.entrada, styles.entradaFlex]}
              value={senha}
              onChangeText={setSenha}
              placeholder="Senha da sua conta"
              placeholderTextColor={cores.textoFraco}
              secureTextEntry={!mostrarSenha}
              autoCapitalize="none"
              autoComplete="current-password"
              textContentType="password"
              editable={!apagando}
              accessibilityLabel="Sua senha"
            />
            <Pressable
              style={styles.botaoOlho}
              onPress={() => setMostrarSenha((v) => !v)}
              accessibilityRole="button"
              accessibilityLabel={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
              hitSlop={8}
            >
              <Ionicons
                name={mostrarSenha ? 'eye-off-outline' : 'eye-outline'}
                size={22}
                color={cores.textoFraco}
              />
            </Pressable>
          </View>
          {__DEV__ ? (
            <Text style={styles.nota}>
              Desenvolvimento: com a API em modo de desenvolvimento, a senha em branco também é
              aceita.
            </Text>
          ) : null}
        </View>

        {erro ? (
          <Text style={styles.erro} accessibilityLiveRegion="polite">
            {erro}
          </Text>
        ) : null}

        <Pressable
          style={({ pressed }) => [
            styles.botaoApagar,
            !nomeConfere && styles.botaoApagarDesabilitado,
            pressed && styles.botaoApagarPressionado,
          ]}
          onPress={confirmar}
          disabled={!nomeConfere || apagando}
          accessibilityRole="button"
          accessibilityState={{ disabled: !nomeConfere, busy: apagando }}
        >
          {apagando ? (
            <ActivityIndicator color={cores.branco} />
          ) : (
            <>
              <Ionicons name="trash-outline" size={20} color={cores.branco} />
              <Text style={styles.botaoApagarTexto}>Apagar esta obra</Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

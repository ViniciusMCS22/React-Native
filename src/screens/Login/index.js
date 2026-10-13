// src/screens/Login/index.js
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { ROTULOS_PERFIL, USUARIOS_TESTE } from '../../config/perfis';
import { URL_API } from '../../services/api';
import { cores } from '../../theme/cores';
import { styles } from './styles';

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const { entrar, erroSessao, restaurar } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);

  // Validacao antes de chamar a API (Aula 03, formularios).
  function validar() {
    if (!email.trim() || !senha) return 'Preencha e-mail e senha.';
    if (!EMAIL_VALIDO.test(email.trim())) return 'Digite um e-mail válido, como nome@empresa.com.';
    return null;
  }

  async function aoEntrar() {
    const problema = validar();
    if (problema) {
      setErro(problema);
      return;
    }
    setErro(null);
    setEnviando(true);
    try {
      await entrar(email, senha);
      // Sucesso: a navegacao troca para as abas sozinha (AuthContext).
    } catch (e) {
      setErro(e.message);
      setEnviando(false);
    }
  }

  function preencherTeste(usuarioTeste) {
    setEmail(usuarioTeste.email);
    setSenha(usuarioTeste.senha);
    setErro(null);
  }

  const mensagem = erro ?? erroSessao;

  return (
    <SafeAreaView style={styles.tela}>
      <KeyboardAvoidingView
        style={styles.tela}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
          <View style={styles.cabecalho}>
            <View style={styles.logo}>
              <Ionicons name="cube" size={36} color={cores.branco} />
            </View>
            <Text style={styles.titulo}>Gestão de Insumos</Text>
            <Text style={styles.subtitulo}>Entre com a conta fornecida pelo gestor.</Text>
          </View>

          <View style={styles.campo}>
            <Text style={styles.rotulo}>E-mail</Text>
            <TextInput
              style={styles.entrada}
              value={email}
              onChangeText={setEmail}
              placeholder="nome@empresa.com"
              placeholderTextColor={cores.textoFraco}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="username"
              returnKeyType="next"
              editable={!enviando}
              accessibilityLabel="E-mail"
            />
          </View>

          <View style={styles.campo}>
            <Text style={styles.rotulo}>Senha</Text>
            <View style={styles.entradaComIcone}>
              <TextInput
                style={[styles.entrada, styles.entradaFlex]}
                value={senha}
                onChangeText={setSenha}
                placeholder="Sua senha"
                placeholderTextColor={cores.textoFraco}
                secureTextEntry={!mostrarSenha}
                autoCapitalize="none"
                autoComplete="current-password"
                textContentType="password"
                returnKeyType="go"
                onSubmitEditing={aoEntrar}
                editable={!enviando}
                accessibilityLabel="Senha"
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
          </View>

          {mensagem ? (
            <View style={styles.erro} accessibilityLiveRegion="polite">
              <Ionicons name="alert-circle-outline" size={20} color={cores.grafite} />
              <Text style={styles.erroTexto}>{mensagem}</Text>
            </View>
          ) : null}

          {erroSessao && !erro ? (
            <Pressable onPress={restaurar} accessibilityRole="button">
              <Text style={styles.link}>Tentar reconectar</Text>
            </Pressable>
          ) : null}

          <Pressable
            style={({ pressed }) => [styles.botao, (pressed || enviando) && styles.botaoPressionado]}
            onPress={aoEntrar}
            disabled={enviando}
            accessibilityRole="button"
            accessibilityState={{ busy: enviando }}
          >
            {enviando ? (
              <ActivityIndicator color={cores.branco} />
            ) : (
              <Text style={styles.botaoTexto}>Entrar</Text>
            )}
          </Pressable>

          {__DEV__ ? (
            <View style={styles.dev}>
              <Text style={styles.devTitulo}>Desenvolvimento: entrar como</Text>
              <View style={styles.devOpcoes}>
                {USUARIOS_TESTE.map((u) => (
                  <Pressable
                    key={u.perfil}
                    style={styles.devOpcao}
                    onPress={() => preencherTeste(u)}
                    disabled={enviando}
                    accessibilityRole="button"
                  >
                    <Text style={styles.devOpcaoTexto}>{ROTULOS_PERFIL[u.perfil]}</Text>
                  </Pressable>
                ))}
              </View>
              <Text style={styles.devUrl}>API: {URL_API}</Text>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

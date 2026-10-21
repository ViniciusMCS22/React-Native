// src/navigation/index.js
// Abas inferiores conforme o item 2.6 do DRDA.
// Sem usuario logado, mostra so o login. Logado, mostra as abas que o perfil
// pode ver (permissoes vindas da API). A API tambem bloqueia por conta propria:
// esconder a aba e conforto visual, nao seguranca.

import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { cores, marca } from '../theme/cores';
import {
  InicioStack,
  ObrasStack,
  InsumosStack,
  AquisicoesStack,
  MaisStack,
  AuthStack,
} from './stacks';

const Tab = createBottomTabNavigator();

const tema = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: cores.grafite,
    background: cores.fundo,
    card: cores.fundo,
    text: cores.texto,
    border: cores.borda,
  },
};

const icones = {
  Inicio: 'home',
  Obras: 'business',
  Insumos: 'cube',
  Aquisicoes: 'cart',
  Mais: 'ellipsis-horizontal',
};

// Permissao necessaria para ver cada aba. Sem entrada = todos os perfis.
const permissaoDaAba = {
  Insumos: 'orcamentos:ver',
  Aquisicoes: 'aquisicoes:ver',
};

function Abas() {
  const { temPermissao } = useAuth();
  const pode = (aba) => !permissaoDaAba[aba] || temPermissao(permissaoDaAba[aba]);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: cores.grafite,
        tabBarInactiveTintColor: cores.textoFraco,
        tabBarStyle: {
          backgroundColor: cores.fundo,
          borderTopColor: cores.borda,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons
            name={focused ? icones[route.name] : `${icones[route.name]}-outline`}
            size={size ?? 24}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen name="Inicio" component={InicioStack} options={{ title: 'Início' }} />
      <Tab.Screen name="Obras" component={ObrasStack} options={{ title: 'Obras' }} />
      {pode('Insumos') ? (
        <Tab.Screen name="Insumos" component={InsumosStack} options={{ title: 'Insumos' }} />
      ) : null}
      {pode('Aquisicoes') ? (
        <Tab.Screen
          name="Aquisicoes"
          component={AquisicoesStack}
          options={{ title: 'Aquisições' }}
        />
      ) : null}
      <Tab.Screen name="Mais" component={MaisStack} options={{ title: 'Mais' }} />
    </Tab.Navigator>
  );
}

export default function Navegacao() {
  const { usuario, carregando } = useAuth();

  // Restaurando a sessao salva ao abrir o app.
  if (carregando) {
    return (
      <View style={styles.carregando}>
        <ActivityIndicator color={cores.branco} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={tema}>
      {usuario ? <Abas /> : <AuthStack />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  carregando: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: marca.marinho,
  },
});

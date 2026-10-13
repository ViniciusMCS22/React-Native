// src/navigation/stacks.js
// Um stack por aba. Manter assim garante que o botao voltar de uma aba nunca
// interfira na outra e que a regra de "tres toques" do item 3.1.1 seja medivel.

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { cores } from '../theme/cores';

import Inicio from '../screens/Inicio';
import Obras from '../screens/Obras';
import ObraDetalhe from '../screens/ObraDetalhe';
import Insumos from '../screens/Insumos';
import InsumoDetalhe from '../screens/InsumoDetalhe';
import Aquisicoes from '../screens/Aquisicoes';
import Mais from '../screens/Mais';
import Login from '../screens/Login';
import LegendaIndicadores from '../screens/LegendaIndicadores';
import Sobre from '../screens/Sobre';

const opcoesPadrao = {
  headerStyle: { backgroundColor: cores.fundo },
  headerTintColor: cores.grafite,
  headerTitleStyle: { color: cores.texto, fontWeight: '600' },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: cores.fundo },
};

const StackInicio = createNativeStackNavigator();
export function InicioStack() {
  return (
    <StackInicio.Navigator screenOptions={opcoesPadrao}>
      <StackInicio.Screen
        name="InicioPainel"
        component={Inicio}
        options={{ title: 'Início' }}
      />
    </StackInicio.Navigator>
  );
}

const StackObras = createNativeStackNavigator();
export function ObrasStack() {
  return (
    <StackObras.Navigator screenOptions={opcoesPadrao}>
      <StackObras.Screen
        name="ObrasLista"
        component={Obras}
        options={{ title: 'Obras' }}
      />
      <StackObras.Screen
        name="ObraDetalhe"
        component={ObraDetalhe}
        options={({ route }) => ({ title: route.params?.nome ?? 'Obra' })}
      />
    </StackObras.Navigator>
  );
}

const StackInsumos = createNativeStackNavigator();
export function InsumosStack() {
  return (
    <StackInsumos.Navigator screenOptions={opcoesPadrao}>
      <StackInsumos.Screen
        name="InsumosLista"
        component={Insumos}
        options={{ title: 'Insumos' }}
      />
      <StackInsumos.Screen
        name="InsumoDetalhe"
        component={InsumoDetalhe}
        options={({ route }) => ({ title: route.params?.descricao ?? 'Insumo' })}
      />
    </StackInsumos.Navigator>
  );
}

const StackAquisicoes = createNativeStackNavigator();
export function AquisicoesStack() {
  return (
    <StackAquisicoes.Navigator screenOptions={opcoesPadrao}>
      <StackAquisicoes.Screen
        name="AquisicoesLista"
        component={Aquisicoes}
        options={{ title: 'Aquisições' }}
      />
    </StackAquisicoes.Navigator>
  );
}

const StackMais = createNativeStackNavigator();
export function MaisStack() {
  return (
    <StackMais.Navigator screenOptions={opcoesPadrao}>
      <StackMais.Screen
        name="MaisLista"
        component={Mais}
        options={{ title: 'Configurações' }}
      />
      <StackMais.Screen
        name="LegendaIndicadores"
        component={LegendaIndicadores}
        options={{ title: 'Legenda dos indicadores' }}
      />
      <StackMais.Screen
        name="Sobre"
        component={Sobre}
        options={{ title: 'Sobre' }}
      />
    </StackMais.Navigator>
  );
}

// Telas antes do login. Hoje so o Login; depois entram "Esqueci a senha" etc.
const StackAuth = createNativeStackNavigator();
export function AuthStack() {
  return (
    <StackAuth.Navigator screenOptions={{ ...opcoesPadrao, headerShown: false }}>
      <StackAuth.Screen name="Login" component={Login} />
    </StackAuth.Navigator>
  );
}

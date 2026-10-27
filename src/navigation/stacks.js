// src/navigation/stacks.js
// Um stack por aba. Manter assim garante que o botao voltar de uma aba nunca
// interfira na outra e que a regra de "tres toques" do item 3.1.1 seja medivel.

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Marca from '../components/Marca';
import { cores, marca } from '../theme/cores';

import Inicio from '../screens/Inicio';
import Obras from '../screens/Obras';
import ObraDetalhe from '../screens/ObraDetalhe';
import NovaObra from '../screens/NovaObra';
import Insumos from '../screens/Insumos';
import InsumoDetalhe from '../screens/InsumoDetalhe';
import InsumoNovo from '../screens/InsumoNovo';
import Aquisicoes from '../screens/Aquisicoes';
import Mais from '../screens/Mais';
import Login from '../screens/Login';
import LegendaIndicadores from '../screens/LegendaIndicadores';
import Sobre from '../screens/Sobre';
import ApagarObra from '../screens/ApagarObra';

// Cabecalho marinho em todas as abas: e a cor estrutural da marca e nao
// conflita com o semaforo (ver theme/cores.js).
const opcoesPadrao = {
  headerStyle: { backgroundColor: marca.marinho },
  headerTintColor: cores.branco,
  headerTitleStyle: { color: cores.branco, fontWeight: '600' },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: cores.fundo },
};

function TituloMarca() {
  return <Marca tamanho={26} tema="escuro" comSlogan={false} />;
}

const StackInicio = createNativeStackNavigator();
export function InicioStack() {
  return (
    <StackInicio.Navigator screenOptions={opcoesPadrao}>
      <StackInicio.Screen
        name="InicioPainel"
        component={Inicio}
        options={{ title: 'Início', headerTitle: TituloMarca }}
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
        options={{ title: 'Obra' }}
      />
      <StackObras.Screen
        name="NovaObra"
        component={NovaObra}
        options={{ title: 'Nova obra' }}
      />
      {/* A mesma tela da aba Insumos, aberta pelo detalhe de qualquer obra. */}
      <StackObras.Screen
        name="InsumoNovo"
        component={InsumoNovo}
        options={{ title: 'Adicionar insumo' }}
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
      <StackInsumos.Screen
        name="InsumoNovo"
        component={InsumoNovo}
        options={{ title: 'Adicionar insumo' }}
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
      <StackMais.Screen
        name="ApagarObra"
        component={ApagarObra}
        options={{ title: 'Apagar obra' }}
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

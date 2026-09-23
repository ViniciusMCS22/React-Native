// src/navigation/index.js
// Abas inferiores conforme o item 2.6 do DRDA.

import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { cores } from '../theme/cores';
import {
  InicioStack,
  ObrasStack,
  InsumosStack,
  AquisicoesStack,
  MaisStack,
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

export default function Navegacao() {
  return (
    <NavigationContainer theme={tema}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: cores.grafite,
          tabBarInactiveTintColor: cores.textoFraco,
          tabBarStyle: {
            backgroundColor: cores.fundo,
            borderTopColor: cores.borda,
          },
          tabBarLabelStyle: { fontSize: 12 },
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? icones[route.name] : `${icones[route.name]}-outline`}
              size={size ?? 24}
              color={color}
            />
          ),
        })}
      >
        <Tab.Screen name="Inicio" component={InicioStack} options={{ title: 'Inicio' }} />
        <Tab.Screen name="Obras" component={ObrasStack} options={{ title: 'Obras' }} />
        <Tab.Screen name="Insumos" component={InsumosStack} options={{ title: 'Insumos' }} />
        <Tab.Screen
          name="Aquisicoes"
          component={AquisicoesStack}
          options={{ title: 'Aquisicoes' }}
        />
        <Tab.Screen name="Mais" component={MaisStack} options={{ title: 'Mais' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
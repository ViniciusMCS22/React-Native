import { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Header from '../../components/Header';
import Botao from '../../components/Botao';
import Carrossel from '../../components/Carrossel';
import MenuLateral from '../../components/MenuLateral';
import { styles } from './styles';

const imagensCarrossel = [
  require('../../../assets/teste1.png'),
  require('../../../assets/teste2.png'),
];

export default function Home() {
  const [menuAberto, setMenuAberto] = useState(false);

  function selecionarItem(nome) {
    setMenuAberto(false);
    Alert.alert('Menu lateral', `Você tocou em: ${nome}`);
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Header titulo="Meu App" aoAbrirMenu={() => setMenuAberto(true)} />

      <ScrollView contentContainerStyle={styles.conteudo}>
        <Carrossel imagens={imagensCarrossel} />

        <Text style={styles.subtitulo}>Página inicial</Text>

        {[1, 2, 3, 4].map((n) => (
          <Botao
            key={n}
            texto={`Botão teste ${n}`}
            aoPressionar={() => Alert.alert('Home', `Você tocou em: Botão teste ${n}`)}
          />
        ))}
      </ScrollView>

      <MenuLateral
        visivel={menuAberto}
        aoFechar={() => setMenuAberto(false)}
        aoSelecionar={selecionarItem}
      />
    </View>
  );
}
// src/components/MenuLateral/index.js
import { useEffect, useRef } from 'react';
import { Animated, View, Text, Pressable, TouchableOpacity } from 'react-native';
import Botao from '../../Botao';
import { styles, LARGURA_MENU } from './styles';

export default function MenuLateral({ visivel, aoFechar, aoSelecionar }) {
  const deslocamento = useRef(new Animated.Value(LARGURA_MENU)).current;
  const opacidade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(deslocamento, {
        toValue: visivel ? 0 : LARGURA_MENU,
        duration: 260,
        useNativeDriver: true,
      }),
      Animated.timing(opacidade, {
        toValue: visivel ? 1 : 0,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visivel]);

  const itens = [1, 2, 3, 4];

  return (
    <View style={styles.wrapper} pointerEvents={visivel ? 'auto' : 'none'}>
      <Animated.View style={[styles.overlay, { opacity: opacidade }]}>
        <Pressable style={styles.overlayArea} onPress={aoFechar} />
      </Animated.View>

      <Animated.View
        style={[styles.menu, { transform: [{ translateX: deslocamento }] }]}
      >
        <View style={styles.cabecalho}>
          <Text style={styles.tituloMenu}>Teste Menu Lateral</Text>
          <TouchableOpacity onPress={aoFechar} activeOpacity={0.6}>
            <Text style={styles.fechar}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.lista}>
          {itens.map((n) => (
            <Botao
              key={n}
              variante="lateral"
              texto={`Botão lateral ${n}`}
              aoPressionar={() => aoSelecionar(`Botão lateral ${n}`)}
            />
          ))}
        </View>
      </Animated.View>
    </View>
  );
}
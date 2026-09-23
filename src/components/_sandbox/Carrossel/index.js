// src/components/Carrossel/index.js
import { useState } from 'react';
import { View, ScrollView, Image } from 'react-native';
import { styles, LARGURA_CARD } from './styles';

export default function Carrossel({ imagens }) {
  const [indiceAtual, setIndiceAtual] = useState(0);

  function aoRolar(evento) {
    const posicao = evento.nativeEvent.contentOffset.x;
    const indice = Math.round(posicao / LARGURA_CARD);
    if (indice !== indiceAtual) {
      setIndiceAtual(indice);
    }
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.janela}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={aoRolar}
          scrollEventThrottle={16}
        >
          {imagens.map((img, i) => (
            <Image key={i} source={img} style={styles.imagem} resizeMode="cover" />
          ))}
        </ScrollView>
      </View>

      <View style={styles.indicadores}>
        {imagens.map((_, i) => (
          <View
            key={i}
            style={[styles.ponto, i === indiceAtual && styles.pontoAtivo]}
          />
        ))}
      </View>
    </View>
  );
}
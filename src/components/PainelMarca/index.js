// src/components/PainelMarca/index.js
// Painel azul de abertura das telas, com os tracos do logotipo nos cantos.
// E a unica superficie azul de cada tela, por isso segue regras fixas para o
// app nao ficar confuso:
//   - sempre o primeiro elemento da tela, no maximo um por tela;
//   - so identifica a tela (titulo, contexto, numeros de referencia);
//   - nunca mostra status do semaforo. Se precisar, use um quadro branco
//     dentro dele (children), como no resumo do Inicio.
//
//   indicadores: [{ rotulo, valor }] numeros neutros, ate 3 (ex.: total de
//   obras, valor previsto). Nada que seja bom/ruim.

import { View, Text } from 'react-native';
import { Ornamento } from '../Marca';
import { styles } from './styles';

export default function PainelMarca({
  sobretitulo,
  titulo,
  descricao,
  indicadores,
  children,
  compacto = false,
  style,
}) {
  return (
    <View style={[styles.painel, compacto && styles.painelCompacto, style]}>
      <Ornamento altura={compacto ? 140 : 170} />

      {sobretitulo ? <Text style={styles.sobretitulo}>{sobretitulo}</Text> : null}
      <Text style={[styles.titulo, compacto && styles.tituloCompacto]} accessibilityRole="header">
        {titulo}
      </Text>
      {descricao ? <Text style={styles.descricao}>{descricao}</Text> : null}

      {indicadores?.length ? (
        <View style={styles.indicadores}>
          {indicadores.map((i) => (
            <View key={i.rotulo} style={styles.indicador}>
              <Text style={styles.indicadorValor} numberOfLines={1}>
                {i.valor}
              </Text>
              <Text style={styles.indicadorRotulo} numberOfLines={1}>
                {i.rotulo}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {children}
    </View>
  );
}

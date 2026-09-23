// src/components/BarraVariacao/index.js
// Barra de progresso do valor atual em relacao ao valor base (100%).
//
//   indice = 1,00 -> barra toda azul (mesmo valor)
//   indice = 1,04 -> azul ate a marca de 100% + 4% em vermelho (perda)
//   indice = 0,90 -> azul ate 90% + os 10% que faltam em verde (ganho)
//
// Quando passa de 100%, a escala cresce para caber o excesso; a marca
// vertical mostra sempre onde fica o 100%.

import { View, Text } from 'react-native';
import { variacaoPreco } from '../../theme/cores';
import { numero } from '../../utils/formatacao';
import { styles } from './styles';

export default function BarraVariacao({ indice, compacta = false, mostrarEscala = true }) {
  const valor = Number.isFinite(indice) && indice > 0 ? indice : 1;
  const escala = Math.max(1, valor);

  const azul = Math.min(valor, 1) / escala;
  const vermelho = valor > 1 ? (valor - 1) / escala : 0;
  const verde = valor < 1 ? (1 - valor) / escala : 0;
  const marca = 1 / escala;

  const pct = (f) => `${f * 100}%`;
  const rotuloAcessivel =
    valor > 1
      ? `Valor atual em ${numero(valor * 100, 1)}% do valor base, perda de ${numero((valor - 1) * 100, 1)}%`
      : valor < 1
      ? `Valor atual em ${numero(valor * 100, 1)}% do valor base, ganho de ${numero((1 - valor) * 100, 1)}%`
      : 'Valor atual igual ao valor base';

  return (
    <View accessible accessibilityRole="progressbar" accessibilityLabel={rotuloAcessivel}>
      <View style={[styles.trilho, compacta && styles.trilhoCompacto]}>
        <View style={[styles.segmento, { width: pct(azul), backgroundColor: variacaoPreco.estavel.cor }]} />
        {verde > 0 ? (
          <View style={[styles.segmento, { width: pct(verde), backgroundColor: variacaoPreco.ganho.cor }]} />
        ) : null}
        {vermelho > 0 ? (
          <View style={[styles.segmento, { width: pct(vermelho), backgroundColor: variacaoPreco.perda.cor }]} />
        ) : null}
        {valor !== 1 ? <View style={[styles.marca, { left: pct(marca) }]} /> : null}
      </View>

      {mostrarEscala && !compacta ? (
        <View style={styles.escala}>
          <Text style={styles.escalaTexto}>0%</Text>
          <Text
            style={[
              styles.escalaTexto,
              styles.escala100,
              // Perto da borda direita, alinha o rotulo pela direita para nao cortar.
              marca > 0.9
                ? [styles.escala100Direita, { right: pct(1 - marca) }]
                : { left: pct(marca) },
            ]}
          >
            100%
          </Text>
        </View>
      ) : null}
    </View>
  );
}

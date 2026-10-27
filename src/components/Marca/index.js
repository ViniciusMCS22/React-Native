// src/components/Marca/index.js
// Simbolo e nome da Planengen. O simbolo imita o traco fino do logotipo
// (predios em linha, telhado inclinado, sem preenchimento), montado com Views
// para nao depender de imagem nem de react-native-svg.
//
//   tema 'claro'  : sobre fundo branco (simbolo azul, nome marinho)
//   tema 'escuro' : sobre fundo azul ou marinho (tudo branco)

import { View, Text } from 'react-native';
import { cores, marca } from '../../theme/cores';
import { styles } from './styles';

// Contorno do simbolo em coordenadas relativas a altura (x de 0 a 0.54, y de
// 0 a 1). Cada par e um segmento de reta.
const SEGMENTOS = [
  // Torre alta: parede esquerda, telhado inclinado e parede direita.
  [0, 1, 0, 0.2],
  [0, 0.2, 0.26, 0],
  [0.26, 0, 0.26, 1],
  // Linha interna da torre.
  [0.13, 1, 0.13, 0.32],
  // Predio baixo: telhado, parede e o degrau que forma o "P".
  [0.26, 0.42, 0.46, 0.27],
  [0.46, 0.27, 0.46, 0.66],
  [0.46, 0.66, 0.37, 0.66],
  [0.37, 0.66, 0.37, 1],
  // Haste solta a direita.
  [0.54, 0.7, 0.54, 1],
];

// `brilho` (opcional): cor de um halo desfocado em volta da linha (boxShadow).
function Linha({ x1, y1, x2, y2, espessura, cor, brilho }) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  // Soma a espessura no comprimento para as pontas se encontrarem sem falha.
  const comprimento = Math.sqrt(dx * dx + dy * dy) + espessura;
  const angulo = Math.atan2(dy, dx);
  return (
    <View
      style={[
        styles.peca,
        {
          width: comprimento,
          height: espessura,
          backgroundColor: cor,
          left: (x1 + x2) / 2 - comprimento / 2,
          top: (y1 + y2) / 2 - espessura / 2,
          transform: [{ rotate: `${angulo}rad` }],
          boxShadow: brilho ? `0 0 ${espessura * 4}px ${espessura * 1.5}px ${brilho}` : undefined,
        },
      ]}
    />
  );
}

export function Simbolo({ altura = 40, cor = marca.azul, espessura, brilho, style }) {
  const h = altura;
  const t = espessura ?? Math.max(1, Math.round(h * 0.035));

  return (
    <View
      style={[{ width: h * 0.54 + t, height: h }, style]}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {SEGMENTOS.map(([x1, y1, x2, y2], i) => (
        <Linha
          key={i}
          x1={x1 * h + t / 2}
          y1={y1 * h}
          x2={x2 * h + t / 2}
          y2={y2 * h}
          espessura={t}
          cor={cor}
          brilho={brilho}
        />
      ))}
    </View>
  );
}

// Simbolos grandes cortados nos cantos, como nos cartoes de visita da marca.
// Usar so dentro de superficies de marca com overflow: 'hidden'.
// Com `brilho`, as linhas ganham um halo e parecem vistas atraves de vidro.
export function Ornamento({ altura = 200, cor = marca.traco, espessura = 1.5, brilho }) {
  return (
    <>
      <Simbolo
        altura={altura}
        cor={cor}
        espessura={espessura}
        brilho={brilho}
        style={styles.ornamentoTopo}
      />
      <Simbolo
        altura={altura * 0.6}
        cor={cor}
        espessura={espessura}
        brilho={brilho}
        style={[styles.ornamentoBase, { bottom: -altura * 0.22 }]}
      />
    </>
  );
}

export default function Marca({ tamanho = 40, tema = 'claro', comSlogan = true }) {
  const escuro = tema === 'escuro';
  const corSimbolo = escuro ? cores.branco : marca.azul;
  const corNome = escuro ? cores.branco : marca.marinho;

  return (
    <View
      style={[styles.marca, { gap: tamanho * 0.16 }]}
      accessible
      accessibilityRole="image"
      accessibilityLabel="Planengen, Consultoria e Construção LTDA"
    >
      <Simbolo altura={tamanho} cor={corSimbolo} />
      <View>
        <Text style={[styles.nome, { fontSize: tamanho * 0.66, color: corNome }]}>Planengen</Text>
        {comSlogan ? (
          <Text style={[styles.slogan, { fontSize: Math.max(9, tamanho * 0.21), color: corNome }]}>
            Consultoria e Construção LTDA
          </Text>
        ) : null}
      </View>
    </View>
  );
}

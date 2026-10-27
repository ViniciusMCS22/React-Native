// src/components/Vidro/index.js
// Superficie "liquid glass" das areas de marca. Hoje e o fundo do
// <PainelMarca> e dos cartoes de marca do Login, do Sobre e do Mais.
//
// Camadas, de tras para frente:
//   1. degrade azul (escuro no alto a esquerda, claro embaixo a direita),
//      para o vidro ter o que refratar. Sem isso o vidro parece azul liso.
//      E um degrade continuo, sem faixas: o desfoque do vidro e leve e nao
//      esconde emendas de cor. Usa o `backgroundImage` do proprio React
//      Native (CSS linear-gradient), no proprio painel, sobre o azul solido:
//      o painel nunca aparece sem cor;
//   2. os tracos do logotipo (`ornamento`) ja desfocados: linha fina e
//      translucida com um halo largo em volta (boxShadow), como faixas de luz
//      vistas atraves de vidro. O desfoque e desenhado, nao vem do vidro: o
//      vidro nativo nao borra o que esta atras dele nesta versao, e assim o
//      efeito fica igual no iOS e no Android;
//   3. so no iOS 26+: o vidro nativo (expo-glass-effect, estilo 'clear'), que
//      acrescenta o brilho de borda do Liquid Glass;
//   4. o reflexo, em todas as plataformas: contorno claro (forte em cima e a
//      esquerda, de onde vem a luz, fraco embaixo e a direita) e um brilho
//      diagonal que some ate o meio. No iOS 26 reforca a borda do vidro
//      nativo, que sozinha fica discreta;
//   5. o conteudo (children).
//
//   ornamento : altura dos tracos do logotipo nos cantos (omitir = sem tracos).
// Por fora, uma sombra azul faz o painel "flutuar" sobre a tela.
//
// O texto por cima e sempre branco: as cores do fundo sao escuras o bastante
// para manter o contraste.

import { useEffect, useState } from 'react';
import { AccessibilityInfo, Platform, View } from 'react-native';
import { GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable } from 'expo-glass-effect';
import { Ornamento } from '../Marca';
import { marca } from '../../theme/cores';
import { styles } from './styles';

// Algumas betas do iOS 26 nao tem a API e travam ao renderizar o GlassView.
const VIDRO_NATIVO =
  Platform.OS === 'ios' && isGlassEffectAPIAvailable() && isLiquidGlassAvailable();

function useReduzirTransparencia() {
  const [reduzir, setReduzir] = useState(false);
  useEffect(() => {
    if (!VIDRO_NATIVO) return undefined;
    AccessibilityInfo.isReduceTransparencyEnabled().then(setReduzir);
    const assinatura = AccessibilityInfo.addEventListener(
      'reduceTransparencyChanged',
      setReduzir
    );
    return () => assinatura.remove();
  }, []);
  return reduzir;
}

export default function Vidro({ ornamento, style, children, ...props }) {
  const reduzir = useReduzirTransparencia();
  const nativo = VIDRO_NATIVO && !reduzir;

  return (
    // A sombra fica no View de fora: o de dentro corta o que passa da borda
    // (overflow hidden), o que tambem cortaria a sombra.
    // O `style` de quem usa (padding, gap...) vai num View proprio, depois das
    // camadas: com o padding no mesmo View, as camadas absolutas ficavam presas
    // na area do conteudo, em vez de cobrir o painel inteiro.
    <View style={styles.sombra}>
      <View style={styles.base}>
        {ornamento ? (
          <Ornamento
            altura={ornamento}
            cor={marca.tracoDesfocado}
            espessura={3}
            brilho={marca.haloTraco}
          />
        ) : null}
        {nativo ? (
          <GlassView
            glassEffectStyle="clear"
            tintColor={marca.tomVidro}
            colorScheme="dark"
            style={styles.camada}
            pointerEvents="none"
          />
        ) : null}
        <View style={[styles.camada, styles.brilho]} pointerEvents="none" />
        <View style={[styles.camada, styles.contorno]} pointerEvents="none" />
        <View style={style} {...props}>
          {children}
        </View>
      </View>
    </View>
  );
}

// src/components/ItemConfiguracao/index.js
// Linha padrao da tela de configuracoes. O lado direito muda conforme a prop:
//   valorSwitch    -> mostra um Switch (toque na linha inteira alterna)
//   valor          -> mostra um texto curto + seta
//   aoPressionar   -> mostra apenas a seta

import { View, Text, Pressable, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores } from '../../theme/cores';
import { styles } from './styles';

export default function ItemConfiguracao({
  icone,
  titulo,
  descricao,
  valor,
  valorSwitch,
  aoAlternar,
  aoPressionar,
  ultimo = false,
  desabilitado = false,
}) {
  const temSwitch = typeof valorSwitch === 'boolean';
  const acao = temSwitch ? () => aoAlternar?.(!valorSwitch) : aoPressionar;

  return (
    <Pressable
      onPress={acao}
      disabled={desabilitado || !acao}
      style={({ pressed }) => [
        styles.linha,
        !ultimo && styles.divisor,
        pressed && styles.pressionado,
        desabilitado && styles.desabilitado,
      ]}
      accessibilityRole={temSwitch ? 'switch' : 'button'}
      accessibilityState={temSwitch ? { checked: valorSwitch } : undefined}
      accessibilityLabel={descricao ? `${titulo}. ${descricao}` : titulo}
    >
      {icone ? (
        <View style={styles.caixaIcone}>
          <Ionicons name={icone} size={20} color={cores.grafite} />
        </View>
      ) : null}

      <View style={styles.textos}>
        <Text style={styles.titulo}>{titulo}</Text>
        {descricao ? <Text style={styles.descricao}>{descricao}</Text> : null}
      </View>

      {temSwitch ? (
        <Switch
          value={valorSwitch}
          onValueChange={aoAlternar}
          disabled={desabilitado}
          trackColor={{ false: cores.borda, true: cores.grafite }}
          thumbColor={cores.branco}
          ios_backgroundColor={cores.borda}
        />
      ) : (
        <View style={styles.direita}>
          {valor ? <Text style={styles.valor}>{valor}</Text> : null}
          {aoPressionar ? (
            <Ionicons name="chevron-forward" size={18} color={cores.textoFraco} />
          ) : null}
        </View>
      )}
    </Pressable>
  );
}

// src/components/AvisoOffline/index.js
// Faixa neutra (nao e status do semaforo) avisando que a tela mostra a copia
// salva no aparelho porque a API nao respondeu. Nao aparece quando online.

import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores } from '../../theme/cores';
import { styles } from './styles';

function quando(iso) {
  if (!iso) return 'da última conexão';
  const d = new Date(iso);
  const dia = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  return `de ${dia} às ${hora}`;
}

export default function AvisoOffline({ offline, atualizadoEm }) {
  if (!offline) return null;
  return (
    <View style={styles.aviso} accessibilityLiveRegion="polite">
      <Ionicons name="cloud-offline-outline" size={18} color={cores.grafite} />
      <Text style={styles.texto}>
        Sem conexão. Mostrando os dados {quando(atualizadoEm)}. Para editar, conecte-se à
        internet.
      </Text>
    </View>
  );
}

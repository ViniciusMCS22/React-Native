// src/screens/Sobre/index.js
import { View, Text, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ItemConfiguracao from '../../components/ItemConfiguracao';
import Grupo from '../../components/Grupo';
import { cores } from '../../theme/cores';
import app from '../../../app.json';
import { styles } from './styles';

function emBreve(titulo) {
  Alert.alert(titulo, 'Conteúdo ainda não disponível no protótipo.');
}

export default function Sobre() {
  return (
    <ScrollView style={styles.tela} contentContainerStyle={styles.conteudo}>
      <View style={styles.cabecalho}>
        <View style={styles.logo}>
          <Ionicons name="cube" size={36} color={cores.branco} />
        </View>
        <Text style={styles.nome}>Gestão de Insumos</Text>
        <Text style={styles.versao}>Versão {app.expo.version} (protótipo)</Text>
      </View>

      <Grupo>
        <ItemConfiguracao
          icone="document-text-outline"
          titulo="Termos de uso"
          aoPressionar={() => emBreve('Termos de uso')}
        />
        <ItemConfiguracao
          icone="shield-checkmark-outline"
          titulo="Política de privacidade"
          aoPressionar={() => emBreve('Política de privacidade')}
        />
        <ItemConfiguracao
          icone="chatbubble-ellipses-outline"
          titulo="Enviar feedback"
          aoPressionar={() => emBreve('Enviar feedback')}
          ultimo
        />
      </Grupo>

      <Text style={styles.rodape}>Preços de referência: SINAPI / MA</Text>
    </ScrollView>
  );
}

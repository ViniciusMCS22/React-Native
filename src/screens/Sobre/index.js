// src/screens/Sobre/index.js
import { View, Text, ScrollView, Alert } from 'react-native';
import ItemConfiguracao from '../../components/ItemConfiguracao';
import Grupo from '../../components/Grupo';
import Marca from '../../components/Marca';
import Vidro from '../../components/Vidro';
import app from '../../../app.json';
import { styles } from './styles';

function emBreve(titulo) {
  Alert.alert(titulo, 'Conteúdo ainda não disponível no protótipo.');
}

export default function Sobre() {
  return (
    <ScrollView style={styles.tela} contentContainerStyle={styles.conteudo}>
      {/* Superficie de marca (vidro azul), no estilo dos cartoes de visita. */}
      <Vidro ornamento={180} style={styles.cartaoMarca}>
        <Marca tamanho={40} tema="escuro" />
        <View style={styles.cartaoTextos}>
          <Text style={styles.nome}>Gestão de Insumos</Text>
          <Text style={styles.versao}>Versão {app.expo.version} (protótipo)</Text>
        </View>
      </Vidro>

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

      <Text style={styles.rodape}>
        Preços de referência: SINAPI / MA{'\n'}© Planengen Consultoria e Construção LTDA
      </Text>
    </ScrollView>
  );
}

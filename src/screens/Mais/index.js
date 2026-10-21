// src/screens/Mais/index.js
// Configuracoes do usuario. As preferencias vem do PreferenciasContext e sao
// salvas no SQLite a cada mudanca. O usuario vem da API (AuthContext).
// Edicao de perfil e limpar cache ainda sao simulados.

import { useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useObraAtiva } from '../../contexts/ObraAtivaContext';
import { usePreferencias } from '../../contexts/PreferenciasContext';
import ItemConfiguracao from '../../components/ItemConfiguracao';
import Secao from '../../components/Secao';
import { Ornamento } from '../../components/Marca';
import { ROTULOS_PERFIL } from '../../config/perfis';
import { requisicao } from '../../services/api';
import { cores } from '../../theme/cores';
import app from '../../../app.json';
import { styles } from './styles';

const LIMITES_ALERTA = [5, 10, 15, 20];

function iniciais(nome) {
  return nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0].toUpperCase())
    .join('');
}

function dataHora(iso) {
  if (!iso) return 'Nunca';
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function Mais({ navigation }) {
  const { usuario, sair: encerrarSessao, temPermissao } = useAuth();
  const { obraAtiva, obras } = useObraAtiva();

  const { preferencias, carregando, erro, definirPreferencia, restaurarPadroes } =
    usePreferencias();
  const { notificacoes, alertaDesvio, limiteAlerta, sincAutomatica, somenteWifi, ultimaSinc } =
    preferencias;
  const [sincronizando, setSincronizando] = useState(false);

  const alternar = (chave) => (valor) => definirPreferencia(chave, valor);

  function sincronizarAgora() {
    // Simulado: so mostra o carregamento e registra o horario.
    setSincronizando(true);
    setTimeout(() => {
      setSincronizando(false);
      definirPreferencia('ultimaSinc', new Date().toISOString());
    }, 1500);
  }

  function limparCache() {
    Alert.alert(
      'Limpar cache',
      'Os dados temporários serão apagados. Suas obras e insumos continuam salvos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: () => Alert.alert('Pronto', 'Cache limpo (simulação).'),
        },
      ]
    );
  }

  function confirmarRestaurarPadroes() {
    Alert.alert('Restaurar padrões', 'Voltar todas as preferências ao padrão?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Restaurar',
        onPress: restaurarPadroes,
      },
    ]);
  }

  function sair() {
    Alert.alert('Sair da conta', 'Deseja realmente sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: encerrarSessao },
    ]);
  }

  // Exemplo de chamada a uma rota protegida: so o perfil master tem acesso.
  async function verUsuarios() {
    try {
      const lista = await requisicao('/exemplos/usuarios');
      Alert.alert(
        'Usuários cadastrados',
        lista
          .map((u) => `${u.nome}\n${u.email} - ${ROTULOS_PERFIL[u.perfil] ?? u.perfil}`)
          .join('\n\n')
      );
    } catch (e) {
      Alert.alert('Não foi possível carregar', e.message);
    }
  }

  if (carregando) {
    return (
      <View style={[styles.tela, styles.centro]}>
        <ActivityIndicator color={cores.grafite} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.tela} contentContainerStyle={styles.conteudo}>
      {/* Perfil: e a superficie de marca (azul) desta tela, sempre a primeira. */}
      <Pressable
        style={({ pressed }) => [styles.perfil, pressed && styles.perfilPressionado]}
        onPress={() => Alert.alert('Perfil', 'Edição de perfil prevista para a versão 0.4.1.')}
        accessibilityRole="button"
        accessibilityLabel={`Perfil de ${usuario.nome}, ${ROTULOS_PERFIL[usuario.perfil]}`}
      >
        <Ornamento altura={150} />
        <View style={styles.avatar}>
          <Text style={styles.avatarTexto}>{iniciais(usuario.nome)}</Text>
        </View>
        <View style={styles.perfilTextos}>
          <Text style={styles.perfilNome}>{usuario.nome}</Text>
          <Text style={styles.perfilLinha}>{usuario.email}</Text>
          <View style={styles.marcaPerfil}>
            <Ionicons name="shield-checkmark-outline" size={14} color={cores.branco} />
            <Text style={styles.marcaPerfilTexto}>
              {ROTULOS_PERFIL[usuario.perfil] ?? usuario.perfil}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={cores.branco} />
      </Pressable>

      {erro ? (
        <Text style={styles.erro}>
          Não foi possível salvar as preferências: {String(erro.message ?? erro)}
        </Text>
      ) : null}

      <Secao titulo="Obra">
        <ItemConfiguracao
          icone="business-outline"
          titulo="Obra ativa"
          descricao={obraAtiva ? obraAtiva.nome : 'Nenhuma selecionada'}
          valor={`${obras.length} ${obras.length === 1 ? 'obra' : 'obras'}`}
          aoPressionar={() => navigation.navigate('Obras', { screen: 'ObrasLista' })}
          ultimo
        />
      </Secao>

      <Secao titulo="Notificações">
        <ItemConfiguracao
          icone="notifications-outline"
          titulo="Receber notificações"
          valorSwitch={notificacoes}
          aoAlternar={alternar('notificacoes')}
        />
        <ItemConfiguracao
          icone="alert-circle-outline"
          titulo="Alertar desvio de custo"
          descricao="Avisa quando um insumo passar do limite"
          valorSwitch={alertaDesvio}
          aoAlternar={alternar('alertaDesvio')}
          desabilitado={!notificacoes}
        />
        <View style={[styles.limite, (!notificacoes || !alertaDesvio) && styles.desabilitado]}>
          <Text style={styles.limiteTitulo}>Limite de desvio</Text>
          <View style={styles.segmentos}>
            {LIMITES_ALERTA.map((valor) => {
              const ativo = valor === limiteAlerta;
              return (
                <Pressable
                  key={valor}
                  style={[styles.segmento, ativo && styles.segmentoAtivo]}
                  onPress={() => definirPreferencia('limiteAlerta', valor)}
                  disabled={!notificacoes || !alertaDesvio}
                  accessibilityRole="button"
                  accessibilityState={{ selected: ativo }}
                  accessibilityLabel={`Limite de ${valor} por cento`}
                >
                  <Text style={[styles.segmentoTexto, ativo && styles.segmentoTextoAtivo]}>
                    {valor}%
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </Secao>

      <Secao
        titulo="Sincronização"
        rodape={`Última sincronização: ${dataHora(ultimaSinc)}`}
      >
        <ItemConfiguracao
          icone="sync-outline"
          titulo="Sincronizar automaticamente"
          valorSwitch={sincAutomatica}
          aoAlternar={alternar('sincAutomatica')}
        />
        <ItemConfiguracao
          icone="wifi-outline"
          titulo="Somente no Wi-Fi"
          descricao="Economiza dados móveis em campo"
          valorSwitch={somenteWifi}
          aoAlternar={alternar('somenteWifi')}
          desabilitado={!sincAutomatica}
        />
        <Pressable
          style={({ pressed }) => [styles.botaoSinc, pressed && styles.perfilPressionado]}
          onPress={sincronizarAgora}
          disabled={sincronizando}
          accessibilityRole="button"
        >
          {sincronizando ? (
            <ActivityIndicator color={cores.grafite} />
          ) : (
            <Ionicons name="cloud-upload-outline" size={20} color={cores.grafite} />
          )}
          <Text style={styles.botaoSincTexto}>
            {sincronizando ? 'Sincronizando...' : 'Sincronizar agora'}
          </Text>
        </Pressable>
      </Secao>

      {temPermissao('usuarios:gerenciar') ? (
        <Secao titulo="Administração">
          <ItemConfiguracao
            icone="people-outline"
            titulo="Usuários cadastrados"
            descricao="Visível apenas para Master e Desenvolvedor"
            aoPressionar={verUsuarios}
            ultimo
          />
        </Secao>
      ) : null}

      <Secao titulo="Ajuda">
        <ItemConfiguracao
          icone="color-palette-outline"
          titulo="Legenda dos indicadores"
          descricao="O que significa cada cor do semáforo"
          aoPressionar={() => navigation.navigate('LegendaIndicadores')}
        />
        <ItemConfiguracao
          icone="information-circle-outline"
          titulo="Sobre o aplicativo"
          valor={`v${app.expo.version}`}
          aoPressionar={() => navigation.navigate('Sobre')}
          ultimo
        />
      </Secao>

      <Secao titulo="Dados">
        <ItemConfiguracao
          icone="refresh-outline"
          titulo="Restaurar preferências padrão"
          aoPressionar={confirmarRestaurarPadroes}
        />
        <ItemConfiguracao
          icone="trash-outline"
          titulo="Limpar cache"
          aoPressionar={limparCache}
          ultimo
        />
      </Secao>

      <Pressable
        style={({ pressed }) => [styles.botaoSair, pressed && styles.perfilPressionado]}
        onPress={sair}
        accessibilityRole="button"
      >
        <Ionicons name="log-out-outline" size={20} color={cores.grafite} />
        <Text style={styles.botaoSairTexto}>Sair da conta</Text>
      </Pressable>
    </ScrollView>
  );
}

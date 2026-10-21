// src/screens/Inicio/index.js
// Painel inicial:
//   1. Mensagem ao usuario com o resumo das atividades.
//   2. Resumo da obra ativa (marcada na aba Obras).
//   3. Depreciação do orçamento da obra ativa.
//
// Perfis sem 'orcamentos:ver' (cliente) veem os totais, mas nao a lista de
// materiais nem o atalho para o detalhe tecnico.

import { useCallback } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useObraAtiva } from '../../contexts/ObraAtivaContext';
import { usePreferencias } from '../../contexts/PreferenciasContext';
import { useOrcamentoObra } from '../../hooks/useOrcamentoObra';
import BarraVariacao from '../../components/BarraVariacao';
import SeloVariacao, { textoVariacao } from '../../components/SeloVariacao';
import PainelMarca from '../../components/PainelMarca';
import { cores, semaforo, variacaoPreco } from '../../theme/cores';
import {
  moeda,
  moedaComSinal,
  percentual,
  percentualComSinal,
  data,
  mesReferencia,
} from '../../utils/formatacao';
import { styles } from './styles';

const DIA_MS = 24 * 60 * 60 * 1000;

function saudacao() {
  const hora = new Date().getHours();
  if (hora < 12) return 'Bom dia';
  if (hora < 18) return 'Boa tarde';
  return 'Boa noite';
}

function hojePorExtenso() {
  const texto = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function quandoFoi(iso) {
  if (!iso) return 'ainda não sincronizado';
  const d = new Date(iso);
  const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  if (d.toDateString() === new Date().toDateString()) return `hoje às ${hora}`;
  return `${d.toLocaleDateString('pt-BR')} às ${hora}`;
}

// Quanto do prazo ja passou (0 a 1) e quantos dias faltam.
function andamentoPrazo(inicio, termino) {
  if (!inicio || !termino) return null;
  const ini = new Date(`${inicio}T00:00:00`).getTime();
  const fim = new Date(`${termino}T00:00:00`).getTime();
  if (!(fim > ini)) return null;
  const agora = Date.now();
  return {
    fracao: Math.min(1, Math.max(0, (agora - ini) / (fim - ini))),
    diasRestantes: Math.ceil((fim - agora) / DIA_MS),
    naoIniciada: agora < ini,
  };
}

function LinhaResumo({ icone, children, status }) {
  const s = status ? semaforo[status] : null;
  return (
    <View style={styles.resumoLinha}>
      <Ionicons name={s ? s.icone : icone} size={18} color={s ? s.cor : cores.grafite} />
      <Text style={styles.resumoTexto}>{children}</Text>
    </View>
  );
}

function Campo({ rotulo, valor, destaque, cor }) {
  return (
    <View style={styles.campo}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <Text style={[styles.valor, destaque && styles.valorDestaque, cor && { color: cor }]}>
        {valor}
      </Text>
    </View>
  );
}

function Botao({ icone, texto, aoPressionar }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.botao, pressed && styles.botaoPressionado]}
      onPress={aoPressionar}
      accessibilityRole="button"
    >
      <Text style={styles.botaoTexto}>{texto}</Text>
      <Ionicons name={icone} size={18} color={cores.grafite} />
    </Pressable>
  );
}

export default function Inicio({ navigation }) {
  const { usuario, temPermissao } = useAuth();
  const { obras, obraAtiva, carregando: carregandoObras, recarregarObras } = useObraAtiva();
  const { preferencias } = usePreferencias();
  const { carregando, erro, resumo, depreciacao, recarregar } = useOrcamentoObra(obraAtiva?.id);

  // Os insumos podem mudar na aba Insumos; relê ao voltar para o Inicio.
  useFocusEffect(
    useCallback(() => {
      recarregar();
    }, [recarregar])
  );

  const podeVerTecnico = temPermissao('orcamentos:ver');
  const limite = preferencias.limiteAlerta;
  const acimaDoLimite =
    depreciacao?.itens.filter(
      (i) => i.status === 'perda' && i.variacaoPercentual > limite / 100
    ) ?? [];
  const prazo = obraAtiva ? andamentoPrazo(obraAtiva.data_inicio, obraAtiva.data_termino_prevista) : null;
  const primeiroNome = usuario?.nome?.split(' ')[0] ?? '';

  function abrirObras() {
    navigation.navigate('Obras', { screen: 'ObrasLista' });
  }

  // initial: false mantem a lista de obras por baixo, para o "voltar" funcionar.
  function abrirDetalhe(modo) {
    navigation.navigate('Obras', {
      screen: 'ObraDetalhe',
      params: { obraId: obraAtiva.id, nome: obraAtiva.nome, modo },
      initial: false,
    });
  }

  if (carregandoObras) {
    return (
      <View style={[styles.tela, styles.centro]}>
        <ActivityIndicator color={cores.grafite} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.tela}
      contentContainerStyle={styles.conteudo}
      refreshControl={
        <RefreshControl
          refreshing={false}
          onRefresh={() => {
            recarregarObras();
            recarregar();
          }}
          tintColor={cores.grafite}
        />
      }
    >
      {/* 1. Mensagem ao usuario */}
      {/* Status so aparece no quadro branco, nunca direto sobre o azul. */}
      <PainelMarca
        sobretitulo={hojePorExtenso()}
        titulo={`${saudacao()}${primeiroNome ? `, ${primeiroNome}` : ''}!`}
      >

        <View style={styles.resumo}>
          <LinhaResumo icone="business-outline">
            Você acompanha {obras.length} {obras.length === 1 ? 'obra' : 'obras'}
            {obraAtiva ? `. Obra ativa: ${obraAtiva.nome}.` : ', mas nenhuma está marcada como ativa.'}
          </LinhaResumo>

          {obraAtiva && depreciacao ? (
            acimaDoLimite.length > 0 ? (
              <LinhaResumo status="atencao">
                {acimaDoLimite.length}{' '}
                {acimaDoLimite.length === 1 ? 'material subiu' : 'materiais subiram'} mais de{' '}
                {limite}% desde a criação do orçamento.
              </LinhaResumo>
            ) : (
              <LinhaResumo status="favoravel">
                Nenhum material passou do limite de {limite}% de aumento.
              </LinhaResumo>
            )
          ) : null}

          <LinhaResumo icone="cart-outline">Nenhuma compra registrada ainda.</LinhaResumo>
          <LinhaResumo icone="sync-outline">
            Última sincronização: {quandoFoi(preferencias.ultimaSinc)}.
          </LinhaResumo>
        </View>
      </PainelMarca>

      {/* 2. Obra ativa */}
      <Text style={styles.secaoTitulo} accessibilityRole="header">
        Obra ativa
      </Text>

      {!obraAtiva ? (
        <View style={styles.cartao}>
          <Ionicons name="pin-outline" size={28} color={cores.textoFraco} />
          <Text style={styles.vazioTitulo}>Nenhuma obra ativa</Text>
          <Text style={styles.nota}>
            Escolha uma obra na aba Obras e toque em "Tornar ativa" para ver o resumo
            e a depreciação dela aqui.
          </Text>
          <Botao icone="arrow-forward" texto="Escolher obra" aoPressionar={abrirObras} />
        </View>
      ) : (
        <>
          <View style={styles.cartao}>
            <View style={styles.obraTopo}>
              <Text style={styles.obraNome}>{obraAtiva.nome}</Text>
              <View style={styles.marca}>
                <Ionicons name="pin" size={14} color={cores.grafite} />
                <Text style={styles.marcaTexto}>Ativa</Text>
              </View>
            </View>
            <Text style={styles.nota}>
              {obraAtiva.local} - {obraAtiva.situacao}
            </Text>

            {prazo ? (
              <View style={styles.prazo}>
                <View style={styles.linhaEntre}>
                  <Text style={styles.rotulo}>
                    Prazo: {data(obraAtiva.data_inicio)} a {data(obraAtiva.data_termino_prevista)}
                  </Text>
                  <Text style={styles.rotulo}>{percentual(prazo.fracao, 0)}</Text>
                </View>
                <View
                  style={styles.trilho}
                  accessible
                  accessibilityRole="progressbar"
                  accessibilityLabel={`${percentual(prazo.fracao, 0)} do prazo decorrido`}
                >
                  <View style={[styles.trilhoCheio, { width: `${prazo.fracao * 100}%` }]} />
                </View>
                <Text style={styles.nota}>
                  {prazo.naoIniciada
                    ? 'Obra ainda não iniciada.'
                    : prazo.diasRestantes > 0
                    ? `Faltam ${prazo.diasRestantes} dias para o término previsto.`
                    : `Prazo previsto encerrado há ${Math.abs(prazo.diasRestantes)} dias.`}
                </Text>
              </View>
            ) : null}

            {carregando ? (
              <ActivityIndicator color={cores.grafite} style={styles.carregandoInterno} />
            ) : erro ? (
              <Text style={styles.nota}>
                Não foi possível ler o orçamento: {String(erro.message ?? erro)}
              </Text>
            ) : resumo ? (
              <View style={styles.campos}>
                <Campo rotulo="Contrato" valor={obraAtiva.contrato ?? '-'} />
                <Campo rotulo="Material previsto" valor={moeda(resumo.custo_material)} destaque />
                <Campo rotulo="Com BDI" valor={moeda(resumo.custo_material_com_bdi)} />
                <Campo
                  rotulo="Composição"
                  valor={`${resumo.qtd_servicos} serviços, ${resumo.qtd_materiais} materiais`}
                />
              </View>
            ) : (
              <Text style={styles.nota}>Esta obra ainda não tem orçamento cadastrado.</Text>
            )}

            <View style={styles.acoes}>
              {podeVerTecnico ? (
                <Botao icone="arrow-forward" texto="Ver detalhes" aoPressionar={() => abrirDetalhe()} />
              ) : null}
              <Botao icone="swap-horizontal" texto="Trocar obra" aoPressionar={abrirObras} />
            </View>
          </View>

          {/* 3. Depreciacao */}
          {!carregando && resumo ? (
            <>
              <Text style={styles.secaoTitulo} accessibilityRole="header">
                Depreciação do orçamento
              </Text>
              <View style={styles.cartao}>
                {!depreciacao ? (
                  <Text style={styles.nota}>
                    Esta obra não tem preços SINAPI guardados na criação, então não há base
                    para calcular a depreciação.
                  </Text>
                ) : (
                  <>
                    <Text style={styles.nota}>
                      SINAPI-{depreciacao.uf} {mesReferencia(depreciacao.mesBase)} (criação) comparado
                      com {mesReferencia(depreciacao.mesAtual)} (atual).
                    </Text>
                    <View style={styles.linhaEntre}>
                      <Text
                        style={[styles.indice, { color: variacaoPreco[depreciacao.status].cor }]}
                      >
                        {percentual(depreciacao.indice, 2)}
                      </Text>
                      <SeloVariacao
                        status={depreciacao.status}
                        texto={textoVariacao(depreciacao.status, depreciacao.indice - 1)}
                      />
                    </View>
                    <BarraVariacao indice={depreciacao.indice} />

                    <View style={styles.campos}>
                      <Campo rotulo="Valor na criação" valor={moeda(depreciacao.valorBase)} />
                      <Campo rotulo="Valor com preços atuais" valor={moeda(depreciacao.valorAtual)} />
                      <Campo
                        rotulo="Diferença"
                        valor={moedaComSinal(depreciacao.variacao)}
                        destaque
                        cor={variacaoPreco[depreciacao.status].cor}
                      />
                    </View>

                    {podeVerTecnico && depreciacao.itens.length > 0 ? (
                      <View style={styles.maiores}>
                        <Text style={styles.rotulo}>Maiores variações</Text>
                        {depreciacao.itens.slice(0, 3).map((item) => (
                          <View key={item.id} style={styles.maioresLinha}>
                            <View style={styles.maioresTextos}>
                              <Text style={styles.maioresNome} numberOfLines={1}>
                                {item.descricao}
                              </Text>
                              <Text style={styles.nota}>
                                {percentualComSinal(item.variacaoPercentual)} no preço
                              </Text>
                            </View>
                            <Text
                              style={[styles.maioresValor, { color: variacaoPreco[item.status].cor }]}
                            >
                              {moedaComSinal(item.variacao)}
                            </Text>
                          </View>
                        ))}
                      </View>
                    ) : null}

                    {podeVerTecnico ? (
                      <Botao
                        icone="arrow-forward"
                        texto="Ver depreciação completa"
                        aoPressionar={() => abrirDetalhe('depreciacao')}
                      />
                    ) : null}
                  </>
                )}
              </View>
            </>
          ) : null}
        </>
      )}
    </ScrollView>
  );
}

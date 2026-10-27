// src/screens/ObraDetalhe/index.js
// Detalhe de uma obra (dados da API):
//   - identificacao, referencia SINAPI e custo de material;
//   - com 'orcamentos:ver': seletor Insumos / Depreciacao. Na aba Insumos,
//     quem tem 'orcamentos:editar' adiciona e remove insumos;
//   - sem 'orcamentos:ver' (cliente): so o resumo da depreciacao, sem itens.

import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useObraAtiva } from '../../contexts/ObraAtivaContext';
import { useOrcamentoObra } from '../../hooks/useOrcamentoObra';
import { removerInsumo } from '../../repositories/obrasRepositorio';
import AvisoOffline from '../../components/AvisoOffline';
import BarraVariacao from '../../components/BarraVariacao';
import ItemInsumo, { confirmarRemocao } from '../../components/ItemInsumo';
import PainelMarca from '../../components/PainelMarca';
import SeloVariacao, { textoVariacao } from '../../components/SeloVariacao';
import {
  moeda,
  numero,
  quantidade,
  percentual,
  data,
  mesReferencia,
  moedaComSinal,
  percentualComSinal,
} from '../../utils/formatacao';
import { cores, variacaoPreco } from '../../theme/cores';
import { styles } from './styles';

const MODOS = [
  { chave: 'insumos', rotulo: 'Insumos' },
  { chave: 'depreciacao', rotulo: 'Depreciação' },
];

function Legenda() {
  const itens = [
    ['estavel', 'Valor base'],
    ['perda', 'Perda (mais caro)'],
    ['ganho', 'Ganho (mais barato)'],
  ];
  return (
    <View style={styles.legenda}>
      {itens.map(([chave, rotulo]) => (
        <View key={chave} style={styles.legendaItem}>
          <View style={[styles.legendaCor, { backgroundColor: variacaoPreco[chave].cor }]} />
          <Text style={styles.legendaTexto}>{rotulo}</Text>
        </View>
      ))}
    </View>
  );
}

function Campo({ rotulo, valor, destaque }) {
  return (
    <View style={styles.campo}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <Text style={[styles.valor, destaque && styles.valorDestaque]}>{valor}</Text>
    </View>
  );
}

function ResumoDepreciacao({ d }) {
  if (!d) {
    return (
      <View style={styles.bloco}>
        <Text style={styles.nota}>
          Sem insumos na obra, ainda não há o que comparar com a tabela SINAPI.
        </Text>
      </View>
    );
  }

  const cor = variacaoPreco[d.status].cor;
  return (
    <View style={styles.bloco}>
      <Text style={styles.tituloBloco}>Variação do valor da obra</Text>
      <Text style={styles.nota}>
        Preços de quando cada insumo entrou na obra, comparados com SINAPI-{d.uf}{' '}
        {mesReferencia(d.mesAtual)}.
      </Text>

      <View style={styles.linhaEntre}>
        <Text style={[styles.indiceGrande, { color: cor }]}>{percentual(d.indice, 2)}</Text>
        <SeloVariacao status={d.status} texto={textoVariacao(d.status, d.indice - 1)} />
      </View>
      <BarraVariacao indice={d.indice} />
      <Legenda />

      <Campo rotulo="Valor na criação" valor={moeda(d.valorBase)} />
      <Campo rotulo="Valor com preços atuais" valor={moeda(d.valorAtual)} />
      <View style={styles.campo}>
        <Text style={styles.rotulo}>Diferença</Text>
        <Text style={[styles.valor, styles.valorForte, { color: cor }]}>
          {moedaComSinal(d.variacao)}
        </Text>
      </View>

      {d.mesBase === d.mesAtual ? (
        <Text style={styles.nota}>
          Ainda não há tabela SINAPI mais nova que a usada na criação.
        </Text>
      ) : null}

      {d.evolucao.length > 1 ? (
        <View style={styles.evolucao}>
          <Text style={styles.rotulo}>Evolução mês a mês</Text>
          {d.evolucao.map((e) => (
            <View key={e.mes} style={styles.evolucaoLinha}>
              <Text style={styles.evolucaoMes}>{mesReferencia(e.mes)}</Text>
              <View style={styles.evolucaoBarra}>
                <BarraVariacao indice={e.indice} compacta />
              </View>
              <Text style={styles.evolucaoValor}>{percentual(e.indice, 1)}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function ItemDepreciacao({ item, mesAtual }) {
  const cor = variacaoPreco[item.status].cor;
  return (
    <View style={styles.item}>
      <View style={styles.linhaEntre}>
        <Text style={styles.itemTitulo}>{item.descricao}</Text>
        <Text style={[styles.itemTotal, { color: cor }]}>{moedaComSinal(item.variacao)}</Text>
      </View>
      <View style={styles.linhaEntre}>
        <Text style={styles.itemMeta}>
          {moeda(item.precoBase)} {'->'} {moeda(item.precoAtual)} / {item.unidade} (
          {percentualComSinal(item.variacaoPercentual)})
        </Text>
        <SeloVariacao status={item.status} />
      </View>
      <Text style={styles.itemMeta}>
        {quantidade(item.quantidade, item.unidade)}
        {item.mesPrecoAtual && item.mesPrecoAtual !== mesAtual
          ? ` - último preço publicado: ${mesReferencia(item.mesPrecoAtual)}`
          : ''}
      </Text>
    </View>
  );
}

function Cabecalho({
  obra,
  resumo,
  depreciacao,
  offline,
  atualizadoEm,
  verItens,
  podeEditar,
  modo,
  setModo,
  aoAdicionar,
}) {
  return (
    <View style={styles.cabecalho}>
      <PainelMarca
        compacto
        sobretitulo={obra.cliente || 'Obra'}
        titulo={obra.nome}
        descricao={[obra.local, obra.situacao].filter(Boolean).join(' - ')}
        indicadores={[
          { rotulo: 'material previsto', valor: moeda(resumo.custo_material) },
          { rotulo: 'término previsto', valor: data(obra.data_termino_prevista) },
        ]}
      />
      <AvisoOffline offline={offline} atualizadoEm={atualizadoEm} />

      <View style={styles.bloco}>
        <Text style={styles.tituloBloco}>Identificação</Text>
        <Campo rotulo="Cliente" valor={obra.cliente || '-'} />
        <Campo rotulo="Local" valor={obra.local || '-'} />
        <Campo rotulo="Contrato" valor={obra.contrato ?? '-'} />
        <Campo rotulo="Responsável" valor={obra.responsavel ?? '-'} />
        <Campo rotulo="Situação" valor={obra.situacao} />
        <Campo
          rotulo="Área construída"
          valor={obra.area_construida_m2 ? `${numero(obra.area_construida_m2)} m²` : '-'}
        />
        <Campo
          rotulo="Prazo"
          valor={`${data(obra.data_inicio)} a ${data(obra.data_termino_prevista)}`}
        />
      </View>

      <View style={styles.bloco}>
        <Text style={styles.tituloBloco}>Custo de material</Text>
        <Text style={styles.nota}>
          Preços do SINAPI-{obra.sinapi_uf} (tabela de {mesReferencia(obra.sinapi_mes_referencia)}{' '}
          na criação). Mão de obra, equipamentos e encargos não entram nestes valores.
        </Text>
        <Campo rotulo="Previsto (custo direto)" valor={moeda(resumo.custo_material)} destaque />
        <Campo
          rotulo={`Com BDI (${numero(obra.bdi_percentual, 2)}%)`}
          valor={moeda(resumo.custo_material_com_bdi)}
        />
        {obra.area_construida_m2 ? (
          <Campo
            rotulo="Material por m² construído"
            valor={moeda(resumo.custo_material / obra.area_construida_m2)}
          />
        ) : null}
        <Campo
          rotulo="Composição"
          valor={`${resumo.qtd_insumos} ${resumo.qtd_insumos === 1 ? 'insumo' : 'insumos'}, ${resumo.qtd_categorias} ${resumo.qtd_categorias === 1 ? 'categoria' : 'categorias'}`}
        />
        <Campo rotulo="Comprado" valor="Sem compras registradas" />
      </View>

      {verItens ? (
        <View style={styles.seletor} accessibilityRole="tablist">
          {MODOS.map((m) => {
            const ativo = modo === m.chave;
            return (
              <Pressable
                key={m.chave}
                style={[styles.seletorOpcao, ativo && styles.seletorOpcaoAtiva]}
                onPress={() => setModo(m.chave)}
                accessibilityRole="tab"
                accessibilityState={{ selected: ativo }}
              >
                <Text style={[styles.seletorTexto, ativo && styles.seletorTextoAtivo]}>
                  {m.rotulo}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {modo === 'depreciacao' || !verItens ? <ResumoDepreciacao d={depreciacao} /> : null}

      {verItens && modo === 'insumos' && podeEditar ? (
        <Pressable
          style={({ pressed }) => [styles.botaoAdicionar, pressed && styles.botaoPressionado]}
          onPress={aoAdicionar}
          disabled={offline}
          accessibilityRole="button"
          accessibilityState={{ disabled: offline }}
        >
          <Ionicons name="add" size={20} color={cores.branco} />
          <Text style={styles.botaoAdicionarTexto}>Adicionar insumo</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export default function ObraDetalhe({ route, navigation }) {
  const obraId = route.params?.obraId;
  const { temPermissao } = useAuth();
  const verItens = temPermissao('orcamentos:ver');
  const podeEditar = temPermissao('orcamentos:editar');
  const { obra, resumo, insumos, depreciacao, carregando, erro, offline, atualizadoEm, recarregar } =
    useOrcamentoObra(obraId);
  const { obraAtivaId, selecionarObra, recarregarObras } = useObraAtiva();
  // O Inicio abre direto na Depreciacao passando { modo: 'depreciacao' }.
  const [modo, setModo] = useState(route.params?.modo ?? 'insumos');

  useEffect(() => {
    if (route.params?.modo) setModo(route.params.modo);
  }, [route.params?.modo]);

  // Recarrega ao voltar da tela de adicionar insumo.
  useFocusEffect(
    useCallback(() => {
      recarregar();
    }, [recarregar])
  );

  // Botao no cabecalho para marcar esta obra como ativa.
  const ativa = obraId === obraAtivaId;
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => selecionarObra(obraId)}
          disabled={ativa}
          style={styles.botaoAtivar}
          accessibilityRole="button"
          accessibilityState={{ selected: ativa }}
          accessibilityLabel={ativa ? 'Esta é a obra ativa' : 'Marcar como obra ativa'}
          hitSlop={8}
        >
          {/* Branco: o cabecalho de navegacao e marinho. */}
          <Ionicons name={ativa ? 'pin' : 'pin-outline'} size={18} color={cores.branco} />
          <Text style={styles.botaoAtivarTexto}>{ativa ? 'Ativa' : 'Tornar ativa'}</Text>
        </Pressable>
      ),
    });
  }, [navigation, ativa, obraId, selecionarObra]);

  function adicionar() {
    navigation.navigate('InsumoNovo', { obraId, nomeObra: obra.nome });
  }

  function remover(item) {
    confirmarRemocao(item, obra.nome, async () => {
      await removerInsumo(obraId, item.id);
      await Promise.all([recarregar(), recarregarObras()]);
    });
  }

  if (carregando) {
    return (
      <View style={[styles.container, styles.centro]}>
        <ActivityIndicator color={cores.grafite} />
      </View>
    );
  }

  if (erro || !obra) {
    return (
      <View style={styles.container}>
        <Text style={styles.aviso}>
          {erro ? `Não foi possível ler a obra: ${String(erro.message ?? erro)}` : 'Obra não encontrada.'}
        </Text>
      </View>
    );
  }

  const lista = !verItens ? [] : modo === 'insumos' ? insumos : (depreciacao?.itens ?? []);

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.conteudo}
      data={lista}
      keyExtractor={(item) => item.id}
      refreshing={false}
      onRefresh={recarregar}
      ItemSeparatorComponent={modo === 'insumos' ? () => <View style={styles.separador} /> : null}
      ListHeaderComponent={
        <>
          <Cabecalho
            obra={obra}
            resumo={resumo}
            depreciacao={depreciacao}
            offline={offline}
            atualizadoEm={atualizadoEm}
            verItens={verItens}
            podeEditar={podeEditar}
            modo={modo}
            setModo={setModo}
            aoAdicionar={adicionar}
          />
          {verItens && lista.length > 0 ? (
            <Text style={[styles.nota, styles.notaLista]}>
              {modo === 'insumos'
                ? 'Do maior para o menor custo.'
                : 'Por material, do maior para o menor impacto em reais.'}
            </Text>
          ) : null}
        </>
      }
      renderItem={({ item }) =>
        modo === 'insumos' ? (
          <ItemInsumo
            item={item}
            aoRemover={podeEditar && !offline ? () => remover(item) : undefined}
          />
        ) : (
          <ItemDepreciacao item={item} mesAtual={depreciacao?.mesAtual} />
        )
      }
      ListEmptyComponent={
        verItens && modo === 'insumos' ? (
          <Text style={styles.aviso}>
            Nenhum insumo nesta obra.{podeEditar ? ' Toque em "Adicionar insumo" para começar.' : ''}
          </Text>
        ) : null
      }
    />
  );
}

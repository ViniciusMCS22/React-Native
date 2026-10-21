

import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { View, Text, SectionList, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOrcamentoObra } from '../../hooks/useOrcamentoObra';
import { useObraAtiva } from '../../contexts/ObraAtivaContext';
import BarraVariacao from '../../components/BarraVariacao';
import SeloVariacao, { textoVariacao } from '../../components/SeloVariacao';
import PainelMarca from '../../components/PainelMarca';
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
  { chave: 'servico', rotulo: 'Serviços' },
  { chave: 'material', rotulo: 'Materiais' },
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

function ResumoDepreciacao({ d }) {
  if (!d) {
    return (
      <View style={styles.bloco}>
        <Text style={styles.nota}>
          Esta obra não tem preços SINAPI guardados na criação, então não há base
          para calcular a depreciação.
        </Text>
      </View>
    );
  }

  const cor = variacaoPreco[d.status].cor;
  return (
    <View style={styles.bloco}>
      <Text style={styles.tituloBloco}>Variação do valor da obra</Text>
      <Text style={styles.nota}>
        Preços guardados na criação: SINAPI-{d.uf} {mesReferencia(d.mesBase)}.
        Comparado com: SINAPI-{d.uf} {mesReferencia(d.mesAtual)}.
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

function Campo({ rotulo, valor, destaque }) {
  return (
    <View style={styles.campo}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <Text style={[styles.valor, destaque && styles.valorDestaque]}>{valor}</Text>
    </View>
  );
}

function Cabecalho({ obra, resumo, depreciacao, modo, setModo }) {
  return (
    <View style={styles.cabecalho}>
      <PainelMarca
        compacto
        sobretitulo={obra.cliente}
        titulo={obra.nome}
        descricao={`${obra.local} - ${obra.situacao}`}
        indicadores={[
          {
            rotulo: 'material previsto',
            valor: resumo ? moeda(resumo.custo_material) : '-',
          },
          { rotulo: 'término previsto', valor: data(obra.data_termino_prevista) },
        ]}
      />

      <View style={styles.bloco}>
        <Text style={styles.tituloBloco}>Identificação</Text>
        <Campo rotulo="Cliente" valor={obra.cliente} />
        <Campo rotulo="Local" valor={obra.local} />
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

      {resumo ? (
        <>
          <View style={styles.bloco}>
            <Text style={styles.tituloBloco}>Referência do orçamento</Text>
            <Campo rotulo="Orçamento" valor={`${resumo.descricao} (versão ${resumo.versao})`} />
            <Campo rotulo="Data-base" valor={resumo.data_base} />
            <Campo rotulo="Fonte de preços" valor={resumo.fonte_precos} />
            {resumo.sinapi_mes_referencia ? (
              <Campo
                rotulo="Preços guardados na criação"
                valor={`SINAPI-${resumo.sinapi_uf} ${mesReferencia(resumo.sinapi_mes_referencia)}`}
              />
            ) : null}
            <Campo rotulo="BDI" valor={percentual(resumo.bdi_percentual / 100, 2)} />
          </View>

          <View style={styles.bloco}>
            <Text style={styles.tituloBloco}>Custo de material</Text>
            <Text style={styles.nota}>
              Este projeto acompanha apenas insumos de material. Mão de obra,
              equipamentos e encargos não entram nestes valores.
            </Text>
            <Campo rotulo="Previsto (custo direto)" valor={moeda(resumo.custo_material)} destaque />
            <Campo rotulo="Previsto com BDI" valor={moeda(resumo.custo_material_com_bdi)} />
            {obra.area_construida_m2 ? (
              <Campo
                rotulo="Material por m² construído"
                valor={moeda(resumo.custo_material / obra.area_construida_m2)}
              />
            ) : null}
            <Campo
              rotulo="Composição"
              valor={`${resumo.qtd_etapas} etapas, ${resumo.qtd_servicos} serviços, ${resumo.qtd_materiais} materiais`}
            />
            <Campo rotulo="Comprado" valor="Sem compras registradas" />
            <Campo rotulo="Projeção ao término" valor="indefinido" />
          </View>

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

          {modo === 'depreciacao' ? <ResumoDepreciacao d={depreciacao} /> : null}
        </>
      ) : (
        <Text style={styles.aviso}>Esta obra ainda não tem orçamento cadastrado.</Text>
      )}
    </View>
  );
}

function CabecalhoServico({ section }) {
  return (
    <View style={styles.secao}>
      {section.primeiroDaEtapa ? <Text style={styles.etapa}>{section.etapa}</Text> : null}
      <View style={styles.secaoCartao}>
        <Text style={styles.secaoCodigo}>
          {section.item} - {section.codigo}
        </Text>
        <Text style={styles.secaoTitulo}>{section.descricao}</Text>
        <View style={styles.linhaEntre}>
          <Text style={styles.secaoMeta}>{quantidade(section.quantidade, section.unidade)}</Text>
          <Text style={styles.secaoTotal}>{moeda(section.custoPrevisto)}</Text>
        </View>
      </View>
    </View>
  );
}

function ItemMaterialDoServico({ item, section }) {
  return (
    <View style={styles.item}>
      <View style={styles.linhaEntre}>
        <Text style={styles.itemTitulo}>{item.descricao}</Text>
        <Text style={styles.itemTotal}>{moeda(item.custo_previsto)}</Text>
      </View>
      <Text style={styles.itemMeta}>
        {item.codigo} - coef. {numero(item.coeficiente, 4)} {item.unidade}/{section.unidade}
        {item.perda_percentual > 0 ? ` - perda ${numero(item.perda_percentual, 0)}%` : ''}
      </Text>
      <Text style={styles.itemMeta}>
        {quantidade(item.quantidade_planejada, item.unidade)} x {moeda(item.preco_unitario)}
      </Text>
    </View>
  );
}

function ItemMaterialConsolidado({ item }) {
  return (
    <View style={styles.item}>
      <View style={styles.linhaEntre}>
        <Text style={styles.itemTitulo}>{item.descricao}</Text>
        <Text style={styles.itemTotal}>{moeda(item.custo_previsto)}</Text>
      </View>
      <Text style={styles.itemMeta}>
        {item.codigo} - {item.categoria ?? 'Sem categoria'} - em {item.qtd_servicos}{' '}
        {item.qtd_servicos === 1 ? 'serviço' : 'serviços'}
      </Text>
      <View style={styles.linhaEntre}>
        <Text style={styles.itemMeta}>
          {quantidade(item.quantidade_planejada, item.unidade)} x {moeda(item.preco_medio)}
        </Text>
        <Text style={styles.itemMeta}>{percentual(item.participacao)} do total</Text>
      </View>
    </View>
  );
}

export default function ObraDetalhe({ route, navigation }) {
  const obraId = route.params?.obraId;
  const { carregando, erro, obra, resumo, servicos, materiais, depreciacao } =
    useOrcamentoObra(obraId);
  const { obraAtivaId, selecionarObra } = useObraAtiva();
  // O Inicio abre direto na aba Depreciacao passando { modo: 'depreciacao' }.
  const [modo, setModo] = useState(route.params?.modo ?? 'servico');

  useEffect(() => {
    if (route.params?.modo) setModo(route.params.modo);
  }, [route.params?.modo]);

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

  const secoes = useMemo(() => {
    if (modo === 'depreciacao') {
      return depreciacao?.itens.length ? [{ key: 'depreciacao', data: depreciacao.itens }] : [];
    }
    if (modo === 'material') {
      return materiais.length ? [{ key: 'materiais', data: materiais }] : [];
    }
    return servicos.map((s, i) => ({
      ...s,
      key: s.servicoId,
      primeiroDaEtapa: i === 0 || servicos[i - 1].etapa !== s.etapa,
    }));
  }, [modo, servicos, materiais, depreciacao]);

  if (carregando) {
    return (
      <View style={[styles.container, styles.centro]}>
        <ActivityIndicator color={cores.grafite} />
      </View>
    );
  }

  if (erro) {
    return (
      <View style={styles.container}>
        <Text style={styles.aviso}>Não foi possível ler o orçamento: {String(erro.message ?? erro)}</Text>
      </View>
    );
  }

  if (!obra) {
    return (
      <View style={styles.container}>
        <Text style={styles.aviso}>Obra não encontrada.</Text>
      </View>
    );
  }

  return (
    <SectionList
      style={styles.container}
      contentContainerStyle={styles.conteudo}
      sections={secoes}
      keyExtractor={(item) => item.id}
      stickySectionHeadersEnabled={false}
      ListHeaderComponent={
        <Cabecalho
          obra={obra}
          resumo={resumo}
          depreciacao={depreciacao}
          modo={modo}
          setModo={setModo}
        />
      }
      renderSectionHeader={({ section }) =>
        modo === 'servico' ? (
          <CabecalhoServico section={section} />
        ) : modo === 'depreciacao' ? (
          <Text style={[styles.nota, styles.notaLista]}>
            Por material, do maior para o menor impacto em reais.
          </Text>
        ) : (
          <Text style={styles.nota}>
            Cada material somado em todos os serviços em que aparece, do maior
            para o menor custo.
          </Text>
        )
      }
      renderItem={({ item, section }) =>
        modo === 'servico' ? (
          <ItemMaterialDoServico item={item} section={section} />
        ) : modo === 'depreciacao' ? (
          <ItemDepreciacao item={item} mesAtual={depreciacao?.mesAtual} />
        ) : (
          <ItemMaterialConsolidado item={item} />
        )
      }
      ListEmptyComponent={
        resumo && modo !== 'depreciacao' ? (
          <Text style={styles.aviso}>Orçamento sem itens de material.</Text>
        ) : null
      }
    />
  );
}

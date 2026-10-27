// src/screens/NovaObra/index.js
// Cadastro de obra (so 'orcamentos:editar': master, orcamentista e dev).
// A API cria a obra com a tabela SINAPI mais recente da UF; depois de criada,
// o app abre o detalhe dela para adicionar os insumos.
// Precisa de internet: a obra nasce na API.

import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useObraAtiva } from '../../contexts/ObraAtivaContext';
import { criarObra } from '../../repositories/obrasRepositorio';
import PainelMarca from '../../components/PainelMarca';
import { lerNumero } from '../../utils/formatacao';
import { cores } from '../../theme/cores';
import { styles } from './styles';

const SITUACOES = ['Planejamento', 'Em execução', 'Paralisada', 'Concluída'];
// Unica tabela SINAPI carregada na API por enquanto.
const UF = 'MA';

// 'dd/mm/aaaa' -> 'aaaa-mm-dd'. Vazio -> null. Invalido -> undefined.
function lerData(texto) {
  const limpo = texto.trim();
  if (!limpo) return null;
  const partes = limpo.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!partes) return undefined;
  const [, d, m, a] = partes;
  const data = new Date(`${a}-${m}-${d}T00:00:00`);
  if (Number.isNaN(data.getTime()) || data.getDate() !== Number(d)) return undefined;
  return `${a}-${m}-${d}`;
}

// Mascara simples: so digitos, com as barras no lugar.
function mascararData(texto) {
  const digitos = texto.replace(/\D/g, '').slice(0, 8);
  if (digitos.length <= 2) return digitos;
  if (digitos.length <= 4) return `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
  return `${digitos.slice(0, 2)}/${digitos.slice(2, 4)}/${digitos.slice(4)}`;
}

function Campo({ rotulo, obrigatorio, children, ajuda }) {
  return (
    <View style={styles.campo}>
      <Text style={styles.rotulo}>
        {rotulo}
        {obrigatorio ? <Text style={styles.obrigatorio}> *</Text> : null}
      </Text>
      {children}
      {ajuda ? <Text style={styles.ajuda}>{ajuda}</Text> : null}
    </View>
  );
}

function Entrada(props) {
  return (
    <TextInput
      style={styles.entrada}
      placeholderTextColor={cores.textoFraco}
      {...props}
    />
  );
}

export default function NovaObra({ navigation }) {
  const { temPermissao } = useAuth();
  const { recarregarObras } = useObraAtiva();
  const [form, setForm] = useState({
    nome: '',
    cliente: '',
    local: '',
    contrato: '',
    responsavel: '',
    situacao: 'Planejamento',
    area: '',
    inicio: '',
    termino: '',
    bdi: '',
  });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);

  const mudar = (campo) => (valor) => setForm((f) => ({ ...f, [campo]: valor }));

  function validar() {
    if (!form.nome.trim()) return { erro: 'Informe o nome da obra.' };
    const area = form.area.trim() ? lerNumero(form.area) : null;
    if (area !== null && !(area > 0)) return { erro: 'A área construída precisa ser maior que zero.' };
    const bdi = form.bdi.trim() ? lerNumero(form.bdi) : 0;
    if (!(bdi >= 0 && bdi <= 100)) return { erro: 'O BDI precisa estar entre 0 e 100%.' };
    const inicio = lerData(form.inicio);
    const termino = lerData(form.termino);
    if (inicio === undefined || termino === undefined) {
      return { erro: 'Digite as datas no formato dd/mm/aaaa.' };
    }
    if (inicio && termino && termino < inicio) {
      return { erro: 'O término previsto não pode ser antes do início.' };
    }
    const texto = (v) => v.trim() || null;
    return {
      dados: {
        nome: form.nome.trim(),
        cliente: form.cliente.trim(),
        local: form.local.trim(),
        contrato: texto(form.contrato),
        responsavel: texto(form.responsavel),
        situacao: form.situacao,
        area_construida_m2: area,
        data_inicio: inicio,
        data_termino_prevista: termino,
        bdi_percentual: bdi,
        uf: UF,
      },
    };
  }

  async function salvar() {
    const { erro: problema, dados } = validar();
    if (problema) {
      setErro(problema);
      return;
    }
    setErro(null);
    setSalvando(true);
    try {
      const obra = await criarObra(dados);
      await recarregarObras();
      // Troca esta tela pelo detalhe: o "voltar" leva para a lista, nao para o formulario.
      navigation.replace('ObraDetalhe', { obraId: obra.id, nome: obra.nome });
    } catch (e) {
      setErro(e.message);
      setSalvando(false);
    }
  }

  if (!temPermissao('orcamentos:editar')) {
    return (
      <View style={[styles.tela, styles.conteudo]}>
        <PainelMarca compacto sobretitulo="Obras" titulo="Nova obra" />
        <Text style={styles.ajuda}>Seu perfil não pode cadastrar obras.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.tela}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
        <PainelMarca
          compacto
          sobretitulo="Obras"
          titulo="Nova obra"
          descricao={`O orçamento usa a tabela SINAPI-${UF} mais recente. Depois de criar, adicione os insumos.`}
        />

        <View style={styles.cartao}>
          <Text style={styles.cartaoTitulo}>Identificação</Text>
          <Campo rotulo="Nome da obra" obrigatorio>
            <Entrada
              value={form.nome}
              onChangeText={mudar('nome')}
              placeholder="Ex.: Casa B"
              editable={!salvando}
              accessibilityLabel="Nome da obra"
            />
          </Campo>
          <Campo rotulo="Cliente">
            <Entrada value={form.cliente} onChangeText={mudar('cliente')} editable={!salvando} />
          </Campo>
          <Campo rotulo="Local">
            <Entrada
              value={form.local}
              onChangeText={mudar('local')}
              placeholder="Bairro, cidade - UF"
              editable={!salvando}
            />
          </Campo>
          <Campo rotulo="Contrato">
            <Entrada value={form.contrato} onChangeText={mudar('contrato')} editable={!salvando} />
          </Campo>
          <Campo rotulo="Responsável">
            <Entrada
              value={form.responsavel}
              onChangeText={mudar('responsavel')}
              editable={!salvando}
            />
          </Campo>
          <Campo rotulo="Situação">
            <View style={styles.opcoes}>
              {SITUACOES.map((s) => {
                const ativa = form.situacao === s;
                return (
                  <Pressable
                    key={s}
                    style={[styles.opcao, ativa && styles.opcaoAtiva]}
                    onPress={() => mudar('situacao')(s)}
                    disabled={salvando}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: ativa }}
                  >
                    <Text style={[styles.opcaoTexto, ativa && styles.opcaoTextoAtiva]}>{s}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Campo>
        </View>

        <View style={styles.cartao}>
          <Text style={styles.cartaoTitulo}>Prazo e orçamento</Text>
          <View style={styles.linha}>
            <View style={styles.metade}>
              <Campo rotulo="Início">
                <Entrada
                  value={form.inicio}
                  onChangeText={(t) => mudar('inicio')(mascararData(t))}
                  placeholder="dd/mm/aaaa"
                  keyboardType="number-pad"
                  editable={!salvando}
                  accessibilityLabel="Data de início"
                />
              </Campo>
            </View>
            <View style={styles.metade}>
              <Campo rotulo="Término previsto">
                <Entrada
                  value={form.termino}
                  onChangeText={(t) => mudar('termino')(mascararData(t))}
                  placeholder="dd/mm/aaaa"
                  keyboardType="number-pad"
                  editable={!salvando}
                  accessibilityLabel="Término previsto"
                />
              </Campo>
            </View>
          </View>
          <View style={styles.linha}>
            <View style={styles.metade}>
              <Campo rotulo="Área construída (m²)">
                <Entrada
                  value={form.area}
                  onChangeText={mudar('area')}
                  placeholder="Ex.: 128,5"
                  keyboardType="decimal-pad"
                  editable={!salvando}
                />
              </Campo>
            </View>
            <View style={styles.metade}>
              <Campo rotulo="BDI (%)">
                <Entrada
                  value={form.bdi}
                  onChangeText={mudar('bdi')}
                  placeholder="Ex.: 22,5"
                  keyboardType="decimal-pad"
                  editable={!salvando}
                />
              </Campo>
            </View>
          </View>
        </View>

        {erro ? (
          <Text style={styles.erro} accessibilityLiveRegion="polite">
            {erro}
          </Text>
        ) : null}

        <Pressable
          style={({ pressed }) => [styles.botao, (pressed || salvando) && styles.botaoPressionado]}
          onPress={salvar}
          disabled={salvando}
          accessibilityRole="button"
          accessibilityState={{ busy: salvando }}
        >
          {salvando ? (
            <ActivityIndicator color={cores.branco} />
          ) : (
            <Text style={styles.botaoTexto}>Criar obra</Text>
          )}
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

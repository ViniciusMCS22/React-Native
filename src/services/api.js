// src/services/api.js
// Cliente HTTP da API (pasta api/ na raiz do projeto).
//
// - Anexa o token de acesso em toda requisicao autenticada.
// - Se a API responder 401 (token de acesso expirou, dura 15 min), renova a
//   sessao uma vez com o token de renovacao e repete a requisicao.
// - So o token de renovacao e guardado no aparelho (SecureStore, criptografado).
//   O de acesso fica apenas em memoria.
// - O ultimo usuario logado tambem fica salvo: ao abrir o app sem internet, a
//   sessao continua (com `offline: true`) e as telas mostram a copia local dos
//   dados. Quando a conexao volta, a primeira requisicao renova o token.

import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

const CHAVE_RENOVACAO = 'token_renovacao';
const CHAVE_USUARIO = 'usuario_salvo';
const TEMPO_LIMITE_MS = 10000;

// Ordem: variavel EXPO_PUBLIC_API_URL > IP do computador que roda o Expo
// (funciona no celular fisico com Expo Go) > padrao do emulador/simulador.
function descobrirUrlBase() {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  if (host) return `http://${host}:8000`;
  return Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';
}

export const URL_API = descobrirUrlBase();

export class ErroApi extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }
}

// --- Armazenamento no aparelho ----------------------------------------------
// SecureStore nao existe na web; la tudo fica so em memoria.
const memoria = {};

async function ler(chave) {
  if (Platform.OS === 'web') return memoria[chave] ?? null;
  return SecureStore.getItemAsync(chave);
}

async function gravar(chave, valor) {
  if (Platform.OS === 'web') {
    memoria[chave] = valor;
  } else if (valor) {
    await SecureStore.setItemAsync(chave, valor);
  } else {
    await SecureStore.deleteItemAsync(chave);
  }
}

const lerRenovacao = () => ler(CHAVE_RENOVACAO);
const gravarRenovacao = (token) => gravar(CHAVE_RENOVACAO, token);

async function lerUsuarioSalvo() {
  try {
    return JSON.parse(await ler(CHAVE_USUARIO));
  } catch {
    return null;
  }
}

// --- Estado da sessao ------------------------------------------------------
let tokenAcesso = null;
let renovacaoEmAndamento = null;
let aoExpirarSessao = null;

// O AuthContext registra aqui o que fazer quando a sessao nao puder ser renovada.
export function definirAoExpirarSessao(callback) {
  aoExpirarSessao = callback;
}

async function guardarTokens(resposta) {
  tokenAcesso = resposta.token_acesso;
  await gravarRenovacao(resposta.token_renovacao);
  await gravar(CHAVE_USUARIO, JSON.stringify(resposta.usuario));
  return resposta.usuario;
}

async function limparTokens() {
  tokenAcesso = null;
  await gravarRenovacao(null);
  await gravar(CHAVE_USUARIO, null);
}

// --- Requisicao base -------------------------------------------------------
function mensagemDoErro(corpo, status) {
  const detalhe = corpo?.detail;
  // Erros de validacao do FastAPI (422) vem como lista.
  if (Array.isArray(detalhe)) return detalhe.map((d) => d.msg).join('\n');
  if (typeof detalhe === 'string') return detalhe;
  return `Erro inesperado da API (${status}).`;
}

async function enviar(caminho, { metodo = 'GET', corpo, token } = {}) {
  const controle = new AbortController();
  const temporizador = setTimeout(() => controle.abort(), TEMPO_LIMITE_MS);
  let resposta;
  try {
    resposta = await fetch(`${URL_API}${caminho}`, {
      method: metodo,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: corpo ? JSON.stringify(corpo) : undefined,
      signal: controle.signal,
    });
  } catch {
    throw new ErroApi(
      0,
      `Não foi possível conectar à API (${URL_API}). Confira se ela está rodando e se o celular está na mesma rede.`
    );
  } finally {
    clearTimeout(temporizador);
  }

  if (resposta.status === 204) return null;
  const dados = await resposta.json().catch(() => null);
  if (!resposta.ok) throw new ErroApi(resposta.status, mensagemDoErro(dados, resposta.status));
  return dados;
}

// Varias requisicoes podem receber 401 ao mesmo tempo; todas esperam a
// mesma renovacao em vez de cada uma gastar um token (que e de uso unico).
function renovarSessao() {
  if (!renovacaoEmAndamento) {
    renovacaoEmAndamento = (async () => {
      const tokenRenovacao = await lerRenovacao();
      if (!tokenRenovacao) throw new ErroApi(401, 'Sessão expirada. Faça login novamente.');
      try {
        const resposta = await enviar('/auth/renovar', {
          metodo: 'POST',
          corpo: { token_renovacao: tokenRenovacao },
        });
        return await guardarTokens(resposta);
      } catch (e) {
        // So descarta a sessao se a API recusou; sem rede, mantem para tentar depois.
        if (e.status === 401) await limparTokens();
        throw e;
      }
    })().finally(() => {
      renovacaoEmAndamento = null;
    });
  }
  return renovacaoEmAndamento;
}

// Requisicao autenticada, com renovacao automatica.
export async function requisicao(caminho, opcoes = {}) {
  try {
    return await enviar(caminho, { ...opcoes, token: tokenAcesso });
  } catch (e) {
    if (e.status !== 401) throw e;
    try {
      await renovarSessao();
    } catch (erroRenovacao) {
      if (erroRenovacao.status === 401) aoExpirarSessao?.();
      throw erroRenovacao;
    }
    return enviar(caminho, { ...opcoes, token: tokenAcesso });
  }
}

// --- Autenticacao ----------------------------------------------------------
export async function login(email, senha) {
  const resposta = await enviar('/auth/login', { metodo: 'POST', corpo: { email, senha } });
  return guardarTokens(resposta);
}

// Usado ao abrir o app: se houver sessao salva, renova e devolve o usuario.
// Sem conexao, devolve o ultimo usuario salvo com `offline: true`.
export async function restaurarSessao() {
  if (!(await lerRenovacao())) return null;
  try {
    return await renovarSessao();
  } catch (e) {
    const salvo = e.status === 0 ? await lerUsuarioSalvo() : null;
    if (!salvo) throw e;
    return { ...salvo, offline: true };
  }
}

export async function logout() {
  const tokenRenovacao = await lerRenovacao();
  await limparTokens();
  if (tokenRenovacao) {
    // Melhor esforco: se a API estiver fora, a sessao local ja foi apagada.
    enviar('/auth/logout', { metodo: 'POST', corpo: { token_renovacao: tokenRenovacao } }).catch(
      () => {}
    );
  }
}

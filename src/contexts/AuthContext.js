// src/contexts/AuthContext.js
// Usuario logado e suas permissoes, disponiveis para todas as telas.
// A navegacao usa `usuario` para decidir entre a tela de login e as abas.
// Sem internet ao abrir o app, a sessao salva continua (usuario.offline) e as
// telas mostram a copia local dos dados.
//
// Precisa estar dentro do <SQLiteProvider> (ver App.js): ao sair, apaga a
// copia local dos dados da API.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import * as api from '../services/api';
import { limparCache } from '../repositories/cacheRepositorio';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const db = useSQLiteContext();
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  // Erro ao restaurar a sessao salva (ex.: API fora do ar ao abrir o app).
  const [erroSessao, setErroSessao] = useState(null);

  const restaurar = useCallback(async () => {
    setCarregando(true);
    setErroSessao(null);
    try {
      setUsuario(await api.restaurarSessao());
    } catch (e) {
      setUsuario(null);
      // 401 = sessao vencida, e normal: so mostra o login. Outros erros, avisa.
      if (e.status !== 401) setErroSessao(e.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    api.definirAoExpirarSessao(() => setUsuario(null));
    restaurar();
    return () => api.definirAoExpirarSessao(null);
  }, [restaurar]);

  const entrar = useCallback(async (email, senha) => {
    const logado = await api.login(email.trim().toLowerCase(), senha);
    setErroSessao(null);
    setUsuario(logado);
    return logado;
  }, []);

  const sair = useCallback(async () => {
    await api.logout();
    await limparCache(db);
    setUsuario(null);
  }, [db]);

  const temPermissao = useCallback(
    (permissao) => Boolean(usuario?.permissoes?.includes(permissao)),
    [usuario]
  );

  const valor = useMemo(
    () => ({ usuario, carregando, erroSessao, entrar, sair, restaurar, temPermissao }),
    [usuario, carregando, erroSessao, entrar, sair, restaurar, temPermissao]
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error('useAuth precisa estar dentro de AuthProvider.');
  }
  return contexto;
}

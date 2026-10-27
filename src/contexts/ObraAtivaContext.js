// src/contexts/ObraAtivaContext.js
// A obra ativa e estado global: o usuario de campo trabalha em uma obra por vez
// e passar obraId por parametro de rota em toda tela vira ruido.
//
// O usuario marca a obra ativa explicitamente ("Tornar ativa" na aba Obras ou
// no detalhe da obra). A escolha fica salva nas preferencias (SQLite), entao
// continua valendo ao reabrir o app. O Inicio mostra os dados dela.
//
// A lista vem da API. Sem internet, vem a ultima copia salva (`offline` e
// `atualizadoEm` dizem de quando ela e).
//
// Precisa estar dentro do <SQLiteProvider>, do <AuthProvider> e do
// <PreferenciasProvider> (ver App.js).

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { listarObras } from '../repositories/obrasRepositorio';
import { useAuth } from './AuthContext';
import { usePreferencias } from './PreferenciasContext';

const ObraAtivaContext = createContext(null);

export function ObraAtivaProvider({ children }) {
  const db = useSQLiteContext();
  const { usuario } = useAuth();
  const usuarioId = usuario?.id ?? null;
  const { preferencias, carregando: carregandoPreferencias, definirPreferencia } =
    usePreferencias();
  const [obras, setObras] = useState([]);
  const [origem, setOrigem] = useState({ offline: false, atualizadoEm: null });
  const [carregandoObras, setCarregandoObras] = useState(true);
  const [erro, setErro] = useState(null);

  const recarregarObras = useCallback(async () => {
    // Sem login nao ha o que buscar (a API exige token).
    if (!usuarioId) {
      setObras([]);
      setCarregandoObras(false);
      return;
    }
    try {
      setErro(null);
      const { obras: lista, offline, atualizadoEm } = await listarObras(db, usuarioId);
      setObras(lista);
      setOrigem({ offline, atualizadoEm });
    } catch (e) {
      setErro(e);
    } finally {
      setCarregandoObras(false);
    }
  }, [db, usuarioId]);

  useEffect(() => {
    recarregarObras();
  }, [recarregarObras]);

  const selecionarObra = useCallback(
    (obraId) => definirPreferencia('obraAtivaId', obraId),
    [definirPreferencia]
  );

  const valor = useMemo(() => {
    // Se a obra salva nao existir mais (excluida), fica sem obra ativa.
    const obraAtiva = obras.find((o) => o.id === preferencias.obraAtivaId) ?? null;
    return {
      obras,
      obraAtiva,
      obraAtivaId: obraAtiva?.id ?? null,
      carregando: carregandoObras || carregandoPreferencias,
      erro,
      offline: origem.offline,
      atualizadoEm: origem.atualizadoEm,
      selecionarObra,
      recarregarObras,
    };
  }, [
    obras,
    preferencias.obraAtivaId,
    carregandoObras,
    carregandoPreferencias,
    erro,
    origem,
    selecionarObra,
    recarregarObras,
  ]);

  return (
    <ObraAtivaContext.Provider value={valor}>
      {children}
    </ObraAtivaContext.Provider>
  );
}

export function useObraAtiva() {
  const contexto = useContext(ObraAtivaContext);
  if (!contexto) {
    throw new Error('useObraAtiva precisa estar dentro de ObraAtivaProvider.');
  }
  return contexto;
}

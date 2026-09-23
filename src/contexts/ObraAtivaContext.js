// src/contexts/ObraAtivaContext.js
// A obra ativa e estado global: o usuario de campo trabalha em uma obra por vez
// e passar obraId por parametro de rota em toda tela vira ruido.
// A aba Obras e quem troca a obra ativa.
//
// As obras agora vem do banco local (SQLite). Este provider precisa estar
// dentro do <SQLiteProvider> (ver App.js).

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { listarObras } from '../repositories/obrasRepositorio';

const ObraAtivaContext = createContext(null);

export function ObraAtivaProvider({ children }) {
  const db = useSQLiteContext();
  const [obras, setObras] = useState([]);
  const [obraAtivaId, setObraAtivaId] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const recarregarObras = useCallback(async () => {
    try {
      setErro(null);
      const lista = await listarObras(db);
      setObras(lista);
      // Mantem a obra ativa se ela ainda existir; senao, ativa a primeira.
      setObraAtivaId((atual) =>
        lista.some((o) => o.id === atual) ? atual : lista[0]?.id ?? null
      );
    } catch (e) {
      setErro(e);
    } finally {
      setCarregando(false);
    }
  }, [db]);

  useEffect(() => {
    recarregarObras();
  }, [recarregarObras]);

  const valor = useMemo(() => {
    const obraAtiva = obras.find((o) => o.id === obraAtivaId) ?? null;
    return {
      obras,
      obraAtiva,
      obraAtivaId,
      carregando,
      erro,
      selecionarObra: setObraAtivaId,
      recarregarObras,
    };
  }, [obras, obraAtivaId, carregando, erro, recarregarObras]);

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

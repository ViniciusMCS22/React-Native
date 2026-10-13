// src/contexts/PreferenciasContext.js
// Preferencias do usuario, salvas no SQLite. Ficam em contexto para que
// qualquer tela possa ler (ex.: o limite de desvio no semaforo) sem consultar
// o banco de novo.
//
// Precisa estar dentro do <SQLiteProvider> (ver App.js).

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import {
  lerPreferencias,
  salvarPreferencia,
  apagarPreferencias,
} from '../repositories/preferenciasRepositorio';

export const PREFERENCIAS_PADRAO = {
  notificacoes: true,
  alertaDesvio: true,
  limiteAlerta: 10, // em %
  sincAutomatica: true,
  somenteWifi: false,
  ultimaSinc: null, // ISO-8601
  obraAtivaId: null, // escolhida na aba Obras (ver ObraAtivaContext)
};

// Estado do app, nao preferencia: "Restaurar padroes" nao mexe nelas.
const CHAVES_MANTIDAS = ['ultimaSinc', 'obraAtivaId'];
const CHAVES_RESTAURAVEIS = Object.keys(PREFERENCIAS_PADRAO).filter(
  (chave) => !CHAVES_MANTIDAS.includes(chave)
);

const PreferenciasContext = createContext(null);

export function PreferenciasProvider({ children }) {
  const db = useSQLiteContext();
  const [preferencias, setPreferencias] = useState(PREFERENCIAS_PADRAO);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  // Espelho do estado para ler o valor anterior sem depender do updater.
  const atualRef = useRef(preferencias);
  atualRef.current = preferencias;

  useEffect(() => {
    let ativo = true;
    lerPreferencias(db)
      .then((salvas) => {
        if (ativo) setPreferencias({ ...PREFERENCIAS_PADRAO, ...salvas });
      })
      .catch((e) => ativo && setErro(e))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [db]);

  // Atualiza a tela na hora e grava em seguida. Se a gravacao falhar,
  // desfaz a mudanca para a tela nao mostrar algo que nao foi salvo.
  const definirPreferencia = useCallback(
    async (chave, valor) => {
      const anterior = atualRef.current[chave];
      setPreferencias((atual) => ({ ...atual, [chave]: valor }));
      try {
        setErro(null);
        await salvarPreferencia(db, chave, valor);
      } catch (e) {
        setPreferencias((atual) => ({ ...atual, [chave]: anterior }));
        setErro(e);
      }
    },
    [db]
  );

  const restaurarPadroes = useCallback(async () => {
    try {
      setErro(null);
      await apagarPreferencias(db, CHAVES_RESTAURAVEIS);
      setPreferencias((atual) => {
        const mantidas = Object.fromEntries(CHAVES_MANTIDAS.map((c) => [c, atual[c]]));
        return { ...PREFERENCIAS_PADRAO, ...mantidas };
      });
    } catch (e) {
      setErro(e);
    }
  }, [db]);

  const valor = useMemo(
    () => ({ preferencias, carregando, erro, definirPreferencia, restaurarPadroes }),
    [preferencias, carregando, erro, definirPreferencia, restaurarPadroes]
  );

  return (
    <PreferenciasContext.Provider value={valor}>
      {children}
    </PreferenciasContext.Provider>
  );
}

export function usePreferencias() {
  const contexto = useContext(PreferenciasContext);
  if (!contexto) {
    throw new Error('usePreferencias precisa estar dentro de PreferenciasProvider.');
  }
  return contexto;
}

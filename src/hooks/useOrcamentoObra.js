// src/hooks/useOrcamentoObra.js
// Carrega do banco tudo que a tela de detalhe da obra precisa.

import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import {
  buscarObra,
  buscarResumoOrcamento,
  listarServicosComMateriais,
  listarMateriaisConsolidados,
} from '../repositories/obrasRepositorio';
import { calcularDepreciacao } from '../repositories/depreciacaoRepositorio';

export function useOrcamentoObra(obraId) {
  const db = useSQLiteContext();
  const [estado, setEstado] = useState({
    carregando: true,
    erro: null,
    obra: null,
    resumo: null,
    servicos: [],
    materiais: [],
    depreciacao: null,
  });

  const carregar = useCallback(async () => {
    if (!obraId) {
      setEstado((e) => ({ ...e, carregando: false }));
      return;
    }
    try {
      setEstado((e) => ({ ...e, carregando: true, erro: null }));
      const [obra, resumo] = await Promise.all([
        buscarObra(db, obraId),
        buscarResumoOrcamento(db, obraId),
      ]);
      const [servicos, materiais, depreciacao] = resumo
        ? await Promise.all([
            listarServicosComMateriais(db, resumo.id),
            listarMateriaisConsolidados(db, resumo.id),
            calcularDepreciacao(db, resumo.id),
          ])
        : [[], [], null];
      setEstado({ carregando: false, erro: null, obra, resumo, servicos, materiais, depreciacao });
    } catch (erro) {
      setEstado((e) => ({ ...e, carregando: false, erro }));
    }
  }, [db, obraId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return { ...estado, recarregar: carregar };
}

// src/hooks/useOrcamentoObra.js
// Carrega da API tudo que as telas de uma obra precisam: dados, resumo do
// orcamento, insumos (so com 'orcamentos:ver') e depreciacao. Sem internet,
// usa a ultima copia salva (`offline`, `atualizadoEm`).

import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { useAuth } from '../contexts/AuthContext';
import { carregarObra } from '../repositories/obrasRepositorio';

const VAZIO = {
  carregando: true,
  erro: null,
  obra: null,
  resumo: null,
  insumos: [],
  depreciacao: null,
  offline: false,
  atualizadoEm: null,
};

export function useOrcamentoObra(obraId) {
  const db = useSQLiteContext();
  const { usuario, temPermissao } = useAuth();
  const usuarioId = usuario?.id ?? null;
  const comInsumos = temPermissao('orcamentos:ver');
  const [estado, setEstado] = useState(VAZIO);

  const carregar = useCallback(async () => {
    if (!obraId || !usuarioId) {
      setEstado({ ...VAZIO, carregando: false });
      return;
    }
    try {
      // Recarregar a mesma obra (ex.: ao voltar para a tela) atualiza em silencio,
      // sem trocar o conteudo pelo indicador de carregamento.
      setEstado((e) => ({ ...e, carregando: e.obra?.id !== obraId, erro: null }));
      const dados = await carregarObra(db, usuarioId, obraId, { comInsumos });
      setEstado({ ...dados, carregando: false, erro: null });
    } catch (erro) {
      setEstado((e) => ({ ...e, carregando: false, erro }));
    }
  }, [db, usuarioId, obraId, comInsumos]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return { ...estado, recarregar: carregar };
}

// src/screens/Obras/styles.js
import { StyleSheet } from 'react-native';
import { cores } from '../../theme/cores';

export const styles = StyleSheet.create({
  lista: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  centro: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  conteudo: {
    padding: 16,
    gap: 12,
  },
  introducao: {
    fontSize: 14,
    lineHeight: 20,
    color: cores.textoFraco,
    marginBottom: 4,
  },
  vazio: {
    fontSize: 15,
    color: cores.textoFraco,
    paddingVertical: 32,
  },
  cartao: {
    minHeight: 44,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.fundo,
    gap: 2,
  },
  cartaoAtivo: {
    borderColor: cores.grafite,
    borderWidth: 2,
    backgroundColor: cores.fundoAlternativo,
  },
  cartaoTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  nome: {
    fontSize: 17,
    fontWeight: '600',
    color: cores.texto,
    flexShrink: 1,
  },
  marcaAtiva: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: cores.borda,
  },
  marcaAtivaTexto: {
    fontSize: 12,
    fontWeight: '600',
    color: cores.grafite,
  },
  linha: {
    fontSize: 14,
    color: cores.textoFraco,
  },
  valor: {
    fontSize: 14,
    fontWeight: '600',
    color: cores.texto,
    marginTop: 4,
  },
});

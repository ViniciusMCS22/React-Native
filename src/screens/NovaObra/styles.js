// src/screens/NovaObra/styles.js
import { StyleSheet } from 'react-native';
import { cores, marca } from '../../theme/cores';
import { espacos, raios } from '../../theme/medidas';

export const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.fundoAlternativo,
  },
  conteudo: {
    padding: espacos.lg,
    paddingBottom: espacos.xxxl,
    gap: espacos.md,
  },
  cartao: {
    padding: espacos.lg,
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.fundo,
    gap: espacos.md,
  },
  cartaoTitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: cores.texto,
  },
  campo: {
    gap: 6,
  },
  rotulo: {
    fontSize: 14,
    fontWeight: '600',
    color: cores.texto,
  },
  obrigatorio: {
    color: cores.textoFraco,
  },
  ajuda: {
    fontSize: 13,
    lineHeight: 18,
    color: cores.textoFraco,
  },
  entrada: {
    minHeight: 48,
    paddingHorizontal: espacos.md,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.fundo,
    fontSize: 16,
    color: cores.texto,
  },
  linha: {
    flexDirection: 'row',
    gap: espacos.md,
  },
  metade: {
    flex: 1,
  },

  opcoes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espacos.sm,
  },
  opcao: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: espacos.md,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  opcaoAtiva: {
    borderColor: cores.grafite,
    backgroundColor: cores.grafite,
  },
  opcaoTexto: {
    fontSize: 14,
    color: cores.texto,
  },
  opcaoTextoAtiva: {
    color: cores.branco,
    fontWeight: '600',
  },

  erro: {
    fontSize: 14,
    lineHeight: 20,
    color: cores.texto,
    padding: espacos.md,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: cores.grafite,
    backgroundColor: cores.fundo,
  },
  botao: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: raios.md,
    backgroundColor: marca.marinho,
  },
  botaoPressionado: {
    opacity: 0.8,
  },
  botaoTexto: {
    fontSize: 17,
    fontWeight: '600',
    color: cores.branco,
  },
});

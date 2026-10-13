// src/screens/Inicio/styles.js
import { StyleSheet } from 'react-native';
import { cores } from '../../theme/cores';
import { espacos, raios } from '../../theme/medidas';

export const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.fundoAlternativo,
  },
  centro: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  conteudo: {
    padding: espacos.lg,
    paddingBottom: espacos.xxxl,
    gap: espacos.md,
  },

  // 1. Mensagem
  mensagem: {
    padding: espacos.xl,
    borderRadius: raios.lg,
    backgroundColor: cores.grafite,
    gap: espacos.xs,
  },
  data: {
    fontSize: 13,
    color: cores.borda,
  },
  saudacao: {
    fontSize: 24,
    fontWeight: '700',
    color: cores.branco,
  },
  resumo: {
    marginTop: espacos.md,
    padding: espacos.md,
    borderRadius: raios.md,
    backgroundColor: cores.fundo,
    gap: espacos.sm,
  },
  resumoLinha: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: espacos.sm,
  },
  resumoTexto: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: cores.texto,
  },

  secaoTitulo: {
    fontSize: 13,
    fontWeight: '600',
    color: cores.textoFraco,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: espacos.sm,
    marginLeft: espacos.xs,
  },

  cartao: {
    padding: espacos.lg,
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.fundo,
    gap: espacos.md,
  },
  vazioTitulo: {
    fontSize: 17,
    fontWeight: '600',
    color: cores.texto,
  },
  nota: {
    fontSize: 13,
    lineHeight: 18,
    color: cores.textoFraco,
  },
  linhaEntre: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: espacos.sm,
  },

  // 2. Obra ativa
  obraTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: espacos.sm,
  },
  obraNome: {
    flexShrink: 1,
    fontSize: 20,
    fontWeight: '700',
    color: cores.texto,
  },
  marca: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.xs,
    paddingHorizontal: espacos.sm,
    paddingVertical: espacos.xs,
    borderRadius: raios.sm,
    backgroundColor: cores.borda,
  },
  marcaTexto: {
    fontSize: 12,
    fontWeight: '600',
    color: cores.grafite,
  },
  prazo: {
    gap: 6,
  },
  trilho: {
    height: 8,
    borderRadius: raios.sm,
    backgroundColor: cores.fundoAlternativo,
    overflow: 'hidden',
  },
  trilhoCheio: {
    height: '100%',
    backgroundColor: cores.grafite,
  },
  carregandoInterno: {
    paddingVertical: espacos.lg,
  },
  campos: {
    gap: espacos.sm,
  },
  campo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: espacos.md,
  },
  rotulo: {
    fontSize: 14,
    color: cores.textoFraco,
  },
  valor: {
    flexShrink: 1,
    fontSize: 14,
    color: cores.texto,
    textAlign: 'right',
  },
  valorDestaque: {
    fontWeight: '700',
  },
  acoes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espacos.sm,
  },
  botao: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: espacos.xs,
    minHeight: 44,
    paddingHorizontal: espacos.md,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: cores.grafite,
  },
  botaoPressionado: {
    backgroundColor: cores.fundoAlternativo,
  },
  botaoTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: cores.grafite,
  },

  // 3. Depreciacao
  indice: {
    fontSize: 28,
    fontWeight: '700',
  },
  maiores: {
    gap: espacos.sm,
    paddingTop: espacos.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: cores.borda,
  },
  maioresLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.md,
  },
  maioresTextos: {
    flex: 1,
    gap: espacos.xxs,
  },
  maioresNome: {
    fontSize: 14,
    fontWeight: '600',
    color: cores.texto,
  },
  maioresValor: {
    fontSize: 14,
    fontWeight: '700',
  },
});

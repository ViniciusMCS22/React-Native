// src/screens/ApagarObra/styles.js
import { StyleSheet } from 'react-native';
import { cores, marca, perigo } from '../../theme/cores';
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
  cabecalho: {
    gap: espacos.md,
  },
  aviso: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: espacos.sm,
    padding: espacos.md,
    borderRadius: raios.md,
    borderWidth: 1.5,
    borderColor: perigo.cor,
    backgroundColor: perigo.fundo,
  },
  avisoTexto: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: cores.texto,
  },
  secaoTitulo: {
    fontSize: 13,
    fontWeight: '700',
    color: marca.marinho,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingLeft: espacos.sm,
    borderLeftWidth: 3,
    borderLeftColor: marca.marinho,
  },
  nota: {
    fontSize: 13,
    lineHeight: 18,
    color: cores.textoFraco,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espacos.md,
    padding: espacos.lg,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.fundo,
  },
  itemPressionado: {
    backgroundColor: cores.fundoAlternativo,
  },
  itemTopo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: espacos.md,
  },
  itemTextos: {
    flex: 1,
    gap: espacos.xxs,
  },
  itemNome: {
    fontSize: 16,
    fontWeight: '600',
    color: cores.texto,
  },
  cartao: {
    padding: espacos.lg,
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.fundo,
  },
  link: {
    fontSize: 14,
    fontWeight: '600',
    color: cores.grafite,
    textDecorationLine: 'underline',
  },
  campo: {
    gap: 6,
  },
  rotulo: {
    fontSize: 14,
    fontWeight: '600',
    color: cores.texto,
  },
  nomeDestaque: {
    fontWeight: '800',
  },
  entrada: {
    minHeight: 52,
    paddingHorizontal: espacos.lg,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.fundo,
    fontSize: 16,
    color: cores.texto,
  },
  entradaComIcone: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  entradaFlex: {
    flex: 1,
    paddingRight: 52,
  },
  botaoOlho: {
    position: 'absolute',
    right: 0,
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
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
  botaoApagar: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: espacos.sm,
    borderRadius: raios.md,
    backgroundColor: perigo.cor,
  },
  botaoApagarDesabilitado: {
    opacity: 0.4,
  },
  botaoApagarPressionado: {
    opacity: 0.8,
  },
  botaoApagarTexto: {
    fontSize: 17,
    fontWeight: '700',
    color: cores.branco,
  },
});

// src/screens/Login/styles.js
import { StyleSheet } from 'react-native';
import { cores } from '../../theme/cores';
import { espacos, raios } from '../../theme/medidas';

export const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  conteudo: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: espacos.xxl,
    gap: espacos.lg,
  },
  cabecalho: {
    alignItems: 'center',
    gap: espacos.xs,
    marginBottom: espacos.lg,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.grafite,
    marginBottom: espacos.sm,
  },
  titulo: {
    fontSize: 24,
    fontWeight: '700',
    color: cores.texto,
  },
  subtitulo: {
    fontSize: 15,
    color: cores.textoFraco,
    textAlign: 'center',
  },

  campo: {
    gap: 6,
  },
  rotulo: {
    fontSize: 14,
    fontWeight: '600',
    color: cores.texto,
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
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: espacos.sm,
    padding: espacos.md,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: cores.grafite,
    backgroundColor: cores.fundoAlternativo,
  },
  erroTexto: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: cores.texto,
  },
  link: {
    fontSize: 15,
    fontWeight: '600',
    color: cores.grafite,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },

  botao: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: raios.md,
    backgroundColor: cores.grafite,
    marginTop: espacos.xs,
  },
  botaoPressionado: {
    opacity: 0.8,
  },
  botaoTexto: {
    fontSize: 17,
    fontWeight: '600',
    color: cores.branco,
  },

  dev: {
    marginTop: espacos.lg,
    paddingTop: espacos.lg,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
    gap: espacos.sm,
  },
  devTitulo: {
    fontSize: 12,
    fontWeight: '600',
    color: cores.textoFraco,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  devOpcoes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: espacos.sm,
  },
  devOpcao: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: espacos.md,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  devOpcaoTexto: {
    fontSize: 13,
    color: cores.texto,
  },
  devUrl: {
    fontSize: 12,
    color: cores.textoFraco,
  },
});

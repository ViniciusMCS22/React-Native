// src/screens/Obras/styles.js
import { StyleSheet } from 'react-native';
import { cores } from '../../theme/cores';
import { espacos, raios } from '../../theme/medidas';

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
    padding: espacos.lg,
    gap: espacos.md,
  },
  introducao: {
    fontSize: 14,
    lineHeight: 20,
    color: cores.textoFraco,
    marginBottom: espacos.xs,
  },
  vazio: {
    fontSize: 15,
    color: cores.textoFraco,
    paddingVertical: espacos.xxxl,
  },
  cartao: {
    minHeight: 44,
    padding: espacos.lg,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.fundo,
    gap: espacos.xxs,
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
    marginBottom: espacos.xs,
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
    gap: espacos.xs,
    paddingHorizontal: espacos.sm,
    paddingVertical: espacos.xs,
    borderRadius: raios.sm,
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
    marginTop: espacos.xs,
  },
  botaoAtivar: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: espacos.xs,
    minHeight: 40,
    marginTop: espacos.sm,
    paddingHorizontal: espacos.md,
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: cores.grafite,
  },
  botaoAtivarPressionado: {
    backgroundColor: cores.fundoAlternativo,
  },
  botaoAtivarTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: cores.grafite,
  },
});

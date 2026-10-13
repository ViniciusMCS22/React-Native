// src/screens/Sobre/styles.js
import { StyleSheet } from 'react-native';
import { cores } from '../../theme/cores';
import { espacos } from '../../theme/medidas';

export const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: cores.fundoAlternativo,
  },
  conteudo: {
    padding: espacos.lg,
    paddingBottom: espacos.xxxl,
    gap: espacos.xl,
  },
  cabecalho: {
    alignItems: 'center',
    paddingVertical: espacos.lg,
    gap: 6,
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
  nome: {
    fontSize: 20,
    fontWeight: '600',
    color: cores.texto,
  },
  versao: {
    fontSize: 14,
    color: cores.textoFraco,
  },
  rodape: {
    fontSize: 12,
    color: cores.textoFraco,
    textAlign: 'center',
  },
});

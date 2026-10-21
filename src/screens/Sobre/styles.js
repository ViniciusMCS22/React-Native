// src/screens/Sobre/styles.js
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
    gap: espacos.xl,
  },
  cartaoMarca: {
    paddingHorizontal: espacos.xxl,
    paddingVertical: espacos.xxxl,
    gap: espacos.xxl,
    borderRadius: raios.lg,
    backgroundColor: marca.azul,
    overflow: 'hidden',
  },
  cartaoTextos: {
    gap: espacos.xxs,
  },
  nome: {
    fontSize: 20,
    fontWeight: '700',
    color: cores.branco,
  },
  versao: {
    fontSize: 14,
    color: marca.textoSobreMarca,
  },
  rodape: {
    fontSize: 12,
    lineHeight: 18,
    color: cores.textoFraco,
    textAlign: 'center',
  },
});

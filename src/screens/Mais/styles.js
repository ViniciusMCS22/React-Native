// src/screens/Mais/styles.js
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
  centro: {
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

  perfil: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: espacos.xl,
    borderRadius: raios.lg,
    backgroundColor: marca.azul,
    overflow: 'hidden',
  },
  perfilPressionado: {
    opacity: 0.85,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.branco,
  },
  avatarTexto: {
    fontSize: 20,
    fontWeight: '700',
    color: marca.marinho,
  },
  perfilTextos: {
    flex: 1,
    gap: espacos.xxs,
  },
  perfilNome: {
    fontSize: 18,
    fontWeight: '700',
    color: cores.branco,
  },
  perfilLinha: {
    fontSize: 13,
    color: marca.textoSobreMarca,
  },
  marcaPerfil: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: espacos.xs,
    marginTop: espacos.xs,
    paddingHorizontal: espacos.sm,
    paddingVertical: espacos.xxs,
    borderRadius: raios.sm,
    backgroundColor: marca.superficieSobreMarca,
  },
  marcaPerfilTexto: {
    fontSize: 12,
    fontWeight: '600',
    color: cores.branco,
  },


  limite: {
    paddingHorizontal: espacos.lg,
    paddingVertical: espacos.md,
    gap: espacos.sm,
  },
  desabilitado: {
    opacity: 0.5,
  },
  limiteTitulo: {
    fontSize: 14,
    color: cores.texto,
  },
  segmentos: {
    flexDirection: 'row',
    gap: espacos.sm,
  },
  segmento: {
    flex: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: raios.md,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  segmentoAtivo: {
    borderColor: cores.grafite,
    backgroundColor: cores.grafite,
  },
  segmentoTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: cores.texto,
  },
  segmentoTextoAtivo: {
    color: cores.branco,
  },

  botaoSinc: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: espacos.sm,
  },
  botaoSincTexto: {
    fontSize: 15,
    fontWeight: '600',
    color: cores.grafite,
  },

  botaoSair: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: espacos.sm,
    borderRadius: raios.lg,
    borderWidth: 1,
    borderColor: cores.grafite,
    backgroundColor: cores.fundo,
  },
  botaoSairTexto: {
    fontSize: 16,
    fontWeight: '600',
    color: cores.grafite,
  },
});

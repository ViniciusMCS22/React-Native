// src/utils/id.js
// Gera um UUID v4 no proprio aparelho (necessario para criar registros
// offline sem conflito com o servidor na sincronizacao).
// Prototipo: usa Math.random. Antes de ir para producao, trocar por
// Crypto.randomUUID() do pacote expo-crypto (npx expo install expo-crypto).

export function gerarId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function agoraIso() {
  return new Date().toISOString();
}

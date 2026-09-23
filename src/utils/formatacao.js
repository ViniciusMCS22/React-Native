// src/utils/formatacao.js
// Formatacao pt-BR centralizada, para todas as telas mostrarem numeros iguais.

const formatoMoeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

export function moeda(valor) {
  return formatoMoeda.format(valor ?? 0);
}

export function numero(valor, casas = 2) {
  return (valor ?? 0).toLocaleString('pt-BR', {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
}

// Quantidade exata do orcamento (sem arredondar para unidade de compra, para
// que quantidade x preco bata com o custo mostrado). Ex.: '407,40 sc'.
export function quantidade(valor, unidade) {
  return `${numero(valor, 2)} ${unidade ?? ''}`.trim();
}

export function percentual(fracao, casas = 1) {
  return `${numero((fracao ?? 0) * 100, casas)}%`;
}

// '2026-06-01' -> '01/06/2026'
export function data(iso) {
  if (!iso) return '-';
  const [a, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${a}`;
}

// '2026-05' -> '05/2026'
export function mesReferencia(mes) {
  if (!mes) return '-';
  const [a, m] = mes.split('-');
  return `${m}/${a}`;
}

// Valor com sinal explicito: +R$ 1.018,50 / -R$ 866,25
export function moedaComSinal(valor) {
  const v = valor ?? 0;
  if (Math.abs(v) < 0.005) return moeda(0);
  return `${v > 0 ? '+' : '-'}${moeda(Math.abs(v))}`;
}

// Fracao com sinal: 0.0658 -> '+6,58%'
export function percentualComSinal(fracao, casas = 2) {
  const f = fracao ?? 0;
  const sinal = f > 0 ? '+' : f < 0 ? '-' : '';
  return `${sinal}${numero(Math.abs(f) * 100, casas)}%`;
}

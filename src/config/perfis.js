// src/config/perfis.js
// Nomes de exibicao dos perfis (DRDA 2.2). As PERMISSOES de cada perfil nao
// ficam aqui: vem da API em /auth/me, para existir uma unica fonte da verdade.

export const ROTULOS_PERFIL = {
  master: 'Master / gestor',
  orcamentista: 'Orçamentista / engenharia',
  cliente: 'Consulta / cliente',
  desenvolvedor: 'Desenvolvedor',
};

// Atalhos da tela de login, SO em desenvolvimento (__DEV__). Precisam bater com
// os usuarios de teste de api/app/seed.py. Nunca coloque senhas reais aqui.
export const USUARIOS_TESTE = [
  { perfil: 'master', email: 'master@teste.com', senha: 'Master@123' },
  { perfil: 'orcamentista', email: 'orcamento@teste.com', senha: 'Orcamento@123' },
  { perfil: 'cliente', email: 'cliente@teste.com', senha: 'Cliente@123' },
  { perfil: 'desenvolvedor', email: 'dev@teste.com', senha: 'Dev@12345' },
];

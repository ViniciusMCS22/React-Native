# Protótipo Mobile (sim está com um erro de ortagrafia na pasta raiz, vai ser consertado...)

Aplicação híbrida mobile desenvolvida com **React Native** e **Expo**, como projeto da disciplina de Programação Mobile.

---

## Pré-requisitos

Antes de clonar o projeto, instale na sua máquina:

| Ferramenta | Versão | Observação |
|---|---|---|
| [Node.js](https://nodejs.org) | LTS (20 ou superior) | Instale a versão **LTS**, não a *Current* |
| npm | **11.x** | Ver aviso abaixo |
| [Git](https://git-scm.com) | Qualquer recente | — |
| [VS Code](https://code.visualstudio.com) | — | Opcional, mas recomendado |
| **Expo Go** | — | App de celular ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) / [iOS](https://apps.apple.com/app/expo-go/id982107779)) |

### Atenção à versão do npm

Confira com:

```bash
npm -v
```

Se retornar **12.x**, rebaixe antes de continuar:

```bash
npm install -g npm@11
```

O npm 12 mudou o formato de saída do `npm pack --json`, o que quebra as ferramentas do Expo. Toda a linha 11.x funciona normalmente.

---

## Onde clonar

Escolha um caminho **curto, sem acentos, sem espaços, sem parênteses e fora do OneDrive**.

```
✅ C:\dev\protoptipo-mobile
❌ C:\Users\voce\OneDrive\Desktop\Programação Mobile (grupo)\
```

Caracteres especiais no caminho quebram o Metro bundler e os scripts nativos do Android. O OneDrive disputa o travamento dos arquivos em `node_modules` e causa erros aleatórios de arquivo não encontrado.

---

## Instalação

```bash
cd C:\dev
git clone <URL-DO-REPOSITORIO>
cd protoptipo-mobile
npm install
```

O `npm install` é **obrigatório**. A pasta `node_modules` não é versionada, então o clone vem sem as dependências.

Durante a instalação vão aparecer vários avisos `npm warn deprecated`. **São esperados e podem ser ignorados** — referem-se a dependências internas das ferramentas de build, não ao nosso código.

---

## Rodando o projeto

```bash
npx expo start
```

Um QR Code aparece no terminal. Abra o **Expo Go** no celular e leia o código.

> O celular e o computador precisam estar na **mesma rede Wi-Fi**.

Se não conectar (comum em rede de faculdade ou com firewall ativo):

```bash
npx expo start --tunnel
```

Na primeira execução ele pede para instalar o `@expo/ngrok`. Aceite.

### Atalhos úteis do terminal

| Tecla | Ação |
|---|---|
| `r` | Recarrega o app |
| `m` | Abre o menu do desenvolvedor |
| `Ctrl+C` | Encerra o servidor |

---

## Estrutura do projeto

```
protoptipo-mobile/
├── App.js                    # Ponto de entrada — apenas renderiza a Home
├── index.js                  # Registro da aplicação (não editar)
├── app.json                  # Configurações do Expo
├── assets/                   # Imagens, ícones e fontes
└── src/
    ├── components/           # Componentes reutilizáveis
    │   ├── Botao/
    │   │   ├── index.js
    │   │   └── styles.js
    │   ├── Carrossel/
    │   ├── Header/
    │   └── MenuLateral/
    └── screens/              # Telas da aplicação
        └── Home/
            ├── index.js
            └── styles.js
```

### Padrão de componentes

Cada componente vive na própria pasta, com o código e os estilos separados:

```
NomeDoComponente/
├── index.js      # o componente
└── styles.js     # os estilos
```

Isso permite importar pela pasta, sem repetir o nome:

```jsx
import Botao from '../../components/Botao';
```

### Regras de nomenclatura

Sempre em **minúsculas**: `index.js` e `styles.js`.

Windows não diferencia maiúsculas de minúsculas, mas Linux e macOS diferenciam. Um arquivo commitado como `Index.js` funciona na sua máquina e **quebra na do colega**.

---

## Funcionalidades atuais

- **Header** com título e botão de menu (☰)
- **Carrossel** de imagens com deslize horizontal e indicadores
- **Botões de teste** (1 a 4) na página inicial
- **Menu lateral** deslizante a partir da direita, com overlay e 4 itens

---

## Fluxo de trabalho com Git

O projeto é desenvolvido por 5 integrantes. Para evitar conflitos:

### Sempre antes de começar

```bash
git pull
```

Se o pull alterou o `package.json`, alguém instalou uma biblioteca nova:

```bash
npm install
```

### Trabalhe em branches

```bash
git checkout -b feature/nome-da-tarefa
# ... desenvolve ...
git add .
git commit -m "feat: descrição do que foi feito"
git push -u origin feature/nome-da-tarefa
```

Depois abra um **Pull Request** no GitHub para juntar na `main`.

### Sempre antes de parar

```bash
git add .
git commit -m "..."
git push
```

Código não commitado é código que ninguém mais tem.

---

## Solução de problemas

### `Unable to find expo in this project`

Você está na pasta errada ou não rodou o `npm install`. Confirme que existe um `package.json` no diretório atual:

```bash
dir     # Windows
ls      # Linux/macOS
```

### `Unable to resolve module ./algo`

O arquivo não existe ou o nome está divergente. A mensagem informa **o que** falta e **de onde** está sendo importado — confira a pasta indicada, atento a maiúsculas e ao `s` final de `styles.js`.

### Alteração salva não aparece no app

Cache do Metro. Aperte `r` no terminal. Se persistir:

```bash
npx expo start --clear
```

### Erros estranhos e persistentes

A opção nuclear — demora alguns minutos, mas resolve quase tudo:

```bash
# Windows (PowerShell)
Remove-Item -Recurse -Force node_modules
npm install

# Linux / macOS
rm -rf node_modules
npm install
```

### Avisos `npm warn deprecated`

Ignore. Para uma verificação real da saúde do projeto:

```bash
npx expo-doctor
```

E, se ele apontar versões incompatíveis:

```bash
npx expo install --fix
```

> **Nunca rode `npm audit fix --force`.** Ele instala versões *major* incompatíveis e costuma quebrar projetos Expo que estavam funcionando.

---

## Convenções

- Mensagens de commit no padrão [Conventional Commits](https://www.conventionalcommits.org/pt-br/): `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`
- Nomes de arquivos e pastas sem acentos e sem espaços
- Componentes em PascalCase (`MenuLateral`), arquivos internos em minúsculas (`index.js`)
- O `package-lock.json` **deve** ser commitado — é ele que garante versões idênticas para todos

---

## Tecnologias

- HTML, CSS e JavaScript (base)
- [React Native](https://reactnative.dev/docs/getting-started)
- [Expo](https://docs.expo.dev/) — SDK 54
- [Node.js](https://nodejs.org)

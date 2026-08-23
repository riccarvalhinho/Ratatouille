# Setup do tablet

Como pôr a app a correr no tablet Amazon Fire suspenso na cozinha.

> **Pendente:** o modelo exato do tablet ainda não está confirmado (questão Q1). As instruções abaixo
> assumem Fire OS 7 ou superior. Se for um Fire de 2014–2018, ver a secção "Tablets antigos".

## 1. Identificar o tablet

Definições → Opções do dispositivo → Sobre o Tablet Fire. Anotar aqui:

| Campo | Valor |
|---|---|
| Modelo | _por preencher_ |
| Geração | _por preencher_ |
| Versão do Fire OS | _por preencher_ |
| Resolução | _por preencher_ |

Assim que estiver preenchido, fechar a Q1 em `docs/product/open-questions.md` e ajustar o target de
build em `app/vite.config.ts` se der para relaxar.

## 2. Instalar a app

A app é uma PWA publicada no GitHub Pages. Não há APK a instalar.

1. Abrir o browser Silk no tablet.
2. Ir ao URL do GitHub Pages do repositório.
3. Menu → Adicionar ao ecrã inicial.
4. Abrir a partir do ícone criado — arranca em ecrã inteiro, sem barra de endereço.

Na primeira abertura com rede, a app descarrega o bundle de receitas e guarda-o localmente. A partir
daí funciona offline.

## 3. Configurar o acesso de escrita

Necessário só a partir de M2, para que favoritos e planeamento voltem ao repositório.

1. No GitHub: Settings → Developer settings → Personal access tokens → Fine-grained tokens.
2. Criar um token com acesso **só ao repositório `Ratatouille`** e permissão **Contents: Read and write**.
3. Definir uma validade e anotar quando expira.
4. Na app: Definições → colar o token.

O token fica em `localStorage` no tablet. **Nunca é commitado.** Quem tiver o tablet na mão tem o
token — risco aceite, é um tablet doméstico numa cozinha. Ver `docs/adr/0004-escrita-via-github-api.md`.

## 4. Modo monitor de cozinha

Para o tablet se comportar como um painel na parede:

- Definições → Ecrã → Suspensão: definir para o máximo permitido.
- Desativar a rotação automática e fixar em horizontal.
- Desligar os anúncios do ecrã de bloqueio (Definições → Ecrã de bloqueio), se aplicável ao modelo.
- Manter ligado à corrente permanentemente. O tablet vive na parede.
- Opcional: uma app de kiosk da store da Amazon para impedir sair da app por toque acidental.

## 5. Verificar que funciona offline

O teste que interessa mesmo:

1. Abrir a app com Wi-Fi ligado e deixar carregar as receitas.
2. Desligar o Wi-Fi.
3. Fechar e reabrir a app.

Tem de abrir e mostrar as receitas na mesma. Se não mostrar, o service worker ou a cache em IndexedDB
não estão a funcionar e é um bug bloqueante.

## Tablets antigos (Fire OS 5 ou 6)

Se o tablet for de 2014–2018, o WebView do Silk pode ser velho demais para a app. Por ordem de
preferência:

1. **Instalar o Firefox for Android** via APK (sideload) e usar a PWA nesse browser. O Firefox traz o
   seu próprio motor, independente do WebView do sistema. É a solução mais barata.
2. **Baixar o target de build** em `app/vite.config.ts` e evitar APIs recentes. Já estamos em ES2017
   por precaução.
3. **Empacotar como APK** com Capacitor e um WebView atualizado embutido. É a solução mais robusta e
   a mais cara — só se as duas anteriores falharem.

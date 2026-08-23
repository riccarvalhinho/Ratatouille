# Setup do tablet

Como pôr a app a correr no tablet Amazon Fire suspenso na cozinha.

## 1. O tablet

| Campo | Valor |
|---|---|
| Modelo | Fire HD 10 (9.ª geração, 2019) |
| Sistema | Fire OS 7, baseado em Android 9 |
| Ecrã | 10,1", 1920×1200, 224 ppi |
| Memória | 2 GB |
| Processador | MediaTek MT8183 |

O Silk é Chromium moderno, portanto a PWA instalada no ecrã inicial funciona sem truques.

**Por confirmar no aparelho:** o viewport em pixels CSS. A 224 ppi o mais provável é densidade 1,5×,
o que daria cerca de **1280×800** em horizontal. É a esse tamanho que as vistas devem ser desenhadas
e testadas. Para confirmar, abrir a app no tablet e ler `window.innerWidth` — ou simplesmente
comparar com um screenshot feito a 1280×800.

## 2. Publicar a app

A app é publicada automaticamente no GitHub Pages a cada push para `main`.

**Dois requisitos, uma vez só:**

1. **O repositório tem de ser público.** O Pages gratuito não publica de repositórios privados.
   Ver `docs/adr/0005-repositorio-publico.md`.
2. **O Pages tem de ser ligado à mão**, em Settings → Pages → Source: **GitHub Actions**. O workflow
   tenta ligá-lo sozinho, mas o `GITHUB_TOKEN` não tem permissão para criar o site — devolve
   "Resource not accessible by integration". É um clique, uma vez na vida do repositório.

Feito isso, o URL é `https://<utilizador>.github.io/Ratatouille/` e cada push para `main` republica.

## 3. Instalar no tablet

Não há APK a instalar.

1. Abrir o browser Silk no tablet.
2. Ir ao URL do GitHub Pages do repositório.
3. Menu → Adicionar ao ecrã inicial.
4. Abrir a partir do ícone criado — arranca em ecrã inteiro, sem barra de endereço.

Na primeira abertura com rede, a app descarrega o bundle de receitas e guarda-o localmente. A partir
daí funciona offline.

## 4. Configurar o acesso de escrita

Necessário só a partir de M2, para que favoritos e planeamento voltem ao repositório.

1. No GitHub: Settings → Developer settings → Personal access tokens → Fine-grained tokens.
2. Criar um token com acesso **só ao repositório `Ratatouille`** e permissão **Contents: Read and write**.
3. Definir uma validade e anotar quando expira.
4. Na app: Definições → colar o token.

O token fica em `localStorage` no tablet. **Nunca é commitado.** Quem tiver o tablet na mão tem o
token — risco aceite, é um tablet doméstico numa cozinha. Ver `docs/adr/0004-escrita-via-github-api.md`.

## 5. Modo monitor de cozinha

Para o tablet se comportar como um painel na parede:

- Definições → Ecrã → Suspensão: definir para o máximo permitido.
- Desativar a rotação automática e fixar em horizontal.
- Desligar os anúncios do ecrã de bloqueio (Definições → Ecrã de bloqueio), se aplicável ao modelo.
- Manter ligado à corrente permanentemente. O tablet vive na parede.
- Opcional: uma app de kiosk da store da Amazon para impedir sair da app por toque acidental.

## 6. Verificar que funciona offline

O teste que interessa mesmo:

1. Abrir a app com Wi-Fi ligado e deixar carregar as receitas.
2. Desligar o Wi-Fi.
3. Fechar e reabrir a app.

Tem de abrir e mostrar as receitas na mesma. Se não mostrar, o service worker ou a cache em IndexedDB
não estão a funcionar e é um bug bloqueante.

## Outros Androids

O build está em ES2017, o que cobre confortavelmente Android 7 e acima — não por limitação deste
tablet, que aguentaria muito mais, mas porque a app deve poder correr noutros aparelhos e o custo
medido de ser conservador é 1,3 kB em 154 kB.

Em Androids com Play Store, empacotar como APK com Capacitor passa a ser uma opção real de
distribuição, ao contrário do que acontece no Fire OS. Ver questão Q11 antes de investir nisso.

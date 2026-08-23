# PRD — Ratatouille

> Substitui o documento `Ratatouille: Planeamento do Produto` que existia na Drive. Este ficheiro é a
> versão viva e única desse conteúdo; o documento original está morto.

## Resumo

App semelhante ao software integrado nas Bimby, mas sem integração com qualquer robot de cozinha.
É um assistente de base de dados de receitas, guia passo a passo no momento da confeção, e gerador de
lista de compras personalizada.

## Funcionalidades

### 1. Home screen

- Mostra as refeições planeadas, se existirem.
- Mostra um histórico de refeições passadas.
- Se não houver refeições planeadas, mostra um CTA para planear refeições.

Spec: `docs/specs/006-home.md`.

### 2. Lista de receitas

Tab com a lista de receitas em grelha, fácil de navegar. Cada cartão mostra:

- thumbnail do prato
- nome
- duração de confeção
- antecedência de preparação necessária (marinar, demolhar, levedar…)
- labels de dificuldade e de tipo de prato (carne, peixe, sopa, sobremesa, …)

Requisitos:

- Filtrar por duração, dificuldade e labels.
- Guardar receitas nos favoritos, com uma subtab de favoritos.
- Subtab de histórico.
- Clicar numa receita abre o pop-up de detalhe.

Spec: `docs/specs/001-catalogo-receitas.md`.

### 3. Detalhe da receita (pop-up)

Abre a partir da lista de receitas, do histórico, ou da vista de planeamento semanal. Contém:

- imagem e nome da receita
- todo o detalhe das labels
- última vez que foi feita (data mais recente em que foi planeada)
- para quantas pessoas dá a dose
- no topo: coração para marcar/desmarcar como favorito
- no topo: botão "+" para planear a receita para determinado dia, que abre uma janela de seleção de
  dia e bloco do dia
- eletrodomésticos e utensílios necessários
- lista de ingredientes
- passo a passo em bullets simplificados, sem parágrafos longos
- informação nutricional (calorias, macros, Nutri-Score aproximado)

Fecha com um "x" no canto superior direito, devolvendo ao ecrã de onde foi aberto.

Spec: `docs/specs/002-detalhe-receita.md`.

### 4. Planeamento semanal

- Vista semanal visual, em forma de horário por blocos do dia.
- Navegação entre semanas passadas e futuras.
- Clicar num dia adiciona uma receita a esse dia. As receitas são representadas pela thumbnail
  ajustada ao tamanho, com nome e um máximo de 3 labels.
- Vários pratos no mesmo bloco do dia (ex.: uma sopa, um prato e uma sobremesa; ou a mesma receita
  duplicada para dobrar a quantidade).
- Desplanear com um clique num "x" diretamente no plano.

Spec: `docs/specs/003-planeamento-semanal.md`.

### 5. Lista de compras

Mencionada no âmbito original sem detalhe. Gerada a partir do plano da semana, agregando ingredientes
de todas as receitas planeadas e agrupando por zona de supermercado.

Spec: `docs/specs/004-lista-de-compras.md`.

### 6. Modo cozinha

Não constava do documento original, mas é a funcionalidade que mais se aproxima da experiência Bimby:
executar a receita passo a passo em ecrã grande, com timers. Fica no roadmap como M5.

Spec: `docs/specs/005-modo-cozinha.md`.

## Interface

- Preparada para tablet, navegável 100% por toque.
- Versão complementar para telemóvel considerada numa fase posterior, provavelmente reduzida à lista
  de compras e às refeições planeadas, sem o detalhe.

## Design

Direção por fechar. Do documento original: cores verdes, com aspeto saudável; estética entre
minimalista e decorada. Inspirações a recolher: ecrãs da Bimby, e outras apps ou sites do género.

Ver `docs/design/design-system.md` e a questão em aberto Q2.

## Decisões tomadas desde o documento original

| Pergunta original | Resposta |
|---|---|
| Vamos precisar de base de dados para receitas, histórico, planeamento e favoritos? | Não uma base de dados gerida. Ficheiros JSON versionados no repositório, com cache local no tablet. Ver ADR 0002. |
| Onde arranjar uma lista de receitas extensa e disponível para usar? | Não se importa um dataset externo. Constrói-se o catálogo com receitas próprias, apoiado por um importador assistido por AI que normaliza links, fotos ou texto colado. |
| Vamos ter de processar as receitas por AI para completar informação e labels? | Sim, e é exatamente esse o papel do importador (`tools/import-recipe.ts`). Toda a receita importada passa por revisão humana antes de entrar em `data/`. |
| Deve dar para adicionar receitas personalizadas? | Sim. É o caminho principal, não a exceção. |

## Questões ainda em aberto

Ver `docs/product/open-questions.md`.

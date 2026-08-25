# Design system

> A direção visual final ainda não está fechada (questão Q2, a decidir em M1). O que está aqui são as
> **restrições** que qualquer direção visual tem de respeitar, mais um conjunto de tokens provisórios
> já implementados em `app/src/styles/tokens.css`. As restrições não são negociáveis; as cores são.

## Restrições do contexto

A app corre num tablet suspenso na parede da cozinha. Isso impõe coisas que não se aplicariam a uma
app de secretária:

| Restrição | Porquê | Regra |
|---|---|---|
| Distância de leitura ~70cm | O tablet está na parede, não na mão | Texto de corpo nunca abaixo de 18px; passos da receita a 24px |
| Toque com mãos molhadas ou sujas | Cozinhar | Alvos de toque com no mínimo 56×56px, 12px de espaço entre alvos |
| Luz variável e reflexos | Cozinha com janela | Contraste mínimo AA (4.5:1) para texto, 3:1 para elementos de UI |
| Sem rato, sem teclado | Só toque | Nenhuma ação só descoberta por hover; nada que exija escrever muito |
| Ecrã sempre ligado | Monitor de cozinha | Evitar branco puro a full-screen; sem animações em loop infinito |

## Tokens

Definidos como custom properties CSS em `app/src/styles/tokens.css`. Nunca escrever um valor
hard-coded num componente — se falta um token, acrescenta-se um token.

### Cor (provisório)

Direção verde, conforme o documento original. Paleta de trabalho até Q2 fechar:

| Token | Papel |
|---|---|
| `--color-bg` | Fundo da app |
| `--color-surface` | Cartões, pop-ups |
| `--color-surface-raised` | Elementos sobre cartões |
| `--color-border` | Separadores e contornos |
| `--color-text` | Texto principal |
| `--color-text-muted` | Metadados, labels secundárias |
| `--color-accent` | Ações primárias, estado ativo |
| `--color-accent-text` | Texto sobre `--color-accent` |
| `--color-favorite` | Coração de favorito |
| `--color-danger` | Remover, desplanear |

Tema claro e escuro ambos definidos: a cozinha tem luz muito diferente de dia e de noite.

### Espaçamento

Escala de 4px: `--space-1` (4px) até `--space-10` (80px). Nada fora da escala.

### Tipografia

| Token | Tamanho | Uso |
|---|---|---|
| `--text-xs` | 14px | Só metadados densos; evitar |
| `--text-sm` | 16px | Labels |
| `--text-base` | 18px | Corpo — o mínimo confortável a esta distância |
| `--text-lg` | 22px | Nomes de receitas em cartões |
| `--text-xl` | 28px | Títulos de secção |
| `--text-2xl` | 36px | Título de receita no detalhe |
| `--text-3xl` | 56px | Marcador de receita sem imagem |
| `--text-step` | 24px | Mínimo aceitável para um passo do modo cozinha |
| `--text-step-lg` | 44px | O tamanho a que os passos aparecem mesmo, com a medida travada em 30ch |

Font stack de sistema. Sem webfonts: o tablet pode estar offline e uma fonte que não carrega é pior
do que uma fonte genérica.

### Raio e elevação

`--radius-sm` (8px), `--radius-md` (16px), `--radius-lg` (24px). Sombras suaves, duas variantes só.

## Decisões de layout vindas do benchmark

Do Cookidoo (`benchmark-bimby.md`), já decididas:

- **Navegação vertical à esquerda**, só ícones. Em horizontal, a altura é a dimensão escassa; uma
  barra em baixo comeria espaço ao conteúdo.
- **Quatro cartões por linha** no catálogo a 1280×800.
- **Ação principal como círculo grande e destacado**, persistente. É o "Cozinhar".
- **O acento só na ação e no estado ativo.** Tudo o resto é texto escuro sobre claro. É isto que faz
  o botão principal saltar sem a interface parecer um semáforo.
- **Ecrãs de detalhe em duas colunas**, aproveitando a largura, em vez de empilhar tudo num scroll.
- **Quatro destinos no painel:** Hoje, Receitas, Semana, Compras. O detalhe da receita abre por cima
  do ecrã de onde veio, e o "x" devolve lá.
- **A rota vive no URL**, com encaminhamento por hash. Sobrevive a um recarregamento, que num tablet
  ligado horas acontece por acidente. Hash e não history API porque o GitHub Pages não reescreve URLs.

O que continua por decidir sobre navegação está na conversa 8.

## Componentes previstos

- `RecipeCard` — thumbnail, nome, duração, antecedência, até 3 labels
- `LabelChip` — label com cor por categoria
- `FilterBar` — filtros de duração, dificuldade e labels
- `Modal` — pop-up de detalhe, com "x" no canto superior direito
- `DayBlock` — bloco do dia na vista de planeamento
- `Stepper` — passo a passo do modo cozinha
- `NavRail` — navegação vertical à esquerda, só ícones
- `IngredientList` — nome, nota subordinada, quantidade alinhada à direita
- `MetaRow` — ícone + texto, para tempos, doses e rendimento

## O que fica por decidir

- Paleta final e nível de decoração (minimalista vs. mais rica)
- Tratamento das thumbnails: recortadas em quadrado ou proporção fixa 4:3
- Se as labels têm ícone além de cor

Estão todas dentro de **N1 — Revisão visual** no roadmap, que é onde a app deixa de ter cores
provisórias. Duas notas para quem lá chegar:

**Promover os valores fixos a tokens é a preparação mais barata.** Há cerca de 38 medidas em px
escritas diretamente nos componentes e quatro cores literais (dois véus de `rgb(0 0 0 / 45%)`, um
`#fff` e uma sombra). Podem ser promovidos a qualquer momento sem mudar nada visualmente, e isso
torna a revisão do tema numa edição de um ficheiro em vez de uma caça.

**A font stack do sistema não é preguiça.** Está aqui porque o tablet pode estar sem rede e uma
fonte que não carrega é pior do que uma genérica. Trocar por um tipo de letra próprio obriga a
auto-hospedá-lo e a metê-lo na cache do service worker — é possível, mas é uma decisão a tomar de
propósito e não por arrasto.

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
| `--text-step` | 24px | Passos no modo cozinha |

Font stack de sistema. Sem webfonts: o tablet pode estar offline e uma fonte que não carrega é pior
do que uma fonte genérica.

### Raio e elevação

`--radius-sm` (8px), `--radius-md` (16px), `--radius-lg` (24px). Sombras suaves, duas variantes só.

## Componentes previstos

- `RecipeCard` — thumbnail, nome, duração, antecedência, até 3 labels
- `LabelChip` — label com cor por categoria
- `FilterBar` — filtros de duração, dificuldade e labels
- `Modal` — pop-up de detalhe, com "x" no canto superior direito
- `DayBlock` — bloco do dia na vista de planeamento
- `Stepper` — passo a passo do modo cozinha

## O que fica por decidir em M1

- Paleta final e nível de decoração (minimalista vs. mais rica)
- Tratamento das thumbnails: recortadas em quadrado ou proporção fixa 4:3
- Se as labels têm ícone além de cor

# Spec 001 — Catálogo de receitas

**Milestone:** M1
**Estado:** Pronta
**Depende de:** ADR 0002 (dados), spec 002 (detalhe)

## Objetivo

Dar resposta à pergunta "o que é que eu posso cozinhar?" — descobrir receitas por navegação visual,
filtrando pelo tempo que se tem e pelo tipo de prato que apetece.

## Comportamento

Tab principal com as receitas em grelha, navegável por toque e por scroll vertical.

### Cartão de receita

Cada receita aparece como um cartão com:

- thumbnail do prato
- nome
- duração de confeção
- indicação de antecedência de preparação, quando existe (ex.: "de véspera", "+2h")
- **"pede acompanhamento", quando `needsSide`** — ver abaixo
- label de dificuldade
- até 3 labels de tipo de prato (carne, peixe, sopa, sobremesa, …)

Se a receita não tiver imagem, o cartão mostra um marcador neutro em vez de partir o alinhamento
da grelha.

#### "pede acompanhamento" é informação, não aviso

Quase todas as receitas trazem o acompanhamento escrito lá dentro; as que não trazem levam
`needsSide` (Q14). O cartão diz isso **na mesma linha dos outros factos e com o mesmo peso** — sem
ícone, sem cor, sem badge, e sem componente próprio.

A distinção com a antecedência de preparação é de propósito: "de véspera" é acentuado porque **muda
o que se tem de fazer ontem**, e quem não reparar chega tarde. "Pede acompanhamento" não muda nada
no momento em que se lê — é contexto para quem está a montar a semana, e a app não tem opinião sobre
se isso é problema. Tratá-lo como aviso seria dizer que uma receita está incompleta, e não está: há
pratos que se comem com coisas diferentes conforme o dia, e as costelas no forno são um deles.

Também **não filtra**: não há filtro de "só refeições completas". Um filtro obrigaria a decidir por
quem planeia, e o valor aqui é só não ser surpreendido.

#### Planear a partir do cartão

O cartão tem um **"+" no canto da imagem** que abre a escolha de dia e bloco — a mesma do detalhe
(spec 002). Navegar a lista e decidir ali que aquilo é o jantar de quinta é o gesto normal de quem
está a montar a semana, e obrigá-lo a ir ao planeamento abrir o seletor por bloco é trocar a lista
inteira, com filtros e ao tamanho de ler, por uma grelha curta dentro de um painel.

É permanente e não revelado ao toque: num tablet não há hover, e uma ação escondida obrigaria a um
toque só para descobrir que existe. Fica por cima da fotografia, que é a única zona do cartão sem
informação — o nome, o tempo e as labels não perdem largura nenhuma.

Abrir o detalhe continua a ser o resto do cartão.

### Filtros

Barra de filtros no topo, sempre visível:

- **Duração** — intervalos (até 30min, 30–60min, mais de 1h)
- **Método** — forno, tacho, frigideira, grelhador, air fryer, micro-ondas, sem confeção.
  "Hoje não me apetece ligar o forno" é uma coisa que se pensa mesmo
- **Peso** — leve, equilibrado, substancial
- **Labels** — seleção múltipla a partir de `data/taxonomies/labels.json`

Os filtros combinam-se entre si: dentro do mesmo tipo somam-se (OU), entre tipos restringem-se (E).
Um estado de "sem resultados" explica que filtros estão ativos e oferece limpá-los.

### Subtabs

- **Todas** — o catálogo completo
- **Favoritos** — só as receitas marcadas com coração, à mão, no detalhe
- **Histórico** — receitas já cozinhadas, mais recentes primeiro, com a data

Os filtros aplicam-se dentro de qualquer subtab.

**Não são duas vistas da mesma coisa** (conversa 2). O favorito é um **juízo** — "gosto disto", e não
caduca. O histórico é um **facto** — "fiz isto a 12 de agosto", e acumula-se. Um existe sem o outro:
há receitas que se adoram e nunca se fizeram, e coisas que se fazem todas as semanas por hábito sem
gostar particularmente delas. Por isso são ficheiros separados, com formas diferentes, e não uma
lista com um sinalizador.

### Abrir uma receita

Tocar num cartão abre o pop-up de detalhe (spec 002). O estado do catálogo — subtab, filtros, posição
do scroll — mantém-se, para que fechar o pop-up devolva exatamente ao mesmo sítio.

## Critérios de aceitação

- [ ] A grelha mostra todas as receitas de `data/recipes/` sem alterações de código
- [ ] Um cartão mostra thumbnail, nome, duração, rendimento e até 3 labels
- [ ] Uma receita com antecedência de preparação mostra-o no cartão; uma sem, não mostra nada
- [ ] Filtrar por duração, método, peso e labels devolve o subconjunto correto
- [ ] Filtros de tipos diferentes combinam-se com E; do mesmo tipo, com OU
- [ ] Existe estado de "sem resultados" com ação de limpar filtros
- [ ] A subtab de favoritos mostra só receitas marcadas
- [ ] A subtab de histórico ordena por data mais recente
- [x] O "+" do cartão planeia a receita sem abrir o detalhe nem sair da lista
- [ ] Fechar o detalhe devolve à mesma posição de scroll e aos mesmos filtros
- [ ] Todos os alvos de toque têm pelo menos 56×56px
- [ ] A grelha funciona offline depois da primeira carga

## A escala para que isto é desenhado

**Uma centena de receitas ou mais** (conversa 2). Não é detalhe: com trinta, a grelha inteira cabe em
dois ecrãs e os filtros quase não fazem falta; com cento e cinquenta, sem filtros não se encontra
nada. Duas consequências:

- **A pesquisa por texto entra.** Esteve fora de âmbito com o argumento de que quem sabe o nome já
  sabe o que quer cozinhar. Isso aguenta-se com trinta receitas e não com cento e cinquenta — quem se
  lembra que existe um arroz de pato não percorre vinte e cinco linhas de grelha para lá chegar.
  **Mas não é a primeira coisa do ecrã:** a pesquisa resolve *ir buscar* o que já se tem na cabeça, e
  os filtros resolvem *decidir* quando não se tem. Na cozinha é quase sempre a segunda.
- **A ordenação por omissão passa a decidir quase tudo.** Cabem oito cartões sem rolar, e na maior
  parte das vezes o primeiro ecrã é o único ecrã. Por que critério ordena continua por decidir —
  perguntas 2 e 3 da conversa 2.

## Fora de âmbito

- Ordenação manual
- Criar ou editar receitas a partir da app (M2)

## Questões em aberto

- Q2 — direção visual, incluindo o formato da thumbnail

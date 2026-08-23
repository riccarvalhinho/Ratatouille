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
- label de dificuldade
- até 3 labels de tipo de prato (carne, peixe, sopa, sobremesa, …)

Se a receita não tiver imagem, o cartão mostra um marcador neutro em vez de partir o alinhamento
da grelha.

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
- **Favoritos** — só as receitas marcadas com coração
- **Histórico** — receitas já cozinhadas, mais recentes primeiro, com a data

Os filtros aplicam-se dentro de qualquer subtab.

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
- [ ] Fechar o detalhe devolve à mesma posição de scroll e aos mesmos filtros
- [ ] Todos os alvos de toque têm pelo menos 56×56px
- [ ] A grelha funciona offline depois da primeira carga

## Fora de âmbito

- Pesquisa por texto (a decidir se é preciso depois de o catálogo crescer)
- Ordenação manual
- Criar ou editar receitas a partir da app (M2)

## Questões em aberto

- Q2 — direção visual, incluindo o formato da thumbnail

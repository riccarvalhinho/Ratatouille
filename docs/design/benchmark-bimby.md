# Benchmark — Cookidoo / Bimby

A Bimby é a referência de origem deste projeto: o planeamento original diz "app semelhante ao
software que está integrado nas Bimby". É o benchmark mais próximo do que se quer construir.

**Material analisado:** quatro fotografias do Cookidoo a correr num tablet, em horizontal, tiradas em
2026-05-03. Cobrem pesquisa/catálogo e as três abas do detalhe da receita.

> **As fotografias não estão no repositório.** São capturas da interface e da fotografia de comida de
> um produto comercial, e este repositório é público desde o ADR 0005. O que interessa está aqui em
> texto — como escrito na regra deste ficheiro, o que conta não é a imagem, é o que dela se aproveita
> e porquê. Se um dia forem precisas, ficam fora do Git.

---

## Ecrã 1 — Pesquisar (catálogo)

**Como está montado:** barra de pesquisa larga no topo, ocupando quase toda a largura. Por baixo,
grelha de cartões, **quatro por linha**. Barra de navegação vertical à esquerda, estreita, só ícones:
casa, lupa, livro, um ícone de aparelho, e uma grelha de aplicações.

Cada cartão: imagem quadrada de topo com cantos arredondados, título em duas linhas, e por baixo uma
linha com a avaliação (estrelas + número de votos) à esquerda e o tempo à direita. Um "⋮" no canto
para ações secundárias.

**A levar:**

- **Quatro cartões por linha** — é a mesma densidade a que chegámos por acaso a 1280×800. Bom sinal.
- **Barra de navegação vertical à esquerda**, só ícones. Num tablet em horizontal, poupa altura, que
  é a dimensão escassa. Uma barra em baixo comeria espaço à grelha.
- **Metadados numa linha só**, com uma coisa à esquerda e outra à direita. Lê-se de relance sem
  competir com o título.
- O "⋮" por cartão resolve ações secundárias sem hover — coerente com a nossa regra de nada depender
  de hover.

**A evitar:**

- **Pesquisa em primeiro lugar.** O Cookidoo tem milhares de receitas e a pesquisa é a única saída.
  Nós vamos ter dezenas: os filtros importam mais do que a pesquisa, e o catálogo deve caber na
  cabeça de quem o usa. A spec 001 já põe a barra de filtros no topo e deixa a pesquisa de fora.
- **Avaliações e número de votos.** Fazem sentido numa biblioteca partilhada por milhões. Numa casa,
  a única avaliação que interessa é a nossa — e essa já existe em `history[].rating`.
- **Falta o que mais nos interessa:** o cartão não diz se a receita precisa de antecedência. Numa
  app de planeamento, saber que o bacalhau tem de ir de molho de véspera é mais útil do que a
  avaliação média. O nosso cartão mostra-o.

---

## Ecrã 2 — Detalhe, aba "Visão geral"

**Como está montado:** ecrã dividido ao meio. À esquerda, carrossel de imagens com indicadores de
página. À direita, título em corpo muito grande, avaliação, e uma lista vertical de metadados com
ícone à esquerda de cada linha:

```
✎  Preparação 10 min
🕐 Total 20 min
🍽  16 unidades
```

Botão circular verde grande, **"Iniciar"**, em baixo à direita. Abas em baixo: Visão geral ·
Ingredientes · Preparação · Dicas · Mais. Marcador (bookmark) no canto superior direito.

**A levar:**

- **Divisão ao meio: imagem à esquerda, informação à direita.** Aproveita a largura em vez de empurrar
  tudo para um scroll vertical. É o oposto do que se faz num telemóvel, e é o certo aqui.
- **A ação principal é um círculo grande e destacado.** O nosso equivalente é "Cozinhar" (spec 005) e
  merece exatamente este tratamento — é a razão de o tablet estar na parede.
- **Metadados como ícone + texto**, um por linha, em vez de uma sopa de etiquetas.
- **"16 unidades".** Isto confirma a proposta P3 em `docs/product/metadata-receitas.md`: o rendimento
  nem sempre são pessoas. A Bimby, que tem milhares de receitas, precisou de resolver isto. Nós vamos
  precisar na segunda sobremesa que acrescentarmos.

**A evitar:**

- **Abas em baixo aqui, em cima nos outros ecrãs.** No ecrã 3 e 4 a mesma barra de abas aparece no
  topo. É inconsistente e obriga a procurar. Escolher um sítio e ficar lá.
- **Cinco abas, das quais duas são vagas.** "Dicas" e "Mais" não dizem o que contêm.
- **Espaço morto.** A metade direita tem uma coluna estreita de texto e muito vazio à volta. A 70 cm
  de distância, esse espaço devia estar a ser usado para tipografia maior.

---

## Ecrã 3 — Detalhe, aba "Ingredientes"

**Como está montado:** duas colunas. À esquerda, um cartão com a lista de ingredientes: miniatura do
ingrediente, nome, uma nota em cinzento mais pequeno por baixo ("por exemplo, curgete, cenoura, nabo,
cortados em pedaços (3 cm aprox.)"), e a quantidade alinhada à direita numa coluna própria.

À direita, dois cartões separados: **"Dispositivos e acessórios"** (com ícones dos aparelhos) e
**"Utensílios"** (lista simples).

**A levar:**

- **Quantidade alinhada à direita, numa coluna.** Torna a lista percorrível — os olhos descem pela
  coluna dos números. Muito melhor do que "400 g de mistura de legumes" em texto corrido.
- **A nota do ingrediente em cinzento, por baixo do nome.** É exatamente o campo `note` do nosso
  schema, e este é o sítio certo para o mostrar: subordinado ao nome, não a competir com ele.
- **Separar aparelhos de utensílios em dois blocos.** O nosso `data/taxonomies/equipment.json` já tem
  `kind: eletrodomestico | utensilio`, e até agora era só arrumação. A Bimby mostra que a distinção
  merece aparecer na interface: aparelhos condicionam se consegues fazer a receita, utensílios são
  detalhe.
- **Ingredientes e equipamento no mesmo ecrã.** Antes de começar, o que se quer saber é "tenho tudo?",
  e isso inclui a frigideira.

**A evitar:**

- **Miniaturas por ingrediente.** Bonito, e caríssimo — obriga a uma imagem por ingrediente canónico,
  para benefício quase nulo. Ninguém precisa de uma foto para saber o que é um ovo. Não fazer.
- **"1 fio de" azeite e "1 c. chá de" sal** com a quantidade na coluna dos números. Fica estranho ler
  "1 fio de" isolado à direita. Quantidades vagas devem ficar junto ao nome, e é por isso que o nosso
  schema tem `qb` como unidade em vez de as forçar à coluna numérica.

---

## Ecrã 4 — Detalhe, aba "Preparação"

**Como está montado:** cartão de "Dificuldade: Fácil" com ícone de chapéu de chef, em cima à direita.
Por baixo, os passos numerados num cartão, com bastante entrelinha. Definições da máquina a **negrito**
dentro do texto: "pique **10 seg/vel 4**".

**A levar:**

- **Números dos passos numa coluna própria à esquerda**, separados do texto. Ajuda a não perder o sítio.
- **Entrelinha generosa.** É a única concessão real que fazem à leitura à distância.
- **Negrito para o que é acionável** dentro do passo. Nós não temos velocidades de máquina, mas temos
  tempos e temperaturas — "**200 °C**", "**20 min**" — e o mesmo tratamento aplica-se.

**A evitar, e este é o mais importante:**

- **Os passos são parágrafos, não bullets.** O passo 4 é um bloco de cinco linhas que contém quatro
  ações distintas: aquecer o azeite, colocar porções, achatar com uma colher, fritar dos dois lados.
  A meio de cozinhar, com as mãos ocupadas, encontrar onde se ia num parágrafo destes é exatamente o
  problema que se quer evitar.

  O planeamento original deste projeto já rejeitava isto explicitamente — "texto por bullets e
  simplificado, nada de grandes parágrafos" — e a spec 002 e a spec 007 já o impõem. Ver isto na
  Bimby confirma que a regra estava certa, e que é uma diferença real, não uma preferência.

- **Esta aba não é o modo de cozinha.** É a receita para ler antes. O "Iniciar" leva a um modo
  separado. É a mesma separação que temos entre a spec 002 (detalhe) e a spec 005 (modo cozinha), e
  está certa.

---

## Cor

O Cookidoo usa um verde forte e saturado sobre branco e cinzentos muito claros. O verde aparece só em
três sítios: navegação ativa, aba ativa, e o botão "Iniciar". Tudo o resto é texto escuro sobre claro.

A nossa paleta provisória (`--color-accent: #2f6b3f`) é um verde mais escuro e mais quebrado. A
disciplina de usar o acento **só na ação e no estado ativo** é o que vale a pena copiar, mais do que
o tom exato — é o que faz o botão principal saltar sem a interface parecer um semáforo.

---

## O que isto muda nas nossas specs

| Observação | Consequência |
|---|---|
| Navegação vertical à esquerda | Adotar. Poupa altura, que é o que falta em horizontal |
| "16 unidades" | Confirma a proposta **P3** (rendimento que não são pessoas) em `metadata-receitas.md` |
| Aparelhos separados de utensílios | O `kind` da taxonomia de equipamento passa a ter uso na interface |
| Quantidade em coluna à direita | Adotar na lista de ingredientes |
| Nota do ingrediente em cinzento sob o nome | Adotar; é o campo `note` do schema |
| Ação principal como círculo grande | Adotar para o "Cozinhar" da spec 005 |
| Detalhe em **abas**, não num scroll único | **Decisão em aberto** — a spec 002 descreve um pop-up com scroll. Ver abaixo |
| Passos em parágrafo | Confirma a nossa regra de bullets curtos. Não mudar nada |
| Avaliações e pesquisa em primeiro plano | Não adotar; são respostas a um catálogo de milhares |
| Miniaturas por ingrediente | Não adotar; custo alto, benefício nulo |

### Decisão em aberto: abas ou scroll no detalhe?

A spec 002 descreve o detalhe como um pop-up com secções empilhadas e scroll. O Cookidoo usa abas.

**A favor das abas:** nunca se perde o sítio, e cada aba pode usar a largura toda em duas colunas,
como no ecrã 3. Numa cozinha, voltar a um sítio conhecido vale mais do que ver tudo de uma vez.

**A favor do scroll:** um gesto só, sem decidir onde clicar. E o nosso detalhe tem menos conteúdo do
que o do Cookidoo — sem "Dicas", sem avaliações, sem variantes.

**Proposta:** resolver com as duas hipóteses desenhadas lado a lado, não por argumento.

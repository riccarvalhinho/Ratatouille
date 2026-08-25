# Benchmark — Cookidoo / Bimby

A Bimby é a referência de origem deste projeto: o planeamento original diz "app semelhante ao
software que está integrado nas Bimby". É o benchmark mais próximo do que se quer construir.

**Material analisado:** quinze fotografias do Cookidoo a correr num tablet, em horizontal — quatro
de 2026-05-03 (pesquisa/catálogo e as três abas do detalhe) e mais onze de 2026-08-25 (modo cozinha
ao vivo, abas "Dicas" e "Mais", filtros, ecrã inicial e "As minhas receitas").

> **As fotografias não estão no repositório.** São capturas da interface e da fotografia de comida de
> um produto comercial, e este repositório é público desde o ADR 0005. O que interessa está aqui em
> texto — como escrito na regra deste ficheiro, o que conta não é a imagem, é o que dela se aproveita
> e porquê. Se um dia forem precisas, ficam fora do Git.

### Material por recolher

> **Atualização de 2026-08-25:** chegaram mais onze fotografias, que cobrem o modo cozinha ao vivo,
> as abas "Dicas" e "Mais", os filtros da pesquisa, o ecrã inicial e "As minhas receitas". Estão
> analisadas na secção "Segunda ronda". Falta só a página web abaixo.

Uma página de detalhe do Cookidoo web, apontada como tendo disposição interessante:
`https://cookidoo.pt/recipes/recipe/pt-PT/r915889`

Não é acessível a partir das sessões de Claude Code — o proxy bloqueia o domínio. Precisa de
screenshots, como os quatro ecrãs analisados abaixo. Interessa sobretudo a **ordem das secções** e
como distribuem tempos, doses, utensílios e nutrição na largura, já que a versão web tem mais espaço
do que o tablet da Bimby.

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

## Segunda ronda — mais onze ecrãs (2026-08-25)

Fotografias do mesmo tablet, desta vez cobrindo o que faltava: **o modo cozinha ao vivo**, as abas
"Dicas" e "Mais" do detalhe, os filtros da pesquisa, o ecrã inicial (incluindo offline) e "As minhas
receitas". Continuam fora do repositório, pela mesma razão do ADR 0005.

Isto fecha o "material por recolher" que estava em aberto no topo deste ficheiro, exceto a página web.

---

### Ecrã 5 — Modo cozinha ao vivo

O ecrã que mais interessava, e o mais surpreendente: **não se parece nada com o nosso, e na maior
parte das escolhas o nosso é que está certo para o nosso caso.**

**Como está montado:** o passo é um **cartão pequeno a flutuar sobre um fundo vivo** — uma imagem da
máquina a trabalhar. O cartão ocupa talvez um sexto do ecrã, no canto superior esquerdo. Lá dentro:
"Passo 1" em pequeno, o texto do passo, um "…" e um botão verde "Seguinte" dentro do próprio cartão.
À esquerda, meio tapado e esbatido, está o cartão do "Passo 2" — os passos são um **baralho
horizontal**, não uma coisa de cada vez. Em baixo, um "20" com uma linha: é o estado da máquina.

**Porque não copiamos quase nada disto:**

- O ecrã deles está montado na máquina, a 40cm, e **a máquina é que está a fazer o trabalho**. O
  nosso está na parede, a 70cm, e quem faz o trabalho é uma pessoa com as mãos ocupadas. O texto
  deles é pequeno porque não precisa de ser lido a distância nenhuma.
- O botão "Seguinte" **vive dentro do cartão**, portanto muda de sítio conforme o cartão. O nosso
  está sempre no mesmo ponto da barra de baixo, que foi decisão explícita da conversa 4.
- O fundo vivo por trás do texto custa contraste. Numa cozinha com vapor e a um braço de distância,
  não trocávamos legibilidade por isso.
- O baralho horizontal convida a deslizar — e deslizar é precisamente o que a nossa regra de "só os
  botões reagem ao toque" existe para evitar.

**O que há mesmo a levar, e é uma coisa só:**

- **O passo seguinte é o cartão a seguir, não um resumo num canto.** Eles dizem a posição pela
  forma: vê-se meio cartão à esquerda, portanto há um passo antes. Nós dizemos a posição por texto
  ("Passo 3 de 6") e por uma barra de progresso. Vale a pena perguntar se a nossa é suficiente, mas
  não vale a pena trocar por um baralho que pede gestos.

**E uma nota sobre o que eles não têm:** naquele ecrã não há controlo de temporizador nenhum, porque
o tempo é da máquina. **Toda a parte dos temporizadores é nossa e não tem benchmark** — o desenho dos
três círculos e da faixa do topo não tem com que ser comparado, e as perguntas 4 e 5 da conversa 4
vão ter de se decidir sem referência.

---

### Ecrã 6 — Preparação, com grupos

O achado mais valioso das onze fotografias, e o que mexe com uma decisão que julgámos fechada ontem.

Os passos da receita das almôndegas estão **agrupados por componente do prato**, com subtítulo:

```
Almôndegas
  1 … 2 … 3 … 4
Molho de tomate
  5 … 6
```

E o mesmo grupo aparece **também na lista de ingredientes** (ecrã 4): "Almôndegas" é lá um cabeçalho
com os ingredientes daquele componente por baixo.

**Porque isto interessa:** na conversa 4 propus um campo `phase` para agrupar passos, e descartei-o
quando percebi que os títulos do exemplo do Claude eram 1 para 1 com os passos. **Descartei a coisa
certa pela razão certa, mas o conceito existe mesmo — e não é o que eu tinha proposto.** A diferença:

| | O que eu propus | O que o Cookidoo faz |
|---|---|---|
| O que agrupa | Fases de trabalho ("preparar", "refogar") | **Componentes do prato** ("almôndegas", "molho de tomate") |
| Onde aparece | Só nos passos | **Nos passos e nos ingredientes** |
| O que resolve | Orientação dentro de uma lista longa | "Que parte do prato estou a fazer, e o que leva" |

O deles é melhor, e por uma razão concreta: um componente é uma coisa que existe fora da receita —
faz-se o molho, prova-se o molho, o molho pode sobrar. Uma fase de trabalho é uma invenção da
interface. E porque atravessa ingredientes e passos, **uma só ideia arruma dois ecrãs**.

Onde isto bateria em nós: o bacalhau com natas tem béchamel, e o "Para o béchamel:" que estava
enfiado dentro do texto do passo era exatamente isto a pedir um campo. Depois do reagrupamento de
ontem ficou em dois passos e deixou de doer, mas o conceito continua de pé para receitas com duas
preparações a sério.

**Não aplicar agora.** É mudança de schema, atravessa `ingredients` e `steps`, e a maior parte das
receitas do seed não tem componentes nenhuns. Fica como material para a conversa 4 ou 1.

**Uma coisa a não copiar:** as regulações da máquina aparecem a negrito dentro da frase — "triture
**5 seg/vel 7**". Nós tiramos temperatura e duração para fora do texto, como etiquetas. O deles é
inevitável (é um comando); o nosso lê-se melhor de relance, e é para manter.

---

### Ecrã 7 — Detalhe, aba "Dicas" e as notas pessoais

Duas coisas diferentes no mesmo ecrã, e nós não temos nenhuma das duas.

**"Dicas"** são do autor da receita: substituições ("pode substituir a carne bovina por vitela, porco
ou frango"), variantes ("sirva as almôndegas com arroz ou batatas ao vapor"), e ajustes
("se usar tomates frescos, adicione-os no passo 6"). É conhecimento que não cabe num passo porque não
é uma ação — é uma alternativa.

**"As minhas notas"** são pessoais, com um "Adicionar nota" e o aviso "esta nota só é visível para
si". É onde fica "da última vez ficou salgado".

**A levar, as duas, mas com pesos diferentes:**

- As **notas pessoais** são a mais valiosa para nós e a mais barata: escrevem-se como os favoritos e
  o histórico já se escrevem, pela outbox. Numa app de uso pessoal, "menos 10 minutos no forno do que
  diz" é a informação que mais se perde e mais falta faz.
- As **dicas** são um campo de schema e trabalho para o importador.

**E um aviso que vale mais do que as duas:** as dicas deles **referem passos pelo número** — "adicione
no passo 6". Nós renumerámos 55 passos para 38 ontem. Se tivéssemos dicas escritas assim, tinham
partido todas em silêncio. Se algum dia adotarmos dicas, ou não referem números, ou referem o
**título** do passo, que é estável.

---

### Ecrã 8 — Filtros da pesquisa

Três coisas, e duas são para copiar já.

**Os filtros são chips que abrem um modal**, não um painel sempre visível. "Tempo" e "Porções" são
dois chips; tocar abre uma caixa com as opções. Poupa a altura que em horizontal é escassa.

**O botão de confirmar diz o resultado antes de o aplicar:** "Mostrar 1863 resultados". Muda enquanto
se escolhe. É o melhor detalhe das onze fotografias — vê-se a consequência antes de a assumir, e
evita o filtro que devolve zero e obriga a voltar atrás. Barato para nós.

**"Repor"** dentro do modal, para limpar aquele filtro sem o fechar.

**Uma decisão de dados que confirma a nossa:** o filtro de tempo tem **dois eixos separados** — "tempo
de preparação" e "tempo total", cada um com ≤15/≤30/≤45. É a distinção que o nosso `timing` já faz
entre `prep`, `cook` e `total`, e é sinal de que separar valeu a pena. A spec 001 filtra por duração;
vale a pena decidir por qual das duas, ou pelas duas.

**A não copiar:** as abas de resultados ("Receitas 1863 / Modos e ingredientes 74 / Dispositivos &
Definições 11 / Suporte"). São a resposta a um catálogo com milhares de coisas de naturezas
diferentes. Nós temos receitas e mais nada.

---

### Ecrã 9 — Detalhe, aba "Mais"

**Nutrição** por porção, com a base declarada ("Por 1 porção") e a ordem: valor energético em kJ **e**
kcal, hidratos, fibra, gordura, proteína. Declarar a base é o detalhe a copiar — um número nutricional
sem dizer a que quantidade se refere não quer dizer nada. Liga-se à Q4, que continua aberta.

**"Também apresentado em"** — coleções a que a receita pertence, com contagem ("15 Anos de Thermomix
Brasil, 22 receitas"). Não adotar: coleções curadas fazem sentido numa biblioteca comercial, não numa
casa com algumas dezenas de receitas. As nossas labels fazem outro trabalho.

**"Procurar receitas semelhantes"**, com chips das categorias da própria receita ("Comida para
crianças", "Para todos os dias"). **Isto sim, e é quase de graça:** é saltar do detalhe para o
catálogo já filtrado por uma label desta receita. Nós temos as labels e temos os filtros; falta só o
atalho. Resolve o "apeteceu-me sopa" sem obrigar a voltar e filtrar à mão.

---

### Ecrã 10 — Ecrã inicial, e o offline como desenho e não como erro

Interessa porque a spec 006 está por escrever e a Q5 está aberta.

**A ordem do que lá está**, de cima para baixo: "Receitas planeadas" primeiro e a ocupar metade da
largura; ao lado, um quadrante de quatro atalhos; por baixo, "Marcadores"; depois "Cozinhadas
recentemente", com **a data de cada uma**; e por fim "Tendências".

Que o planeamento venha primeiro confirma o que já assumimos. Que as receitas recentes tragam a data
é gratuito para nós — é o que o `history.json` guarda.

**O offline é uma vista desenhada, não uma mensagem de erro.** Sem rede, o painel das receitas
planeadas mostra uma nuvem cortada, "Sem ligação", uma explicação, e um link "Verifique as definições
de Wi-Fi". **O resto do ecrã continua a funcionar.** Degrada-se um painel, não a aplicação.

**A levar:** o princípio de degradar por painel, e a de um estado sem rede ter texto escrito à mão em
vez de um erro genérico.

**A não levar — e é aqui que estamos à frente:** o painel que lhes falha offline é precisamente o
planeamento, porque vive no servidor deles. **O nosso plano da semana é um ficheiro em IndexedDB e
funciona sem rede.** A única coisa que a nossa app não consegue fazer offline é *sincronizar*, e essa
já tem a sua própria vista nas Definições. Vale a pena ser deliberado sobre isto: a nossa página
inicial não precisa de estado offline nenhum, e isso é consequência do ADR 0002, não sorte.

---

### Ecrã 11 — "As minhas receitas"

Cinco abas: **Recentemente confecionadas / Marcadores / As minhas listas / Coleções / Receitas
criadas.**

Duas delas já temos os dados: "recentemente confecionadas" é o `history.json` e "marcadores" é o
`favourites.json`. Hoje ambos estão espalhados pelo catálogo (o coração) em vez de terem um sítio
onde se veem juntos.

**A pergunta que isto levanta**, e que é de arrumação e não de features: o nosso catálogo já é "as
minhas receitas", porque não há outras. Faz sentido uma vista à parte para favoritos e histórico, ou
bastam dois filtros no catálogo que já existe? Inclino-me para os filtros — uma vista nova para um
catálogo de dezenas é mobília a mais. Fica para a conversa 8, que é a da navegação.

**"As minhas listas"** é o equivalente às listas de compras, e eles têm-nas no plural. A nossa é uma
por semana, derivada do plano. Não mudar.

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
| **Segunda ronda (2026-08-25)** | |
| Passos e ingredientes agrupados por **componente do prato** | **Candidato forte, não aplicado.** Mudança de schema que atravessa `steps` e `ingredients`. Ver ecrã 6 — é melhor do que a "fase" que propus na conversa 4 |
| Contagem de resultados no botão do filtro | Adotar. Barato, e evita o filtro que devolve zero |
| Filtros como chips que abrem modal, com "Repor" | Adotar. Poupa altura, que é o que falta em horizontal |
| Filtro de tempo com dois eixos (preparação e total) | Confirma a separação que o `timing` já faz. A spec 001 tem de escolher por qual filtra |
| Notas pessoais por receita | Adotar quando houver espaço. Escreve-se pela outbox como os favoritos; é a informação que mais se perde |
| Dicas do autor (substituições, variantes) | Candidato, com uma ressalva: **nunca referir passos por número**, que renumeram. Referir o título |
| Base da nutrição declarada ("Por 1 porção") | Adotar quando a Q4 fechar |
| Atalho do detalhe para o catálogo filtrado por uma label | Adotar. Temos labels e filtros; falta o atalho |
| Offline degradado por painel, com texto escrito à mão | Adotar o princípio. Mas o nosso ecrã inicial não precisa dele — ver ecrã 10 |
| Data na lista de receitas recentes | Adotar; o `history.json` já a guarda |
| Modo cozinha em cartão pequeno sobre fundo vivo | **Não adotar.** Ver ecrã 5 — o ecrã deles está na máquina a 40cm e a máquina faz o trabalho |
| Botão "Seguinte" dentro do cartão do passo | Não adotar. Muda de sítio; a conversa 4 fixou-o na barra |
| Baralho horizontal de passos | Não adotar. Convida ao gesto, que a regra do toque exclui |
| Regulações a negrito dentro da frase | Não adotar. Etiquetas fora do texto leem-se melhor de relance |
| Abas de resultados por tipo na pesquisa | Não adotar; resposta a um catálogo de milhares |
| Coleções curadas | Não adotar; as labels fazem o trabalho numa casa |

### Decisão em aberto: abas ou scroll no detalhe?

A spec 002 descreve o detalhe como um pop-up com secções empilhadas e scroll. O Cookidoo usa abas.

**A favor das abas:** nunca se perde o sítio, e cada aba pode usar a largura toda em duas colunas,
como no ecrã 3. Numa cozinha, voltar a um sítio conhecido vale mais do que ver tudo de uma vez.

**A favor do scroll:** um gesto só, sem decidir onde clicar. E o nosso detalhe tem menos conteúdo do
que o do Cookidoo — sem "Dicas", sem avaliações, sem variantes.

**Proposta:** resolver com as duas hipóteses desenhadas lado a lado, não por argumento.

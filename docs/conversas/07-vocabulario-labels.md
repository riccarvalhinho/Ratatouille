# Conversa 7 — Vocabulário das labels

**Estado:** Em curso — proposta fechada dos seis quadrantes, à espera de revisão. É o que destranca
os ícones do "Apetece-me algo" (N0) e o único passo antes da encomenda ao Claude Design
**Conduz:** Claude
**Destino das decisões:** `data/taxonomies/labels.json`
**Vem de:** conversa 1, que fechou tudo o resto da metadata

## Porque existe

A metadata ficou fechada, menos isto. Sabemos que as labels se dividem em duas famílias — as que se
**derivam** dos dados e as que têm de ser **declaradas** — e sabemos que uma das categorias
declaradas é o **tipo ou origem de cozinha**, com o importador a perguntar sempre e a aceitar "não
tem" como resposta válida.

Falta o vocabulário: que categorias existem, e que valores cada uma tem.

## O que já está fechado

- Duas famílias: derivadas e declaradas
- Uma categoria declarada é o tipo de cozinha (italiano, indiano, …)
- A etiqueta "saudável" não existe — foi substituída pelo campo `weight`
- Não há etiqueta de dificuldade — o campo foi cortado
- O objetivo é filtrar e agrupar, portanto cada valor tem de ganhar o seu lugar

> **Já aplicado, para desbloquear uma importação:** o grupo `origem` existe no schema e tem **um**
> valor, `portuguesa`. Foi o mínimo para marcar as receitas que já cá estão. O vocabulário completo
> das origens — e das outras categorias — continua a ser esta conversa.

## O que está hoje em `labels.json`

24 labels em quatro grupos: tipo de prato, proteína, regime e ocasião. Foram escritas em M0 por
dedução, sem discussão — servem de ponto de partida para contrariar, não de base a preservar.

> **A proposta "Apetece-me algo", na conversa 2, muda o que esta conversa é.** Se os eixos de um ecrã
> de triagem forem as famílias das labels, então as famílias deixam de ser arrumação e passam a ser
> desenho — cada família é um quadrado que se toca. E a olhar para elas com esses olhos, `ocasiao`
> mistura três conceitos: *Conforto* e *Festa* são vibe, *Rápido* é tempo (e duplica um eixo inteiro
> da triagem), *Aproveitamento* é sobras. Numa lista de chips não se nota; num quadrado nota-se muito.
>
> Fica também a pergunta de `regime` — vegetariano, vegan, sem glúten, sem lactose — ser de outra
> natureza que as restantes: não estreita por apetência, **corta por regra**.

## Proposta fechada — os eixos do "Apetece-me algo"

Escrita para se decidir e depois passar ao Claude Design como encomenda de ícones.

### As duas regras que decidem o resto

**Um quadrante tem 4 a 8 opções — salvo se as opções forem uma escala.** Menos de quatro é uma
pergunta de sim ou não disfarçada; mais de oito deixa de se ver de relance e volta a ser uma lista,
que é o que esta feature existe para não ser. A exceção da escala é real e não é conveniência: três
opções **ordenadas** (leve → equilibrado → substancial) leem-se como um selector; três opções soltas
leem-se como um quadrante meio vazio.

**Um eixo só entra se já houver dados ou vocabulário para ele.** Não é o mesmo que "já haver receitas
etiquetadas" — ver a correção abaixo.

### Uma correção: a "Cultura" não devia ter caído

Tinha-a cortado com o argumento de que a família `origem` só tem uma entrada, "Portuguesa". **O
argumento estava errado, e vê-se pelo próprio ficheiro:** quatro das nove entradas de `tipo-de-prato`
também têm zero receitas — *acompanhamento*, *pequeno-almoço*, *snack*, *pão e massas* — e essas
mantive-as sem hesitar.

A taxonomia é o **vocabulário do que aí vem**, não o censo das seis receitas do seed. Julgar um eixo
pelo que está etiquetado hoje é julgar o catálogo pelo seu estado mais pobre. A `origem` não estava
fraca: estava **por escrever**.

### Os oito quadrantes

Nomes diretos, substantivos, sem interrogações.

| # | Quadrante | De onde vem | Opções |
|---|---|---|---|
| 1 | **Tipo de refeição** | `labels.tipo-de-prato` | 8 |
| 2 | **Ingrediente principal** | `labels.proteina`, alargada | 7 |
| 3 | **Método** | `methods` — já no schema | 7 |
| 4 | **Tempo de confeção** | `timing`, em escalões | 4 + 1 |
| 5 | **Cultura** | `labels.origem`, por escrever | 8 |
| 6 | **Apetite** | `weight` — já no schema | 3 (escala) |
| 7 | **Ocasião** | `labels.ocasiao`, limpa | 4 |
| 8 | **Regime** | `labels.regime` | 4 |

Oito dá uma grelha de **4 × 2**, que a 1280 são uns 280px por mosaico — o mesmo alvo que um cartão do
catálogo, e portanto já sabemos que funciona a 70 cm.

---

**1. Tipo de refeição** — Sopa · Salada · Prato principal · Acompanhamento · Sobremesa ·
Pequeno-almoço · Snack · Pão e bolos

Junta-se *Entrada* a *Snack*: pratos pequenos fora da refeição principal, e a diferença entre os dois
é a hora e não a comida. E *Pão e massas* passa a *Pão e bolos*, porque massa é prato principal e
estava ali por ser farinha — arrumação de despensa, não de refeição.

**2. Ingrediente principal** — Carne · Aves · Peixe · Marisco · Ovos · Leguminosas · Legumes

Separar *Aves* de *Carne*, porque "apetece-me frango" é uma frase que se diz e "apetece-me carne" é
vaga. E acrescentar *Legumes*, para os pratos em que o vegetal é o assunto — que **não** é o mesmo que
vegetariano: o arroz doce é vegetariano e não tem nada a ver com isto. Um é apetência, o outro é regra.

**3. Método** — Tacho · Forno · Frigideira · Grelhador · Airfryer · Micro-ondas · Sem cozinhar

Não estava na proposta original e é o que sai mais barato: **já existe em `methods`, sem tocar em
nada**. A descrição do próprio campo no schema já diz que responde a *"tenho de ligar o forno?", que é
dos primeiros filtros mentais*.

É também o mais perto que temos de um eixo de **esforço** — forno é pôr lá dentro e ir embora, tacho é
estar ao lume a mexer — e o mais fácil de desenhar: sete objetos concretos, sem uma abstração pelo
meio.

**4. Tempo de confeção** — Até 20 min · Até 40 min · Até 1 h · Mais de 1 h

Escalões calculados de `timing`, sem labels nenhumas. **Isto mata a label *Rápido*,** que duplicava um
eixo inteiro com uma palavra vaga.

**Mais um interruptor, e não uma quinta opção: "sem precisar de véspera".** Sai do `prepAhead`, e não
pode ser um escalão porque não está na mesma escala — não é uma duração, é um sim ou não sobre outro
tipo de tempo. Descobrir às sete da tarde que o bacalhau precisava de vinte e quatro horas de molho é
o pior momento possível, e por isso merece estar no mosaico, visualmente à parte dos escalões.

**5. Cultura** — Portuguesa · Italiana · Asiática · Mediterrânica · Indiana · Mexicana · Francesa ·
Americana

Oito para começar, e **é a única lista que se deve esperar que mude** à medida que o catálogo cresce.
Errar aqui é barato: uma label sem receitas é invisível no ecrã, como as quatro de `tipo-de-prato`
provam hoje.

*Asiática* fica larga de propósito — chinesa, japonesa, tailandesa. Numa casa, separá-las antes de
haver receitas que o justifiquem é precisão a fingir.

**6. Apetite** — Leve · Equilibrado · Substancial

Vem de `weight`, que já está no schema e é atribuído por rubrica escrita, nunca calculado de nutrição
estimada. É a exceção da escala: três opções ordenadas leem-se como um selector.

**7. Ocasião** — Dia a dia · Conforto · Festa · Sobras

O que sobra de `ocasiao` depois de lhe tirar o que outros eixos dizem melhor. *Sobras* é o
*Aproveitamento* renomeado, e fica porque é um modo de decidir a sério — "tenho meio frango do almoço".

**As duas labels mais usadas do seed morrem aqui:** *Dia de semana* e *Fim de semana* são taquigrafia
para "pouco tempo e pouco trabalho" contra "tenho a tarde toda". Com um eixo de tempo em minutos e um
de método, dizem o mesmo pior. Fica *Dia a dia*, que não é tempo — é o contrário de *Festa*.

**8. Regime** — Vegetariano · Vegan · Sem glúten · Sem lactose

Está no painel mas **não é da mesma natureza que os outros sete**: não estreita por apetência, corta
por regra. Duas consequências no desenho: fica visualmente separado, e **é pegajoso** — quem não come
glúten escolhe uma vez e fica, não volta a escolher de cada vez. Os outros sete limpam-se ao fechar;
este não.

### O que muda nos dados

- **Apagar** `rapido`, `dia-de-semana`, `fim-de-semana`.
- **Fundir** `entrada` em `snack`. **Renomear** `aproveitamento` → *Sobras*, `pao-e-massas` → *Pão e
  bolos*, e acrescentar `dia-a-dia`.
- **Criar** `aves`, `legumes`, e sete culturas novas.
- **Reetiquetar as seis receitas do seed** — meia hora.
- **Zero mudanças de schema.** `methods`, `weight` e `timing` já lá estão; só as labels mexem, e
  labels são dados.

### Os ícones

**O inventário completo está em `docs/design/icones-triagem.md`** — as 44 peças uma a uma, com o que
cada uma tem de comunicar, e as regras do conjunto. É esse ficheiro que vai para o Claude Design.

Duas coisas mudaram ao fazer a lista exaustiva, e ambas para menos:

- **O Tempo de confeção deixou de ter um ícone por escalão.** O tempo é uma quantidade, e uma
  quantidade lê-se melhor num número. Quatro relógios com ponteiros diferentes é a pior maneira de
  dizer 20, 40 e 60. Fica um relógio partilhado, quatro numerais, e um ícone para o "sem véspera".
- **O Apetite é um desenho e não três.** O mesmo prato com três enchimentos: o olho vê a progressão
  antes de ler as palavras, que é o que faz uma escala funcionar sem legenda.

Apareceu uma opção nova ao percorrer o Ingrediente principal: **Massa e arroz**. "Apetece-me uma
massa" é das apetências mais comuns que existem, e não tinha onde cair.

### Os ícones: notas de origem

**SVG e não emoji.** Há precedente nos dois sentidos, mas o que pesa é este: os símbolos do modo
cozinha **passaram de caracteres a SVG** porque o "▶" tem variante de emoji e há fontes de Android que
o desenham a cores. Num painel onde o ícone **é o alvo**, isso não pode ficar à sorte da fonte do
tablet — e, gerados no Claude Design, fazê-los à medida custa o mesmo.

Três regras para a encomenda, ou o conjunto sai inconsistente:

1. **Um só nível de abstração.** Uma panela ao lado de um coração são duas linguagens no mesmo painel.
2. **Legíveis a 24px e a 70 cm**: monocromáticos, `currentColor`, traço uniforme — como o
   `app/src/ui/icons.tsx` já faz.
3. **Começar pelos quadrantes 6 e 7.** *Leve*, *Conforto* e *Festa* não são objetos, e é aí que o
   conjunto se parte. Se esses quatro ou cinco funcionarem, os outros quarenta são trabalho.

**A Cultura é o segundo sítio onde isto pode correr mal**, e por outra razão: bandeiras não servem —
uma receita mediterrânica não tem bandeira, e uma bandeira italiana num painel de comida é um clichê
que envelhece mal. Um prato ou um ingrediente-assinatura por cultura é mais difícil de desenhar e
muito melhor de olhar.

## As minhas perguntas de arranque

1. **Quantos filtros é que uma pessoa usa mesmo antes de desistir?** Aposto que dois. Se for isso, ter
   seis categorias de labels é construir um sistema de arrumação que ninguém percorre — e a pergunta
   passa a ser quais são as duas ou três que ficam à frente.

2. **A proteína ainda precisa de ser uma família própria?** Carne, peixe e leguminosas derivam-se dos
   ingredientes. Se são derivadas, deixam de ser labels declaradas e passam a ser calculadas — e a
   taxonomia encolhe.

3. **O tipo de cozinha: lista fechada ou aberta?** Fechada é consistente e obriga a decidir onde cabe
   uma receita que é meio grega meio turca. Aberta cresce sozinha e ao fim de um ano tem "italiano",
   "italiana" e "cozinha italiana".

4. **"Para grupos" é ocasião ou é rendimento?** Uma receita para grupos é uma receita que dá para
   muita gente, e isso já está no rendimento. Ou queres dizer outra coisa — algo que se serve ao meio
   da mesa, para partilhar?

## Registo da conversa

_(por começar)_

## Decisões tomadas

| Decisão | Onde ficou registada |
|---|---|

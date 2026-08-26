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

### A regra que decide tudo o resto

**Um quadrante precisa de 4 a 8 opções.** Menos do que quatro não justifica um quadrante — é uma
pergunta de sim ou não disfarçada. Mais do que oito deixa de se ver de relance e volta a ser uma
lista, que é precisamente o que esta feature existe para não ser.

E a segunda: **um eixo só entra se já houver dados para ele.** Um quadrante bonito que obrigue a
reetiquetar cento e cinquenta receitas não é um quadrante, é um projeto.

### O que se descobre ao aplicar a regra

**A "vibe" é o eixo mais difícil, e pela razão contrária à que eu esperava.** Não é por faltarem
dados — é porque **quase tudo o que parece vibe já está dito por outro eixo, e melhor.** "Rápido" é
tempo, e o tempo tem minutos. "Saudável" é peso, e o peso tem uma rubrica. "Guloso" é sobremesa, e
isso é o tipo de prato. Depois de tirar tudo o que já está dito noutro sítio, sobram três: *Conforto*,
*Festa*, *Aproveitamento*. Três não chega para um quadrante.

**E "dia de semana" e "fim de semana" deixam de fazer sentido.** São as duas labels mais usadas do
seed, e são taquigrafia para "pouco tempo e pouco trabalho" contra "tenho a tarde toda". Com um eixo
de tempo em minutos e um eixo de método, dizem o mesmo pior. **Proponho apagá-las.**

### Os seis quadrantes

| # | Quadrante | De onde vem | Opções |
|---|---|---|---|
| 1 | **O que é** | `labels.tipo-de-prato` | 8 |
| 2 | **Com quê** | `labels.proteina`, alargada | 7 |
| 3 | **Como se faz** | `methods` (já no schema) | 7 |
| 4 | **Quanto tempo** | `timing`, em escalões | 5 |
| 5 | **Que refeição** | `weight` + `ocasiao` limpa | 6 |
| 6 | **Regime** | `labels.regime` | 4 |

**1. O que é** — Sopa · Salada · Prato principal · Acompanhamento · Sobremesa · Pequeno-almoço ·
Snack · Pão e bolos.

Muda pouco: hoje são nove, e junta-se *Entrada* a *Snack* (pratos pequenos antes ou fora da refeição —
a diferença é a hora, não a comida) e troca-se *Pão e massas* por *Pão e bolos*, porque massa é prato
principal e estava ali por ser farinha, o que é uma arrumação de despensa e não de refeição.

**2. Com quê** — Carne · Aves · Peixe · Marisco · Ovos · Leguminosas · Legumes.

Duas mudanças. **Separar *Aves* de *Carne*,** porque "apetece-me frango" é uma frase que se diz e
"apetece-me carne" é vaga. E **acrescentar *Legumes*** para os pratos em que o vegetal é o assunto —
que não é o mesmo que vegetariano: o arroz doce é vegetariano e não tem nada a ver com isto. Um é
apetência, o outro é regra.

**3. Como se faz** — Tacho · Forno · Frigideira · Grelhador · Airfryer · Micro-ondas · Sem cozinhar.

**Este eixo não estava na proposta e é o que sai mais barato: já existe no schema, em `methods`, sem
tocar em nada.** E a descrição do próprio campo já diz que responde a *"tenho de ligar o forno?", que
é dos primeiros filtros mentais*. É também o mais fácil de desenhar — sete objetos concretos, sem uma
abstração pelo meio.

Vale ainda mais do que parece, porque é o mais perto que temos de um eixo de **esforço**: forno é pôr
lá dentro e ir embora, tacho é estar ao lume a mexer. Num dia de semana é essa a pergunta a sério.

**4. Quanto tempo** — Até 20 min · Até 40 min · Até 1 h · Mais de 1 h · **Sem precisar de véspera**.

Escalões calculados de `timing`, sem labels nenhumas. O quinto não é um escalão: é o filtro que salva
jantares, e sai do `prepAhead` que já existe. Descobrir às sete da tarde que o bacalhau precisava de
vinte e quatro horas de molho é o pior momento possível.

**Isto mata a label *Rápido*.** Duplicava um eixo inteiro com uma palavra vaga.

**5. Que refeição** — Leve · Equilibrado · Substancial · Conforto · Festa · Sobras.

É a "vibe", e é uma fusão deliberada de `weight` com o que sobra de `ocasiao`. Fundir soa a contradizer
o que escrevi acima sobre `ocasiao` misturar conceitos — mas a diferença é real: **o que ali estava
mal era misturar tempo com carácter**, e o tempo tem um eixo próprio com números. *Leve*, *Conforto* e
*Festa* são todos carácter da refeição, e escolhe-se um.

*Sobras* é o *Aproveitamento* renomeado. Merece ficar porque é um modo de decidir a sério — "tenho
meio frango do almoço" — e não tinha outro sítio.

**6. Regime** — Vegetariano · Vegan · Sem glúten · Sem lactose.

Está no painel mas **não é da mesma natureza que os outros cinco**: não estreita por apetência, corta
por regra. Duas consequências no desenho: fica visualmente separado dos outros, e **é pegajoso** —
quem não come glúten não volta a escolher isso de cada vez, escolhe uma vez e fica. Os outros cinco
limpam-se ao fechar; este não.

### O que muda nos dados

- **Apagar** `rapido`, `dia-de-semana`, `fim-de-semana` — três labels que outros eixos dizem melhor.
- **Renomear** `aproveitamento` → *Sobras*, `entrada` funde em `snack`, `pao-e-massas` → *Pão e bolos*.
- **Criar** `aves` e `legumes`.
- **Reetiquetar as seis receitas do seed**, que é meia hora.
- `origem` deixa de ser eixo de triagem — fica label, para o dia em que houver cozinhas a sério.
- **Zero mudanças de schema.** `methods`, `weight` e `timing` já lá estão; só as labels mexem, e labels
  são dados.

Total: **37 ícones**, e a contagem por quadrante está na tabela.

### Os ícones

**SVG, não emoji.** Já há precedente nos dois sentidos — o 🍲 do marcador de receita sem imagem, e os
símbolos do modo cozinha que **passaram de caracteres a SVG** porque o "▶" tem variante de emoji e há
fontes de Android que o desenham a cores. Num ecrã onde o ícone **é o alvo**, isso não pode ficar à
sorte da fonte do tablet. E como vão ser gerados no Claude Design, o custo de os fazer à medida é o
mesmo.

A encomenda tem de dizer três coisas, ou o conjunto sai inconsistente:

1. **Um só nível de abstração.** Ou são todos objetos, ou são todos símbolos. Um ícone de panela ao
   lado de um ícone de "conforto" desenhado como um coração são duas linguagens no mesmo painel.
2. **Legíveis a 24px e a 70 cm**, monocromáticos, `currentColor`, traço uniforme — como o
   `app/src/ui/icons.tsx` já faz.
3. **O quadrante 5 é o difícil.** *Leve*, *Conforto* e *Festa* não são objetos. É aí que o conjunto
   se parte, e é a parte que vale a pena desenhar primeiro para ver se pega.

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

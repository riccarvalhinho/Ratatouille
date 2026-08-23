# Conversas

Temas que se decidem melhor a falar do que a escrever sozinho. Ficam registados aqui para poderem ser
**iniciados e retomados** em qualquer sessão, sem recomeçar do zero.

O método existe por uma razão prática: viagens de carro ou de transportes dão tempo para pensar mas
não para implementar. São a altura certa para fechar decisões que depois poupam trabalho.

Duas limitações do formato, que valem mais do que parecem:

**É por turnos, não é uma conversa a fluir.** O Ricardo grava um áudio, o Claude responde por escrito,
e essa resposta é lida ou ouvida mais tarde. Cada ronda custa uma gravação e uma espera, portanto tem
de valer a pena: uma proposta concreta e duas ou três perguntas que se respondam todas de seguida num
único áudio. Nada de esperar ping-pong rápido.

**As respostas são ouvidas, não vistas.** Prosa e perguntas numeradas. Tabelas, listas encaixadas e
blocos de código não sobrevivem a ser lidos em voz alta — guardar isso para o ficheiro, não para a
resposta.

E como quem está do outro lado vai a andar: temas visuais exploram-se em movimento — o porquê, as
referências, o que incomoda — mas a escolha entre alternativas desenhadas fica para uma sessão
sentada.

## Como se usa

Basta dizer, em linguagem normal:

> "vamos falar do catálogo"
> "continua a conversa da metadata"
> "que conversas estão abertas?"

A sessão lê o ficheiro do tema, vê onde ficou, e continua daí.

## Onde estas conversas acontecem

Em duas superfícies, com regras diferentes.

**Nesta sessão (Claude Code).** Acesso direto ao repositório, com validação: `npm run validate`,
lint, typecheck e CI. É aqui que se mexe em schema, specs, ADRs e dados.

**No Cowork**, em modo conversacional durante uma viagem. Lê o repositório — que é público, portanto
basta o URL, e com o conector do GitHub ligado também escreve.

> **Esta é a pasta das conversas do Cowork.** Não criar uma segunda — `/cowork-conversations` ou
> parecido — para o mesmo fim. Duas pastas para a mesma coisa é a fragmentação que o ADR 0001 existe
> para evitar, e partia a continuidade: um tema com metade da história aqui e metade lá.

### Regras para uma conversa conduzida no Cowork

1. **Ler primeiro este README e o ficheiro do tema.** É o que dá o contexto e o protocolo.
2. **Escrever só dentro de `docs/conversas/`.** Nada de tocar em `data/`, `app/`, `docs/specs/` ou
   `docs/adr/` a partir do Cowork.
3. **Atualizar o ficheiro do tema no fim**: o registo da conversa, e a tabela de decisões tomadas.
4. **As decisões estruturais ficam anotadas, não aplicadas.** Uma decisão que muda o schema, uma spec
   ou um ADR escreve-se na tabela do tema com o destino indicado, e é aplicada depois numa sessão de
   Claude Code.
5. **Marcar o estado como `Decisões por aplicar`** no cabeçalho do ficheiro. É o sinal de que há
   trabalho à espera — sem ele, a sessão seguinte não tem como saber que a conversa avançou.

### O ficheiro do tema é um brief

Quando um tema está marcado com `Decisões por aplicar`, a sessão de Claude Code trata-o como
especificação: lê, aplica as decisões ao código, aos dados ou às specs, corre `npm run validate`, e
muda o estado para `Aplicada`.

**Se alguma decisão estiver ambígua, perguntar antes de mexer.** Uma conversa resumida perde contexto,
e aplicar a interpretação errada custa mais do que uma pergunta.

### Estados de um tema

| Estado | Significa |
|---|---|
| `Por começar` | Ainda não se falou disto |
| `Em curso` | Conversa começada, sem decisões fechadas |
| `Decisões por aplicar` | Há decisões fechadas à espera de irem para o código, os dados ou as specs |
| `Aplicada` | Tudo o que se decidiu já está no sítio certo |
| `Fechada` | Tema esgotado, não há mais a decidir |

O porquê da regra 4: uma escrita direta ao `main` salta a validação toda. Para Markdown de conversa
isso é inofensivo; para o schema ou para os dados não é — um ingrediente que não existe passa no
schema e parte a lista de compras, e é o validador que apanha isso. O ficheiro da conversa é o
rascunho, a spec e o schema são o destino.

### Sem conector do GitHub

Funciona na mesma, com um passo manual: o Cowork lê pelo URL público e no fim escreve o resumo da
conversa. Cola-se numa sessão de Claude Code, que o regista no ficheiro certo com a verificação toda.

## Como estas conversas têm de correr

Isto não é uma entrevista, é um debate. Quem conduz a conversa do lado do Claude tem de:

1. **Ter opinião e dizê-la.** Propor uma resposta concreta em vez de perguntar "o que preferes?" no
   vazio. É mais fácil discordar de uma proposta do que inventar do nada.
2. **Discordar quando discorda**, com o argumento à frente. Uma decisão que ninguém contrariou é uma
   decisão mal testada.
3. **Perguntar poucas coisas de cada vez.** Duas ou três perguntas, não um questionário. A conversa
   avança por rondas.
4. **Perguntar pelo concreto, não pelo abstrato.** "Na última vez que planeaste a semana, como
   começaste?" vale mais do que "o que valorizas no planeamento?".
5. **Puxar pelo porquê.** Quando aparece uma preferência, procurar o problema por trás dela — muitas
   vezes o problema tem uma solução melhor do que a preferência.
6. **Dizer quando uma decisão tem custo.** Se uma escolha implica trabalho desproporcionado ou fecha
   portas, isso faz parte da informação.
7. **Fechar.** No fim de cada sessão, escrever no ficheiro o que ficou decidido, o que ficou em
   aberto, e por onde continuar. Uma conversa que não deixa rasto foi tempo deitado fora.

## Onde as decisões vão parar

O ficheiro da conversa é o rascunho, não o destino. Uma decisão fechada muda-se para onde pertence:

| Tipo de decisão | Destino |
|---|---|
| Comportamento de uma feature | `docs/specs/` |
| Estrutural, com alternativas | `docs/adr/` |
| Formato dos dados | `data/schema/` e `docs/product/metadata-receitas.md` |
| Visual | `docs/design/design-system.md` |
| Âmbito | `docs/product/roadmap.md` |

## Temas

| # | Tema | Estado | Quem conduz |
|---|---|---|---|
| 1 | [Metadata das receitas](01-metadata-receitas.md) | Por começar | Ricardo |
| 2 | [Catálogo de receitas](02-ui-catalogo.md) | Por começar | Claude |
| 3 | [Detalhe da receita](03-ui-detalhe.md) | Por começar | Claude |
| 4 | [Modo cozinha](04-ui-modo-cozinha.md) | Por começar | Claude |
| 5 | [Planeamento semanal](05-ui-planeamento.md) | Por começar | Claude |
| 6 | [Direção visual](06-direcao-visual.md) | Por começar | Claude — só a parte de explorar |

"Quem conduz" é só quem traz o material de partida. O tema 1 é do Ricardo porque há uma visão da
estrutura para explicar; os outros partem de propostas concretas para contrariar.

### Ordem sugerida

**1 antes de tudo.** A metadata determina o que a interface pode mostrar — desenhar ecrãs sobre um
formato que ainda vai mudar é desenhar duas vezes.

Depois **2 e 3** juntos, que partilham decisões, e **6** logo a seguir enquanto os ecrãs estão
frescos. **4** e **5** podem esperar: são M3 e M5.

## Temas ainda sem ficheiro

Abertos, mas pequenos ou dependentes dos de cima. Passam a ficheiro próprio se crescerem:

- **Histórico automático ou manual** (Q5) — provavelmente resolve-se dentro do tema 5
- **A lista de compras conhece a despensa?** (Q9)
- **O fluxo de perguntas do importador** (spec 007) — depende do tema 1
- **Rigor da informação nutricional** (Q4) — depende do tema 1
- **Apps de compras e retalhistas** (M6) — sem recursos alocados, não vale a pena ainda

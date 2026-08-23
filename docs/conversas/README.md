# Conversas

Temas que se decidem melhor a falar do que a escrever sozinho. Ficam registados aqui para poderem ser
**iniciados e retomados** em qualquer sessão, sem recomeçar do zero.

O método existe por uma razão prática: há tempos mortos que dão para pensar mas não para
implementar. São a altura certa para fechar decisões que depois poupam trabalho.

**O contexto real é este:** viagens de carro ou de transportes públicos, com internet. Não é alguém
sentado a uma secretária com dois monitores. Isso condiciona a forma da conversa mais do que parece —
ver "Como isto acontece na prática".

## Como se usa

Basta dizer, em linguagem normal:

> "vamos falar do catálogo"
> "continua a conversa da metadata"
> "que conversas estão abertas?"

A sessão lê o ficheiro do tema, vê onde ficou, e continua daí.

## Como isto acontece na prática

Quem está do outro lado vai a andar. Isso implica quatro coisas, e ignorá-las estraga o método:

1. **Mensagens curtas.** Nada de tabelas longas nem documentos a meio da conversa. Duas ou três
   perguntas que se leiam de relance ou se ouçam, e uma proposta concreta por ronda.
2. **Respostas curtas, provavelmente ditadas.** Espera texto sem pontuação, com erros de transcrição
   e frases a meio. Não corrigir, não implicar com a forma. Se o sentido for ambíguo, confirmar numa
   frase — mas assumir a leitura mais provável em vez de travar a conversa.
3. **A sessão pode acabar a qualquer momento.** Chegou, mudou de comboio, entrou alguém. Por isso
   **escrever no ficheiro a cada ronda**, não só no fim. Uma decisão tomada e não registada perde-se.
4. **Não há como olhar para nada.** Cores, layouts e maquetas não se avaliam a conduzir. Temas
   visuais podem ser *explorados* em movimento — o porquê, as referências, o que incomoda — mas a
   escolha final fica para um ecrã.

Como há internet, dá para consultar, verificar e commitar durante a conversa. A escrita no repo
acontece ao vivo, não fica para depois.

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

| # | Tema | Estado | Quem conduz | Em movimento? |
|---|---|---|---|---|
| 1 | [Metadata das receitas](01-metadata-receitas.md) | Por começar | Ricardo | Sim — é tudo conceito |
| 2 | [Catálogo de receitas](02-ui-catalogo.md) | Por começar | Claude | Sim |
| 3 | [Detalhe da receita](03-ui-detalhe.md) | Por começar | Claude | Sim — o que se decide é comportamento, não aspeto |
| 4 | [Modo cozinha](04-ui-modo-cozinha.md) | Por começar | Claude | Sim — é o que melhor se discute a falar |
| 5 | [Planeamento semanal](05-ui-planeamento.md) | Por começar | Claude | Sim — depende de hábitos, e hábitos contam-se |
| 6 | [Direção visual](06-direcao-visual.md) | Por começar | Claude | Só metade — explorar sim, escolher não |

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

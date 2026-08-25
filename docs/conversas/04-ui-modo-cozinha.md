# Conversa 4 — Modo cozinha

**Estado:** Em curso — perguntas 1, 2, 3 e 8 fechadas e aplicadas. Faltam a 4, a 5, a 6 e a 7
**Conduz:** Claude
**Destino das decisões:** `docs/specs/005-modo-cozinha.md` — e, para a pergunta 8, muito mais do que
isso: ver o inventário na proposta. A regra da granularidade é uma regra de **como se escrevem
receitas**, portanto vai também para a skill `importar-receita`.
**Prioridade:** Pode esperar — é M5. Mas é o ecrã que justifica o tablet estar na parede.

> **Já existe uma versão construída.** As perguntas 1, 2, 3 e 8 estão respondidas e aplicadas no
> código, nos dados, no schema e na skill — ver o registo abaixo. As 4 a 7 continuam por responder.

## Porque existe

É o que mais se aproxima da experiência Bimby, e o único ecrã usado com as mãos ocupadas, sujas ou
molhadas. Todas as regras de interface normais são suspeitas aqui.

## O que já está fechado

- Ecrã inteiro, sem navegação à volta
- Um passo de cada vez, tipografia grande (24px no mínimo)
- Ingredientes do passo visíveis junto ao passo
- Ecrã mantido ligado (Wake Lock API — existe no Fire OS 7)
- Temporizadores por passo, vários em simultâneo

## As minhas perguntas de arranque

1. **Como é que avanças de passo com as mãos sujas?** É a pergunta que decide o ecrã todo. Hipóteses:
   toque em qualquer sítio da metade direita; um botão enorme em baixo; voz. A minha aposta é o toque
   numa zona grande, porque voz numa cozinha com exaustor ligado é uma promessa que não se cumpre —
   mas se tens experiência ao contrário, quero saber.

2. **Um passo de cada vez, mesmo?** É o que está na spec e é o que a Bimby faz. Mas às vezes queres
   ver o passo seguinte para saber o que aí vem — "enquanto isto coze, vou cortando". Proponho: o
   passo atual grande, e o seguinte em cinzento pequeno por baixo. Complica ou ajuda?

3. **Um toque acidental — cotovelo, pano, gato — faz-te perder o sítio.** Vale a pena proteger?
   Formas: pedir confirmação para recuar mas não para avançar; ou uma zona de toque que exija
   deliberação. Ou não fazer nada, porque recuar é barato.

4. **Quantos temporizadores em simultâneo é realista na tua cozinha?** Se for um, a interface é
   trivial. Se forem três, é preciso saber a que passo pertence cada um, e isso é outro desenho.

5. **Quando um temporizador toca e estás noutro passo, o que devia acontecer?** Voltar ao passo do
   temporizador é intrusivo. Só avisar pode passar despercebido com barulho de cozinha.

6. **Marcar ingredientes já usados?** Não está na spec. Numa receita com doze ingredientes, ajuda a
   não repetir o sal. Ou é trabalho a mais no meio de cozinhar?

7. **Como sabes que acabaste?** O último passo é "sirva". Depois disso, o que devia o ecrã fazer —
   perguntar se correu bem, voltar à receita, ou apagar-se e deixar-te comer?

8. **Um título por passo?** Veio do modo cozinha do Claude, que põe "Preparar o marisco" a negrito e
   o detalhe a seguir. A favor: dá foco e diz de relance o que se está a fazer, sem obrigar a ler a
   frase toda. Contra: nos passos curtos o título arrisca-se a repetir o verbo — "Temperar o frango"
   por cima de "Tempere as coxas de frango com sal e pimenta" é ruído com ar de estrutura. A saída
   está na proposta abaixo, e obriga a mexer também na **granularidade** dos passos — que é a
   decisão maior que estava escondida atrás desta.

## Proposta para a pergunta 8 — título por passo, com o texto reescrito para completar

### Uma correção, primeiro

A minha primeira leitura do exemplo foi errada e vale a pena ficar registada, porque foi ela que quase
levou a proposta para o sítio errado. Li "Preparar o marisco" como o nome de uma **fase** que cobria
três ou quatro passos, e propus um campo `phase` em vez de um título. Não é isso: no exemplo os
títulos são **1 para 1 com os passos** — "Preparar o marisco", "Fazer o caldo base", "Enriquecer o
caldo", "Fazer o refogado", um por cada número. A relação é próxima, e a fase não é a saída.

### Onde está a diferença que interessa

Está no comprimento do texto, e é grande. Os passos do exemplo têm à volta de **200 caracteres** — são
parágrafos, com quantidades e técnica lá dentro. Os nossos 55 passos do seed têm mediana de **57
caracteres** e máximo de 90. Ou seja, o nosso passo já tem quase o tamanho de um título.

É isso que explica por que ali não há redundância e aqui haveria: um título por cima de um parágrafo
resume; um título por cima de uma frase de sete palavras repete-a.

### A saída é a que apontaste

Não é escolher entre título e texto — é **escrever os dois a saber que o outro existe**. O título fica
com o verbo e o objeto, o texto fica só com o que o título não diz: o como, o até quando, a ressalva.

Mas isso sozinho não chega, e a primeira tentativa mostrou porquê. Escrita passo a passo como o seed
está hoje, saía isto:

> **Juntar as batatas e a água** — Temperar com sal.
> **Cozer** — Até a batata se desfazer com o garfo.

Dois passos sem valor nenhum, e o problema não é a escrita: **é a granularidade.** Aqueles dois são o
mesmo trabalho — pôr as batatas ao lume e esperar. Separá-los obriga a um toque no meio de uma coisa
que não tem meio.

### A regra da granularidade, que é o que faltava

**Um passo é uma ação e a espera que lhe pertence.**

O piso sai do próprio título, e é este o teste prático: **se o título diz tudo o que o texto diz, o
passo é pequeno demais** — junta-se ao vizinho. O padrão a caçar é o par "junte X" seguido de "coza",
que estava a separar uma ação da sua própria espera. O seed está cheio deles.

O teto não é de gosto, é do schema: **um passo tem um temporizador só e um `passive` só.** Duas
esperas não cabem no mesmo passo — "aloure 5 minutos e depois coza 20" tem de ser dois. É o limite
superior da agregação e não se mexe nele sem mexer no modelo dos temporizadores.

Entre os dois cabe o que interessa: uma tarefa que se diria em voz alta a alguém na cozinha.

### O caldo verde, refeito com a regra

De oito passos para seis, e os que sobraram têm todos porquê de existir:

| # | Título | Texto | Timer |
|---|---|---|---|
| 1 | Refogar a base | Metade do azeite, a cebola e o alho ao lume. Amolecer sem alourar. | 5 min |
| 2 | Cozer as batatas | Juntar as batatas e a água, temperar com sal e deixar até se desfazerem com o garfo. | 20 min, passivo |
| 3 | Passar a puré | Com a varinha mágica, até ficar liso. | — |
| 4 | Alourar o chouriço | Em rodelas, numa frigideira à parte, sem gordura extra. | 3 min |
| 5 | Cozer a couve | Voltar a pôr o caldo a ferver, juntar a couve e cozer destapado para não perder a cor. | 5 min |
| 6 | Servir | Uma rodela de chouriço e um fio do restante azeite em cada prato. | — |

Os dois passos que desapareceram são exatamente os que a regra manda desaparecer: o "junte as batatas
e a água" foi para dentro do "cozer as batatas", e o "junte a couve" para dentro do "cozer a couve".
Nenhum temporizador se perdeu, porque em cada par só um dos dois o tinha.

O bacalhau com natas faz o mesmo caminho de 12 para 7: cozer e desfiar o bacalhau passam a um só,
alourar a cebola e juntar-lhe o bacalhau também, e o béchamel — que hoje são quatro passos — fica em
dois, o roux e o engrossar.

**E isto fecha, de borla, a pergunta do "Para o béchamel".** Com a granularidade certa, os quatro
passos do molho passam a dois e deixa de haver o que agrupar. A fase não é precisa; era um penso para
um problema de granularidade.

### O ganho que não estava à vista

O seed tem **55 passos**. Com esta regra fica à volta de **35**. São vinte toques a menos com as mãos
sujas, e um "Passo 3 de 6" que quer dizer alguma coisa — hoje o "Passo 3 de 12" do bacalhau conta
metade de passos que são meias-ações.

### O que isto custa

Três coisas, e a segunda é a que pode correr mal.

**Os 55 passos do seed são para reescrever e reagrupar**, não só para lhes acrescentar um título. É o
trabalho todo desta decisão — duas a três horas com o reagrupamento — e é o que faz a diferença entre
a coisa funcionar e ser ruído.

**O importador passa a ter de decidir a granularidade**, que é mais difícil do que separar título de
texto. As receitas na internet vêm escritas com a granularidade que o autor quis, e muitas vêm no
formato mau — uma linha por gesto. A spec 007 precisa das duas regras escritas, com um exemplo mau ao
lado do bom, e provavelmente de uma pergunta ao utilizador quando a fonte vier com passos a mais.

**A tipografia do modo cozinha volta à mesa**, uma semana depois de arrumada. Dois níveis não cabem os
dois a 44px. Proponho o título a 44px e o texto a 30px por baixo: quem olha de longe lê o título, quem
precisa do detalhe baixa os olhos uma linha. Os textos agora são maiores — cerca de 100 caracteres em
vez de 57 — mas a 30px isso são duas linhas, e há espaço.

E um efeito lateral que é bónus e não custo: **o ecrã de detalhe também melhora.** Sete títulos em
lista lêem-se de relance; doze frases não.

### Onde isto vai bater — o inventário

A regra da granularidade não é uma decisão de interface, é uma **regra de como se escrevem receitas**.
E "uma ação por passo" está escrito em **nove sítios**. Se a decisão for tomada, é esta a lista a
percorrer, e é por isso que ela está aqui e não na cabeça de ninguém:

| Onde | O que diz hoje |
|---|---|
| `.claude/skills/importar-receita/SKILL.md` | "Passos em bullets curtos, uma ação por passo" — e está debaixo de "o que já é decidido e não se volta a discutir" |
| `docs/ops/importar-receitas.md` | "Um passo que precisa de vírgulas a mais são dois passos" — **contradiz frontalmente a regra nova** |
| `docs/specs/007-importador-de-receitas.md` | Critério de aceitação: "passos curtos, uma ação por passo" |
| `docs/specs/002-detalhe-receita.md` | Duas vezes: bullets curtos, nunca parágrafos |
| `docs/specs/005-modo-cozinha.md` | O ecrã e a tipografia dos dois níveis |
| `docs/product/metadata-receitas.md` | "Texto curto, uma ação por passo" |
| `data/schema/recipe.schema.json` | O campo `title` novo, e a descrição do `steps` |
| `docs/conversas/01-metadata-receitas.md` | Registo de onde a regra antiga foi decidida |
| `docs/conversas/03-ui-detalhe.md` | O mesmo, para o ecrã de detalhe |

A que interessa mais é a **skill**. É ela que escreve as receitas novas, e uma regra que fique só na
spec não muda nada do que se produz a partir de amanhã. E é ela que tem o problema mais feio: a regra
antiga está lá listada como fechada, o que é precisamente o sítio onde um julgamento destes se perde.

A linha do `docs/ops` é a que fica pior: "um passo que precisa de vírgulas a mais são dois passos"
manda partir exatamente o passo que a regra nova manda juntar. O "Cozer as batatas" do caldo verde
tem duas vírgulas e está certo.

### Três perguntas para responderes de seguida

1. Reescrever e reagrupar os 55 passos do seed agora, ou só aplicar isto às receitas novas daqui para
   a frente? A segunda é mais barata mas deixa o catálogo com dois formatos ao mesmo tempo, e num
   ecrã de detalhe isso nota-se logo.
2. No modo cozinha, qual dos dois é o grande — o título ou o texto? Eu ponho o título a 44px porque é
   o que se lê de longe, mas é o detalhe que te impede de errar, e admito que seja ao contrário.
3. O teto que o schema impõe — um temporizador por passo — chega-te? A pergunta a sério é se há
   receitas tuas onde uma tarefa só tem naturalmente duas esperas seguidas e ficaria mal partida em
   duas. Se houver, isso é uma decisão maior e vale a pena saber já.

## Registo da conversa

### Ronda 1 — como se avança, o passo seguinte, e o toque acidental

Respondidas as perguntas 1, 2 e 3, e as três apontam para o mesmo sítio: **só os botões reagem ao
toque**.

**Pergunta 1 — como se avança.** Dois botões grandes em baixo, com aspeto físico de "carrega em
mim", e um terceiro ao meio para o temporizador quando o passo tem duração. Ficou aplicado assim: o
"Anterior" com um terço da largura, o "Seguinte" com dois terços porque é o que se toca quase
sempre, e o botão do meio estreito a 132px para não competir com eles. Todos com 72px de altura e um
relevo de 2px por baixo, que é o que os faz parecer premíveis sem os desenhar a três dimensões.

**Pergunta 3 — proteção contra toque acidental.** Resolvida por consequência da 1: **fora dos botões
o ecrã é área morta**. O texto do passo, os ingredientes e a barra de progresso não reagem a nada, e
isso cobre a maior parte da superfície do ecrã. Um cotovelo ou um salpico não avançam a receita. Não
há confirmação extra, que custaria um toque em cada passo para evitar um erro raro.

As exceções continuam a ser alvos: o "Sair" no canto superior direito, e os controlos dos
temporizadores que já estão a correr (pausar, repetir, dispensar).

**Pergunta 2 — o passo seguinte.** Sim, mas pequeno e num canto, não como um bloco por baixo do
passo atual. Foram desenhadas duas variantes para escolher:

- **A — cartão no canto inferior direito**, por cima do fundo da lista de ingredientes. Sítio fixo,
  duas linhas, não rouba largura ao passo atual.
- **B — segunda linha dentro do próprio botão "Seguinte"**, sem cartão nenhum.

Está aplicada a **A**. O argumento contra a B é o contraste: 16px sobre o verde forte, a 70cm de
distância e com vapor pelo meio, não se lê — e o passo seguinte serve para planear enquanto se
cozinha, não no instante em que se toca no botão. Se a preferência for a outra, é uma troca de vinte
linhas de CSS.

### Ronda 2 — os alvos passam a redondos

A barra retangular da ronda 1 durou pouco. Ficou decidido que **recuar e avançar são setas em
círculos**, sem palavra, e que o temporizador é o círculo do meio. As setas dispensam legenda por
serem universais; o temporizador não, e por isso traz o número por baixo do símbolo.

**Onde ficam.** A primeira tentativa foi espalhá-los pelos extremos — recuar à esquerda, avançar à
direita — a pensar que a distância era mais uma camada de proteção contra o toque errado. Foi
recusado, e com razão: menos intuitivo, e faz da barra uma faixa pesada de canto a canto. Ficaram
**juntos ao centro, com 48px entre eles**, que é o dobro do mínimo do design system e chega para o
dedo não escorregar de um para o outro. Agrupados, olha-se para um sítio só.

**O último passo troca de forma.** "Terminar" não pode ser mais um círculo verde no mesmo sítio, ou
ao fim de doze passos iguais o dedo faz aquilo em piloto automático. É uma pastilha com palavra.

E isto fechou a pergunta 2 por consequência: **a variante B deixou de ser possível**. Não cabe uma
linha de pré-visualização dentro de um botão redondo com uma seta. Fica a A, o cartão no canto.

Os símbolos passaram a SVG desenhado em vez de caracteres — o "▶" tem variante de emoji e em Android
há fontes que o desenham a cores. Num botão onde o símbolo é a única legenda, isso não podia ficar à
sorte da fonte do tablet.

### Ronda 3 — o passo ao centro, e a receita ganha cara

Partiu de um exemplo do modo cozinha do Claude e de duas preferências: o texto do passo mais ao
centro, a usar melhor o ecrã e a ler-se melhor; e a miniatura da receita em pequeno ao pé do nome, no
canto superior esquerdo.

A grelha de `1fr 320px` desapareceu. O corpo passou a uma coluna centrada — texto, temperatura e
duração, ingredientes — com o texto a 44px em vez de 32px e a medida travada em 30ch. As duas coisas
têm de andar juntas: sem limite de largura, uma linha de 1216px a 44px são umas cinquenta palavras e
o olho perde-se a voltar ao início.

Os ingredientes do passo saíram da coluna lateral e vieram para uma linha de pastilhas por baixo do
texto. **A decisão da ronda 1 de os ter à mão mantém-se — muda o sítio.** A coluna de 320px ficava
quase sempre meia vazia e roubava largura ao passo; nenhum passo do seed usa mais do que cinco
ingredientes, portanto uma linha que quebra chega.

A miniatura é um quadrado de 48px ao lado do nome. Num ecrã que só mostra um passo, é a única coisa
que diz qual é o prato — e reconhece-se uma fotografia mais depressa do que se lê um nome. Sem
imagem fica o 🍲, como no catálogo e no detalhe.

Ficou também corrigido um problema que já vinha da ronda 1 e que só apareceu ao medir: o cartão "A
seguir" passava a 8px das pastilhas no passo com mais ingredientes do seed. Cabia por sorte. O corpo
passa a reservar-lhe a faixa de baixo, mesmo no último passo onde o cartão não existe — 176px de
espaço vazio custam menos do que o texto saltar de sítio ao mudar de passo.

**O que ficou por decidir foi o título a negrito** que o exemplo tinha por cima do passo. É a
pergunta 8, e a proposta está lá em cima: título por passo, texto reescrito para o completar em vez
de o repetir, e passos agregados ao nível de tarefa.

### O que mudou por arrasto

O botão "Iniciar 8 min" que estava no corpo do ecrã desapareceu: passou a ser o botão do meio. A
duração continua visível no corpo, mas como etiqueta e não como alvo. E a faixa de temporizadores no
topo passou a mostrar só os temporizadores de **outros** passos — o do passo atual vive no botão do
meio, e ter o mesmo número em dois sítios é ruído.

### Ronda 4 — título por passo, e a granularidade a reboque

Fechada a pergunta 8, e aplicada por inteiro. Chegou lá por três correções seguidas, e as três valem
mais do que o resultado.

**A primeira foi minha e estava errada.** Li os títulos do exemplo como nomes de fase a cobrir vários
passos, e propus um campo `phase`. São 1 para 1 com os passos. A fase não era a saída.

**A segunda foi o Ricardo a apontar o que faltava:** o próprio texto do passo pode ser escrito para
completar o título em vez de o repetir. É isso que resolve a redundância, e não a estrutura.

**A terceira apanhou o que ainda estava mal.** O primeiro teste dessa escrita produziu "Juntar as
batatas e a água — Temperar com sal" seguido de "Cozer — Até a batata se desfazer com o garfo": dois
passos sem valor. O problema já não era a escrita, era a granularidade — aqueles dois são o mesmo
trabalho, e separá-los obriga a um toque no meio de uma coisa que não tem meio.

Daí a regra, com dois lados: **um passo é uma ação e a espera que lhe pertence.** O piso é o próprio
título — se ele diz tudo o que o texto diz, o passo junta-se ao vizinho. O tecto é o temporizador: um
por passo, portanto duas esperas seguidas nunca cabem no mesmo.

**O que ficou feito.** Os 55 passos do seed foram reagrupados e reescritos: são agora **38**. Nenhum
temporizador, temperatura ou ingrediente se perdeu no caminho — foi verificado ficheiro a ficheiro,
porque um refogado que perca o "5 min" não dá erro nenhum, só sai mal. O `title` entrou no schema como
opcional, mas **obrigatório numa receita revista**: um rascunho pode não o ter, e é isso que o
distingue. O modo cozinha ganhou os dois níveis, o detalhe passou a ler-se como índice, e o cartão "A
seguir" e os temporizadores passaram a dizer o título — "Cozer as batatas" diz qual é a panela que
está a apitar, "Passo 3" não dizia nada.

A regra foi para os nove sítios do inventário, e o principal é a **skill**: é ela que escreve as
receitas novas, e uma regra que ficasse só na spec não mudava nada do que se produz a partir de
amanhã. Ficou lá com o exemplo mau ao lado do bom, e com a instrução de perguntar quando a junção não
for óbvia em vez de decidir sozinha.

**O que se decidiu sem perguntar**, porque o Ricardo deu a decisão por fechada com as considerações
que eu tinha proposto: reescrever o seed todo agora em vez de só as receitas novas — dois formatos ao
mesmo tempo notam-se logo no ecrã de detalhe; o título é o nível grande e o detalhe o pequeno; e o
tecto de um temporizador por passo fica como está. Se alguma delas incomodar ao usar, muda-se.

**E fechou também a pergunta do "Para o béchamel".** Com a granularidade certa os quatro passos do
molho ficaram dois, e deixou de haver o que agrupar. A fase era um penso para um problema de
granularidade.

### Por onde continuar

Perguntas 4 a 7, que são todas sobre o que acontece quando há mais do que uma coisa ao lume: quantos
temporizadores em simultâneo são realistas, o que fazer quando um toca noutro passo, se vale a pena
riscar ingredientes já usados, e o que o ecrã faz no fim.

Uma nota para quando lá se chegar: a pergunta 4 ficou mais fácil de responder agora. Com os passos ao
nível de tarefa, os temporizadores dizem o nome da tarefa em vez do número do passo, e isso é metade
do que a pergunta pedia.

## Decisões tomadas

| Decisão | Onde ficou registada |
|---|---|
| Avança-se por botões na barra de baixo, nunca por zonas do ecrã | `docs/specs/005-modo-cozinha.md` |
| Terceiro botão ao meio para o temporizador, só quando o passo tem duração | `docs/specs/005-modo-cozinha.md` |
| Fora dos botões o ecrã é área morta — é essa a proteção contra toque acidental | `docs/specs/005-modo-cozinha.md` |
| O passo seguinte é um cartão pequeno no canto inferior direito | `docs/specs/005-modo-cozinha.md` |
| Recuar e avançar são setas em círculos, sem palavra | `docs/specs/005-modo-cozinha.md` |
| Os alvos ficam agrupados ao centro, com 48px entre eles, e não nos cantos | `docs/specs/005-modo-cozinha.md` |
| "Terminar" muda de forma — pastilha e não círculo | `docs/specs/005-modo-cozinha.md` |
| Símbolos em SVG desenhado, nunca em caracteres | `app/src/ui/icons.tsx` |
| O passo fica ao centro do ecrã, a 44px e com a medida travada em 30ch | `docs/specs/005-modo-cozinha.md` |
| Os ingredientes do passo vêm em linha por baixo do texto, não numa coluna lateral | `docs/specs/005-modo-cozinha.md` |
| O nome da receita leva a miniatura do prato ao lado, em 48px | `docs/specs/005-modo-cozinha.md` |
| O corpo reserva a faixa de baixo ao cartão "A seguir", mesmo no último passo | `docs/specs/005-modo-cozinha.md` |
| Cada passo tem título; o texto escreve-se para o completar, nunca para o repetir | `data/schema/recipe.schema.json`, `.claude/skills/importar-receita/SKILL.md` |
| Um passo é uma ação e a espera que lhe pertence — o título é o teste do piso, o temporizador é o tecto | `.claude/skills/importar-receita/SKILL.md`, `docs/ops/importar-receitas.md` |
| Numa receita revista o título é obrigatório; num rascunho não | `data/schema/recipe.schema.json` |
| O modo cozinha mostra título a 44px e detalhe a 28px | `docs/specs/005-modo-cozinha.md`, `docs/design/design-system.md` |
| O cartão "A seguir" e os temporizadores dizem o título do passo, não o número | `docs/specs/005-modo-cozinha.md` |
| O ecrã de detalhe mostra o título a negrito com o detalhe por baixo | `docs/specs/002-detalhe-receita.md` |

# Conversa 2 — Catálogo de receitas

**Estado:** Em curso — perguntas 1 e 4 respondidas. Faltam a 2, a 3, a 5 e a 6
**Conduz:** Claude — parto de propostas concretas para contrariares
**Destino das decisões:** `docs/specs/001-catalogo-receitas.md`, `docs/design/design-system.md`
**Depende de:** conversa 1 (metadata), porque o cartão só pode mostrar o que existe

## Porque existe

É o ecrã que responde a "o que é que eu posso cozinhar hoje?". A spec 001 já descreve grelha com
filtros, favoritos e histórico — mas nunca foi testada contra como as decisões acontecem mesmo.

## O que já está fechado

- Grelha, quatro cartões por linha a 1280×800
- Navegação vertical à esquerda, só ícones (do benchmark do Cookidoo)
- Cartão mostra thumbnail, nome, duração, dificuldade, até 3 labels, e antecedência quando existe
- Nada depende de hover; alvos de toque com 56px no mínimo

## As minhas perguntas de arranque

1. **Quantas receitas achas que isto terá daqui a seis meses?** Não é curiosidade — muda tudo. Com
   30, a grelha inteira cabe em dois ecrãs e os filtros quase não são precisos. Com 300, sem
   filtros e pesquisa não se encontra nada. Desenhar para o número errado dá um ecrã que não serve.

2. **Qual é a primeira coisa que te faz descartar uma receita?** Aposto que é o tempo — "hoje não
   tenho hora e meia". Se for isso, o tempo devia ser o filtro mais acessível de todos, não um de
   três iguais. Mas pode ser "não tenho os ingredientes", e aí é outro ecrã completamente diferente.

3. **Proponho uma ordenação por omissão que não está na spec: há mais tempo sem fazer.** A visão do
   produto diz que um dos problemas é "repetir sempre os mesmos pratos". Ordenar por alfabeto não
   ajuda nisso; pôr à frente o que não se faz há três meses, sim. Contra-argumento: pode ser
   desconcertante não encontrar as receitas sempre no mesmo sítio.

4. **Favoritos e histórico são mesmo duas coisas?** Na prática, o que fazes muitas vezes acaba por
   ser o que gostas. Se calhar são duas vistas do mesmo, e uma delas está a mais.

5. **Precisas de pesquisa por texto?** A spec deixou-a de fora de propósito. Se souberes o nome, já
   sabes o que queres cozinhar — e aí talvez o problema não seja encontrar, seja decidir.

6. **O que acontece quando os filtros não devolvem nada?** É o momento mais frustrante do ecrã, e
   também a maior oportunidade: "não há nada em 30 minutos, mas há isto em 40".

## Registo da conversa

### Ronda 1 — a escala, e favoritos contra histórico

**Pergunta 1 — quantas receitas.** *"Vou eventualmente ter muitas receitas, talvez uma centena ou
mais."*

Isto é o número que faltava, e desloca o ecrã de "grelha que se percorre" para "catálogo que se
interroga". Quatro consequências, e uma delas é um problema a sério.

**a) A minha pergunta 5 estava calibrada para o número errado.** Escrevi que a pesquisa por texto não
era precisa, porque "se souberes o nome, já sabes o que queres cozinhar". Esse argumento aguenta-se
com trinta receitas — com cento e cinquenta, lembras-te que existe um arroz de pato e não vais
percorrer vinte e cinco linhas de grelha para lá chegar. **Retiro a proposta: a pesquisa entra.**

O que não muda é a ordem de importância. Pesquisa e filtros fazem trabalhos diferentes: a pesquisa
resolve *ir buscar* uma receita que já tens na cabeça, os filtros resolvem *decidir* quando não tens.
A maior parte das vezes na cozinha é a segunda. Por isso a pesquisa entra, mas continua a não ser a
primeira coisa do ecrã — que era a crítica ao Cookidoo no benchmark, e essa mantém-se.

**b) A ordenação por omissão passa a decidir quase tudo (pergunta 3).** Com seis receitas a ordem é
indiferente, porque vês todas. Com cento e cinquenta, cabem oito cartões sem rolar e **na maior parte
das vezes o primeiro ecrã é o único ecrã**. O que lá estiver é o que vais cozinhar. Isso reforça a
proposta de ordenar por "há mais tempo sem fazer" em vez de por alfabeto — mas também aumenta o custo
do contra-argumento, porque as receitas deixam de estar sempre no mesmo sítio. Continua por decidir.

**c) O orçamento das imagens parte-se, e este é o problema a sério.** As contas com o que está no
repositório hoje:

| | Hoje (6) | 100 | 150 |
|---|---|---|---|
| JSON no bundle | 25 kB | ~358 kB | ~538 kB |
| Imagens | 650 kB | **~21 MB** | **~31 MB** |

O bundle não preocupa. As imagens sim: **21 MB é o que a app teria de descarregar e guardar em cache
para funcionar offline**, num tablet de 2 GB de memória. A regra atual — 300 kB por imagem em
`tools/buscar-imagens.ts`, e "~200 kB" no `media/README.md` — foi escrita quando havia três
fotografias e ninguém fez a multiplicação.

E as imagens que temos são **grandes de mais para o que se vê**: no catálogo, um cartão a 1280×800
dá uma miniatura de cerca de 282×211 pontos, que a 1,5× do Fire são 423×317 pixels reais. Uma JPEG de
640×480 chega e sobra, e pesa 50 a 60 kB em vez de 216. A 60 kB, cem receitas são **6 MB** em vez de
21 — e continua a dar para a fotografia maior do ecrã de detalhe.

**d) O que não muda.** Um ficheiro por receita continua certo — cem ficheiros não incomodam o Git nem
os diffs. A grelha de quatro por linha continua certa. E a pergunta 6, sobre filtros que não devolvem
nada, fica **mais** importante e não menos: com cem receitas e três filtros ainda se chega a zero.

---

**Pergunta 4 — favoritos e histórico.** *"Favoritos são marcados automaticamente, histórico são os
que foram marcados como concluídos e indo de datas, etc, não são a mesma coisa."*

A minha suspeita estava errada e a distinção é clara: **o favorito é um juízo, o histórico é um
facto.** "Gosto disto" não caduca; "fiz isto a 12 de agosto" é uma data que se acumula. Um pode
existir sem o outro — há receitas que adoras e nunca fizeste, e coisas que fazes todas as semanas por
hábito sem gostar particularmente delas.

Isto confirma o que já está construído: `favourites.json` e `history.json` são ficheiros separados,
com formas diferentes. **Não muda nada no código** — muda a spec 001, que os tratava como duas
subtabs equivalentes do mesmo sítio, e são coisas de naturezas diferentes.

**E responde de raspão à pergunta mais urgente que temos em aberto.** A Q5 — histórico automático ou
manual — é a pergunta 4 da conversa 5, e está a bloquear a spec 006. "Marcados como concluídos"
aponta para manual, e não para o plano da semana a virar histórico sozinho, que era a outra hipótese.

**A proposta que isso abre:** o modo cozinha já acaba num botão **"Terminar"**. Esse botão é o sinal
de conclusão mais honesto que a app pode ter — não é uma intenção como o plano, é alguém que chegou
ao último passo. Proponho que o histórico se escreva aí, mais um "já fiz isto" à mão no detalhe, para
as vezes em que cozinhaste sem o tablet. O plano nunca escreve histórico sozinho: planear não é
cozinhar, e uma semana em que se foi jantar fora não devia mentir no registo.

### Por onde continuar

Perguntas 2, 3, 5 e 6 — e as três que ficaram abaixo, que saíram desta ronda.

## Perguntas desta ronda, para a próxima resposta

1. **"Marcados como concluídos" é o "Terminar" do modo cozinha, ou um gesto à parte?** Se for o
   "Terminar", o histórico escreve-se sozinho para tudo o que cozinhas com o tablet e só precisas do
   gesto manual para o resto. É a hipótese que proponho, e fecha a Q5.

2. **As imagens: cortar o tamanho, ou cortar a quantidade?** Com cem receitas, ou baixamos o limite
   de 300 kB para uns 60 — o que obriga a redimensionar as três que já lá estão e a mudar a regra do
   importador — ou aceitamos que só algumas receitas têm fotografia. Inclino-me para cortar o
   tamanho: uma grelha com metade dos cartões sem imagem fica pior do que uma grelha com imagens mais
   comprimidas, e a 70 cm ninguém vê a diferença.

3. **"Favoritos são marcados automaticamente" — automaticamente por ti num toque, ou pela app a
   partir do que fazes mais vezes?** Estou a assumir o primeiro, que é o coração que já existe. Se
   for o segundo, o favorito passa a ser derivado do histórico e volta a ser a mesma coisa — e aí a
   minha pergunta original não estava assim tão errada.



_(por começar)_

## Decisões tomadas

| Decisão | Onde ficou registada |
|---|---|

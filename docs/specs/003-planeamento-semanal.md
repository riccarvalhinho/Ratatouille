# Spec 003 — Planeamento semanal

**Milestone:** M3
**Estado:** Primeira versão construída — ver "O que já existe"
**Depende de:** spec 002 (detalhe), ADR 0004 (escrita)

## Objetivo

Decidir a semana de refeições de uma vez, numa vista visual, em vez de decidir à última hora todos os
dias.

## Comportamento

### Vista

Semana inteira num ecrã, em forma de horário: os dias como colunas, os blocos do dia como linhas.
Nenhum scroll horizontal — a semana toda cabe na largura do tablet em horizontal. E, na prática,
também sem scroll vertical: as linhas repartem entre si a altura que sobra.

Blocos do dia: **almoço e jantar** (Q6, fechada). São as refeições que se decidem de véspera. O
pequeno-almoço e o lanche acrescentam-se se a necessidade aparecer — é uma linha no schema e outra
em `MEAL_BLOCKS`.

**Um bloco vazio na semana toda encolhe.** As linhas estão sempre lá — não se esconde um bloco só
porque está vazio — mas o espaço vertical vai para as que têm receitas.

### Navegação

Setas para semana anterior e seguinte, e uma ação para voltar à semana atual. O dia de hoje é
destacado visualmente.

Semanas passadas são navegáveis e mostram o que foi planeado — é assim que se alimenta o histórico.

### Receitas no plano

Cada receita planeada aparece como um cartão pequeno, com **thumbnail e nome**. Sem labels.

O cartão tem duas variantes, e o motivo é o espaço:

| Receita | Cartão |
|---|---|
| Com imagem | Thumbnail de 64px com o nome por baixo. 116px de altura |
| Sem imagem | Só o nome. 56px de altura |

Uma receita sem imagem não leva marcador cinzento: meia grelha cheia de emojis iguais lê-se pior do
que meia grelha só com nomes.

### Ações de um cartão

**Não há "x" permanente.** O primeiro toque no cartão troca-o por dois alvos, no mesmo sítio e por
cima dele: uma lupa que abre o detalhe e uma cruz que desplaneia. Um toque em qualquer outro sítio —
o fundo, outro cartão, um "+" — devolve o cartão ao normal.

Duas razões. Num cartão de ~122px de largura, um "x" permanente rouba a largura ao nome, que é a
única informação lá. E numa grelha de 14 células encostadas umas às outras, uma ação destrutiva a um
toque acerta-se por engano — assim desplanear custa dois toques, e o primeiro é o cartão inteiro,
muito maior do que os 36px que o "x" tinha.

**Este ecrã não é o modo cozinha.** Planeia-se sentado e com as mãos limpas, antes de haver comida
em cima da bancada. As regras de toque agressivo da spec 005 — alvos de 72px, ecrã morto à volta —
não se aplicam aqui: o que manda neste ecrã é a densidade, porque a semana toda tem de caber.

**As labels ficam de fora.** A 1280×800, tirando o painel de navegação, as margens e a coluna dos
nomes dos blocos, cada dia fica com ~140px de largura. Uma label legível a 70cm comeria a linha do
nome. As labels vêem-se no detalhe, a um toque.

Um bloco com mais de duas receitas faz scroll dentro da própria célula.

- Tocar num cartão revela as ações; a lupa abre o detalhe da receita (spec 002)
- A cruz desplaneia
- Um bloco aceita **várias receitas** — para uma sopa mais um prato mais uma sobremesa, ou para
  duplicar a mesma receita e dobrar a quantidade
- A mesma receita pode aparecer duas vezes no mesmo bloco

### Adicionar

Há dois caminhos, e são inversos um do outro. Nenhum substitui o outro porque não se está a fazer a
mesma coisa nos dois.

**Do bloco para a receita.** Tocar num bloco vazio, ou no "+" de um bloco com receitas, abre um
seletor de receitas com os mesmos filtros do catálogo (spec 001). Escolher uma adiciona-a ao bloco.
É o caminho de quem está a olhar para um buraco na semana e quer tapá-lo.

**Da receita para o bloco.** O "+" do cartão do catálogo (spec 001) e o "+" do detalhe (spec 002)
abrem a semana inteira e perguntam só "quando". É o caminho de quem anda a navegar as receitas sem
destino e reconhece uma: planear dali não devia obrigar a decorar o nome, vir ao planeamento, abrir o
seletor e procurá-la outra vez numa grelha mais curta e sem filtros.

## Critérios de aceitação

- [x] A semana toda cabe no ecrã do tablet sem scroll horizontal — nem vertical
- [x] Dá para navegar para semanas anteriores e seguintes, e voltar à atual
- [x] O dia de hoje está destacado — coluna com o fundo do acento e o cabeçalho sublinhado
- [x] Um bloco aceita várias receitas, incluindo a mesma repetida
- [x] Um cartão no plano mostra thumbnail e nome — sem labels, ver acima
- [x] Tocar num cartão revela as ações, e a lupa abre o detalhe
- [x] A cruz desplaneia, e não está sempre à vista
- [x] Adicionar a partir de um bloco abre o seletor de receitas
- [x] Adicionar a partir de uma receita — do cartão do catálogo ou do detalhe — abre a semana e
      pergunta só o dia e o bloco
- [ ] O seletor por bloco tem os filtros do catálogo — a triagem já existe na spec 001, falta ligá-la
      aqui dentro
- [x] Um bloco vazio na semana toda encolhe e dá o espaço aos outros
- [x] Cada semana persiste em `data/planning/<AAAA-Www>.json`
- [x] Planear offline funciona, e sincroniza quando houver rede
- [ ] A home screen reflete o plano da semana atual — a home é a spec 006

## O que já existe

Construído em `app/src/features/planeamento/`, com a lógica pura em `app/src/domain/plan-edit.ts`.

**A grelha, a navegação entre semanas e o destaque de hoje** estão feitos. **Planear e desplanear
também**, e é aqui que está a nuance que importa: a ADR 0004 descreve a escrita em duas metades, e
só a primeira existe.

| Metade | Estado |
|---|---|
| Gravar já em IndexedDB, para a interface responder no instante e o plano sobreviver a fechar a app | Feito |
| Mandar as alterações para o GitHub como commit, com uma outbox que faz retry | Feito no M2 |

A sobreposição local é por semana inteira e não por receita, que é o mesmo grão do ficheiro
`data/planning/AAAA-Www.json`. Faz da sincronização um PUT por semana e não uma fusão campo a campo,
e deixa a outbox juntar várias alterações à mesma semana num commit só.

Falta pôr o token nas Definições para a sincronização arrancar; sem ele a app avisa, no cabeçalho e
nas Definições, que o que se planeia fica só no tablet.

## O que falta

O seletor por bloco continua a ser a grelha do catálogo sem filtros nem pesquisa, dentro de um painel
mais curto. Com 233 receitas isso já é pouco — e é por isso que o caminho inverso existe: quem quer
filtrar, filtra na lista, que é onde a triagem vive, e planeia dali. Ligar a triagem também ao
seletor fica para quando o "do bloco para a receita" for mesmo o caminho escolhido com o tablet na
parede, e não uma suposição.

## Fora de âmbito

- Arrastar receitas entre blocos (avaliar depois; toque para mover pode ser mais fiável)
- Repetir uma semana inteira ou usar modelos de semana
- Sugestões automáticas do que planear

## Questões em aberto

- Q5 — o histórico é automático ou manual
- Q6 — que blocos do dia
- Q7 — duas pessoas a planear ao mesmo tempo

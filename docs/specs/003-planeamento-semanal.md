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

Blocos do dia: pequeno-almoço, almoço, lanche, jantar (questão Q6).

**Um bloco vazio na semana toda encolhe.** As quatro linhas estão sempre lá — não se esconde um
bloco só porque está vazio, ou nunca se planeava um pequeno-almoço — mas o espaço vertical vai para
as linhas que têm receitas. É o que faz a diferença entre um cartão legível e um cartão cortado.

### Navegação

Setas para semana anterior e seguinte, e uma ação para voltar à semana atual. O dia de hoje é
destacado visualmente.

Semanas passadas são navegáveis e mostram o que foi planeado — é assim que se alimenta o histórico.

### Receitas no plano

Cada receita planeada aparece como um cartão pequeno, **só com o nome**.

A thumbnail e as labels saíram daqui, e a razão é uma medida e não uma preferência: a 1280×800,
tirando o painel de navegação, as margens e a coluna dos nomes dos blocos, cada dia fica com ~140px
de largura e cada bloco com ~130px de altura. Nesse espaço, uma imagem de 56px deixava o nome a 14px
— abaixo do mínimo do design system, e ilegível a 70cm. Sem imagem, o nome fica a 16px, cabem duas
receitas por bloco sem cortar nenhuma, e continua a reconhecer-se o prato, que é para o que o cartão
serve aqui.

A imagem e as labels não desapareceram do produto: estão no catálogo, no detalhe e no seletor, onde
há largura para elas. Se as células crescerem — menos blocos, ou um tablet maior — isto revê-se.

Um bloco com mais de duas receitas faz scroll dentro da própria célula.

- Tocar num cartão abre o detalhe da receita (spec 002)
- Cada cartão tem um "x" que desplaneia com um toque
- Um bloco aceita **várias receitas** — para uma sopa mais um prato mais uma sobremesa, ou para
  duplicar a mesma receita e dobrar a quantidade
- A mesma receita pode aparecer duas vezes no mesmo bloco

### Adicionar

Tocar num bloco vazio, ou no "+" de um bloco com receitas, abre um seletor de receitas com os mesmos
filtros do catálogo (spec 001). Escolher uma adiciona-a ao bloco.

## Critérios de aceitação

- [x] A semana toda cabe no ecrã do tablet sem scroll horizontal — nem vertical
- [x] Dá para navegar para semanas anteriores e seguintes, e voltar à atual
- [x] O dia de hoje está destacado — coluna com o fundo do acento e o cabeçalho sublinhado
- [x] Um bloco aceita várias receitas, incluindo a mesma repetida
- [x] Um cartão no plano mostra o nome — sem thumbnail nem labels, ver acima
- [x] Tocar num cartão abre o detalhe
- [x] O "x" desplaneia com um toque
- [x] Adicionar abre o seletor de receitas
- [ ] O seletor tem os filtros do catálogo — dependem da spec 001, que também ainda não os tem
- [x] Um bloco vazio na semana toda encolhe e dá o espaço aos outros
- [ ] Cada semana persiste em `data/planning/<AAAA-Www>.json` — falta a escrita do M2
- [x] Planear offline funciona; **sincronizar quando houver rede é o M2**
- [ ] A home screen reflete o plano da semana atual — a home é a spec 006

## O que já existe

Construído em `app/src/features/planeamento/`, com a lógica pura em `app/src/domain/plan-edit.ts`.

**A grelha, a navegação entre semanas e o destaque de hoje** estão feitos. **Planear e desplanear
também**, e é aqui que está a nuance que importa: a ADR 0004 descreve a escrita em duas metades, e
só a primeira existe.

| Metade | Estado |
|---|---|
| Gravar já em IndexedDB, para a interface responder no instante e o plano sobreviver a fechar a app | Feito |
| Mandar as alterações para o GitHub como commit, com uma outbox que faz retry | M2 |

Ou seja: **o plano editado na cozinha vive só nesse tablet** até o M2 chegar. Isso está escrito no pé
do ecrã e não escondido — um plano que se julga guardado e não está é pior do que um plano que se
sabe local.

A sobreposição local é por semana inteira e não por receita, que é o mesmo grão do ficheiro
`data/planning/AAAA-Www.json`. Faz com que a sincronização do M2 seja um PUT por semana e não uma
fusão campo a campo.

## Fora de âmbito

- Arrastar receitas entre blocos (avaliar depois; toque para mover pode ser mais fiável)
- Repetir uma semana inteira ou usar modelos de semana
- Sugestões automáticas do que planear

## Questões em aberto

- Q5 — o histórico é automático ou manual
- Q6 — que blocos do dia
- Q7 — duas pessoas a planear ao mesmo tempo

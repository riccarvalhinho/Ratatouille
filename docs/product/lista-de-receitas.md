# Lista de receitas

O backlog do catálogo. **As 184 linhas estão feitas** — cada uma tem o seu ficheiro em
`data/recipes/`, validado, e o id na coluna da direita.

**Estado de uma linha:** `proposta` · `aceite` · `rejeitada` · `feita`

## O que fazer com esta lista agora

Deixou de ser um backlog e passou a ser um índice. Serve para duas coisas:

1. **Rejeitar depois do facto.** A lista foi escrita larga de propósito e gerou-se toda de uma vez,
   portanto é garantido que há aqui pratos que nunca ninguém vai cozinhar. Apagar uma receita é um
   `git rm` e uma linha marcada `rejeitada` — e um catálogo de 80 pratos que se cozinham vale mais
   do que um de 184 em que metade nunca sai da grelha.
2. **Acrescentar o que falta.** A secção do fim continua por encher, e é a que interessa.

## De onde vêm estes nomes

Duas entradas, que se juntam no mesmo ficheiro:

- **A proposta do Claude** — as secções abaixo. Não sai de nenhum dataset: não existe corpus livre
  de receitas em PT-PT que sirva, e como as instruções são sempre reescritas
  (`docs/ops/importar-receitas.md`), um dataset só pouparia a parte barata. São nomes de pratos, e
  é para isso que servem.
- **O repertório ditado** — a secção do fim, por encher. É a entrada com melhor taxa de acerto das
  duas, porque é a única que sabe o que se come mesmo à terça-feira.

## O que sai daqui

As receitas são geradas, com `source: { "kind": "gerada", "author": "Claude" }`. Nunca foram
cozinhadas por ninguém desta casa, e o campo existe para o catálogo não fingir o contrário — ver
`docs/product/metadata-receitas.md`.

**A coluna "despensa"** marca os pratos que obrigam a ingredientes que hoje não estão em
`data/taxonomies/ingredients.json` e que não são de supermercado de bairro (pasta de caril, miso,
tahini, molho de peixe). Não é motivo para rejeitar — é aviso de que o prato traz compras a reboque.

---

# Regras desta leva

Três regras que valem para **todas** as receitas geradas, não só para as desta lista. As três estão
escritas em `.claude/skills/importar-receita/SKILL.md`, que é o que garante que valem também para o
que se importar daqui a seis meses — uma regra que fique só aqui deixa de existir na leva seguinte.

## 1. Uma receita deve dar uma refeição — por omissão, não à força

O acompanhamento vem escolhido e escrito dentro da mesma receita: os ingredientes na mesma lista, os
passos entrelaçados com os do prato principal. O objetivo é **não ter de planear prato +
acompanhamento em todas as refeições da semana**. Como a maior parte dos pratos "de prateleira" já
vem com um acompanhamento óbvio, na maior parte dos casos isto sai de graça — e é por isso que a
coluna `Com` das tabelas abaixo está quase toda preenchida.

**Mas não se força, e algumas receitas ficam legitimamente sem.** Três casos:

1. **O prato já é a refeição** — uma massa, um arroz malandro, um caril que já traz o arroz. É o
   que está marcado como `Prato único`.
2. **A receita foi ditada por alguém** — família ou receita própria. Escreve-se como foi dada.
   **As costelas no forno são exatamente isto**: são costelas, o que se come com elas muda conforme
   o dia, e inventar um acompanhamento seria pôr palavras na boca de quem a deu.
3. **O prato come-se com muita coisa e nenhuma é mais canónica** do que as outras.

**Um acompanhamento a mais é pior do que nenhum:** vai para a lista de compras na mesma, e compra-se
comida que ninguém vai cozinhar. Na dúvida, deixa-se — o planeamento já aceita mais do que uma
receita por bloco, portanto pôr uma salada ao lado de um prato incompleto custa um toque e já
funciona hoje.

O entrelaçar é a parte que interessa e a mais fácil de fazer mal. Os passos do acompanhamento
**não vão todos para o fim** — vão para onde pertencem no tempo real da cozinha: o arroz começa
antes do peixe porque demora mais, e o passo diz isso. Uma receita que faça o prato todo e só depois
se lembre do arroz está errada mesmo que os ingredientes estejam lá.

O schema já aguentava isto sem mudar nada: `ingredients` é lista única de propósito, e a descrição
do campo já dizia que "as sub-preparações são partes da preparação total do prato".

**O que isto custa, dito à frente:** nas receitas que levam acompanhamento, os tempos sobem e os
passos aumentam, porque passam a descrever mais trabalho — o que antes era invisível não
desapareceu, estava só noutro ficheiro. E o mesmo arroz de tomate vai aparecer dentro de várias
receitas e também sozinho na secção dos acompanhamentos. Isso é redundância aceite: o valor está em
abrir uma receita e ter a refeição inteira, não em não repetir texto.

## 2. Nada leva banha de porco

Onde a receita tradicional pede banha, usa-se **azeite, manteiga ou óleo**, conforme o que o prato
pede. O prato mantém-se; muda a gordura. Os candidatos onde isto se nota estão marcados com
`sem banha` na coluna de notas — rojões, migas e filhoses são os três em que a banha é mesmo a
versão canónica, e nesses a substituição é uma decisão, não um descuido.

`banha` não existe em `data/taxonomies/ingredients.json` e **não vai ser acrescentada**. É o que
torna a regra verificável em vez de ser boa intenção: sem entrada na taxonomia, nenhuma receita a
consegue referenciar sem falhar a validação.

## 3. Nada leva fígado nem farinheira

Ao contrário da banha, aqui não há substituição — o prato sai da lista. Saíram por isto:

- **Iscas com elas** — o prato é fígado
- **Ovos mexidos com farinheira** — o prato é a farinheira

Saiu também o **cozido à portuguesa**, e esse foi decidido e não deduzido: tinha ficado na lista
por não ser *definido* pela farinheira — leva chouriço, morcela, carnes e legumes, e há cozidos sem
ela — mas a chamada foi de quem come, não de quem escreve. Um cozido sem farinheira não é o cozido
que se quer à mesa, e um prato que se faz a fingir não vale uma entrada no catálogo.

---

# Pratos principais — dia a dia

O núcleo, e a primeira coisa a ser gerada: é o que responde a "o que é que se janta hoje", e
portanto o que faz o planeamento semanal e a lista de compras valerem alguma coisa.

A coluna `Com` diz o acompanhamento com que a receita vai ser escrita. É uma proposta como qualquer
outra da lista: se não servir, corrige-se na triagem — e **riscar a coluna também é resposta**, para
os pratos que se preferem sozinhos.

## Portugueses

| Prato | Com | Notas | Estado | id |
|---|---|---|---|---|
| Bitoque | Batata frita e arroz branco, ovo a cavalo |  | feita | `bitoque` |
| Bifanas | No pão, com batata frita |  | feita | `bifanas` |
| Bife à portuguesa | Batata frita e salada de alface |  | feita | `bife-a-portuguesa` |
| Carne de porco à alentejana | Batata aos cubos, no mesmo tacho |  | feita | `carne-de-porco-a-alentejana` |
| Rojões | Batata assada e grelos salteados | sem banha | feita | `rojoes` |
| Costeletas de porco grelhadas | Arroz de tomate e salada |  | feita | `costeletas-de-porco-grelhadas` |
| Perna de porco assada no forno | Batata assada e puré de maçã |  | feita | `perna-de-porco-assada` |
| Almôndegas com esparguete | Esparguete e queijo ralado |  | feita | `almondegas-com-esparguete` |
| Empadão de carne | Salada de alface e tomate ao lado |  | feita | `empadao-de-carne` |
| Jardineira | Prato único, com arroz branco |  | feita | `jardineira` |
| Salsichas frescas com puré | Puré de batata e cebola caramelizada |  | feita | `salsichas-frescas-com-pure` |
| Frango assado com piri-piri | Batata assada e arroz |  | feita | `frango-assado-com-piri-piri` |
| Frango na púcara | Arroz branco e batata palha |  | feita | `frango-na-pucara` |
| Frango de churrasco | Batata frita e salada de tomate |  | feita | `frango-de-churrasco` |
| Arroz de frango | Prato único, com salada |  | feita | `arroz-de-frango` |
| Arroz de cabidela | Prato único |  | feita | `arroz-de-cabidela` |
| Bifes de peru grelhados | Salada de tomate e batata a murro |  | feita | `bifes-de-peru-grelhados` |
| Coelho guisado | Batata cozida e arroz branco |  | feita | `coelho-guisado` |
| Bacalhau à Brás | Azeitonas e salada de alface |  | feita | `bacalhau-a-bras` |
| Bacalhau com natas | Prato único, com salada |  | feita | `bacalhau-com-natas` |
| Bacalhau à Gomes de Sá | Prato único |  | feita | `bacalhau-a-gomes-de-sa` |
| Bacalhau com broa | Batata a murro e grelos |  | feita | `bacalhau-com-broa` |
| Bacalhau à lagareiro | Batata a murro e brócolos |  | feita | `bacalhau-a-lagareiro` |
| Pataniscas de bacalhau | Arroz de feijão |  | feita | `pataniscas-de-bacalhau` |
| Filetes de pescada | Arroz de tomate |  | feita | `filetes-de-pescada` |
| Massada de peixe | Prato único |  | feita | `massada-de-peixe` |
| Caldeirada de peixe | Prato único, com pão |  | feita | `caldeirada-de-peixe` |
| Carapaus grelhados | Batata cozida e molho de vinagrete |  | feita | `carapaus-grelhados` |
| Sardinhas assadas | Pimento assado, batata cozida e pão |  | feita | `sardinhas-assadas` |
| Dourada no forno | Batata e cebola no mesmo tabuleiro |  | feita | `dourada-no-forno` |
| Salmão no forno com legumes | Tabuleiro único, com batata |  | feita | `salmao-no-forno-com-legumes` |
| Lulas grelhadas | Arroz de manteiga e molho verde |  | feita | `lulas-grelhadas` |
| Choco frito à setubalense | Batata frita e limão |  | feita | `choco-frito-a-setubalense` |
| Açorda de camarão | Prato único |  | feita | `acorda-de-camarao` |
| Migas à alentejana | Com entremeada, prato único | sem banha | feita | `migas-a-alentejana` |
| Favas com chouriço | Prato único, com pão |  | feita | `favas-com-chourico` |
| Feijoada à transmontana | Arroz branco |  | feita | `feijoada-a-transmontana` |
| Omelete de legumes | Salada e pão |  | feita | `omelete-de-legumes` |

## Internacionais

| Prato | Com | Notas | Estado | id |
|---|---|---|---|---|
| Esparguete à carbonara | Prato único |  | feita | `esparguete-a-carbonara` |
| Esparguete aglio e olio | Prato único, com salada verde |  | feita | `esparguete-aglio-e-olio` |
| Massa com pesto | Prato único, com tomate cereja |  | feita | `massa-com-pesto` |
| Massa à bolonhesa | Prato único, com queijo ralado |  | feita | `massa-a-bolonhesa` |
| Massa ao forno com atum | Salada ao lado |  | feita | `massa-ao-forno-com-atum` |
| Lasanha de carne | Salada verde |  | feita | `lasanha-de-carne` |
| Bolonhesa de lentilhas | Massa e salada |  | feita | `bolonhesa-de-lentilhas` |
| Penne all'arrabbiata | Prato único |  | feita | `penne-allarrabbiata` |
| Risotto de cogumelos | Prato único |  | feita | `risotto-de-cogumelos` |
| Risotto de camarão | Prato único |  | feita | `risotto-de-camarao` |
| Pizza caseira | Salada verde |  | feita | `pizza-caseira` |
| Frango à caçadora | Polenta ou puré |  | feita | `frango-a-cacadora` |
| Frango com limão e alcaparras | Arroz e espargos |  | feita | `frango-com-limao-e-alcaparras` |
| Escalopes de peru panados | Batata frita no forno e salada |  | feita | `escalopes-de-peru-panados` |
| Cordon bleu | Puré e feijão-verde |  | feita | `cordon-bleu` |
| Hambúrguer caseiro | Batata frita no forno e coleslaw |  | feita | `hamburguer-caseiro` |
| Bife Stroganoff | Arroz branco e batata palha |  | feita | `bife-stroganoff` |
| Goulash | Puré de batata ou massa curta |  | feita | `goulash` |
| Chili con carne | Arroz branco e natas azedas |  | feita | `chili-con-carne` |
| Tacos de carne picada | Tortilhas e acompanhamentos à mesa | sim | feita | `tacos-de-carne-picada` |
| Fajitas de frango | Tortilhas, arroz e feijão | sim | feita | `fajitas-de-frango` |
| Moussaka | Salada grega |  | feita | `moussaka` |
| Paella | Prato único, com limão |  | feita | `paella` |
| Tortilha de batata | Salada de tomate e pão |  | feita | `tortilha-de-batata` |
| Quiche Lorraine | Salada verde |  | feita | `quiche-lorraine` |
| Tarte de alho-francês | Salada verde |  | feita | `tarte-de-alho-frances` |
| Gratinado de batata | Com salada, ou ao lado de carne grelhada |  | feita | `gratinado-de-batata` |
| Shakshuka | Pão para molhar |  | feita | `shakshuka` |
| Falafel com pita | Pita, salada e molho de iogurte | sim | feita | `falafel-com-pita` |
| Cuscuz com legumes | Prato único |  | feita | `cuscuz-com-legumes` |
| Gyros de frango | Pita, batata frita e tzatziki |  | feita | `gyros-de-frango` |
| Caril de frango | Arroz basmati e iogurte | sim | feita | `caril-de-frango` |
| Frango tikka masala | Arroz basmati e naan | sim | feita | `frango-tikka-masala` |
| Butter chicken | Arroz basmati e naan | sim | feita | `butter-chicken` |
| Caril de grão e espinafres | Arroz e iogurte | sim | feita | `caril-de-grao-e-espinafres` |
| Dahl de lentilhas vermelhas | Arroz e coentros | sim | feita | `dahl-de-lentilhas-vermelhas` |
| Salteado de frango e legumes | Arroz ou noodles | sim | feita | `salteado-de-frango-e-legumes` |
| Frango teriyaki | Arroz e brócolos no vapor | sim | feita | `frango-teriyaki` |
| Salmão teriyaki | Arroz e edamame | sim | feita | `salmao-teriyaki` |
| Noodles com legumes e tofu | Prato único | sim | feita | `noodles-com-legumes-e-tofu` |
| Arroz chau-chau | Prato único | sim | feita | `arroz-chau-chau` |
| Yakisoba | Prato único | sim | feita | `yakisoba` |
| Pad thai | Prato único, com amendoim e lima | sim | feita | `pad-thai` |
| Peixe em leite de coco | Arroz jasmim | sim | feita | `peixe-em-leite-de-coco` |
| Salada César com frango | Prato único, com croutons |  | feita | `salada-cesar-com-frango` |
| Poke bowl de salmão | Prato único | sim | feita | `poke-bowl-de-salmao` |
| Wraps de frango | Salada ao lado |  | feita | `wraps-de-frango` |
| Ratatouille | Arroz ou pão, ou ao lado de carne |  | feita | `ratatouille` |

---

# Pratos principais — fim de semana

Mais longos ou mais cerimoniosos. Não são o alvo da primeira leva, mas entram na lista porque são
metade da razão de ter um catálogo.

| Prato | Com | Notas | Estado | id |
|---|---|---|---|---|
| Arroz de pato | Prato único, com salada de agrião |  | feita | `arroz-de-pato` |
| Arroz de marisco | Prato único |  | feita | `arroz-de-marisco` |
| Arroz de tamboril | Prato único |  | feita | `arroz-de-tamboril` |
| Polvo à lagareiro | Batata a murro e grelos |  | feita | `polvo-a-lagareiro` |
| Leitão no forno | Batata assada e laranja |  | feita | `leitao-no-forno` |
| Cabrito assado | Batata assada e arroz de forno |  | feita | `cabrito-assado` |
| Bacalhau assado com todos | Couve, batata, ovo e cenoura |  | feita | `bacalhau-assado-com-todos` |
| Feijoada de marisco | Arroz branco |  | feita | `feijoada-de-marisco` |
| Rancho à moda da Beira | Prato único |  | feita | `rancho-a-moda-da-beira` |
| Bacalhau à Zé do Pipo | Prato único, com salada |  | feita | `bacalhau-a-ze-do-pipo` |
| Peito de vitela recheado | Batata assada e legumes |  | feita | `peito-de-vitela-recheado` |
| Naco na pedra | Batata frita, arroz e molhos |  | feita | `naco-na-pedra` |
| Francesinha | Batata frita |  | feita | `francesinha` |
| Bœuf bourguignon | Puré de batata |  | feita | `boeuf-bourguignon` |
| Ossobuco à milanesa | Risotto à milanesa |  | feita | `ossobuco-a-milanesa` |
| Costela assada lenta | Batata assada e coleslaw |  | feita | `costela-assada-lenta` |
| Pernil de borrego no forno | Batata e legumes do mesmo tabuleiro |  | feita | `pernil-de-borrego-no-forno` |
| Pato à pequinesa simplificado | Panquecas, pepino e cebolinho | sim | feita | `pato-a-pequinesa-simplificado` |
| Biryani de frango | Prato único, com raita | sim | feita | `biryani-de-frango` |
| Rendang de vaca | Arroz jasmim | sim | feita | `rendang-de-vaca` |
| Tajine de frango com limão | Cuscuz | sim | feita | `tajine-de-frango-com-limao` |
| Lasanha de legumes assados | Salada verde |  | feita | `lasanha-de-legumes-assados` |
| Wellington de vaca | Puré e legumes glaceados |  | feita | `wellington-de-vaca` |

---

# Sopas

**25 sopas, 11 delas internacionais.** Entram nesta leva e não ficam para depois: a sopa é o que se
come mais vezes por semana em casa portuguesa, e com nove sopas o filtro de tipo de prato não tem
nada para filtrar.

As sopas são a exceção natural à regra do prato completo — uma sopa é a refeição toda, ou é
entrada de outra coisa. Onde pede pão ou um acompanhamento, está dito.

## Portuguesas — 14

| Prato | O que é | Notas | Estado | id |
|---|---|---|---|---|
| Caldo verde | Couve galega, batata e chouriço |  | feita | `caldo-verde` |
| Sopa de legumes | A sopa de todos os dias |  | feita | `sopa-de-legumes` |
| Sopa de tomate alentejana | Tomate, pão e ovo escalfado |  | feita | `sopa-de-tomate-alentejana` |
| Creme de abóbora | Creme suave, com sementes torradas |  | feita | `creme-de-abobora` |
| Creme de cenoura | Creme de tacho, com coentros |  | feita | `creme-de-cenoura` |
| Creme de cogumelos | Creme com natas e pão torrado |  | feita | `creme-de-cogumelos` |
| Sopa de peixe | Caldo de peixe passado, com massinhas |  | feita | `sopa-de-peixe` |
| Canja de galinha | Galinha, massa e limão |  | feita | `canja-de-galinha` |
| Sopa da pedra | Feijão, enchidos e legumes |  | feita | `sopa-da-pedra` |
| Sopa de feijão com hortaliça | Feijão encarnado e couve |  | feita | `sopa-de-feijao-com-hortalica` |
| Sopa de grão com espinafres | Grão, espinafres e ovo |  | feita | `sopa-de-grao-com-espinafres` |
| Sopa de agrião | Agrião, batata e um fio de azeite |  | feita | `sopa-de-agriao` |
| Gaspacho alentejano | Sopa fria de tomate, pepino e pão |  | feita | `gaspacho-alentejano` |
| Açorda alentejana | Pão, alho, coentros e ovo escalfado |  | feita | `acorda-alentejana` |

## Internacionais — 11

| Prato | O que é | Notas | Estado | id |
|---|---|---|---|---|
| Minestrone | Sopa italiana de legumes e massa |  | feita | `minestrone` |
| Sopa de cebola gratinada | Francesa, com pão e queijo no forno |  | feita | `sopa-de-cebola-gratinada` |
| Vichyssoise | Creme frio de alho-francês e batata |  | feita | `vichyssoise` |
| Sopa de ervilhas com hortelã | Inglesa, verde e rápida |  | feita | `sopa-de-ervilhas-com-hortela` |
| Borscht | Sopa de beterraba com natas azedas |  | feita | `borscht` |
| Sopa de lentilhas à turca | Lentilha vermelha, cominhos e limão |  | feita | `sopa-de-lentilhas-a-turca` |
| Harira | Sopa marroquina de grão, lentilha e tomate | sim | feita | `harira` |
| Sopa de tortilha mexicana | Caldo de tomate com tiras de tortilha | sim | feita | `sopa-de-tortilha-mexicana` |
| Sopa de miso | Caldo dashi com tofu e alga | sim | feita | `sopa-de-miso` |
| Tom kha gai | Sopa tailandesa de coco, frango e galanga | sim | feita | `tom-kha-gai` |
| Sopa de abóbora com coco e caril | Creme com leite de coco | sim | feita | `sopa-de-abobora-com-coco-e-caril` |

---

# Sobremesas saudáveis

Um pack à parte das sobremesas de pastelaria, e a pedido. A maior parte não tem confeção nenhuma
(`methods: ["sem-confecao"]`), o que as torna as receitas mais baratas de gerar da lista toda — e
as únicas que se fazem enquanto o jantar está no forno.

| Prato | O que é | Notas | Estado | id |
|---|---|---|---|---|
| Granizado de melancia | Melancia congelada e raspada, com lima |  | feita | `granizado-de-melancia` |
| Granizado de limão | Gelo raspado com sumo de limão e hortelã |  | feita | `granizado-de-limao` |
| Granizado de café | Sem açúcar adicionado |  | feita | `granizado-de-cafe` |
| Gelado de banana | Banana congelada batida, sem natas |  | feita | `gelado-de-banana` |
| Gelatina de fruta natural | Gelatina feita com sumo de fruta e pedaços |  | feita | `gelatina-de-fruta-natural` |
| Salada de fruta | Fruta da época, sumo de laranja e hortelã |  | feita | `salada-de-fruta` |
| Espetadas de fruta | Fruta em espetada, com chocolate preto |  | feita | `espetadas-de-fruta` |
| Maçã assada com canela | Forno, sem açúcar adicionado |  | feita | `maca-assada-com-canela` |
| Ananás grelhado | Grelhador, com canela e lima |  | feita | `ananas-grelhado` |
| Iogurte com fruta e granola | Camadas, de taça |  | feita | `iogurte-com-fruta-e-granola` |
| Pudim de chia com fruta | De véspera, no frigorífico | sim | feita | `pudim-de-chia-com-fruta` |
| Mousse de iogurte e frutos vermelhos | Batida, sem forno |  | feita | `mousse-de-iogurte-e-frutos-vermelhos` |

---

# Depois dos principais

Fora da primeira leva — entram quando os principais e as sopas estiverem no sítio.

## Saladas e acompanhamentos

**Nota de âmbito, depois da regra do prato completo:** estas deixaram de ser necessárias para
completar uma refeição, porque agora cada receita já traz o seu acompanhamento escrito. O que
sobra é um uso mais estreito e ainda assim real — a salada que se faz à parte para acompanhar o
que já está feito, o puré que se quer sozinho. Por isso a secção encolheu e ficou para o fim, em
vez de desaparecer.

| Prato | O que é | Notas | Estado | id |
|---|---|---|---|---|
| Salada de grão com atum | Salada fria de despensa |  | feita | `salada-de-grao-com-atum` |
| Salada de polvo | Polvo cozido com cebola e coentros |  | feita | `salada-de-polvo` |
| Salada de tomate e cebola | Acompanhamento de grelhados |  | feita | `salada-de-tomate-e-cebola` |
| Salada de feijão frade com ovo | Clássico de verão |  | feita | `salada-de-feijao-frade-com-ovo` |
| Salada grega | Tomate, pepino, feta e azeitona |  | feita | `salada-grega` |
| Tabule | Salada de bulgur e salsa | sim | feita | `tabule` |
| Coleslaw | Couve e cenoura em molho cremoso |  | feita | `coleslaw` |
| Arroz de tomate | Acompanhamento malandro |  | feita | `arroz-de-tomate` |
| Arroz de feijão | Acompanhamento de pataniscas |  | feita | `arroz-de-feijao` |
| Batata a murro | Batata assada esmagada com alho e azeite |  | feita | `batata-a-murro` |
| Batata frita no forno | Alternativa à fritadeira |  | feita | `batata-frita-no-forno` |
| Puré de batata | O puré de referência |  | feita | `pure-de-batata` |
| Legumes assados no tabuleiro | Acompanhamento de tudo |  | feita | `legumes-assados-no-tabuleiro` |
| Esparregado | Espinafres cremosos |  | feita | `esparregado` |
| Grelos salteados com alho | Acompanhamento rápido |  | feita | `grelos-salteados-com-alho` |
| Peixinhos da horta | Feijão-verde em polme, frito |  | feita | `peixinhos-da-horta` |

## Sobremesas, bolos e pequeno-almoço

Vale a pena por uma razão técnica além da gulodice: são os únicos pratos que exercitam `yield` em
vez de `servings`, o equipamento de pastelaria e o `prepAhead` de levedar e arrefecer.

| Prato | O que é | Notas | Estado | id |
|---|---|---|---|---|
| Arroz doce | Canela por cima, à portuguesa |  | feita | `arroz-doce` |
| Leite-creme | Queimado com açúcar |  | feita | `leite-creme` |
| Pudim flan | Pudim de ovos e caramelo |  | feita | `pudim-flan` |
| Mousse de chocolate | Clássico de fim de almoço |  | feita | `mousse-de-chocolate` |
| Bolo de bolacha | Bolacha Maria e creme de manteiga |  | feita | `bolo-de-bolacha` |
| Baba de camelo | Doce de ovos e leite condensado |  | feita | `baba-de-camelo` |
| Salame de chocolate | Sem forno |  | feita | `salame-de-chocolate` |
| Pastéis de nata | Massa folhada e creme |  | feita | `pasteis-de-nata` |
| Bolo de laranja | Bolo de tabuleiro simples |  | feita | `bolo-de-laranja` |
| Bolo de iogurte | O primeiro bolo de qualquer casa |  | feita | `bolo-de-iogurte` |
| Bolo de cenoura com cobertura | Versão portuguesa, cobertura de chocolate |  | feita | `bolo-de-cenoura-com-cobertura` |
| Torta de laranja | Enrolada, sem farinha |  | feita | `torta-de-laranja` |
| Tarte de maçã | Massa quebrada e maçã laminada |  | feita | `tarte-de-maca` |
| Queijadas | Pequenas, de forma de queques |  | feita | `queijadas` |
| Brownies | Denso, de tabuleiro |  | feita | `brownies` |
| Panquecas | Pequeno-almoço de fim de semana |  | feita | `panquecas` |
| Papas de aveia | Pequeno-almoço de semana |  | feita | `papas-de-aveia` |
| Pão caseiro | Massa levedada, forno de casa |  | feita | `pao-caseiro` |
| Broa de milho | Pão de milho |  | feita | `broa-de-milho` |
| Pão recheado com chouriço e queijo | Para levar ou para lanche |  | feita | `pao-recheado-com-chourico-e-queijo` |
| Bolo-rei | Natal, com o seu tempo de levedar |  | feita | `bolo-rei` |
| Filhoses | Fritas, de época | sem banha | feita | `filhoses` |

---

# O teu repertório

**Por encher.** Manda por áudio ou escreve; eu passo para aqui.

O que vale a pena dizer, por ordem de utilidade:

1. **O que se cozinha sem pensar.** Os jantares de terça-feira, o que se faz quando ninguém tem
   vontade. São os que mais faltam numa lista escrita de fora, e os que mais se vão usar.
2. **O que a família faz.** Como as costelas dos sogros. Estes não se geram — ditam-se, e entram
   como `kind: "familia"`, que é outra coisa e vale mais.
3. **O que se come fora e apetecia fazer em casa.** O restaurante do costume, o prato que se pede
   sempre.
4. **O que se cozinhava e se deixou de cozinhar.** Muitas vezes só se perdeu porque ninguém se
   lembrava dele à hora de decidir — que é exatamente o problema que esta app existe para resolver.

E, para cada um, **com que acompanhamento se come** — porque agora isso faz parte da receita.

| Prato | Com | Quem faz | Estado | id |
|---|---|---|---|---|
| | | | | |

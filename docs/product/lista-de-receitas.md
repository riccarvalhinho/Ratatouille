# Lista de receitas

O backlog do catálogo. Cada linha é um prato candidato; nenhum vira ficheiro sem passar por triagem.

**Estado de uma linha:** `proposta` · `aceite` · `rejeitada` · `feita`

Uma linha só passa a `feita` quando existe `data/recipes/<id>.json` validado. O id fica na coluna
da direita — é a ligação entre esta lista e o catálogo.

## Como se tria

Passar a lista e marcar. Rejeitar é o gesto normal, não a exceção: a lista foi escrita larga de
propósito, para servir de puxa-memória. **Um catálogo de 80 pratos que se cozinham vale mais do que
um de 180 em que metade nunca sai da grelha.**

Duas perguntas por linha, e nenhuma é sobre a receita ser boa:

1. Isto já se cozinhou cá em casa, ou apetecia cozinhar?
2. Os ingredientes compram-se no supermercado do costume?

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
| Bitoque | Batata frita e arroz branco, ovo a cavalo | | proposta | |
| Bifanas | No pão, com batata frita | | proposta | |
| Bife à portuguesa | Batata frita e salada de alface | | proposta | |
| Carne de porco à alentejana | Batata aos cubos, no mesmo tacho | | proposta | |
| Rojões | Batata assada e grelos salteados | sem banha | proposta | |
| Costeletas de porco grelhadas | Arroz de tomate e salada | | proposta | |
| Perna de porco assada no forno | Batata assada e puré de maçã | | proposta | |
| Almôndegas com esparguete | Esparguete e queijo ralado | | proposta | |
| Empadão de carne | Salada de alface e tomate ao lado | | proposta | |
| Jardineira | Prato único, com arroz branco | | proposta | |
| Salsichas frescas com puré | Puré de batata e cebola caramelizada | | proposta | |
| Frango assado com piri-piri | Batata assada e arroz | | proposta | |
| Frango na púcara | Arroz branco e batata palha | | proposta | |
| Frango de churrasco | Batata frita e salada de tomate | | proposta | |
| Arroz de frango | Prato único, com salada | | proposta | |
| Arroz de cabidela | Prato único | | proposta | |
| Bifes de peru grelhados | Salada de tomate e batata a murro | | proposta | |
| Coelho guisado | Batata cozida e arroz branco | | proposta | |
| Bacalhau à Brás | Azeitonas e salada de alface | | proposta | |
| Bacalhau com natas | Prato único, com salada | | proposta | |
| Bacalhau à Gomes de Sá | Prato único | | proposta | |
| Bacalhau com broa | Batata a murro e grelos | | proposta | |
| Bacalhau à lagareiro | Batata a murro e brócolos | | proposta | |
| Pataniscas de bacalhau | Arroz de feijão | | proposta | |
| Filetes de pescada | Arroz de tomate | | proposta | |
| Massada de peixe | Prato único | | proposta | |
| Caldeirada de peixe | Prato único, com pão | | proposta | |
| Carapaus grelhados | Batata cozida e molho de vinagrete | | proposta | |
| Sardinhas assadas | Pimento assado, batata cozida e pão | | proposta | |
| Dourada no forno | Batata e cebola no mesmo tabuleiro | | proposta | |
| Salmão no forno com legumes | Tabuleiro único, com batata | | proposta | |
| Lulas grelhadas | Arroz de manteiga e molho verde | | proposta | |
| Choco frito à setubalense | Batata frita e limão | | proposta | |
| Açorda de camarão | Prato único | | proposta | |
| Migas à alentejana | Com entremeada, prato único | sem banha | proposta | |
| Favas com chouriço | Prato único, com pão | | proposta | |
| Feijoada à transmontana | Arroz branco | | proposta | |
| Omelete de legumes | Salada e pão | | proposta | |

## Internacionais

| Prato | Com | Notas | Estado | id |
|---|---|---|---|---|
| Esparguete à carbonara | Prato único | | proposta | |
| Esparguete aglio e olio | Prato único, com salada verde | | proposta | |
| Massa com pesto | Prato único, com tomate cereja | | proposta | |
| Massa à bolonhesa | Prato único, com queijo ralado | | proposta | |
| Massa ao forno com atum | Salada ao lado | | proposta | |
| Lasanha de carne | Salada verde | | proposta | |
| Bolonhesa de lentilhas | Massa e salada | | proposta | |
| Penne all'arrabbiata | Prato único | | proposta | |
| Risotto de cogumelos | Prato único | | proposta | |
| Risotto de camarão | Prato único | | proposta | |
| Pizza caseira | Salada verde | | proposta | |
| Frango à caçadora | Polenta ou puré | | proposta | |
| Frango com limão e alcaparras | Arroz e espargos | | proposta | |
| Escalopes de peru panados | Batata frita no forno e salada | | proposta | |
| Cordon bleu | Puré e feijão-verde | | proposta | |
| Hambúrguer caseiro | Batata frita no forno e coleslaw | | proposta | |
| Bife Stroganoff | Arroz branco e batata palha | | proposta | |
| Goulash | Puré de batata ou massa curta | | proposta | |
| Chili con carne | Arroz branco e natas azedas | | proposta | |
| Tacos de carne picada | Tortilhas e acompanhamentos à mesa | sim | proposta | |
| Fajitas de frango | Tortilhas, arroz e feijão | sim | proposta | |
| Moussaka | Salada grega | | proposta | |
| Paella | Prato único, com limão | | proposta | |
| Tortilha de batata | Salada de tomate e pão | | proposta | |
| Quiche Lorraine | Salada verde | | proposta | |
| Tarte de alho-francês | Salada verde | | proposta | |
| Gratinado de batata | Com salada, ou ao lado de carne grelhada | | proposta | |
| Shakshuka | Pão para molhar | | proposta | |
| Falafel com pita | Pita, salada e molho de iogurte | sim | proposta | |
| Cuscuz com legumes | Prato único | | proposta | |
| Gyros de frango | Pita, batata frita e tzatziki | | proposta | |
| Caril de frango | Arroz basmati e iogurte | sim | proposta | |
| Frango tikka masala | Arroz basmati e naan | sim | proposta | |
| Butter chicken | Arroz basmati e naan | sim | proposta | |
| Caril de grão e espinafres | Arroz e iogurte | sim | proposta | |
| Dahl de lentilhas vermelhas | Arroz e coentros | sim | proposta | |
| Salteado de frango e legumes | Arroz ou noodles | sim | proposta | |
| Frango teriyaki | Arroz e brócolos no vapor | sim | proposta | |
| Salmão teriyaki | Arroz e edamame | sim | proposta | |
| Noodles com legumes e tofu | Prato único | sim | proposta | |
| Arroz chau-chau | Prato único | sim | proposta | |
| Yakisoba | Prato único | sim | proposta | |
| Pad thai | Prato único, com amendoim e lima | sim | proposta | |
| Peixe em leite de coco | Arroz jasmim | sim | proposta | |
| Salada César com frango | Prato único, com croutons | | proposta | |
| Poke bowl de salmão | Prato único | sim | proposta | |
| Wraps de frango | Salada ao lado | | proposta | |
| Ratatouille | Arroz ou pão, ou ao lado de carne | | proposta | |

---

# Pratos principais — fim de semana

Mais longos ou mais cerimoniosos. Não são o alvo da primeira leva, mas entram na lista porque são
metade da razão de ter um catálogo.

| Prato | Com | Notas | Estado | id |
|---|---|---|---|---|
| Arroz de pato | Prato único, com salada de agrião | | proposta | |
| Arroz de marisco | Prato único | | proposta | |
| Arroz de tamboril | Prato único | | proposta | |
| Polvo à lagareiro | Batata a murro e grelos | | proposta | |
| Leitão no forno | Batata assada e laranja | | proposta | |
| Cabrito assado | Batata assada e arroz de forno | | proposta | |
| Bacalhau assado com todos | Couve, batata, ovo e cenoura | | proposta | |
| Feijoada de marisco | Arroz branco | | proposta | |
| Rancho à moda da Beira | Prato único | | proposta | |
| Bacalhau à Zé do Pipo | Prato único, com salada | | proposta | |
| Peito de vitela recheado | Batata assada e legumes | | proposta | |
| Naco na pedra | Batata frita, arroz e molhos | | proposta | |
| Francesinha | Batata frita | | proposta | |
| Bœuf bourguignon | Puré de batata | | proposta | |
| Ossobuco à milanesa | Risotto à milanesa | | proposta | |
| Costela assada lenta | Batata assada e coleslaw | | proposta | |
| Pernil de borrego no forno | Batata e legumes do mesmo tabuleiro | | proposta | |
| Pato à pequinesa simplificado | Panquecas, pepino e cebolinho | sim | proposta | |
| Biryani de frango | Prato único, com raita | sim | proposta | |
| Rendang de vaca | Arroz jasmim | sim | proposta | |
| Tajine de frango com limão | Cuscuz | sim | proposta | |
| Lasanha de legumes assados | Salada verde | | proposta | |
| Wellington de vaca | Puré e legumes glaceados | | proposta | |

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
| Caldo verde | Couve galega, batata e chouriço | | proposta | |
| Sopa de legumes | A sopa de todos os dias | | proposta | |
| Sopa de tomate alentejana | Tomate, pão e ovo escalfado | | proposta | |
| Creme de abóbora | Creme suave, com sementes torradas | | proposta | |
| Creme de cenoura | Creme de tacho, com coentros | | proposta | |
| Creme de cogumelos | Creme com natas e pão torrado | | proposta | |
| Sopa de peixe | Caldo de peixe passado, com massinhas | | proposta | |
| Canja de galinha | Galinha, massa e limão | | proposta | |
| Sopa da pedra | Feijão, enchidos e legumes | | proposta | |
| Sopa de feijão com hortaliça | Feijão encarnado e couve | | proposta | |
| Sopa de grão com espinafres | Grão, espinafres e ovo | | proposta | |
| Sopa de agrião | Agrião, batata e um fio de azeite | | proposta | |
| Gaspacho alentejano | Sopa fria de tomate, pepino e pão | | proposta | |
| Açorda alentejana | Pão, alho, coentros e ovo escalfado | | proposta | |

## Internacionais — 11

| Prato | O que é | Notas | Estado | id |
|---|---|---|---|---|
| Minestrone | Sopa italiana de legumes e massa | | proposta | |
| Sopa de cebola gratinada | Francesa, com pão e queijo no forno | | proposta | |
| Vichyssoise | Creme frio de alho-francês e batata | | proposta | |
| Sopa de ervilhas com hortelã | Inglesa, verde e rápida | | proposta | |
| Borscht | Sopa de beterraba com natas azedas | | proposta | |
| Sopa de lentilhas à turca | Lentilha vermelha, cominhos e limão | | proposta | |
| Harira | Sopa marroquina de grão, lentilha e tomate | sim | proposta | |
| Sopa de tortilha mexicana | Caldo de tomate com tiras de tortilha | sim | proposta | |
| Sopa de miso | Caldo dashi com tofu e alga | sim | proposta | |
| Tom kha gai | Sopa tailandesa de coco, frango e galanga | sim | proposta | |
| Sopa de abóbora com coco e caril | Creme com leite de coco | sim | proposta | |

---

# Sobremesas saudáveis

Um pack à parte das sobremesas de pastelaria, e a pedido. A maior parte não tem confeção nenhuma
(`methods: ["sem-confecao"]`), o que as torna as receitas mais baratas de gerar da lista toda — e
as únicas que se fazem enquanto o jantar está no forno.

| Prato | O que é | Notas | Estado | id |
|---|---|---|---|---|
| Granizado de melancia | Melancia congelada e raspada, com lima | | proposta | |
| Granizado de limão | Gelo raspado com sumo de limão e hortelã | | proposta | |
| Granizado de café | Sem açúcar adicionado | | proposta | |
| Gelado de banana | Banana congelada batida, sem natas | | proposta | |
| Gelatina de fruta natural | Gelatina feita com sumo de fruta e pedaços | | proposta | |
| Salada de fruta | Fruta da época, sumo de laranja e hortelã | | proposta | |
| Espetadas de fruta | Fruta em espetada, com chocolate preto | | proposta | |
| Maçã assada com canela | Forno, sem açúcar adicionado | | proposta | |
| Ananás grelhado | Grelhador, com canela e lima | | proposta | |
| Iogurte com fruta e granola | Camadas, de taça | | proposta | |
| Pudim de chia com fruta | De véspera, no frigorífico | sim | proposta | |
| Mousse de iogurte e frutos vermelhos | Batida, sem forno | | proposta | |

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
| Salada de grão com atum | Salada fria de despensa | | proposta | |
| Salada de polvo | Polvo cozido com cebola e coentros | | proposta | |
| Salada de tomate e cebola | Acompanhamento de grelhados | | proposta | |
| Salada de feijão frade com ovo | Clássico de verão | | proposta | |
| Salada grega | Tomate, pepino, feta e azeitona | | proposta | |
| Tabule | Salada de bulgur e salsa | sim | proposta | |
| Coleslaw | Couve e cenoura em molho cremoso | | proposta | |
| Arroz de tomate | Acompanhamento malandro | | proposta | |
| Arroz de feijão | Acompanhamento de pataniscas | | proposta | |
| Batata a murro | Batata assada esmagada com alho e azeite | | proposta | |
| Batata frita no forno | Alternativa à fritadeira | | proposta | |
| Puré de batata | O puré de referência | | proposta | |
| Legumes assados no tabuleiro | Acompanhamento de tudo | | proposta | |
| Esparregado | Espinafres cremosos | | proposta | |
| Grelos salteados com alho | Acompanhamento rápido | | proposta | |
| Peixinhos da horta | Feijão-verde em polme, frito | | proposta | |

## Sobremesas, bolos e pequeno-almoço

Vale a pena por uma razão técnica além da gulodice: são os únicos pratos que exercitam `yield` em
vez de `servings`, o equipamento de pastelaria e o `prepAhead` de levedar e arrefecer.

| Prato | O que é | Notas | Estado | id |
|---|---|---|---|---|
| Arroz doce | Canela por cima, à portuguesa | | proposta | |
| Leite-creme | Queimado com açúcar | | proposta | |
| Pudim flan | Pudim de ovos e caramelo | | proposta | |
| Mousse de chocolate | Clássico de fim de almoço | | proposta | |
| Bolo de bolacha | Bolacha Maria e creme de manteiga | | proposta | |
| Baba de camelo | Doce de ovos e leite condensado | | proposta | |
| Salame de chocolate | Sem forno | | proposta | |
| Pastéis de nata | Massa folhada e creme | | proposta | |
| Bolo de laranja | Bolo de tabuleiro simples | | proposta | |
| Bolo de iogurte | O primeiro bolo de qualquer casa | | proposta | |
| Bolo de cenoura com cobertura | Versão portuguesa, cobertura de chocolate | | proposta | |
| Torta de laranja | Enrolada, sem farinha | | proposta | |
| Tarte de maçã | Massa quebrada e maçã laminada | | proposta | |
| Queijadas | Pequenas, de forma de queques | | proposta | |
| Brownies | Denso, de tabuleiro | | proposta | |
| Panquecas | Pequeno-almoço de fim de semana | | proposta | |
| Papas de aveia | Pequeno-almoço de semana | | proposta | |
| Pão caseiro | Massa levedada, forno de casa | | proposta | |
| Broa de milho | Pão de milho | | proposta | |
| Pão recheado com chouriço e queijo | Para levar ou para lanche | | proposta | |
| Bolo-rei | Natal, com o seu tempo de levedar | | proposta | |
| Filhoses | Fritas, de época | sem banha | proposta | |

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

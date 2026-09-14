# Lista de receitas

O backlog do catálogo. Cada linha é um prato candidato; nenhum vira ficheiro sem passar por triagem.

**Estado de uma linha:** `proposta` · `aceite` · `rejeitada` · `feita`

Uma linha só passa a `feita` quando existe `data/recipes/<id>.json` validado. O id fica na coluna
da direita — é a ligação entre esta lista e o catálogo.

## Como se tria

Passar a lista e marcar. Rejeitar é o gesto normal, não a exceção: a lista foi escrita larga de
propósito, para servir de puxa-memória. **Um catálogo de 80 pratos que se cozinham vale mais do que
um de 150 em que metade nunca sai da grelha.**

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

# Pratos principais — dia a dia

O núcleo, e a primeira coisa a ser gerada: é o que responde a "o que é que se janta hoje", e
portanto o que faz o planeamento semanal e a lista de compras valerem alguma coisa.

## Portugueses

| Prato | O que é | Despensa | Estado | id |
|---|---|---|---|---|
| Bitoque | Bife, ovo a cavalo, batata frita | | proposta | |
| Bifanas | Febras marinhadas em alho e vinho branco, no pão | | proposta | |
| Bife à portuguesa | Bife com molho de mostarda, natas e presunto | | proposta | |
| Carne de porco à alentejana | Porco marinado com amêijoas e batata aos cubos | | proposta | |
| Rojões | Porco em cubos assado no seu molho | | proposta | |
| Costeletas de porco grelhadas | Grelhador, alho e limão | | proposta | |
| Perna de porco assada no forno | Assado simples de domingo a meio da semana | | proposta | |
| Almôndegas com esparguete | Almôndegas em molho de tomate | | proposta | |
| Empadão de carne | Carne picada sob puré de batata, gratinado | | proposta | |
| Jardineira | Guisado de carne com legumes e batata | | proposta | |
| Salsichas frescas com puré | Rápido, dias sem vontade nenhuma | | proposta | |
| Frango assado com piri-piri | Frango inteiro ou às partes, no forno | | proposta | |
| Frango na púcara | Frango estufado com vinho do Porto e cogumelos | | proposta | |
| Frango de churrasco | Espalmado, grelhado, com molho de churrasco | | proposta | |
| Arroz de frango | Arroz malandro com frango desfiado | | proposta | |
| Arroz de cabidela | Arroz de frango com sangue e vinagre | | proposta | |
| Bifes de peru grelhados | Peru grelhado com salada, o jantar de dez minutos | | proposta | |
| Coelho guisado | Coelho estufado com vinho tinto e alho | | proposta | |
| Iscas com elas | Fígado de porco marinado com batata cozida | | proposta | |
| Bacalhau à Brás | Bacalhau desfiado, batata palha e ovo | | proposta | |
| Bacalhau com natas | Bacalhau gratinado com batata e natas | | proposta | |
| Bacalhau à Gomes de Sá | Bacalhau no forno com batata, ovo e azeitona | | proposta | |
| Bacalhau com broa | Lombo de bacalhau com crosta de broa e alho | | proposta | |
| Bacalhau à lagareiro | Lombo assado com batata a murro e muito azeite | | proposta | |
| Pataniscas de bacalhau | Pataniscas com arroz de feijão | | proposta | |
| Filetes de pescada com arroz de tomate | Panados, com arroz de tomate | | proposta | |
| Massada de peixe | Massa caldosa com peixe e refogado | | proposta | |
| Caldeirada de peixe | Peixe, batata e pimento em camadas | | proposta | |
| Carapaus grelhados | Grelhados, com batata cozida e molho de vinagrete | | proposta | |
| Sardinhas assadas | Grelhador, pão e pimento assado | | proposta | |
| Dourada no forno | Peixe inteiro com batata e cebola | | proposta | |
| Salmão no forno com legumes | Tabuleiro único, meia hora | | proposta | |
| Lulas grelhadas | Grelhadas com molho verde | | proposta | |
| Choco frito à setubalense | Choco panado e frito, com batata | | proposta | |
| Açorda de camarão | Pão, alho, coentros e camarão | | proposta | |
| Migas à alentejana | Pão desfeito com entremeada e alho | | proposta | |
| Ovos mexidos com farinheira | Jantar de despensa, rápido | | proposta | |
| Favas com chouriço | Favas guisadas com enchidos | | proposta | |
| Feijoada à transmontana | Feijão com carnes de porco | | proposta | |
| Omelete de legumes | Omelete grande de frigideira | | proposta | |

## Internacionais

| Prato | O que é | Despensa | Estado | id |
|---|---|---|---|---|
| Esparguete à carbonara | Ovo, queijo, guanciale, sem natas | | proposta | |
| Esparguete aglio e olio | Alho, azeite e malagueta, quinze minutos | | proposta | |
| Massa com pesto | Pesto de manjericão feito na hora | | proposta | |
| Massa à bolonhesa | Ragu de carne longo | | proposta | |
| Massa ao forno com atum | Gratinado de despensa | | proposta | |
| Lasanha de carne | Bolonhesa e bechamel em camadas | | proposta | |
| Bolonhesa de lentilhas | A mesma massa, sem carne | | proposta | |
| Penne all'arrabbiata | Tomate, alho e malagueta | | proposta | |
| Risotto de cogumelos | Arroz arbóreo, caldo, parmesão | | proposta | |
| Risotto de camarão | O mesmo método, com marisco | | proposta | |
| Pizza caseira | Massa levedada, no forno de casa | | proposta | |
| Frango à caçadora | Frango estufado com tomate e azeitona | | proposta | |
| Frango com limão e alcaparras | Piccata, frigideira, vinte minutos | | proposta | |
| Escalopes de peru panados | Panados com salada | | proposta | |
| Cordon bleu | Peito recheado com fiambre e queijo | | proposta | |
| Hambúrguer caseiro | Carne picada, pão e o que se quiser | | proposta | |
| Bife Stroganoff | Tiras de carne em molho de natas e mostarda | | proposta | |
| Goulash | Guisado de carne com colorau | | proposta | |
| Chili con carne | Carne picada com feijão e especiarias | | proposta | |
| Tacos de carne picada | Tortilhas, carne temperada, o resto à mesa | sim | proposta | |
| Fajitas de frango | Frango e pimentos salteados | sim | proposta | |
| Moussaka | Beringela, carne e bechamel | | proposta | |
| Paella | Arroz com frango e marisco | | proposta | |
| Tortilha de batata | Tortilla espanhola, batata e ovo | | proposta | |
| Quiche Lorraine | Tarte salgada de bacon e natas | | proposta | |
| Tarte de alho-francês | Tarte salgada vegetariana | | proposta | |
| Gratinado de batata | Batata, natas e forno | | proposta | |
| Shakshuka | Ovos escalfados em molho de tomate e pimento | | proposta | |
| Falafel com pita | Grão frito ou no forno, com molho de iogurte | sim | proposta | |
| Cuscuz com legumes | Cuscuz e legumes assados | | proposta | |
| Gyros de frango | Frango marinado com pita e tzatziki | | proposta | |
| Caril de frango | Caril de base de tomate e cebola | sim | proposta | |
| Frango tikka masala | Frango marinado em iogurte, molho cremoso | sim | proposta | |
| Butter chicken | Caril suave de tomate e manteiga | sim | proposta | |
| Caril de grão e espinafres | Vegetariano, panela única | sim | proposta | |
| Dahl de lentilhas vermelhas | Lentilhas com especiarias e leite de coco | sim | proposta | |
| Salteado de frango e legumes | Stir-fry de wok, quinze minutos | sim | proposta | |
| Frango teriyaki com arroz | Molho de soja, mirim e açúcar | sim | proposta | |
| Salmão teriyaki | O mesmo molho, no peixe | sim | proposta | |
| Noodles com legumes e tofu | Salteado vegetariano | sim | proposta | |
| Arroz chau-chau | Arroz salteado com o que sobrou | sim | proposta | |
| Yakisoba | Noodles salteados com carne e legumes | sim | proposta | |
| Pad thai | Noodles de arroz com tamarindo e amendoim | sim | proposta | |
| Peixe em leite de coco | Caril tailandês suave | sim | proposta | |
| Salada César com frango | Salada que é refeição | | proposta | |
| Poke bowl de salmão | Tigela fria de arroz e peixe | sim | proposta | |
| Wraps de frango | Almoço de sobras | | proposta | |
| Ratatouille | Legumes estufados do Sul de França | | proposta | |

---

# Pratos principais — fim de semana

Mais longos ou mais cerimoniosos. Não são o alvo da primeira leva, mas entram na lista porque são
metade da razão de ter um catálogo.

| Prato | O que é | Despensa | Estado | id |
|---|---|---|---|---|
| Cozido à portuguesa | Carnes, enchidos e legumes cozidos | | proposta | |
| Arroz de pato | Pato desfiado com arroz e chouriço, no forno | | proposta | |
| Arroz de marisco | Arroz malandro de marisco | | proposta | |
| Arroz de tamboril | Malandro, com tamboril e coentros | | proposta | |
| Polvo à lagareiro | Polvo assado com batata a murro | | proposta | |
| Leitão no forno | Pele estaladiça, tempo longo | | proposta | |
| Cabrito assado | Assado de festa com batata e arroz de forno | | proposta | |
| Bacalhau assado com todos | Bacalhau cozido com couve, batata e ovo | | proposta | |
| Ensopado de borrego | Borrego com pão no fundo do prato | | proposta | |
| Feijoada de marisco | Feijão branco com marisco | | proposta | |
| Rancho à moda da Beira | Grão, massa e carnes | | proposta | |
| Bacalhau à Zé do Pipo | Bacalhau com puré e maionese, gratinado | | proposta | |
| Peito de vitela recheado | Assado lento de forno | | proposta | |
| Naco na pedra | Carne grelhada com molhos | | proposta | |
| Francesinha | Sandes com molho de cerveja e queijo gratinado | | proposta | |
| Bœuf bourguignon | Vitela estufada em vinho tinto | | proposta | |
| Ossobuco à milanesa | Chambão estufado com gremolata | | proposta | |
| Costela assada lenta | Costela de vaca, horas de forno baixo | | proposta | |
| Pernil de borrego no forno | Alecrim, alho e tempo | | proposta | |
| Pato à pequinesa simplificado | Pato laqueado, versão de casa | sim | proposta | |
| Biryani de frango | Arroz especiado em camadas | sim | proposta | |
| Rendang de vaca | Guisado longo em leite de coco | sim | proposta | |
| Tajine de frango com limão | Guisado marroquino de panela | sim | proposta | |
| Lasanha de legumes assados | Vegetariana, de forno | | proposta | |
| Wellington de vaca | Massa folhada e duxelles | | proposta | |

---

# Depois dos principais

Fora da primeira leva por decisão tua — entram quando os principais estiverem no sítio. Ficam aqui
para não se perderem.

## Sopas, saladas e acompanhamentos

| Prato | O que é | Despensa | Estado | id |
|---|---|---|---|---|
| Caldo verde | Couve galega, batata e chouriço | | proposta | |
| Sopa de legumes | A sopa de todos os dias | | proposta | |
| Creme de abóbora | Creme suave de forno ou tacho | | proposta | |
| Sopa de peixe | Caldo de peixe passado | | proposta | |
| Canja de galinha | Galinha, massa e limão | | proposta | |
| Sopa da pedra | Feijão, enchidos e legumes | | proposta | |
| Gaspacho | Sopa fria de tomate e pepino | | proposta | |
| Creme de cogumelos | Creme com natas | | proposta | |
| Sopa de miso | Caldo dashi com tofu e alga | sim | proposta | |
| Salada de grão com atum | Salada fria de despensa | | proposta | |
| Salada de polvo | Polvo cozido com cebola e coentros | | proposta | |
| Salada de tomate e cebola | Acompanhamento de grelhados | | proposta | |
| Salada de feijão frade com ovo | Clássico de verão | | proposta | |
| Salada grega | Tomate, pepino, feta e azeitona | | proposta | |
| Tabule | Salada de bulgur e salsa | sim | proposta | |
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

| Prato | O que é | Despensa | Estado | id |
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
| Filhoses | Fritas, de época | | proposta | |

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

| Prato | O que é | Quem faz | Estado | id |
|---|---|---|---|---|
| | | | | |

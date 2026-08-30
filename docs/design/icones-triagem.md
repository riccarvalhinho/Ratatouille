# Ícones do "Apetece-me algo" — handover e revisão

Documento completo e autónomo: contexto, fluxo, medidas, especificação técnica e as peças uma a uma.
Quem o receber não precisa de mais nada.

> **As peças já vieram.** O que chegou do Claude Design, o que ficou aceite e o que volta para trás
> está na secção 10, no fim. Os desenhos estão em `app/src/ui/icones-triagem.tsx` e a folha de onde
> se reexportam em `docs/design/icones-triagem.dc.html`.

Os eixos estão fechados em `docs/conversas/07-vocabulario-labels.md`; a feature em
`docs/product/roadmap.md` (N0) e `docs/conversas/02-ui-catalogo.md`.

---

## 1. Para que serve isto

**Ratatouille** é uma app de cozinha de uso pessoal, para um **tablet Amazon Fire HD 10 suspenso na
parede da cozinha**. Só toque, muitas vezes com as mãos ocupadas, e a cerca de **70 cm de distância**.
Tem de funcionar offline. Interface toda em **português de Portugal**.

O ecrã principal é o catálogo — uma grelha de receitas. Com uma centena de receitas ou mais, a grelha
responde bem a "onde está aquela receita" e mal a **"não sei o que me apetece"**.

O **"Apetece-me algo"** é a resposta a essa segunda pergunta: um assistente de filtro que estreita o
catálogo por critérios, e devolve a pessoa à lista de sempre já filtrada.

**Não é o ecrã de entrada da app** e **não substitui os filtros normais** — é uma porta lateral.

---

## 2. O fluxo, e onde cada ícone aparece

**Entrada.** Um botão no topo da lista de receitas abre um pop-up sobre o catálogo.

**Nível 1 — o painel.** Oito mosaicos numa grelha de **4 × 2**. Cada mosaico é um critério: mostra o
**ícone do critério**, o nome, e o que já estiver escolhido. Toca-se num.

**Nível 2 — as opções.** O painel passa a mostrar as opções desse critério, em mosaicos grandes com
**um ícone cada**. Escolhe-se, e volta-se ao nível 1 para continuar — ou fecha-se e vai-se ver o
resultado.

**Nada é obrigatório.** Um toque num critério, uma opção, e pode ir-se embora. Ninguém tem de passar
pelos oito.

**A contagem está sempre à vista e a descer.** O botão de fechar diz "Ver 23 receitas", e o número
muda enquanto se escolhe. É o que impede alguém de investir quatro toques numa combinação que devolve
zero.

**Saída.** Fecha-se e cai-se na lista de sempre, filtrada. **Os filtros escolhidos aparecem na barra
do catálogo como pastilhas pequenas, com o ícone ao lado do nome** — e é aí que os ícones têm de
funcionar a 24px.

### Os três tamanhos em que o mesmo ícone é visto

| Onde | Tamanho | Nota |
|---|---|---|
| Pastilha de filtro no catálogo | **24px** | O caso mais exigente. Se não sobreviver aqui, não serve |
| Mosaico de critério, nível 1 | **48px** | |
| Mosaico de opção, nível 2 | **72px** | O caso confortável |

---

## 3. Medidas

Calculadas para o viewport do tablet: **1280 × 800 pontos** (1920×1200 físicos a 1,5×).

**Pop-up:** cerca de 1120 × 680, centrado, com 32px de margem interior.

**Nível 1 — mosaico de critério:** grelha 4 × 2, cerca de **246 × 296px** cada, 24px entre eles.

**Nível 2 — mosaico de opção:** grelha 4 × 2 na largura toda, cerca de **244 × 268px** cada. Um
critério com sete opções deixa um lugar vazio; não se estica nada para o preencher.

Todos os alvos estão muito acima do mínimo de 56px do design system, e é de propósito: a esta
distância, o alvo grande é o que dispensa pontaria.

---

## 4. Especificação técnica

Os ícones entram no `app/src/ui/icons.tsx`, que já tem convenções. **Segui-las é obrigatório** — o
conjunto novo tem de ser indistinguível do que já lá está.

```
viewBox        0 0 24 24
fill           none
stroke         currentColor
stroke-width   2.5
stroke-linecap round
stroke-linejoin round
width/height   1em   (quem usa controla o tamanho pelo CSS)
```

**Traço de 2.5 num viewBox de 24 é deliberadamente grosso.** Não é um descuido de proporção: é o que
mantém o desenho legível a 70 cm e a 24px. Um traço fino desaparece nas duas pontas.

**`currentColor` e nada mais.** Sem cores próprias, sem preenchimentos, sem gradientes. A cor vem do
estado — não escolhido, escolhido, sem resultados — e é o CSS que a dá. Um ícone com cor própria
parte o tema escuro, que existe porque a cozinha à noite não tem a luz do dia.

**Sem texto dentro do SVG.** Os numerais do Tempo são texto do HTML, não caminhos.

Paleta em que vão ser vistos, para referência:

| Token | Claro | Escuro |
|---|---|---|
| `--color-text` | `#22261f` | `#eceee5` |
| `--color-text-muted` | `#5f6659` | `#a3aa99` |
| `--color-accent` | `#2f6b3f` | `#7fb98c` |
| `--color-surface` | `#ffffff` | `#1f2219` |

---

## 5. Regras do conjunto

Valem mais do que qualquer peça, porque o que se olha é o painel e não a peça.

1. **Objetos, não metáforas.** Todos os ícones são coisas que existem — uma panela, um peixe, uma
   espiga. Onde não houver objeto óbvio, procura-se o mais próximo antes de aceitar um símbolo.
2. **A distinção que conta é dentro do critério.** Ninguém compara "sopa" com "airfryer". Comparam-se
   as sete do Método umas com as outras. É aí que o conjunto passa ou chumba.
3. **A silhueta faz o trabalho.** A 24px o detalhe interior desaparece. Alto contra baixo, asa contra
   cabo, gaveta contra porta.
4. **Sem bandeiras.** Ver o critério Cultura.
5. **Um ícone por conceito, sem variantes.** O mesmo desenho serve os três tamanhos.

---

## 6. Os oito critérios

Cada critério leva **um ícone próprio** para o mosaico do nível 1, mais um por opção.

O ícone do critério **não é uma abstração** — é o objeto mais representativo do que está lá dentro.
O Método é uma frigideira; o Ingrediente principal é um peixe ou uma coxa. Isso resolve-se sozinho e
mantém a regra 1 intacta.

---

### 6.1 Tipo de refeição — 1 + 8

**Ícone do critério:** prato raso com talheres cruzados.

| id | Nome | O ícone comunica |
|---|---|---|
| `sopa` | Sopa | Taça funda, líquido, **vapor**. O vapor é o que a separa da salada |
| `salada` | Salada | Taça larga e aberta, folhas a transbordar |
| `prato-principal` | Prato principal | Prato raso e cheio |
| `acompanhamento` | Acompanhamento | Prato **pequeno** ao lado de um maior cortado pela margem |
| `sobremesa` | Sobremesa | Fatia com camadas, ou taça com colher espetada |
| `pequeno-almoco` | Pequeno-almoço | Chávena com pires — o único momento do dia com objeto próprio |
| `snack` | Snack | Coisa pequena de mão, sem prato por baixo |
| `pao-e-bolos` | Pão e bolos | Pão rústico com corte na crosta |

> `prato-principal` e `acompanhamento` são o mesmo objeto em dois tamanhos, e a 24px a escala
> relativa perde-se. A solução é de **composição**, não de tamanho.

### 6.2 Ingrediente principal — 1 + 8

**Ícone do critério:** coxa de frango.

| id | Nome | O ícone comunica |
|---|---|---|
| `carne` | Carne | Peça com osso — costeleta de perfil |
| `aves` | Aves | Coxa. Silhueta muito diferente da costeleta |
| `peixe` | Peixe | Peixe inteiro de perfil, com cauda |
| `marisco` | Marisco | Camarão curvado, ou bivalve aberto |
| `ovos` | Ovos | Ovo **partido** — o inteiro lê-se como uma elipse qualquer |
| `leguminosas` | Leguminosas | Grãos soltos com vagem |
| `legumes` | Legumes | Dois vegetais de formas opostas: raiz alongada e ramo. Nunca um só |
| `massa-e-arroz` | Massa e arroz | Massa enrolada no garfo, ou monte de grão |

> `legumes` **não** é o mesmo que vegetariano. Um é o assunto do prato, o outro é uma regra — o arroz
> doce é vegetariano e não tem nada a ver com isto.

### 6.3 Método — 1 + 7

**Ícone do critério:** frigideira de perfil.

Vem do enum `methods` do schema. **Lista fechada.**

| id | Nome | O ícone comunica |
|---|---|---|
| `tacho` | Tacho | Panela **alta**, duas asas laterais, tampa |
| `forno` | Forno | Caixa com **porta e puxador**, grelha lá dentro |
| `frigideira` | Frigideira | **Baixa e larga**, um cabo longo, sem tampa |
| `grelhador` | Grelhador | Só as **barras paralelas** e as marcas. Sem recipiente |
| `airfryer` | Airfryer | Corpo alto com **gaveta e pega frontal** |
| `micro-ondas` | Micro-ondas | Caixa **larga com janela** e painel de botões à direita |
| `sem-confecao` | Sem cozinhar | Faca e tábua. **Não** um lume riscado — o riscado lê-se como proibição |

> **É o critério mais arriscado:** quatro dos sete são recipientes. Ver a regra 3.

### 6.4 Tempo de confeção — 1 + 2, mais quatro numerais

**Ícone do critério:** relógio.

**Este critério não leva um ícone por opção, e é deliberado.** O tempo é uma quantidade, e uma
quantidade lê-se melhor num número. Quatro relógios com ponteiros diferentes é a pior maneira de dizer
20, 40 e 60.

| id | Mostra |
|---|---|
| `ate-20` | **20** min |
| `ate-40` | **40** min |
| `ate-60` | **1 h** |
| `mais-de-60` | **1 h +** |

Dois ícones só:

- **Relógio**, partilhado, como motivo do mosaico.
- **`sem-vespera`** — lua em quarto crescente riscada, ou calendário com o dia anterior cortado. É um
  **interruptor** e não um escalão: não é uma duração, é um sim ou não sobre outro tipo de tempo.
  Filtra as receitas que precisam de véspera — demolhar bacalhau, levedar, arrefecer.

### 6.5 Cultura — 1 + 8

**Ícone do critério:** globo, ou um mapa estilizado.

**Cada cultura é um prato dela, não uma bandeira.** Uma receita mediterrânica não tem bandeira, e uma
bandeira italiana num painel de comida é um clichê que envelhece mal.

| id | Nome | O ícone comunica |
|---|---|---|
| `portuguesa` | Portuguesa | Panela de barro, ou sardinha. **Não** galo de Barcelos |
| `italiana` | Italiana | Massa ou pizza — ou os dois num só desenho |
| `asiatica` | Asiática | Pauzinhos sobre tigela |
| `mediterranica` | Mediterrânica | Ramo de oliveira com azeitonas |
| `indiana` | Indiana | Prato de caril, com o molho e o arroz ao lado |
| `mexicana` | Mexicana | Taco dobrado |
| `francesa` | Francesa | Baguete, ou croissant |
| `americana` | Americana | Hambúrguer de camadas |

> **É o único critério que se espera que cresça.** Oito é o começo. Acima de dez, o mosaico do nível 2
> deixa de ser grelha fixa e passa a folha que rola.

### 6.6 Apetite — 1 + 3, num só desenho

**Ícone do critério:** o prato a meio (o mesmo de `equilibrado`).

Vem de `weight`, já no schema. É uma **escala**.

| id | Nome | O ícone comunica |
|---|---|---|
| `leve` | Leve | **O mesmo prato**, com pouco |
| `equilibrado` | Equilibrado | O mesmo prato, a meio |
| `substancial` | Substancial | O mesmo prato, cheio a transbordar |

> **Um desenho, três estados de enchimento.** É o que torna a escala legível sem legenda: o olho vê a
> progressão antes de ler as palavras. Três objetos diferentes destruiriam isso.

### 6.7 Ocasião — 1 + 4

**Ícone do critério:** duas taças a tocar-se (o mesmo de `festa`).

| id | Nome | O ícone comunica |
|---|---|---|
| `dia-a-dia` | Dia a dia | Prato e garfo, o mais neutro do conjunto. É o contrário de *Festa* |
| `conforto` | Conforto | Taça funda **segurada por duas mãos**. O objeto é a mão, não o vapor |
| `festa` | Festa | Duas taças a tocar-se |
| `sobras` | Sobras | Caixa com tampa **a meio de fechar** |

### 6.8 Regime — 1 + 4

**Ícone do critério:** folha única.

| id | Nome | O ícone comunica |
|---|---|---|
| `vegetariano` | Vegetariano | Folha **única**, com nervura |
| `vegan` | Vegan | **Rebento com duas folhas** a sair de um caule |
| `sem-gluten` | Sem glúten | Espiga com traço diagonal |
| `sem-lactose` | Sem lactose | Gota com traço diagonal |

> Este critério **não é da mesma natureza que os outros sete**: não estreita por apetência, corta por
> regra. No desenho do ecrã fica visualmente separado, e é **pegajoso** — quem não come glúten escolhe
> uma vez e fica. Os outros sete limpam-se ao fechar o painel; este não.

---

## 7. O que explorar em vez de executar

Seis peças em que **não queremos uma solução, queremos alternativas.** Duas ou três propostas cada, e
escolhe-se a olhar.

| Peça | O problema | Pistas |
|---|---|---|
| `conforto` | Uma sensação, não um objeto | As mãos à volta da taça; ou um prato com colher lá dentro |
| `leve` · `substancial` | Têm de ser o mesmo prato com enchimentos diferentes, e a diferença tem de ler-se a 24px | Altura do conteúdo? Número de elementos? |
| `sem-confecao` | Ausência de uma ação | Faca e tábua; mas há quem leia "cortar" e não "não cozinhar" |
| `dia-a-dia` | O neutro, que por definição não tem forma própria | Prato e garfo; mas colide com `prato-principal` |
| `mediterranica` | Sobrepõe-se a Portuguesa e Italiana no conteúdo | Só a azeitona? O ramo? |
| `airfryer` vs `micro-ondas` vs `forno` | Três caixas | A gaveta, a janela, a porta — chega para os separar? |

---

## 8. O que não fazer

- **Bandeiras** em nenhum sítio.
- **Cor própria** em nenhum ícone.
- **Texto dentro do SVG.**
- **Emoji.** Os símbolos do modo cozinha já tiveram de passar de caracteres a SVG porque o "▶" tem
  variante de emoji e há fontes de Android que o desenham a cores. Num painel onde o ícone **é o
  alvo**, isso não pode ficar à sorte da fonte do tablet.
- **Perspetiva ou sombra.** Traço plano, como o resto da app.
- **Um estilo diferente para os ícones dos critérios.** São da mesma família que as opções.

---

## 9. Contagem

| Critério | Critério | Opções | Total |
|---|---|---|---|
| Tipo de refeição | 1 | 8 | 9 |
| Ingrediente principal | 1 | 8 | 9 |
| Método | 1 | 7 | 8 |
| Tempo de confeção | 1 | 2 | 3 |
| Cultura | 1 | 8 | 9 |
| Apetite | 1 | 3 | 4 |
| Ocasião | 1 | 4 | 5 |
| Regime | 1 | 4 | 5 |
| **Total** | **8** | **44** | **52** |

**Por onde começar:** Método (a fileira dos recipientes), Apetite (a escala) e Ocasião (o `conforto`).
São onze peças e cobrem os três riscos do conjunto. Se resolverem, as outras quarenta e uma são
trabalho.

---

## 10. O que voltou, e a revisão

Recebido do Claude Design em 2026-08-26. **46 peças**, não 52 — e a diferença é uma decisão melhor do
que a que estava no pedido.

### Três decisões que melhoraram o pedido

**Cinco critérios reutilizam o ícone de uma das suas opções**, em vez de terem desenho próprio: o
Ingrediente principal é a coxa, o Método é a frigideira, o Apetite é o prato do meio, a Ocasião são as
taças, o Regime é a folha. Só o Tipo de refeição, o Tempo e a Cultura têm ícone próprio. Isso faz o
nível 1 e o nível 2 não se contradizerem — o mosaico do critério mostra literalmente uma das coisas
que estão lá dentro — e poupa cinco desenhos.

**O `conforto` deixou de ser a taça entre mãos e passou a ser uma lareira.** É a única peça do
conjunto que não é objeto de cozinha, e é uma quebra de registo que aceito de bom grado: resolve o
problema que eu tinha marcado como o mais difícil dos 44, tem silhueta única, e lê-se aos 24px. As
mãos que eu propus não sobreviviam a esse tamanho.

**O `sobras` abre a tampa para a esquerda**, ao contrário do cabo da frigideira. Foi uma colisão que
eles encontraram e corrigiram, e que eu não tinha previsto.

### Um defeito, corrigido na integração

**O ficheiro não compilava.** Os oito ícones do mapa `iconesCriterio` estavam referenciados como
`IconeAves`, `IconeFrigideira` e afins, e as definições chamam-se `IconAves`, `IconFrigideira`. Mais
o sufixo `A` das variantes exploradas, que ficou nos nomes depois de a variante estar escolhida.

Está registado no fundo do `app/src/ui/icones-triagem.tsx`. **Nenhum caminho de desenho foi tocado.**

### O que aguenta os 24px, verificado

Julgado nos pixels reais — os SVG a 24px, ampliados depois, e não redesenhados em grande.

**Os quatro recipientes do Método, que eram o risco nº1, resolvem-se.** O forno é uma caixa quadrada
com painel em cima, o micro-ondas é largo com janela e botões à direita, a airfryer é alta e estreita
com a linha da gaveta, e o grelhador não tem recipiente nenhum. A silhueta faz o trabalho, como a
regra 3 pedia.

**A escala do Apetite, que era o risco nº2, funciona onde tem de funcionar.** A `leve` e a
`equilibrado` são quase indistinguíveis aos 24px — a linha do enchimento muda dois pixels — mas aos
72px, que é onde as três aparecem lado a lado e onde a escolha se faz, a progressão lê-se. Aos 24px o
ícone está numa pastilha, com a palavra ao lado a fazer o trabalho. **Fica como está**: apertar a
diferença estragava o desenho para ganhar precisão num sítio onde ela não é precisa.

**O `dia-a-dia` e o ícone do critério Tipo de refeição são parecidos** — prato com garfo, com e sem
faca. Pela regra 2 não é problema: estão em critérios diferentes e nunca aparecem no mesmo ecrã, um é
de nível 1 e o outro de nível 2. Fica, e revê-se quando o painel estiver construído e se vir os dois
numa sessão real.

### Três peças que voltam para trás

Não são de risco previsto — são as que, vistas aos 24px, **não dizem o que são**.

| Peça | O que se lê hoje | O que precisa |
|---|---|---|
| `carne` | Um alvo, ou uma lente. O osso ao centro vira um ponto e o contorno vira um círculo | A silhueta de uma costeleta tem de vir do **recorte exterior**, não de um detalhe interior |
| `acompanhamento` | Duas elipses sem relação | A ideia de "prato pequeno ao lado de um maior" perde-se. Talvez não seja composição, talvez seja outro objeto — uma taça de acompanhamento à parte |
| `massa-e-arroz` | Três linhas onduladas — água | Massa enrolada num garfo diz massa; ondas dizem mar. Vale mais escolher um dos dois alimentos e desenhá-lo bem do que sugerir os dois e não dizer nenhum |

As três estão em critérios de oito peças, onde competem com sete vizinhas bem resolvidas — e é isso
que as faz notar.

## 11. Segunda entrega: as três voltaram refeitas

Recebida em 2026-08-30. **46 peças outra vez, das quais 6 mudaram de geometria**: as três que tinham
sido devolvidas, mais `dia-a-dia`, `tipo-refeicao` e `leguminosas`, que ninguém tinha pedido.

**As três resolvem-se, e resolvem-se pelo caminho que o pedido indicava.**

| Peça | Antes | Agora |
|---|---|---|
| `carne` | Um alvo: o osso ao centro virava um ponto, o contorno um círculo | Um osso, com a silhueta a vir do recorte exterior — que era exatamente o que faltava |
| `massa-e-arroz` | Três ondas, que diziam mar | Massa enrolada num garfo. Escolheram um dos dois alimentos, como sugerido, em vez de sugerir os dois |
| `acompanhamento` | Duas elipses sem relação | Uma travessa de duas asas. Não é composição, é outro objeto — a segunda das duas saídas propostas |

As outras três mudanças são afinações da mesma ideia e não trocas de motivo, e nenhuma delas piora aos
24px.

**Os dois defeitos da primeira entrega desapareceram.** O ficheiro compila como veio, e os nomes já
não trazem o sufixo `A` das variantes exploradas. A única alteração manual na integração foi o
`import type { JSX, SVGProps } from 'react';`, que o projeto precisa e o pacote não sabia.

### O que ficou de fora, de propósito

O pacote traz as mesmas geometrias em quatro formatos — `assets/svg/`, `sprite.svg`,
`icons.manifest.json` e um `INDEX.md`. Nada disso entra no repositório: a app importa o componente
React e mais nada, e quatro cópias da mesma linha são quatro sítios onde a próxima correção se pode
esquecer. Fica só o `.tsx`, mais o `.dc.html` de contacto para se poderem ver todos juntos.

### O elo que passou a ter rede

A integração revelou um buraco que não era desta entrega: **o painel procura o ícone pela chave da
label, e uma chave que não existe não desenha nada — em silêncio.** Uma cultura nova no `labels.json`
sem desenho correspondente dava um mosaico com o nome e um vazio, e só se descobria a olhar para o
tablet.

`app/src/domain/triagem.test.ts` fecha isso contra a taxonomia real de `data/`, e não contra uma
fixture — uma fixture inventada passaria sempre. Apanhou logo o primeiro caso: os quatro escalões de
tempo apontavam para ícones que nunca existiram. A ausência era certa, a maneira de a escrever é que
não era; agora `icone` é opcional e os escalões dizem `undefined`, que é o que o mosaico do número
já esperava.

# Ícones do "Apetece-me algo"

Inventário completo das opções dos oito quadrantes e do que cada ícone tem de comunicar. Serve de
**encomenda ao Claude Design** — os eixos estão fechados em `docs/conversas/07-vocabulario-labels.md`.

**44 ícones.** A contagem por quadrante está em cada secção.

## Regras do conjunto

Valem mais do que qualquer ícone individual, porque o que se olha é o painel e não a peça.

1. **Um só nível de abstração: objetos.** Todos os ícones são coisas que existem — uma panela, um
   peixe, uma espiga. Nada de metáforas: um coração para "conforto" ao lado de uma frigideira são
   duas linguagens no mesmo ecrã. Onde não houver objeto óbvio (Apetite, Ocasião), procura-se o
   objeto mais próximo antes de se aceitar um símbolo.
2. **Monocromáticos, `currentColor`, traço uniforme.** Como o `app/src/ui/icons.tsx` já faz. A cor é
   do estado — selecionado, disponível, esgotado — e nunca do ícone.
3. **Legíveis a 24px e a 70 cm.** O teste não é olhar de perto no ecrã grande: é reduzir a 24px e ver
   se ainda se distingue dos vizinhos do mesmo quadrante.
4. **A distinção que conta é dentro do quadrante, não no conjunto todo.** Ninguém compara "sopa" com
   "airfryer". Comparam-se as sete do Método umas com as outras.
5. **Sem bandeiras, sem texto dentro do ícone, sem emoji.** Ver as notas da Cultura e do Tempo.

## Onde isto se parte, e por onde começar

Três sítios. Vale a pena desenhar estes primeiro: se resolverem, os restantes trinta são trabalho.

| Risco | Onde | Porquê |
|---|---|---|
| **Recipientes iguais** | Método | Tacho, frigideira, airfryer e micro-ondas são todos "caixa ou taça com pega". É o quadrante com maior hipótese de sair indistinto |
| **Sem objeto** | Apetite, Ocasião | *Leve*, *Conforto* e *Festa* não são coisas. É onde a regra 1 vai ser posta à prova |
| **Clichê** | Cultura | Bandeiras não servem — uma receita mediterrânica não tem bandeira, e uma bandeira italiana num painel de comida envelhece mal |

---

## 1. Tipo de refeição — 8 ícones

| id | Nome | O ícone tem de comunicar |
|---|---|---|
| `sopa` | Sopa | Taça funda, líquido, vapor. O vapor é o que a separa da salada |
| `salada` | Salada | Taça larga e aberta, com folhas a transbordar |
| `prato-principal` | Prato principal | Prato raso e cheio. Ver aviso abaixo |
| `acompanhamento` | Acompanhamento | Prato **pequeno**, ao lado de um maior insinuado ou cortado pela margem |
| `sobremesa` | Sobremesa | Fatia com camadas, ou taça com colher espetada |
| `pequeno-almoco` | Pequeno-almoço | Chávena com pires. É o único momento do dia que tem objeto próprio |
| `snack` | Snack | Coisa pequena de mão, sem prato por baixo |
| `pao-e-bolos` | Pão e bolos | Pão rústico com corte na crosta |

> **Aviso.** `prato-principal` e `acompanhamento` são o mesmo objeto em dois tamanhos, e a 24px o
> tamanho relativo perde-se. A solução tem de ser de composição — o acompanhamento como prato lateral
> junto a um maior — e não de escala.

## 2. Ingrediente principal — 8 ícones

| id | Nome | O ícone tem de comunicar |
|---|---|---|
| `carne` | Carne | Peça com osso — costeleta de perfil |
| `aves` | Aves | Coxa. Silhueta muito diferente da costeleta |
| `peixe` | Peixe | Peixe inteiro de perfil, com cauda |
| `marisco` | Marisco | Camarão curvado, ou bivalve aberto |
| `ovos` | Ovos | Ovo partido, não ovo inteiro — o inteiro lê-se como uma elipse qualquer |
| `leguminosas` | Leguminosas | Grãos soltos, três ou quatro, com vagem |
| `legumes` | Legumes | Dois vegetais de formas opostas: raiz alongada e ramo. Nunca um só |
| `massa-e-arroz` | Massa e arroz | Novo. Massa enrolada, ou monte de grão. É a apetência mais comum que faltava |

> `legumes` **não** é o mesmo que vegetariano. Um é o assunto do prato, o outro é uma regra — o arroz
> doce é vegetariano e não tem nada a ver com isto.

## 3. Método — 7 ícones

Vem do enum `methods` do schema. **Lista fechada: não cresce sem mudar o schema.**

| id | Nome | O ícone tem de comunicar |
|---|---|---|
| `tacho` | Tacho | Panela **alta**, duas asas laterais, tampa |
| `forno` | Forno | Caixa com **porta e puxador**, grelha lá dentro |
| `frigideira` | Frigideira | **Baixa e larga**, um cabo longo, sem tampa |
| `grelhador` | Grelhador | Só as **barras paralelas** e as marcas. Sem recipiente |
| `airfryer` | Airfryer | Corpo alto com **gaveta e pega frontal** — a gaveta é o que a distingue |
| `micro-ondas` | Micro-ondas | Caixa **larga com janela** e painel de botões à direita |
| `sem-confecao` | Sem cozinhar | Faca e tábua. Não um lume riscado — o riscado lê-se como proibição |

> **É o quadrante mais arriscado.** Quatro dos sete são recipientes. A distinção tem de vir da
> **silhueta** — alto contra baixo, asas contra cabo, gaveta contra porta — e não do detalhe interior,
> que a 24px desaparece.

## 4. Tempo de confeção — 2 ícones + 4 numerais

**Este quadrante não leva um ícone por opção, e é deliberado.** O tempo é uma quantidade, e uma
quantidade lê-se melhor num número do que num desenho. Quatro relógios com ponteiros em posições
diferentes é a pior maneira de dizer 20, 40 e 60.

| id | Mostra | Vem de |
|---|---|---|
| `ate-20` | **20** min | `timing.prepMinutes + cookMinutes` |
| `ate-40` | **40** min | idem |
| `ate-60` | **1 h** | idem |
| `mais-de-60` | **1 h +** | idem |

- **1 ícone de relógio**, partilhado, como motivo do mosaico — não repetido em cada opção.
- **1 ícone para "sem véspera"**: lua em quarto crescente riscada, ou calendário com o dia anterior
  cortado. É um **interruptor**, não um escalão — não está na mesma escala que os outros, porque não é
  uma duração, é um sim ou não sobre outro tipo de tempo. Sai do `timing.prepAhead`.

> Isto mata a label `rapido`, que dizia com uma palavra vaga o que quatro números dizem melhor.

## 5. Cultura — 8 ícones

| id | Nome | O ícone tem de comunicar |
|---|---|---|
| `portuguesa` | Portuguesa | Panela de barro, ou sardinha. **Não** galo de Barcelos |
| `italiana` | Italiana | Massa enrolada no garfo |
| `asiatica` | Asiática | Pauzinhos sobre tigela |
| `mediterranica` | Mediterrânica | Ramo de oliveira com azeitonas |
| `indiana` | Indiana | Monte de especiaria em pó, com colher |
| `mexicana` | Mexicana | Espiga de milho, ou taco dobrado |
| `francesa` | Francesa | Baguete, ou croissant |
| `americana` | Americana | Hambúrguer de camadas |

> **Dois avisos.** *Indiana* e *Mexicana* puxam ambas para a malagueta — têm de divergir cedo, uma
> para a especiaria em pó e a outra para o milho. E *Mediterrânica* sobrepõe-se a *Italiana* e
> *Portuguesa* no conteúdo: a azeitona é o que lhe resta de próprio.

> **É o único quadrante que se espera que cresça.** Oito é o começo, não o fim — acima de dez, o
> mosaico deixa de ser grelha fixa e passa a folha que rola. Errar aqui é barato: uma label sem
> receitas é invisível no ecrã, como quatro das nove de `tipo-de-prato` provam hoje.

## 6. Apetite — 3 ícones, um desenho

Vem de `weight`, já no schema, atribuído por rubrica escrita. É uma **escala**, e é a exceção à regra
dos 4 a 8: três opções ordenadas leem-se como um selector, três opções soltas leem-se como um
quadrante meio vazio.

| id | Nome | O ícone tem de comunicar |
|---|---|---|
| `leve` | Leve | **O mesmo prato**, com pouco |
| `equilibrado` | Equilibrado | O mesmo prato, a meio |
| `substancial` | Substancial | O mesmo prato, cheio a transbordar |

> **Um desenho, três estados de enchimento.** É o que torna a escala legível sem legenda: o olho vê a
> progressão antes de ler as palavras. Três objetos diferentes destruíam isso.

## 7. Ocasião — 4 ícones

O que sobra de `ocasiao` depois de lhe tirar o que outros eixos dizem melhor.

| id | Nome | O ícone tem de comunicar |
|---|---|---|
| `dia-a-dia` | Dia a dia | Prato e garfo, o mais neutro do conjunto. É o contrário de *Festa*, não de *rápido* |
| `conforto` | Conforto | Taça funda **segurada por duas mãos**. O objeto é a mão, não o vapor |
| `festa` | Festa | Duas taças a tocar-se |
| `sobras` | Sobras | Caixa com tampa **a meio de fechar** |

> **As duas labels mais usadas do seed morrem aqui.** *Dia de semana* e *Fim de semana* eram
> taquigrafia para "pouco tempo e pouco trabalho" contra "tenho a tarde toda". Com um eixo de tempo em
> minutos e outro de método, diziam o mesmo pior.

> `conforto` é, com `leve`, o ícone mais difícil dos 44. A saída é as **mãos**: transformam uma
> sensação num objeto, que é o que a regra 1 pede.

## 8. Regime — 4 ícones

| id | Nome | O ícone tem de comunicar |
|---|---|---|
| `vegetariano` | Vegetariano | Folha **única**, com nervura |
| `vegan` | Vegan | **Rebento com duas folhas** a sair de um caule |
| `sem-gluten` | Sem glúten | Espiga com traço diagonal |
| `sem-lactose` | Sem lactose | Gota com traço diagonal |

> `vegetariano` e `vegan` são o mesmo problema que o tacho e a frigideira: ambos verdes, ambos folha.
> A silhueta tem de os separar — **uma folha contra um rebento inteiro**, e não uma folha contra duas.

> Este quadrante **não é da mesma natureza que os outros sete**: não estreita por apetência, corta por
> regra. Fica visualmente separado, e é **pegajoso** — quem não come glúten escolhe uma vez e fica.
> Os outros sete limpam-se ao fechar o painel; este não.

## Contagem

| Quadrante | Ícones |
|---|---|
| Tipo de refeição | 8 |
| Ingrediente principal | 8 |
| Método | 7 |
| Tempo de confeção | 2 (relógio + sem véspera) |
| Cultura | 8 |
| Apetite | 3 (um desenho, três enchimentos) |
| Ocasião | 4 |
| Regime | 4 |
| **Total** | **44** |

## Por decidir antes da encomenda

1. **Os mosaicos fechados têm ícone próprio?** Oito ícones a mais, um por quadrante, para o painel se
   ler antes de se abrir seja o que for. Inclino-me para **não**: o nome do quadrante é uma palavra
   curta e um ícone de "Método" seria uma abstração — precisamente o que a regra 1 proíbe.
2. **O que fazer com uma opção que não tem receitas nenhumas.** Esconder é honesto mas faz o painel
   mudar de forma; mostrar apagado é estável mas oferece becos sem saída. Inclino-me para **mostrar
   apagado com a contagem a zero**, que é coerente com a contagem sempre à vista.

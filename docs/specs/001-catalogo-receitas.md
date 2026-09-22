# Spec 001 — Catálogo de receitas

**Milestone:** M1
**Estado:** Pronta
**Depende de:** ADR 0002 (dados), spec 002 (detalhe)

## Objetivo

Dar resposta à pergunta "o que é que eu posso cozinhar?" — descobrir receitas por navegação visual,
filtrando pelo tempo que se tem e pelo tipo de prato que apetece.

## Comportamento

Tab principal com as receitas em grelha, navegável por toque e por scroll vertical.

### Cartão de receita

Cada receita aparece como um cartão com:

- thumbnail do prato
- nome
- duração de confeção
- indicação de antecedência de preparação, quando existe (ex.: "de véspera", "+2h")
- **"pede acompanhamento", quando `needsSide`** — ver abaixo
- **de quem é a receita, quando não foi gerada** — ver abaixo
- até 3 labels de tipo de prato (carne, peixe, sopa, sobremesa, …)

Se a receita não tiver imagem, o cartão mostra um marcador neutro em vez de partir o alinhamento
da grelha.

#### "pede acompanhamento" é informação, não aviso

Quase todas as receitas trazem o acompanhamento escrito lá dentro; as que não trazem levam
`needsSide` (Q14). O cartão diz isso **na mesma linha dos outros factos e com o mesmo peso** — sem
ícone, sem cor, sem badge, e sem componente próprio.

A distinção com a antecedência de preparação é de propósito: "de véspera" é acentuado porque **muda
o que se tem de fazer ontem**, e quem não reparar chega tarde. "Pede acompanhamento" não muda nada
no momento em que se lê — é contexto para quem está a montar a semana, e a app não tem opinião sobre
se isso é problema. Tratá-lo como aviso seria dizer que uma receita está incompleta, e não está: há
pratos que se comem com coisas diferentes conforme o dia, e as costelas no forno são um deles.

Também **não filtra**: não há filtro de "só refeições completas". Um filtro obrigaria a decidir por
quem planeia, e o valor aqui é só não ser surpreendido.

#### A marca de autor aparece por ausência

O cartão diz de quem é a receita — *Família*, *Site*, *Nossa* — com o ícone do painel e a palavra do
critério, **na mesma linha e com o mesmo peso dos outros factos**. Mesma regra do "pede
acompanhamento", e pela mesma razão: é informação e não aviso.

**Não aparece no que foi gerado**, e é isso que a torna útil. Hoje 231 das 233 receitas são
`gerada`; marcá-las seria escrever a mesma palavra em todo o lado e não distinguir nada. Marcada
fica a exceção — a que veio dos sogros, a que se tirou de um site, a que é nossa. **A ausência da
marca passa a ser a informação:** um cartão limpo quer dizer "escrita por um modelo, nunca cozinhada
por ninguém desta casa".

Fica **em último** na linha dos factos porque é o único que não é sobre cozinhar. Os outros
respondem a "quanto tempo, para quantos, preciso de mais alguma coisa"; este responde a "de onde
veio", e essa pergunta faz-se depois.

Mostra o **nome do critério e não o `source.author`**. O autor é texto livre: "Sogros" cabe,
"The Golden Grace Kitchen" parte o cartão em duas linhas. O nome completo está no crédito do ecrã
de detalhe (spec 002), que é onde há espaço para ele. E o ícone é o mesmo do painel de triagem de
propósito — quem escolheu *Autor › Site* no filtro reconhece o globo no cartão.

#### Planear a partir do cartão

O cartão tem um **"+" no canto da imagem** que abre a escolha de dia e bloco — a mesma do detalhe
(spec 002). Navegar a lista e decidir ali que aquilo é o jantar de quinta é o gesto normal de quem
está a montar a semana, e obrigá-lo a ir ao planeamento abrir o seletor por bloco é trocar a lista
inteira, com filtros e ao tamanho de ler, por uma grelha curta dentro de um painel.

É permanente e não revelado ao toque: num tablet não há hover, e uma ação escondida obrigaria a um
toque só para descobrir que existe. Fica por cima da fotografia, que é a única zona do cartão sem
informação — o nome, o tempo e as labels não perdem largura nenhuma.

Abrir o detalhe continua a ser o resto do cartão.

### Filtros

Barra de filtros no topo, sempre visível:

- **Duração** — intervalos (até 30min, 30–60min, mais de 1h)
- **Método** — forno, tacho, frigideira, grelhador, air fryer, micro-ondas, sem confeção.
  "Hoje não me apetece ligar o forno" é uma coisa que se pensa mesmo
- **Peso** — leve, equilibrado, substancial
- **Autor** — de quem é a receita: nossa, família, amigos, livro, site, vídeo, outra, gerada
- **Labels** — seleção múltipla a partir de `data/taxonomies/labels.json`

Os filtros combinam-se entre si: dentro do mesmo tipo somam-se (OU), entre tipos restringem-se (E).
Um estado de "sem resultados" explica que filtros estão ativos e oferece limpá-los.

#### O filtro de autor agrupa por tipo de fonte, não pelo nome escrito

Chama-se **Autor** porque é a palavra da pergunta que se faz na cozinha — "de quem é esta receita?".
Mas há duas coisas no schema que respondem a essa pergunta, e só uma delas serve para filtrar:

- **`source.kind`** é vocabulário fechado — oito valores — e é **este** que o filtro usa.
- **`source.author`** é texto livre e serve para creditar a fonte no rodapé do detalhe (spec 002).
  Não filtra: um filtro sobre texto livre tem tantas opções quantas as receitas, e "Sogros",
  "sogros" e "Casa dos sogros" seriam três coisas diferentes.

No ecrã isto não se nota — o painel diz *Autor* e por baixo estão *Família*, *Livro*, *Site*. No
código nota-se, e por isso o critério lá dentro chama-se `proveniencia` e não `autor`: a palavra
precisa fica onde é precisa, e `author` continua a ser só o campo do crédito.

Enquanto o catálogo era todo gerado isto não tinha uso. Passa a ter à medida que entram receitas de
origens diferentes, e é aí que "apetece-me uma das nossas" ou "aquela que os sogros deram" deixa de
se responder a percorrer a grelha.

Uma receita **sem** `source.kind` não responde a nenhum autor — mesma regra do peso. Um filtro que
adivinha de onde veio uma receita é pior do que um filtro que não a encontra.

### Favoritos: um coração na barra, não uma subtab

Interruptor no topo do catálogo, ao lado do "Apetece-me algo": ligado, mostra só as favoritas;
desligado, mostra tudo. Cruza-se com os outros filtros como qualquer um deles — ligado com "forno"
escolhido dá as favoritas de forno.

**Não está no painel "Apetece-me algo"**, e é a diferença que a conversa 2 já tinha apontado: um
favorito é um **juízo** que não caduca, não uma apetência de hoje. Um critério de painel pergunta
"o que te apetece agora"; o coração responde "aquelas de que já gostas". São duas perguntas
diferentes e só uma delas se faz em dois níveis de mosaicos.

Consequências, todas pequenas e todas deliberadas:

- Escreve nos **mesmos filtros** que o painel, e não num estado ao lado: senão a contagem do painel
  prometia dezassete receitas para mostrar duas.
- O **"Limpar" do painel não o desliga.** Limpar o que está noutro ecrã apaga uma escolha que quem
  carregou não está sequer a ver. O "Limpar tudo" da barra de pastilhas, esse, limpa mesmo tudo.
- O vazio tem **duas mensagens**: "ainda não há favoritos" quando o coração está sozinho, e "nenhum
  favorito com estes filtros" quando há mais alguma coisa ligada. Mandar tirar um filtro a quem só
  carregou no coração é mandar procurar um filtro que não existe.

### Subtabs: não há nenhuma

Esta secção listava três — **Todas**, **Favoritos** e **Histórico** — e ficaram zero. Não foi uma
decisão sobre subtabs; foi cada uma das outras duas descobrir que não era uma vista do catálogo.

**O histórico saiu para um destino próprio da navegação** (spec 008). Como subtab era uma lista de
receitas filtrada por "já fiz", e aí seria de facto uma vista do catálogo. Com datas e contagens
deixou de ser: cada linha é uma refeição, a mesma receita aparece cinco vezes, e a ordem é
cronológica e não alfabética. Fechou a pergunta 3 da conversa 8.

**Os favoritos passaram a um coração na barra de filtros**, na secção anterior. Pelo motivo oposto:
não são *demasiado* diferentes do catálogo, são a mesma vista mais estreita. Uma subtab é um sítio
onde se entra e de onde se sai; um favorito é um estreitamento do que já se está a ver, como
qualquer outro filtro.

Sobra o catálogo, que nunca precisou de se chamar "Todas" para ser o que é.

**Favoritos e histórico não são duas vistas da mesma coisa** (conversa 2). O favorito é um **juízo** — "gosto disto", e não
caduca. O histórico é um **facto** — "fiz isto a 12 de agosto", e acumula-se. Um existe sem o outro:
há receitas que se adoram e nunca se fizeram, e coisas que se fazem todas as semanas por hábito sem
gostar particularmente delas. Por isso são ficheiros separados, com formas diferentes, e não uma
lista com um sinalizador.

### Abrir uma receita

Tocar num cartão abre o pop-up de detalhe (spec 002). O estado do catálogo — filtros, coração,
posição do scroll — mantém-se, para que fechar o pop-up devolva exatamente ao mesmo sítio.

## Critérios de aceitação

- [ ] A grelha mostra todas as receitas de `data/recipes/` sem alterações de código
- [ ] Um cartão mostra thumbnail, nome, duração, rendimento e até 3 labels
- [ ] Um cartão de receita não gerada mostra de quem é; um de receita gerada não mostra nada
- [ ] Uma receita com antecedência de preparação mostra-o no cartão; uma sem, não mostra nada
- [ ] Filtrar por duração, método, peso, autor e labels devolve o subconjunto correto
- [ ] Filtros de tipos diferentes combinam-se com E; do mesmo tipo, com OU
- [ ] Uma receita sem `source.kind` não aparece sob nenhum autor
- [ ] Existe estado de "sem resultados" com ação de limpar filtros
- [ ] O coração mostra só as favoritas, e cruza-se com os outros filtros
- [ ] O coração conta para a contagem do painel "Apetece-me algo"
- [ ] O "Limpar" do painel não desliga o coração
- [x] O histórico tem destino próprio e ordena por data mais recente — ver spec 008
- [x] O "+" do cartão planeia a receita sem abrir o detalhe nem sair da lista
- [ ] Fechar o detalhe devolve à mesma posição de scroll e aos mesmos filtros
- [ ] Todos os alvos de toque têm pelo menos 56×56px
- [ ] A grelha funciona offline depois da primeira carga

## A escala para que isto é desenhado

**Uma centena de receitas ou mais** (conversa 2). Não é detalhe: com trinta, a grelha inteira cabe em
dois ecrãs e os filtros quase não fazem falta; com cento e cinquenta, sem filtros não se encontra
nada. Duas consequências:

- **A pesquisa por texto entra.** Esteve fora de âmbito com o argumento de que quem sabe o nome já
  sabe o que quer cozinhar. Isso aguenta-se com trinta receitas e não com cento e cinquenta — quem se
  lembra que existe um arroz de pato não percorre vinte e cinco linhas de grelha para lá chegar.
  **Mas não é a primeira coisa do ecrã:** a pesquisa resolve *ir buscar* o que já se tem na cabeça, e
  os filtros resolvem *decidir* quando não se tem. Na cozinha é quase sempre a segunda.
- **A ordenação por omissão passa a decidir quase tudo.** Cabem oito cartões sem rolar, e na maior
  parte das vezes o primeiro ecrã é o único ecrã. Por que critério ordena continua por decidir —
  perguntas 2 e 3 da conversa 2.

## Fora de âmbito

- Ordenação manual
- Criar ou editar receitas a partir da app (M2)

## Questões em aberto

- Q2 — direção visual, incluindo o formato da thumbnail

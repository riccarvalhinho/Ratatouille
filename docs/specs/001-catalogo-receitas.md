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
- label de dificuldade
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

### Filtros

Barra de filtros no topo, sempre visível:

- **Duração** — intervalos (até 30min, 30–60min, mais de 1h)
- **Método** — forno, tacho, frigideira, grelhador, air fryer, micro-ondas, sem confeção.
  "Hoje não me apetece ligar o forno" é uma coisa que se pensa mesmo
- **Peso** — leve, equilibrado, substancial
- **Proveniência** — de quem é a receita: nossa, família, amigos, livro, site, vídeo, outra, gerada
- **Labels** — seleção múltipla a partir de `data/taxonomies/labels.json`

Os filtros combinam-se entre si: dentro do mesmo tipo somam-se (OU), entre tipos restringem-se (E).
Um estado de "sem resultados" explica que filtros estão ativos e oferece limpá-los.

#### A proveniência filtra pelo tipo de fonte, não pelo autor

Sai de `source.kind`, que é vocabulário fechado. **Não sai de `source.author`**, que é texto livre:
um filtro sobre texto livre tem tantas opções quantas as receitas, e "Sogros", "sogros" e "Casa dos
sogros" seriam três. O autor continua a ver-se onde interessa — no crédito do ecrã de detalhe
(spec 002).

Enquanto o catálogo era todo gerado isto não tinha uso. Passa a ter à medida que entram receitas de
origens diferentes, e é aí que "apetece-me uma das nossas" ou "aquela que os sogros deram" deixa de
se responder a percorrer a grelha.

Uma receita **sem** `source.kind` não responde a nenhuma proveniência — mesma regra do peso. Um
filtro que adivinha de onde veio uma receita é pior do que um filtro que não a encontra.

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
- [ ] Uma receita com antecedência de preparação mostra-o no cartão; uma sem, não mostra nada
- [ ] Filtrar por duração, método, peso, proveniência e labels devolve o subconjunto correto
- [ ] Filtros de tipos diferentes combinam-se com E; do mesmo tipo, com OU
- [ ] Uma receita sem `source.kind` não aparece sob nenhuma proveniência
- [ ] Existe estado de "sem resultados" com ação de limpar filtros
- [ ] O coração mostra só as favoritas, e cruza-se com os outros filtros
- [ ] O coração conta para a contagem do painel "Apetece-me algo"
- [ ] O "Limpar" do painel não desliga o coração
- [x] O histórico tem destino próprio e ordena por data mais recente — ver spec 008
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

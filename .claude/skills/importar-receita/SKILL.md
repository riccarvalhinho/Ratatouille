---
name: importar-receita
description: Importar uma receita para o catálogo a partir de um link de site, um link de vídeo, um áudio a descrever a receita, uma fotografia de um livro, ou texto colado. Extrai a metadata toda, pergunta o que faltar, e grava em data/recipes/ depois de validado. Usar sempre que o utilizador der uma receita para acrescentar, seja em que formato for.
---

# Importar uma receita

Transforma qualquer fonte num ficheiro em `data/recipes/` que cumpre o schema — **sem buracos
silenciosos**. O que não se conseguir extrair é perguntado; o que ficar por responder deixa a receita
em rascunho com o buraco declarado.

Ler primeiro `docs/specs/007-importador-de-receitas.md` e `docs/product/metadata-receitas.md`.

## Antes de começar: a rede

**As sessões de Claude Code não conseguem abrir sites de receitas** — o proxy bloqueia-os. Testado
com `curl` e com WebFetch. Isso muda o primeiro passo consoante a fonte:

| Fonte | Como obter o conteúdo |
|---|---|
| Áudio a descrever a receita | Já chega transcrito. É a fonte mais fácil — começar por aqui |
| Texto colado | Direto |
| Fotografia de livro ou caderno | Ler a imagem diretamente |
| **Link de site ou de vídeo** | **Actions → "Importar receita de um link"**, com o URL. O runner tem internet, recolhe, e faz commit em `data/inbox/`. Depois é só ler o ficheiro |

Nunca fingir que se leu uma página que não se conseguiu abrir. Se o link não abrir, dizer e usar o
workflow.

### Vídeo

O workflow instala o `yt-dlp` e traz **metadados, descrição e transcrição das legendas**. Em vídeos
de cozinha a receita está quase sempre num dos dois: escrita na descrição, ou dita em voz alta e
apanhada pelas legendas automáticas.

Cuidado com as legendas automáticas: **quantidades mal ouvidas são o erro típico** — "cento e
cinquenta" pode vir "150" ou "cinquenta". Confirmar sempre as quantidades de uma transcrição.

O Instagram é o caso mais difícil: bloqueia leitura anónima. Se falhar, pedir a legenda copiada ou um
áudio a descrever.

## O processo

### 1. Extrair

Da fonte, tirar: nome, ingredientes com quantidades, passos, tempos, doses ou rendimento,
equipamento, e origem de cozinha.

**As instruções são sempre reescritas, nunca copiadas.** Uma lista de ingredientes é facto e não tem
direitos de autor; o texto das instruções de outra pessoa tem, e este repositório é público.

Escrever também o campo `narrative`: a receita em texto corrido, **na nossa própria redação**. É a
rede de segurança da importação.

### 2. Corresponder os ingredientes

```bash
npm run import:match -- "600 g de batata" "1 cebola picada" "200 g de tofu fumado"
```

Devolve três grupos:

- **resolvidos** — usar tal como estão
- **a confirmar** — o nome canónico aparece mas sobraram palavras. Perguntar ao utilizador
- **desconhecidos** — bloqueante. Ou se mapeia para um existente, ou se acrescenta um novo a
  `data/taxonomies/ingredients.json`. **Nunca inventar uma referência**

Ao acrescentar um ingrediente novo, preencher `aisle`, e `unitGramsPerUnit` se for vendido à unidade
— sem isso a lista de compras não consegue somar "2 cebolas" com "200 g de cebola".

### 3. Perguntar o que falta

Escrever o rascunho para um ficheiro e correr:

```bash
npm run import:save -- /tmp/rascunho.json
```

Se faltar algo bloqueante, ele recusa e diz o quê. As perguntas vêm já escritas e por ordem de
impacto — fazer as bloqueantes primeiro.

Regras ao perguntar:

- **Duas ou três de cada vez**, nunca um questionário
- **Com a melhor sugestão já preenchida** — confirmar é mais rápido do que escrever
- **"Não tenho" é resposta válida.** Passar esse campo como argumento ao gravar:
  `npm run import:save -- /tmp/rascunho.json timing.prepMinutes`
- **Nunca inventar em silêncio.** Nutrição estimada leva `method: "estimado"`

### 4. Gravar e validar

```bash
npm run import:save -- /tmp/rascunho.json
npm run validate
```

O `import:save` grava em `data/recipes/<id>.json` e decide sozinho o `status` e os `gaps`. O
`validate` confirma o schema e a integridade referencial.

### 5. Procurar a fotografia

**Nunca copiar a fotografia da fonte.** Uma foto de receita num site é obra protegida como o texto, e
este repositório é público. O `imageUrl` do que foi recolhido serve de referência, não de origem.

A melhor via é fotografia própria, tirada quando se cozinha — aí `imageCredit` leva
`{ "license": "própria" }`. Não havendo, procura-se nos bancos de licença livre.

**O proxy da sessão bloqueia os bancos todos**, tal como bloqueia os sites de receitas — Commons e
Openverse respondem 403 a um `curl` daqui. Portanto o caminho é o mesmo do passo 1:

**Actions → "Buscar imagens de licença livre"**, com `receitas` = o id, `consulta` = o termo **em
inglês**, e `ramo` = o ramo de trabalho. O runner procura, descarrega para `media/recipes/`,
preenche `image` e `imageCredit`, valida e faz commit.

O `npm run import:image -- "caldo verde"` continua a servir para espreitar candidatas quando houver
rede; daqui vai dizer que todos os bancos falharam, e isso é o esperado.

**A `consulta` decide as duas metades: o que se procura e o que se aceita.** O classificador exige
que o título do ficheiro contenha o termo inteiro e seguido — é o que impede um biryani de entrar
como "Arroz de frango". Um nome de receita descritivo ("Costelas no forno") não aparece em título
nenhum do Commons, portanto **sem `consulta` não passa nada**. Dar o nome do prato em inglês, do
mais específico para o mais geral: `roasted pork ribs` → `pork ribs`.

Quando o resumo disser "N candidatas, nenhuma convincente", foi o classificador a reprovar, não a
falta de resultados — vale a pena uma segunda tentativa com um termo mais largo.

**A atribuição tem de ficar em `imageCredit`**; sem isso a licença não é cumprida e o ecrã de
detalhe mostra-a a quem vê a foto. E uma máquina não sabe se a fotografia mostra o prato certo:
**confirmar a olho antes do merge.**

Ficar sem imagem é resultado aceitável — a app mostra um marcador. Não vale a pena forçar nem
inventar.

### 6. Mostrar o preview

```bash
npm run import:preview -- costelas-no-forno
```

Escreve a receita como ela vai aparecer no ecrã de detalhe. **Mostrar sempre o resultado ao
utilizador** antes do commit: é a última oportunidade de apanhar o que passa no schema e continua
errado — um título de passo que repete o texto, uma nota de ingrediente que devia ser quantidade,
um tempo que não bate certo com o que a receita diz, uma quantidade estimada que ficou absurda.

Ler o JSON em voz alta não serve para isto, e abrir a app custa um build.

### 7. Commit

Uma receita nova é um commit. Dizer ao utilizador o que ficou por preencher e o que foi estimado.

Uma receita sem imagem funciona — a app mostra um marcador. Não vale a pena forçar.

## O acompanhamento faz parte da receita — por omissão, não por obrigação

**Uma receita de prato principal deve dar uma refeição.** Os ingredientes do acompanhamento vão na
mesma lista de `ingredients`; os passos vão entre os do prato principal. O objetivo é não ter de
planear prato + acompanhamento a cada refeição da semana — e como a maior parte das receitas "de
prateleira" já vem com um acompanhamento óbvio, na maior parte dos casos isto sai de graça.

Se a fonte não disser com que acompanhamento se serve mas o prato pedir claramente um,
**escolhe-se e diz-se ao utilizador qual foi**. A escolha segue o prato: um grelhado leva batata e
salada, um guisado leva arroz ou puré.

**Mas não se força.** Há três casos em que a receita fica como está, e nenhum é falha:

1. **O prato já é a refeição.** Uma massa, um arroz malandro, um caril que já traz o arroz. Não há
   nada para acrescentar.
2. **A receita foi ditada por alguém.** Família, ou receita própria. Escreve-se como foi dada —
   inventar um acompanhamento é pôr palavras na boca de quem a deu. Pergunta-se se querem um; não
   se acrescenta em silêncio. É o caso das **costelas no forno**: são costelas, e o que se come com
   elas muda conforme o dia.
3. **O prato come-se com muita coisa e nenhuma é mais canónica.** Forçar uma escolha aqui é fingir
   uma decisão que ninguém tomou.

**Um acompanhamento a mais é pior do que nenhum.** Vai para a lista de compras na mesma, e
compra-se comida que ninguém vai cozinhar. Na dúvida entre acrescentar e deixar, deixa-se — o
planeamento já aceita mais do que uma receita por bloco, portanto pôr uma salada ao lado de um
prato incompleto é um gesto que já existe na app e custa um toque.

**Quando se deixa, marca-se: `needsSide: true`.** É a única coisa que a receita tem de fazer a
seguir. O campo só se escreve na exceção — uma receita que dá uma refeição não o leva, tal como uma
receita revista não leva `status`. O cartão e o detalhe mostram-no como facto e não como aviso
(spec 001), portanto marcar não é admitir que a receita está incompleta: é dizer ao próximo que
abre o catálogo o que já se sabia ao escrevê-la.

**Não marcar é que é erro.** Uma receita que pede acompanhamento e não o diz só se descobre com a
carne no forno — e a lista de compras já foi feita sem ele.

**Os passos entrelaçam-se, não se empilham.** É aqui que isto se faz mal. O acompanhamento não vai
todo para o fim da lista de passos: vai para onde pertence no tempo real da cozinha, que quase
sempre quer dizer **começar antes**, porque o arroz e a batata demoram mais do que o peixe.

| | Mau | Bom |
|---|---|---|
| Passo 1 | Grelhar o peixe | Pôr o arroz ao lume |
| Passo 2 | Fazer o molho | Grelhar o peixe |
| Passo 3 | Cozer o arroz | Fazer o molho e servir |

O mau está completo e é inútil: quem o seguir come peixe frio com arroz quente. O modo cozinha
mostra um passo de cada vez, portanto a ordem dos passos **é** a ordem em que se cozinha — não há
onde ler à frente.

Duas consequências a aceitar de olhos abertos: os tempos sobem (a receita passou a descrever mais
trabalho, que já existia mas estava noutro ficheiro), e o mesmo acompanhamento aparece dentro de
várias receitas e às vezes também sozinho. A redundância é o preço de abrir uma receita e ter lá a
refeição inteira.

E, a somar aos três casos de cima, **sopas e sobremesas nunca levam acompanhamento**: uma sopa é a
refeição ou é entrada de outra coisa, e uma sobremesa não acompanha nada. Se pedirem pão, diz-se no
passo.

## Ingredientes vetados

Três coisas nunca entram numa receita deste catálogo, e não é preferência de escrita — é decisão de
quem come.

- **Banha de porco.** Onde a receita tradicional a pede — rojões, migas, filhoses —, usa-se
  **azeite, manteiga ou óleo**, conforme o prato. O prato mantém-se, muda a gordura. `banha` não
  existe em `data/taxonomies/ingredients.json` e **não se acrescenta**: sem entrada na taxonomia, a
  regra é verificável pelo validador em vez de depender de quem escreve se lembrar dela.
- **Fígado**, em qualquer forma.
- **Farinheira.**

Nos dois últimos não há substituição. Se o prato for definido pelo ingrediente — iscas, ovos com
farinheira —, **o prato não se importa**; diz-se porquê. Se o ingrediente for só um dos muitos de um
prato que existe sem ele (a farinheira num cozido), escreve-se a receita sem ele e nota-se em
`notes`.

Se alguma vez aparecer um pedido para importar uma receita que os leve, **perguntar** em vez de
decidir sozinho — pode ser uma receita de família, e aí a decisão é de quem a deu.

## Como se escrevem os passos

**Passos ao nível de tarefa: uma ação e a espera que lhe pertence.** Dois limites, e nenhum é de
gosto. Em baixo, **o título é o teste**: se o título disser tudo o que o texto diz, o passo é pequeno
de mais e junta-se ao vizinho — "junte as batatas e a água" seguido de "deixe cozer" é um passo, não
dois. Em cima manda o temporizador: um passo tem **uma** duração e **um** `passive`, portanto duas
esperas seguidas nunca cabem no mesmo passo.

**O título e o texto escrevem-se um a saber do outro.** O título leva o verbo e o objeto; o texto leva
só o que o título não diz — o como, o até quando, a ressalva. Se der para ler os dois seguidos e ouvir
a mesma coisa duas vezes, um dos dois está mal escrito.

| | Mau | Bom |
|---|---|---|
| Título | Temperar o frango | Temperar e alourar o frango |
| Texto | Tempere o frango com sal e pimenta. | Sal e pimenta nas coxas, depois alourar no azeite de todos os lados. Retirar e reservar. |

O mau repete o título e parte em dois uma coisa que é uma. O bom diz coisas diferentes em cada linha.

Uma receita da internet vem com a granularidade que o autor quis, e muitas vêm no formato mau — uma
linha por gesto. **Reagrupar faz parte do trabalho de importar**, não é liberdade que se toma: sem
isso, o modo cozinha fica com o dobro dos passos e metade deles não diz nada.

Quando a fonte vier com passos a mais e a junção não for óbvia — dois que talvez sejam um, ou uma
espera que talvez seja duas — **perguntar**, em vez de decidir sozinho. É barato agora e caro depois.

## O que já é decidido e não se volta a discutir

- A fotografia procura-se sempre (passo 5) e nunca se copia da fonte. Sem imagem é resultado
  aceitável; sem `imageCredit` numa imagem que não é nossa, não é
- O preview do passo 6 mostra-se ao utilizador antes do commit, não depois

- Passos ao nível de tarefa, com título. Nunca parágrafos, nunca um passo por gesto. Ver a secção
  "Como se escrevem os passos" — é a regra mais fácil de aplicar mal.
- Tempo total inclui a preparação estimada; a antecedência (marinar, demolhar) é campo à parte e
  **não** entra no total
- `weight` atribui-se pela rubrica em `docs/product/metadata-receitas.md`, não a olho
- A origem de cozinha pergunta-se **sempre**, e "não tem" é resposta válida
- Não há campo de dificuldade nem de Nutri-Score
- Um prato principal leva o acompanhamento dentro da receita, com os passos entrelaçados — por
  omissão, não à força. Não se acrescenta a quem já é refeição, a quem foi ditado por alguém, nem a
  quem come com tudo; e nunca a sopas e sobremesas
- Banha, fígado e farinheira não entram. A banha substitui-se e o prato fica; os outros dois, quando
  definem o prato, tiram o prato

# Imagens das receitas

Como uma receita ganha fotografia, por ordem de preferência. E o que se aprendeu a fazer mal.

## O que correu mal da primeira vez

Em setembro de 2026 entraram 169 fotografias de uma vez, encontradas automaticamente, e **saíram
todas dois dias depois**. O ananás grelhado tinha uma foto de lentilhas com ketchup; a baba de
camelo, uma pessoa numa feira; o arroz de feijão, um prato de peixe. As que estavam certas eram
instantâneos amadores — um guisado dentro de uma slow cooker numa bancada com tupperwares.

Três causas, e vale a pena tê-las à frente porque nenhuma era inevitável:

1. **O classificador não classifica fotografias.** É um `includes()` sobre o **título do ficheiro**,
   e títulos do Commons e do Flickr são texto livre escrito por quem carregou. Um ficheiro chamado
   "grilled pineapple" pode ter lentilhas.
2. **Commons e Flickr são arquivos, não bancos de fotografia de comida.** Sem as chaves do Pexels e
   do Pixabay sobram só esses dois, e o resultado é fotografia de enciclopédia, não de ementa.
   (Medido depois: é a causa mais fraca das três — ver a secção seguinte. Com as chaves postas, o
   Commons acertou mais vezes do que o Pexels.)
3. **Ninguém olhou.** Foram commitadas 169 imagens sem uma única ser aberta.

**A regra que sai daqui: uma imagem entra depois de alguém a ver, e não antes.** Uma sessão de
Claude Code consegue ler ficheiros de imagem — `Read` sobre `media/recipes/<id>.jpg` mostra a
fotografia —, portanto não há desculpa técnica. Se forem muitas para olhar uma a uma, são muitas
para commitar.

## À segunda, com as chaves e com alguém a olhar

A segunda corrida trouxe 185 imagens, uma por receita, e desta vez foram abertas **as 185, uma a
uma**. Ficaram **83**; saíram **102**. Duas perguntas por imagem: é este prato, e a fotografia
presta.

| Banco | Trouxe | Ficou | |
|---|---|---|---|
| Commons | 38 | 23 | 61% |
| Flickr / Openverse | 84 | 35 | 42% |
| Pexels | 63 | 25 | 40% |
| **Total** | **185** | **83** | **45%** |

**O Commons ganhou aos bancos curados**, ao contrário do que esta página assumia. Faz sentido
depois de visto: o Pexels dá fotografia bonita do prato errado — para "bacalhau com natas" veio um
gratinado qualquer, para "polvo à lagareiro" veio polvo com batata a sério, mas por sorte. O
Commons erra por outro lado, dá fotografia feia do prato certo, e um prato certo mal fotografado
perde-se menos vezes do que um prato errado bem fotografado. **Prato com nome próprio: arquivo.
Descrição genérica em inglês: banco curado.**

**O Pixabay não colocou uma única imagem**, e não é a chave. `scoreCandidate` dá aos dois bancos
curados `20 + tamanho - posição`, o Pexels é consultado primeiro, e num empate ganha quem veio
primeiro. O Pixabay só entra quando o Pexels não devolve nada. Não vale a pena mexer nisto antes de
saber se faz falta.

As recusas repetem meia dúzia de padrões, e todos eles se veem numa imagem em dois segundos:
prato de outra cultura com o mesmo nome em inglês (arroz de pato → char siu chinês), ingrediente
cru em vez do prato (favas cruas, flocos de aveia, cabras vivas), um passo a meio em vez do
resultado (caramelo em forminhas, ovo cru na frigideira), cena em vez de prato (mesa de
restaurante, montra de pastelaria, uma ementa fotografada), marca ou pessoa no enquadramento, e
fotografia escura ou desfocada do prato certo.

**As receitas de família não levam foto de banco, por regra e não por falta.** As costelas dos
sogros ficaram sem imagem de propósito: uma fotografia de costelas parecidas punha o prato de outra
pessoa com o nome da família por cima.

---

## A ordem

### 1. Fotografia própria — a única que é fiel

Tirada quando se cozinha, com o prato como ele sai desta cozinha e não de outra. `imageCredit` leva
`{ "license": "própria" }` e mais nada.

**Para as receitas de família não há alternativa.** As costelas dos sogros não têm equivalente em
banco nenhum: uma fotografia de costelas parecidas não é a mesma receita, e o catálogo passaria a
mostrar o prato de outra pessoa com o nome da família por cima.

Como entra, hoje: o ficheiro vai para `media/recipes/<id>.jpg`, e a receita ganha

```json
"image": "media/recipes/costelas-no-forno.jpg",
"imageCredit": { "license": "própria" }
```

Antes de commitar: **1200px de largura no máximo e à volta de 200 KB**. Uma foto de telemóvel tem
3 a 5 MB e não pode entrar assim — ficam no Git para sempre.

### 2. Bancos curados: Pexels e Pixabay

Fotografia de estúdio, bem iluminada, com o prato ao centro. É o que resolve o problema da
qualidade — e **não resolve o da identidade**: são bancos onde se confia na consulta sem verificar,
portanto para "bacalhau com natas" vem um belo gratinado qualquer. São **ilustrações, não retratos**,
e é preciso ter isso presente ao aceitar cada uma.

Precisam de duas chaves gratuitas, e é a única coisa nesta lista que uma sessão de Claude Code não
consegue fazer sozinha.

| | |
|---|---|
| Pexels | conta em `pexels.com/api` → gerar chave |
| Pixabay | conta em `pixabay.com` → `pixabay.com/api/docs/` mostra a chave |

Depois, no GitHub: **Settings → Secrets and variables → Actions → New repository secret**, com os
nomes exatos **`PEXELS_API_KEY`** e **`PIXABAY_API_KEY`**. São lidos por
`.github/workflows/buscar-imagens.yml` e nunca tocam no código — o repositório é público (ADR 0005).

Sem as chaves o programa salta estes dois bancos em silêncio. **Confirmar que foram mesmo usados:**
o `imageCredit.license` de uma foto do Pexels diz "Pexels License". Se depois de configurar as
chaves não aparecer nenhuma, as chaves não estão a ser lidas.

### 3. Commons e Openverse

O que já cá está. Ganham quando o prato tem **nome próprio** que exista em arquivo — caldo verde e
pastéis de nata saíram certos por isso. Perdem em tudo o que só tem descrição genérica em inglês.

O classificador prefere-os aos bancos curados quando o título bate certo (25 pontos contra 20), e
isso está certo: um caldo verde verdadeiro vale mais do que uma sopa verde bonita.

### 4. Frame de um vídeo — só com licença, e quase nunca há

Uma receita importada de um link de Instagram ou de YouTube **não dá direito a usar a imagem**. Um
frame é obra derivada, e o conteúdo dessas plataformas é, por omissão, todos os direitos reservados.
Este repositório é público, portanto não há aqui zona cinzenta.

**A única exceção verificável:** um vídeo do YouTube publicado sob **Creative Commons BY** — o
YouTube expõe isso na descrição, e dá para filtrar a pesquisa por licença CC. Aí o frame é
utilizável, com `imageCredit` a creditar o canal e a licença, como em qualquer CC BY.

Fora disso, a receita segue os passos 1 a 3. **A legenda e os ingredientes de um vídeo são factos e
podem ser usados; a imagem é obra e não pode.** É a mesma distinção que já governa o texto das
instruções.

---

## Sem imagem é um resultado aceitável

A app mostra um marcador neutro e o cartão não se desalinha. **Uma fotografia errada é pior do que
nenhuma**, porque quem monta a semana à segunda-feira escolhe pelo cartão e não abre a receita — e
um prato de lentilhas com o nome "Ananás grelhado" por baixo mente-lhe antes de ele ter hipótese de
verificar.

## O peso no repositório

`media/recipes/` vive no Git para sempre — **e o que sai continua lá dentro**, na história. As 169
imagens da primeira corrida pesavam 34 MB e as 185 da segunda 27 MB; das segundas ficaram 83, a
**13 MB**. O que a app serve é 13 MB; o que o repositório carrega é a soma de tudo o que já entrou.

Continua confortável — o GitHub só avisa perto de 1 GB — mas é o número a recordar quando se falar
de Git LFS (questão Q8), e é a razão para não repetir corridas de 185 imagens sem as ver primeiro.
Com um catálogo de 185 receitas e uma imagem cada, o teto está nesta ordem de grandeza e não
precisa de LFS.

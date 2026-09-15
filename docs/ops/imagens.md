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
3. **Ninguém olhou.** Foram commitadas 169 imagens sem uma única ser aberta.

**A regra que sai daqui: uma imagem entra depois de alguém a ver, e não antes.** Uma sessão de
Claude Code consegue ler ficheiros de imagem — `Read` sobre `media/recipes/<id>.jpg` mostra a
fotografia —, portanto não há desculpa técnica. Se forem muitas para olhar uma a uma, são muitas
para commitar.

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

`media/recipes/` vive no Git para sempre. As 169 imagens que entraram e saíram pesavam **34 MB**, a
uma média de 201 KB cada. Isso é confortável — o GitHub só avisa perto de 1 GB — mas é o número a
recordar quando se falar de Git LFS (questão Q8). Com um catálogo de 185 receitas e uma imagem cada,
o teto está nessa ordem de grandeza e não precisa de LFS.

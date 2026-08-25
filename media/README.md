# media/

Imagens das receitas. Vivem no Git, portanto ficam aqui para sempre — comprimir antes de commitar.

## Convenção

- Caminho: `media/recipes/<id-da-receita>.jpg`, com o `id` igual ao da receita em `data/recipes/`
- Formato: JPEG (ou WebP)
- Largura máxima: 1200px
- Alvo de tamanho: cerca de 200KB

O validador (`npm run validate`) confirma que o campo `image` de uma receita aponta para um caminho
com o nome certo.

## De onde vêm

`.github/workflows/buscar-imagens.yml` procura em dois bancos de licença livre, **nenhum deles com
chave de API**: o Wikimedia Commons primeiro e o Openverse a seguir. Corre no GitHub Actions e não
numa sessão de Claude Code, porque o proxy dessas sessões bloqueia os bancos todos.

O Pexels, o Unsplash e o Pixabay ficaram de fora apesar de terem melhor fotografia de comida:
exigem conta e um segredo no repositório, e a licença própria de cada um é mais difícil de cumprir
num repositório público do que um CC com atribuição.

Nunca licenças **ND**: a app recorta com `object-fit: cover`, e recortar é uma derivação.

### O que aprendemos ao correr isto a sério

Duas passagens, e as duas erraram no mesmo sítio.

A primeira contava palavras do nome no título e trouxe um **biryani indiano** para o "Arroz de
frango", de um ficheiro chamado "Paparis, apas, achares e arroz biriani de frango". A segunda passou
a exigir todas as palavras significativas e no máximo três a mais, e trouxe um **prato africano com
banana e salsichas**, de "Arroz, frango, ovo, salsichas et mayonnaise" — passou por uma palavra.

Apertar o limiar para duas teria resolvido esses dois casos e mais nenhum: era ajustar a regra aos
exemplos. O problema real é outro. **"Arroz" e "frango" soltos são um sinal fraco**, porque metade
da cozinha lusófona os tem. Um nome que aparece *seguido* no título é uma afirmação sobre o prato;
as mesmas palavras espalhadas por uma legenda não são.

A regra final é uma só linha: **o título tem de conter o nome da receita inteiro e seguido.** O
custo é haver menos receitas com fotografia, e é o custo certo — a app mostra bem uma receita sem
fotografia, e uma fotografia errada mente.

### O que isto quer dizer na prática

Funciona bem para pratos com **nome próprio** — bacalhau com natas, caldo verde, arroz doce. Não
funciona para nomes descritivos que são só ingredientes juntos: "arroz de frango", "salada de grão
com atum", "pão recheado com chouriço e queijo". Para esses, ou se tira uma fotografia, ou se
escolhe uma à mão com `npm run import:image -- "o que procurar"`.

## Se o volume crescer

Ver questão Q8 em `docs/product/open-questions.md`. Se isto começar a pesar no repositório, a saída
é Git LFS — mas só quando for mesmo um problema, não antes.

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

Na primeira passagem apanhou três em quatro. A quarta — "Arroz de frango" — trouxe um **biryani
indiano**, de um ficheiro chamado "Paparis, apas, achares e arroz biriani de frango": casou "arroz"
e "frango", duas palavras certas e prato errado.

A regra que isso ensinou está em `tools/buscar-imagens.ts`: uma candidata só é aceite se o título
contiver o nome da receita **inteiro e seguido**, ou tiver todas as palavras significativas e não
mais de três palavras a mais. Quem não passa é recusado, não despromovido — **nenhuma imagem é
melhor do que a errada**, porque a app mostra bem uma receita sem fotografia e uma fotografia errada
mente.

Pratos compostos e sem nome próprio ("salada de grão com atum") não costumam ter nada nestes bancos.
É o resultado esperado, não uma falha.

## Se o volume crescer

Ver questão Q8 em `docs/product/open-questions.md`. Se isto começar a pesar no repositório, a saída
é Git LFS — mas só quando for mesmo um problema, não antes.

# media/

Imagens das receitas. Vivem no Git, portanto ficam aqui para sempre — comprimir antes de commitar.

## Convenção

- Caminho: `media/recipes/<id-da-receita>.jpg`, com o `id` igual ao da receita em `data/recipes/`
- Formato: JPEG (ou WebP)
- Largura máxima: 1200px
- Alvo de tamanho: cerca de 200KB

O validador (`npm run validate`) confirma que o campo `image` de uma receita aponta para um caminho
com o nome certo.

## Se o volume crescer

Ver questão Q8 em `docs/product/open-questions.md`. Se isto começar a pesar no repositório, a saída
é Git LFS — mas só quando for mesmo um problema, não antes.

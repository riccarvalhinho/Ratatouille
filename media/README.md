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

`.github/workflows/buscar-imagens.yml` procura em quatro bancos. Corre no GitHub Actions e não numa
sessão de Claude Code, porque o proxy dessas sessões bloqueia os bancos todos.

| Banco | Chave? | Papel |
|---|---|---|
| **Pexels** | sim, grátis | Primeiro quando há chave. É o que tem fotografia de estúdio |
| **Pixabay** | sim, grátis | Segundo com chave |
| **Wikimedia Commons** | não | Sempre. Cobre pratos com nome próprio |
| **Openverse** | não | Sempre, por último |

Nunca licenças **ND**: a app recorta com `object-fit: cover`, e recortar é uma derivação.

O **Unsplash** ficou de fora. A fotografia é a melhor das quatro, mas os termos da API pedem que as
imagens sejam servidas a partir deles e que cada descarga seja notificada — o que não combina com uma
app que tem de funcionar offline numa cozinha.

### Para ligar o Pexels e o Pixabay

Faz-se uma vez e são três minutos:

1. Conta gratuita em [pexels.com/api](https://www.pexels.com/api/) e em
   [pixabay.com/api/docs](https://pixabay.com/api/docs/).
2. No GitHub: Settings → Secrets and variables → Actions → New repository secret.
3. `PEXELS_API_KEY` e `PIXABAY_API_KEY`.

**A chave nunca vai para o repositório**, vai para os segredos, que é onde os segredos vivem. Sem
elas o workflow corre à mesma, só com os outros dois bancos.

### A atribuição tem de aparecer no ecrã

As licenças CC BY e CC BY-SA **exigem** crédito, e os termos das APIs do Pexels e do Pixabay pedem
que se diga de onde a imagem veio. Guardar isso só no JSON não era cumprir — desde a versão em que
os bancos curados entraram, o `imageCredit` é **mostrado por baixo da fotografia no detalhe da
receita**. Se alguma vez alguém tirar essa linha, tira também o direito de usar as imagens.

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

### Duas regras, porque há dois tipos de banco

O Commons e o Openverse são **arquivos**: cada ficheiro tem um nome que alguém escolheu para
identificar o que lá está. A regra acima aplica-se a eles.

O Pexels e o Pixabay são **bancos curados**: a legenda descreve a fotografia ("Cooked Food on White
Ceramic Plate"), não identifica o prato. Aí a afirmação sobre o prato é a **consulta**, e aceita-se a
ordem de relevância deles.

Isso tem um custo que vale a pena dizer em voz alta: para "bacalhau com natas" não vem bacalhau com
natas — vem **um belo gratinado**. É a troca que se faz por fotografia de estúdio. Quem quiser
apertar a pontaria dá a consulta à mão, e em inglês, que é como estes bancos indexam:

```bash
npm run imagens -- bacalhau-com-natas --query "cod gratin potatoes casserole"
```

### O que isto quer dizer na prática

Sem chaves, funciona para pratos com **nome próprio** — bacalhau com natas, caldo verde, arroz doce
— e não funciona para nomes que são só ingredientes juntos. Com chaves, há sempre uma fotografia
bonita, mas é preciso decidir se uma imagem representativa serve, ou se só serve o prato exato.

## Se o volume crescer

Ver questão Q8 em `docs/product/open-questions.md`. Se isto começar a pesar no repositório, a saída
é Git LFS — mas só quando for mesmo um problema, não antes.

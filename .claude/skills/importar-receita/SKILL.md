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
| **Link de site ou de vídeo** | **Pedir ao utilizador que cole o conteúdo da página**, ou que corra as ferramentas no computador dele, onde há rede |

Nunca fingir que se leu uma página que não se conseguiu abrir. Se o link não abrir, dizer e pedir o
texto.

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

### 5. Commit

Uma receita nova é um commit. Dizer ao utilizador o que ficou por preencher.

## Imagens

**Não descarregar fotografias de outras pessoas para o repositório.** É público, e vale a mesma
regra que se aplica ao texto das instruções. Questão Q8 em aberto.

Enquanto não estiver decidido: deixar `image` por preencher e perguntar se o utilizador tem uma
fotografia própria. Uma receita sem imagem funciona — a app mostra um marcador.

## O que já é decidido e não se volta a discutir

- Passos em bullets curtos, uma ação por passo. Nunca parágrafos
- Tempo total inclui a preparação estimada; a antecedência (marinar, demolhar) é campo à parte e
  **não** entra no total
- `weight` atribui-se pela rubrica em `docs/product/metadata-receitas.md`, não a olho
- A origem de cozinha pergunta-se **sempre**, e "não tem" é resposta válida
- Não há campo de dificuldade nem de Nutri-Score

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

### 5. Commit

Uma receita nova é um commit. Dizer ao utilizador o que ficou por preencher.

## Imagens

**Não copiar a fotografia da fonte.** Uma foto de receita num site é obra protegida como o texto, e
este repositório é público. O `imageUrl` do que foi recolhido serve de referência, não de origem.

Há duas vias legítimas:

```bash
npm run import:image -- "caldo verde"
```

Procura no **Openverse**, que só devolve conteúdo Creative Commons ou de domínio público, com a
licença e o autor em cada resultado. Escolhida uma, **a atribuição tem de ir para `imageCredit`** —
sem isso a licença não é cumprida.

A outra via, e a melhor: fotografia própria, tirada quando se cozinha. Aí `imageCredit` leva
`{ "license": "própria" }`.

Uma receita sem imagem funciona — a app mostra um marcador. Não vale a pena forçar.

## O que já é decidido e não se volta a discutir

- Passos em bullets curtos, uma ação por passo. Nunca parágrafos.
  > ⚠️ **Esta é a única linha desta secção que está a ser rediscutida.** A conversa 4, pergunta 8,
  > propõe passos ao nível de tarefa — uma ação **e a espera que lhe pertence** — mais um título por
  > passo. Enquanto não estiver decidido, continuar a aplicar a regra como está; não improvisar a
  > nova a meio. Ver `docs/conversas/04-ui-modo-cozinha.md`.
- Tempo total inclui a preparação estimada; a antecedência (marinar, demolhar) é campo à parte e
  **não** entra no total
- `weight` atribui-se pela rubrica em `docs/product/metadata-receitas.md`, não a olho
- A origem de cozinha pergunta-se **sempre**, e "não tem" é resposta válida
- Não há campo de dificuldade nem de Nutri-Score

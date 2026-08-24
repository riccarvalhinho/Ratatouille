# Spec 007 — Importador de receitas

**Milestone:** M1
**Estado:** Parcialmente implementada — ver "O que já existe" 
**Depende de:** `docs/product/metadata-receitas.md`, `data/schema/recipe.schema.json`

## Objetivo

Transformar um link — de um site de receitas ou de um vídeo — num ficheiro em `data/recipes/` que
cumpre a metadata do projeto, **sem buracos silenciosos**. O que não se conseguir extrair é
perguntado, não inventado nem deixado em branco.

É esta a feature que torna o catálogo possível. Sem ela, encher o catálogo é escrever JSON à mão,
e ninguém escreve JSON à mão vezes suficientes para ter cem receitas.

## O que já existe

| Peça | Onde | Estado |
|---|---|---|
| Correspondência de ingredientes ao vocabulário canónico | `app/src/domain/ingredient-matching.ts` | Feito, 21 testes |
| Deteção de lacunas e perguntas por ordem de impacto | `app/src/domain/gaps.ts` | Feito, 16 testes |
| CLI de correspondência | `npm run import:match` | Feito |
| CLI de gravação validada | `npm run import:save` | Feito |
| Protocolo de importação ponta a ponta | `.claude/skills/importar-receita/` | Feito |
| Obter conteúdo de um link | — | **Bloqueado**, ver abaixo |

### A limitação de rede

**As sessões de Claude Code não conseguem abrir sites de receitas** — o proxy de saída bloqueia-os,
confirmado com `curl` e com WebFetch. Não é limitação do código: as mesmas ferramentas correm bem
num computador com rede normal.

Consequência prática: para links, o conteúdo tem de ser colado pelo utilizador, ou as ferramentas
corridas localmente. Áudio, texto e fotografia não são afetados — chegam diretamente à sessão, e o
áudio é aliás a fonte mais fácil de todas.

## Fontes aceites

| Fonte | Como se extrai |
|---|---|
| Link de site de receitas | JSON-LD `schema.org/Recipe` quando existe — é estruturado e fiável. Senão, o HTML. |
| Link de vídeo | Transcrição/legendas, mais o título e a descrição, que é onde os ingredientes costumam estar. |
| Texto colado | Direto. |
| Fotografia de um livro ou caderno | Leitura direta da imagem. |
| Áudio a descrever a receita | Chega transcrito à sessão. É a fonte mais fácil: não tem HTML para limpar nem direitos de autor de permeio. |

O `schema.org/Recipe` merece nota à parte: a maior parte dos sites de receitas publica-o, e traz
ingredientes, passos, tempos e por vezes nutrição já estruturados. Quando existe, é a diferença
entre extrair com confiança e adivinhar a partir de HTML.

Vídeo é o caso mais difícil: quantidades ditas em voz alta são vagas ("um fio de azeite", "sal a
gosto") e nem sempre chegam a ser ditas. É de esperar que uma importação de vídeo produza mais
lacunas do que uma de site — o processo tem de lidar bem com isso, não fugir dele.

## O processo

```
link, texto ou foto
      │
      ▼
1. extrair          → conteúdo em bruto (JSON-LD, HTML, transcrição, OCR)
      │
      ▼
2. normalizar       → estrutura segundo data/schema/recipe.schema.json
      │  ingredientes → ingredientes canónicos da taxonomia
      │  instruções   → passos curtos, uma ação cada, reescritos
      │  tempos, labels, dificuldade, equipamento
      │  nutrição estimada, marcada como method: "estimado"
      │
      ▼
3. detetar lacunas  → o que não se conseguiu determinar entra em gaps[]
      │
      ▼
4. perguntar        → uma pergunta por lacuna, com a melhor sugestão já preenchida
      │
      ▼
5. gravar           → data/recipes/<slug>.json com status: "revisto"
      │
      ▼
6. npm run validate → chumba se alguma referência não existir
```

### Sobre o passo 4 — perguntar

É o passo que distingue isto de um extrator qualquer, e o que foi pedido explicitamente: **perguntar
o que falta para que não haja gaps**.

Regras:

- **Uma pergunta de cada vez**, com a melhor sugestão já preenchida. Confirmar é mais rápido do que
  escrever, e a maior parte das sugestões vai estar certa.
- **Nunca inventar em silêncio.** Se a nutrição foi estimada, fica marcada como estimada. Se a
  dificuldade foi inferida, pergunta-se.
- **Poder adiar.** Uma lacuna que fique por responder mantém a receita em `status: "rascunho"` com o
  campo listado em `gaps`. Melhor uma receita utilizável com buracos declarados do que um
  interrogatório que faz desistir a meio.
- **Perguntar por ordem de impacto.** Um ingrediente que não existe na taxonomia parte a lista de
  compras e tem de ser resolvido; o Nutri-Score pode esperar.

### Lacunas típicas, por ordem de importância

1. **Ingrediente sem correspondência na taxonomia** — bloqueante. Ou se mapeia para um existente, ou
   se acrescenta um novo a `data/taxonomies/ingredients.json`, com zona de supermercado e peso médio
   por unidade. Nunca se inventa uma referência.
2. **Quantidade em falta ou vaga** — "um fio de azeite" vira `azeite q.b.`; "meia chávena" precisa de
   conversão para gramas ou ml.
3. **Doses** — quantas pessoas. Raramente vem em vídeos.
4. **Tempos** — preparação e confeção separados, mais a antecedência (marinar, demolhar, levedar).
5. **Equipamento** — normalmente inferível dos passos ("leve ao forno" → forno).
6. **Labels e método** — inferíveis, mas confirmar. O tipo de cozinha pergunta-se sempre, e "não
   tem origem própria" é resposta válida, não um buraco.
7. **Nutrição** — estimada por omissão, marcada como tal.
8. **Imagem** — descarregada da fonte quando existe, senão fica por preencher.

## Interface

Ferramenta de linha de comandos (`tools/import-recipe.ts`), não ecrã na app.

A razão é prática: a importação faz-se sentado a um computador com um link à mão, não de pé na
cozinha com as mãos sujas. Meter isto na app custaria um ecrã inteiro de escrita de texto no tablet,
que é precisamente aquilo que o produto tenta evitar. Se um dia se justificar importar do tablet, a
lógica de normalização já estará separada da interface.

```bash
npm run import -- https://exemplo.pt/receita/bacalhau
npm run import -- https://video.exemplo/watch?v=xyz
npm run import -- --texto receita.txt
```

## Direitos de autor

As instruções são **reescritas**, nunca copiadas. Uma lista de ingredientes é facto e não tem
direitos de autor; o texto das instruções de outra pessoa tem. A fonte original fica sempre
registada em `source`, agora com `kind: "video"` e `author` para dar crédito ao canal.

## Critérios de aceitação

- [ ] Importa de link de site, link de vídeo, texto colado e foto
- [ ] Usa `schema.org/Recipe` quando o site o publica
- [ ] Todos os ingredientes ficam mapeados para ingredientes canónicos, ou é criado um novo
- [ ] Instruções reescritas em passos curtos, uma ação por passo
- [ ] Tempo de preparação, de confeção e antecedência ficam em campos separados
- [ ] Se a fonte não trouxer tempo de preparação, é estimado e entra no total
- [ ] O eixo de peso é atribuído pela rubrica, não inventado caso a caso
- [ ] Perguntado sempre se a receita tem origem de cozinha, aceitando "não tem" como resposta
- [ ] Nutrição estimada fica marcada com `method: "estimado"`
- [ ] Cada lacuna gera uma pergunta, com sugestão pré-preenchida
- [ ] Adiar uma pergunta deixa a receita em `status: "rascunho"` com o campo em `gaps`
- [ ] Responder a todas grava com `status: "revisto"`
- [ ] O ficheiro gerado passa em `npm run validate`
- [ ] A fonte fica registada, com autor no caso de vídeo
- [ ] Nada é inventado em silêncio

## Fora de âmbito

- Importar em lote a partir de uma lista de links
- Importar de sites atrás de login
- Traduzir receitas de outras línguas (avaliar quando aparecer o caso)
- Importar a partir do tablet

## Questões em aberto

- Q4 — rigor da informação nutricional; define se o passo 2 calcula ou estima
- Q8 — de onde vêm as imagens
- Q12 — a metadata em revisão pode acrescentar campos que o importador tem de preencher

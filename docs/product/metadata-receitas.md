# Metadata das receitas — para revisão

O formato das receitas foi definido em M0 e está aqui para ser revisto **antes** de existirem
receitas a sério e antes de o importador (spec 007) começar a produzir ficheiros. A altura de mudar
o formato é agora, com cinco receitas seed. Depois de haver duzentas, mudar o formato é migrar dados.

O contrato executável é `data/schema/recipe.schema.json`, validado em CI. Este documento explica o
**porquê** de cada campo e lista o que ainda está por decidir.

---

## O que já está definido

### Identidade

| Campo | Tipo | Notas |
|---|---|---|
| `id` | slug | Tem de ser igual ao nome do ficheiro. Validado. |
| `name` | texto | |
| `description` | texto | Uma ou duas frases. Opcional. |
| `image` | caminho | `media/recipes/<id>.jpg`. O validador confirma que o nome bate certo. |

> **Regra a ter presente:** renomear uma receita implica renomear o ficheiro **e** atualizar todas as
> referências em `data/planning/` e `data/state/`. O validador apanha referências órfãs, portanto o
> erro nunca passa despercebido — mas é trabalho manual. Foi uma troca deliberada: ids legíveis
> tornam os diffs do Git compreensíveis, o que vale mais do que ids opacos que nunca mudam.

### Classificação

| Campo | Tipo | Notas |
|---|---|---|
| `servings` | inteiro | Para quantas pessoas dá a dose declarada. |
| `difficulty` | `facil` · `medio` · `dificil` | |
| `labels` | lista de refs | Vocabulário fechado em `data/taxonomies/labels.json`, agrupado em tipo de prato, proteína, regime e ocasião. |

### Tempos

| Campo | Notas |
|---|---|
| `timing.prepMinutes` | Tempo ativo de preparação. |
| `timing.cookMinutes` | Tempo de confeção. |
| `timing.prepAhead` | Antecedência que **não** é tempo ativo: marinar, demolhar, levedar, arrefecer. Deliberadamente separada, porque somá-la aos outros tempos faria o bacalhau com natas parecer uma receita de 25 horas. |

### Ingredientes

Cada ingrediente é `{ ref, quantity, unit, note, optional }`, onde `ref` aponta para um ingrediente
canónico em `data/taxonomies/ingredients.json`. **Nunca texto livre.**

Esta é a decisão mais consequente de todo o formato. "2 cebolas", "1 cebola média" e "200 g de
cebola" têm de ser o mesmo ingrediente para a lista de compras conseguir somar. O ingrediente
canónico carrega o que torna essa soma possível: zona do supermercado, peso médio por unidade,
densidade, e se é coisa de despensa.

Unidades: `g`, `kg`, `ml`, `l`, `un`, `csopa`, `ccha`, `pitada`, `qb`.

### Passos

`{ text, durationMinutes, ingredientRefs }`. Texto curto, uma ação por passo — o planeamento
original é explícito: "por bullets e simplificado, nada de grandes parágrafos".

`durationMinutes` alimenta os temporizadores do modo cozinha. `ingredientRefs` permite mostrar os
ingredientes ao lado do passo, para não ser preciso voltar atrás a meio da confeção.

### Nutrição e proveniência

`nutrition` guarda calorias, macros e Nutri-Score, sempre com um campo `method` que distingue
`calculado` de `estimado` — para a app poder dizer "aproximado" em vez de fingir precisão.

`source` regista de onde veio a receita. As instruções são sempre reescritas, nunca copiadas: uma
lista de ingredientes é facto e não tem direitos de autor, o texto das instruções de outra pessoa tem.

---

## Alterações já feitas para suportar o importador

Estas duas decorrem diretamente do que o importador precisa de fazer, portanto foram implementadas
sem esperar por revisão.

### `status` e `gaps`

Uma receita importada raramente vem completa. Sem uma forma de o dizer, um ficheiro com buracos fica
em `data/recipes/` com o aspeto de estar pronto.

```json
"status": "rascunho",
"gaps": ["nutrition", "equipment", "timing.prepMinutes"]
```

- `status` — `rascunho` (importada, por rever) ou `revisto`. **Ausente significa `revisto`**: uma
  receita escrita à mão está revista por definição, por quem a escreveu.
- `gaps` — que campos o importador não conseguiu determinar. É a lista de perguntas que o processo
  de revisão vai fazer.

`npm run validate` conta os rascunhos e diz quantos são, sem chumbar — um rascunho é um estado
legítimo, não um erro.

### `source` para vídeo

`source.kind` passa a aceitar `video`, e ganha `author` para o canal ou autor. Um link de vídeo com
timestamp funciona no `url` tal como está.

---

## Propostas por decidir

Estão por implementar de propósito: são o meu palpite sobre o que vai faltar, e é isso que está em
revisão.

### P1 — Grupos de ingredientes e de passos

**Problema:** receitas com sub-preparações. No bacalhau com natas, o béchamel está lá dentro como
"Para o béchamel: derreta a manteiga…" escrito no meio do texto de um passo. Funciona por acaso.
Numa receita com massa e recheio, ou molho e prato, deixa de funcionar.

**Proposta:** um campo `group` opcional em cada ingrediente e em cada passo.

```json
{ "ref": "manteiga", "quantity": 50, "unit": "g", "group": "Béchamel" }
```

**Impacto:** o modo cozinha ganha secções, e a lista de ingredientes no detalhe deixa de ser uma
lista corrida de dezoito linhas. Custo baixo, ganho real. **Recomendo fazer.**

### P2 — `prepAhead` como lista

**Problema:** hoje é um objeto só. Uma receita pode precisar de duas antecedências independentes —
demolhar o bacalhau de véspera **e** deixar arrefecer duas horas depois de feito.

**Proposta:** passar a lista.

**Impacto:** baixo, e o cartão de receita já só mostra a maior. **Recomendo fazer**, é mais barato
agora do que depois.

### P3 — Rendimento que não são pessoas

**Problema:** `servings` é um inteiro de pessoas. "12 bolinhos", "1 bolo de 24 cm" ou "1 kg de
compota" não cabem lá. Sobremesas e pão partem isto quase sempre.

**Proposta:** manter `servings` como está, para o planeamento saber contar pessoas, e acrescentar um
`yield` de texto livre, opcional, para o que se mostra no detalhe.

**Impacto:** baixo. **Recomendo fazer**, porque o arroz doce já é um caso destes — e porque o
Cookidoo, com milhares de receitas, mostra "16 unidades" no ecrã de detalhe. Quem já enfrentou o
problema resolveu-o assim. Ver `docs/design/benchmark-bimby.md`.

### P4 — Conservação e sobras

**Problema:** planear refeições para uma semana precisa de saber o que aguenta. "Congela bem",
"3 dias no frigorífico", "come-se no próprio dia".

**Proposta:** `keeps: { fridgeDays, freezes, note }`.

**Impacto:** é a única destas propostas que abre uma funcionalidade nova em vez de arrumar uma
existente — cozinhar uma vez e comer duas vezes é metade do valor de planear a semana.
**Recomendo fazer**, mas é o que mais merece discussão.

### P5 — Temperatura de forno estruturada

**Problema:** "Leve ao forno a 200 °C" está dentro do texto do passo.

**Proposta:** um campo `temperatureC` no passo.

**Impacto:** só serviria para o modo cozinha mostrar a temperatura em destaque. O texto já resolve.
**Recomendo não fazer** — é estrutura a mais para benefício a menos.

### P6 — Alergénios

**Problema:** saber se um prato leva glúten, lactose ou frutos secos.

**Proposta:** **não** pôr na receita. Pôr no ingrediente canónico, em
`data/taxonomies/ingredients.json`, e derivar. Uma receita que leva farinha leva glúten, sem alguém
ter de se lembrar de o marcar.

**Impacto:** as labels de regime (`sem-gluten`, `sem-lactose`) passariam a ser calculadas em vez de
declaradas — hoje são declaradas à mão e por isso vão ficar erradas mais cedo ou mais tarde.
**Recomendo fazer, mas depois**: só vale a pena quando houver receitas que cheguem.

---

## Decisões a tomar

1. P1 a P4 entram? (a minha recomendação é sim para as quatro)
2. P4 em particular: interessa mesmo saber o que congela e quanto dura?
3. P6 fica para quando?
4. Falta algum campo que dês por ti a querer e não esteja aqui?

Depois de decididas, as alterações são feitas de uma vez: schema, tipos em `app/src/domain/types.ts`,
validador, e as cinco receitas seed.

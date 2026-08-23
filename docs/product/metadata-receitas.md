# Metadata das receitas

O formato das receitas, e o porquê de cada decisão. O contrato executável é
`data/schema/recipe.schema.json`, validado em CI; este documento explica-o.

**Estado:** fechado na conversa 1 (`docs/conversas/01-metadata-receitas.md`) e aplicado ao schema.
Sobra um pedaço com tema próprio: o vocabulário das labels declaradas
(`docs/conversas/07-vocabulario-labels.md`).

O princípio que orientou tudo foi **exaustividade**: prefere-se um formato rico a um formato mínimo,
desde que cada campo ganhe o seu lugar.

---

## Identidade

`id` (slug, igual ao nome do ficheiro), `name`, `description` opcional, `image`.

**`narrative`** — a receita em texto corrido, numa **transcrição nossa**. Nasceu de uma necessidade de
segurança do processo de importação: não perder informação ao converter para passos estruturados.
Como é texto escrito por nós e não copiado, não há questão de direitos de autor — e serve também para
quem prefira ler a receita seguida em vez de aos bocados.

> Renomear uma receita implica renomear o ficheiro **e** atualizar as referências em `data/planning/`
> e `data/state/`. O validador apanha referências órfãs, portanto o erro nunca passa despercebido.
> Foi uma troca deliberada: ids legíveis tornam os diffs do Git compreensíveis.

## Rendimento

`servings` (pessoas) e `yield` (texto livre: "30 bolachas", "1 bolo de 24 cm"). **Tem de existir pelo
menos um dos dois** — validado pelo schema.

`servings` deixou de ser obrigatório porque há receitas que rendem unidades e não pessoas. Uma caixa
de bolachas não se serve a quatro pessoas.

**As doses escalam, mas só por múltiplos simples.** As quantidades escalam; os tempos de forno e de
cozedura não. A restrição a múltiplos simples existe por causa dos ovos, que são discretos, das formas
de bolo, que têm o tamanho que têm, e do "q.b.", que não escala de todo.

## Classificação

**`labels`** — vocabulário fechado em `data/taxonomies/labels.json`. Dividem-se em duas famílias:

- **Derivadas** dos próprios dados — carne, peixe, leguminosas saem dos ingredientes
- **Declaradas** à mão — tipo de cozinha (italiano, indiano), ocasião, tipo de prato

A distinção importa porque tudo o que for declarado à mão acaba errado mais cedo ou mais tarde. O
vocabulário completo está por fechar.

**`methods`** — como se confeciona: forno, tacho, frigideira, grelhador, air fryer, micro-ondas, sem
confeção. Uma receita pode ter mais do que um.

Este campo nasceu de uma pergunta sobre equipamento — "o forno devia aparecer na lista?". A resposta
foi que o forno não interessa por se poder não ter um, interessa porque **salta à vista se se vai
usá-lo**. Isso é método, não equipamento. Resolve três coisas ao mesmo tempo: responde à pergunta sem
distorcer a lista de equipamento, alimenta a estimativa do peso, e torna-se filtrável — "hoje não me
apetece ligar o forno" é uma coisa que se pensa mesmo.

**`weight`** — `leve`, `equilibrado` ou `substancial`. Ver a rubrica mais abaixo.

**Não há campo de dificuldade.** Foi cortado: com método, tempo total, antecedência e número de
ingredientes já no formato, "médio" não acrescentava informação — era só mais um campo para preencher
errado.

## O eixo de peso

Responde à pergunta que se faz mesmo às sete da tarde: "hoje apetece-me algo leve".

**Não é Nutri-Score.** O Nutri-Score é um algoritmo para produtos embalados, medido por 100 g, e
responde a "isto é nutricionalmente bom?". Numa refeição dá resultados absurdos: uma salada com azeite
pontua mal pela gordura por 100 g, um refrigerante de dieta pontua bem.

**Não é uma fórmula sobre a nutrição.** Enquanto os valores nutricionais forem estimativas (Q4), uma
fórmula assente neles dá falsa precisão.

**É uma rubrica escrita, aplicada pelo importador.** O que torna isto sistemático não é ser calculado,
é serem os mesmos critérios todas as vezes, escritos e auditáveis. Critérios:

- **Método de confeção** — frito, gratinado ou com creme puxa para cima; grelhado, cozido a vapor ou
  cru puxa para baixo
- **Veículos de gordura e a sua quantidade** — natas, manteiga, queijo, banha, fritura
- **Proteína** — carne vermelha e enchidos para cima; peixe, leguminosas e ovos para baixo
- **Proporção de legumes** no total dos ingredientes
- **Calorias por dose**, quando existirem, como aferição e não como motor

**Sempre relativo ao tipo de prato.** Uma sobremesa compara-se com sobremesas. Sem isto, todas as
sobremesas ficam substanciais e o eixo deixa de informar.

**Três valores e não cinco**, porque com cinco os do meio viram ruído.

**Chama-se peso e não saúde.** "Saudável" é um juízo que convida à discussão — a manteiga é saudável?
— e não muda o que se cozinha hoje.

## Tempos

`prepMinutes` e `cookMinutes` entram no total. **A duração total inclui a preparação**, não só a parte
cronometrável: se a receita manda cortar os legumes, esse tempo conta. Quando a fonte não o traz, o
importador estima.

`prepAhead` é a antecedência que **não** é tempo ativo — marinar, demolhar, levedar, arrefecer — e por
isso **não entra no total**. Somá-la faria o bacalhau com natas parecer uma receita de 25 horas.

## Ingredientes

Lista única de `{ ref, quantity, unit, note, optional }`, onde `ref` aponta para um ingrediente
canónico. **Nunca texto livre** — é o que permite à lista de compras somar "2 cebolas" com "200 g de
cebola".

**Não há grupos de ingredientes.** Foi considerado e rejeitado: a lista é única, e as sub-preparações
são partes da preparação total do prato.

## Equipamento

Referências a `data/taxonomies/equipment.json`, onde cada item está marcado **uma vez** como `comum`
ou não. A app mostra só os não comuns.

O critério é "o que me pode impedir de fazer isto agora". Um tacho, uma faca e uma tábua não impedem
ninguém de nada. Um espiralizador, uma mandolina ou uma forma de silicone, sim. Marcar na taxonomia em
vez de decidir receita a receita evita repetir o mesmo juízo dezenas de vezes.

## Passos

`{ text, durationMinutes, temperatureC, passive, ingredientRefs }`. Texto curto, uma ação por passo.

É esta estrutura que alimenta o modo cozinha: um passo de cada vez, temporizador quando há duração,
ingredientes do passo à mão.

**`temperatureC` é estruturada e não enterrada no texto** porque a interface de execução tem de a
mostrar como dado — "Forno a 200 °C, 25 min" — ao lado do temporizador.

**`passive` distingue os passos em que se sai da cozinha** — levedar, arrefecer, assar sem mexer — dos
passos em que se fica a olhar. Um passo passivo deve avisar quando acaba; um ativo não precisa, e um
alarme só incomoda.

**O estado de execução não vive aqui.** Em que passo se vai, o que está concluído, o temporizador a
correr — isso é estado efémero da aplicação. Uma receita não sabe que ficou a meio na quinta passada.

## Nutrição

Por dose. O ideal é o painel completo — energia, proteína, gordura, gordura saturada, hidratos, fibra
e sal. O mínimo aceitável são só as calorias.

`method` distingue `calculado` de `estimado`, para a app poder dizer "aproximado" em vez de fingir
precisão. Qual usar por omissão é a questão Q4, ainda aberta.

O sal está em gramas, como nos rótulos portugueses. O Cookidoo mostra sódio em mg; sal = sódio × 2,5.

**Não há Nutri-Score.** Existia para responder a "isto é saudável", pergunta que o campo `weight`
passou a responder melhor e de forma mais útil.

## Estado e proveniência

`status` (`rascunho` ou `revisto`, ausente significa revisto) e `gaps` — o que o importador não
conseguiu determinar. Nada fica em branco em silêncio.

`source` com `kind` (incluindo `video`), `title`, `author` e `url`. As instruções são sempre
reescritas, nunca copiadas.

`notes` para notas pessoais: "a avó fazia com mais alho", "da última vez ficou salgado". Sem interface
por agora — escrevem-se à mão.

---

## Propostas rejeitadas

Ficam registadas para não voltarem sem argumento novo.

| | Proposta | Porquê não |
|---|---|---|
| P1 | Grupos de ingredientes e de passos | A lista é única; as sub-preparações são partes da preparação total |
| P4 | Conservação e sobras (congela? dura quanto?) | Demasiado para esta fase. Arquivada, não eliminada — se o planeamento semanal fizer sentir a falta, volta |
| — | Campo de dificuldade | Não acrescentava nada a método, tempo, antecedência e número de ingredientes |
| — | Nutri-Score | Substituído pelo eixo de peso, que responde melhor à pergunta real |
| — | Etiqueta "saudável" | Juízo que convida à discussão e não muda o que se cozinha hoje |

## Ainda por decidir

- **Vocabulário das labels declaradas** — `docs/conversas/07-vocabulario-labels.md`
- **Q4** — calcular a nutrição a partir dos ingredientes ou estimá-la
- **P2** — `prepAhead` como lista, para receitas que precisam de duas antecedências independentes.
  Levantada, nunca discutida
- **P6** — alergénios derivados do ingrediente canónico em vez de declarados na receita

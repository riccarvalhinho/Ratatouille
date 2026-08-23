# Conversa 1 — Metadata das receitas

**Estado:** Em curso
**Conduz:** Ricardo — há uma visão da estrutura para explicar
**Destino das decisões:** `data/schema/recipe.schema.json`, `docs/product/metadata-receitas.md`
**Prioridade:** Primeiro. A metadata determina o que a interface pode mostrar; desenhar ecrãs sobre
um formato que ainda vai mudar é desenhar duas vezes. E o importador (spec 007) não deve começar a
produzir ficheiros antes disto fechar.

## Porque existe

O formato foi definido em M0 a partir do documento de planeamento, mas nunca foi discutido. Há uma
visão do que é útil e de como isto se estrutura que ainda não está no repo.

E há uma janela: com cinco receitas, mudar o formato é editar cinco ficheiros. Com duzentas, é uma
migração.

## O que já está fechado

Não se rediscute sem motivo novo:

- Ingredientes são **referências** a `data/taxonomies/ingredients.json`, nunca texto livre. É o que
  torna a lista de compras possível (ADR 0002).
- Passos são bullets curtos, uma ação por passo. O benchmark do Cookidoo confirmou pela negativa.
- `status` e `gaps` existem para o importador nunca deixar buracos em silêncio.
- Nutrição traz sempre `method`, para distinguir calculado de estimado.

## O que está em cima da mesa

As cinco propostas de `docs/product/metadata-receitas.md`, com a minha recomendação:

| | Proposta | Recomendo |
|---|---|---|
| P1 | Grupos de ingredientes e passos ("para o béchamel") | Sim |
| P2 | `prepAhead` como lista, não objeto único | Sim |
| P3 | Rendimento que não são pessoas ("12 bolinhos") | Sim — o Cookidoo mostra "16 unidades" |
| P4 | Conservação e sobras (congela? dura quanto?) | Sim, mas é a que mais merece discussão |
| P5 | Temperatura de forno estruturada | Não — o texto do passo já resolve |
| P6 | Alergénios derivados do ingrediente canónico | Sim, mas mais tarde |

## As minhas perguntas de arranque

1. **Começa pelo que te falta.** Quando pensas numa receita tua e imaginas metê-la aqui, que campo é
   que já sabes que vais querer e não existe? Vamos por aí antes de eu defender as minhas propostas.

2. **"Dificuldade" é o campo mais vago que temos.** Fácil/médio/difícil — mas difícil porquê? Porque
   exige técnica? Porque há três coisas a acontecer ao mesmo tempo? Porque falha facilmente? Aposto
   que o que queres mesmo saber é "posso fazer isto a meio da semana, cansado?", que é outra coisa.

3. **A P4 é a única que abre funcionalidade nova.** Se a receita soubesse que congela bem e dura três
   dias, o planeamento podia dizer "faz o dobro na segunda e come outra vez na quinta". Isso é útil,
   ou é uma complicação que na prática nunca vais preencher?

4. **Ingredientes canónicos vão dar trabalho.** Cada receita nova pode obrigar a acrescentar
   ingredientes à taxonomia, com zona de supermercado e peso por unidade. É o preço da lista de
   compras. Quanto é que estás disposto a pagar? Há um caminho mais preguiçoso: aceitar texto livre
   e mapear só quando a lista de compras precisar.

5. **Uma receita tua tem coisas que uma receita de livro não tem** — "a avó fazia com mais alho",
   "da última vez ficou salgado", "o Rui não come coentros". Isso é um campo de notas, ou merece
   estrutura?

6. **Escalar doses (Q3).** Interessa mesmo poder fazer para 2 quando a receita é para 4, ou na
   prática fazes sempre a receita toda e guardas o resto?

## Registo da conversa

### Sessão 1 — 2026-08-23

O Ricardo abriu com a visão do que a metadata tem de cobrir. O princípio geral é **exaustividade**:
prefere um formato rico a um formato mínimo.

O que enumerou:

- **Thumbnail** da receita, como asset.
- **Ingredientes** com quantidade, unidade de medida, e que ingrediente é.
- **Utensílios, mas só os que valem a pena.** Panelas, tachos e colheres de pau não contam — são
  pressupostos. Contam um passador, um forno, um espiralizador, formas de silicone. O critério é "o
  que me pode impedir de fazer isto agora".
- **A receita em bruto, em texto corrido**, além dos passos estruturados.
- **Para quantas pessoas é**, com as quantidades correspondentes — porque uma das features é
  **ajustar as doses** para mais ou menos pessoas. As quantidades escalam; os tempos de forno e de
  cozedura, não.
- **Duração total**, que não é só o que é cronometrável (forno, cozedura) mas inclui a preparação
  toda. Se a receita de origem não trouxer esse tempo, estima-se na importação e entra no total.
- **Dificuldade.**
- **Labels muito para além do que existe hoje**, com o objetivo explícito de filtrar e agrupar mais
  tarde. Deu como exemplos: carne, peixe, saudável, pesado, fresco, "para grupos", sobremesa, doce, e
  **tipo de cozinha** — indiano, italiano, etc.

## Decisões tomadas

| Decisão | Estado | Onde vai parar |
|---|---|---|
| Escalar doses é uma feature, não um extra. Quantidades escalam, tempos não | Fechada — resolve a Q3 | `docs/product/open-questions.md`, spec 005 |
| A duração total inclui o tempo de preparação estimado, não só o cronometrável | Fechada | `recipe.schema.json` |
| Se a fonte não trouxer tempo de preparação, o importador estima | Fechada | spec 007 |
| Utensílios: só os que podem impedir de cozinhar, não os básicos | Fechada no princípio, mecanismo por decidir | `data/taxonomies/equipment.json` |
| Taxonomia de labels muito mais rica, incluindo tipo de cozinha | Fechada no princípio, vocabulário por decidir | `data/taxonomies/labels.json` |
| Guardar a receita em bruto em texto corrido | **Em conflito** — ver abaixo | — |

## Em aberto no fim da sessão 1

1. **Texto em bruto vs. direitos de autor.** Guardar o texto original de uma receita de outra pessoa
   num repositório público é exatamente o que o ADR sobre importação diz para não fazer. Falta
   perceber para que serve o texto corrido, para escolher a solução certa.
2. **Mecanismo para "utensílio que conta".** Proposta: uma marca `comum` na taxonomia de equipamento,
   em vez de uma decisão por receita.
3. **Vocabulário das labels.** Algumas das propostas são deriváveis dos dados (carne, peixe,
   saudável) e outras têm de ser declaradas (tipo de cozinha, "para grupos"). Falta separar.
4. **Escalar doses**: por qualquer número ou só por múltiplos simples? E o que fazer com ovos e
   com "q.b.".

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

### Sessão 2 — 2026-08-23

Respostas às três perguntas da sessão 1.

**Texto corrido — resolvido, sem conflito.** A necessidade era segurança do processo de importação,
não leitura. A solução é uma **transcrição nossa**, escrita por nós, com o grau de detalhe que
acharmos importante manter, e que também serve para ser lida. Como é texto nosso, não há questão de
direitos de autor.

**Equipamento — aceite.** Marcar cada equipamento uma vez na taxonomia em vez de decidir receita a
receita. Pedido um primeiro esboço quase exaustivo, para categorizar um a um.

**Labels — aceite a divisão entre derivadas e declaradas.** As declaradas passam a ter categorias.
Uma delas é o **tipo ou origem de cozinha** (italiano, indiano). O importador deve **perguntar** se a
receita tem uma origem própria ou se ela está ausente — a ausência é uma resposta válida, não um
buraco.

Sobre saudável versus pesado: aceite que é **um eixo, não duas etiquetas**, posicionável à maneira de
um Nutri-Score se houver informação. Pedida proposta de como o fazer de forma sistemática, para não
ter de ser julgado à mão receita a receita.

### Sessão 3 — 2026-08-23

**Label "saudável" eliminada.** Fica só o eixo de peso, que passa a mensagem sem depender de
interpretações do que é saudável.

**O forno deixa de ser um caso especial de equipamento.** O que interessava não era poder não ter
forno — era ver, ao olhar para a receita, se ia usá-lo. Isso é **método de confeção**, não
equipamento. Passa a ser um campo próprio, com valores como forno, tacho ou placa, frigideira, air
fryer, grelhador, e sem confeção. Resolve três coisas de uma vez: responde à pergunta original sem
distorcer a lista de equipamento, alimenta a rubrica do eixo de peso, e torna-se filtrável — "hoje
não me apetece ligar o forno" é uma coisa que se pensa mesmo.

O forno fica portanto marcado como `comum` no equipamento.

**O método aparece só no detalhe, não no cartão.** O cartão já tem informação a mais, e o que lá
entra é assunto para a conversa 2.

## Em aberto no fim da sessão 2

1. **O eixo de peso**: proposta em cima da mesa, por validar. Ver abaixo.
2. **Categorização do equipamento**: primeiro esboço feito com 65 entradas, 34 marcadas como comuns e
   31 como notáveis. Por rever um a um. O caso do **forno** foi levantado e está marcado como comum —
   é o mais discutível da lista.
3. **Vocabulário completo das labels declaradas**, por categoria.
4. **Escalar doses**: por qualquer número ou só por múltiplos simples? E o que fazer com ovos e
   com "q.b.".

## Proposta em aberto — o eixo de peso

O objetivo é responder à pergunta que se faz mesmo às sete da tarde: "hoje apetece-me algo leve".

**Não usar Nutri-Score.** É um algoritmo desenhado para produtos embalados, por 100 g, e responde a
"isto é nutricionalmente bom?" e não a "isto é pesado?". Numa refeição dá resultados absurdos: uma
salada com azeite pontua mal pela gordura por 100 g, um refrigerante de dieta pontua bem.

**Não construir uma fórmula sobre a nutrição.** Enquanto a Q4 não estiver fechada, os valores
nutricionais são estimativas. Uma fórmula sobre estimativas dá falsa precisão.

**Proposta: uma rubrica escrita, aplicada pelo importador.** O que torna isto sistemático não é ser
calculado, é serem os mesmos critérios todas as vezes, escritos e auditáveis. O importador atribui,
e só se corrige quando estiver errado — não há julgamento manual receita a receita.

Critérios observáveis, sem depender de nutrição:

- **Método de confeção** — frito, gratinado ou com creme puxa para cima; grelhado, cozido a vapor ou
  cru puxa para baixo
- **Veículos de gordura e a sua quantidade** — natas, manteiga, queijo, banha, fritura
- **Proteína** — carne vermelha e enchidos para cima; peixe, leguminosas e ovos para baixo
- **Proporção de legumes** no total dos ingredientes
- **Calorias por dose**, quando existirem, como aferição e não como motor

**Relativo ao tipo de prato.** Uma sobremesa compara-se com sobremesas, não com sopas. Sem isto,
todas as sobremesas ficam pesadas e o eixo deixa de informar.

**Três valores, não cinco:** `leve`, `equilibrado`, `substancial`. Com cinco, os do meio viram ruído.

**Chamar-lhe peso e não saúde.** "Saudável" é um juízo moral que convida à discussão — a manteiga é
saudável? — e não muda o que se cozinha hoje. "Pesado" responde a uma pergunta real e concreta.
Consequência: a label `saudável` deixa de existir.

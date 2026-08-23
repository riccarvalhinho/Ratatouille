# Conversa 3 — Detalhe da receita

**Estado:** Por começar
**Conduz:** Claude
**Destino das decisões:** `docs/specs/002-detalhe-receita.md`
**A falar junto com:** conversa 2, partilham decisões

## Porque existe

É o ecrã onde se decide cozinhar ou não. E ficou com uma decisão em aberto depois do benchmark: o
Cookidoo usa **abas** dentro do detalhe, a nossa spec descreve um **scroll único**.

## O que já está fechado

- Abre a partir do catálogo, do histórico e do planeamento, e devolve ao sítio de onde veio
- Coração (favorito), "+" (planear) e "x" (fechar) sempre visíveis
- Aparelhos e utensílios em blocos separados
- Quantidade do ingrediente alinhada à direita, numa coluna; a nota subordinada ao nome
- Passos em bullets curtos, nunca parágrafos

## As minhas perguntas de arranque

1. **Abas ou scroll?** As abas nunca te fazem perder o sítio e deixam cada secção usar duas colunas.
   O scroll é um gesto só e mostra tudo. A minha intuição é que **depende de quantas vezes voltas ao
   mesmo ecrã**: se abres o detalhe, lês, e fechas, o scroll ganha. Se ficas a saltar entre
   ingredientes e passos, ganham as abas. Qual é o teu padrão?

2. **O que precisas de saber antes de decidir, e o que só precisas depois de decidir?** Proponho que
   o que decide seja: tempo, antecedência, ingredientes, e quando foi a última vez. E que os passos e
   a nutrição sejam consulta posterior. Se isto estiver certo, muda a ordem do ecrã todo.

3. **"Última vez que fiz isto" — com que precisão?** "12 de agosto de 2026" é exato e inútil. "há
   três semanas" responde à pergunta real, que é "já chega para repetir?". Concordas, ou queres a data?

4. **O botão "+" abre a escolha do dia.** Pergunta chata mas decisiva: escolhes primeiro o dia e
   depois o bloco, ou primeiro a refeição? Aposto que pensas "quinta ao jantar", ou seja, dia primeiro.

5. **A nutrição interessa-te de verdade?** Está na spec porque veio do planeamento original, mas é o
   campo mais caro de preencher com rigor (Q4) e o que menos se olha. Se for para constar sem ser
   levado a sério, talvez chegue "aproximadamente 600 kcal" sem macros nenhumas.

6. **O que falta neste ecrã que a Bimby não tem?** O deles não diz quando foi a última vez, nem liga
   ao planeamento. Há mais alguma coisa que te dava jeito e que nenhuma app te dá?

## Registo da conversa

_(por começar)_

## Decisões tomadas

| Decisão | Onde ficou registada |
|---|---|

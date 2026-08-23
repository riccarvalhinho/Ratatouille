# Visão

## O problema

Cozinhar em casa exige três coisas ao mesmo tempo: decidir o que fazer, saber como fazer, e ter os
ingredientes em casa. Hoje isso está espalhado por livros, screenshots, links guardados e memória.
O resultado é decidir à última hora, repetir sempre os mesmos pratos, e ir ao supermercado sem lista.

O software das Bimby resolve bem a parte do "como fazer" — mas está preso ao robot, e a parte de
planeamento e compras é fraca.

## A visão

Um assistente de cozinha que vive num tablet suspenso na parede da cozinha, sempre ligado e sempre à
mão. Serve para:

- **Decidir** — ver o que já se sabe cozinhar, filtrar por tempo disponível, dificuldade ou tipo de prato.
- **Planear** — montar a semana de refeições numa vista visual, com histórico do que já se fez.
- **Executar** — guia passo a passo em ecrã grande, legível a um metro de distância, com timers.
- **Comprar** — lista de compras gerada a partir do plano da semana, agrupada por zona do supermercado.

## Quem usa

Uma casa, uma cozinha. Uso pessoal, não é um produto comercial. Isso permite decisões que um produto
comercial não podia tomar: sem contas de utilizador, sem servidor, sem multi-tenancy.

## Princípios

1. **A cozinha é um ambiente hostil.** Mãos molhadas, distância, pressa. Texto grande, alvos de toque
   grandes, nada de gestos escondidos.
2. **Tem de funcionar sem rede.** Uma app de cozinha que falha porque o Wi-Fi caiu é inútil.
3. **Os dados sobrevivem à app.** As receitas são ficheiros legíveis por humanos, versionados. Se a app
   morrer amanhã, as receitas continuam lá.
4. **Custo de manutenção quase zero.** Sem servidor, sem subscrição, sem nada que precise de atenção
   para continuar vivo.
5. **Conteúdo em português de Portugal.** Ingredientes, unidades e vocabulário de cozinha portugueses.

## Não-objetivos

Coisas que este produto **não** vai fazer, para evitar deriva de âmbito:

- Integrar com robots de cozinha (Bimby, Cookidoo, etc.).
- Contas de utilizador, partilha social, comunidade ou comentários.
- Ser uma app para várias famílias. É para uma casa.
- Recomendações por AI do tipo "o que devo cozinhar hoje" — pelo menos até as bases estarem sólidas.
- Rastreio nutricional pessoal (calorias diárias, macros, objetivos de dieta).

## Visão distante

Registada aqui para não se perder, **sem recursos alocados**:

- Integração com apps de lista de compras gratuitas via API, para exportar a lista diretamente.
- Comprar a lista de compras num retalhista português diretamente da app.

Ambas dependem de APIs de terceiros que hoje não estão investigadas. Ver `roadmap.md`, M6.

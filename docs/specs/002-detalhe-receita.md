# Spec 002 — Detalhe da receita

**Milestone:** M1
**Estado:** Pronta
**Depende de:** spec 001 (catálogo), spec 003 (planeamento)

## Objetivo

Ver tudo sobre uma receita antes de decidir cozinhá-la ou planeá-la, sem sair do ecrã onde se estava.

> **Em revisão:** o benchmark do Cookidoo (`docs/design/benchmark-bimby.md`) usa **abas** dentro do
> detalhe — Visão geral, Ingredientes, Preparação — em vez do scroll único descrito abaixo. Com abas
> nunca se perde o sítio e cada uma pode usar duas colunas. A decidir com as duas hipóteses
> desenhadas, em M1.

## Comportamento

Pop-up sobre o ecrã atual. Abre a partir do catálogo, do histórico ou da vista de planeamento semanal,
e ao fechar devolve sempre ao sítio de onde foi aberto, com o estado intacto.

### Estrutura

**Topo, fixo:**

- Coração para marcar ou desmarcar como favorito
- Botão "+" para planear a receita
- "x" no canto superior direito para fechar

Os três ficam visíveis enquanto se faz scroll pelo conteúdo — são as ações e não devem exigir voltar
ao topo.

**Conteúdo, com scroll:**

1. Imagem e nome da receita
2. Todas as labels da receita, sem o limite de 3 do cartão
3. Método de confeção, peso, tempo de preparação, tempo de confeção e antecedência necessária
4. Última vez que foi feita — a data mais recente em que foi planeada. Se nunca foi, di-lo
   explicitamente ("nunca cozinhada")
5. Rendimento — para quantas pessoas dá, ou quantas unidades rende, ou ambos
6. Eletrodomésticos e utensílios necessários, **em dois blocos separados** — os aparelhos
   condicionam se a receita é sequer possível, os utensílios são detalhe (`kind` da taxonomia)
7. Lista de ingredientes, com a quantidade alinhada à direita numa coluna própria, para a lista ser
   percorrível, e a `note` do ingrediente em texto secundário por baixo do nome
8. Passo a passo, em bullets curtos, com a temperatura em destaque quando o passo a exige
9. A transcrição em texto corrido, para quem prefere ler a receita seguida
10. Informação nutricional por dose: energia, proteína, gordura, gordura saturada, hidratos, fibra e
    sal — marcada como estimada quando `nutrition.method` for `estimado`. O mínimo aceitável são só
    as calorias

### Planear a partir do detalhe

O botão "+" abre a seleção de dia e bloco do dia. Escolhido o destino, a receita é adicionada ao plano
e o pop-up dá confirmação visível sem se fechar — pode querer-se planear a mesma receita para dois dias.

## Critérios de aceitação

- [ ] Abre a partir do catálogo, do histórico e da vista de planeamento
- [ ] Fechar no "x" devolve ao ecrã de origem com o estado preservado
- [ ] Coração, "+" e "x" ficam visíveis durante o scroll
- [ ] Marcar favorito reflete-se de imediato no catálogo
- [ ] Mostra "última vez feita" com data, ou "nunca cozinhada"
- [ ] Mostra aparelhos e utensílios em blocos separados
- [ ] Mostra ingredientes com a quantidade numa coluna alinhada à direita
- [ ] A nota de um ingrediente aparece subordinada ao nome, não a competir com ele
- [ ] Os passos são bullets curtos, nunca parágrafos corridos
- [ ] Nutrição estimada aparece marcada como aproximada
- [ ] O "+" permite escolher dia e bloco, e adiciona ao plano
- [ ] Planear dá confirmação visível sem fechar o pop-up
- [ ] Todo o conteúdo é legível a cerca de 70cm de distância

## Fora de âmbito

- Editar a receita (M2)
- Escalar as doses — decidido que se faz, só por múltiplos simples; previsto para M5
- Modo de execução passo a passo — é a spec 005

## Questões em aberto

- Q4 — rigor da informação nutricional
- Q6 — que blocos do dia oferecer na seleção

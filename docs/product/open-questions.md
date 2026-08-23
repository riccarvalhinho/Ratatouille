# Questões em aberto

Tudo o que ainda não está decidido. Uma questão só sai desta lista quando a decisão fica registada
num ADR, numa spec ou no PRD — e a linha passa a `Fechada` com o link.

Estado: `Aberta` · `A decidir em <milestone>` · `Fechada`

---

## Q1 — Que modelo de tablet Amazon Fire?

**Estado:** Aberta · bloqueia validação em M0

Determina que WebView temos e, portanto, que sintaxe de CSS e JS podemos usar. Fire OS 5/6 (tablets
de 2014–2018) traz um WebView muito datado; Fire OS 7/8 (2019+) é Chromium moderno.

Enquanto não estiver respondida, o build usa target conservador (ES2017) e evita sintaxe recente.

**Como responder:** Definições → Sobre o Tablet Fire → modelo e versão do Fire OS.

**Consequências:** se for um Fire antigo, as opções são (a) instalar Firefox for Android via APK,
(b) empacotar a app como APK com WebView próprio, ou (c) baixar ainda mais o target de build.

---

## Q2 — Qual é a direção visual?

**Estado:** A decidir em M1

O documento original dizia "Verdes, assim com aspeto saudável?" e "Minimalista? Decorada?" — ambas com
ponto de interrogação, ou seja, nunca foram decididas.

**Como responder:** produzir 2–3 direções visuais concretas aplicadas ao mesmo ecrã de catálogo e
escolher uma. Recolher inspirações em `docs/design/inspiracoes.md` antes.

---

## Q3 — As doses escalam?

**Estado:** A decidir em M5

Uma receita declara para quantas pessoas dá. Deve dar para recalcular ingredientes para 2 ou 6 pessoas?

Tecnicamente é simples para quantidades numéricas, mas quebra em ingredientes a gosto, em unidades
discretas (1 ovo × 1,5) e em tempos de confeção que não escalam linearmente.

**Proposta:** suportar escalar por múltiplos simples, com aviso de que tempos não escalam.

---

## Q4 — Que rigor para a informação nutricional?

**Estado:** Aberta

Duas abordagens:

- **Calcular** a partir dos ingredientes, usando uma tabela de composição de alimentos (Open Food
  Facts, ou a Tabela da Composição de Alimentos do INSA). Honesto, mas exige dados nutricionais por
  ingrediente canónico e trabalho de normalização de unidades.
- **Estimar** por AI no momento da importação. Barato e imediato, mas é um palpite.

O schema já distingue os dois através do campo `nutrition.method`, para que a app possa mostrar
"estimado" em vez de fingir precisão. A decisão é sobre qual usar por omissão.

---

## Q5 — O histórico é automático ou manual?

**Estado:** A decidir em M3

Quando uma refeição planeada passa a estar no passado, entra automaticamente no histórico? Ou é
preciso marcar "feito"?

**Trade-off:** automático não dá trabalho mas mente (planeou-se e não se cozinhou); manual é fiel mas
exige disciplina e o histórico acaba vazio.

**Proposta:** automático, com possibilidade de remover do histórico. Optimiza para não dar trabalho.

---

## Q6 — Que blocos do dia no planeamento?

**Estado:** A decidir em M3

O documento original propunha "manhã/tarde" e marcava explicitamente "MELHORAR".

**Proposta:** quatro blocos — pequeno-almoço, almoço, lanche, jantar. É o que corresponde a como se
come em Portugal e chega para o objetivo. Já está refletido em `data/schema/plan.schema.json` e é
trivial de mudar enquanto não houver planos guardados.

---

## Q7 — Escreve só uma pessoa?

**Estado:** Aberta

Se mais alguém em casa usar o tablet ou uma segunda instância da app, duas escritas simultâneas podem
colidir. O modelo atual (um ficheiro por entidade, outbox com retry) aguenta uso ocasional a dois, mas
não foi desenhado para isso.

**Consequência se sim:** é preciso pensar merge de planos semanais, que é o único ficheiro onde duas
pessoas mexeriam ao mesmo tempo.

---

## Q8 — De onde vêm as imagens dos pratos?

**Estado:** Aberta

Opções: fotografia própria, imagem da fonte original quando a receita é importada, ou geração por AI.

Afeta o tamanho do repositório: imagens em `media/recipes/` ficam no Git para sempre. Regra provisória
já em vigor: JPEG comprimido, largura máxima 1200px, ~200KB por imagem. Se o volume crescer, avaliar
Git LFS.

---

## Q9 — A lista de compras conhece a despensa?

**Estado:** A decidir em M4

A lista deve descontar o que já se tem em casa (azeite, sal, farinha)? Isso implica manter um
inventário de despensa, que é uma funcionalidade inteira e uma fonte conhecida de abandono — só
funciona se for mantido religiosamente.

**Proposta:** não manter inventário. Em vez disso, marcar certos ingredientes canónicos como
"despensa" (`staple: true`) e agrupá-los à parte na lista, para se ignorar de relance. 90% do
benefício, 5% do esforço.

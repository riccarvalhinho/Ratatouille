# Questões em aberto

Tudo o que ainda não está decidido. Uma questão só sai desta lista quando a decisão fica registada
num ADR, numa spec ou no PRD — e a linha passa a `Fechada` com o link.

Estado: `Aberta` · `A decidir em <milestone>` · `Fechada`

---

## Q1 — Que modelo de tablet Amazon Fire? ✅

**Estado:** Fechada · 2026-08-23

**Resposta:** Fire HD 10 de 9.ª geração (2019). Fire OS 7, baseado em Android 9. Ecrã de 10,1"
a 1920×1200 (224 ppi), 2 GB de RAM, MediaTek MT8183.

**Consequências:**

- O browser Silk é Chromium moderno. A PWA instalada no ecrã inicial é o caminho, sem plano B —
  cai o cenário de sideload do Firefox ou de empacotar como APK que estava previsto no ADR 0003.
- A Wake Lock API existe, portanto o modo cozinha pode manter o ecrã ligado sem depender das
  definições do sistema.
- O build **mantém-se em ES2017**, agora por opção e não por precaução: o objetivo passou a ser
  correr também noutros Androids mais antigos (questão Q11), e medimos que subir para ES2022 só
  poupa 1,3 kB em 154 kB. Compatibilidade essencialmente de graça.
- 2 GB de RAM não é muito. Filtrar centenas de receitas em memória continua confortável; dezenas
  de milhares não seria. Já estava previsto no ADR 0002.
- Por confirmar no aparelho: o viewport em pixels CSS. A 224 ppi o mais provável é uma densidade
  de 1,5×, o que daria cerca de 1280×800 em horizontal — é a esse tamanho que as vistas devem ser
  desenhadas e testadas. Ver `docs/ops/tablet-setup.md`.

## Q2 — Qual é a direção visual?

**Estado:** A decidir em M1 · conversa aberta em `docs/conversas/06-direcao-visual.md`

O documento original dizia "Verdes, assim com aspeto saudável?" e "Minimalista? Decorada?" — ambas com
ponto de interrogação, ou seja, nunca foram decididas.

**Como responder:** produzir 2–3 direções visuais concretas aplicadas ao mesmo ecrã de catálogo e
escolher uma. Recolher inspirações em `docs/design/inspiracoes.md` antes.

Esta questão cresceu: passou de "que paleta" para **N1 — Revisão visual** no roadmap, que é a app
inteira a ganhar um aspeto intencional em vez de "primeiro que funcione". A resposta à Q2 é a
primeira parte de N1, e as três armadilhas estão lá listadas — valores fixos fora dos tokens,
tipografia contra o offline, e o tema escuro a contar em dobro.

E há uma condição de calendário: a paleta tem de ser escolhida com o tablet na parede, com a luz da
cozinha e a um braço de distância. Escolhida num portátil, é escolhida para o sítio errado.

---

## Q3 — As doses escalam? ✅

**Estado:** Fechada · 2026-08-23 · conversa 1

**Resposta:** Sim, é uma feature assumida, mas **só por múltiplos simples**. As quantidades escalam;
os tempos de forno e de cozedura não. Nada de escalar para números arbitrários, precisamente por
causa dos ovos, das formas de bolo e do "q.b.".

Registado em `docs/specs/005-modo-cozinha.md`.

## Q4 — Que rigor para a informação nutricional?

**Estado:** Parcialmente respondida · conversa 1

O **âmbito** já está decidido: o ideal é o painel completo por dose — energia, proteína, gordura,
gordura saturada, hidratos, fibra e sal — e o mínimo aceitável são só as calorias. O Nutri-Score foi
cortado: existia para responder a "isto é saudável", pergunta que o campo `weight` passou a responder
melhor.

Fica por decidir só o **método**: calcular a partir dos ingredientes ou estimar.

Duas abordagens:

- **Calcular** a partir dos ingredientes, usando uma tabela de composição de alimentos (Open Food
  Facts, ou a Tabela da Composição de Alimentos do INSA). Honesto, mas exige dados nutricionais por
  ingrediente canónico e trabalho de normalização de unidades.
- **Estimar** por AI no momento da importação. Barato e imediato, mas é um palpite.

O schema já distingue os dois através do campo `nutrition.method`, para que a app possa mostrar
"estimado" em vez de fingir precisão. A decisão é sobre qual usar por omissão.

---

## Q5 — O histórico é automático ou manual?

**Estado:** A decidir em M3 · resolve-se dentro de `docs/conversas/05-ui-planeamento.md`

Quando uma refeição planeada passa a estar no passado, entra automaticamente no histórico? Ou é
preciso marcar "feito"?

**Trade-off:** automático não dá trabalho mas mente (planeou-se e não se cozinhou); manual é fiel mas
exige disciplina e o histórico acaba vazio.

**Proposta:** automático, com possibilidade de remover do histórico. Optimiza para não dar trabalho.

---

## Q6 — Que blocos do dia no planeamento?

**Estado:** ✅ Fechada — **almoço e jantar**

O documento original propunha "manhã/tarde" e marcava explicitamente "MELHORAR". A proposta seguinte
foram quatro blocos: pequeno-almoço, almoço, lanche, jantar.

**Decisão: só almoço e jantar.** São as refeições que se decidem de véspera; o pequeno-almoço e o
lanche não têm decisão que valha um bloco na grelha. Acrescentam-se se a necessidade aparecer.

O ganho não foi só de arrumação. Com quatro blocos, cada célula da grelha ficava com ~140×130px a
1280×800 e o cartão teve de perder a imagem para o nome caber legível. Com dois, as células passaram
a ~140×265px e a thumbnail voltou.

Aplicado em `data/schema/plan.schema.json`, `data/schema/state.schema.json` e
`app/src/domain/types.ts`. Nada mais no código sabe quantos blocos há — tudo deriva de `MEAL_BLOCKS`.

Nota para não confundir: "Pequeno-almoço" continua a existir como **label** de tipo de prato. Uma
receita pode ser de pequeno-almoço sem haver um bloco onde a planear.

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

---

## Q10 — Onde é que o design é feito?

**Estado:** Aberta · a decidir antes de M1 · conversa aberta em `docs/conversas/06-direcao-visual.md`

Duas hipóteses para fechar a direção visual (Q2) e desenhar os ecrãs:

- **Direto em código**, iterando sobre a app real com screenshots. O que se vê é o que existe, e não
  há tradução do desenho para a implementação. Mas explorar três direções visuais em paralelo é
  lento, e ajustar um espaçamento implica editar CSS.
- **Numa tela do Claude Design**, com os ecrãs como artboards editáveis à mão, e só depois traduzir
  a direção escolhida para código. Muito mais rápido para comparar alternativas e mexer sem pedir.
  Em contrapartida, vive fora do repositório e o que produz não é código de produção.

A recomendação está na conversa e o essencial é: usar a tela para **decidir**, e o código para
**construir**. Seja qual for o caminho, a direção escolhida acaba escrita em
`docs/design/design-system.md` — a tela é oficina, não source of truth.

---

## Q11 — Que Androids além do tablet da cozinha?

**Estado:** Aberta

O tablet está resolvido (Q1). Mas há intenção de a app correr também noutros Androids, o que levanta
duas perguntas distintas:

1. **Que versão mínima de Android?** Determina o target de build e que APIs se podem usar. Hoje
   ES2017 cobre confortavelmente Android 7 e acima.
2. **PWA ou APK?** Noutros Androids há Play Store, portanto um APK empacotado com Capacitor passa a
   ser distribuível de forma normal. Muda a resposta do ADR 0003, que decidiu PWA num contexto em
   que a única alternativa era sideload.

Enquanto não houver um aparelho concreto e um caso de uso, isto não é acionável — mas condiciona
decisões de layout, portanto vale a pena ter uma resposta antes de M1 fechar o design.

---

## Q12 — A metadata das receitas está completa? ✅

**Estado:** Fechada · 2026-08-23 · conversa 1, aplicada ao schema

Sobra um pedaço, que ganhou tema próprio: o **vocabulário das labels declaradas** — ver
`docs/conversas/07-vocabulario-labels.md`.

O formato das receitas foi definido em M0 e está a ser revisto agora, antes de haver receitas a
sério e antes de o importador (spec 007) começar a produzir ficheiros — mudar o formato depois é
migrar dados.

As decisões concretas em cima da mesa estão em `docs/product/metadata-receitas.md`.


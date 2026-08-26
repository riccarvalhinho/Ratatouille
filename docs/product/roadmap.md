# Roadmap

Cada milestone é entregável por si só: no fim de cada um, há alguma coisa a mais que funciona no
tablet. Nada de milestones que só fazem sentido combinados.

---

## M0 — Fundação ✅ em curso

Nada de features do produto. O objetivo é o alicerce.

- Estrutura do repositório, com o GitHub como source of truth
- Documentação de produto migrada do documento Word
- Specs escritas para todas as features conhecidas
- Schemas dos dados definidos (`data/schema/`)
- Taxonomias iniciais: labels, ingredientes, equipamento
- Receitas seed em PT-PT
- Tooling: validação de dados e geração do bundle
- App shell (Vite + React + TS) a correr e a ler o bundle
- CI a validar dados e a compilar; deploy automático para GitHub Pages
- Tablet confirmado: Fire HD 10 de 9.ª geração (questão Q1 fechada)

**Feito quando:** o URL do GitHub Pages abre no tablet e mostra as receitas seed.

---

## M1 — Catálogo, detalhe e importador

O primeiro milestone com valor real de utilização. Três frentes que avançam em paralelo.

**Frente A — metadata e importador** (spec 007). É o que enche o catálogo, e por isso vem primeiro:
sem receitas, um catálogo bonito não serve de nada.

- Fechar a revisão da metadata (`docs/product/metadata-receitas.md`, questão Q12)
- Aplicar as alterações ao schema, aos tipos, ao validador e às receitas seed
- `tools/import-recipe.ts`: link de site, link de vídeo, texto ou foto → ficheiro validado
- Preenchimento interativo de lacunas — nada fica em branco em silêncio

**Frente B — design** (questões Q2 e Q10).

- Recolher o benchmark da companion app da Bimby (`docs/design/benchmark-bimby.md`)
- Fechar a direção visual e escrevê-la em `docs/design/design-system.md`

**Frente C — os ecrãs** (specs 001 e 002).

- Grelha de receitas com thumbnails, tempos e labels
- Filtros por duração, dificuldade e labels
- Pop-up de detalhe completo: ingredientes, passo a passo, utensílios, nutrição
- Subtabs de favoritos e histórico (só leitura nesta fase)

**Feito quando:** dá para descobrir e ler uma receita no tablet sem tocar num teclado, e o catálogo
tem receitas que chegue para isso ser útil.

---

## M2 — Escrita de volta para o GitHub · construído

- [x] Ecrã de definições com introdução do token de acesso
- [x] Camada de outbox: escritas otimistas em IndexedDB, sincronizadas como commits
- [x] Favoritos e histórico passam a persistir
- [x] Indicador de estado de sincronização e resolução de falhas

**Feito quando:** marcar um favorito no tablet cria um commit no repositório. Falta só a
confirmação em cima do tablet, com um token a sério — o código está feito e testado, mas o único
teste que conta é ver o commit aparecer no repositório.

Entrou também o "marcar como cozinhada" no fim do modo cozinha, que estava à espera desta escrita.

---

## M3 — Planeamento semanal · quase

- [x] Vista de semana por blocos do dia
- [x] Navegação entre semanas
- [x] Planear e desplanear receitas
- [x] Várias receitas por bloco
- [ ] Home screen ligada ao plano real, com CTA quando a semana está vazia

**Feito quando:** dá para montar a semana toda no tablet. Falta a home (spec 006).

---

## M4 — Lista de compras · feito

- [x] Agregação de ingredientes das receitas planeadas da semana
- [x] Normalização de unidades e soma de quantidades
- [x] Agrupamento por zona de supermercado
- [x] Marcar itens como comprados
- ~~Ajustes manuais à lista~~ — cortado, ver a spec 004

**Feito quando:** dá para ir ao supermercado com o telemóvel e não esquecer nada.

Trouxe consigo a **primeira vista de telemóvel** do projeto. É o único ecrã que se usa fora da
cozinha, e é onde o painel de navegação passa a uma barra em baixo — a mesma razão do design system
aplicada a um ecrã com a forma oposta.

---

## M5 — Modo cozinha

- Vista de execução passo a passo em ecrã grande
- Timers por passo
- Manter o ecrã ligado durante a confeção
- Escalar doses para o número de pessoas

**Feito quando:** dá para cozinhar uma receita do início ao fim sem tocar noutra coisa.

---

## Nice to have

Coisas que valem a pena e que não bloqueiam nada. Vêm depois do que falta dos milestones e antes das
explorações.

### N0 — "Apetece-me algo"

**Estado:** proposta em discussão · `docs/conversas/02-ui-catalogo.md`
**Relacionado:** conversa 7 (vocabulário das labels), spec 001, spec 006 por escrever

Um **assistente de filtro** em pop-up, aberto por um botão no topo da lista. Um painel de oito
quadrantes — tipo de refeição, ingrediente principal, método, tempo de confeção, cultura, apetite,
ocasião, regime — em que se toca no critério, ele abre as opções em mini-ícones, e se vai tocando e
prosseguindo. Os eixos e os 45 ícones estão fechados em `docs/conversas/07-vocabulario-labels.md`. **Aterra de volta no catálogo já filtrado**, sem vista
nova para os resultados.

**Não substitui os filtros à mão nem é o ponto de entrada da app** — a lista completa continua a ser
o ecrã principal. A única regra que impõe é escrever **no mesmo estado de filtro** que a barra mostra:
duas entradas para o mesmo estado não fazem mal, dois estados fariam.

**Porque não está num milestone:** com seis receitas a triagem devolveria sempre as mesmas duas. Faz
sentido a partir de umas dezenas, e a escala alvo é uma centena ou mais. **Mas desenha-se antes de se
construir**, porque é o primeiro teste a sério que a taxonomia de labels vai ter — e é melhor
descobrir que a família `ocasiao` mistura vibe, tempo e sobras antes de haver cento e cinquenta
receitas etiquetadas com ela.

### N1 — Revisão visual

**Estado:** por começar
**Relacionado:** Q2 (direção visual), `docs/design/design-system.md`, conversa 6

Dar à app um aspeto intencional e acabado, em vez de "primeiro que funcione". Tema, esquema de
cores, eventualmente fundos subtis. O objetivo é não parecer amadora.

**A boa notícia: quase nada disto é retrabalho.** Foi construído a pensar nisto — as cores, os
raios, o espaçamento e a escala tipográfica vivem todos em `app/src/styles/tokens.css`, e nenhum
componente escreve um valor de cor à mão. Trocar a paleta é editar um ficheiro.

E as decisões de interface que fomos tomando não são decisões visuais: alvos redondos ao centro no
modo cozinha, ecrã morto à volta, ações reveladas ao toque no planeamento, barra em baixo no
telemóvel. Todas essas nascem de ergonomia — distância, mãos ocupadas, densidade — e sobrevivem a
qualquer paleta.

**Três sítios onde não é de graça**, para não haver surpresas:

1. **Há valores fixos fora dos tokens.** Cerca de 38 medidas em px escritas diretamente nos
   componentes (a altura do cartão com imagem, os 64px da thumbnail, os 32px do passo, os relevos
   dos botões), mais quatro cores literais — dois véus de `rgb(0 0 0 / 45%)` e um `#fff`. A
   preparação mais barata para esta tarefa é promovê-los a tokens **antes** de mexer no tema, e isso
   pode ser feito a qualquer momento sem mudar nada visualmente.

2. **Tipografia colide com o offline.** O design system escolheu a font stack do sistema de
   propósito: o tablet pode estar sem rede, e uma fonte que não carrega é pior do que uma fonte
   genérica. Um tipo de letra próprio é o que mais muda o aspeto de uma app, mas obriga a
   auto-hospedá-lo e a metê-lo na cache do service worker — não é um `<link>` para o Google Fonts.
   Decisão a tomar de olhos abertos, não por arrasto.

3. **O tema escuro conta em dobro.** Já existe e é usado, e a cozinha tem luz muito diferente de dia
   e de noite. Qualquer paleta nova tem de funcionar nos dois, com o contraste mínimo AA que o
   design system exige — não vale inverter e esperar o melhor.

**Quando:** depois de o tablet estar mesmo na parede em uso. A paleta tem de ser julgada no ecrã
real, com a luz real da cozinha e a um braço de distância. Escolher cores num portátil a 50cm é
escolher para o sítio errado — e isso é a única parte disto que gera mesmo retrabalho.

---

## Explorações futuras (sem recursos alocados)

Duas direções para a lista de compras, registadas para não se perderem. A lista atual foi construída
**sem nenhuma delas** de propósito: uma lista com um check funciona hoje e não fica presa a nenhuma
decisão que estas explorações venham a tomar.

Nenhuma é um compromisso. São estudos, e o resultado de qualquer uma pode perfeitamente ser "não
vale a pena".

### E1 — Exportar para uma app de listas de compras

**Estado:** por começar

O Bring! é o que está a ser usado hoje. A pergunta é se dá para a lista da semana ir lá parar sem
copiar à mão.

O que o estudo tem de responder:

1. O Bring! tem API pública documentada, ou só a API interna da app? Se for interna, qual é o risco
   de partir a cada atualização, e há termos de serviço que a proíbam?
2. Que alternativas existem com API pública e gratuita — e com utilizador em Portugal?
3. Há um caminho que evite API nenhuma: um link de partilha, um `.txt` para a folha de partilha do
   Android, um formato que a app de destino saiba importar?
4. O que é que isso obriga a mudar do lado do Ratatouille? Provavelmente pouco: a lista já sai da
   agregação, e exportar é uma transformação do que já existe.

A hipótese barata a testar primeiro é a 3. Uma partilha de texto para o Android resolve metade do
problema sem depender da API de ninguém.

### E2 — Comprar diretamente num retalhista

**Estado:** por começar

O salto grande: a lista da semana vira uma encomenda no Continente, Pingo Doce ou Auchan.

O que o estudo tem de responder:

1. Algum destes tem API pública para clientes? A resposta provável é não — a seguinte é se existe
   uma API interna estável o suficiente, e o que dizem os termos de serviço sobre a usar.
2. Sem API, sobra automação de navegador. Isso quer dizer credenciais do supermercado guardadas em
   algum lado e sessões que expiram — um problema de segurança de outra ordem, e que a ADR 0004 não
   cobre.
3. **O problema mais difícil não é técnico**: é o mapeamento. "2 cebolas" tem de virar um produto
   concreto com marca, calibre e embalagem. Esse mapeamento é por retalhista e envelhece sozinho.
4. Faz sentido parar a meio? Preencher o carrinho e deixar a confirmação para a pessoa evita a parte
   pior — pagamentos e enganos caros — e talvez entregue a maior parte do valor.

Antes de qualquer código, medir a coisa simples: quanto tempo custa mesmo passar a lista para o site
do supermercado à mão. Se forem cinco minutos por semana, o estudo pode acabar aí.

---

## Fora do roadmap

- Versão de telemóvel (só depois de M4, e reduzida)
- Integração com robots de cozinha — nunca, é um não-objetivo

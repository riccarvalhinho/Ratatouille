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

## M2 — Escrita de volta para o GitHub

- Ecrã de definições com introdução do token de acesso
- Camada de outbox: escritas otimistas em IndexedDB, sincronizadas como commits
- Favoritos e histórico passam a persistir
- Indicador de estado de sincronização e resolução de falhas

**Feito quando:** marcar um favorito no tablet cria um commit no repositório.

---

## M3 — Planeamento semanal

- Vista de semana por blocos do dia
- Navegação entre semanas
- Planear e desplanear receitas
- Várias receitas por bloco
- Home screen ligada ao plano real, com CTA quando a semana está vazia

**Feito quando:** dá para montar a semana toda no tablet.

---

## M4 — Lista de compras

- Agregação de ingredientes das receitas planeadas da semana
- Normalização de unidades e soma de quantidades
- Agrupamento por zona de supermercado
- Marcar itens como comprados
- Ajustes manuais à lista

**Feito quando:** dá para ir ao supermercado com o tablet ou telemóvel e não esquecer nada.

---

## M5 — Modo cozinha

- Vista de execução passo a passo em ecrã grande
- Timers por passo
- Manter o ecrã ligado durante a confeção
- Escalar doses para o número de pessoas

**Feito quando:** dá para cozinhar uma receita do início ao fim sem tocar noutra coisa.

---

## M6 — Visão distante (sem recursos alocados)

Registado para não se perder. Não investigar até M4 estar entregue.

- Investigar apps de lista de compras gratuitas com API pública, para exportar a lista
- Integração com um retalhista português para comprar a lista diretamente da app

---

## Fora do roadmap

- Versão de telemóvel (só depois de M4, e reduzida)
- Integração com robots de cozinha — nunca, é um não-objetivo

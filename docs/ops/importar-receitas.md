# Importar receitas

Como uma receita entra em `data/recipes/`.

> **Estado:** o importador (`tools/import-recipe.ts`) é trabalho de M1. Este documento define o
> processo; o script automatiza-o.

## Princípio

Nenhuma receita entra no repositório sem revisão humana. A AI normaliza e preenche lacunas, mas não
decide sozinha o que é verdade sobre uma receita que vais cozinhar.

## O processo

```
fonte (link, foto, texto colado, ou de cabeça)
        │
        ▼
  normalização assistida por AI
  ├── extrair ingredientes e quantidades
  ├── mapear cada ingrediente para um ingrediente canónico de data/taxonomies/ingredients.json
  ├── partir as instruções em passos curtos
  ├── inferir labels, dificuldade e tempos
  ├── detetar antecedência de preparação (marinar, demolhar, levedar)
  ├── inferir equipamento necessário
  └── estimar informação nutricional  → nutrition.method = "estimado"
        │
        ▼
  ficheiro data/recipes/<slug>.json
        │
        ▼
  npm run validate     ← falha se algo não bater certo com o schema
        │
        ▼
  revisão humana        ← ler o ficheiro, corrigir o que estiver errado
        │
        ▼
  commit
```

## Regras de normalização

- **Ingredientes canónicos.** "cebola", "cebola média", "1 cebola picada" são todos `cebola`, com a
  quantidade e a preparação em campos separados. Se o ingrediente não existir na taxonomia, acrescentar
  primeiro à taxonomia — nunca inventar uma referência.
- **Unidades do sistema métrico**, em português: `g`, `kg`, `ml`, `l`, `un`, `csopa`, `cchá`, `qb`.
- **Passos curtos.** Uma ação por passo. Um passo que precisa de vírgulas a mais são dois passos.
  O documento original é explícito: "text por bullets e simplificado, nada de grandes parágrafos".
  ⚠️ A parte das vírgulas está a ser rediscutida na conversa 4, pergunta 8, que propõe agregar ao
  nível de tarefa — "juntar as batatas e a água, temperar com sal e deixar até se desfazerem com o
  garfo" seria um passo só. Até estar decidido, vale o que está escrito acima.
- **Tempos separados.** Preparação e confeção são campos distintos, e a antecedência de preparação
  (marinar de véspera, demolhar bacalhau, levedar massa) é um terceiro campo — não se soma aos outros
  porque não é tempo ativo.
- **Nutrição marcada como estimada.** Enquanto a Q4 não estiver fechada, tudo o que vem do importador
  leva `nutrition.method: "estimado"` e a app mostra-o como aproximado.

## Direitos de autor

Uma lista de ingredientes é facto e não é protegida. O texto das instruções de outra pessoa é. Por
isso as instruções são **reescritas**, nunca copiadas, e a fonte original fica registada no campo
`source` da receita.

## Imagens

Guardar em `media/recipes/<slug>.jpg`. JPEG, largura máxima 1200px, alvo de ~200KB. As imagens ficam
no Git para sempre — comprimir antes de commitar. Ver questão Q8.

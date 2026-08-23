# data/ — a source of truth dos dados

Não há base de dados. Estes ficheiros **são** a base de dados. Ver
[`docs/adr/0002-dados-json-versionados.md`](../docs/adr/0002-dados-json-versionados.md).

| Pasta | O que contém |
|---|---|
| `schema/` | Os schemas JSON. São o contrato — validados em CI, e os tipos TS derivam deles |
| `recipes/` | Uma receita por ficheiro. Nome do ficheiro = campo `id` |
| `taxonomies/` | Vocabulários fechados: labels, ingredientes canónicos, equipamento |
| `planning/` | Uma semana ISO por ficheiro, `AAAA-Www.json` |
| `state/` | Favoritos e histórico |

## Regras

1. **Um ficheiro por entidade.** Mantém os diffs legíveis e evita que duas escritas simultâneas
   colidam no mesmo ficheiro.
2. **Ingredientes são referências, nunca texto livre.** Cada `ref` tem de existir em
   `taxonomies/ingredients.json`. Sem isto, a lista de compras não consegue somar quantidades.
   Ingrediente novo? Acrescentar primeiro à taxonomia.
3. **Validar antes de commitar:** `npm run validate`. O CI corre o mesmo e chumba o pull request.

## Adicionar uma receita à mão

```bash
cp data/recipes/caldo-verde.json data/recipes/a-minha-receita.json
# editar: o campo id tem de ser igual ao nome do ficheiro
npm run validate
```

Fazer push, e a receita aparece na app sem se tocar em código.

Para importar de um link, foto ou texto colado, ver
[`docs/ops/importar-receitas.md`](../docs/ops/importar-receitas.md).

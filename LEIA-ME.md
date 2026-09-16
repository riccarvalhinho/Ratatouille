# Ramo gasto

Este ramo serve para escolher as fotografias das receitas: o workflow "Colher candidatas a imagem"
publica aqui as folhas de contacto, alguém olha, escreve `colheita/escolhas.json`, e o "Aplicar
imagens escolhidas" descarrega as escolhidas para `media/recipes/` no ramo de trabalho.

**A última colheita está aplicada.** As folhas foram apagadas e não há aqui nada que o `main` não
tenha. O ramo é órfão — não partilha história com o `main` —, portanto apagá-lo não tira nada:

```bash
git push origin --delete imagens/colheita
```

Ficou por apagar porque o token das sessões de Claude Code não tem permissão para eliminar
referências: o GitHub responde 403 a qualquer `--delete`. Não é um problema do ramo nem do
repositório.

Se houver uma colheita nova, o workflow reescreve isto por cima. Ver `docs/ops/imagens.md`.

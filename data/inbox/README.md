# data/inbox/

Receitas recolhidas de links, **em bruto**, à espera de serem normalizadas e revistas.

Nada aqui é uma receita. São despejos do que o site ou o vídeo deram: JSON-LD quando existe, ou
metadados, ou o texto da página. Sem interpretação nenhuma.

## Como chega aqui

O workflow **Importar receita de um link** (Actions → executar com o URL) corre num runner do GitHub,
que tem internet a sério, e faz commit do resultado. As sessões de Claude Code não conseguem abrir
sites — o proxy bloqueia-os — mas conseguem ler o repositório.

Também dá para correr localmente:

```bash
npm run import:fetch -- https://exemplo.pt/receita
```

## O que acontece a seguir

Numa sessão de Claude Code: *"importa a receita que está no inbox"*. A skill `importar-receita` lê o
ficheiro, normaliza segundo o schema, pergunta o que faltar, grava em `data/recipes/` e **apaga o
ficheiro daqui**.

Um ficheiro que fique aqui muito tempo é uma receita por tratar, não um arquivo.

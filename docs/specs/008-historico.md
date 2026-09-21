# Spec 008 — Histórico

**Milestone:** M5
**Estado:** Construída
**Depende de:** spec 002 (detalhe), spec 005 (modo cozinha)

## Objetivo

Responder a "o que é que andámos a comer?" — e, por trás dela, à pergunta que o produto existe para
resolver: já chega de tempo para repetir isto?

O histórico já existia como ficheiro (`data/state/history.json`) e já alimentava o "última vez" do
detalhe. O que faltava era um sítio onde ele se **vê**.

## Porque é um destino e não uma subtab

A spec 001 punha favoritos e histórico como subtabs do catálogo. O histórico sai de lá; os favoritos
ficam. Fecha a pergunta 3 da conversa 8.

A razão é a que a própria spec 001 escreveu ao separar as duas coisas: o favorito é um **juízo** e o
histórico é um **facto com data**. Como subtab, um histórico é uma lista de receitas filtrada por
"já fiz" — e aí, sim, é uma vista do catálogo. Com datas e contagens deixa de ser: cada linha é uma
refeição, a mesma receita aparece cinco vezes, e a ordem é cronológica e não alfabética. Não é o
catálogo com um filtro, é outra lista.

E vai-se lá por outro motivo. Ao catálogo vai-se escolher o que fazer hoje; ao histórico vai-se ver
o que se fez. Um destino que se procura diretamente é um destino.

## Comportamento

### A lista

Entradas de `data/state/history.json`, **mais recentes primeiro**, já com o que ainda não saiu do
tablet para o GitHub.

Cada entrada é um **retângulo pequeno**, não um cartão de catálogo. O catálogo é uma montra —
escolhe-se pela fotografia, e por isso os cartões são altos com a imagem grande. Aqui já se sabe o
que se comeu: o que se procura é a data. Um retângulo largo e baixo põe nome e data lado a lado em
vez de os empilhar, e cabem três por linha a 1280px.

Dentro de cada um:

- **Miniatura do prato**, 72px. Não é enfeite: reconhece-se um prato pela fotografia muito antes de
  se ler o nome, e numa lista que se percorre de relance isso é a diferença entre ler e ver. Sem
  imagem, o marcador 🍲, como no resto da app.
- **Nome da receita.** Corta com reticências se for comprido, para não empurrar a data para fora.
- **Quando**, em duas linhas: primeiro o relativo — "ontem", "há 3 semanas" —, que é o que responde a
  "já vai longe?", e por baixo a data exata com dia da semana: "Seg, 14 de setembro". O ano só
  aparece quando não é o corrente, senão é ruído em nove linhas de cada dez.

  As duas em linhas próprias e não lado a lado: lado a lado, "ontem · Dom, 20 de setembro" cabe numa
  linha e "há 1 semana · Seg, 14 de setembro" não, e numa grelha duas alturas de cartão lêem-se como
  desalinhamento e não como conteúdo diferente.
- **Bloco do dia**, quando a entrada o tem: almoço ou jantar.
- **Quantas vezes ao todo** aquela receita foi cozinhada — "primeira vez", "3 vezes ao todo". É a
  curiosidade que faz a lista valer uma segunda leitura: mostra o repertório real de casa, que não é
  o mesmo que o catálogo nem que os favoritos.

O topo diz quantas refeições e quantas receitas diferentes. São números diferentes de propósito: a
distância entre eles é a medida de quanto se repete.

Tocar numa entrada abre o detalhe da receita (spec 002), por cima e sem sair do histórico.

### Entradas órfãs

Uma entrada pode apontar para uma receita que já não está em `data/recipes/` — apagada, ou com o
slug mudado. **O histórico é um facto e não se reescreve por causa disso.** A entrada fica, com o
identificador no lugar do nome e a dizer "já não está no catálogo", e não abre nada.

Era fácil escondê-la, e seria mentir na contagem.

### Vazio

Explica como é que se enche: marcar como cozinhada no fim do modo cozinha, ou no "Já fiz isto hoje"
do detalhe. Um histórico em branco sem explicação parece avaria.

## O que escreve aqui

Duas portas, ambas com um toque de quem cozinhou, e **nenhuma automática**:

1. **"Marcar como cozinhada"**, no ecrã do fim do modo cozinha (spec 005).
2. **"Já fiz isto hoje"**, no detalhe da receita (spec 002), para o que se faz de cabeça sem acender
   o tablet.

O plano da semana nunca escreve histórico: planear não é cozinhar. Ver Q5 em
`docs/product/open-questions.md`.

## Critérios de aceitação

- [x] Um destino próprio na navegação principal
- [x] As entradas aparecem mais recentes primeiro
- [x] Cada entrada mostra miniatura, nome e data
- [x] Cada entrada diz há quanto tempo foi, em linguagem corrente
- [x] Cada entrada diz quantas vezes aquela receita foi cozinhada ao todo
- [x] O topo diz quantas refeições e quantas receitas diferentes
- [x] Tocar numa entrada abre o detalhe, e fechá-lo devolve ao histórico
- [x] Uma entrada cuja receita já não existe aparece na mesma, identificada como tal
- [x] Sem histórico, o ecrã explica como é que se enche
- [x] O que se marca no tablet aparece aqui antes de haver rede
- [x] Todos os alvos de toque têm pelo menos 56×56px — os cartões têm 88px de altura

## Fora de âmbito

- Editar ou apagar entradas antigas. O desfazer existe no dia em que se marca, nos dois sítios que
  marcam; corrigir uma refeição de agosto faz-se no ficheiro.
- Notas e classificações. O schema já tem `rating` e `note`, mas nada os escreve ainda.
- Estatísticas — pratos mais feitos, médias por mês. A contagem por entrada é quanto chega para já.
- Filtrar e pesquisar dentro do histórico.

## Questões em aberto

- Q5 — fechada, e **revista**: o histórico é manual nas duas portas. Ver
  `docs/product/open-questions.md`.

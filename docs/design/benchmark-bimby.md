# Benchmark — companion app da Bimby

A Bimby é a referência de origem deste projeto: o planeamento original diz "app semelhante ao
software que está integrado nas Bimby". A companion app é o benchmark mais próximo do que se quer
construir, e vale a pena estudá-la a sério antes de desenhar seja o que for.

**Estado:** à espera de material. Screenshots e notas por recolher.

## O que interessa observar

Perguntas concretas a fazer a cada ecrã, para a recolha não ser só "isto é bonito":

### Catálogo

- Quantas receitas por ecrã, e que informação cabe num cartão sem o tornar ilegível?
- Como estão organizados os filtros, e quantos toques custa aplicar um?
- Há pesquisa por texto? É usada, ou os filtros chegam?

### Detalhe da receita

- Que ordem têm as secções, e o que fica acima da dobra?
- Como mostram ingredientes com sub-preparações (molho, massa, recheio)? É a proposta P1 em
  `docs/product/metadata-receitas.md` a ser posta à prova por quem já resolveu o problema.
- Como tratam doses e o recálculo para outro número de pessoas?

### Execução passo a passo

É o ecrã mais importante para copiar bem, porque é o que mais se aproxima da experiência que se
quer no tablet suspenso.

- Um passo por ecrã ou vários visíveis?
- Onde estão os ingredientes em relação ao passo?
- Como aparecem os temporizadores, e o que acontece quando um acaba enquanto se está noutro passo?
- Como se avança — botão, gesto, toque em qualquer sítio?

### Planeamento e compras

- Como representam um dia com vários pratos?
- A lista de compras agrupa por zona de supermercado?

## O que **não** copiar

O tablet está na parede, não na mão. Tudo o que a Bimby resolve para um ecrã de 6,8 polegadas a 30 cm
de distância tem de ser reavaliado para 10 polegadas a 70 cm. Densidade de informação e tamanhos de
toque não se transportam.

E a Bimby resolve um problema que este produto não tem: conduzir um robot. Passos com temperaturas,
velocidades e tempos de máquina não têm equivalente aqui.

## Como registar

Guardar as imagens em `docs/design/benchmark/` e referenciá-las aqui. Uma referência sem nota não
serve — o que interessa não é a imagem, é o que dela se vai aproveitar ou rejeitar, e porquê.

```
### Bimby — execução passo a passo
![](benchmark/bimby-execucao.jpg)
A levar: ...
A evitar: ...
```

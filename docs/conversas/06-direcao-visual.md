# Conversa 6 — Direção visual

**Estado:** Por começar
**Conduz:** Claude
**Destino das decisões:** `docs/design/design-system.md`
**Fecha:** Q2 e Q10
**A falar depois de:** conversas 2 e 3, com os ecrãs frescos
**Em movimento:** só metade. As perguntas 1, 2, 5 e 6 são conversa e discutem-se a andar. As 3 e 4, e
a escolha final entre direções, precisam de um ecrã à frente — ficam para uma sessão sentada.

## Porque existe

No planeamento original isto eram duas perguntas sem resposta: "Cores — verdes, assim com aspeto
saudável?" e "Estética — minimalista? decorada?". Ambas com ponto de interrogação. Continuam por
decidir; o que está na app agora é um verde provisório que escolhi por defeito.

## O que já está fechado

Restrições que qualquer direção visual tem de respeitar, por causa do contexto e não do gosto:

- Texto de corpo nunca abaixo de 18px; passos a 24px
- Alvos de toque de 56px, com 12px entre eles
- Contraste AA no mínimo
- Sem webfonts — o tablet pode estar offline
- Sem animações em loop, sem branco puro a ecrã inteiro (fica horas ligado)
- Acento só na ação e no estado ativo (do benchmark do Cookidoo)

## As minhas perguntas de arranque

1. **Porquê verde?** Escreveste "verdes, assim com aspeto saudável?" — com ponto de interrogação, o
   que sugere que era palpite, não convicção. Vale a pena testar: o Cookidoo é verde, e talvez a
   ideia venha daí. Se o objetivo é "saudável", há caminhos melhores do que a cor — fotografia,
   espaço, tipografia. Se o objetivo é "calmo numa cozinha", talvez nem seja verde.

2. **Este ecrã vai estar ligado na parede horas seguidas.** Isso é um constrangimento pouco comum:
   tem de ser legível de longe e ao mesmo tempo não incomodar quando ninguém está a olhar. Aponta
   para superfícies calmas e um único ponto de cor. Concordas, ou preferes que puxe os olhos?

3. **Fotografia grande ou informação densa?** São inconciliáveis. Com imagens grandes cabem seis
   receitas por ecrã e é bonito; com imagens pequenas cabem vinte e encontra-se mais depressa. E há
   uma pergunta prática por trás: vais mesmo ter fotografias de todas as receitas? (Q8) Se metade não
   tiver imagem, uma grelha construída à volta de imagens fica pobre.

4. **Claro, escuro, ou os dois conforme a hora?** A cozinha de manhã com sol e a cozinha à noite são
   ambientes diferentes. Já deixei os dois temas definidos nos tokens, portanto o custo é baixo — a
   pergunta é se o automático te agrada ou irrita.

5. **Que apps é que tu achas bonitas?** Não têm de ser de cozinha. É a pergunta mais útil que te
   posso fazer sobre gosto, porque revela mais do que qualquer adjetivo.

6. **"Minimalista ou decorada" é uma falsa escolha.** O que interessa mesmo é: onde é que queres
   personalidade? Numa app doméstica, um toque de carácter — um ícone desenhado à mão, uma frase, uma
   cor inesperada num sítio pequeno — faz mais do que decorar tudo.

## Como se fecha

Não por argumento. Duas ou três direções aplicadas ao **mesmo** ecrã de catálogo e ao mesmo detalhe,
lado a lado, numa tela do Claude Design (Q10) — vê-se e escolhe-se. A direção escolhida passa depois
para `design-system.md`, que é a source of truth; a tela é oficina.

## Registo da conversa

_(por começar)_

## Decisões tomadas

| Decisão | Onde ficou registada |
|---|---|

# Conversa 4 — Modo cozinha

**Estado:** Por começar
**Conduz:** Claude
**Destino das decisões:** `docs/specs/005-modo-cozinha.md`
**Prioridade:** Pode esperar — é M5. Mas é o ecrã que justifica o tablet estar na parede.

> **Já existe uma primeira versão construída**, com escolhas provisórias tomadas por mim para não
> ficar parado: dois botões grandes em baixo para avançar e recuar, o passo seguinte em pequeno por
> baixo, e nenhuma proteção contra toque acidental. Nada disto está decidido — a conversa continua a
> ser esta, e agora tens uma coisa concreta para contrariar em vez de imaginares.

## Porque existe

É o que mais se aproxima da experiência Bimby, e o único ecrã usado com as mãos ocupadas, sujas ou
molhadas. Todas as regras de interface normais são suspeitas aqui.

## O que já está fechado

- Ecrã inteiro, sem navegação à volta
- Um passo de cada vez, tipografia grande (24px no mínimo)
- Ingredientes do passo visíveis junto ao passo
- Ecrã mantido ligado (Wake Lock API — existe no Fire OS 7)
- Temporizadores por passo, vários em simultâneo

## As minhas perguntas de arranque

1. **Como é que avanças de passo com as mãos sujas?** É a pergunta que decide o ecrã todo. Hipóteses:
   toque em qualquer sítio da metade direita; um botão enorme em baixo; voz. A minha aposta é o toque
   numa zona grande, porque voz numa cozinha com exaustor ligado é uma promessa que não se cumpre —
   mas se tens experiência ao contrário, quero saber.

2. **Um passo de cada vez, mesmo?** É o que está na spec e é o que a Bimby faz. Mas às vezes queres
   ver o passo seguinte para saber o que aí vem — "enquanto isto coze, vou cortando". Proponho: o
   passo atual grande, e o seguinte em cinzento pequeno por baixo. Complica ou ajuda?

3. **Um toque acidental — cotovelo, pano, gato — faz-te perder o sítio.** Vale a pena proteger?
   Formas: pedir confirmação para recuar mas não para avançar; ou uma zona de toque que exija
   deliberação. Ou não fazer nada, porque recuar é barato.

4. **Quantos temporizadores em simultâneo é realista na tua cozinha?** Se for um, a interface é
   trivial. Se forem três, é preciso saber a que passo pertence cada um, e isso é outro desenho.

5. **Quando um temporizador toca e estás noutro passo, o que devia acontecer?** Voltar ao passo do
   temporizador é intrusivo. Só avisar pode passar despercebido com barulho de cozinha.

6. **Marcar ingredientes já usados?** Não está na spec. Numa receita com doze ingredientes, ajuda a
   não repetir o sal. Ou é trabalho a mais no meio de cozinhar?

7. **Como sabes que acabaste?** O último passo é "sirva". Depois disso, o que devia o ecrã fazer —
   perguntar se correu bem, voltar à receita, ou apagar-se e deixar-te comer?

## Registo da conversa

_(por começar)_

## Decisões tomadas

| Decisão | Onde ficou registada |
|---|---|

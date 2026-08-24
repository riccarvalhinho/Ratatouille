# Spec 005 — Modo cozinha

**Milestone:** M5
**Estado:** Primeira versão construída — ver "O que já existe" 
**Depende de:** spec 002 (detalhe)

## Objetivo

Cozinhar a receita do princípio ao fim olhando para o tablet na parede, sem lhe tocar mais do que o
necessário e sem perder o sítio onde se ia.

É a funcionalidade que mais se aproxima da experiência das Bimby, e a razão de o tablet estar na parede.

## Comportamento

### Entrada

Um botão "Cozinhar" no detalhe da receita. Entra em ecrã inteiro, sem navegação da app à volta.

### Ecrã de execução

- **Um passo de cada vez**, ocupando o ecrã, com tipografia grande (`--text-step`, 24px mínimo)
- Indicação de progresso: passo 3 de 9
- Os ingredientes desse passo visíveis junto ao passo, para não ser preciso voltar atrás
- **O passo seguinte em pequeno**, num cartão fixo no canto inferior direito, cortado às duas linhas.
  Serve para planear enquanto se cozinha ("enquanto isto aloura, vou desfiando o bacalhau") e não
  para saber o que vem a seguir no instante em que se toca no botão.
- Ecrã mantido ligado durante toda a execução (Wake Lock API, com recuo para as definições do tablet)

### Toque (conversa 4)

A regra que governa este ecrã: **só os botões da barra de baixo, o "Sair" e os controlos dos
temporizadores reagem ao toque.** Todo o resto — o texto do passo, os ingredientes, a barra de
progresso, o cartão do passo seguinte — é área morta.

Isso é, ao mesmo tempo, a proteção contra o toque acidental. Um cotovelo, um pano ou um salpico
caem quase sempre em zona morta, e portanto não é preciso confirmar nada: uma confirmação custaria
um toque em cada passo para evitar um erro raro.

A barra de baixo tem **dois ou três alvos redondos**, com relevo de 3px que os faz parecer premíveis
e que afunda ao toque:

| Alvo | Forma | Quando existe |
|---|---|---|
| Recuar | Círculo de 96px, seta ← | Sempre (inativo no primeiro passo) |
| Temporizador | Círculo de 112px | Só quando o passo declara `durationMinutes` |
| Avançar | Círculo de 112px, seta → | Todos os passos menos o último |
| Terminar | Pastilha de 220px com palavra | Só no último passo |

Um círculo tem menos área do que um retângulo da mesma altura, mas o dedo acerta melhor: o alvo tem
centro, e não cantos que não se alcançam com o braço esticado.

Os alvos ficam **juntos ao centro**, com 48px entre eles — o dobro do mínimo do design system.
Espalhá-los pelos cantos separaria mais o recuar do avançar, mas fazia da barra uma faixa pesada de
canto a canto e obrigava a procurar onde estão. Agrupados, olha-se para um sítio só. Quando o passo
não tem duração, o alvo do meio desaparece e os outros dois voltam a centrar-se.

**Terminar muda de forma**, e não só de palavra. Ao fim de doze passos iguais, um círculo verde no
mesmo sítio seria tocado em piloto automático; uma pastilha não.

### Símbolos

As setas dispensam palavra por serem universais. O temporizador não dispensaria — por isso traz
sempre um número por baixo do símbolo, que faz de legenda e é ao mesmo tempo a informação que se
quer ler.

Todos os símbolos são **SVG desenhado, não caracteres**. O "▶" é U+25B6 e tem variante de emoji: em
Android há fontes que o desenham a cores e a outro tamanho, e num botão onde o símbolo é a única
legenda isso não é aceitável. Ficam em `app/src/ui/icons.tsx`.

### Timers

Passos com duração declarada (`durationMinutes`) ganham o botão do meio da barra de baixo. Esse
botão é o temporizador **daquele passo** e tem quatro estados, sempre com ícone e palavra — um ícone
sozinho obrigava a descobrir o que faz, e aqui não há hover que ajude:

| Estado | Mostra | O toque faz |
|---|---|---|
| Por iniciar | Play + a duração ("8 min") | Inicia |
| A correr | Pausa + a conta decrescente | Pausa |
| Em pausa | Play + a conta decrescente | Retoma |
| Terminado | Repetir + "pronto" | Repete |

A faixa de temporizadores no topo mostra só os temporizadores de **outros** passos. O do passo atual
vive no botão, e ter o mesmo número em dois sítios é ruído num ecrã que se lê a 70cm.

Quando o passo declara `temperatureC`, a temperatura aparece **como dado** junto à duração — "200 °C",
"25 min" — e não enterrada no meio da frase. São etiquetas, não alvos de toque.

Passos marcados como `passive` são aqueles em que se sai da cozinha: levedar, arrefecer, assar sem
mexer. Esses **avisam** quando acabam. Um passo ativo, em que se está a olhar para o tacho, não
precisa de alarme e não deve interromper.

Ao ser iniciado:

- Conta decrescente visível no ecrã
- Continua a contar ao avançar para o passo seguinte — pode haver mais do que um timer a correr
- Ao terminar, avisa de forma visível e audível
- Dá para pausar e reiniciar

### Saída

Terminar a receita fecha o modo cozinha e oferece marcar como cozinhada, alimentando o histórico
(depende de como a Q5 for resolvida).

## Critérios de aceitação

- [x] "Cozinhar" abre o modo em ecrã inteiro
- [x] Um passo de cada vez, com progresso visível
- [x] Avançar e recuar têm alvos de toque de pelo menos 56×56px — são círculos de 96 e 112px
- [x] Os alvos estão agrupados ao centro, com pelo menos 24px entre eles — são 48px
- [x] O último passo troca o círculo de avançar por uma pastilha "Terminar"
- [x] Fora dos botões, do "Sair" e dos controlos de temporizador, nada no ecrã reage ao toque
- [x] Os ingredientes do passo aparecem junto ao passo
- [x] O passo seguinte aparece em pequeno, sem roubar largura ao passo atual
- [x] O ecrã não adormece durante a execução
- [x] Passos com duração oferecem temporizador
- [x] A temperatura aparece em destaque quando o passo a declara
- [x] Passos passivos avisam ao terminar; passos ativos não interrompem
- [x] Vários temporizadores podem correr ao mesmo tempo, e continuam visíveis ao mudar de passo
- [x] O fim de um temporizador avisa visual e sonoramente
- [ ] Terminar oferece marcar como cozinhada — depende do M2
- [x] Tudo funciona offline
- [x] Sair a meio e voltar não perde o sítio: o passo vive no URL

## Fora de âmbito

- Comandos de voz
- Vídeo ou imagens por passo
- Sincronizar a execução entre dispositivos

## Questões em aberto

- Escalar doses antes de começar a cozinhar — só por múltiplos simples
- Q5 — como o histórico é alimentado
- Q1 — a Wake Lock API pode não existir num Fire OS antigo

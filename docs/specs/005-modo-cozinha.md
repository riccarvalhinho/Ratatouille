# Spec 005 — Modo cozinha

**Milestone:** M5
**Estado:** Rascunho
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
- Avançar e recuar com alvos de toque grandes nas laterais
- Os ingredientes desse passo visíveis junto ao passo, para não ser preciso voltar atrás
- Ecrã mantido ligado durante toda a execução (Wake Lock API, com recuo para as definições do tablet)

### Timers

Passos com duração declarada (`durationMinutes`) mostram um botão de temporizador. Quando o passo
declara `temperatureC`, a temperatura aparece **como dado** junto ao temporizador — "Forno a 200 °C,
25 min" — e não enterrada no meio da frase.

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

- [ ] "Cozinhar" abre o modo em ecrã inteiro
- [ ] Um passo de cada vez, com progresso visível
- [ ] Avançar e recuar têm alvos de toque de pelo menos 56×56px
- [ ] Os ingredientes do passo aparecem junto ao passo
- [ ] O ecrã não adormece durante a execução
- [ ] Passos com duração oferecem temporizador
- [ ] A temperatura aparece em destaque quando o passo a declara
- [ ] Passos passivos avisam ao terminar; passos ativos não interrompem
- [ ] Vários temporizadores podem correr ao mesmo tempo
- [ ] O fim de um temporizador avisa visual e sonoramente
- [ ] Terminar oferece marcar como cozinhada
- [ ] Tudo funciona offline

## Fora de âmbito

- Comandos de voz
- Vídeo ou imagens por passo
- Sincronizar a execução entre dispositivos

## Questões em aberto

- Escalar doses antes de começar a cozinhar — só por múltiplos simples
- Q5 — como o histórico é alimentado
- Q1 — a Wake Lock API pode não existir num Fire OS antigo

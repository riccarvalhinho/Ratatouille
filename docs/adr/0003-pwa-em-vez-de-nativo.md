# ADR 0003 — PWA em GitHub Pages, não aplicação nativa

**Data:** 2026-08-23
**Estado:** Aceite

> **Nota de 2026-08-23:** o tablet foi entretanto confirmado como Fire HD 10 de 9.ª geração
> (Fire OS 7, Chromium moderno). A incerteza sobre o WebView que motivava o plano de contingência
> desapareceu — a PWA é o caminho, sem plano B. O empacotamento com Capacitor deixa de ser
> contingência e passa a ser uma opção de distribuição noutros Androids (questão Q11).

## Contexto

O alvo é um tablet Amazon Fire antigo, suspenso na parede da cozinha. Os tablets Fire correm Fire OS,
um derivado do Android sem serviços Google e com a sua própria loja de aplicações. Publicar na
Amazon Appstore para uma app de uso doméstico não faz sentido, o que deixa sideload de APK ou web.

Quando esta decisão foi tomada, o modelo do tablet ainda não estava confirmado, e Fire OS 5 e 6
trazem um WebView bastante datado — daí o cuidado que se segue.

## Decisão

A app é uma progressive web app, compilada com Vite e publicada em GitHub Pages, instalada no tablet
através de "Adicionar ao ecrã inicial".

O build usa target ES2017. Começou por ser precaução perante um WebView desconhecido; agora que o
tablet está confirmado como capaz, mantém-se por outra razão — cobrir Androids mais antigos custa
1,3 kB em 154 kB.

## Alternativas consideradas

**APK nativo (Kotlin, React Native, Flutter).** Melhor controlo do dispositivo — manter o ecrã ligado,
modo kiosk, arranque automático. Rejeitada por agora: exige toolchain de Android, assinatura e
reinstalação manual a cada alteração, num projeto onde o ciclo rápido de iteração vale mais do que o
acesso ao hardware. As capacidades que faltam ou têm equivalente web (Wake Lock API) ou resolvem-se
nas definições do tablet.

**Capacitor a embrulhar a mesma PWA num APK.** É a evolução natural se o WebView do tablet se revelar
demasiado velho, ou se for preciso modo kiosk a sério. Fica registada como plano de contingência
explícito em `docs/ops/tablet-setup.md`. O código da app não muda — é por isso que esta decisão é
barata de reverter.

**Servir a app de um servidor na rede local (Raspberry Pi, NAS).** Acrescenta uma máquina para manter
viva, contra o mesmo princípio de autonomia do ADR 0002.

## Consequências

**Fica fácil:** o deploy é um push. Não há instalação nem atualização manual no tablet — abre-se e está
atualizado. O mesmo código serve tablet, telemóvel e computador, o que resolve de graça a "versão
complementar para telemóvel" prevista no PRD.

**Fica difícil:** o modo kiosk fica por conta das definições do dispositivo. O "manter o ecrã ligado"
resolve-se com a Wake Lock API, que existe neste Fire OS.

**A vigiar:** que o service worker faça mesmo o que promete. Uma app de cozinha que não abre offline
falhou no essencial — está no critério de verificação do M0.

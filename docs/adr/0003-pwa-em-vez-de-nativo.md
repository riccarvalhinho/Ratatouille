# ADR 0003 — PWA em GitHub Pages, não aplicação nativa

**Data:** 2026-08-23
**Estado:** Aceite

## Contexto

O alvo é um tablet Amazon Fire antigo, suspenso na parede da cozinha. Os tablets Fire correm Fire OS,
um derivado do Android sem serviços Google e com a sua própria loja de aplicações. Publicar na
Amazon Appstore para uma app de uso doméstico não faz sentido, o que deixa sideload de APK ou web.

Uma incógnita relevante: o modelo do tablet ainda não está confirmado (questão Q1). Fire OS 5 e 6
trazem um WebView bastante datado.

## Decisão

A app é uma progressive web app, compilada com Vite e publicada em GitHub Pages, instalada no tablet
através de "Adicionar ao ecrã inicial".

Para acomodar a incerteza sobre o WebView, o build usa target ES2017 e evita APIs recentes de browser
enquanto a Q1 não estiver respondida.

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

**Fica difícil:** dependemos do WebView do tablet, uma incógnita até a Q1 fechar. O modo kiosk e o
"manter o ecrã ligado" ficam por conta das definições do dispositivo e da Wake Lock API, que pode não
existir num Fire OS antigo.

**A vigiar:** que o service worker faça mesmo o que promete. Uma app de cozinha que não abre offline
falhou no essencial — está no critério de verificação do M0.

# Conversa 8 — Navegação entre ecrãs

**Estado:** Por começar
**Conduz:** Claude
**Destino das decisões:** `docs/design/design-system.md`, specs dos ecrãs
**Em movimento:** sim — é sobre como se chega a cada sítio, não sobre aspeto

## Porque existe

A navegação é a única coisa que atravessa todos os ecrãs, e por isso não cabe dentro da conversa de
nenhum deles.

## O que já está fechado, e já está construído

Do benchmark do Cookidoo, e agora implementado:

- **Painel vertical à esquerda**, só ícones e uma palavra. Vertical porque, num tablet em horizontal,
  a altura é a dimensão escassa — uma barra em baixo comeria espaço ao conteúdo
- **Quatro destinos:** Hoje, Receitas, Semana, Compras
- **O detalhe da receita abre por cima**, sem sair do ecrã de onde veio, e o "x" devolve lá
- **A rota vive no URL**, portanto sobrevive a um recarregamento — o tablet está horas ligado e vai
  ser recarregado por acidente
- **O acento só no destino ativo**

## O que está por decidir

1. **Há um botão de menu?** O painel mostra quatro destinos. Se aparecerem definições, importar
   receitas, ou o histórico, ou entram no painel — que fica cheio — ou vão para outro sítio.

2. **O modo cozinha sai da navegação?** É ecrã inteiro, sem painel, porque durante a confeção não se
   navega. Isso quer dizer que há um estado da app onde a navegação desaparece. Vale a pena, ou é
   desconcertante?

3. **Favoritos e histórico: destinos ou subtabs?** A spec 001 põe-nos como subtabs dentro das
   receitas. Podiam ser destinos próprios. Depende de com que frequência se vai lá diretamente.

4. **Como se volta atrás?** Numa PWA instalada no ecrã inicial não há botão de retroceder do browser.
   Tudo o que abre tem de ter forma explícita de fechar — hoje só o detalhe tem.

## As minhas perguntas de arranque

1. **Dos quatro destinos, qual é o que abres primeiro nove vezes em dez?** Se for sempre o mesmo,
   é esse que devia ser a home, e não o "Hoje" por ser o primeiro da lista.

   > Provisoriamente a app abre nas **Receitas**, e não no "Hoje". Não por decisão de produto, mas
   > porque o "Hoje" só tem conteúdo a partir do M3 e abrir num marcador deixava a app pior do que
   > era antes de haver navegação. Quando o "Hoje" mostrar o plano do dia, esta pergunta volta a
   > estar em aberto.

2. **"Hoje" e "Semana" são dois destinos ou um?** A home mostra o dia, o planeamento mostra a semana,
   e ambos mostram refeições planeadas. Suspeito que sejam duas vistas da mesma coisa, e que um
   destino com um seletor de dia ou semana chegue — o que liberta espaço no painel.

3. **Quando estás a cozinhar e alguém te interrompe, o que queres que aconteça?** Se saíres do modo
   cozinha para ver outra coisa, ele devia guardar onde ias, ou recomeçar?

## Registo da conversa

_(por começar)_

## Decisões tomadas

| Decisão | Onde ficou registada |
|---|---|

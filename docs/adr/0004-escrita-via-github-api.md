# ADR 0004 — Escritas otimistas em IndexedDB, sincronizadas para o GitHub por outbox

**Data:** 2026-08-23
**Estado:** Aceite e implementado (M2)

## Contexto

Do ADR 0002, os dados são ficheiros no repositório. Mas a app tem de conseguir escrever: marcar um
favorito, planear uma refeição, adicionar uma receita. E tem de o fazer a partir do tablet, sem
servidor no meio.

Duas dificuldades: escrever no GitHub é uma chamada de API que demora segundos, e o tablet está numa
cozinha onde o Wi-Fi nem sempre chega bem. Nenhuma das duas pode fazer com que tocar num coração
pareça lento ou falhe.

## Decisão

Modelo local-first com uma outbox:

1. Toda a alteração escreve **primeiro** em IndexedDB e a interface atualiza logo. Zero latência
   percebida.
2. A alteração entra numa fila de outbox persistente.
3. Um worker esvazia a fila quando há rede, usando a Contents API do GitHub para criar um commit por
   alteração.
4. Se falhar, fica na fila e tenta outra vez com recuo exponencial. Se falhar por conflito de `sha`,
   volta a ler o ficheiro, reaplica a alteração e tenta de novo.
5. A interface mostra o estado da sincronização — nada de commits a falhar em silêncio.

**Autenticação:** um fine-grained personal access token, com acesso apenas a este repositório e
permissão `Contents: read and write`, introduzido uma vez no ecrã de Definições e guardado em
`localStorage`. Nunca chega ao repositório.

## Alternativas consideradas

**GitHub App com OAuth.** Correto do ponto de vista de segurança, mas exige um servidor para guardar o
client secret e fazer a troca do código — o servidor que este projeto inteiro está construído para não
ter.

**Uma função serverless como proxy de escrita.** Esconderia o token, mas volta a introduzir uma
dependência externa que pode adormecer ou mudar de preço. Mesmo argumento do ADR 0002.

**Escrita síncrona, com a interface a esperar pelo commit.** Muito mais simples de implementar, e
inaceitável de usar: tocar num coração ficaria dois segundos a pensar, e falharia sem rede.

## Consequências

**Fica fácil:** a interface é sempre instantânea e funciona offline por construção — o que estiver na
fila sai quando houver rede. Cada alteração fica registada como um commit, portanto o histórico de
"quando é que isto mudou" vem de graça.

**Fica difícil:** a outbox é código com estado e é onde vão aparecer os bugs difíceis. Precisa de testes
a sério para retries, conflitos e arranque com fila pendente.

**Risco de segurança aceite:** quem tiver o tablet na mão consegue extrair o token e escrever no
repositório. É um tablet doméstico numa cozinha, o repositório é pessoal, e o token está limitado a um
único repositório. O risco é conhecido e aceite, não esquecido. Mitigações: definir validade no token
e revogá-lo se o tablet sair de casa.

**A vigiar:** o número de commits. Um por favorito enche o histórico depressa. Se incomodar, agrupar
alterações numa janela de tempo antes de commitar.

## Como ficou implementado (M2)

| Peça | Onde |
|---|---|
| Fila, coalescência e recuo — puro e testado | `app/src/domain/outbox.ts` |
| Serialização dos ficheiros, travada contra os que estão em `data/` | `app/src/domain/repo-files.ts` |
| Persistência da fila e o worker que a esvazia | `app/src/data/outbox-store.ts` |
| Contents API e guarda do token | `app/src/data/github.ts` |
| Estado local: planos, favoritos, histórico | `app/src/data/local-store.ts` |
| Token e estado da sincronização | `app/src/features/definicoes/` |

Três decisões que a ADR não tinha fechado:

**A unidade da fila é o ficheiro, não a alteração.** Uma entrada diz "este ficheiro passa a ter este
conteúdo", e a chave é o caminho. Planear e desplanear cinco vezes antes de haver rede deixa uma
entrada e portanto um commit — que é a resposta ao "a vigiar" acima, resolvido à partida em vez de
mais tarde.

**Conflitos resolvem-se por última-escrita-ganha.** Ao receber recusa por `sha` desatualizado, relê
e volta a escrever. É o correto para um utilizador só (Q7); com duas pessoas a planear, muda.

**A serialização é testada contra o repositório.** `repo-files.test.ts` lê os ficheiros reais de
`data/` e exige que a app produza exatamente o mesmo, byte a byte. Sem isto, um ficheiro mal formado
só daria erro depois do commit, no `validate` do CI — e a app continuaria a mandar mais.

Ao aplicar isto, os ficheiros de `data/state/` foram normalizados para o formato que a app escreve.
Eram compactos à mão; a partir de agora quem os escreve é o tablet, e um formato só evita um diff de
reformatação a cada favorito.

## Quando é que tenta enviar

Ao arrancar (se ficou fila), sempre que algo entra na fila, quando o browser diz `online`, quando o
tablet volta a ficar visível, e de 30 em 30 segundos como rede de segurança. O `visibilitychange`
não estava previsto e é o que mais interessa aqui: um Fire na parede passa horas com o ecrã apagado,
e o evento `online` sozinho não chega para acordar a sincronização.

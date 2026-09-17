# ADR 0006 — Fotografia da fonte, creditada, à frente dos bancos de licença livre

**Data:** 2026-09-17
**Estado:** Aceite

## Contexto

Até aqui a regra era: a fotografia de uma receita vem de fotografia própria, de um banco de licença
livre, ou não vem. Um frame de vídeo ou a foto do site de origem estavam fora, por serem obra de
outra pessoa num repositório público (ADR 0005). O `docs/ops/imagens.md` dizia-o na secção 4.

**A regra não estava a produzir o resultado que prometia.** Os números estão no próprio ficheiro:
das 185 fotografias da segunda corrida, 102 foram recusadas depois de vistas uma a uma; a taxa de
acerto dos bancos anda nos 45%. O padrão das recusas é sempre o mesmo — os arquivos acertam em
pratos com **nome próprio** e falham em tudo o que só tem descrição genérica em inglês.

Ora, uma receita importada de um vídeo ou de um blogue moderno é **exatamente** essa classe: não
tem nome próprio em arquivo nenhum. A massa "Marry Me" de camarão mostrou-o à segunda tentativa —
`shrimp pasta` trouxe esparguete em alho e azeite, `creamy shrimp pasta` trouxe linguine com molho
branco por cima. Dois pratos errados, ambos com licença em ordem.

E daí sai a perversidade que forçou esta decisão: **a regra recusava a fotografia do prato certo
para publicar a fotografia de um estranho de um prato errado.** As duas são obra de outra pessoa.
Só que a segunda não fez esta receita, e mente ao cartão — que é por onde se escolhe a semana à
segunda-feira, sem abrir a receita.

Havia ainda um buraco a somar a isto: **o `source` nunca chegava ao ecrã.** Estava no schema e em
todos os ficheiros, e o `DetalheReceita` renderizava o crédito da *fotografia* e nunca o crédito da
*receita*. O catálogo creditava um estranho do Flickr por uma foto e não creditava quem tinha
escrito aquilo que se estava a cozinhar.

## Decisão

**A fotografia da fonte pode ser usada, creditada, e passa à frente dos bancos de licença livre.**

A ordem de preferência passa a ser:

1. Fotografia própria — `imageCredit: { "license": "própria" }`
2. **Fotografia da fonte da receita**, com `imageCredit` a nomear o autor e a dizer
   `"Todos os direitos reservados"`, e `sourceUrl` para o original
3. Bancos de licença livre (Pexels, Pixabay, Commons, Openverse), como até aqui
4. Sem imagem — continua a ser resultado aceitável

**Toda a receita de proveniência externa passa a ter crédito no ecrã de detalhe**, em rodapé:
"Receita original de X, «Y», aqui reescrita e adaptada", com link para o original. A nota de
adaptação vai colada ao crédito, porque as instruções deste catálogo são sempre reescritas e as
medidas convertidas — dizer só "receita de X" atribuiria a X um texto que não é dele.

Isto aplica-se **daqui para a frente**. As 227 fotografias de banco que já cá estão ficam: têm
licença e já foram vistas uma a uma. Não se abre o catálogo todo para trocar fotos que funcionam.

**As receitas de família mantêm a exceção que já tinham** e continuam sem foto de banco: uma
fotografia de costelas parecidas põe o prato de outra pessoa com o nome da família por cima.

### O que esta decisão não é

**Creditar não é ter licença**, e isto fica escrito para não ser confundido mais tarde por quem
leia só a secção da decisão. Numa CC BY o crédito é a *condição* da licença; numa fotografia de
direitos reservados o crédito é cortesia e não cria permissão nenhuma. O `imageCredit` de uma foto
da fonte serve para dizer de quem é a fotografia — não para fingir que houve autorização.

Portanto isto é uma **decisão de risco assumido**, tomada com o risco à frente e não por distração:

- O repositório é público e o Pages serve `media/recipes/` num URL estável e indexável (ADR 0005).
- A fotografia de comida é, das pontas do direito de autor de pequenos criadores, das mais
  ativamente defendidas — para quem vive de publicar receitas, a foto *é* o ativo comercial.
- Uma queixa, a chegar, chega por email ou por DMCA e resolve-se apagando o ficheiro. O que se
  perde nesse cenário é a imagem, não a receita.

**A saída limpa é sempre a mesma:** cozinhar o prato, fotografá-lo, e a imagem passa a `própria`.
Toda a foto de fonte é um empréstimo até esse dia.

## Alternativas consideradas

**Manter a regra e viver com fotos de banco medianas.** Rejeitada pelo que está no contexto: para
esta classe de receitas os bancos não dão fotografia mediana, dão fotografia do prato errado. Uma
foto errada é pior do que nenhuma, e nesse caso a regra estava a escolher entre nenhuma e errada.

**Hotlink à imagem original, sem a copiar para o repositório.** Evitaria a redistribuição, que é o
ponto sensível. Rejeitada por partir a regra 3 do CLAUDE.md: a app tem de abrir e funcionar na
cozinha sem rede, e uma imagem servida do `fbcdn.net` não existe offline. Também caducaria — os
URLs de CDN do Facebook trazem assinatura com validade.

**Guardar a imagem fora do Git, só no tablet.** Rejeitada por não haver onde: o `bundle` e o deploy
do Pages são o que põe as imagens no tablet, portanto ficar fora do Git é ficar fora da app. Não
havia aqui um atalho de engenharia por descobrir; era uma escolha direta.

**Pagar bancos de fotografia de comida.** Resolveria a qualidade com licença em ordem. Rejeitada
pelo mesmo princípio de custo zero do ADR 0002 — e não resolveria a identidade: um banco pago
continua a não ter fotografia *desta* receita.

## Consequências

**Fica fácil:** uma receita importada de um vídeo ou de um blogue passa a ter a fotografia do prato
que ela é. A importação deixa de ter um passo que falha quase sempre, e o cartão da grelha deixa de
mentir. De caminho, o catálogo inteiro — 233 receitas — ganha crédito visível a quem o escreveu,
que é coisa que nunca teve.

**Fica difícil, ou pelo menos diferente:** o repositório passa a conter obra de terceiros sem
licença, e isso é uma responsabilidade que antes não existia. Cada imagem destas é um ficheiro que
pode ter de sair.

**A vigiar:**

- **Que isto não se torne o caminho preguiçoso.** A fotografia própria continua a ser a primeira da
  lista, e é a única que resolve o problema em definitivo. Uma foto de fonte que fique cinco anos no
  repositório é uma foto própria que nunca se tirou.
- **Que as fotos sem licença se encontrem todas num comando.** O `imageCredit.license` diz
  `"Todos os direitos reservados"` nestes casos, portanto um `grep` chega para as listar — e se
  alguma vez houver uma queixa, para as tirar em bloco sem arqueologia.
- **Quantas são.** Se um dia forem a maioria do `media/recipes/`, o catálogo deixou de ser uma
  cozinha com fotografias emprestadas e passou a ser um arquivo do trabalho dos outros. Não há aqui
  um número mágico, mas vale a pena reparar quando acontecer.

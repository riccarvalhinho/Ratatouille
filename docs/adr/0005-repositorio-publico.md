# ADR 0005 — Repositório público, para o GitHub Pages ser gratuito

**Data:** 2026-08-23
**Estado:** Aceite

## Contexto

O ADR 0003 decidiu publicar a app como PWA no GitHub Pages. Ao fazer o primeiro deploy, o workflow
falhou: **o GitHub Pages só publica de repositórios públicos no plano gratuito.** Em repositórios
privados exige GitHub Pro, a 4 € por mês.

Há um detalhe que muda o cálculo: mesmo com Pro, o site publicado é público na mesma. Um repositório
privado protege o código e os ficheiros de dados, não a app no ar. Pagar mantém privado o
repositório, não o produto.

O que está no repositório: receitas, planeamento semanal de refeições, e histórico do que se
cozinhou. Nenhum segredo — e por regra do projeto, nenhum token ou credencial (ADR 0004: o token de
escrita vive só no `localStorage` do tablet).

## Decisão

O repositório é público.

O workflow de deploy usa `actions/configure-pages@v5` com `enablement: true`.

**Isto não chega, e vale a pena registar porquê:** tentámos e o `GITHUB_TOKEN` não tem permissão
para criar o site do Pages — devolve "Resource not accessible by integration", mesmo com
`pages: write` declarado no workflow. O Pages continua a precisar de ser ligado uma vez à mão em
Settings → Pages → Source: GitHub Actions. O `enablement` fica na mesma: é inofensivo depois de o
site existir, e cobre o caso de alguém o desligar por engano.

## Alternativas consideradas

**GitHub Pro, 4 €/mês.** Repositório privado e Pages a funcionar, tudo numa plataforma. Rejeitada:
contraria o princípio de custo zero que motivou o ADR 0002, e compra pouco — o site ficaria público
de qualquer forma. Uma subscrição para uma app de uma casa é exatamente o tipo de dependência que
este projeto foi construído para não ter.

**Manter privado e alojar no Cloudflare Pages ou equivalente.** Zero custo, repositório privado, e
alojamento estático genuinamente não adormece — o problema dos free tiers que pausam era de bases de
dados, não de ficheiros. Era uma resposta legítima. Rejeitada por acrescentar uma segunda plataforma
para manter e credenciais de deploy no CI, para proteger conteúdo que não precisa de proteção.
Fica registada aqui como a saída, caso um dia o repositório tenha de voltar a ser privado.

**Não publicar, correr só localmente.** Mata o objetivo do produto, que é estar num tablet na parede.

## Consequências

**Fica fácil:** o Pages funciona a custo zero, tudo continua numa plataforma só, e o deploy é um
push. O repositório pode ser mostrado a alguém sem tratamento prévio.

**Fica difícil, ou pelo menos diferente:** as receitas, o planeamento da semana e o histórico do que
se cozinhou passam a ser legíveis por qualquer pessoa que encontre o repositório. Escrever continua a
exigir o token, portanto ninguém pode alterar nada — mas ler, pode.

**A vigiar:** a regra de nunca commitar credenciais deixa de ser higiene e passa a ser crítica. Um
token commitado por engano num repositório privado é um susto; num repositório público é uma fuga.
Vale a pena ter o secret scanning do GitHub ligado.

**Se um dia mudar de ideias:** tornar o repositório privado outra vez quebra o Pages. A saída está
acima — Cloudflare Pages, ou equivalente.

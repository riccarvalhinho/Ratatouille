/**
 * Os critérios de triagem contra a taxonomia real de `data/`.
 *
 * O que isto guarda é o **elo entre os dados e os desenhos**, que não tem outra rede. O painel
 * procura o ícone pela chave da label, e se não encontrar não desenha nada — silenciosamente. Uma
 * cultura nova no `labels.json` sem ícone correspondente dá um mosaico com o nome e um buraco, e só
 * se descobre a olhar para o tablet.
 *
 * Vai buscar as labels ao ficheiro em vez de a uma fixture: uma fixture inventada passaria sempre, e
 * o que interessa é que a taxonomia que está mesmo no repositório tenha desenho para tudo.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { icones } from '../ui/icones-triagem.tsx';
import type { Catalogue } from '../data/catalogue.ts';
import { EMPTY_FILTERS } from './filters.ts';
import { contagemSe, criteriosDeTriagem, limparApetencias } from './triagem.ts';
import type { Label } from './types.ts';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const labels = (
  JSON.parse(
    readFileSync(path.join(repoRoot, 'data/taxonomies/labels.json'), 'utf8'),
  ) as { items: Label[] }
).items;

/** Só o que os critérios usam. O resto do catálogo não entra nesta conta. */
const catalogue = {
  recipes: [],
  labelsById: new Map(labels.map((l) => [l.id, l])),
} as unknown as Catalogue;

const criterios = criteriosDeTriagem(catalogue);
const todasAsOpcoes = criterios.flatMap((c) => c.opcoes.map((o) => ({ criterio: c.nome, ...o })));

describe('os critérios de triagem', () => {
  it('são nove, e nenhum vem vazio', () => {
    expect(criterios.map((c) => c.nome)).toEqual([
      'Tipo de refeição',
      'Ingrediente principal',
      'Método',
      'Tempo de confeção',
      'Cultura',
      'Apetite',
      'Ocasião',
      'Autor',
      'Regime',
    ]);
    expect(criterios.filter((c) => c.opcoes.length === 0)).toEqual([]);
  });

  it('o autor cobre o enum inteiro do schema', () => {
    /*
     * O que isto guarda: um `kind` novo no schema sem mosaico no painel não dá erro nenhum — dá
     * receitas que nenhum filtro alcança. Lê-se o schema e não a lista de tipos, porque o schema é
     * o contrato e os tipos são o espelho dele.
     */
    const schema = JSON.parse(
      readFileSync(path.join(repoRoot, 'data/schema/recipe.schema.json'), 'utf8'),
    ) as { properties: { source: { properties: { kind: { enum: string[] } } } } };

    const noPainel = criterios.find((c) => c.id === 'proveniencia')?.opcoes.map((o) => o.id);
    expect(noPainel).toEqual(schema.properties.source.properties.kind.enum);
  });

  it('nenhuma opção aponta para um ícone que não existe', () => {
    const perdidas = todasAsOpcoes
      .filter((o) => o.icone !== undefined && !(o.icone in icones))
      .map((o) => `${o.criterio} › ${o.nome} (chave "${o.icone ?? ''}")`);

    expect(perdidas).toEqual([]);
  });

  it('só os escalões de tempo ficam sem ícone, e é de propósito', () => {
    // O tempo é uma quantidade: o mosaico mostra o número. Quatro relógios com ponteiros
    // diferentes seriam a pior maneira de dizer 20, 40 e 60.
    const sem = todasAsOpcoes.filter((o) => o.icone === undefined).map((o) => o.id);
    expect(sem).toEqual(['ate-20', 'ate-40', 'ate-60', 'mais-de-60']);
  });

  it('dá ícone a todos os critérios', () => {
    const semIcone = criterios.filter((c) => !(c.icone in icones)).map((c) => c.nome);
    expect(semIcone).toEqual([]);
  });

  it('não repete a mesma opção em dois critérios', () => {
    const vistas = new Map<string, string>();
    const repetidas: string[] = [];
    for (const o of todasAsOpcoes) {
      const antes = vistas.get(o.id);
      if (antes) repetidas.push(`"${o.id}" está em ${antes} e em ${o.criterio}`);
      else vistas.set(o.id, o.criterio);
    }
    expect(repetidas).toEqual([]);
  });
});

describe('limparApetencias', () => {
  it('deixa o regime, que corta por regra e não por apetência', () => {
    const cheio = {
      ...EMPTY_FILTERS,
      methods: ['forno' as const],
      semVespera: true,
      sources: ['familia' as const],
      labels: { cultura: ['portuguesa'], regime: ['sem-gluten'] },
    };
    expect(limparApetencias(cheio)).toEqual({
      ...EMPTY_FILTERS,
      labels: { regime: ['sem-gluten'] },
    });
  });

  it('sem regime escolhido, limpa tudo', () => {
    const cheio = { ...EMPTY_FILTERS, labels: { cultura: ['portuguesa'] } };
    expect(limparApetencias(cheio)).toEqual(EMPTY_FILTERS);
  });

  it('não desliga o coração, que está noutro ecrã', () => {
    // O "Limpar" do painel limpa o painel. Apagar uma escolha que quem carregou não está sequer a
    // ver seria o painel a mexer no catálogo pelas costas.
    const cheio = { ...EMPTY_FILTERS, favouritos: true, methods: ['forno' as const] };
    expect(limparApetencias(cheio)).toEqual({ ...EMPTY_FILTERS, favouritos: true });
  });
});

describe('contagemSe', () => {
  const receitas = [
    { id: 'a', labels: ['sopa'], methods: ['tacho'], timing: { prepMinutes: 5, cookMinutes: 5 } },
    { id: 'b', labels: ['salada'], methods: ['sem-confecao'], timing: { prepMinutes: 5, cookMinutes: 0 } },
  ] as unknown as Parameters<typeof contagemSe>[0];

  const opcaoSopa = criterios[0]?.opcoes.find((o) => o.id === 'sopa');

  it('conta o que sobra SE a opção for ligada, sem a ligar', () => {
    expect(opcaoSopa).toBeDefined();
    expect(contagemSe(receitas, EMPTY_FILTERS, opcaoSopa!)).toBe(1);
    // e os filtros de entrada ficam intactos — a contagem é uma pergunta, não uma escolha
    expect(EMPTY_FILTERS.labels).toEqual({});
  });

  it('conta com o coração que está ligado lá fora', () => {
    const soFavoritos = { ...EMPTY_FILTERS, favouritos: true };
    expect(contagemSe(receitas, soFavoritos, opcaoSopa!, new Set(['a']))).toBe(1);
    expect(contagemSe(receitas, soFavoritos, opcaoSopa!, new Set(['b']))).toBe(0);
  });
});

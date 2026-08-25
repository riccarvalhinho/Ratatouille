/**
 * A regra de escrita dos passos, contra as receitas reais de `data/`.
 *
 * O schema garante que uma receita revista tem título em todos os passos. O que ele não consegue
 * garantir é a parte que interessa: que o título e o texto **digam coisas diferentes**. Isso é uma
 * regra de escrita, não de forma, e por isso vive aqui.
 *
 * Existe porque o modo de falhar é conhecido e silencioso. "Temperar o frango" por cima de "Tempere
 * o frango com sal e pimenta" passa em qualquer validador, e só se nota a olhar para o tablet — que
 * é tarde. O importador é assistido por um modelo, e um modelo produz esta redundância de boa fé.
 *
 * O tecto da granularidade — duas esperas nunca cabem no mesmo passo — não tem teste aqui porque já
 * está garantido pela forma: `durationMinutes` é um número, não uma lista. Um teste a confirmá-lo
 * nunca poderia falhar, e um teste que não pode falhar é pior do que nenhum.
 *
 * A regra completa, com o exemplo mau ao lado do bom, está em
 * `.claude/skills/importar-receita/SKILL.md`. Aqui está só a parte que uma máquina consegue apanhar.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import type { Recipe } from './types.ts';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const recipesDir = path.join(repoRoot, 'data', 'recipes');

const recipes = readdirSync(recipesDir)
  .filter((file) => file.endsWith('.json'))
  .map((file) => JSON.parse(readFileSync(path.join(recipesDir, file), 'utf8')) as Recipe);

/** Sem acentos, sem pontuação: "Cozer as batatas" e "cozer as batatas," são a mesma coisa. */
function normalise(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

describe('os passos das receitas do repositório', () => {
  it('tem pelo menos uma receita para verificar', () => {
    expect(recipes.length).toBeGreaterThan(0);
  });

  it('dá título a todos os passos das receitas revistas', () => {
    const semTitulo = recipes
      .filter((recipe) => recipe.status !== 'rascunho')
      .flatMap((recipe) =>
        recipe.steps
          .map((step, index) => ({ recipe: recipe.id, index, step }))
          .filter(({ step }) => !step.title?.trim())
          .map(({ recipe: id, index }) => `${id} passo ${index + 1}`),
      );

    expect(semTitulo).toEqual([]);
  });

  it('nunca repete o título dentro do texto do passo', () => {
    const repetidos = recipes.flatMap((recipe) =>
      recipe.steps
        .map((step, index) => ({ index, step }))
        .filter(({ step }) => step.title && normalise(step.text).includes(normalise(step.title)))
        .map(({ index, step }) => `${recipe.id} passo ${index + 1}: "${step.title}" está dentro do texto`),
    );

    expect(repetidos).toEqual([]);
  });

  it('não deixa o título dizer sozinho tudo o que o passo diz', () => {
    // O piso da granularidade. Um texto mais curto do que o título é sinal de que não sobrou nada
    // para dizer — e um passo que não tem detalhe é um passo que devia estar junto ao vizinho.
    const vazios = recipes.flatMap((recipe) =>
      recipe.steps
        .map((step, index) => ({ index, step }))
        .filter(({ step }) => step.title && step.text.length <= step.title.length)
        .map(({ index, step }) => `${recipe.id} passo ${index + 1}: texto mais curto do que "${step.title}"`),
    );

    expect(vazios).toEqual([]);
  });
});

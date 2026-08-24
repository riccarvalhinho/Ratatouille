/**
 * Encaminhamento por hash, sem biblioteca.
 *
 * Hash e não history API por uma razão prática: o GitHub Pages não sabe reescrever URLs para o
 * index.html, portanto recarregar `/receitas` daria 404. Com hash, o servidor vê sempre a raiz.
 *
 * A rota vive no URL e não em estado de React para o estado sobreviver a um recarregamento — o
 * tablet está horas ligado e vai ser recarregado por acidente.
 */
import { useEffect, useState } from 'react';

export type Screen = 'home' | 'receitas' | 'planeamento' | 'compras';

export interface Route {
  screen: Screen;
  /** Receita aberta em detalhe, por cima do ecrã atual. */
  recipeId?: string;
}

const SCREENS: Screen[] = ['home', 'receitas', 'planeamento', 'compras'];

/**
 * Onde a app abre quando não há rota no URL.
 *
 * É `receitas` e não `home` por uma razão simples: a app deve abrir num ecrã que tem conteúdo. O
 * "Hoje" é a home natural do produto, mas só existe a partir do M3 — até lá, abrir nele significa
 * receber um marcador em vez das receitas, o que é pior do que a app era antes de haver navegação.
 *
 * Quando o "Hoje" mostrar mesmo o plano do dia, isto passa a `home`. A escolha definitiva é a
 * conversa 8, pergunta 1.
 */
const DEFAULT_SCREEN: Screen = 'receitas';

export function parseHash(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const [first, second] = parts;

  const screen = SCREENS.find((s) => s === first) ?? DEFAULT_SCREEN;
  return second ? { screen, recipeId: second } : { screen };
}

export function toHash(route: Route): string {
  return route.recipeId ? `#/${route.screen}/${route.recipeId}` : `#/${route.screen}`;
}

export function navigate(route: Route): void {
  window.location.hash = toHash(route);
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));

  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return route;
}

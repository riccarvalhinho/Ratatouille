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

export function parseHash(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const [first, second] = parts;

  const screen = SCREENS.find((s) => s === first) ?? 'home';
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

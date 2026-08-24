/**
 * Navegação vertical à esquerda, só ícones e uma palavra.
 *
 * Vertical e não uma barra em baixo porque, num tablet em horizontal, a altura é a dimensão escassa —
 * decisão vinda do benchmark do Cookidoo (docs/design/benchmark-bimby.md).
 */
import type { Screen } from '../data/router.ts';
import { toHash } from '../data/router.ts';
import styles from './NavRail.module.css';

interface Destination {
  screen: Screen;
  label: string;
  /** Traço do ícone, desenhado à mão para não trazer uma biblioteca só por causa de quatro ícones. */
  path: string;
}

const DESTINATIONS: Destination[] = [
  { screen: 'home', label: 'Hoje', path: 'M3 11l9-8 9 8M5 10v10h14V10' },
  { screen: 'receitas', label: 'Receitas', path: 'M4 4h7v16H4zM13 4h7v16h-7M7 8h1M16 8h1' },
  {
    screen: 'planeamento',
    label: 'Semana',
    path: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4M9 14h2M14 14h2',
  },
  { screen: 'compras', label: 'Compras', path: 'M4 5h2l2.5 10h9L20 8H7M9 19h.01M17 19h.01' },
];

/*
 * As Definições ficam em baixo, separadas das quatro do produto. É onde vive o token do GitHub e o
 * estado da sincronização — coisas de que só se lembra quando alguma coisa corre mal.
 */
const SETTINGS: Destination = {
  screen: 'definicoes',
  label: 'Definições',
  path: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 8.9 19a1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 5 8.9a1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9.5a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
};

interface NavRailProps {
  current: Screen;
  /** Quantas alterações estão à espera de sair para o GitHub. Marca as Definições quando não é zero. */
  pending?: number;
}

export function NavRail({ current, pending = 0 }: NavRailProps) {
  return (
    <nav className={styles.rail} aria-label="Navegação principal">
      {[...DESTINATIONS, SETTINGS].map((destination) => {
        const active = destination.screen === current;
        return (
          <a
            key={destination.screen}
            className={[
              styles.item,
              active ? styles.active : '',
              destination.screen === 'definicoes' ? styles.settings : '',
            ]
              .filter(Boolean)
              .join(' ')}
            href={toHash({ screen: destination.screen })}
            aria-current={active ? 'page' : undefined}
          >
            <svg
              className={styles.icon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d={destination.path} />
            </svg>
            {destination.label}
            {destination.screen === 'definicoes' && pending > 0 && (
              <span className={styles.badge} aria-label={`${pending} por enviar`}>
                {pending}
              </span>
            )}
          </a>
        );
      })}
    </nav>
  );
}

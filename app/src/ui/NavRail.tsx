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

interface NavRailProps {
  current: Screen;
}

export function NavRail({ current }: NavRailProps) {
  return (
    <nav className={styles.rail} aria-label="Navegação principal">
      {DESTINATIONS.map((destination) => {
        const active = destination.screen === current;
        return (
          <a
            key={destination.screen}
            className={active ? `${styles.item} ${styles.active}` : styles.item}
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
          </a>
        );
      })}
    </nav>
  );
}

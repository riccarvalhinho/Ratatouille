/**
 * Ícones do painel "Apetece-me algo" — 46 desenhos para as 52 posições dos oito critérios.
 *
 * Vêm do Claude Design, a partir do handover em `docs/design/icones-triagem.md`. **A geometria não
 * se edita aqui**: a folha de desenho é `docs/design/icones-triagem.dc.html` e é de lá que se
 * reexporta.
 *
 * Ficam à parte do `icons.tsx` porque são um conjunto com origem própria e um ciclo de revisão
 * próprio — mas seguem as mesmas convenções, para os dois serem indistinguíveis no ecrã: grelha 24,
 * traço 2.5, fill none, stroke currentColor.
 *
 * Tamanhos previstos: 72px no mosaico de opção, 48px no mosaico de critério, 24px na pastilha de
 * filtro do catálogo. Dimensionam-se por `font-size` — o SVG é 1em — e a cor vem do contexto.
 *
 * A única coisa mexida à mão é o `import type { JSX }`: com o transform novo do React esse tipo já
 * não é global. Nenhum caminho de desenho foi tocado.
 */
import type { JSX, SVGProps } from 'react';

export type IconeTriagem = (props: SVGProps<SVGSVGElement>) => JSX.Element;

const base = {
  viewBox: "0 0 24 24",
  width: "1em",
  height: "1em",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

// ── Método ────────────────────────────────────────────────────
export const IconFrigideira: IconeTriagem = (props) => (
  <svg {...base} {...props}>
    <path d="M2.5 10.5h13" />
    <path d="M4 10.5v2.5a4 4 0 0 0 4 4h2a4 4 0 0 0 4-4v-2.5" />
    <path d="M15.5 10.5 21.5 8" />
  </svg>
);

export const IconTacho: IconeTriagem = (props) => (
  <svg {...base} {...props}>
    <path d="M4.5 10.5h15" />
    <path d="M12 7.5v3" />
    <path d="M6 10.5v6a2.5 2.5 0 0 0 2.5 2.5h7a2.5 2.5 0 0 0 2.5-2.5v-6" />
    <path d="M6 12.5H3.5" />
    <path d="M18 12.5h2.5" />
  </svg>
);

export const IconForno: IconeTriagem = (props) => (
  <svg {...base} {...props}>
    <rect x="2.5" y="3.5" width="19" height="17" rx="2" />
    <path d="M2.5 8.5h19" />
    <path d="M6 6h.01" />
    <path d="M9.5 6h.01" />
    <path d="M6.5 12.5h11" />
  </svg>
);

export const IconGrelhador: IconeTriagem = (props) => (
  <svg {...base} {...props}>
    <path d="M2.5 6.5h19" />
    <path d="M2.5 12h19" />
    <path d="M2.5 17.5h19" />
    <path d="M7 6.5v11" />
    <path d="M17 6.5v11" />
  </svg>
);

export const IconAirfryer: IconeTriagem = (props) => (
  <svg {...base} {...props}>
    <rect x="5" y="2.5" width="14" height="19" rx="3" />
    <path d="M5 14.5h14" />
    <path d="M9.5 18h5" />
  </svg>
);

export const IconMicroOndas: IconeTriagem = (props) => (
  <svg {...base} {...props}>
    <rect x="1.5" y="6" width="21" height="12" rx="2" />
    <rect x="4.5" y="9" width="10.5" height="6" rx="1" />
    <path d="M18.5 9.5h.01" />
    <path d="M18.5 12h.01" />
    <path d="M17.5 14.5h2" />
  </svg>
);

export const IconSemConfecao: IconeTriagem = (props) => (
  <svg {...base} {...props}>
    <rect x="2.5" y="16.5" width="19" height="4.5" rx="2" />
    <path d="M8 11 18.5 3c.7 4.3-4.3 9.6-9.6 10z" />
    <path d="M8 11 4.5 14.5" />
  </svg>
);


// ── Apetite ───────────────────────────────────────────────────
export const IconLeve: IconeTriagem = (props) => (
  <svg {...base} {...props}>
    <path d="M2.5 8.5h19" />
    <path d="M4.5 8.5a7.5 8.5 0 0 0 15 0" />
    <path d="M10.5 14.8h3" />
  </svg>
);

export const IconEquilibrado: IconeTriagem = (props) => (
  <svg {...base} {...props}>
    <path d="M2.5 8.5h19" />
    <path d="M4.5 8.5a7.5 8.5 0 0 0 15 0" />
    <path d="M7 12.6h10" />
  </svg>
);

export const IconSubstancial: IconeTriagem = (props) => (
  <svg {...base} {...props}>
    <path d="M2.5 8.5h5" />
    <path d="M16.5 8.5h5" />
    <path d="M4.5 8.5a7.5 8.5 0 0 0 15 0" />
    <path d="M7.5 8.5c1-5 8-5 9 0" />
  </svg>
);


// ── Ocasião ───────────────────────────────────────────────────
export const IconDiaADia: IconeTriagem = (props) => (
  <svg {...base} {...props}>
    <path d="M15 5a7 7 0 1 1 0 14 7 7 0 0 1 0-14z" />
    <path d="M2.5 3.5v5" />
    <path d="M6.5 3.5v5" />
    <path d="M2.5 8.5h4" />
    <path d="M4.5 8.5v12" />
  </svg>
);

export const IconConforto: IconeTriagem = (props) => (
  <svg {...base} {...props}>
    <path d="M2.5 5h19" />
    <path d="M4.5 5v15" />
    <path d="M19.5 5v15" />
    <path d="M2.5 20h19" />
    <path d="M12 17.8c-2.7-1.3-3.6-4.2-1.9-6.5.7 1.9 2.6 1.8 2.8-.4 2.4 1.6 3.5 4.8 1.2 6.9" />
  </svg>
);

export const IconFesta: IconeTriagem = (props) => (
  <svg {...base} {...props}>
    <path d="M2.5 4h7l-1.25 5h-4.5z" />
    <path d="M6 9v7.5" />
    <path d="M4 16.5h4" />
    <path d="M14.5 4h7l-1.25 5h-4.5z" />
    <path d="M18 9v7.5" />
    <path d="M16 16.5h4" />
    <g transform="rotate(-13 6 11)">
      <path d="M2.5 4h7l-1.25 5h-4.5z" />
      <path d="M6 9v7.5" />
      <path d="M4 16.5h4" />
    </g>
    <g transform="rotate(13 18 11)">
      <path d="M14.5 4h7l-1.25 5h-4.5z" />
      <path d="M18 9v7.5" />
      <path d="M16 16.5h4" />
    </g>
  </svg>
);

export const IconSobras: IconeTriagem = (props) => (
  <svg {...base} {...props}>
    <path d="M5 12v8h14v-8" />
    <path d="M21 12h-9L2.5 6" />
    <path d="M12 12V6.6" />
  </svg>
);


// ── Tipo de refeição ──────────────────────────────────────────
export const IconTipoRefeicao: IconeTriagem = (props) => (
  <svg {...base} {...props}>
    <path d="M13.5 5.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13z" />
    <path d="M2 3.5v4" />
    <path d="M6 3.5v4" />
    <path d="M2 7.5h4" />
    <path d="M4 7.5v13" />
    <path d="M21 3.5c1.4 2 1.4 5 0 7v10" />
  </svg>
);

export const IconSopa: IconeTriagem = (props) => (
  <svg {...base} {...props}>
    <path d="M4.5 10h15" />
    <path d="M5.5 10a6.5 8.5 0 0 0 13 0" />
    <path d="M9.5 7c0-1.3 1.6-1.9 1.6-3.2" />
    <path d="M14 7c0-1.3 1.6-1.9 1.6-3.2" />
  </svg>
);

export const IconSalada: IconeTriagem = (props) => (
  <svg {...base} {...props}>
    <path d="M1.5 14h21" />
    <path d="M3.5 14a9 4.5 0 0 0 17 0" />
    <path d="M8.6 12.6C6 12.2 4.6 10.5 5 8.1c2.5.4 4 2 3.6 4.5z" />
    <path d="M12 12.4c-1.8-2.3-1.6-4.7.5-6.6 1.8 2.2 1.6 4.6-.5 6.6z" />
    <path d="M15.6 12.8c-.7-2.5.4-4.5 2.9-5.1.7 2.4-.4 4.4-2.9 5.1z" />
  </svg>
);

export const IconPratoPrincipal: IconeTriagem = (props) => (
  <svg {...base} {...props}>
    <path d="M2 19.5h20" />
    <path d="M4.5 19.5a7.5 7.5 0 0 1 15 0" />
    <path d="M12 12V9.5" />
    <path d="M12 6.5a1.6 1.6 0 1 1 0 3.2 1.6 1.6 0 0 1 0-3.2z" />
  </svg>
);

export const IconAcompanhamento: IconeTriagem = (props) => (
  <svg {...base} {...props}>
    <path d="M4 11.5h16" />
    <path d="M6 11.5a6 4.5 0 0 0 12 0" />
    <path d="M4 11.5c-1.5-.6-1.5-2.8 0-3.4" />
    <path d="M20 11.5c1.5-.6 1.5-2.8 0-3.4" />
  </svg>
);

export const IconSobremesa: IconeTriagem = (props) => (
  <svg {...base} {...props}>
    <path d="M4 19 12 6.5 20 19z" />
    <path d="M7.6 14h8.8" />
    <path d="M9.7 10.8h4.6" />
  </svg>
);

export const IconPequenoAlmoco: IconeTriagem = (props) => (
  <svg {...base} {...props}>
    <path d="M5.5 7.5h11v3.5a5.5 5 0 0 1-11 0z" />
    <path d="M16.5 8.5c2.1 0 3.2 1 3.2 2.5s-1.1 2.5-3.2 2.5" />
    <path d="M2.5 18.5h17" />
  </svg>
);

export const IconSnack: IconeTriagem = (props) => (
  <svg {...base} {...props}>
    <path d="M6.5 5.5h11a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2z" />
    <path d="M9 9.5h.01" />
    <path d="M15 9.5h.01" />
    <path d="M9 14.5h.01" />
    <path d="M15 14.5h.01" />
  </svg>
);

export const IconPaoEBolos: IconeTriagem = (props) => (
  <svg {...base} {...props}>
    <path d="M5 20.5v-8.8c0-1.4.7-2.6 1.9-3.5C8.3 7 10 6.4 12 6.4s3.7.6 5.1 1.8c1.2.9 1.9 2.1 1.9 3.5v8.8z" />
    <path d="M5 20.5h14" />
    <path d="M6.5 11.5h11" />
  </svg>
);


// ── Ingrediente principal ─────────────────────────────────────
export const IconCarne: IconeTriagem = (props) => (
  <svg {...base} {...props}>
    <rect x="7.5" y="4" width="9" height="6" rx="1.6" />
    <rect x="7.5" y="14" width="9" height="6" rx="1.6" />
    <path d="M12 1.8v20.4" />
  </svg>
);

export const IconAves: IconeTriagem = (props) => (
  <svg {...base} {...props}>
    <path d="M17.5 3.5c2.8 2.2 3.4 6.2 1.3 9.1-2.2 3-6.2 3.6-9 1.5-1.4-1-2-2.4-1.9-4 .1-1.7-.2-2.9-1.1-3.7 2.4-2.6 7.4-4.8 10.7-2.9z" />
    <path d="M9.8 14.1 6.2 17.7" />
    <path d="M6.2 17.7c-1 1-2.4 1-3.2.2-.8-.8-.8-2.2.2-3.2" />
  </svg>
);

export const IconPeixe: IconeTriagem = (props) => (
  <svg {...base} {...props}>
    <path d="M20.5 12c-2.5 3.6-6 5.6-9.5 5.6S5 15.6 3.5 12C5 8.4 7.5 6.4 11 6.4s7 2 9.5 5.6z" />
    <path d="M20.5 12 23.5 8.4" />
    <path d="M20.5 12 23.5 15.6" />
    <path d="M7.5 11h.01" />
  </svg>
);

export const IconMarisco: IconeTriagem = (props) => (
  <svg {...base} {...props}>
    <path d="M18.5 5.5c-5.4-.6-10 2.4-11.5 6.6-1.1 3.2.6 6 3.9 6.4 3.2.4 5.9-1.4 6.4-4.1.4-2.4-1.1-4.1-3.6-4.5 1.8-2 3.2-3.4 4.8-4.4z" />
    <path d="M18.5 5.5 21.8 3.4" />
    <path d="M18.5 5.5 21 7.8" />
    <path d="M9.6 11.8 12.4 13.4" />
    <path d="M8.4 15 11.2 16.3" />
  </svg>
);

export const IconOvos: IconeTriagem = (props) => (
  <svg {...base} {...props}>
    <path d="M5 14c0 3.6 3.1 6.2 7 6.2s7-2.6 7-6.2" />
    <path d="M5 14l2.3-1.5L9.6 14l2.4-1.5L14.4 14l2.3-1.5L19 14" />
    <path d="M12 8a2.6 2.6 0 1 1 0 5.2 2.6 2.6 0 0 1 0-5.2z" />
  </svg>
);

export const IconLeguminosas: IconeTriagem = (props) => (
  <svg {...base} {...props}>
    <path d="M6.2 18.2c-2.1-2.1-1.5-6.2 1.5-9.2s7.1-3.6 9.2-1.5c2.1 2.1 1.5 6.2-1.5 9.2s-7.1 3.6-9.2 1.5z" />
    <path d="M10 14h.01" />
    <path d="M14 10h.01" />
  </svg>
);

export const IconLegumes: IconeTriagem = (props) => (
  <svg {...base} {...props}>
    <path d="M7.5 9.5h9l-3.1 10.4c-.4 1.4-2.4 1.4-2.8 0z" />
    <path d="M12 9.5V6" />
    <path d="M12 6c-.4-2-1.9-3-3.9-2.9.1 1.9 1.4 3.1 3.9 2.9z" />
    <path d="M12 6c.4-2 1.9-3 3.9-2.9-.1 1.9-1.4 3.1-3.9 2.9z" />
    <path d="M9.2 14h5.6" />
  </svg>
);

export const IconMassaEArroz: IconeTriagem = (props) => (
  <svg {...base} {...props}>
    <path d="M6 2.5v6" />
    <path d="M10.5 2.5v6" />
    <path d="M15 2.5v6" />
    <path d="M6 8.5h9" />
    <path d="M10.5 8.5 12.9 16.2" />
    <path d="M8.3 17a5.2 3.1 0 1 0 10.4 0 5.2 3.1 0 1 0-10.4 0z" />
    <path d="M10.7 17.7c1.4-1.3 4.1-1.5 5.9-.4" />
  </svg>
);


// ── Cultura ───────────────────────────────────────────────────
export const IconCultura: IconeTriagem = (props) => (
  <svg {...base} {...props}>
    <path d="M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18z" />
    <path d="M3 12h18" />
    <path d="M12 3c3.1 2.6 3.1 15.4 0 18" />
    <path d="M12 3c-3.1 2.6-3.1 15.4 0 18" />
  </svg>
);

export const IconPortuguesa: IconeTriagem = (props) => (
  <svg {...base} {...props}>
    <path d="M4 11.5h16" />
    <path d="M4.5 11.5c0 4 3.2 7.2 7.5 7.2s7.5-3.2 7.5-7.2" />
    <path d="M4.5 13H2.4" />
    <path d="M19.5 13h2.1" />
    <path d="M12 9v2.5" />
  </svg>
);

export const IconItaliana: IconeTriagem = (props) => (
  <svg {...base} {...props}>
    <path d="M4.5 6.5h15L12 20.5z" />
    <path d="M10 10.5h.01" />
    <path d="M14 11.5h.01" />
    <path d="M12 15.5h.01" />
  </svg>
);

export const IconAsiatica: IconeTriagem = (props) => (
  <svg {...base} {...props}>
    <path d="M2.5 13.5h13" />
    <path d="M4 13.5a5.75 5.5 0 0 0 10 0" />
    <path d="M12 11.5 21.5 4" />
    <path d="M14 13.5 22.5 7" />
  </svg>
);

export const IconMediterranica: IconeTriagem = (props) => (
  <svg {...base} {...props}>
    <path d="M4 19.5c6-1 10.5-5 12.5-11" />
    <path d="M9.5 15.2c-1.7-2-1.2-4.3.9-5.4 1.1 2.1.6 4.3-.9 5.4z" />
    <path d="M14.6 8.2a2.1 2.1 0 1 1 0 4.2 2.1 2.1 0 0 1 0-4.2z" />
  </svg>
);

export const IconIndiana: IconeTriagem = (props) => (
  <svg {...base} {...props}>
    <path d="M2 12h12" />
    <path d="M3.5 12a5.25 5 0 0 0 9 0" />
    <path d="M6 8.5c1.5-1.5 4-1.5 5.5 0" />
    <path d="M15.5 14.5c0-2.2 1.7-4 3.7-4s3.7 1.8 3.7 4z" />
    <path d="M15 14.5h8" />
  </svg>
);

export const IconMexicana: IconeTriagem = (props) => (
  <svg {...base} {...props}>
    <path d="M3.5 8.5c0 5.6 3.8 9.5 8.5 9.5s8.5-3.9 8.5-9.5" />
    <path d="M3.5 8.5c1.5-2.2 4.4-3.4 8.5-3.4s7 1.2 8.5 3.4" />
    <path d="M8 6.2c1.4-1.8 3.4-2.6 5.6-2.2" />
    <path d="M15 4.7c1.9.4 3.4 1.4 4.4 2.9" />
  </svg>
);

export const IconFrancesa: IconeTriagem = (props) => (
  <svg {...base} {...props}>
    <path d="M4.5 20c-1.6-1.6-1.6-4.2.8-6.6l8.4-8.4c2.4-2.4 5-2.4 6.6-.8 1.6 1.6 1.6 4.2-.8 6.6l-8.4 8.4c-2.4 2.4-5 2.4-6.6.8z" />
    <path d="M8.6 10.4 11 12.8" />
    <path d="M11.8 7.2 14.2 9.6" />
    <path d="M5.4 13.6 7.8 16" />
  </svg>
);

export const IconAmericana: IconeTriagem = (props) => (
  <svg {...base} {...props}>
    <path d="M3 10.5c0-3.6 4-6.2 9-6.2s9 2.6 9 6.2z" />
    <path d="M3 13.5h18" />
    <path d="M3 16.5h18c0 2.1-1.6 3.7-3.7 3.7H6.7C4.6 20.2 3 18.6 3 16.5z" />
  </svg>
);


// ── Tempo de confeção ─────────────────────────────────────────
export const IconRelogio: IconeTriagem = (props) => (
  <svg {...base} {...props}>
    <path d="M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18z" />
    <path d="M12 7v5.3l3.6 2.1" />
  </svg>
);

export const IconSemVespera: IconeTriagem = (props) => (
  <svg {...base} {...props}>
    <path d="M15.8 3.6A9 9 0 1 0 20.9 15 7 7 0 0 1 15.8 3.6z" />
    <path d="M4 20 20 4" />
  </svg>
);


// ── Regime ────────────────────────────────────────────────────
export const IconVegetariano: IconeTriagem = (props) => (
  <svg {...base} {...props}>
    <path d="M20 4C10 4 4 9.6 4 16c0 2.5 1.6 4 4 4 6.5 0 12-6.1 12-16z" />
    <path d="M6.5 19.5 17 8" />
  </svg>
);

export const IconVegan: IconeTriagem = (props) => (
  <svg {...base} {...props}>
    <path d="M12 20.5v-7" />
    <path d="M12 13.5c-4 0-6.5-2.6-6.5-6.6 4 0 6.5 2.6 6.5 6.6z" />
    <path d="M12 13.5c4 0 6.5-2.6 6.5-6.6-4 0-6.5 2.6-6.5 6.6z" />
  </svg>
);

export const IconSemGluten: IconeTriagem = (props) => (
  <svg {...base} {...props}>
    <path d="M12 21v-6" />
    <path d="M12 15c-3.2 0-5-2-5-5 3.2 0 5 2 5 5z" />
    <path d="M12 15c3.2 0 5-2 5-5-3.2 0-5 2-5 5z" />
    <path d="M4 20 20 4" />
  </svg>
);

export const IconSemLactose: IconeTriagem = (props) => (
  <svg {...base} {...props}>
    <path d="M12 3.6c4 5.1 6 8.4 6 10.6a6 6 0 0 1-12 0c0-2.2 2-5.5 6-10.6z" />
    <path d="M4 20 20 4" />
  </svg>
);

// ── Mapa por chave de opção ───────────────────────────────
export const icones = {
  "frigideira": IconFrigideira,
  "tacho": IconTacho,
  "forno": IconForno,
  "grelhador": IconGrelhador,
  "airfryer": IconAirfryer,
  "micro-ondas": IconMicroOndas,
  "sem-confecao": IconSemConfecao,
  "leve": IconLeve,
  "equilibrado": IconEquilibrado,
  "substancial": IconSubstancial,
  "dia-a-dia": IconDiaADia,
  "conforto": IconConforto,
  "festa": IconFesta,
  "sobras": IconSobras,
  "tipo-refeicao": IconTipoRefeicao,
  "sopa": IconSopa,
  "salada": IconSalada,
  "prato-principal": IconPratoPrincipal,
  "acompanhamento": IconAcompanhamento,
  "sobremesa": IconSobremesa,
  "pequeno-almoco": IconPequenoAlmoco,
  "snack": IconSnack,
  "pao-e-bolos": IconPaoEBolos,
  "carne": IconCarne,
  "aves": IconAves,
  "peixe": IconPeixe,
  "marisco": IconMarisco,
  "ovos": IconOvos,
  "leguminosas": IconLeguminosas,
  "legumes": IconLegumes,
  "massa-e-arroz": IconMassaEArroz,
  "cultura": IconCultura,
  "portuguesa": IconPortuguesa,
  "italiana": IconItaliana,
  "asiatica": IconAsiatica,
  "mediterranica": IconMediterranica,
  "indiana": IconIndiana,
  "mexicana": IconMexicana,
  "francesa": IconFrancesa,
  "americana": IconAmericana,
  "relogio": IconRelogio,
  "sem-vespera": IconSemVespera,
  "vegetariano": IconVegetariano,
  "vegan": IconVegan,
  "sem-gluten": IconSemGluten,
  "sem-lactose": IconSemLactose,
} satisfies Record<string, IconeTriagem>;

export type ChaveIcone = keyof typeof icones;

// ── Ícone de cada critério ────────────────────────────────
// Cinco critérios reutilizam uma das suas opções; o Tempo usa um relógio próprio,
// partilhado pelos escalões (que são numerais em texto, não ícones).
export const iconesCriterio = {
  "tipo-refeicao": IconTipoRefeicao,
  "ingrediente": IconAves,
  "metodo": IconFrigideira,
  "tempo": IconRelogio,
  "cultura": IconCultura,
  "apetite": IconEquilibrado,
  "ocasiao": IconFesta,
  "regime": IconVegetariano,
} satisfies Record<string, IconeTriagem>;

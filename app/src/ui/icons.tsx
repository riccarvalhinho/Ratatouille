/**
 * Ícones desenhados em SVG e não escritos como caracteres.
 *
 * Um "▶" é U+25B6, que tem variante de emoji: em Android há fontes que o desenham a cores e a outro
 * tamanho. O mesmo vale para "❚❚" e "↺", que nem sequer existem em todas as fontes. Num ecrã onde o
 * ícone é a única legenda do botão, isso não é aceitável — em SVG o desenho é sempre o mesmo e a
 * espessura do traço é escolhida por nós.
 *
 * Herdam `currentColor` e escalam com `1em`, portanto quem os usa controla cor e tamanho pelo CSS.
 */

interface IconProps {
  /** Descrição para leitores de ecrã. Sem isto o ícone é decorativo e fica escondido. */
  title?: string;
}

function Svg({ title, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      focusable="false"
    >
      {title && <title>{title}</title>}
      {children}
    </svg>
  );
}

export function IconPrev(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M19 12H5" />
      <path d="M11 6l-6 6 6 6" />
    </Svg>
  );
}

export function IconNext(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </Svg>
  );
}

export function IconPlay(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M7 4.5l13 7.5-13 7.5z" fill="currentColor" strokeWidth="2" />
    </Svg>
  );
}

export function IconPause(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 4.5v15" />
      <path d="M16 4.5v15" />
    </Svg>
  );
}

export function IconRepeat(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 12a8 8 0 1 1 2.6 5.9" />
      <path d="M3.5 20.5v-5h5" />
    </Svg>
  );
}

export function IconDismiss(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </Svg>
  );
}

import styles from './LabelChip.module.css';

interface LabelChipProps {
  children: string;
  /** Destaca a etiqueta — usado para a dificuldade, que se lê antes das outras. */
  accent?: boolean;
}

export function LabelChip({ children, accent = false }: LabelChipProps) {
  return <span className={accent ? `${styles.chip} ${styles.accent}` : styles.chip}>{children}</span>;
}

/**
 * Marcador para ecrãs que ainda não existem.
 *
 * Diz **o que falta e onde se decide**, em vez de um "brevemente" que não informa ninguém. Um ecrã
 * vazio num tablet na parede parece uma avaria; um ecrã que explica o que lhe falta, não.
 */
import styles from './PorConstruir.module.css';

interface PorConstruirProps {
  title: string;
  children: string;
  spec: string;
  milestone: string;
  /** Ficheiro da conversa onde as decisões que faltam vão ser tomadas. */
  conversa?: string;
}

export function PorConstruir({ title, children, spec, milestone, conversa }: PorConstruirProps) {
  return (
    <div className={styles.wrap}>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.detail}>{children}</p>
      <p className={styles.meta}>
        {milestone} · <code>{spec}</code>
        {conversa && (
          <>
            {' · falta decidir em '}
            <code>{conversa}</code>
          </>
        )}
      </p>
    </div>
  );
}

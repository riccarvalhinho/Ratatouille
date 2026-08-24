/**
 * Modo cozinha. Ver docs/specs/005-modo-cozinha.md.
 *
 * Um passo de cada vez em ecrã inteiro, com os ingredientes desse passo à mão e os temporizadores
 * sempre visíveis. É o ecrã que justifica o tablet estar na parede, e o único usado com as mãos
 * ocupadas — daí os alvos de toque de 72px e a tipografia a 32px.
 *
 * Da conversa 4 ficou decidido que só os botões da barra de baixo e os controlos dos temporizadores
 * reagem ao toque. Todo o resto do ecrã é área morta — é essa a proteção contra o cotovelo e o
 * salpico, e não uma confirmação extra que custaria um toque em cada passo.
 */
import { useCallback, useEffect, useState } from 'react';
import { playAlarm } from '../../data/alarm.ts';
import { describeIngredient, formatMinutes } from '../../data/catalogue.ts';
import type { Catalogue } from '../../data/catalogue.ts';
import type { LocalStore } from '../../data/local-store.ts';
import { useKeepAwake } from '../../data/wake-lock.ts';
import type { Recipe } from '../../domain/types.ts';
import { IconDismiss, IconNext, IconPause, IconPlay, IconPrev, IconRepeat } from '../../ui/icons.tsx';
import {
  createTimer,
  formatCountdown,
  isDone,
  isRunning,
  pause,
  remainingMs,
  reset,
  resume,
  timersToAnnounce,
  type Timer,
} from '../../domain/timers.ts';
import styles from './ModoCozinha.module.css';

interface ModoCozinhaProps {
  recipe: Recipe;
  catalogue: Catalogue;
  store: LocalStore;
  /** Data de hoje em ISO. É a data que entra no histórico ao marcar como cozinhada. */
  today: string;
  onLeave: () => void;
}

export function ModoCozinha({ recipe, catalogue, store, today, onLeave }: ModoCozinhaProps) {
  const [index, setIndex] = useState(0);
  const [timers, setTimers] = useState<Timer[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const [finished, setFinished] = useState(false);

  useKeepAwake(true);

  // Um tique por segundo só para redesenhar. A contagem vem do relógio, portanto atrasos aqui
  // não atrasam os temporizadores.
  useEffect(() => {
    if (timers.length === 0) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [timers.length]);

  // Passos passivos avisam ao acabar; ativos não interrompem, porque já se está a olhar.
  useEffect(() => {
    const toAnnounce = timersToAnnounce(timers, now);
    if (toAnnounce.length === 0) return;

    playAlarm();
    const announced = new Set(toAnnounce.map((t) => t.id));
    setTimers((current) => current.map((t) => (announced.has(t.id) ? { ...t, acknowledged: true } : t)));
  }, [timers, now]);

  const step = recipe.steps[index];
  const nextStep = recipe.steps[index + 1];
  const isLast = index === recipe.steps.length - 1;
  // O botão do meio controla o temporizador deste passo. Se houver mais do que um (o passo foi
  // repetido), manda o último, que é o que se acabou de mexer.
  const stepTimer = [...timers].reverse().find((t) => t.stepIndex === index);
  const otherTimers = timers.filter((t) => t !== stepTimer);

  const startTimer = useCallback(() => {
    if (!step?.durationMinutes) return;
    setTimers((current) => [
      ...current,
      createTimer(
        {
          stepIndex: index,
          label: `Passo ${index + 1}`,
          minutes: step.durationMinutes!,
          passive: step.passive ?? false,
        },
        Date.now(),
      ),
    ]);
    setNow(Date.now());
  }, [index, step]);

  const updateTimer = (id: string, change: (timer: Timer, at: number) => Timer) => {
    const at = Date.now();
    setTimers((current) => current.map((t) => (t.id === id ? change(t, at) : t)));
    setNow(at);
  };

  if (finished) {
    const alreadyCooked = store.wasCookedOn(recipe.id, today);

    return (
      <div className={styles.screen}>
        <div className={styles.done}>
          <h2 className={styles.doneTitle}>Feito.</h2>

          {/*
            Marcar é deliberado e não automático.
            A Q5 continua aberta, mas de um lado só: chegar ao último passo não prova que se comeu.
            Um histórico que se enche sozinho de refeições que não aconteceram não serve para
            responder à pergunta que existe para responder — "já chega para repetir?".
          */}
          {alreadyCooked ? (
            <p className={styles.doneNote}>Já está no histórico de hoje. Bom apetite.</p>
          ) : (
            <>
              <p className={styles.doneNote}>
                Marcar entra no histórico e alimenta o "última vez que fiz isto" no detalhe.
              </p>
              <button
                type="button"
                className={`${styles.navButton} ${styles.primary} ${styles.finish}`}
                onClick={() => store.markCooked(recipe.id, today)}
              >
                Marcar como cozinhada
              </button>
            </>
          )}

          <button
            type="button"
            className={`${styles.navButton} ${styles.finish} ${styles.secondary}`}
            onClick={onLeave}
          >
            Voltar à receita
          </button>
        </div>
      </div>
    );
  }

  const stepIngredients = (step?.ingredientRefs ?? [])
    .map((ref) => recipe.ingredients.find((item) => item.ref === ref))
    .filter((item): item is NonNullable<typeof item> => item !== undefined);

  return (
    <div className={styles.screen}>
      <div className={styles.top}>
        <span className={styles.recipeName}>{recipe.name}</span>
        <span className={styles.progressText}>
          Passo {index + 1} de {recipe.steps.length}
        </span>
        <button type="button" className={styles.leave} onClick={onLeave}>
          Sair
        </button>
      </div>

      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${((index + 1) / recipe.steps.length) * 100}%` }}
        />
      </div>

      {otherTimers.length > 0 && (
        <div className={styles.timers}>
          {otherTimers.map((timer) => {
            const done = isDone(timer, now);
            return (
              <div key={timer.id} className={done ? `${styles.timer} ${styles.timerDone}` : styles.timer}>
                <span className={styles.timerLabel}>{timer.label}</span>
                <span className={styles.timerValue}>
                  {done ? 'pronto' : formatCountdown(remainingMs(timer, now))}
                </span>
                {done ? (
                  <button
                    type="button"
                    className={styles.timerAction}
                    onClick={() => setTimers((c) => c.filter((t) => t.id !== timer.id))}
                    aria-label="Dispensar"
                  >
                    <IconDismiss />
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className={styles.timerAction}
                      onClick={() => updateTimer(timer.id, isRunning(timer) ? pause : resume)}
                      aria-label={isRunning(timer) ? 'Pausar' : 'Retomar'}
                    >
                      {isRunning(timer) ? <IconPause /> : <IconPlay />}
                    </button>
                    <button
                      type="button"
                      className={styles.timerAction}
                      onClick={() => updateTimer(timer.id, reset)}
                      aria-label="Reiniciar"
                    >
                      <IconRepeat />
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className={styles.body}>
        <div>
          <p className={styles.stepText}>{step?.text}</p>

          <div className={styles.stepBadges}>
            {step?.temperatureC && <span className={styles.badge}>{step.temperatureC} °C</span>}
            {step?.durationMinutes && (
              <span className={styles.badge}>{formatMinutes(step.durationMinutes)}</span>
            )}
          </div>
        </div>

        {nextStep && (
          <div className={styles.next}>
            <span className={styles.nextLabel}>A seguir</span>
            <span className={styles.nextText}>{nextStep.text}</span>
          </div>
        )}

        {stepIngredients.length > 0 && (
          <aside className={styles.aside}>
            <h3 className={styles.asideTitle}>Neste passo</h3>
            <ul className={styles.asideList}>
              {stepIngredients.map((item) => {
                const { name, amount } = describeIngredient(item, catalogue.ingredientsById.get(item.ref));
                return (
                  <li key={item.ref} className={styles.asideItem}>
                    <span>{name}</span>
                    <span className={styles.asideAmount}>{amount}</span>
                  </li>
                );
              })}
            </ul>
          </aside>
        )}
      </div>

      {/* Os três alvos juntos ao centro. O do temporizador ao meio, quando existe. */}
      <div className={styles.bottom}>
        <button
          type="button"
          className={styles.navButton}
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          aria-label="Passo anterior"
        >
          <IconPrev />
        </button>

        {step?.durationMinutes !== undefined && (
          <TimerButton
            className={`${styles.navButton} ${styles.timerButton}`}
            timer={stepTimer}
            now={now}
            minutes={step.durationMinutes}
            onStart={startTimer}
            onToggle={() => stepTimer && updateTimer(stepTimer.id, isRunning(stepTimer) ? pause : resume)}
            onRepeat={() => stepTimer && updateTimer(stepTimer.id, reset)}
          />
        )}

        {/*
          O último passo troca o círculo por uma pastilha com palavra: terminar não é a mesma coisa
          que avançar, e a mudança de forma é o que impede o dedo de o fazer em piloto automático.
        */}
        {isLast ? (
          <button
            type="button"
            className={`${styles.navButton} ${styles.primary} ${styles.finish}`}
            onClick={() => setFinished(true)}
          >
            Terminar
          </button>
        ) : (
          <button
            type="button"
            className={`${styles.navButton} ${styles.primary}`}
            onClick={() => setIndex((i) => i + 1)}
            aria-label="Passo seguinte"
          >
            <IconNext />
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * O terceiro alvo da barra de baixo, ao meio entre as duas setas. Só existe quando o passo tem
 * duração. Mostra o ícone e, por baixo, o número — que é a razão de se olhar para ele. As setas
 * dispensam palavra por serem universais; um ícone de temporizador sozinho não dispensaria, e por
 * isso o número faz de legenda.
 */
interface TimerButtonProps {
  className: string;
  timer: Timer | undefined;
  now: number;
  minutes: number;
  onStart: () => void;
  onToggle: () => void;
  onRepeat: () => void;
}

function TimerButton({ className, timer, now, minutes, onStart, onToggle, onRepeat }: TimerButtonProps) {
  const state = !timer
    ? { icon: <IconPlay />, label: formatMinutes(minutes), action: onStart, hint: 'Iniciar temporizador' }
    : isDone(timer, now)
      ? { icon: <IconRepeat />, label: 'pronto', action: onRepeat, hint: 'Repetir temporizador' }
      : isRunning(timer)
        ? {
            icon: <IconPause />,
            label: formatCountdown(remainingMs(timer, now)),
            action: onToggle,
            hint: 'Pausar temporizador',
          }
        : {
            icon: <IconPlay />,
            label: formatCountdown(remainingMs(timer, now)),
            action: onToggle,
            hint: 'Retomar temporizador',
          };

  return (
    <button type="button" className={className} onClick={state.action} aria-label={state.hint}>
      {state.icon}
      <span>{state.label}</span>
    </button>
  );
}

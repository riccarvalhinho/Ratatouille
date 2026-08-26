/**
 * Modo cozinha. Ver docs/specs/005-modo-cozinha.md.
 *
 * Um passo de cada vez em ecrã inteiro, com os ingredientes desse passo à mão e os temporizadores
 * sempre visíveis. É o ecrã que justifica o tablet estar na parede, e o único usado com as mãos
 * ocupadas — daí os alvos de toque grandes e o passo a 44px, ao centro do ecrã.
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
          /*
           * O título, quando existe. Com dois temporizadores a correr, "Cozer as batatas" diz qual
           * é a panela e "Passo 3" não diz nada — é para isso que a faixa do topo serve.
           */
          label: step.title ?? `Passo ${index + 1}`,
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
    const registada = store.wasCookedOn(recipe.id, today);

    return (
      <div className={styles.screen}>
        <div className={styles.done}>
          <h2 className={styles.doneTitle}>Feito.</h2>

          {/*
            O histórico escreve-se sozinho ao terminar — decisão da conversa 2, que fechou a Q5.
            Chegar ao último passo com o tablet na parede é o sinal mais honesto que a app tem de que
            alguém cozinhou mesmo: não é uma intenção, como o plano da semana é.

            Isto tinha aqui antes um botão "Marcar como cozinhada", com o argumento de que chegar ao
            fim não prova que se comeu. O argumento não caiu, mudou de sítio: em vez de um toque em
            cada refeição para evitar um erro raro, há um desfazer para quando o erro acontece. É a
            mesma troca que a spec 005 já fez ao decidir não confirmar cada mudança de passo.
          */}
          {registada ? (
            <>
              <p className={styles.doneNote}>Ficou no histórico de hoje. Bom apetite.</p>
              <button
                type="button"
                className={`${styles.navButton} ${styles.finish} ${styles.secondary}`}
                onClick={() => store.unmarkCooked(recipe.id, today)}
              >
                Afinal não cozinhei
              </button>
            </>
          ) : (
            <>
              <p className={styles.doneNote}>
                Não ficou no histórico. Marca aqui se a tiveres mesmo feito.
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
        {/*
          A miniatura ao lado do nome. Num ecrã que só mostra um passo, é a única coisa que diz qual
          é o prato — e reconhece-se uma fotografia mais depressa do que se lê um nome.
        */}
        {recipe.image ? (
          <img className={styles.recipeThumb} src={recipe.image} alt="" />
        ) : (
          <span className={styles.recipeThumbFallback} aria-hidden="true">
            🍲
          </span>
        )}

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

      {/*
        Tudo o que diz respeito ao passo numa coluna só, ao centro: o texto, o que ele exige, e o que
        leva. A ordem é a de quem lê — primeiro o que fazer, depois com quê.
      */}
      <div className={styles.body}>
        {/*
          Dois níveis: o título é o que se lê de longe, o texto é o detalhe que impede o erro. Uma
          receita em rascunho pode não ter título — aí o texto sobe para o lugar dele e fica grande,
          que é melhor do que deixar o ecrã a começar por um vazio.
        */}
        {step?.title ? (
          <>
            <h2 className={styles.stepTitle}>{step.title}</h2>
            <p className={styles.stepText}>{step.text}</p>
          </>
        ) : (
          <p className={styles.stepTitle}>{step?.text}</p>
        )}

        {(step?.temperatureC !== undefined || step?.durationMinutes !== undefined) && (
          <div className={styles.stepBadges}>
            {step?.temperatureC !== undefined && (
              <span className={styles.badge}>{step.temperatureC} °C</span>
            )}
            {step?.durationMinutes !== undefined && (
              <span className={styles.badge}>{formatMinutes(step.durationMinutes)}</span>
            )}
          </div>
        )}

        {stepIngredients.length > 0 && (
          <ul className={styles.ingredients}>
            {stepIngredients.map((item) => {
              const { name, amount } = describeIngredient(item, catalogue.ingredientsById.get(item.ref));
              return (
                <li key={item.ref} className={styles.ingredient}>
                  <span>{name}</span>
                  <span className={styles.ingredientAmount}>{amount}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/*
        Os três alvos juntos ao centro, e o cartão "A seguir" na mesma faixa, encostado à direita.
        Estava num canto do corpo, e obrigava o corpo a reservar-lhe a faixa de baixo inteira — o que
        empurrava o passo para cima e deixava o ecrã assimétrico. Aqui não rouba altura nenhuma: a
        barra já tem a altura dos círculos e o cartão cabe lá dentro.
      */}
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
            onClick={() => {
              // Terminar é o sinal de conclusão: escreve o histórico e só depois mostra o fim.
              store.markCooked(recipe.id, today);
              setFinished(true);
            }}
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

        {nextStep && (
          <div className={styles.next}>
            <span className={styles.nextLabel}>A seguir</span>
            {/* O título, que é o que se lê de canto de olho. A frase inteira não se lê a 16px daqui. */}
            <span className={styles.nextText}>{nextStep.title ?? nextStep.text}</span>
          </div>
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

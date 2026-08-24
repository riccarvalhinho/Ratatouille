/**
 * Aviso sonoro de fim de temporizador.
 *
 * Gerado com a Web Audio API em vez de um ficheiro de som: a app tem de funcionar offline e não vale
 * a pena carregar um asset para três bips. Também evita o problema de um MP3 que não descarregou.
 */
export function playAlarm(): void {
  try {
    const AudioCtx =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const context = new AudioCtx();
    // Três bips curtos: um só passa despercebido com barulho de cozinha, muitos irritam.
    for (let i = 0; i < 3; i += 1) {
      const at = context.currentTime + i * 0.32;
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.frequency.value = 880;
      oscillator.connect(gain);
      gain.connect(context.destination);

      // Rampa em vez de corte seco, senão ouve-se um estalido.
      gain.gain.setValueAtTime(0, at);
      gain.gain.linearRampToValueAtTime(0.35, at + 0.02);
      gain.gain.linearRampToValueAtTime(0, at + 0.22);

      oscillator.start(at);
      oscillator.stop(at + 0.24);
    }

    setTimeout(() => void context.close(), 1500);
  } catch {
    // Sem som, o aviso visual continua a existir.
  }
}

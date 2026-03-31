// Web Audio API sound effects

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
  }
  return audioCtx;
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = "sine",
  gainVal = 0.3,
): void {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = frequency;
    osc.type = type;
    gain.gain.setValueAtTime(gainVal, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {}
}

export function playCorrect(): void {
  playTone(523, 0.1, "sine", 0.3);
  setTimeout(() => playTone(659, 0.1, "sine", 0.3), 100);
  setTimeout(() => playTone(784, 0.15, "sine", 0.3), 200);
}

export function playWrong(): void {
  playTone(220, 0.15, "sawtooth", 0.25);
  setTimeout(() => playTone(196, 0.2, "sawtooth", 0.2), 150);
}

export function playClick(): void {
  playTone(800, 0.05, "square", 0.1);
}

export function playTimeout(): void {
  playTone(300, 0.08, "sawtooth", 0.2);
  setTimeout(() => playTone(250, 0.1, "sawtooth", 0.15), 80);
  setTimeout(() => playTone(200, 0.15, "sawtooth", 0.1), 160);
}

export function playGameStart(): void {
  [523, 659, 784, 1047].forEach((f, i) => {
    setTimeout(() => playTone(f, 0.12, "sine", 0.25), i * 100);
  });
}

export function playSuccess(): void {
  [523, 659, 784, 1047, 1319].forEach((f, i) => {
    setTimeout(() => playTone(f, 0.15, "sine", 0.3), i * 80);
  });
}

export function playLogin(): void {
  playTone(600, 0.1, "sine", 0.2);
  setTimeout(() => playTone(800, 0.12, "sine", 0.25), 100);
}

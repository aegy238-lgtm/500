class GameSoundEngine {
  private ctx: AudioContext | null = null;
  private enabled = true;

  public setEnabled(val: boolean) {
    this.enabled = val;
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  private getContext(): AudioContext | null {
    if (!this.enabled || typeof window === 'undefined') return null;
    try {
      if (!this.ctx) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) return null;
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        void this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume = 0.12,
    delay = 0,
    freqEnd?: number
  ) {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (freqEnd !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, freqEnd), now + duration);
    }
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public playChipSelect() {
    this.playTone(580, 0.08, 'triangle', 0.11, 0, 760);
  }

  public playBetCoin() {
    this.playTone(980, 0.07, 'sine', 0.12, 0, 1420);
    this.playTone(1480, 0.1, 'triangle', 0.09, 0.045, 1760);
  }

  public playInsufficient() {
    this.playTone(220, 0.12, 'sawtooth', 0.07, 0, 170);
  }

  public playSpinTick(pitchBoost = 0) {
    this.playTone(620 + pitchBoost * 35, 0.045, 'triangle', 0.085, 0, 480);
  }

  public playCountdownBeep() {
    this.playTone(880, 0.06, 'sine', 0.07);
  }

  public playWinFanfare(isSpecial = false) {
    const notes = isSpecial
      ? [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98]
      : [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      this.playTone(n, 0.22, 'triangle', 0.13, idx * 0.075);
      this.playTone(n * 2, 0.14, 'sine', 0.05, idx * 0.075 + 0.02);
    });
  }

  public playLossTone() {
    this.playTone(390, 0.18, 'sine', 0.09, 0, 320);
    this.playTone(300, 0.28, 'sine', 0.08, 0.16, 230);
  }

  public playRecharge() {
    [784, 987.77, 1174.66, 1567.98].forEach((n, idx) => {
      this.playTone(n, 0.16, 'sine', 0.11, idx * 0.055);
    });
  }
}

export const soundEngine = new GameSoundEngine();

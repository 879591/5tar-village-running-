/**
 * Original Synthesized Audio & Vibration Engine
 * Uses Web Audio API to generate 100% original, royalty-free sounds and Indian folk-inspired background music.
 * Zero external audio asset files required — works 100% offline with zero network overhead.
 */

import { StorageManager, UserSettings } from '../scripts/storage';

class SoundManager {
  private ctx: AudioContext | null = null;
  private settings: UserSettings;
  private isMusicPlaying = false;
  private musicTimerId: number | null = null;
  private noteStep = 0;

  // Pentatonic Indian folk-inspired melody scale (Sa Re Ga Pa Dha in C major / Durandhar folk vibe)
  // Frequencies in Hz: C4, D4, E4, G4, A4, C5, D5, E5
  private readonly scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
  private readonly melodyPattern = [
    0, 2, 3, 4, 3, 2, 0, 1,
    2, 3, 5, 4, 3, 2, 1, 0,
    3, 4, 5, 6, 5, 4, 3, 2,
    4, 3, 2, 1, 0, 2, 1, 0
  ];

  constructor() {
    this.settings = StorageManager.getSettings();
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public updateSettings(newSettings: UserSettings): void {
    const musicChanged = this.settings.musicEnabled !== newSettings.musicEnabled;
    this.settings = { ...newSettings };
    StorageManager.saveSettings(this.settings);

    if (musicChanged) {
      if (this.settings.musicEnabled) {
        this.startBackgroundMusic();
      } else {
        this.stopBackgroundMusic();
      }
    }
  }

  public getSettings(): UserSettings {
    return { ...this.settings };
  }

  public vibrate(pattern: number | number[]): void {
    if (!this.settings.vibrationEnabled) return;
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        navigator.vibrate(pattern);
      }
    } catch {
      // Ignore on unsupported devices
    }
  }

  /**
   * Button Click Sound — Crisp wooden/percussive tap
   */
  public playButtonClick(): void {
    this.vibrate(12);
    if (!this.settings.soundEnabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.045);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  /**
   * Lane Switch Sound — Subtle air whoosh
   */
  public playLaneSwitch(): void {
    this.vibrate(8);
    if (!this.settings.soundEnabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(360, now + 0.07);

    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.075);
  }

  /**
   * Jump Sound — Rising melodic spring tone
   */
  public playJump(): void {
    this.vibrate(15);
    if (!this.settings.soundEnabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(620, now + 0.16);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  /**
   * Slide Sound — Low quick swoop
   */
  public playSlide(): void {
    this.vibrate(15);
    if (!this.settings.soundEnabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(380, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.15);

    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.17);
  }

  /**
   * Coin Pickup Sound — Bright dual-tone metallic chime
   */
  public playCoinPickup(): void {
    this.vibrate(10);
    if (!this.settings.soundEnabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    // B5 to E6 pleasant coin ding
    osc1.frequency.setValueAtTime(987.77, now);
    osc1.frequency.setValueAtTime(1318.51, now + 0.055);

    osc2.frequency.setValueAtTime(1975.53, now);
    osc2.frequency.setValueAtTime(2637.02, now + 0.055);

    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.23);
    osc2.stop(now + 0.23);
  }

  /**
   * Countdown Beep Sound
   */
  public playCountdownTick(isFinalGo = false): void {
    this.vibrate(isFinalGo ? 30 : 12);
    if (!this.settings.soundEnabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(isFinalGo ? 783.99 : 440, now);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (isFinalGo ? 0.25 : 0.12));

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + (isFinalGo ? 0.26 : 0.13));
  }

  /**
   * Collision / Game Over Sound — Low impact thud + descending chord
   */
  public playCollision(): void {
    this.vibrate([60, 40, 100]);
    if (!this.settings.soundEnabled) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const oscSub = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(190, now);
    osc.frequency.exponentialRampToValueAtTime(55, now + 0.38);

    oscSub.type = 'triangle';
    oscSub.frequency.setValueAtTime(110, now);
    oscSub.frequency.exponentialRampToValueAtTime(38, now + 0.38);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    oscSub.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    oscSub.start(now);
    osc.stop(now + 0.42);
    oscSub.stop(now + 0.42);
  }

  /**
   * Gentle Original Indian Village Folk Background Loop
   */
  public startBackgroundMusic(): void {
    if (!this.settings.musicEnabled || this.isMusicPlaying) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    this.isMusicPlaying = true;
    const stepDurationMs = 240; // Upbeat light rhythmic pulse

    const playStep = () => {
      if (!this.isMusicPlaying || !this.settings.musicEnabled) return;
      const audioCtx = this.ensureContext();
      if (!audioCtx || audioCtx.state !== 'running') return;

      const now = audioCtx.currentTime;

      // Play plucked folk melody note (Santoor / Flute inspired soft tone)
      const noteIdx = this.melodyPattern[this.noteStep % this.melodyPattern.length];
      const freq = this.scale[noteIdx];

      const melOsc = audioCtx.createOscillator();
      const melGain = audioCtx.createGain();
      melOsc.type = 'sine';
      melOsc.frequency.setValueAtTime(freq, now);

      melGain.gain.setValueAtTime(0.045, now);
      melGain.gain.exponentialRampToValueAtTime(0.001, now + 0.21);

      melOsc.connect(melGain);
      melGain.connect(audioCtx.destination);
      melOsc.start(now);
      melOsc.stop(now + 0.22);

      // Every 4 steps, play a warm Tanpura / Dholak root drone pulse (C3 = 130.81Hz)
      if (this.noteStep % 4 === 0) {
        const bassOsc = audioCtx.createOscillator();
        const bassGain = audioCtx.createGain();
        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(this.noteStep % 8 === 0 ? 130.81 : 196.00, now);

        bassGain.gain.setValueAtTime(0.035, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        bassOsc.connect(bassGain);
        bassGain.connect(audioCtx.destination);
        bassOsc.start(now);
        bassOsc.stop(now + 0.36);
      }

      this.noteStep++;
    };

    playStep();
    this.musicTimerId = window.setInterval(playStep, stepDurationMs);
  }

  public stopBackgroundMusic(): void {
    this.isMusicPlaying = false;
    if (this.musicTimerId !== null) {
      clearInterval(this.musicTimerId);
      this.musicTimerId = null;
    }
  }
}

export const AudioEngine = new SoundManager();

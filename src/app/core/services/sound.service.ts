import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SoundService {
  private audioCtx: AudioContext | null = null;
  readonly isMuted = signal<boolean>(false);

  private bufferCache = new Map<string, AudioBuffer>();
  private loadingPromises = new Map<string, Promise<AudioBuffer | null>>();

  constructor() {
    const savedMute = localStorage.getItem('rebus_sound_muted');
    if (savedMute !== null) {
      this.isMuted.set(savedMute === 'true');
    }

    // Preload top core sounds when browser is idle or active
    if (typeof window !== 'undefined') {
      setTimeout(() => this.preloadCoreSounds(), 300);
    }
  }

  private preloadCoreSounds(): void {
    const coreUrls = [
      '/audio/piano/C4.mp3', '/audio/piano/D4.mp3', '/audio/piano/E4.mp3', '/audio/piano/F4.mp3',
      '/audio/piano/G4.mp3', '/audio/piano/A4.mp3', '/audio/piano/B4.mp3', '/audio/piano/C5.mp3',
      '/audio/animals/dog.wav', '/audio/animals/cat.wav', '/audio/animals/cow.wav', '/audio/animals/duck.wav',
      '/audio/animals/horse.wav', '/audio/animals/rooster.wav', '/audio/animals/frog.wav', '/audio/animals/bird.wav',
      '/audio/vehicles/car-horn.wav', '/audio/vehicles/train.wav',
      '/audio/fx/pop.wav', '/audio/fx/cheer.wav', '/audio/fx/win.wav'
    ];
    for (const url of coreUrls) {
      this.loadBuffer(url).catch(() => {});
    }
  }

  async loadBuffer(url: string): Promise<AudioBuffer | null> {
    if (this.bufferCache.has(url)) return this.bufferCache.get(url)!;
    if (this.loadingPromises.has(url)) return this.loadingPromises.get(url)!;

    const p = (async () => {
      try {
        const ctx = this.getRawContext();
        if (!ctx) return null;
        const resp = await fetch(url);
        if (!resp.ok) return null;
        const arrayBuf = await resp.arrayBuffer();
        const audioBuf = await ctx.decodeAudioData(arrayBuf);
        this.bufferCache.set(url, audioBuf);
        return audioBuf;
      } catch (err) {
        return null;
      }
    })();

    this.loadingPromises.set(url, p);
    return p;
  }

  playAudioBuffer(url: string, volume = 1.0, fallbackFn?: () => void): void {
    if (this.isMuted()) return;
    const ctx = this.getContext();
    if (!ctx) {
      if (fallbackFn) fallbackFn();
      return;
    }

    const cached = this.bufferCache.get(url);
    if (cached) {
      this.triggerBufferSource(ctx, cached, volume);
      return;
    }

    this.loadBuffer(url).then(buf => {
      if (buf && !this.isMuted()) {
        const currentCtx = this.getContext();
        if (currentCtx) this.triggerBufferSource(currentCtx, buf, volume);
      } else if (fallbackFn) {
        fallbackFn();
      }
    }).catch(() => {
      if (fallbackFn) fallbackFn();
    });
  }

  private triggerBufferSource(ctx: AudioContext, buffer: AudioBuffer, volume = 1.0): void {
    try {
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      source.connect(gain);
      gain.connect(ctx.destination);
      source.start(0);
    } catch (err) {
      console.warn('Error playing buffer:', err);
    }
  }

  private getRawContext(): AudioContext | null {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    return this.audioCtx;
  }

  toggleMute(): boolean {
    const nextState = !this.isMuted();
    this.isMuted.set(nextState);
    localStorage.setItem('rebus_sound_muted', String(nextState));
    if (!nextState) {
      this.playTap();
    }
    return nextState;
  }

  private getContext(): AudioContext | null {
    if (this.isMuted()) return null;
    const ctx = this.getRawContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
    return ctx;
  }

  /**
   * Crisp button tap sound
   */
  playTap(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.06);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.06);
  }

  /**
   * Bubbly letter insertion
   */
  playPop(freqMultiplier = 1): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const baseFreq = 520 * freqMultiplier;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, ctx.currentTime + 0.09);

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.09);
  }

  /**
   * Realistic punchy balloon burst sound (snap + pop)
   */
  playBalloonBurst(): void {
    this.playAudioBuffer('/audio/fx/pop.wav', 1.0, () => this.playSyntheticBalloonBurst());
  }

  private playSyntheticBalloonBurst(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;

    // Layer 1: Resonant thud / air release (sine ramp down)
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(380, t);
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.12);

    oscGain.gain.setValueAtTime(0.35, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.12);

    // Layer 2: Rubber snap crackle (short noise burst)
    const bufferSize = Math.floor(ctx.sampleRate * 0.05);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1000, t);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.25, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    whiteNoise.start(t);
  }

  /**
   * Letter removed / undo sound
   */
  playRemove(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.14, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  }

  /**
   * Correct word victory chime
   */
  playSuccess(): void {
    this.playAudioBuffer('/audio/fx/win.wav', 1.0, () => this.playSyntheticSuccess());
  }

  private playSyntheticSuccess(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const startTime = ctx.currentTime + idx * 0.08;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.18, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.45);
    });
  }

  /**
   * Wrong guess shake buzz
   */
  playError(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.22);

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.22);
  }

  /**
   * Hint sparkle shimmer sound
   */
  playHint(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const sparkFrequencies = [900, 1150, 1400, 1750, 2100];
    sparkFrequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + idx * 0.04;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.1, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.15);
    });
  }

  /**
   * Bomb explosion sound for removing unused letters
   */
  playBomb(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const bufferSize = ctx.sampleRate * 0.25;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(350, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.25);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.28, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
    noise.stop(ctx.currentTime + 0.25);
  }

  /**
   * Joyful toddler mascot giggle sound
   */
  playGiggle(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const pitches = [523.25, 659.25, 783.99, 659.25, 880, 1046.5];
    pitches.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = ctx.currentTime + idx * 0.055;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.15, start + 0.05);

      gain.gain.setValueAtTime(0.15, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + 0.05);
    });
  }

  /**
   * Triumphant launch fanfare for Play button
   */
  playFanfare(): void {
    this.playAudioBuffer('/audio/fx/cheer.wav', 1.0, () => this.playSyntheticFanfare());
  }

  private playSyntheticFanfare(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const fanfare = [
      { f: 523.25, d: 0.1 },  // C5
      { f: 659.25, d: 0.1 },  // E5
      { f: 783.99, d: 0.12 }, // G5
      { f: 1046.50, d: 0.35 } // C6
    ];

    let t = ctx.currentTime;
    fanfare.forEach(note => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, t);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + note.d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + note.d);
      t += note.d * 0.85;
    });
  }

  /**
   * Crisp puzzle / shape magnetic click/snap
   */
  playSnap(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(1200, t + 0.08);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.08);
  }

  /**
   * Spring boing wobble for wrong drops or playful bounce
   */
  playBoing(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.linearRampToValueAtTime(440, t + 0.08);
    osc.frequency.linearRampToValueAtTime(260, t + 0.16);
    osc.frequency.linearRampToValueAtTime(380, t + 0.24);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.24);
  }

  /**
   * 😋 Playful Nom-Nom / Munch Chewing sound for Feeding animals
   */
  playChew(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    [0, 0.12, 0.24].forEach((delay, idx) => {
      const t = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      const baseFreq = 320 - idx * 25;
      osc.frequency.setValueAtTime(baseFreq, t);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.6, t + 0.08);

      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.08);
    });
  }

  /* ========================================================
   * 🐾 REALISTIC ANIMAL PROCEDURAL SOUND SYNTHESIS
   * ======================================================== */

  /**
   * 🐶 Dog Bark: Real authentic bark with synthetic fallback
   */
  playDogBark(): void {
    this.playAudioBuffer('/audio/animals/dog.wav', 1.0, () => this.playSyntheticDogBark());
  }

  private playSyntheticDogBark(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    [0, 0.28].forEach(delay => {
      const t = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(450, t);
      osc.frequency.exponentialRampToValueAtTime(160, t + 0.16);

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(600, t);
      filter.Q.value = 2.5;

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.16);
    });
  }

  /**
   * 🐱 Cat Meow: Real authentic meow with synthetic fallback
   */
  playCatMeow(): void {
    this.playAudioBuffer('/audio/animals/cat.wav', 1.0, () => this.playSyntheticCatMeow());
  }

  private playSyntheticCatMeow(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(480, t);
    osc.frequency.linearRampToValueAtTime(820, t + 0.25);
    osc.frequency.linearRampToValueAtTime(540, t + 0.65);

    gain.gain.setValueAtTime(0.05, t);
    gain.gain.linearRampToValueAtTime(0.28, t + 0.25);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.65);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.65);
  }

  /**
   * 🐮 Cow Moo: Real authentic moo with synthetic fallback
   */
  playCowMoo(): void {
    this.playAudioBuffer('/audio/animals/cow.wav', 1.0, () => this.playSyntheticCowMoo());
  }

  private playSyntheticCowMoo(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.linearRampToValueAtTime(160, t + 0.4);
    osc.frequency.linearRampToValueAtTime(110, t + 0.95);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, t);

    gain.gain.setValueAtTime(0.05, t);
    gain.gain.linearRampToValueAtTime(0.35, t + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.95);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.95);
  }

  /**
   * 🦆 Duck Quack: Real authentic quack with synthetic fallback
   */
  playDuckQuack(): void {
    this.playAudioBuffer('/audio/animals/duck.wav', 1.0, () => this.playSyntheticDuckQuack());
  }

  private playSyntheticDuckQuack(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    [0, 0.22].forEach(delay => {
      const t = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.linearRampToValueAtTime(240, t + 0.14);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(950, t);
      filter.Q.value = 4.0;

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.14);
    });
  }

  /**
   * 🦁 Lion Roar: Real authentic roar with synthetic fallback
   */
  playLionRoar(): void {
    this.playAudioBuffer('/audio/animals/lion.wav', 1.0, () => this.playSyntheticLionRoar());
  }

  private playSyntheticLionRoar(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(95, t);
    osc.frequency.linearRampToValueAtTime(140, t + 0.35);
    osc.frequency.exponentialRampToValueAtTime(55, t + 0.85);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(280, t);
    filter.frequency.linearRampToValueAtTime(550, t + 0.35);
    filter.frequency.linearRampToValueAtTime(180, t + 0.85);

    gain.gain.setValueAtTime(0.1, t);
    gain.gain.linearRampToValueAtTime(0.4, t + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.85);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.85);
  }

  /**
   * 🐸 Frog Croak: Real authentic croak with synthetic fallback
   */
  playFrogCroak(): void {
    this.playAudioBuffer('/audio/animals/frog.wav', 1.0, () => this.playSyntheticFrogCroak());
  }

  private playSyntheticFrogCroak(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    [0, 0.25].forEach(delay => {
      const t = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, t);
      osc.frequency.linearRampToValueAtTime(90, t + 0.15);

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(450, t);
      filter.Q.value = 3;

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.15);
    });
  }

  /**
   * 🐦 Bird Chirp: Real authentic chirp with synthetic fallback
   */
  playBirdChirp(): void {
    this.playAudioBuffer('/audio/animals/bird.wav', 1.0, () => this.playSyntheticBirdChirp());
  }

  private playSyntheticBirdChirp(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    [0, 0.15, 0.3].forEach(delay => {
      const t = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(2400, t);
      osc.frequency.exponentialRampToValueAtTime(3800, t + 0.08);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.08);
    });
  }

  /* ========================================================
   * 🚗 REALISTIC VEHICLE PROCEDURAL SOUND SYNTHESIS
   * ======================================================== */

  /**
   * 🚗 Car Horn: Real automotive horn with synthetic fallback
   */
  playCarHorn(): void {
    this.playAudioBuffer('/audio/vehicles/car-horn.wav', 1.0, () => this.playSyntheticCarHorn());
  }

  private playSyntheticCarHorn(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    [0, 0.22].forEach(delay => {
      const t = ctx.currentTime + delay;
      // Dual frequencies: A4 (440Hz) + C#5 (554Hz)
      [440, 554].forEach(freq => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, t);

        gain.gain.setValueAtTime(0.2, t);
        gain.gain.setValueAtTime(0.2, t + 0.14);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + 0.16);
      });
    });
  }

  /**
   * 🚂 Train Whistle: Real atmospheric steam train whistle with synthetic fallback
   */
  playTrainWhistle(): void {
    this.playAudioBuffer('/audio/vehicles/train.wav', 1.0, () => this.playSyntheticTrainWhistle());
  }

  private playSyntheticTrainWhistle(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    [0, 0.42].forEach(delay => {
      const t = ctx.currentTime + delay;
      // Steam train whistle chord: 392Hz (G4) + 494Hz (B4)
      [392, 494].forEach(freq => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.05, t);
        gain.gain.linearRampToValueAtTime(0.25, t + 0.08);
        gain.gain.setValueAtTime(0.22, t + 0.28);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + 0.38);
      });
    });
  }

  /**
   * 🚓 Police / Ambulance Siren: Real emergency siren with synthetic fallback
   */
  playSiren(): void {
    this.playAudioBuffer('/audio/vehicles/siren.wav', 1.0, () => this.playSyntheticSiren());
  }

  private playSyntheticSiren(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    // Cycle 600 -> 1050 -> 600 -> 1050 -> 600
    osc.frequency.setValueAtTime(650, t);
    osc.frequency.linearRampToValueAtTime(1100, t + 0.3);
    osc.frequency.linearRampToValueAtTime(650, t + 0.6);
    osc.frequency.linearRampToValueAtTime(1100, t + 0.9);
    osc.frequency.linearRampToValueAtTime(650, t + 1.2);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1500, t);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.setValueAtTime(0.25, t + 1.1);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.25);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 1.25);
  }

  /**
   * 🚲 Bicycle Bell: Real metallic ping with synthetic fallback
   */
  playBicycleBell(): void {
    this.playAudioBuffer('/audio/vehicles/bicycle.wav', 1.0, () => this.playSyntheticBicycleBell());
  }

  private playSyntheticBicycleBell(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    [0, 0.12].forEach(delay => {
      const t = ctx.currentTime + delay;
      [1800, 2400].forEach(freq => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + 0.18);
      });
    });
  }

  /**
   * 🚁 Helicopter: Rhythmic chopping blades (Chop-Chop-Chop)
   */
  playHelicopter(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    for (let i = 0; i < 7; i++) {
      const t = ctx.currentTime + i * 0.14;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(90, t);
      osc.frequency.exponentialRampToValueAtTime(30, t + 0.1);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.1);
    }
  }

  /**
   * 🚀 Rocket: Deep roaring thruster blast
   */
  playRocketBlast(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(60, t);
    osc.frequency.exponentialRampToValueAtTime(450, t + 0.8);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, t);
    filter.frequency.exponentialRampToValueAtTime(1200, t + 0.8);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.9);
  }

  /**
   * 🐴 Horse Neigh: Real authentic whinny with synthetic fallback
   */
  playHorseNeigh(): void {
    this.playAudioBuffer('/audio/animals/horse.wav', 1.0, () => this.playSyntheticHorseNeigh());
  }

  private playSyntheticHorseNeigh(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.linearRampToValueAtTime(1100, t + 0.2);
    osc.frequency.linearRampToValueAtTime(750, t + 0.6);

    // Whinny vibrato
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 14;
    lfoGain.gain.value = 80;
    lfo.connect(osc.frequency);
    lfo.start(t);
    lfo.stop(t + 0.65);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1600, t);

    gain.gain.setValueAtTime(0.05, t);
    gain.gain.linearRampToValueAtTime(0.32, t + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.65);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.65);
  }

  /**
   * 🐷 Pig Oink: Nasal formant grunts (Oink! Oink!)
   */
  playPigOink(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    [0, 0.24].forEach(delay => {
      const t = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(280, t);
      osc.frequency.linearRampToValueAtTime(180, t + 0.15);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(700, t);
      filter.Q.value = 4;

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.15);
    });
  }

  /**
   * 🐑 Sheep / Goat Baaa: Real authentic bleat with synthetic fallback
   */
  playSheepBaa(): void {
    this.playAudioBuffer('/audio/animals/sheep.wav', 1.0, () => this.playSyntheticSheepBaa());
  }

  private playSyntheticSheepBaa(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.linearRampToValueAtTime(320, t + 0.15);
    osc.frequency.linearRampToValueAtTime(240, t + 0.7);

    // Bleat vibrato
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 10;
    lfoGain.gain.value = 35;
    lfo.connect(osc.frequency);
    lfo.start(t);
    lfo.stop(t + 0.75);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, t);
    filter.Q.value = 2.5;

    gain.gain.setValueAtTime(0.05, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.75);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.75);
  }

  /**
   * 🐓 Rooster Crow: Real authentic crow with synthetic fallback
   */
  playRoosterCrow(): void {
    this.playAudioBuffer('/audio/animals/rooster.wav', 1.0, () => this.playSyntheticRoosterCrow());
  }

  private playSyntheticRoosterCrow(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const notes = [
      { f: 520, d: 0.12 },
      { f: 640, d: 0.15 },
      { f: 520, d: 0.12 },
      { f: 880, d: 0.45 }
    ];

    let t = ctx.currentTime;
    notes.forEach(n => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(n.f, t);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(n.f * 1.5, t);
      filter.Q.value = 3;

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + n.d);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + n.d);
      t += n.d * 0.9;
    });
  }

  /**
   * 🐘 Elephant Trumpet: High brassy harmonic fanfare
   */
  playElephantTrumpet(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(420, t);
    osc.frequency.linearRampToValueAtTime(980, t + 0.25);
    osc.frequency.linearRampToValueAtTime(650, t + 0.8);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, t);
    filter.Q.value = 3;

    gain.gain.setValueAtTime(0.1, t);
    gain.gain.linearRampToValueAtTime(0.38, t + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.85);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.85);
  }

  /**
   * 🐺 Wolf Howl: Long mournful rising & falling pitch
   */
  playWolfHowl(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.linearRampToValueAtTime(740, t + 0.45);
    osc.frequency.linearRampToValueAtTime(360, t + 1.1);

    gain.gain.setValueAtTime(0.05, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.35);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 1.15);
  }

  /**
   * 🐍 Snake Hiss: Filtered high-frequency noise
   */
  playSnakeHiss(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const bufferSize = ctx.sampleRate * 0.7;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(4500, t);
    filter.Q.value = 4;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(t);
    noise.stop(t + 0.7);
  }

  /**
   * 🐝 Bee Buzz: High-frequency resonant drone
   */
  playBeeBuzz(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.linearRampToValueAtTime(280, t + 0.4);
    osc.frequency.linearRampToValueAtTime(240, t + 0.8);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(650, t);
    filter.Q.value = 5;

    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.8);
  }

  /**
   * ⛈️ Thunder: Explosive low-end crack and rumble
   */
  playThunder(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const bufferSize = ctx.sampleRate * 1.2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(220, t);
    filter.frequency.exponentialRampToValueAtTime(60, t + 1.2);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(t);
  }

  /**
   * 🥁 Drum: Punchy kick beat + snare snap
   */
  playDrumBeat(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    [0, 0.28].forEach(delay => {
      const t = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(160, t);
      osc.frequency.exponentialRampToValueAtTime(45, t + 0.16);

      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.16);
    });
  }

  /**
   * 🔔 Doorbell / Bell: Real chime with synthetic fallback
   */
  playDoorbell(): void {
    this.playAudioBuffer('/audio/fx/doorbell.wav', 1.0, () => this.playSyntheticDoorbell());
  }

  private playSyntheticDoorbell(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const chimes = [
      { f: 659.25, t: 0, d: 0.45 },    // E5 (Ding)
      { f: 523.25, t: 0.35, d: 0.65 }   // C5 (Dong)
    ];

    chimes.forEach(c => {
      const t = ctx.currentTime + c.t;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(c.f, t);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + c.d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + c.d);
    });
  }

  /**
   * 📱 Phone: Classic telephone ringing pulse (Ring Ring!)
   */
  playPhoneRing(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    [0, 0.22].forEach(delay => {
      const t = ctx.currentTime + delay;
      // Dual frequencies for telephone bell: 440Hz + 480Hz
      [440, 480].forEach(f => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, t);

        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + 0.18);
      });
    });
  }

  /**
   * 👏 Clapping: Rapid noise burst applause
   */
  playClap(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    [0, 0.12, 0.24].forEach(delay => {
      const t = ctx.currentTime + delay;
      const bufferSize = ctx.sampleRate * 0.06;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1100, t);
      filter.Q.value = 2;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(t);
    });
  }

  /**
   * 🎹 Play authentic Grand Piano sampled note (C4, D4, E4, F4, G4, A4, B4, C5)
   */
  playPianoNote(note: string): void {
    const upper = note.toUpperCase();
    this.playAudioBuffer(`/audio/piano/${upper}.mp3`, 1.0, () => {
      const freqs: Record<string, number> = {
        C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23,
        G4: 392.00, A4: 440.00, B4: 493.88, C5: 523.25
      };
      this.playSyntheticMusicalNote(freqs[upper] || 440);
    });
  }

  /**
   * 🎸 Musical Instrument: Maps to closest real acoustic Grand Piano note
   */
  playMusicalNote(freq = 440): void {
    const scale: [string, number][] = [
      ['C4', 261.63], ['D4', 293.66], ['E4', 329.63], ['F4', 349.23],
      ['G4', 392.00], ['A4', 440.00], ['B4', 493.88], ['C5', 523.25]
    ];
    let closest = 'A4';
    let minDiff = 99999;
    for (const [name, f] of scale) {
      const diff = Math.abs(f - freq);
      if (diff < minDiff) {
        minDiff = diff;
        closest = name;
      }
    }
    this.playPianoNote(closest);
  }

  private playSyntheticMusicalNote(freq = 440): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.6);
  }

  /**
   * 📣 Referee Whistle: Real whistle with synthetic fallback
   */
  playWhistle(): void {
    this.playAudioBuffer('/audio/fx/whistle.wav', 1.0, () => this.playSyntheticWhistle());
  }

  private playSyntheticWhistle(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(2600, t);

    // Tremolo
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 25;
    lfoGain.gain.value = 300;
    lfo.connect(osc.frequency);
    lfo.start(t);
    lfo.stop(t + 0.45);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.45);
  }

  /**
   * 🔢 Clear voice counting for numbers 1 to 10
   */
  playCountNumber(num: number): void {
    if (num >= 1 && num <= 10) {
      this.playAudioBuffer(`/audio/numbers/${num}.mp3`, 1.0);
    }
  }

  /**
   * 🔤 Crystal-clear voice for English Alphabet A to Z
   */
  playLetterVoice(letter: string): void {
    if (letter) {
      this.playAudioBuffer(`/audio/alphabet/${letter.toUpperCase()}.mp3`, 1.0);
    }
  }

  /**
   * 🕉️ Authentic Hindi voice pronunciation for Swar and Vyanjan
   */
  playHindiPhrase(type: 'swar' | 'vyanjan', index: number): void {
    this.playAudioBuffer(`/audio/hindi/${type}_${index}.mp3`, 1.0);
  }

  /**
   * 🕉️ Play exact Hindi audio clip by key (e.g. 'vyanjan_33' for क्ष, 'vyanjan_34' for त्र, 'vyanjan_35' for ज्ञ)
   */
  playHindiAudio(audioKey: string): void {
    if (audioKey) {
      const filename = audioKey.endsWith('.mp3') ? audioKey : `${audioKey}.mp3`;
      this.playAudioBuffer(`/audio/hindi/${filename}`, 1.0);
    }
  }

  /**
   * Master sound dispatcher for ANY animal, bird, vehicle, instrument, or household item
   */
  playItemSound(key: string): void {
    switch (key) {
      // 🐾 Animals
      case 'puppy':
      case 'dog':
      case 'seal':
        this.playDogBark();
        break;
      case 'kitten':
      case 'cat':
        this.playCatMeow();
        break;
      case 'cow':
        this.playCowMoo();
        break;
      case 'horse':
      case 'donkey':
        this.playHorseNeigh();
        break;
      case 'pig':
        this.playPigOink();
        break;
      case 'sheep':
      case 'goat':
        this.playSheepBaa();
        break;
      case 'rooster':
      case 'chicken':
      case 'turkey':
        this.playRoosterCrow();
        break;
      case 'duck':
        this.playDuckQuack();
        break;
      case 'lion':
      case 'tiger':
      case 'bear':
      case 'panda':
        this.playLionRoar();
        break;
      case 'elephant':
        this.playElephantTrumpet();
        break;
      case 'wolf':
      case 'fox':
        this.playWolfHowl();
        break;
      case 'snake':
        this.playSnakeHiss();
        break;
      case 'frog':
      case 'mouse':
      case 'rabbit':
        this.playFrogCroak();
        break;
      case 'bird':
      case 'parrot':
      case 'owl':
      case 'eagle':
      case 'crow':
      case 'penguin':
        this.playBirdChirp();
        break;
      case 'bee':
      case 'fly':
      case 'mosquito':
      case 'cricket':
        this.playBeeBuzz();
        break;

      // 🚗 Vehicles
      case 'car':
      case 'truck':
      case 'bus':
        this.playCarHorn();
        break;
      case 'train':
        this.playTrainWhistle();
        break;
      case 'police':
      case 'ambulance':
      case 'firetruck':
      case 'siren':
        this.playSiren();
        break;
      case 'bicycle':
      case 'bike':
      case 'motorcycle':
        this.playBicycleBell();
        break;
      case 'helicopter':
      case 'boat':
        this.playHelicopter();
        break;
      case 'rocket':
      case 'airplane':
        this.playRocketBlast();
        break;

      // 🌧️ Nature
      case 'thunder':
      case 'rain':
      case 'ocean':
      case 'wind':
      case 'fire':
        this.playThunder();
        break;

      // 🎵 Instruments
      case 'drum':
        this.playDrumBeat();
        break;
      case 'guitar':
        this.playMusicalNote(330);
        break;
      case 'piano':
        this.playMusicalNote(523.25);
        break;
      case 'flute':
      case 'trumpet':
        this.playMusicalNote(659.25);
        break;
      case 'bell':
      case 'doorbell':
        this.playDoorbell();
        break;

      // 🏠 Household & Kitchen
      case 'phone':
        this.playPhoneRing();
        break;
      case 'alarm':
      case 'microwave':
      case 'toaster':
        this.playPhoneRing();
        break;
      case 'door':
        this.playDrumBeat();
        break;
      case 'kettle':
      case 'whistle':
        this.playWhistle();
        break;

      // 👏 Human & Fun
      case 'clap':
        this.playClap();
        break;
      case 'laugh':
      case 'baby':
        this.playGiggle();
        break;
      case 'sneeze':
      case 'cough':
        this.playDogBark();
        break;
      case 'balloon':
      case 'fireworks':
        this.playBalloonBurst();
        break;
      case 'camera':
        this.playSnap();
        break;

      default:
        this.playPop();
        break;
    }
  }

  /**
   * ✨ Magic Sparkle Chimes (for drawing & fairy dust)
   */
  playMagicSparkle(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const notes = [1046.5, 1318.5, 1567.98, 2093.0]; // C6, E6, G6, C7
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.04);

      gain.gain.setValueAtTime(0.09, t + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.04 + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t + idx * 0.04);
      osc.stop(t + idx * 0.04 + 0.22);
    });
  }

  /**
   * 🔔 Single Gentle Chime (custom pitch)
   */
  playChime(pitchMultiplier = 1): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880 * pitchMultiplier, t);
    osc.frequency.exponentialRampToValueAtTime(1320 * pitchMultiplier, t + 0.12);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.28);
  }

  /**
   * 🔔 Playful Ding Sound (alias to playChime)
   */
  playDing(pitchMultiplier = 1): void {
    this.playChime(pitchMultiplier);
  }

  /**
   * 🎨 Color Splash / Wet Brush Sound
   */
  playBrushSplash(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(650, t);
    osc.frequency.exponentialRampToValueAtTime(950, t + 0.08);

    gain.gain.setValueAtTime(0.16, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.14);
  }

  /**
   * 💨 Swoosh / Clear Slate Sound
   */
  playSwoosh(): void {
    const ctx = this.getContext();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(220, t + 0.18);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.18);
  }
}


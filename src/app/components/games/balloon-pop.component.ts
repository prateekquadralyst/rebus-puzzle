import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppNavService } from '../../core/services/app-nav.service';
import { SoundService } from '../../core/services/sound.service';
import { SpeechService } from '../../core/services/speech.service';
import { ConfettiService } from '../../core/services/confetti.service';

interface BalloonTheme {
  gradient: string;
  solid: string;
  glow: string;
}

interface BalloonItem {
  id: number;
  num: number;
  theme: BalloonTheme;
  leftPercent: number;
  speedSec: number;
  delaySec: number;
  isPopping?: boolean;
}

interface RubberShard {
  dx: number;
  dy: number;
  rot: number;
  scale: number;
  width: number;
  height: number;
  clipPath: string;
}

interface BurstSparkle {
  emoji: string;
  dx: number;
  dy: number;
  rot: number;
  scale: number;
}

interface PopBurst {
  id: number;
  x: number;
  y: number;
  theme: BalloonTheme;
  comicText: string;
  shards: RubberShard[];
  sparkles: BurstSparkle[];
  scoreText: string;
}

const BALLOON_THEMES: BalloonTheme[] = [
  { gradient: 'linear-gradient(135deg, #ff4d6d 0%, #c9184a 100%)', solid: '#ff4d6d', glow: 'rgba(255, 77, 109, 0.85)' },
  { gradient: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)', solid: '#38bdf8', glow: 'rgba(56, 189, 248, 0.85)' },
  { gradient: 'linear-gradient(135deg, #4ade80 0%, #16a34a 100%)', solid: '#4ade80', glow: 'rgba(74, 222, 128, 0.85)' },
  { gradient: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', solid: '#fbbf24', glow: 'rgba(251, 191, 36, 0.85)' },
  { gradient: 'linear-gradient(135deg, #c084fc 0%, #9333ea 100%)', solid: '#c084fc', glow: 'rgba(192, 132, 252, 0.85)' },
  { gradient: 'linear-gradient(135deg, #f472b6 0%, #db2777 100%)', solid: '#f472b6', glow: 'rgba(244, 114, 182, 0.85)' },
  { gradient: 'linear-gradient(135deg, #2dd4bf 0%, #0d9488 100%)', solid: '#2dd4bf', glow: 'rgba(45, 212, 191, 0.85)' }
];

const COMIC_PHRASES = ['💥 POP!', '⭐ POW!', '🎈 POP!', '✨ BAM!', '🌟 WOW!', '🎉 YAY!'];

const CLIP_SHAPES = [
  'polygon(50% 0%, 0% 100%, 100% 100%)',
  'polygon(20% 0%, 80% 0%, 100% 100%, 0% 80%)',
  'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
  'polygon(0% 0%, 100% 20%, 80% 100%, 10% 90%)',
  'polygon(30% 0%, 70% 0%, 100% 60%, 50% 100%, 0% 60%)'
];

const SPARKLE_EMOJIS = ['⭐', '✨', '🌟', '💫', '🎉', '💛', '💎'];

@Component({
  selector: 'app-balloon-pop',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="game-viewport">
      <!-- Top Header -->
      <header class="game-header">
        <button 
          type="button" 
          (click)="appNav.goToHub()" 
          class="hub-return-btn"
          title="Return to Toddler Hub">
          <span>🏰 Hub</span>
        </button>

        <div class="level-indicator">
          <span class="game-tag">🎈 BALLOON POP</span>
          <span class="stage-tag">Popped: {{ poppedScore() }} 🌟</span>
        </div>

        <button 
          type="button" 
          (click)="sound.toggleMute()" 
          class="mute-circle-btn"
          [title]="sound.isMuted() ? 'Turn Sound On' : 'Turn Sound Off'">
          {{ sound.isMuted() ? '🔇' : '🎵' }}
        </button>
      </header>

      <!-- Sky Arena -->
      <main class="sky-stage" [class.screen-shake]="isShaking()">
        <div class="guide-banner animate-pop">
          <span class="speaker-icon">📢</span>
          <span class="guide-text">Tap floating balloons to pop and count!</span>
        </div>

        <!-- Floating Balloons Container -->
        <div class="balloons-arena">
          @for (balloon of activeBalloons(); track balloon.id) {
            <button 
              type="button"
              (click)="popBalloon(balloon, $event)"
              class="floating-balloon-btn"
              [class.is-popping]="balloon.isPopping"
              [style.left.%]="balloon.leftPercent"
              [style.animationDuration.s]="balloon.speedSec"
              [style.animationDelay.s]="balloon.delaySec"
              [style.background]="balloon.theme.gradient">
              
              <!-- Glossy reflection bubble -->
              <div class="balloon-gloss"></div>
              <span class="balloon-number">{{ balloon.num }}</span>
              <div class="balloon-string"></div>
            </button>
          }

          <!-- 💥 Spectacular Pop Particles & Shockwaves Layer -->
          <div class="pop-burst-layer">
            @for (burst of activeBursts(); track burst.id) {
              <div 
                class="burst-cluster"
                [style.left.px]="burst.x"
                [style.top.px]="burst.y"
                [style.--glow-color]="burst.theme.glow"
                [style.--solid-color]="burst.theme.solid">
                
                <!-- White Flash Core -->
                <div class="flash-core"></div>

                <!-- Expanding Colored Shockwave Ring -->
                <div class="shockwave-ring outer"></div>
                <div class="shockwave-ring inner"></div>

                <!-- Cartoon Comic "POP!" Badge -->
                <div class="comic-pop-badge">
                  {{ burst.comicText }}
                </div>

                <!-- Floating +1 Star -->
                <span class="floating-point">{{ burst.scoreText }}</span>

                <!-- Rubber Shards Exploding Outward in Balloon Color -->
                @for (shard of burst.shards; track $index) {
                  <div 
                    class="rubber-shard"
                    [style.background]="burst.theme.solid"
                    [style.clip-path]="shard.clipPath"
                    [style.width.px]="shard.width"
                    [style.height.px]="shard.height"
                    [style.--dx]="shard.dx + 'px'"
                    [style.--dy]="shard.dy + 'px'"
                    [style.--rot]="shard.rot + 'deg'"
                    [style.--s]="shard.scale">
                  </div>
                }

                <!-- Outward Flying Sparkle Emojis -->
                @for (sp of burst.sparkles; track $index) {
                  <span 
                    class="burst-sparkle"
                    [style.--dx]="sp.dx + 'px'"
                    [style.--dy]="sp.dy + 'px'"
                    [style.--rot]="sp.rot + 'deg'"
                    [style.--s]="sp.scale">
                    {{ sp.emoji }}
                  </span>
                }
              </div>
            }
          </div>
        </div>
      </main>

      <footer class="game-footer">
        <p>💡 Tip: Tap fast before the balloons float high into the clouds!</p>
      </footer>
    </div>
  `,
  styles: [`
    .game-viewport {
      min-height: 100vh;
      min-height: 100dvh;
      width: 100%;
      background: var(--app-viewport-bg, radial-gradient(circle at 50% 15%, #082f49 0%, #0f172a 75%, #020617 100%));
      transition: background 0.4s ease;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      user-select: none;
      overflow: hidden;
    }

    .game-header {
      width: 100%;
      max-width: 900px;
      margin: 0 auto;
      padding: 14px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      z-index: 20;
    }

    .hub-return-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.16);
      color: #f1f5f9;
      font-size: 0.8rem;
      font-weight: 800;
      cursor: pointer;
      backdrop-filter: blur(10px);
      transition: all 0.2s;
    }
    .hub-return-btn:hover {
      background: rgba(255, 255, 255, 0.18);
      transform: translateY(-2px);
    }

    .level-indicator {
      display: flex;
      flex-direction: column;
      align-items: center;
      line-height: 1.2;
    }
    .game-tag {
      font-size: 0.82rem;
      font-weight: 900;
      color: #38bdf8;
      letter-spacing: 0.05em;
    }
    .stage-tag {
      font-size: 0.76rem;
      font-weight: 900;
      color: #facc15;
    }

    .mute-circle-btn {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.16);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      cursor: pointer;
      backdrop-filter: blur(10px);
      transition: all 0.2s;
    }

    .sky-stage {
      flex: 1;
      width: 100%;
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      transition: transform 0.05s ease-out;
    }

    .sky-stage.screen-shake {
      animation: stagePopShake 0.16s ease-in-out;
    }

    @keyframes stagePopShake {
      0% { transform: translate(0, 0); }
      20% { transform: translate(-3px, 2px); }
      40% { transform: translate(3px, -2px); }
      60% { transform: translate(-2px, -1px); }
      80% { transform: translate(2px, 1px); }
      100% { transform: translate(0, 0); }
    }

    .guide-banner {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 7px 18px;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      margin-top: 10px;
      z-index: 10;
    }
    .guide-text {
      font-size: clamp(0.78rem, 2.5vw, 0.95rem);
      font-weight: 800;
      color: #e2e8f0;
    }

    .balloons-arena {
      position: absolute;
      inset: 0;
      overflow: hidden;
      pointer-events: auto;
    }

    /* Floating Balloon Item */
    .floating-balloon-btn {
      position: absolute;
      bottom: -110px;
      width: clamp(74px, 18vw, 92px);
      height: clamp(92px, 22vw, 115px);
      border-radius: 50% 50% 50% 50% / 40% 40% 60% 60%;
      border: 2px solid rgba(255, 255, 255, 0.4);
      cursor: pointer;
      outline: none;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 
        inset 0 -6px 12px rgba(0, 0, 0, 0.25),
        inset 0 4px 6px rgba(255, 255, 255, 0.4),
        0 14px 28px rgba(0, 0, 0, 0.45);
      animation: floatUp linear infinite;
      transition: transform 0.12s;
      touch-action: manipulation;
    }
    .floating-balloon-btn:hover {
      transform: scale(1.08);
    }
    .floating-balloon-btn:active {
      transform: scale(0.92);
    }

    /* 💥 Visible Balloon Pop Explode Animation */
    .floating-balloon-btn.is-popping {
      animation: balloonBurstPop 0.18s cubic-bezier(0.1, 0.9, 0.2, 1) forwards !important;
      pointer-events: none;
    }

    @keyframes balloonBurstPop {
      0% {
        transform: scale(1);
        filter: brightness(1);
      }
      30% {
        transform: scale(1.35) rotate(6deg);
        filter: brightness(2) contrast(1.2);
      }
      60% {
        transform: scale(1.6) rotate(-8deg);
        opacity: 0.85;
        filter: brightness(3);
      }
      100% {
        transform: scale(2.1) rotate(14deg);
        opacity: 0;
        filter: brightness(4);
      }
    }

    .balloon-gloss {
      position: absolute;
      top: 14%;
      left: 18%;
      width: 25%;
      height: 38%;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0) 70%);
      transform: rotate(-25deg);
      pointer-events: none;
    }

    .balloon-number {
      font-family: var(--font-display, sans-serif);
      font-size: clamp(1.8rem, 5vw, 2.3rem);
      font-weight: 900;
      color: #ffffff;
      text-shadow: 0 2px 5px rgba(0, 0, 0, 0.5);
      position: relative;
      z-index: 2;
    }

    .balloon-string {
      position: absolute;
      bottom: -22px;
      width: 2px;
      height: 24px;
      background: rgba(255, 255, 255, 0.6);
      transform-origin: top;
      animation: swayString 2s ease-in-out infinite;
    }

    /* 💥 Pop Particles & Shockwaves Layer */
    .pop-burst-layer {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 50;
    }

    .burst-cluster {
      position: absolute;
      transform: translate(-50%, -50%);
      pointer-events: none;
    }

    /* White Flash Core */
    .flash-core {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: radial-gradient(circle, #ffffff 30%, rgba(255, 255, 255, 0) 70%);
      animation: flashCoreExpand 0.22s ease-out forwards;
    }

    @keyframes flashCoreExpand {
      0% {
        width: 15px;
        height: 15px;
        opacity: 1;
      }
      100% {
        width: 120px;
        height: 120px;
        opacity: 0;
      }
    }

    /* Expanding Shockwave Rings */
    .shockwave-ring {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      border-radius: 50%;
      pointer-events: none;
    }

    .shockwave-ring.outer {
      border: 4px solid var(--glow-color);
      box-shadow: 0 0 25px var(--glow-color), inset 0 0 15px var(--glow-color);
      animation: shockwaveExpandOuter 0.5s cubic-bezier(0.1, 0.8, 0.25, 1) forwards;
    }

    .shockwave-ring.inner {
      border: 2px solid #ffffff;
      animation: shockwaveExpandInner 0.35s ease-out forwards;
    }

    @keyframes shockwaveExpandOuter {
      0% {
        width: 30px;
        height: 30px;
        opacity: 1;
        transform: translate(-50%, -50%) scale(0.4);
      }
      100% {
        width: 220px;
        height: 220px;
        opacity: 0;
        transform: translate(-50%, -50%) scale(1.6);
      }
    }

    @keyframes shockwaveExpandInner {
      0% {
        width: 20px;
        height: 20px;
        opacity: 1;
      }
      100% {
        width: 130px;
        height: 130px;
        opacity: 0;
      }
    }

    /* Cartoon Comic "💥 POP!" Badge */
    .comic-pop-badge {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: linear-gradient(135deg, #fde047 0%, #f59e0b 100%);
      color: #78350f;
      font-family: var(--font-display, 'Arial Black', sans-serif);
      font-size: clamp(1.2rem, 3.8vw, 1.6rem);
      font-weight: 900;
      padding: 6px 14px;
      border-radius: 20px;
      border: 3px solid #ffffff;
      box-shadow: 
        0 4px 16px rgba(0, 0, 0, 0.5), 
        0 0 24px rgba(250, 204, 21, 0.85);
      white-space: nowrap;
      animation: comicBadgeSpring 0.68s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
      pointer-events: none;
      z-index: 60;
    }

    @keyframes comicBadgeSpring {
      0% {
        opacity: 0;
        transform: translate(-50%, -50%) scale(0.2) rotate(-18deg);
      }
      35% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1.3) rotate(6deg);
      }
      65% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1) rotate(-2deg);
      }
      100% {
        opacity: 0;
        transform: translate(-50%, -85px) scale(0.65) rotate(0deg);
      }
    }

    /* Rubber Shards in Balloon Color */
    .rubber-shard {
      position: absolute;
      top: 50%;
      left: 50%;
      transform-origin: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
      animation: rubberShardFly 0.65s cubic-bezier(0.12, 0.8, 0.32, 1) forwards;
    }

    @keyframes rubberShardFly {
      0% {
        opacity: 1;
        transform: translate(-50%, -50%) translate(0, 0) rotate(0deg) scale(0.4);
      }
      60% {
        opacity: 0.95;
      }
      100% {
        opacity: 0;
        transform: translate(-50%, -50%) translate(var(--dx), var(--dy)) rotate(var(--rot)) scale(var(--s));
      }
    }

    /* Sparkle Emojis Outward */
    .burst-sparkle {
      position: absolute;
      top: 50%;
      left: 50%;
      font-size: 1.4rem;
      animation: burstSparkleFly 0.65s cubic-bezier(0.165, 0.84, 0.44, 1) forwards;
    }

    @keyframes burstSparkleFly {
      0% {
        opacity: 1;
        transform: translate(-50%, -50%) translate(0px, 0px) scale(0.4);
      }
      100% {
        opacity: 0;
        transform: translate(-50%, -50%) translate(var(--dx), var(--dy)) scale(var(--s)) rotate(var(--rot));
      }
    }

    /* Floating Score +1 */
    .floating-point {
      position: absolute;
      top: -35px;
      left: 50%;
      transform: translateX(-50%);
      font-family: var(--font-display, sans-serif);
      font-size: clamp(1.2rem, 3.4vw, 1.5rem);
      font-weight: 900;
      color: #fde047;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.8), 0 0 16px rgba(250, 204, 21, 0.9);
      animation: floatScoreBounce 0.75s ease-out forwards;
      white-space: nowrap;
      z-index: 62;
    }

    @keyframes floatScoreBounce {
      0% {
        opacity: 0;
        transform: translate(-50%, 0) scale(0.5);
      }
      25% {
        opacity: 1;
        transform: translate(-50%, -22px) scale(1.3);
      }
      60% {
        opacity: 1;
        transform: translate(-50%, -55px) scale(1.1);
      }
      100% {
        opacity: 0;
        transform: translate(-50%, -90px) scale(0.85);
      }
    }

    .game-footer {
      width: 100%;
      text-align: center;
      padding: 12px 20px 20px 20px;
      font-size: 0.7rem;
      color: #64748b;
      position: relative;
      z-index: 20;
    }

    @keyframes floatUp {
      0% {
        transform: translateY(0) rotate(0deg);
        opacity: 0.95;
      }
      50% {
        transform: translateY(-55vh) rotate(6deg);
      }
      100% {
        transform: translateY(-115vh) rotate(-6deg);
        opacity: 0.95;
      }
    }

    @keyframes swayString {
      0%, 100% { transform: rotate(-8deg); }
      50% { transform: rotate(8deg); }
    }
  `]
})
export class BalloonPopComponent implements OnInit, OnDestroy {
  readonly poppedScore = signal<number>(0);
  readonly activeBalloons = signal<BalloonItem[]>([]);
  readonly activeBursts = signal<PopBurst[]>([]);
  readonly isShaking = signal<boolean>(false);
  
  private spawnInterval: any = null;
  private idCounter = 1;
  private burstCounter = 1;

  constructor(
    public appNav: AppNavService,
    public sound: SoundService,
    private speech: SpeechService,
    private confetti: ConfettiService
  ) {}

  ngOnInit(): void {
    this.speech.speakClue('Pop the colorful balloons!');
    
    // Spawn 5 balloons immediately with staggered delays
    for (let i = 0; i < 5; i++) {
      this.spawnBalloon(i * 1.1);
    }

    // Continuously keep 5-6 balloons active in the sky
    this.spawnInterval = setInterval(() => {
      if (this.activeBalloons().filter(b => !b.isPopping).length < 6) {
        this.spawnBalloon(0);
      }
    }, 1200);
  }

  ngOnDestroy(): void {
    if (this.spawnInterval) {
      clearInterval(this.spawnInterval);
    }
  }

  spawnBalloon(delaySec = 0): void {
    const randomNum = Math.floor(Math.random() * 9) + 1;
    const randomTheme = BALLOON_THEMES[Math.floor(Math.random() * BALLOON_THEMES.length)];
    const randomLeft = Math.floor(Math.random() * 75) + 8;
    const speed = Math.floor(Math.random() * 3) + 7; // 7-9s gentle float

    const newBalloon: BalloonItem = {
      id: this.idCounter++,
      num: randomNum,
      theme: randomTheme,
      leftPercent: randomLeft,
      speedSec: speed,
      delaySec: delaySec,
      isPopping: false
    };

    this.activeBalloons.update(list => [...list, newBalloon]);
  }

  popBalloon(balloon: BalloonItem, event: MouseEvent): void {
    if (balloon.isPopping) return;

    // Trigger popping animation on the balloon element itself
    balloon.isPopping = true;

    // Screen tactile shake
    this.isShaking.set(true);
    setTimeout(() => this.isShaking.set(false), 160);

    const arenaRect = (event.currentTarget as HTMLElement).closest('.balloons-arena')?.getBoundingClientRect();
    const btnRect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    
    // Calculate burst coordinates centered on the balloon
    const x = arenaRect ? btnRect.left + btnRect.width / 2 - arenaRect.left : event.clientX;
    const y = arenaRect ? btnRect.top + btnRect.height / 2 - arenaRect.top : event.clientY;

    // 1. Generate 10 Rubber Shards in Balloon's color
    const shardCount = 10;
    const shards: RubberShard[] = [];
    for (let i = 0; i < shardCount; i++) {
      const angle = (i / shardCount) * 2 * Math.PI + (Math.random() - 0.5) * 0.4;
      const distance = 50 + Math.random() * 60;
      shards.push({
        dx: Math.round(Math.cos(angle) * distance),
        dy: Math.round(Math.sin(angle) * distance + 12),
        rot: Math.floor(Math.random() * 720) - 360,
        scale: +(0.65 + Math.random() * 0.7).toFixed(2),
        width: Math.floor(Math.random() * 12) + 12,
        height: Math.floor(Math.random() * 14) + 14,
        clipPath: CLIP_SHAPES[i % CLIP_SHAPES.length]
      });
    }

    // 2. Generate 6 Sparkles / Stars
    const sparkleCount = 6;
    const sparkles: BurstSparkle[] = [];
    for (let i = 0; i < sparkleCount; i++) {
      const angle = (i / sparkleCount) * 2 * Math.PI + (Math.random() - 0.5) * 0.5;
      const distance = 40 + Math.random() * 50;
      sparkles.push({
        emoji: SPARKLE_EMOJIS[Math.floor(Math.random() * SPARKLE_EMOJIS.length)],
        dx: Math.round(Math.cos(angle) * distance),
        dy: Math.round(Math.sin(angle) * distance),
        rot: Math.floor(Math.random() * 360),
        scale: +(0.85 + Math.random() * 0.5).toFixed(2)
      });
    }

    const comicText = COMIC_PHRASES[Math.floor(Math.random() * COMIC_PHRASES.length)];
    const burstId = this.burstCounter++;

    this.activeBursts.update(list => [
      ...list, 
      { 
        id: burstId, 
        x, 
        y, 
        theme: balloon.theme, 
        comicText, 
        shards, 
        sparkles, 
        scoreText: `+1 🌟` 
      }
    ]);

    // Auto cleanup burst cluster after 700ms
    setTimeout(() => {
      this.activeBursts.update(list => list.filter(b => b.id !== burstId));
    }, 700);

    // Audio & Haptic Punch
    this.sound.playBalloonBurst();
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([25, 40, 25]);
      }
    } catch {}

    this.poppedScore.update(s => s + 1);
    this.sound.playCountNumber(balloon.num);

    // Remove the popped balloon after its 180ms explosion animation finishes
    setTimeout(() => {
      this.activeBalloons.update(list => list.filter(b => b.id !== balloon.id));
    }, 180);

    // Spawn a replacement balloon immediately so the sky remains active
    this.spawnBalloon(0);

    // Milestone celebration every 5 pops
    if (this.poppedScore() % 5 === 0) {
      this.sound.playSuccess();
      this.confetti.fire();
      setTimeout(() => {
        this.speech.speakClue(`Awesome! You popped ${this.poppedScore()} balloons!`);
      }, 400);
    }
  }
}

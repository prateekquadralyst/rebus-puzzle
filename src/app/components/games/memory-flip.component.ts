import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppNavService } from '../../core/services/app-nav.service';
import { SoundService } from '../../core/services/sound.service';
import { SpeechService } from '../../core/services/speech.service';
import { ConfettiService } from '../../core/services/confetti.service';

export interface MemoryCard {
  id: number;
  pairKey: string;
  name: string;
  hindiName: string;
  emoji: string;
  color: string;
  bgGrad: string;
  isFlipped: boolean;
  isMatched: boolean;
  isMismatch?: boolean;
}

interface StarParticle {
  id: number;
  x: number;
  y: number;
}

@Component({
  selector: 'app-memory-flip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="game-viewport" (pointerdown)="onUserInteract()">
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
          <span class="game-tag">🃏 MEMORY MATCH</span>
          <span class="stage-tag">Pairs: {{ matchedPairsCount() }} / {{ targetPairs() }} ⭐</span>
        </div>

        <div class="header-actions">
          <button 
            type="button" 
            (click)="replayInstruction()" 
            class="action-circle-btn sound-btn"
            title="Repeat voice guide">
            <span>📢</span>
          </button>
          <button 
            type="button" 
            (click)="sound.toggleMute()" 
            class="action-circle-btn mute-btn"
            [title]="sound.isMuted() ? 'Turn Sound On' : 'Turn Sound Off'">
            {{ sound.isMuted() ? '🔇' : '🎵' }}
          </button>
        </div>
      </header>

      <!-- Main Memory Board -->
      <main class="memory-stage">
        <!-- Interactive Mascot & Voice Guide Banner -->
        <div class="mascot-banner animate-pop" (click)="onMascotTap()">
          <div class="mascot-avatar" [class.mascot-bouncing]="isMascotJumping()">
            <span>🧸</span>
          </div>
          <div class="mascot-speech">
            @if (isPeeking()) {
              <span class="speech-highlight">👀 Look carefully and remember your friends! ({{ peekCountdown() }}s)</span>
            } @else if (isAllMatched()) {
              <span class="speech-highlight">🎉 WONDERFUL! You found every identical pair!</span>
            } @else if (firstCard()) {
              <span class="speech-highlight">👉 Found {{ firstCard()?.name }}! Now find the other {{ firstCard()?.name }} {{ firstCard()?.emoji }}</span>
            } @else {
              <span>Tap any card to uncover a hidden friend! 👇</span>
            }
          </div>
        </div>

        <!-- Initial Peek Countdown Indicator -->
        @if (isPeeking()) {
          <div class="peek-meter-container animate-pop">
            <span class="peek-badge">Hiding in {{ peekCountdown() }}s...</span>
            <div class="peek-track">
              <div class="peek-fill" [style.width.%]="(peekCountdown() / 3) * 100"></div>
            </div>
          </div>
        }

        <!-- Cards Grid Area -->
        <div 
          class="cards-grid" 
          [class.grid-4]="targetPairs() === 2"
          [class.grid-6]="targetPairs() === 3"
          [class.grid-8]="targetPairs() === 4">
          
          @for (card of cards(); track card.id) {
            <div 
              class="card-tile-wrap"
              [attr.data-id]="card.id"
              [class.is-matched]="card.isMatched"
              [class.is-mismatch]="card.isMismatch"
              [class.is-first-selected]="firstCard()?.id === card.id">
              
              <button 
                type="button"
                (click)="onCardClick(card, $event)"
                [disabled]="isPeeking() || isChecking() || card.isFlipped || card.isMatched"
                class="card-tile"
                [class.card-flipped]="card.isFlipped"
                [class.card-matched]="card.isMatched"
                [style.--card-glow]="card.color">
                
                <div class="card-inner">
                  <!-- Back Face (Gift / Star Hidden) -->
                  <div class="card-face card-back">
                    <div class="back-design">
                      <span class="back-star-icon">⭐</span>
                      <span class="tap-hint-text">TAP ME</span>
                    </div>
                  </div>

                  <!-- Front Face (Revealed Animal / Fruit Friend) -->
                  <div class="card-face card-front" [style.background]="card.bgGrad">
                    <span class="front-emoji">{{ card.emoji }}</span>
                    <span class="front-name">{{ card.name }}</span>
                    @if (card.isMatched) {
                      <div class="match-badge animate-pop">✓</div>
                    }
                  </div>
                </div>
              </button>
            </div>
          }
        </div>

        <!-- Animated Demo Hand Pointer for Toddlers -->
        @if (showDemoHand && demoTarget) {
          <div 
            class="demo-hand-pointer"
            [style.left.px]="demoTarget.x"
            [style.top.px]="demoTarget.y">
            <span class="hand-emoji">👆</span>
            <span class="hand-caption">Tap to flip!</span>
          </div>
        }

        <!-- Star Particles Burst on Match -->
        @for (star of activeStars; track star.id) {
          <div 
            class="star-burst-cluster"
            [style.left.px]="star.x"
            [style.top.px]="star.y">
            <span class="flying-star s1">⭐</span>
            <span class="flying-star s2">✨</span>
            <span class="flying-star s3">🌟</span>
            <span class="flying-star s4">🎉</span>
          </div>
        }

        <!-- Victory Modal Overlay -->
        @if (isAllMatched()) {
          <div class="victory-overlay animate-pop">
            <div class="victory-card">
              <div class="victory-mascot animate-bounce">🧸🎉</div>
              <h2 class="victory-title">SUPER MEMORY!</h2>
              <p class="victory-subtitle">You remembered all the matching pairs!</p>
              
              <div class="earned-stars-row">
                <span class="big-star">⭐</span>
                <span class="big-star">⭐</span>
                <span class="big-star">⭐</span>
              </div>

              <button 
                type="button" 
                (click)="nextRound()" 
                class="victory-next-btn">
                <span>{{ targetPairs() < 4 ? 'NEXT ROUND (More Cards) ▶' : 'PLAY AGAIN 🔄' }}</span>
              </button>
            </div>
          </div>
        }
      </main>

      <footer class="game-footer">
        <p>💡 Tip: Look at the cards closely during the peek preview!</p>
      </footer>
    </div>
  `,
  styles: [`
    .game-viewport {
      min-height: 100vh;
      min-height: 100dvh;
      width: 100%;
      background: radial-gradient(circle at 50% 12%, #3b0764 0%, #0f172a 70%, #020617 100%);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      user-select: none;
      overflow-x: hidden;
      touch-action: manipulation;
    }

    .game-header {
      width: 100%;
      max-width: 900px;
      margin: 0 auto;
      padding: 12px 18px;
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
      font-size: 0.82rem;
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
      gap: 2px;
    }
    .game-tag {
      font-size: 0.84rem;
      font-weight: 900;
      color: #f472b6;
      letter-spacing: 0.06em;
      text-shadow: 0 0 12px rgba(244, 114, 182, 0.5);
    }
    .stage-tag {
      font-size: 0.76rem;
      font-weight: 800;
      color: #facc15;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .action-circle-btn {
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
    .action-circle-btn:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: scale(1.08);
    }

    .memory-stage {
      flex: 1;
      max-width: 900px;
      width: 100%;
      margin: 0 auto;
      padding: 6px 16px 18px 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-around;
      position: relative;
    }

    /* Mascot Banner */
    .mascot-banner {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 8px 18px;
      border-radius: 24px;
      background: rgba(255, 255, 255, 0.08);
      border: 1.5px solid rgba(255, 255, 255, 0.18);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
      cursor: pointer;
      backdrop-filter: blur(8px);
      margin-bottom: 8px;
      transition: transform 0.2s;
    }
    .mascot-banner:hover {
      transform: scale(1.03);
    }
    .mascot-avatar {
      font-size: 1.6rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .mascot-bouncing {
      animation: mascotJump 0.4s ease-in-out infinite alternate;
    }
    @keyframes mascotJump {
      0% { transform: translateY(0) scale(1); }
      100% { transform: translateY(-8px) scale(1.15); }
    }
    .mascot-speech {
      font-size: clamp(0.8rem, 2.6vw, 0.98rem);
      font-weight: 800;
      color: #e2e8f0;
    }
    .speech-highlight {
      color: #fde047;
      text-shadow: 0 0 10px rgba(253, 224, 71, 0.5);
    }

    /* Peek Countdown Meter */
    .peek-meter-container {
      width: 100%;
      max-width: 320px;
      margin-bottom: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }
    .peek-badge {
      font-size: 0.72rem;
      font-weight: 800;
      color: #38bdf8;
      letter-spacing: 0.04em;
    }
    .peek-track {
      width: 100%;
      height: 6px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.1);
      overflow: hidden;
    }
    .peek-fill {
      height: 100%;
      background: linear-gradient(90deg, #38bdf8, #818cf8);
      border-radius: 10px;
      transition: width 0.3s linear;
    }

    /* Cards Grid */
    .cards-grid {
      display: grid;
      gap: clamp(12px, 3vw, 18px);
      justify-content: center;
      perspective: 1000px;
      margin: 10px 0 20px 0;
      width: 100%;
    }
    .grid-4 {
      grid-template-columns: repeat(2, clamp(96px, 26vw, 128px));
    }
    .grid-6 {
      grid-template-columns: repeat(3, clamp(88px, 24vw, 120px));
    }
    .grid-8 {
      grid-template-columns: repeat(4, clamp(76px, 20vw, 105px));
    }

    .card-tile-wrap {
      perspective: 1000px;
      transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    /* First Selected Card Jiggles Excitingly */
    .card-tile-wrap.is-first-selected {
      transform: scale(1.08);
      animation: cardPulse 1.2s ease-in-out infinite;
    }

    @keyframes cardPulse {
      0%, 100% { transform: scale(1.06); }
      50% { transform: scale(1.1); }
    }

    /* Mismatch Shake */
    .card-tile-wrap.is-mismatch {
      animation: cardShake 0.45s ease-in-out;
    }
    @keyframes cardShake {
      0%, 100% { transform: translateX(0); }
      20% { transform: translateX(-8px) rotate(-4deg); }
      40% { transform: translateX(8px) rotate(4deg); }
      60% { transform: translateX(-6px) rotate(-2deg); }
      80% { transform: translateX(6px) rotate(2deg); }
    }

    .card-tile {
      width: 100%;
      aspect-ratio: 1 / 1.18;
      background: transparent;
      border: none;
      outline: none;
      cursor: pointer;
      padding: 0;
      position: relative;
    }
    .card-tile:disabled {
      cursor: default;
    }

    .card-inner {
      width: 100%;
      height: 100%;
      position: relative;
      transform-style: preserve-3d;
      transition: transform 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .card-tile.card-flipped .card-inner,
    .card-tile.card-matched .card-inner {
      transform: rotateY(180deg);
    }

    .card-face {
      position: absolute;
      inset: 0;
      backface-visibility: hidden;
      border-radius: 22px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-shadow: 
        0 10px 24px rgba(0, 0, 0, 0.45),
        inset 0 2px 6px rgba(255, 255, 255, 0.3);
      user-select: none;
    }

    /* Card Back (Hidden State) */
    .card-back {
      background: linear-gradient(145deg, #e11d48 0%, #9f1239 100%);
      border: 3px solid #fda4af;
      transform: rotateY(0deg);
    }
    .card-tile:hover:not(:disabled) .card-back {
      border-color: #ffffff;
      box-shadow: 0 12px 28px rgba(225, 29, 72, 0.6);
      transform: scale(1.03);
    }

    .back-design {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
    }
    .back-star-icon {
      font-size: clamp(2.2rem, 6.5vw, 3rem);
      filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.35));
      animation: starGlow 2s ease-in-out infinite alternate;
    }
    @keyframes starGlow {
      0% { transform: scale(1); filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3)); }
      100% { transform: scale(1.12); filter: drop-shadow(0 0 12px #fde047); }
    }
    .tap-hint-text {
      font-size: 0.62rem;
      font-weight: 900;
      color: #ffe4e6;
      background: rgba(0, 0, 0, 0.3);
      padding: 2px 6px;
      border-radius: 8px;
      letter-spacing: 0.05em;
    }

    /* Card Front (Revealed State) */
    .card-front {
      border: 3.5px solid #ffffff;
      transform: rotateY(180deg);
      gap: 4px;
      position: relative;
    }
    .front-emoji {
      font-size: clamp(2.5rem, 7.5vw, 3.4rem);
      filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.45));
    }
    .front-name {
      font-size: 0.72rem;
      font-weight: 900;
      color: #ffffff;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
    }

    .card-matched .card-front {
      border-color: #4ade80 !important;
      box-shadow: 
        0 0 30px rgba(74, 222, 128, 0.8),
        inset 0 0 15px rgba(255, 255, 255, 0.4) !important;
    }

    .match-badge {
      position: absolute;
      top: 6px;
      right: 6px;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #10b981;
      color: white;
      font-size: 13px;
      font-weight: 900;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
    }

    /* Demo Hand Pointer */
    .demo-hand-pointer {
      position: fixed;
      pointer-events: none;
      z-index: 100;
      display: flex;
      flex-direction: column;
      align-items: center;
      transform: translate(-50%, -50%);
      animation: demoHandBounce 1.2s ease-in-out infinite;
    }
    .hand-emoji {
      font-size: 2.2rem;
      filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.6));
    }
    .hand-caption {
      font-size: 0.75rem;
      font-weight: 900;
      color: #fde047;
      background: rgba(0, 0, 0, 0.8);
      padding: 2px 8px;
      border-radius: 10px;
      border: 1px solid #fde047;
      white-space: nowrap;
    }
    @keyframes demoHandBounce {
      0%, 100% { transform: translate(-50%, -50%) scale(1); }
      50% { transform: translate(-50%, -65%) scale(1.15); }
    }

    /* Star Burst on Match */
    .star-burst-cluster {
      position: absolute;
      transform: translate(-50%, -50%);
      pointer-events: none;
      z-index: 60;
    }
    .flying-star {
      position: absolute;
      top: 50%;
      left: 50%;
      font-size: 1.4rem;
      animation: flyOutStar 0.65s cubic-bezier(0.12, 0.8, 0.32, 1) forwards;
    }
    .s1 { --dx: 45px; --dy: -45px; }
    .s2 { --dx: -45px; --dy: -45px; }
    .s3 { --dx: 50px; --dy: 30px; }
    .s4 { --dx: -50px; --dy: 30px; }

    @keyframes flyOutStar {
      0% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(0.5);
      }
      100% {
        opacity: 0;
        transform: translate(-50%, -50%) translate(var(--dx), var(--dy)) scale(1.35) rotate(180deg);
      }
    }

    /* Victory Celebration Overlay */
    .victory-overlay {
      position: absolute;
      inset: 0;
      background: rgba(2, 6, 23, 0.85);
      backdrop-filter: blur(12px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
      padding: 20px;
    }

    .victory-card {
      background: linear-gradient(145deg, #3b0764 0%, #1e1b4b 100%);
      border: 3px solid #fbbf24;
      border-radius: 32px;
      padding: 30px 24px;
      max-width: 400px;
      width: 100%;
      text-align: center;
      box-shadow: 
        0 20px 50px rgba(0, 0, 0, 0.7),
        0 0 40px rgba(251, 191, 36, 0.4);
    }

    .victory-mascot {
      font-size: 3.5rem;
      margin-bottom: 8px;
    }

    .victory-title {
      font-family: var(--font-display, sans-serif);
      font-size: 1.8rem;
      font-weight: 900;
      color: #fde047;
      margin-bottom: 4px;
      text-shadow: 0 0 15px rgba(253, 224, 71, 0.6);
    }

    .victory-subtitle {
      font-size: 0.95rem;
      font-weight: 700;
      color: #e2e8f0;
      margin-bottom: 16px;
    }

    .earned-stars-row {
      display: flex;
      justify-content: center;
      gap: 12px;
      margin-bottom: 24px;
    }
    .big-star {
      font-size: 2.2rem;
      animation: starPop 0.5s ease-out forwards;
      filter: drop-shadow(0 0 10px #fde047);
    }
    @keyframes starPop {
      0% { transform: scale(0); opacity: 0; }
      80% { transform: scale(1.3); }
      100% { transform: scale(1); opacity: 1; }
    }

    .victory-next-btn {
      width: 100%;
      padding: 16px;
      border-radius: 22px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border: 2px solid #6ee7b7;
      color: white;
      font-size: 1.15rem;
      font-weight: 900;
      cursor: pointer;
      box-shadow: 0 12px 30px rgba(16, 185, 129, 0.5);
      transition: all 0.2s;
    }
    .victory-next-btn:hover {
      transform: scale(1.04);
      box-shadow: 0 16px 36px rgba(16, 185, 129, 0.65);
    }

    .game-footer {
      width: 100%;
      text-align: center;
      padding: 10px 16px 16px 16px;
      font-size: 0.72rem;
      color: #64748b;
    }
  `]
})
export class MemoryFlipComponent implements OnInit, OnDestroy {
  readonly targetPairs = signal<number>(2); // Starts with 2 pairs (4 cards)
  readonly matchedPairsCount = signal<number>(0);
  readonly cards = signal<MemoryCard[]>([]);
  readonly firstCard = signal<MemoryCard | null>(null);
  readonly isChecking = signal<boolean>(false);
  readonly isPeeking = signal<boolean>(false);
  readonly peekCountdown = signal<number>(3);
  readonly isMascotJumping = signal<boolean>(false);

  readonly isAllMatched = computed(() => {
    return this.targetPairs() > 0 && this.matchedPairsCount() === this.targetPairs();
  });

  // Animated demo hand
  showDemoHand = false;
  demoTarget: { x: number; y: number } | null = null;
  private demoTimer: any = null;
  private peekInterval: any = null;
  private starCounter = 1;

  activeStars: StarParticle[] = [];

readonly library = [
  // 🐾 Animals
  { key: 'puppy', name: 'Puppy', hindiName: 'Kutta', emoji: '🐶', color: '#f59e0b', bgGrad: 'linear-gradient(135deg, #f59e0b, #d97706)' },
  { key: 'kitten', name: 'Kitten', hindiName: 'Billi', emoji: '🐱', color: '#38bdf8', bgGrad: 'linear-gradient(135deg, #38bdf8, #0284c7)' },
  { key: 'panda', name: 'Panda', hindiName: 'Panda', emoji: '🐼', color: '#10b981', bgGrad: 'linear-gradient(135deg, #10b981, #047857)' },
  { key: 'lion', name: 'Lion', hindiName: 'Sher', emoji: '🦁', color: '#f97316', bgGrad: 'linear-gradient(135deg, #f97316, #c2410c)' },
  { key: 'bunny', name: 'Bunny', hindiName: 'Khargosh', emoji: '🐰', color: '#ec4899', bgGrad: 'linear-gradient(135deg, #ec4899, #be185d)' },
  { key: 'frog', name: 'Frog', hindiName: 'Mendhak', emoji: '🐸', color: '#84cc16', bgGrad: 'linear-gradient(135deg, #84cc16, #4d7c0f)' },
  { key: 'monkey', name: 'Monkey', hindiName: 'Bandar', emoji: '🐵', color: '#a855f7', bgGrad: 'linear-gradient(135deg, #a855f7, #7e22ce)' },
  { key: 'elephant', name: 'Elephant', hindiName: 'Haathi', emoji: '🐘', color: '#64748b', bgGrad: 'linear-gradient(135deg, #64748b, #334155)' },
  { key: 'tiger', name: 'Tiger', hindiName: 'Baagh', emoji: '🐯', color: '#f97316', bgGrad: 'linear-gradient(135deg, #f97316, #ea580c)' },
  { key: 'bear', name: 'Bear', hindiName: 'Bhalu', emoji: '🐻', color: '#92400e', bgGrad: 'linear-gradient(135deg, #92400e, #78350f)' },
  { key: 'fox', name: 'Fox', hindiName: 'Lomdi', emoji: '🦊', color: '#fb923c', bgGrad: 'linear-gradient(135deg, #fb923c, #ea580c)' },
  { key: 'horse', name: 'Horse', hindiName: 'Ghoda', emoji: '🐴', color: '#8b5cf6', bgGrad: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' },
  { key: 'cow', name: 'Cow', hindiName: 'Gaay', emoji: '🐮', color: '#f8fafc', bgGrad: 'linear-gradient(135deg, #f8fafc, #cbd5e1)' },
  { key: 'pig', name: 'Pig', hindiName: 'Suar', emoji: '🐷', color: '#f472b6', bgGrad: 'linear-gradient(135deg, #f472b6, #db2777)' },
  { key: 'mouse', name: 'Mouse', hindiName: 'Chuha', emoji: '🐭', color: '#94a3b8', bgGrad: 'linear-gradient(135deg, #94a3b8, #64748b)' },

  // 🐦 Birds
  { key: 'chicken', name: 'Chicken', hindiName: 'Murgi', emoji: '🐔', color: '#facc15', bgGrad: 'linear-gradient(135deg, #facc15, #ca8a04)' },
  { key: 'penguin', name: 'Penguin', hindiName: 'Penguin', emoji: '🐧', color: '#475569', bgGrad: 'linear-gradient(135deg, #475569, #1e293b)' },
  { key: 'bird', name: 'Bird', hindiName: 'Pakshi', emoji: '🐦', color: '#0ea5e9', bgGrad: 'linear-gradient(135deg, #0ea5e9, #0369a1)' },
  { key: 'eagle', name: 'Eagle', hindiName: 'Baaz', emoji: '🦅', color: '#78716c', bgGrad: 'linear-gradient(135deg, #78716c, #44403c)' },
  { key: 'owl', name: 'Owl', hindiName: 'Ullu', emoji: '🦉', color: '#a16207', bgGrad: 'linear-gradient(135deg, #a16207, #713f12)' },
  { key: 'parrot', name: 'Parrot', hindiName: 'Tota', emoji: '🦜', color: '#22c55e', bgGrad: 'linear-gradient(135deg, #22c55e, #15803d)' },

  // 🐠 Sea Animals
  { key: 'fish', name: 'Fish', hindiName: 'Machhli', emoji: '🐟', color: '#06b6d4', bgGrad: 'linear-gradient(135deg, #06b6d4, #0e7490)' },
  { key: 'dolphin', name: 'Dolphin', hindiName: 'Dolphin', emoji: '🐬', color: '#3b82f6', bgGrad: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' },
  { key: 'whale', name: 'Whale', hindiName: 'Whale', emoji: '🐳', color: '#2563eb', bgGrad: 'linear-gradient(135deg, #2563eb, #1e40af)' },
  { key: 'octopus', name: 'Octopus', hindiName: 'Octopus', emoji: '🐙', color: '#e11d48', bgGrad: 'linear-gradient(135deg, #e11d48, #9f1239)' },
  { key: 'crab', name: 'Crab', hindiName: 'Kekda', emoji: '🦀', color: '#ef4444', bgGrad: 'linear-gradient(135deg, #ef4444, #b91c1c)' },
  { key: 'turtle', name: 'Turtle', hindiName: 'Kachhua', emoji: '🐢', color: '#16a34a', bgGrad: 'linear-gradient(135deg, #16a34a, #166534)' },

  // 🍎 Fruits
  { key: 'apple', name: 'Apple', hindiName: 'Seb', emoji: '🍎', color: '#ef4444', bgGrad: 'linear-gradient(135deg, #ef4444, #b91c1c)' },
  { key: 'banana', name: 'Banana', hindiName: 'Kela', emoji: '🍌', color: '#facc15', bgGrad: 'linear-gradient(135deg, #facc15, #ca8a04)' },
  { key: 'orange', name: 'Orange', hindiName: 'Santra', emoji: '🍊', color: '#f97316', bgGrad: 'linear-gradient(135deg, #f97316, #c2410c)' },
  { key: 'watermelon', name: 'Watermelon', hindiName: 'Tarbooz', emoji: '🍉', color: '#22c55e', bgGrad: 'linear-gradient(135deg, #22c55e, #15803d)' },
  { key: 'grapes', name: 'Grapes', hindiName: 'Angoor', emoji: '🍇', color: '#8b5cf6', bgGrad: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' },
  { key: 'strawberry', name: 'Strawberry', hindiName: 'Strawberry', emoji: '🍓', color: '#f43f5e', bgGrad: 'linear-gradient(135deg, #f43f5e, #be123c)' },
  { key: 'mango', name: 'Mango', hindiName: 'Aam', emoji: '🥭', color: '#f59e0b', bgGrad: 'linear-gradient(135deg, #f59e0b, #d97706)' },
  { key: 'pineapple', name: 'Pineapple', hindiName: 'Ananas', emoji: '🍍', color: '#eab308', bgGrad: 'linear-gradient(135deg, #eab308, #a16207)' },
  { key: 'cherries', name: 'Cherries', hindiName: 'Cherry', emoji: '🍒', color: '#dc2626', bgGrad: 'linear-gradient(135deg, #dc2626, #991b1b)' },
  { key: 'peach', name: 'Peach', hindiName: 'Aadu', emoji: '🍑', color: '#fb7185', bgGrad: 'linear-gradient(135deg, #fb7185, #e11d48)' },

  // 🥕 Vegetables
  { key: 'carrot', name: 'Carrot', hindiName: 'Gajar', emoji: '🥕', color: '#f97316', bgGrad: 'linear-gradient(135deg, #f97316, #c2410c)' },
  { key: 'corn', name: 'Corn', hindiName: 'Makka', emoji: '🌽', color: '#facc15', bgGrad: 'linear-gradient(135deg, #facc15, #a16207)' },
  { key: 'potato', name: 'Potato', hindiName: 'Aloo', emoji: '🥔', color: '#a16207', bgGrad: 'linear-gradient(135deg, #a16207, #713f12)' },
  { key: 'tomato', name: 'Tomato', hindiName: 'Tamatar', emoji: '🍅', color: '#ef4444', bgGrad: 'linear-gradient(135deg, #ef4444, #b91c1c)' },
  { key: 'broccoli', name: 'Broccoli', hindiName: 'Broccoli', emoji: '🥦', color: '#16a34a', bgGrad: 'linear-gradient(135deg, #16a34a, #166534)' },
  { key: 'eggplant', name: 'Eggplant', hindiName: 'Baingan', emoji: '🍆', color: '#9333ea', bgGrad: 'linear-gradient(135deg, #9333ea, #6b21a8)' },

  // 🚗 Vehicles
  { key: 'car', name: 'Car', hindiName: 'Gaadi', emoji: '🚗', color: '#ef4444', bgGrad: 'linear-gradient(135deg, #ef4444, #b91c1c)' },
  { key: 'bus', name: 'Bus', hindiName: 'Bus', emoji: '🚌', color: '#eab308', bgGrad: 'linear-gradient(135deg, #eab308, #a16207)' },
  { key: 'truck', name: 'Truck', hindiName: 'Truck', emoji: '🚚', color: '#3b82f6', bgGrad: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' },
  { key: 'bike', name: 'Motorcycle', hindiName: 'Motorcycle', emoji: '🏍️', color: '#64748b', bgGrad: 'linear-gradient(135deg, #64748b, #334155)' },
  { key: 'bicycle', name: 'Bicycle', hindiName: 'Cycle', emoji: '🚲', color: '#10b981', bgGrad: 'linear-gradient(135deg, #10b981, #047857)' },
  { key: 'airplane', name: 'Airplane', hindiName: 'Hawai Jahaz', emoji: '✈️', color: '#0ea5e9', bgGrad: 'linear-gradient(135deg, #0ea5e9, #0369a1)' },
  { key: 'rocket', name: 'Rocket', hindiName: 'Rocket', emoji: '🚀', color: '#8b5cf6', bgGrad: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' },

  // 🏠 Everyday Objects
  { key: 'house', name: 'House', hindiName: 'Ghar', emoji: '🏠', color: '#f59e0b', bgGrad: 'linear-gradient(135deg, #f59e0b, #d97706)' },
  { key: 'phone', name: 'Phone', hindiName: 'Mobile', emoji: '📱', color: '#6366f1', bgGrad: 'linear-gradient(135deg, #6366f1, #4338ca)' },
  { key: 'computer', name: 'Computer', hindiName: 'Computer', emoji: '💻', color: '#64748b', bgGrad: 'linear-gradient(135deg, #64748b, #334155)' },
  { key: 'book', name: 'Book', hindiName: 'Kitaab', emoji: '📚', color: '#3b82f6', bgGrad: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' },
  { key: 'pencil', name: 'Pencil', hindiName: 'Pencil', emoji: '✏️', color: '#f59e0b', bgGrad: 'linear-gradient(135deg, #f59e0b, #d97706)' },
  { key: 'clock', name: 'Clock', hindiName: 'Ghadi', emoji: '⏰', color: '#ec4899', bgGrad: 'linear-gradient(135deg, #ec4899, #be185d)' },
  { key: 'camera', name: 'Camera', hindiName: 'Camera', emoji: '📷', color: '#475569', bgGrad: 'linear-gradient(135deg, #475569, #1e293b)' },
  { key: 'gift', name: 'Gift', hindiName: 'Tohfa', emoji: '🎁', color: '#ec4899', bgGrad: 'linear-gradient(135deg, #ec4899, #be185d)' },
  { key: 'balloon', name: 'Balloon', hindiName: 'Gubbara', emoji: '🎈', color: '#f43f5e', bgGrad: 'linear-gradient(135deg, #f43f5e, #be123c)' },
  { key: 'star', name: 'Star', hindiName: 'Sitara', emoji: '⭐', color: '#eab308', bgGrad: 'linear-gradient(135deg, #eab308, #a16207)' },
  { key: 'heart', name: 'Heart', hindiName: 'Dil', emoji: '❤️', color: '#ef4444', bgGrad: 'linear-gradient(135deg, #ef4444, #b91c1c)' },

  // ⚽ Sports & Fun
  { key: 'football', name: 'Football', hindiName: 'Football', emoji: '⚽', color: '#334155', bgGrad: 'linear-gradient(135deg, #334155, #0f172a)' },
  { key: 'basketball', name: 'Basketball', hindiName: 'Basketball', emoji: '🏀', color: '#f97316', bgGrad: 'linear-gradient(135deg, #f97316, #c2410c)' },
  { key: 'cricket', name: 'Cricket', hindiName: 'Cricket', emoji: '🏏', color: '#16a34a', bgGrad: 'linear-gradient(135deg, #16a34a, #166534)' },
  { key: 'soccer', name: 'Soccer', hindiName: 'Football', emoji: '⚽', color: '#10b981', bgGrad: 'linear-gradient(135deg, #10b981, #047857)' },
  { key: 'medal', name: 'Medal', hindiName: 'Padak', emoji: '🏅', color: '#eab308', bgGrad: 'linear-gradient(135deg, #eab308, #a16207)' },

  // 🌈 Nature & Weather
  { key: 'sun', name: 'Sun', hindiName: 'Suraj', emoji: '☀️', color: '#f59e0b', bgGrad: 'linear-gradient(135deg, #f59e0b, #d97706)' },
  { key: 'moon', name: 'Moon', hindiName: 'Chaand', emoji: '🌙', color: '#6366f1', bgGrad: 'linear-gradient(135deg, #6366f1, #4338ca)' },
  { key: 'rainbow', name: 'Rainbow', hindiName: 'Indradhanush', emoji: '🌈', color: '#8b5cf6', bgGrad: 'linear-gradient(135deg, #8b5cf6, #ec4899)' },
  { key: 'cloud', name: 'Cloud', hindiName: 'Baadal', emoji: '☁️', color: '#94a3b8', bgGrad: 'linear-gradient(135deg, #94a3b8, #64748b)' },
  { key: 'flower', name: 'Flower', hindiName: 'Phool', emoji: '🌸', color: '#ec4899', bgGrad: 'linear-gradient(135deg, #ec4899, #be185d)' },
  { key: 'tree', name: 'Tree', hindiName: 'Ped', emoji: '🌳', color: '#16a34a', bgGrad: 'linear-gradient(135deg, #16a34a, #166534)' },

  // 🍔 Food
  { key: 'pizza', name: 'Pizza', hindiName: 'Pizza', emoji: '🍕', color: '#f97316', bgGrad: 'linear-gradient(135deg, #f97316, #c2410c)' },
  { key: 'burger', name: 'Burger', hindiName: 'Burger', emoji: '🍔', color: '#a16207', bgGrad: 'linear-gradient(135deg, #a16207, #713f12)' },
  { key: 'icecream', name: 'Ice Cream', hindiName: 'Ice Cream', emoji: '🍦', color: '#f472b6', bgGrad: 'linear-gradient(135deg, #f472b6, #db2777)' },
  { key: 'cake', name: 'Cake', hindiName: 'Cake', emoji: '🎂', color: '#ec4899', bgGrad: 'linear-gradient(135deg, #ec4899, #be185d)' },
  { key: 'cookie', name: 'Cookie', hindiName: 'Biscuit', emoji: '🍪', color: '#d97706', bgGrad: 'linear-gradient(135deg, #d97706, #92400e)' },
  { key: 'candy', name: 'Candy', hindiName: 'Toffee', emoji: '🍬', color: '#a855f7', bgGrad: 'linear-gradient(135deg, #a855f7, #7e22ce)' }
];

  constructor(
    public appNav: AppNavService,
    public sound: SoundService,
    private speech: SpeechService,
    private confetti: ConfettiService
  ) {}

  ngOnInit(): void {
    this.startRound(2);
  }

  ngOnDestroy(): void {
    this.cleanupTimers();
  }

  private cleanupTimers(): void {
    if (this.demoTimer) clearTimeout(this.demoTimer);
    if (this.peekInterval) clearInterval(this.peekInterval);
  }

  startRound(pairs: number): void {
    this.cleanupTimers();
    this.targetPairs.set(pairs);
    this.matchedPairsCount.set(0);
    this.firstCard.set(null);
    this.isChecking.set(false);

    // Pick random subset of pairs from library
    const shuffledLib = [...this.library].sort(() => 0.5 - Math.random());
    const chosen = shuffledLib.slice(0, pairs);

    // Generate two identical cards for each chosen pair
    const deck: MemoryCard[] = [];
    let idCounter = 1;
    chosen.forEach(item => {
      deck.push({
        id: idCounter++,
        pairKey: item.key,
        name: item.name,
        hindiName: item.hindiName,
        emoji: item.emoji,
        color: item.color,
        bgGrad: item.bgGrad,
        isFlipped: true, // Start Face-UP for Peek!
        isMatched: false,
        isMismatch: false
      });
      deck.push({
        id: idCounter++,
        pairKey: item.key,
        name: item.name,
        hindiName: item.hindiName,
        emoji: item.emoji,
        color: item.color,
        bgGrad: item.bgGrad,
        isFlipped: true, // Start Face-UP for Peek!
        isMatched: false,
        isMismatch: false
      });
    });

    // Shuffle deck
    this.cards.set(deck.sort(() => 0.5 - Math.random()));

    // 🌟 PEEK PREVIEW: Show all cards face up for 2.5 seconds so toddlers understand!
    this.isPeeking.set(true);
    this.peekCountdown.set(3);
    this.sound.playHint();
    this.speech.speak('Look and remember where your friends are hiding!');

    let secondsLeft = 3;
    this.peekInterval = setInterval(() => {
      secondsLeft -= 1;
      this.peekCountdown.set(secondsLeft);
      if (secondsLeft <= 0) {
        clearInterval(this.peekInterval);
        this.endPeek();
      }
    }, 900);
  }

  private endPeek(): void {
    this.isPeeking.set(false);
    this.sound.playTap();

    // Flip all cards face down
    this.cards.update(list => list.map(c => ({ ...c, isFlipped: false })));

    setTimeout(() => {
      this.speech.speak('Cards are hidden! Tap two cards to find a match!');
      this.scheduleDemoHand();
    }, 400);
  }

  scheduleDemoHand(): void {
    if (this.demoTimer) clearTimeout(this.demoTimer);
    this.showDemoHand = false;

    this.demoTimer = setTimeout(() => {
      if (this.isAllMatched() || this.isPeeking()) return;
      const unplaced = this.cards().find(c => !c.isMatched && !c.isFlipped);
      if (!unplaced) return;

      const elem = document.querySelector(`.card-tile-wrap[data-id="${unplaced.id}"]`);
      if (elem) {
        const r = elem.getBoundingClientRect();
        this.demoTarget = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        this.showDemoHand = true;
      }
    }, 2800);
  }

  onUserInteract(): void {
    this.showDemoHand = false;
    if (this.demoTimer) clearTimeout(this.demoTimer);
  }

  onMascotTap(): void {
    this.sound.playGiggle();
    this.isMascotJumping.set(true);
    setTimeout(() => this.isMascotJumping.set(false), 700);
    this.replayInstruction();
  }

  replayInstruction(): void {
    this.sound.playTap();
    if (this.firstCard()) {
      this.speech.speak(`You found ${this.firstCard()?.name}! Where is the other ${this.firstCard()?.name}?`);
    } else {
      this.speech.speak('Tap any card to uncover a friend, then find its twin!');
    }
  }

  onCardClick(card: MemoryCard, event: MouseEvent): void {
    this.onUserInteract();

    // Disallow if already checking, peeking, or already flipped/matched
    if (this.isChecking() || this.isPeeking() || card.isFlipped || card.isMatched) {
      return;
    }

    // Capture coordinates synchronously before entering any setTimeout!
    const targetElem = event.currentTarget as HTMLElement | null;
    const btnRect = targetElem ? targetElem.getBoundingClientRect() : null;
    const clickX = btnRect ? btnRect.left + btnRect.width / 2 : (event.clientX || window.innerWidth / 2);
    const clickY = btnRect ? btnRect.top + btnRect.height / 2 : (event.clientY || window.innerHeight / 2);

    // Flip this card
    this.sound.playPop();
    this.cards.update(list => list.map(c => c.id === card.id ? { ...c, isFlipped: true, isMismatch: false } : c));

    const currentFirst = this.firstCard();

    // Case 1: First card of the pair
    if (!currentFirst) {
      this.firstCard.set(card);
      this.speech.speak(card.name);
      return;
    }

    // Case 2: Second card of the pair
    this.isChecking.set(true);
    const first = currentFirst;
    const second = card;

    if (first.pairKey === second.pairKey) {
      // 🎉 MATCH!
      setTimeout(() => {
        try {
          this.sound.playSnap();
          this.sound.playSuccess();

          this.triggerStarBurst(clickX, clickY);

          this.cards.update(list => list.map(c => {
            if (c.id === first.id || c.id === second.id) {
              return { ...c, isMatched: true, isFlipped: true };
            }
            return c;
          }));

          this.matchedPairsCount.update(count => count + 1);
          this.firstCard.set(null);
          this.isChecking.set(false);

          this.speech.speak(`Awesome! ${first.name} matched!`);

          // Check if level complete
          if (this.isAllMatched()) {
            setTimeout(() => {
              this.sound.playFanfare();
              this.confetti.fire();
              this.speech.speak('Hooray! You found every matching friend!');
            }, 450);
          } else {
            this.scheduleDemoHand();
          }
        } catch (err) {
          console.error('Match completion error:', err);
          this.isChecking.set(false);
          this.firstCard.set(null);
        }
      }, 350);

    } else {
      // ❌ MISMATCH: Shake and gently flip back
      this.speech.speak(second.name);

      setTimeout(() => {
        try {
          this.sound.playBoing();

          // Mark mismatch for shake animation
          this.cards.update(list => list.map(c => {
            if (c.id === first.id || c.id === second.id) {
              return { ...c, isMismatch: true };
            }
            return c;
          }));

          // Flip back after 900ms
          setTimeout(() => {
            this.cards.update(list => list.map(c => {
              if (c.id === first.id || c.id === second.id) {
                return { ...c, isFlipped: false, isMismatch: false };
              }
              return c;
            }));
            this.firstCard.set(null);
            this.isChecking.set(false);
            this.scheduleDemoHand();
          }, 900);
        } catch (err) {
          console.error('Mismatch recovery error:', err);
          this.isChecking.set(false);
          this.firstCard.set(null);
        }
      }, 400);
    }
  }

  triggerStarBurst(x: number, y: number): void {
    const starId = this.starCounter++;
    this.activeStars.push({ id: starId, x, y });
    setTimeout(() => {
      this.activeStars = this.activeStars.filter(s => s.id !== starId);
    }, 700);
  }

  nextRound(): void {
    this.sound.playTap();
    const curr = this.targetPairs();
    if (curr === 2) {
      this.startRound(3); // 6 cards
    } else if (curr === 3) {
      this.startRound(4); // 8 cards
    } else {
      this.startRound(2); // Loop
    }
  }
}

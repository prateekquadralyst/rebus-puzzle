import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameStateService } from '../../core/services/game-state.service';
import { SoundService } from '../../core/services/sound.service';

@Component({
  selector: 'app-win-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (game.isSolved()) {
      <div class="modal-overlay">
        <div class="win-card glass-panel animate-pop">
          <!-- Victory Badge Icon -->
          <div class="trophy-badge">
            <span class="badge-emoji">🎉</span>
          </div>

          <h2 class="win-title">BRILLIANT!</h2>
          <span class="win-subtitle">Puzzle Solved</span>

          <!-- Stars Rating -->
          <div class="stars-row">
            @for (star of stars(); track $index) {
              <span class="star-icon">⭐</span>
            }
            @for (emptyStar of emptyStars(); track $index) {
              <span class="star-empty">☆</span>
            }
          </div>

          <!-- Answer & Rebus Equation Box -->
          <div class="answer-banner">
            <span class="banner-hint">THE ANSWER IS:</span>
            <div class="banner-word">{{ game.currentPuzzle().answer }}</div>
            <div class="banner-equation">{{ game.currentPuzzle().explanation }}</div>
          </div>

          <!-- Earnings Summary -->
          <div class="earnings-grid">
            <div class="earning-item">
              <span class="earning-label">Score Earned</span>
              <span class="earning-val">+{{ earnedScore() }} pts</span>
            </div>
            <div class="earning-item">
              <span class="earning-label">Coins Earned</span>
              <span class="earning-val val-coins">+{{ earnedCoins() }} 🪙</span>
            </div>
          </div>

          <!-- Streak Multiplier Notice -->
          @if (game.streak() > 1) {
            <div class="streak-banner">
              <span>🔥</span>
              <span>{{ game.streak() }}X Streak Multiplier Active!</span>
            </div>
          }

          <!-- Next Puzzle Button -->
          <button 
            type="button"
            (click)="onNext()"
            class="next-puzzle-btn">
            <span>Next Puzzle</span>
            <span class="btn-arrow">➡️</span>
          </button>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(3, 7, 18, 0.85);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      z-index: 9999;
    }

    .win-card {
      width: 100%;
      max-width: 440px;
      padding: 28px 24px;
      border-radius: 24px;
      background: #0d1424;
      border: 1px solid rgba(16, 185, 129, 0.35);
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(16, 185, 129, 0.2);
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .trophy-badge {
      width: 64px;
      height: 64px;
      border-radius: 20px;
      background: linear-gradient(135deg, #10b981, #059669);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
      box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
    }
    .badge-emoji {
      font-size: 32px;
    }

    .win-title {
      font-size: 1.5rem;
      font-weight: 900;
      color: white;
      font-family: var(--font-display);
      letter-spacing: -0.01em;
      line-height: 1.1;
    }
    .win-subtitle {
      font-size: 0.72rem;
      font-weight: 800;
      color: #34d399;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-top: 4px;
    }

    .stars-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      margin: 12px 0;
    }
    .star-icon {
      font-size: 26px;
      filter: drop-shadow(0 2px 6px rgba(245, 158, 11, 0.4));
    }
    .star-empty {
      font-size: 26px;
      color: #334155;
    }

    .answer-banner {
      width: 100%;
      padding: 14px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      margin: 10px 0 14px 0;
    }
    .banner-hint {
      font-size: 0.68rem;
      font-weight: 600;
      color: #94a3b8;
      display: block;
      margin-bottom: 4px;
    }
    .banner-word {
      font-size: 1.6rem;
      font-weight: 900;
      color: #6ee7b7;
      font-family: var(--font-display);
      letter-spacing: 0.08em;
      line-height: 1.1;
    }
    .banner-equation {
      font-size: 0.85rem;
      font-weight: 700;
      color: #c4b5fd;
      margin-top: 8px;
    }

    .earnings-grid {
      display: flex;
      width: 100%;
      gap: 10px;
      margin-bottom: 12px;
    }
    .earning-item {
      flex: 1;
      padding: 10px;
      border-radius: 12px;
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.06);
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .earning-label {
      font-size: 0.68rem;
      color: #94a3b8;
    }
    .earning-val {
      font-size: 1rem;
      font-weight: 800;
      color: white;
    }
    .val-coins {
      color: #fde047;
    }

    .streak-banner {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 14px;
      border-radius: 20px;
      background: rgba(245, 158, 11, 0.12);
      border: 1px solid rgba(245, 158, 11, 0.25);
      color: #fbbf24;
      font-size: 0.74rem;
      font-weight: 700;
      margin-bottom: 16px;
    }

    .next-puzzle-btn {
      width: 100%;
      padding: 14px;
      border-radius: 16px;
      background: linear-gradient(135deg, #10b981, #059669);
      border: none;
      color: white;
      font-family: var(--font-body);
      font-size: 0.9rem;
      font-weight: 800;
      letter-spacing: 0.02em;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
      transition: all 0.2s;
    }
    .next-puzzle-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 28px rgba(16, 185, 129, 0.5);
    }
    .btn-arrow {
      font-size: 16px;
    }
  `]
})
export class WinModalComponent {
  readonly starsCount = computed(() => {
    const hints = this.game.hintsUsedThisLevel();
    if (hints === 0) return 3;
    if (hints <= 2) return 2;
    return 1;
  });

  readonly stars = computed(() => new Array(this.starsCount()).fill(0));
  readonly emptyStars = computed(() => new Array(3 - this.starsCount()).fill(0));

  readonly earnedScore = computed(() => {
    const base = this.game.currentPuzzle().points;
    const mult = this.game.hintsUsedThisLevel() === 0 ? 1.5 : 1.0;
    return Math.round(base * mult);
  });

  readonly earnedCoins = computed(() => {
    return this.game.hintsUsedThisLevel() === 0 ? 35 : 20;
  });

  constructor(
    public game: GameStateService,
    private sound: SoundService
  ) {}

  onNext(): void {
    this.sound.playTap();
    this.game.nextLevel();
  }
}

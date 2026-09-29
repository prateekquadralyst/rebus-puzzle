import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameStateService } from '../../core/services/game-state.service';
import { SoundService } from '../../core/services/sound.service';

@Component({
  selector: 'app-hint-dock',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dock-wrapper">
      <div class="dock-bar glass-panel">
        <!-- Hint 1: Reveal Letter -->
        <button 
          type="button"
          (click)="onRevealLetter()"
          [disabled]="game.isSolved() || game.coins() < 25"
          class="hint-btn btn-reveal"
          title="Reveal 1 correct letter in true slot">
          <div class="hint-icon-box icon-reveal">
            <span>💡</span>
          </div>
          <div class="hint-meta">
            <span class="hint-name">Reveal</span>
            <span class="hint-price price-reveal">25 🪙</span>
          </div>
        </button>

        <!-- Hint 2: Bomb Distractors -->
        <button 
          type="button"
          (click)="onBombLetters()"
          [disabled]="game.isSolved() || game.coins() < 35"
          class="hint-btn btn-bomb"
          title="Remove 3 wrong distractors from the bank">
          <div class="hint-icon-box icon-bomb">
            <span>💣</span>
          </div>
          <div class="hint-meta">
            <span class="hint-name">Bomb</span>
            <span class="hint-price price-bomb">35 🪙</span>
          </div>
        </button>

        <!-- Hint 3: Clue Riddle -->
        <button 
          type="button"
          (click)="onClueRiddle()"
          [disabled]="game.isSolved() || (!game.showClueDrawer() && game.coins() < 15)"
          class="hint-btn btn-clue"
          title="View riddle hint">
          <div class="hint-icon-box icon-clue">
            <span>📖</span>
          </div>
          <div class="hint-meta">
            <span class="hint-name">Clue</span>
            <span class="hint-price price-clue">
              {{ game.showClueDrawer() ? 'Open' : '15 🪙' }}
            </span>
          </div>
        </button>

        <!-- Hint 4: Skip Level -->
        <button 
          type="button"
          (click)="onSkipLevel()"
          [disabled]="game.isSolved() || game.coins() < 50"
          class="hint-btn btn-skip"
          title="Skip to next puzzle">
          <div class="hint-icon-box icon-skip">
            <span>⏩</span>
          </div>
          <div class="hint-meta">
            <span class="hint-name">Skip</span>
            <span class="hint-price price-skip">50 🪙</span>
          </div>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .dock-wrapper {
      width: 100%;
      max-width: 620px;
      margin: 20px auto 24px auto;
      padding: 0 16px;
    }

    .dock-bar {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-around;
      gap: 8px;
      padding: 10px 16px;
      border-radius: 22px;
      background: rgba(13, 19, 34, 0.82);
      border: 1px solid rgba(255, 255, 255, 0.12);
      box-shadow: 
        0 18px 40px -10px rgba(0, 0, 0, 0.7),
        inset 0 1px 1px rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
    }

    .hint-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 12px;
      border-radius: 14px;
      background: transparent;
      border: 1px solid transparent;
      outline: none;
      cursor: pointer;
      transition: all 0.22s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .hint-btn:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.08);
      transform: translateY(-3px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.35);
    }
    .hint-btn:active:not(:disabled) {
      transform: scale(0.95);
    }
    .hint-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .hint-icon-box {
      width: 34px;
      height: 34px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      flex-shrink: 0;
    }
    .icon-reveal {
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.3);
    }
    .icon-bomb {
      background: rgba(244, 63, 94, 0.15);
      border: 1px solid rgba(244, 63, 94, 0.3);
    }
    .icon-clue {
      background: rgba(99, 102, 241, 0.15);
      border: 1px solid rgba(99, 102, 241, 0.3);
    }
    .icon-skip {
      background: rgba(6, 182, 212, 0.15);
      border: 1px solid rgba(6, 182, 212, 0.3);
    }

    .hint-meta {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      line-height: 1.15;
    }

    .hint-name {
      font-size: 0.74rem;
      font-weight: 700;
      color: #f1f5f9;
      letter-spacing: 0.02em;
    }

    .hint-price {
      font-size: 0.68rem;
      font-weight: 800;
    }
    .price-reveal { color: #f59e0b; }
    .price-bomb { color: #f43f5e; }
    .price-clue { color: #818cf8; }
    .price-skip { color: #22d3ee; }

    @media (max-width: 500px) {
      .hint-btn {
        padding: 5px 6px;
        gap: 6px;
      }
      .hint-icon-box {
        width: 28px;
        height: 28px;
        font-size: 13px;
      }
      .hint-name {
        font-size: 0.68rem;
      }
      .hint-price {
        font-size: 0.62rem;
      }
    }
  `]
})
export class HintDockComponent {
  constructor(
    public game: GameStateService,
    private sound: SoundService
  ) {}

  onRevealLetter(): void {
    const success = this.game.revealOneLetter();
    if (!success) {
      this.sound.playError();
      alert('Cannot reveal: Either not enough coins (25 needed) or all letters are already correct!');
    }
  }

  onBombLetters(): void {
    const success = this.game.bombUnusedLetters();
    if (!success) {
      this.sound.playError();
      alert('Cannot use bomb: Either not enough coins (35 needed) or no more distractors left!');
    }
  }

  onClueRiddle(): void {
    const success = this.game.showTextClue();
    if (!success) {
      this.sound.playError();
      alert('Not enough coins! You need 15 coins to view this clue.');
    }
  }

  onSkipLevel(): void {
    if (confirm('Skip to the next level for 50 coins?')) {
      const success = this.game.skipLevel();
      if (!success) {
        this.sound.playError();
        alert('Not enough coins! You need 50 coins to skip this level.');
      }
    }
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameStateService } from '../../core/services/game-state.service';
import { SoundService } from '../../core/services/sound.service';

@Component({
  selector: 'app-letter-bank',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bank-section">
      <!-- Letter Grid Keyboard -->
      <div class="bank-rack">
        @for (letter of game.letterBank(); track letter.id) {
          @if (!letter.isEliminated) {
            <button
              type="button"
              (click)="onLetterClick(letter.id)"
              [disabled]="letter.isUsed || game.isSolved()"
              class="tile-btn"
              [ngClass]="{
                'tile-used': letter.isUsed,
                'tile-ready': !letter.isUsed
              }">
              <span class="tile-char">{{ letter.char }}</span>
            </button>
          } @else {
            <div class="tile-eliminated">
              <span class="elim-cross">✕</span>
            </div>
          }
        }
      </div>

      <!-- Quick Action: Shuffle Bank -->
      <div class="bank-footer">
        <button 
          type="button"
          (click)="shuffleBank()" 
          [disabled]="game.isSolved()"
          class="shuffle-action-btn">
          <span class="shuffle-icon">🔀</span>
          <span>Shuffle Bank</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .bank-section {
      width: 100%;
      max-width: 620px;
      margin: 14px auto 0 auto;
      padding: 0 10px;
    }

    .bank-rack {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      gap: clamp(5px, 1.6vw, 8px);
      flex-wrap: wrap;
    }

    .tile-btn {
      width: clamp(38px, 10.5vw, 48px);
      height: clamp(44px, 12vw, 52px);
      border-radius: clamp(9px, 2.5vw, 13px);
      border: 1px solid rgba(255, 255, 255, 0.14);
      outline: none;
      font-family: var(--font-display);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      position: relative;
      transition: all 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .tile-char {
      font-size: clamp(1.2rem, 4.2vw, 1.45rem);
      font-weight: 900;
      color: #ffffff;
      text-transform: uppercase;
      line-height: 1;
    }

    /* Ready / Available State */
    .tile-ready {
      background: linear-gradient(180deg, #1e293b, #0c1322);
      border-color: rgba(255, 255, 255, 0.16);
      box-shadow: 
        0 5px 0 #020617, 
        0 10px 20px rgba(0, 0, 0, 0.5),
        inset 0 1px 1px rgba(255, 255, 255, 0.25);
      transform: translateY(0);
    }
    .tile-ready:hover {
      background: linear-gradient(180deg, #334155, #1e293b);
      border-color: rgba(167, 139, 250, 0.6);
      transform: translateY(-3px);
      box-shadow: 
        0 8px 0 #020617, 
        0 14px 24px rgba(139, 92, 246, 0.35),
        inset 0 1px 1px rgba(255, 255, 255, 0.35);
    }
    .tile-ready:active {
      transform: translateY(4px);
      box-shadow: 
        0 1px 0 #020617,
        0 3px 6px rgba(0, 0, 0, 0.4);
    }

    /* Used State */
    .tile-used {
      background: rgba(255, 255, 255, 0.02);
      border-color: rgba(255, 255, 255, 0.04);
      box-shadow: none;
      opacity: 0.15;
      cursor: not-allowed;
      transform: scale(0.92);
    }

    /* Eliminated by Bomb State */
    .tile-eliminated {
      width: 48px;
      height: 52px;
      border-radius: 12px;
      border: 1px dashed rgba(244, 63, 94, 0.25);
      background: rgba(244, 63, 94, 0.04);
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .elim-cross {
      font-size: 12px;
      color: rgba(244, 63, 94, 0.5);
    }

    .bank-footer {
      display: flex;
      justify-content: center;
      margin-top: 12px;
    }

    .shuffle-action-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 14px;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.09);
      color: #94a3b8;
      font-size: 0.72rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .shuffle-action-btn:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
      transform: translateY(-1px);
    }
    .shuffle-action-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
    .shuffle-icon {
      font-size: 12px;
    }

    @media (max-width: 480px) {
      .tile-btn, .tile-eliminated {
        width: 40px;
        height: 46px;
        border-radius: 10px;
      }
      .tile-char {
        font-size: 1.25rem;
      }
    }
  `]
})
export class LetterBankComponent {
  constructor(
    public game: GameStateService,
    private sound: SoundService
  ) {}

  onLetterClick(bankId: number): void {
    this.game.selectBankLetter(bankId);
  }

  shuffleBank(): void {
    this.sound.playTap();
    const bank = [...this.game.letterBank()];
    const unusedIndices: number[] = [];
    const unusedChars: string[] = [];

    bank.forEach((b, idx) => {
      if (!b.isUsed && !b.isEliminated) {
        unusedIndices.push(idx);
        unusedChars.push(b.char);
      }
    });

    for (let i = unusedChars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [unusedChars[i], unusedChars[j]] = [unusedChars[j], unusedChars[i]];
    }

    unusedIndices.forEach((bankIdx, i) => {
      bank[bankIdx].char = unusedChars[i];
    });

    this.game.letterBank.set(bank);
  }
}

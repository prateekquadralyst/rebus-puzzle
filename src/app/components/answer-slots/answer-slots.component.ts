import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameStateService } from '../../core/services/game-state.service';

@Component({
  selector: 'app-answer-slots',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="slots-section">
      <!-- Kid-Friendly Guidance Prompt -->
      <div class="slots-prompt-bar">
        <span class="prompt-text">
          @if (!hasFilledLetters() && !game.isSolved()) {
            👇 Tap letter buttons below to spell the word!
          } @else if (!game.isSolved()) {
            Tap any box to remove a letter ⌫
          } @else {
            🎉 Fantastic Job! Solved!
          }
        </span>
      </div>

      <!-- Target Answer Boxes -->
      <div 
        class="slots-rack"
        [class.animate-shake]="game.isError()">
        
        @for (slot of game.answerSlots(); track slot.index) {
          <button 
            type="button"
            (click)="onSlotClick(slot.index)"
            [disabled]="game.isSolved() || slot.isRevealed || slot.char === null"
            class="slot-cell"
            [ngClass]="{
              'slot-empty': slot.char === null,
              'slot-filled': slot.char !== null && !slot.isRevealed,
              'slot-revealed': slot.isRevealed,
              'slot-solved': game.isSolved(),
              'slot-wrong': game.isError()
            }">
            
            <span class="slot-char">{{ slot.char || '' }}</span>

            @if (slot.isRevealed && !game.isSolved()) {
              <span class="lock-indicator" title="Revealed by Hint">🔒</span>
            }

            @if (game.isSolved()) {
              <span class="check-indicator">✓</span>
            }
          </button>
        }
      </div>

      <!-- Helper: Clear Button -->
      <div class="slots-actions">
        @if (hasFilledLetters() && !game.isSolved()) {
          <button 
            type="button"
            (click)="game.clearNonRevealedSlots()" 
            class="clear-word-btn">
            <span>⌫ Clear Word</span>
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    .slots-section {
      width: 100%;
      max-width: 680px;
      margin: 12px auto 0 auto;
      padding: 0 12px;
    }

    .slots-prompt-bar {
      text-align: center;
      margin-bottom: 8px;
    }
    .prompt-text {
      font-size: 0.72rem;
      font-weight: 700;
      color: #94a3b8;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      padding: 3px 12px;
      border-radius: 20px;
      display: inline-block;
    }

    .slots-rack {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      gap: clamp(4px, 1.4vw, 8px);
      flex-wrap: wrap;
    }

    .slot-cell {
      width: clamp(32px, 8.8vw, 48px);
      height: clamp(40px, 11vw, 54px);
      border-radius: clamp(8px, 2.4vw, 14px);
      border: 2px solid transparent;
      outline: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-display);
      cursor: pointer;
      position: relative;
      transition: all 0.18s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .slot-char {
      font-size: clamp(1.2rem, 4vw, 1.6rem);
      font-weight: 900;
      text-transform: uppercase;
      line-height: 1;
    }

    /* Empty state */
    .slot-empty {
      background: rgba(255, 255, 255, 0.03);
      border-color: rgba(255, 255, 255, 0.18);
      border-style: dashed;
      box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.4);
      cursor: default;
    }

    /* Filled state */
    .slot-filled {
      background: linear-gradient(180deg, #2563eb, #1e40af);
      border-color: #93c5fd;
      color: #ffffff;
      box-shadow: 
        0 8px 22px rgba(37, 99, 235, 0.45),
        inset 0 1px 1px rgba(255, 255, 255, 0.45),
        inset 0 -2px 0 rgba(0, 0, 0, 0.3);
      animation: popIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
    }
    .slot-filled:hover {
      transform: translateY(-3px);
      box-shadow: 
        0 12px 28px rgba(37, 99, 235, 0.55),
        inset 0 1px 1px rgba(255, 255, 255, 0.5);
    }
    .slot-filled:active {
      transform: scale(0.96);
    }

    /* Revealed hint state */
    .slot-revealed {
      background: linear-gradient(180deg, #f59e0b, #b45309);
      border-color: #fde68a;
      color: #fffbeb;
      box-shadow: 
        0 8px 22px rgba(245, 158, 11, 0.45),
        inset 0 1px 1px rgba(255, 255, 255, 0.5),
        inset 0 -2px 0 rgba(0, 0, 0, 0.3);
      cursor: default;
    }
    .lock-indicator {
      position: absolute;
      top: -7px;
      right: -7px;
      font-size: 11px;
      background: #78350f;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1.5px solid #fbbf24;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
    }

    /* Solved state */
    .slot-solved {
      background: linear-gradient(180deg, #10b981, #059669);
      border-color: #34d399;
      color: #ffffff;
      box-shadow: 0 0 24px rgba(16, 185, 129, 0.6);
      transform: scale(1.05);
      cursor: default;
    }
    .check-indicator {
      position: absolute;
      bottom: -6px;
      right: -6px;
      font-size: 10px;
      font-weight: 900;
      background: #064e3b;
      color: #34d399;
      border-radius: 50%;
      width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #34d399;
    }

    /* Wrong answer state */
    .slot-wrong {
      background: linear-gradient(180deg, #ef4444, #b91c1c) !important;
      border-color: #f87171 !important;
      color: #ffffff !important;
      box-shadow: 0 0 20px rgba(239, 68, 68, 0.5) !important;
    }

    .slots-actions {
      display: flex;
      justify-content: center;
      margin-top: 10px;
      min-height: 28px;
    }

    .clear-word-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 14px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #94a3b8;
      font-size: 0.72rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .clear-word-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
    }

    @media (max-width: 480px) {
      .slot-cell {
        width: 40px;
        height: 48px;
        border-radius: 10px;
      }
      .slot-char {
        font-size: 1.35rem;
      }
    }
  `]
})
export class AnswerSlotsComponent {
  constructor(public game: GameStateService) {}

  onSlotClick(index: number): void {
    this.game.removeSlotLetter(index);
  }

  hasFilledLetters(): boolean {
    return this.game.answerSlots().some(s => s.char !== null && !s.isRevealed);
  }
}

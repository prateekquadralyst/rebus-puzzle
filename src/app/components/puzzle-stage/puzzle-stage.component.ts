import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameStateService } from '../../core/services/game-state.service';
import { SoundService } from '../../core/services/sound.service';

@Component({
  selector: 'app-puzzle-stage',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stage-wrapper">
      <!-- Top Level Bar: Prev | Category | Next -->
      <div class="stage-nav">
        <button 
          type="button"
          (click)="game.prevLevel()" 
          [disabled]="!game.hasPrevLevel()"
          class="nav-arrow-btn"
          title="Previous Puzzle">
          ◀
        </button>

        <div class="category-pill">
          <span class="category-icon">🏷️</span>
          <span class="category-text">{{ game.currentPuzzle().category }}</span>
        </div>

        <button 
          type="button"
          (click)="onNextClick()" 
          [disabled]="!game.canGoNextLevel()"
          class="nav-arrow-btn"
          [class.nav-locked]="!game.canGoNextLevel()"
          [title]="game.canGoNextLevel() ? 'Next Puzzle' : 'Solve this level first to unlock next puzzle!'">
          @if (!game.canGoNextLevel() && game.currentLevelIndex() < game.totalLevelsInMode() - 1) {
            🔒
          } @else {
            ▶
          }
        </button>
      </div>

      <!-- Main Rebus Visual Equation Stage -->
      <div class="stage-card glass-panel">
        <!-- Ambient Color Radial -->
        <div class="ambient-light" [ngClass]="'light-' + game.currentDifficulty()"></div>

        <!-- Clue Equation Row (Adaptive sizing for 2, 3, or 4 clue cards) -->
        <div 
          class="equation-row"
          [ngClass]="'cards-' + game.currentPuzzle().images.length">
          
          @for (img of game.currentPuzzle().images; track $index; let last = $last) {
            <!-- Individual Clue Tile -->
            <div class="clue-box">
              <div class="clue-box-inner">
                <span class="clue-emoji">{{ img.emoji || '🖼️' }}</span>
                @if (game.currentDifficulty() === 'easy') {
                  <span class="clue-label">{{ img.label }}</span>
                } @else if (game.currentDifficulty() === 'medium') {
                  <span class="clue-label medium-label">?</span>
                }
              </div>
            </div>

            <!-- Mathematical Operator (+ or =) -->
            @if (!last) {
              <div class="op-symbol op-plus">+</div>
            } @else {
              <div class="op-symbol op-equal">=</div>
              <!-- Mystery Question Tile -->
              <div class="mystery-box">
                <span class="mystery-mark">?</span>
              </div>
            }
          }
        </div>

        <!-- Clue Riddle Accordion -->
        <div class="clue-footer">
          @if (!game.showClueDrawer()) {
            <button 
              type="button"
              (click)="triggerClue()" 
              class="clue-riddle-btn">
              <span>💡 Need a riddle clue?</span>
              <span class="cost-badge">-15 🪙</span>
            </button>
          } @else {
            <div class="riddle-quote-box animate-pop">
              <p class="riddle-text">
                "{{ game.currentPuzzle().hintText }}"
              </p>
              <button 
                type="button" 
                (click)="game.speechService.speakClue(game.currentPuzzle().hintText)"
                class="speak-clue-btn"
                title="Listen to riddle aloud">
                <span>🔊 Listen</span>
              </button>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stage-wrapper {
      width: 100%;
      max-width: 720px;
      margin: 0 auto;
      padding: 0 16px;
    }

    .stage-nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 12px;
    }

    .nav-arrow-btn {
      width: 34px;
      height: 34px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #94a3b8;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .nav-arrow-btn:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.12);
      color: white;
      transform: scale(1.06);
    }
    .nav-arrow-btn:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }

    .nav-locked {
      background: rgba(239, 68, 68, 0.12) !important;
      border-color: rgba(239, 68, 68, 0.3) !important;
      color: #f87171 !important;
      font-size: 13px !important;
      cursor: not-allowed !important;
    }

    .medium-label {
      color: #f59e0b !important;
      font-weight: 900 !important;
      font-size: 0.72rem !important;
      padding: 1px 8px !important;
    }

    .category-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      padding: 5px 14px;
      border-radius: 20px;
      backdrop-filter: blur(8px);
    }
    .category-icon {
      font-size: 13px;
    }
    .category-text {
      font-size: 0.76rem;
      font-weight: 700;
      color: #cbd5e1;
      letter-spacing: 0.03em;
    }

    .stage-card {
      padding: 22px 16px;
      border-radius: var(--radius-lg);
      position: relative;
      overflow: hidden;
      min-height: 210px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .ambient-light {
      position: absolute;
      top: -30px;
      left: 50%;
      transform: translateX(-50%);
      width: 280px;
      height: 140px;
      border-radius: 50%;
      filter: blur(60px);
      pointer-events: none;
      opacity: 0.2;
    }
    .light-easy { background: #10b981; }
    .light-medium { background: #f59e0b; }
    .light-hard { background: #ef4444; }

    /* The Clue Cards Row */
    .equation-row {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      gap: 10px;
      position: relative;
      z-index: 5;
      width: 100%;
      flex-wrap: wrap;
    }

    /* Standard Card (2 Clues) */
    .clue-box {
      width: clamp(76px, 20vw, 104px);
      height: clamp(86px, 23vw, 114px);
      border-radius: clamp(12px, 3vw, 18px);
      background: linear-gradient(145deg, rgba(255, 255, 255, 0.09), rgba(255, 255, 255, 0.02));
      border: 1px solid rgba(255, 255, 255, 0.15);
      box-shadow: 0 14px 30px -6px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.15);
      transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }
    .clue-box::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 45%;
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.14) 0%, transparent 100%);
      pointer-events: none;
    }
    .clue-box:hover {
      transform: translateY(-5px) scale(1.03);
      border-color: rgba(139, 92, 246, 0.6);
      box-shadow: 0 18px 36px -6px rgba(139, 92, 246, 0.35);
    }

    .clue-box-inner {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 5px;
      padding: 6px;
      width: 100%;
      position: relative;
      z-index: 2;
    }

    .clue-emoji {
      font-size: clamp(2rem, 6.2vw, 2.7rem);
      line-height: 1;
      filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.45));
      animation: floatGentle 3.5s ease-in-out infinite;
    }

    .clue-label {
      font-size: 0.7rem;
      font-weight: 800;
      color: #e2e8f0;
      letter-spacing: 0.05em;
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.08);
      padding: 2px 7px;
      border-radius: 6px;
      max-width: 90%;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }

    .op-symbol {
      font-size: 1.6rem;
      font-weight: 900;
      color: #94a3b8;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0 2px;
      line-height: 1;
      filter: drop-shadow(0 2px 8px rgba(255, 255, 255, 0.1));
    }
    .op-equal {
      color: #a78bfa;
      text-shadow: 0 0 12px rgba(167, 139, 250, 0.5);
    }

    .mystery-box {
      width: 86px;
      height: 114px;
      border-radius: 18px;
      background: rgba(139, 92, 246, 0.09);
      border: 2px dashed rgba(139, 92, 246, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 26px -4px rgba(139, 92, 246, 0.25);
      position: relative;
    }
    .mystery-mark {
      font-size: 2.3rem;
      font-weight: 900;
      color: #c084fc;
      text-shadow: 0 0 18px rgba(192, 132, 252, 0.6);
      animation: pulseGlow 2s ease-in-out infinite;
    }

    /* Adaptive Layout for 3 Clues */
    .cards-3 {
      gap: 8px;
    }
    .cards-3 .clue-box {
      width: 88px;
      height: 102px;
    }
    .cards-3 .clue-emoji {
      font-size: 2.2rem;
    }
    .cards-3 .clue-label {
      font-size: 0.65rem;
    }
    .cards-3 .mystery-box {
      width: 74px;
      height: 102px;
    }
    .cards-3 .op-symbol {
      font-size: 1.3rem;
    }

    /* Adaptive Layout for 4 Clues */
    .cards-4 {
      gap: 6px;
    }
    .cards-4 .clue-box {
      width: 76px;
      height: 92px;
      border-radius: 14px;
    }
    .cards-4 .clue-emoji {
      font-size: 1.9rem;
    }
    .cards-4 .clue-label {
      font-size: 0.6rem;
      padding: 1px 5px;
    }
    .cards-4 .mystery-box {
      width: 65px;
      height: 92px;
      border-radius: 14px;
    }
    .cards-4 .mystery-mark {
      font-size: 1.7rem;
    }
    .cards-4 .op-symbol {
      font-size: 1.1rem;
    }

    /* Clue Footer */
    .clue-footer {
      margin-top: 16px;
      width: 100%;
      display: flex;
      justify-content: center;
      position: relative;
      z-index: 5;
    }

    .clue-riddle-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 16px;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #c7d2fe;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      outline: none;
    }
    .clue-riddle-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
      transform: translateY(-1px);
    }

    .cost-badge {
      font-size: 0.65rem;
      font-weight: 800;
      background: rgba(99, 102, 241, 0.35);
      color: #e0e7ff;
      padding: 2px 6px;
      border-radius: 6px;
    }

    .riddle-quote-box {
      width: 100%;
      max-width: 520px;
      padding: 12px 18px;
      border-radius: 14px;
      background: rgba(88, 28, 135, 0.25);
      border: 1px solid rgba(168, 85, 247, 0.3);
      text-align: center;
    }
    .riddle-text {
      font-size: 0.8rem;
      color: #e9d5ff;
      font-weight: 500;
      font-style: italic;
      line-height: 1.4;
    }

    .speak-clue-btn {
      margin-top: 8px;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 12px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #c4b5fd;
      font-size: 0.68rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }
    .speak-clue-btn:hover {
      background: rgba(255, 255, 255, 0.16);
      color: white;
    }

    @media (max-width: 500px) {
      .stage-card {
        padding: 16px 10px;
        min-height: 180px;
      }
      .clue-box {
        width: clamp(66px, 19vw, 84px);
        height: clamp(80px, 23vw, 96px);
      }
      .clue-emoji {
        font-size: clamp(1.8rem, 5.5vw, 2.2rem);
      }
      .clue-label {
        font-size: 0.62rem;
      }
      .mystery-box {
        width: clamp(56px, 16vw, 72px);
        height: clamp(80px, 23vw, 96px);
      }
      .mystery-mark {
        font-size: clamp(1.4rem, 4.5vw, 1.8rem);
      }
      .op-symbol {
        font-size: clamp(0.95rem, 3vw, 1.2rem);
      }

      /* When 3 cards on mobile */
      .cards-3 {
        gap: 5px;
      }
      .cards-3 .clue-box {
        width: clamp(56px, 16.5vw, 74px);
        height: clamp(70px, 20vw, 86px);
      }
      .cards-3 .clue-emoji {
        font-size: clamp(1.5rem, 4.5vw, 1.8rem);
      }
      .cards-3 .clue-label {
        font-size: 0.58rem;
      }
      .cards-3 .mystery-box {
        width: clamp(48px, 14vw, 62px);
        height: clamp(70px, 20vw, 86px);
      }

      /* When 4 cards on mobile */
      .cards-4 {
        gap: 4px;
      }
      .cards-4 .clue-box {
        width: clamp(46px, 13vw, 60px);
        height: clamp(62px, 17.5vw, 76px);
        border-radius: 10px;
      }
      .cards-4 .clue-emoji {
        font-size: clamp(1.25rem, 3.6vw, 1.55rem);
      }
      .cards-4 .clue-label {
        font-size: 0.5rem;
        padding: 1px 3px;
      }
      .cards-4 .mystery-box {
        width: clamp(40px, 11vw, 52px);
        height: clamp(62px, 17.5vw, 76px);
        border-radius: 10px;
      }
      .cards-4 .mystery-mark {
        font-size: clamp(1.1rem, 3.2vw, 1.35rem);
      }
      .cards-4 .op-symbol {
        font-size: 0.85rem;
      }
    }
  `]
})
export class PuzzleStageComponent {
  constructor(
    public game: GameStateService,
    private sound: SoundService
  ) {}

  triggerClue(): void {
    if (this.game.showClueDrawer()) return;
    const ok = this.game.showTextClue();
    if (!ok) {
      this.sound.playError();
      alert('Not enough coins! You need 15 coins to view this clue.');
    }
  }

  onNextClick(): void {
    if (!this.game.canGoNextLevel()) {
      this.sound.playError();
      alert('🔒 Solve this level first to unlock the next level!');
      return;
    }
    this.game.nextLevel();
  }
}

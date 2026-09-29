import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameStateService } from '../../core/services/game-state.service';
import { SoundService } from '../../core/services/sound.service';

@Component({
  selector: 'app-game-menu-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (game.showMenuModal()) {
      <div class="modal-overlay" (click)="close()">
        <div class="menu-box glass-panel animate-pop" (click)="$event.stopPropagation()">
          <!-- Close Button -->
          <button 
            type="button" 
            (click)="close()" 
            class="modal-close-btn"
            title="Close Menu">
            ✕
          </button>

          <!-- Header -->
          <div class="menu-header">
            <span class="menu-icon">⚙️</span>
            <h2 class="menu-title">Game Options & Modes</h2>
            <p class="menu-sub">Choose a game mode or customize your experience</p>
          </div>

          <!-- Menu Grid of Actions -->
          <div class="menu-grid">
            <!-- 1. How to Play -->
            <button 
              type="button"
              (click)="openGuide()"
              class="menu-item-btn item-guide">
              <span class="item-emoji">❓</span>
              <div class="item-text">
                <span class="item-name">How to Play</span>
                <span class="item-sub">Easy illustrated guide for beginners</span>
              </div>
            </button>

            <!-- 2. Speed Run Blitz -->
            <button 
              type="button"
              (click)="toggleTimer()"
              class="menu-item-btn item-timer"
              [class.active-mode]="game.isTimerMode()">
              <span class="item-emoji">⏱️</span>
              <div class="item-text">
                <span class="item-name">Speed Run (45s)</span>
                <span class="item-sub">{{ game.isTimerMode() ? 'Active (Tap to Disable)' : 'Blitz mode with 3x bonus points' }}</span>
              </div>
            </button>

            <!-- 3. Daily Mystery -->
            <button 
              type="button"
              (click)="startDaily()"
              class="menu-item-btn item-daily">
              <span class="item-emoji">📅</span>
              <div class="item-text">
                <span class="item-name">Daily Mystery</span>
                <span class="item-sub">Today's special puzzle (+100 Coins)</span>
              </div>
            </button>

            <!-- 4. Create Puzzle -->
            <button 
              type="button"
              (click)="openBuilder()"
              class="menu-item-btn item-create">
              <span class="item-emoji">➕</span>
              <div class="item-text">
                <span class="item-name">Create My Own Puzzle</span>
                <span class="item-sub">Build with 2, 3, or 4 emojis</span>
              </div>
            </button>

            <!-- 5. Themes -->
            <button 
              type="button"
              (click)="openThemes()"
              class="menu-item-btn item-theme">
              <span class="item-emoji">🎨</span>
              <div class="item-text">
                <span class="item-name">Theme Customizer</span>
                <span class="item-sub">Cyberpunk, Retro 80s, Emerald</span>
              </div>
            </button>

            <!-- 6. Share Challenge -->
            <button 
              type="button"
              (click)="openShare()"
              class="menu-item-btn item-share">
              <span class="item-emoji">🔗</span>
              <div class="item-text">
                <span class="item-name">Challenge a Friend</span>
                <span class="item-sub">Send on WhatsApp or copy link</span>
              </div>
            </button>

            <!-- 7. Career Stats -->
            <button 
              type="button"
              (click)="openStats()"
              class="menu-item-btn item-stats">
              <span class="item-emoji">🏆</span>
              <div class="item-text">
                <span class="item-name">Career Statistics</span>
                <span class="item-sub">View scores, streaks & badges</span>
              </div>
            </button>
          </div>
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
      z-index: 99999;
    }

    .menu-box {
      width: 100%;
      max-width: 440px;
      max-height: 90vh;
      overflow-y: auto;
      padding: 24px 18px;
      border-radius: 24px;
      background: #0f172a;
      border: 1px solid rgba(255, 255, 255, 0.12);
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.8);
      position: relative;
    }

    .modal-close-btn {
      position: absolute;
      top: 14px;
      right: 14px;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.08);
      border: none;
      color: #94a3b8;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }

    .menu-header {
      text-align: center;
      margin-bottom: 18px;
    }
    .menu-icon {
      font-size: 32px;
      display: block;
      margin-bottom: 4px;
    }
    .menu-title {
      font-size: 1.25rem;
      font-weight: 800;
      color: white;
      font-family: var(--font-display);
    }
    .menu-sub {
      font-size: 0.74rem;
      color: #94a3b8;
      margin-top: 3px;
    }

    .menu-grid {
      display: flex;
      flex-direction: column;
      gap: 9px;
    }

    .menu-item-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 11px 14px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      cursor: pointer;
      text-align: left;
      transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      outline: none;
    }
    .menu-item-btn:hover {
      background: rgba(255, 255, 255, 0.08);
      transform: translateY(-2px);
    }
    .menu-item-btn:active {
      transform: scale(0.97);
    }

    .item-emoji {
      font-size: 22px;
      width: 38px;
      height: 38px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.06);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .item-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
      flex: 1;
    }
    .item-name {
      font-size: 0.84rem;
      font-weight: 800;
      color: white;
    }
    .item-sub {
      font-size: 0.68rem;
      color: #94a3b8;
    }

    .active-mode {
      border-color: #ef4444;
      background: rgba(239, 68, 68, 0.15);
    }
  `]
})
export class GameMenuModalComponent {
  constructor(
    public game: GameStateService,
    private sound: SoundService
  ) {}

  close(): void {
    this.sound.playTap();
    this.game.showMenuModal.set(false);
  }

  openGuide(): void {
    this.sound.playTap();
    this.game.showMenuModal.set(false);
    this.game.showGuideModal.set(true);
  }

  toggleTimer(): void {
    this.game.toggleTimerMode();
    this.game.showMenuModal.set(false);
  }

  startDaily(): void {
    this.game.startDailyChallenge();
    this.game.showMenuModal.set(false);
  }

  openBuilder(): void {
    this.sound.playTap();
    this.game.showMenuModal.set(false);
    this.game.showBuilderModal.set(true);
  }

  openThemes(): void {
    this.sound.playTap();
    this.game.showMenuModal.set(false);
    this.game.showThemeModal.set(true);
  }

  openShare(): void {
    this.sound.playTap();
    this.game.showMenuModal.set(false);
    this.game.shareCurrentPuzzle();
  }

  openStats(): void {
    this.sound.playTap();
    this.game.showMenuModal.set(false);
    this.game.showStatsModal.set(true);
  }
}

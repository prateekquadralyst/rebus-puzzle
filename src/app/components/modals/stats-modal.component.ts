import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameStateService } from '../../core/services/game-state.service';
import { SoundService } from '../../core/services/sound.service';

@Component({
  selector: 'app-stats-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (game.showStatsModal()) {
      <div class="modal-overlay" (click)="close()">
        <div class="modal-box glass-panel animate-pop" (click)="$event.stopPropagation()">
          <!-- Close Button -->
          <button 
            type="button"
            (click)="close()" 
            class="modal-close-btn"
            title="Close">
            ✕
          </button>

          <!-- Header -->
          <div class="modal-header">
            <span class="modal-header-icon">🏆</span>
            <h2 class="modal-title">Career Statistics</h2>
            <p class="modal-subtitle">Your puzzle solving records and milestones</p>
          </div>

          <!-- Main Stat Grid: 2x2 -->
          <div class="stats-2x2-grid">
            <div class="stat-card-item">
              <span class="stat-big-num text-purple">{{ game.score() }}</span>
              <span class="stat-card-title">Total Points</span>
            </div>

            <div class="stat-card-item">
              <span class="stat-big-num text-yellow">{{ game.coins() }} 🪙</span>
              <span class="stat-card-title">Coins Balance</span>
            </div>

            <div class="stat-card-item">
              <span class="stat-big-num text-amber">{{ game.maxStreak() }} 🔥</span>
              <span class="stat-card-title">Best Streak</span>
            </div>

            <div class="stat-card-item">
              <span class="stat-big-num text-emerald">{{ game.completedIds().size }} 🧩</span>
              <span class="stat-card-title">Puzzles Solved</span>
            </div>
          </div>

          <!-- Difficulty Modes Breakdown -->
          <div class="modes-breakdown-section">
            <h3 class="breakdown-title">Modes Completed</h3>
            
            <div class="mode-progress-row row-easy">
              <span class="row-mode-name"><span>🟢</span> Easy Mode</span>
              <span class="row-mode-count">8 Puzzles</span>
            </div>

            <div class="mode-progress-row row-medium">
              <span class="row-mode-name"><span>🟡</span> Medium Mode</span>
              <span class="row-mode-count">8 Puzzles</span>
            </div>

            <div class="mode-progress-row row-hard">
              <span class="row-mode-name"><span>🔴</span> Hard Mode</span>
              <span class="row-mode-count">8 Puzzles</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="modal-actions-col">
            <button 
              type="button"
              (click)="close()" 
              class="primary-btn">
              Close
            </button>

            <button 
              type="button"
              (click)="resetStats()" 
              class="reset-btn">
              Reset Progress Data
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
      background: rgba(3, 7, 18, 0.82);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      z-index: 9999;
    }

    .modal-box {
      width: 100%;
      max-width: 440px;
      padding: 24px;
      border-radius: 24px;
      background: #0f172a;
      border: 1px solid rgba(255, 255, 255, 0.12);
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(139, 92, 246, 0.15);
      position: relative;
    }

    .modal-close-btn {
      position: absolute;
      top: 16px;
      right: 16px;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.06);
      border: none;
      color: #94a3b8;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }
    .modal-close-btn:hover {
      background: rgba(255, 255, 255, 0.14);
      color: white;
    }

    .modal-header {
      text-align: center;
      margin-bottom: 20px;
    }
    .modal-header-icon {
      font-size: 32px;
      display: block;
      margin-bottom: 6px;
    }
    .modal-title {
      font-size: 1.25rem;
      font-weight: 800;
      color: white;
      font-family: var(--font-display);
    }
    .modal-subtitle {
      font-size: 0.74rem;
      color: #94a3b8;
      margin-top: 4px;
    }

    .stats-2x2-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 18px;
    }

    .stat-card-item {
      padding: 14px 10px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      gap: 3px;
    }

    .stat-big-num {
      font-family: var(--font-display);
      font-size: 1.45rem;
      font-weight: 900;
      line-height: 1.1;
    }
    .text-purple { color: #a78bfa; }
    .text-yellow { color: #fde047; }
    .text-amber { color: #f59e0b; }
    .text-emerald { color: #34d399; }

    .stat-card-title {
      font-size: 0.68rem;
      color: #94a3b8;
      font-weight: 500;
    }

    .modes-breakdown-section {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 20px;
    }

    .breakdown-title {
      font-size: 0.72rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #94a3b8;
      margin-bottom: 2px;
    }

    .mode-progress-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 0.76rem;
      font-weight: 700;
    }
    .row-mode-name {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .row-easy {
      background: rgba(16, 185, 129, 0.08);
      border: 1px solid rgba(16, 185, 129, 0.2);
      color: #6ee7b7;
    }
    .row-medium {
      background: rgba(245, 158, 11, 0.08);
      border: 1px solid rgba(245, 158, 11, 0.2);
      color: #fde68a;
    }
    .row-hard {
      background: rgba(239, 68, 68, 0.08);
      border: 1px solid rgba(239, 68, 68, 0.2);
      color: #fca5a5;
    }

    .row-mode-count {
      color: #cbd5e1;
      font-weight: 600;
    }

    .modal-actions-col {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .primary-btn {
      width: 100%;
      padding: 12px;
      border-radius: 14px;
      background: linear-gradient(135deg, #7c3aed, #6366f1);
      border: none;
      color: white;
      font-weight: 800;
      font-size: 0.85rem;
      cursor: pointer;
      box-shadow: 0 8px 20px rgba(124, 58, 237, 0.35);
      transition: all 0.2s;
    }
    .primary-btn:hover {
      transform: translateY(-1px);
    }

    .reset-btn {
      background: transparent;
      border: none;
      color: #f87171;
      font-size: 0.72rem;
      font-weight: 600;
      padding: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .reset-btn:hover {
      color: #ef4444;
      text-decoration: underline;
    }
  `]
})
export class StatsModalComponent {
  constructor(
    public game: GameStateService,
    private sound: SoundService
  ) {}

  close(): void {
    this.sound.playTap();
    this.game.showStatsModal.set(false);
  }

  resetStats(): void {
    if (confirm('Are you sure you want to reset your score, coins, and streak back to defaults?')) {
      localStorage.removeItem('rebus_puzzle_user_v2');
      this.game.score.set(0);
      this.game.coins.set(120);
      this.game.streak.set(0);
      this.game.maxStreak.set(0);
      this.game.completedIds.set(new Set());
      this.game.setLevelIndex(0);
      this.sound.playTap();
      this.close();
    }
  }
}

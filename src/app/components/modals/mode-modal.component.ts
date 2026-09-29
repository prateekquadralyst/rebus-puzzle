import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameStateService } from '../../core/services/game-state.service';
import { Difficulty } from '../../core/models/puzzle.model';
import { SoundService } from '../../core/services/sound.service';

@Component({
  selector: 'app-mode-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (game.showModeModal()) {
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
            <span class="modal-header-icon">🎯</span>
            <h2 class="modal-title">Select Difficulty Mode</h2>
            <p class="modal-subtitle">Pick your challenge level. Progress is saved per mode.</p>
          </div>

          <!-- Cards List -->
          <div class="mode-options-list">
            <!-- EASY -->
            <div 
              (click)="selectMode('easy')"
              class="mode-select-card card-easy"
              [class.card-active]="game.currentDifficulty() === 'easy'">
              <div class="card-left">
                <div class="icon-circle circle-easy">🟢</div>
                <div class="card-info">
                  <div class="card-title-row">
                    <span class="card-name">EASY MODE</span>
                    <span class="badge-pts pts-easy">+100 pts</span>
                  </div>
                  <span class="card-desc">Compound words & clear dual pictures.</span>
                </div>
              </div>
              @if (game.currentDifficulty() === 'easy') {
                <span class="active-badge badge-easy">ACTIVE</span>
              }
            </div>

            <!-- MEDIUM -->
            <div 
              (click)="selectMode('medium')"
              class="mode-select-card card-medium"
              [class.card-active]="game.currentDifficulty() === 'medium'">
              <div class="card-left">
                <div class="icon-circle circle-medium">🟡</div>
                <div class="card-info">
                  <div class="card-title-row">
                    <span class="card-name">MEDIUM MODE</span>
                    <span class="badge-pts pts-medium">+200 pts</span>
                  </div>
                  <span class="card-desc">Clever concepts, associations & 12 letters.</span>
                </div>
              </div>
              @if (game.currentDifficulty() === 'medium') {
                <span class="active-badge badge-medium">ACTIVE</span>
              }
            </div>

            <!-- HARD -->
            <div 
              (click)="selectMode('hard')"
              class="mode-select-card card-hard"
              [class.card-active]="game.currentDifficulty() === 'hard'">
              <div class="card-left">
                <div class="icon-circle circle-hard">🔴</div>
                <div class="card-info">
                  <div class="card-title-row">
                    <span class="card-name">HARD MODE</span>
                    <span class="badge-pts pts-hard">+350 pts</span>
                  </div>
                  <span class="card-desc">Cryptic rebuses, tricky puns & 14 letters.</span>
                </div>
              </div>
              @if (game.currentDifficulty() === 'hard') {
                <span class="active-badge badge-hard">ACTIVE</span>
              }
            </div>
          </div>

          <!-- Footer Button -->
          <div class="modal-footer">
            <button 
              type="button"
              (click)="close()" 
              class="continue-btn">
              Continue Playing
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

    .mode-options-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .mode-select-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 12px 14px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .mode-select-card:hover {
      transform: translateY(-2px);
      background: rgba(255, 255, 255, 0.06);
    }

    .card-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .icon-circle {
      width: 38px;
      height: 38px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
      flex-shrink: 0;
    }
    .circle-easy { background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); }
    .circle-medium { background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.3); }
    .circle-hard { background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); }

    .card-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .card-title-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .card-name {
      font-size: 0.82rem;
      font-weight: 800;
      color: white;
      letter-spacing: 0.03em;
    }
    .card-desc {
      font-size: 0.7rem;
      color: #94a3b8;
    }

    .badge-pts {
      font-size: 0.65rem;
      font-weight: 800;
      padding: 1px 6px;
      border-radius: 6px;
    }
    .pts-easy { background: rgba(16, 185, 129, 0.2); color: #34d399; }
    .pts-medium { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
    .pts-hard { background: rgba(239, 68, 68, 0.2); color: #f87171; }

    .card-active.card-easy {
      border-color: #10b981;
      background: rgba(16, 185, 129, 0.1);
      box-shadow: 0 4px 20px rgba(16, 185, 129, 0.2);
    }
    .card-active.card-medium {
      border-color: #f59e0b;
      background: rgba(245, 158, 11, 0.1);
      box-shadow: 0 4px 20px rgba(245, 158, 11, 0.2);
    }
    .card-active.card-hard {
      border-color: #ef4444;
      background: rgba(239, 68, 68, 0.1);
      box-shadow: 0 4px 20px rgba(239, 68, 68, 0.2);
    }

    .active-badge {
      font-size: 0.68rem;
      font-weight: 800;
      letter-spacing: 0.05em;
    }
    .badge-easy { color: #34d399; }
    .badge-medium { color: #fbbf24; }
    .badge-hard { color: #f87171; }

    .modal-footer {
      margin-top: 20px;
    }
    .continue-btn {
      width: 100%;
      padding: 12px;
      border-radius: 14px;
      background: linear-gradient(135deg, #7c3aed, #6366f1);
      border: none;
      color: white;
      font-weight: 800;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 8px 20px rgba(124, 58, 237, 0.4);
    }
    .continue-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 10px 24px rgba(124, 58, 237, 0.5);
    }
  `]
})
export class ModeModalComponent {
  constructor(
    public game: GameStateService,
    private sound: SoundService
  ) {}

  selectMode(mode: Difficulty): void {
    this.game.setDifficulty(mode);
  }

  close(): void {
    this.sound.playTap();
    this.game.showModeModal.set(false);
  }
}

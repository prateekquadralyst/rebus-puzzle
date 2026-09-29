import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameStateService } from '../../core/services/game-state.service';
import { ThemeService, GameTheme } from '../../core/services/theme.service';
import { SoundService } from '../../core/services/sound.service';

@Component({
  selector: 'app-theme-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (game.showThemeModal()) {
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
            <span class="modal-header-icon">🎨</span>
            <h2 class="modal-title">Theme Customizer</h2>
            <p class="modal-subtitle">Pick an aesthetic visual theme for your game!</p>
          </div>

          <!-- Theme Choices List -->
          <div class="theme-options-grid">
            @for (theme of themeService.themes; track theme.id) {
              <div 
                (click)="selectTheme(theme.id)"
                class="theme-card"
                [class.theme-active]="themeService.currentTheme() === theme.id">
                <div class="theme-icon-wrap">
                  <span class="theme-emoji">{{ theme.emoji }}</span>
                </div>
                <div class="theme-details">
                  <div class="theme-name-row">
                    <span class="theme-name">{{ theme.name }}</span>
                    <span class="theme-badge">{{ theme.badge }}</span>
                  </div>
                  <span class="theme-preview-sub">Custom glowing accents & palette</span>
                </div>
                @if (themeService.currentTheme() === theme.id) {
                  <span class="check-mark">✓</span>
                }
              </div>
            }
          </div>

          <!-- Close / Apply Button -->
          <div class="modal-footer">
            <button 
              type="button"
              (click)="close()" 
              class="apply-btn">
              Apply & Play
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
      z-index: 9999;
    }

    .modal-box {
      width: 100%;
      max-width: 440px;
      padding: 24px;
      border-radius: 24px;
      background: #0f172a;
      border: 1px solid rgba(255, 255, 255, 0.12);
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(139, 92, 246, 0.2);
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

    .theme-options-grid {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .theme-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .theme-card:hover {
      transform: translateY(-2px);
      background: rgba(255, 255, 255, 0.07);
    }

    .theme-active {
      border-color: #8b5cf6;
      background: rgba(139, 92, 246, 0.12);
      box-shadow: 0 4px 20px rgba(139, 92, 246, 0.25);
    }

    .theme-icon-wrap {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.05);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .theme-emoji {
      font-size: 20px;
    }

    .theme-details {
      display: flex;
      flex-direction: column;
      gap: 2px;
      flex: 1;
    }
    .theme-name-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .theme-name {
      font-size: 0.85rem;
      font-weight: 800;
      color: white;
    }
    .theme-badge {
      font-size: 0.65rem;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.08);
      color: #cbd5e1;
    }
    .theme-preview-sub {
      font-size: 0.68rem;
      color: #94a3b8;
    }

    .check-mark {
      font-size: 16px;
      font-weight: 900;
      color: #a78bfa;
    }

    .modal-footer {
      margin-top: 20px;
    }
    .apply-btn {
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
    .apply-btn:hover {
      transform: translateY(-1px);
    }
  `]
})
export class ThemeModalComponent {
  constructor(
    public game: GameStateService,
    public themeService: ThemeService,
    private sound: SoundService
  ) {}

  selectTheme(themeId: GameTheme): void {
    this.sound.playTap();
    this.themeService.setTheme(themeId);
  }

  close(): void {
    this.sound.playTap();
    this.game.showThemeModal.set(false);
  }
}

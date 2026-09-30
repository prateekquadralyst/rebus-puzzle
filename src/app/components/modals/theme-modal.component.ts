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
    @if (themeService.isModalOpen() || game.showThemeModal()) {
      <div class="modal-overlay" (click)="close()">
        <div class="modal-box glass-panel animate-pop" (click)="$event.stopPropagation()">
          <!-- Close Button -->
          <button 
            type="button"
            (click)="close()" 
            class="modal-close-btn"
            title="Close / बंद करें">
            ✕
          </button>

          <!-- Header -->
          <div class="modal-header">
            <span class="modal-header-icon animate-float">🎨</span>
            <h2 class="modal-title">जादुई थीम • Magic Themes</h2>
            <p class="modal-subtitle">Pick your favorite world for all games! / अपनी मनपसंद थीम चुनें</p>
          </div>

          <!-- Theme Choices List -->
          <div class="theme-options-grid">
            @for (theme of themeService.themes; track theme.id) {
              <div 
                (click)="selectTheme(theme.id)"
                class="theme-card"
                [class.theme-active]="themeService.currentTheme() === theme.id"
                [style.--card-accent]="theme.primaryGlow">
                <div class="theme-icon-wrap" [style.box-shadow]="'0 0 16px ' + theme.primaryGlow">
                  <span class="theme-emoji">{{ theme.emoji }}</span>
                </div>
                
                <div class="theme-details">
                  <div class="theme-name-row">
                    <span class="theme-name">{{ theme.name }}</span>
                    <span class="theme-hindi">{{ theme.hindiName }}</span>
                    <span class="theme-badge">{{ theme.badge }}</span>
                  </div>
                  <span class="theme-preview-sub">{{ theme.description }}</span>
                  
                  <!-- Color Swatches Preview -->
                  <div class="palette-preview-row">
                    @for (c of theme.previewColors; track c) {
                      <span class="palette-dot" [style.background-color]="c"></span>
                    }
                  </div>
                </div>

                <div class="check-box-wrap">
                  @if (themeService.currentTheme() === theme.id) {
                    <span class="check-mark animate-pop">✓</span>
                  } @else {
                    <span class="check-circle-empty"></span>
                  }
                </div>
              </div>
            }
          </div>

          <!-- Close / Apply Button -->
          <div class="modal-footer">
            <button 
              type="button"
              (click)="close()" 
              class="apply-btn">
              ✨ थीम लागू करें • Play Now
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
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      z-index: 99999;
    }

    .modal-box {
      width: 100%;
      max-width: 480px;
      max-height: 90vh;
      max-height: 90dvh;
      overflow-y: auto;
      padding: 24px;
      border-radius: 28px;
      background: rgba(15, 23, 42, 0.95);
      border: 1px solid var(--theme-border, rgba(255, 255, 255, 0.15));
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.85), 0 0 35px var(--theme-glow, rgba(139, 92, 246, 0.35));
      position: relative;
    }

    .modal-close-btn {
      position: absolute;
      top: 16px;
      right: 16px;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #cbd5e1;
      font-size: 16px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s ease;
      z-index: 5;
    }
    .modal-close-btn:hover {
      background: rgba(239, 68, 68, 0.3);
      color: white;
      transform: scale(1.08);
    }

    .modal-header {
      text-align: center;
      margin-bottom: 18px;
    }
    .modal-header-icon {
      font-size: 38px;
      display: inline-block;
      margin-bottom: 6px;
      filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.4));
    }
    .modal-title {
      font-size: 1.35rem;
      font-weight: 900;
      color: white;
      font-family: var(--font-display, sans-serif);
      letter-spacing: -0.01em;
    }
    .modal-subtitle {
      font-size: 0.78rem;
      color: #94a3b8;
      margin-top: 4px;
      line-height: 1.3;
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
      gap: 14px;
      padding: 12px 16px;
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.04);
      border: 1.5px solid rgba(255, 255, 255, 0.08);
      cursor: pointer;
      transition: all 0.22s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .theme-card:hover {
      transform: translateY(-2px) scale(1.01);
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .theme-active {
      border-color: var(--theme-accent, #8b5cf6) !important;
      background: rgba(255, 255, 255, 0.09) !important;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35), 0 0 16px var(--theme-glow, rgba(139, 92, 246, 0.35));
    }

    .theme-icon-wrap {
      width: 44px;
      height: 44px;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.12);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: transform 0.2s;
    }
    .theme-card:hover .theme-icon-wrap {
      transform: scale(1.1) rotate(4deg);
    }
    .theme-emoji {
      font-size: 22px;
    }

    .theme-details {
      display: flex;
      flex-direction: column;
      gap: 3px;
      flex: 1;
      min-width: 0;
    }
    .theme-name-row {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 6px;
    }
    .theme-name {
      font-size: 0.92rem;
      font-weight: 800;
      color: white;
    }
    .theme-hindi {
      font-size: 0.78rem;
      font-weight: 700;
      color: #cbd5e1;
      opacity: 0.85;
    }
    .theme-badge {
      font-size: 0.65rem;
      font-weight: 800;
      padding: 1px 7px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.1);
      color: #e2e8f0;
      margin-left: auto;
    }
    .theme-preview-sub {
      font-size: 0.72rem;
      color: #94a3b8;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .palette-preview-row {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 3px;
    }
    .palette-dot {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      border: 1.5px solid rgba(255, 255, 255, 0.4);
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
    }

    .check-box-wrap {
      flex-shrink: 0;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .check-mark {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      font-size: 14px;
      font-weight: 900;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 12px rgba(16, 185, 129, 0.6);
    }
    .check-circle-empty {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      border: 2px solid rgba(255, 255, 255, 0.2);
    }

    .modal-footer {
      margin-top: 18px;
    }
    .apply-btn {
      width: 100%;
      padding: 14px;
      border-radius: 16px;
      background: linear-gradient(135deg, var(--theme-accent, #7c3aed), #4f46e5);
      border: none;
      color: white;
      font-weight: 900;
      font-size: 0.95rem;
      cursor: pointer;
      box-shadow: 0 8px 24px var(--theme-glow, rgba(124, 58, 237, 0.4));
      transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .apply-btn:hover {
      transform: translateY(-2px);
      filter: brightness(1.1);
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
    this.sound.playPop();
    this.themeService.setTheme(themeId);
  }

  close(): void {
    this.sound.playTap();
    this.themeService.close();
    this.game.showThemeModal.set(false);
  }
}

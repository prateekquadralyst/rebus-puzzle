import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameStateService } from '../../core/services/game-state.service';
import { SoundService } from '../../core/services/sound.service';
import { ThemeService } from '../../core/services/theme.service';
import { AppNavService } from '../../core/services/app-nav.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="app-header">
      <div class="header-container">
        <!-- Left: Logo & Hub Switcher -->
        <div class="header-left">
          <button 
            type="button" 
            (click)="goToHub()" 
            class="hub-home-pill" 
            title="Return to Toddler World Hub">
            <span>🏰</span>
            <span class="hub-btn-text">Hub</span>
          </button>

          <div class="logo-group" (click)="goToPortal()">
            <div class="logo-badge">
              <span>🧩</span>
            </div>
            <div class="logo-titles">
              <h1 class="logo-main">REBUS<span class="accent-text">MIND</span></h1>
              <span class="logo-sub">Picture-Word Puzzle</span>
            </div>
          </div>

          <!-- Difficulty Pill Dropdown Trigger -->
          <button 
            type="button"
            (click)="openModeModal()" 
            class="mode-pill"
            [ngClass]="'mode-' + game.currentDifficulty()">
            <span class="mode-dot"></span>
            <span class="mode-label">{{ game.currentDifficulty() }}</span>
            <span class="mode-arrow">▼</span>
          </button>
        </div>

        <!-- Right: Stats Bar & Controls -->
        <div class="header-right">
          <!-- Level Pill -->
          <div class="stat-pill level-pill">
            <span class="stat-label">Lvl</span>
            <span class="stat-value">{{ game.currentLevelIndex() + 1 }}</span>
            <span class="stat-sub">/{{ game.totalLevelsInMode() }}</span>
          </div>

          <!-- Streak Pill -->
          <div class="stat-pill streak-pill" title="Winning Streak">
            <span class="stat-emoji">🔥</span>
            <span class="stat-value streak-val">{{ game.streak() }}</span>
          </div>

          <!-- Coins Pill -->
          <div class="stat-pill coins-pill" title="Available Coins">
            <span class="stat-emoji">🪙</span>
            <span class="stat-value coins-val">{{ game.coins() }}</span>
          </div>

          <!-- ❓ Kid-Friendly How to Play / Guide Button -->
          <button 
            type="button"
            (click)="openGuideModal()" 
            class="help-action-btn" 
            title="How to Play (Kaise Khele?)">
            <span class="help-q-mark">❓</span>
            <span class="btn-help-text">Guide</span>
          </button>

          <!-- Audio Mute/Unmute Button -->
          <button 
            type="button"
            (click)="toggleSound()" 
            class="icon-action-btn" 
            [title]="sound.isMuted() ? 'Unmute Sound' : 'Mute Sound'">
            {{ sound.isMuted() ? '🔇' : '🔊' }}
          </button>

          <!-- 🎨 Theme Customizer -->
          <button 
            type="button" 
            (click)="openThemeModal()" 
            class="icon-action-btn theme-header-btn" 
            title="Theme Options / थीम बदलें">
            🎨
          </button>

          <!-- ⚙️ Game Options Menu -->
          <button 
            type="button"
            (click)="openMenuModal()" 
            class="icon-action-btn menu-action-btn" 
            title="Game Modes & Settings">
            ⚙️
          </button>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .app-header {
      width: 100%;
      padding: 10px 16px;
      position: relative;
      z-index: 20;
    }

    .header-container {
      max-width: 920px;
      margin: 0 auto;
      padding: 8px 16px;
      border-radius: 20px;
      background: rgba(15, 23, 42, 0.72);
      border: 1px solid rgba(255, 255, 255, 0.12);
      box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-group {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
    }

    .logo-badge {
      width: 38px;
      height: 38px;
      border-radius: 12px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.45);
      flex-shrink: 0;
    }

    .logo-titles {
      display: flex;
      flex-direction: column;
      line-height: 1.1;
    }

    .logo-main {
      font-family: var(--font-display);
      font-size: 1.15rem;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.02em;
    }

    .accent-text {
      color: #a78bfa;
    }

    .logo-sub {
      font-size: 0.68rem;
      font-weight: 500;
      color: #94a3b8;
    }

    /* Mode Pill */
    .mode-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 12px;
      border-radius: 20px;
      border: 1px solid transparent;
      cursor: pointer;
      font-family: var(--font-body);
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      transition: all 0.2s ease;
      outline: none;
    }
    .mode-pill:hover {
      transform: translateY(-1px);
    }
    .mode-pill:active {
      transform: scale(0.96);
    }

    .mode-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
    }
    .mode-arrow {
      font-size: 8px;
      opacity: 0.7;
    }

    .mode-easy {
      background: rgba(16, 185, 129, 0.15);
      border-color: rgba(16, 185, 129, 0.4);
      color: #34d399;
    }
    .mode-easy .mode-dot {
      background: #10b981;
      box-shadow: 0 0 8px #10b981;
    }

    .mode-medium {
      background: rgba(245, 158, 11, 0.15);
      border-color: rgba(245, 158, 11, 0.4);
      color: #fbbf24;
    }
    .mode-medium .mode-dot {
      background: #f59e0b;
      box-shadow: 0 0 8px #f59e0b;
    }

    .mode-hard {
      background: rgba(239, 68, 68, 0.15);
      border-color: rgba(239, 68, 68, 0.4);
      color: #f87171;
    }
    .mode-hard .mode-dot {
      background: #ef4444;
      box-shadow: 0 0 8px #ef4444;
    }

    /* Right Stats */
    .header-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .stat-pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 5px 10px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(10px);
      font-size: 0.75rem;
      font-weight: 700;
    }

    .stat-label {
      font-size: 0.7rem;
      font-weight: 500;
      color: #94a3b8;
    }
    .stat-value {
      color: #ffffff;
      font-weight: 800;
    }
    .stat-sub {
      font-size: 0.65rem;
      color: #64748b;
    }

    .streak-val {
      color: #f59e0b;
    }
    .coins-val {
      color: #fde047;
    }

    .icon-action-btn {
      width: 34px;
      height: 34px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.09);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      cursor: pointer;
      color: #cbd5e1;
      transition: all 0.2s ease;
      outline: none;
    }
    .icon-action-btn:hover {
      background: rgba(255, 255, 255, 0.12);
      transform: translateY(-1px);
    }
    .icon-action-btn:active {
      transform: scale(0.94);
    }

    .help-action-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 5px 11px;
      border-radius: 12px;
      background: rgba(245, 158, 11, 0.2);
      border: 1px solid rgba(245, 158, 11, 0.45);
      color: #fef3c7;
      font-size: 0.74rem;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.2s;
      outline: none;
    }
    .help-action-btn:hover {
      background: rgba(245, 158, 11, 0.35);
      color: white;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.35);
    }
    .help-action-btn:active {
      transform: scale(0.96);
    }

    .menu-action-btn {
      border-color: rgba(139, 92, 246, 0.4);
      background: rgba(139, 92, 246, 0.15);
    }
    .menu-action-btn:hover {
      background: rgba(139, 92, 246, 0.3);
      border-color: #8b5cf6;
    }

    .hub-home-pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 6px 12px;
      border-radius: 14px;
      background: rgba(139, 92, 246, 0.22);
      border: 1px solid rgba(139, 92, 246, 0.45);
      color: #f5f3ff;
      font-size: 0.76rem;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.2s;
      outline: none;
    }
    .hub-home-pill:hover {
      background: rgba(139, 92, 246, 0.4);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
    }
    .hub-home-pill:active {
      transform: scale(0.96);
    }

    @media (max-width: 540px) {
      .header-container {
        justify-content: space-between;
        padding: 6px 12px;
      }
      .logo-sub {
        display: none;
      }
      .btn-help-text, .hub-btn-text {
        display: none;
      }
      .stat-pill {
        padding: 4px 7px;
        font-size: 0.68rem;
      }
      .help-action-btn, .hub-home-pill {
        padding: 5px 8px;
      }
    }
  `]
})
export class HeaderComponent {
  constructor(
    public game: GameStateService,
    public sound: SoundService,
    public themeService: ThemeService,
    public nav: AppNavService
  ) {}

  goToHub(): void {
    this.sound.playTap();
    this.nav.goToHub();
  }

  goToPortal(): void {
    this.sound.playTap();
    this.nav.goToPortal();
  }

  openGuideModal(): void {
    this.sound.playTap();
    this.game.showGuideModal.set(true);
  }

  openThemeModal(): void {
    this.sound.playTap();
    this.themeService.open();
  }

  openMenuModal(): void {
    this.sound.playTap();
    this.game.showMenuModal.set(true);
  }

  openModeModal(): void {
    this.sound.playTap();
    this.game.showModeModal.set(true);
  }

  openStatsModal(): void {
    this.sound.playTap();
    this.game.showStatsModal.set(true);
  }

  toggleSound(): void {
    this.sound.toggleMute();
  }
}



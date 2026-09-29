import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameStateService } from '../../core/services/game-state.service';
import { SoundService } from '../../core/services/sound.service';

@Component({
  selector: 'app-how-to-play-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (showGuide) {
      <div class="modal-overlay" (click)="close()">
        <div class="guide-card glass-panel animate-pop" (click)="$event.stopPropagation()">
          <!-- Close Button -->
          <button 
            type="button" 
            (click)="close()" 
            class="modal-close-btn"
            title="Close Guide">
            ✕
          </button>

          <!-- Header -->
          <div class="guide-header">
            <span class="guide-icon">🎮</span>
            <h2 class="guide-title">How To Play! (Kaise Khele?)</h2>
            <p class="guide-sub">It's super easy and fun! Follow these 3 simple steps:</p>
          </div>

          <!-- Illustrated Steps -->
          <div class="steps-container">
            <!-- Step 1 -->
            <div class="step-card">
              <div class="step-number">1</div>
              <div class="step-content">
                <div class="step-visual">
                  <span class="mini-tile">⭐ STAR</span>
                  <span class="step-op">+</span>
                  <span class="mini-tile">🐟 FISH</span>
                </div>
                <h4 class="step-heading">Look at the Pictures</h4>
                <p class="step-desc">Each picture tells you a piece of the secret word!</p>
              </div>
            </div>

            <!-- Step 2 -->
            <div class="step-card">
              <div class="step-number">2</div>
              <div class="step-content">
                <div class="step-visual">
                  <span class="key-badge">S</span>
                  <span class="key-badge">T</span>
                  <span class="key-badge">A</span>
                  <span class="key-badge">R</span>
                  <span class="key-badge">F</span>
                  <span class="key-badge">I</span>
                  <span class="key-badge">S</span>
                  <span class="key-badge">H</span>
                </div>
                <h4 class="step-heading">Tap Letters to Spell</h4>
                <p class="step-desc">Tap the buttons below to fill the boxes. Made a mistake? Tap the filled box to remove it!</p>
              </div>
            </div>

            <!-- Step 3 -->
            <div class="step-card">
              <div class="step-number">3</div>
              <div class="step-content">
                <div class="step-visual">
                  <span class="hint-mini">💡 Reveal</span>
                  <span class="hint-mini">💣 Bomb</span>
                  <span class="hint-mini">📖 Clue</span>
                </div>
                <h4 class="step-heading">Stuck? Use Helpful Hints!</h4>
                <p class="step-desc">Tap the 💡 lightbulb to get a free letter, or 💣 bomb to remove wrong letters!</p>
              </div>
            </div>
          </div>

          <!-- Ready to play button -->
          <div class="guide-footer">
            <button 
              type="button" 
              (click)="close()" 
              class="got-it-btn">
              <span>🎉 Got It! Let's Play!</span>
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
      background: rgba(3, 7, 18, 0.88);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      z-index: 99999;
    }

    .guide-card {
      width: 100%;
      max-width: 460px;
      max-height: 90vh;
      overflow-y: auto;
      padding: 24px 20px;
      border-radius: 24px;
      background: #0f172a;
      border: 1px solid rgba(255, 255, 255, 0.15);
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(139, 92, 246, 0.25);
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
    .modal-close-btn:hover {
      background: rgba(255, 255, 255, 0.16);
      color: white;
    }

    .guide-header {
      text-align: center;
      margin-bottom: 20px;
    }
    .guide-icon {
      font-size: 36px;
      display: block;
      margin-bottom: 4px;
    }
    .guide-title {
      font-size: 1.3rem;
      font-weight: 900;
      color: white;
      font-family: var(--font-display);
    }
    .guide-sub {
      font-size: 0.76rem;
      color: #94a3b8;
      margin-top: 4px;
    }

    .steps-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .step-card {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px 14px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .step-number {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: linear-gradient(135deg, #8b5cf6, #6366f1);
      color: white;
      font-weight: 900;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 4px 10px rgba(139, 92, 246, 0.4);
    }

    .step-content {
      display: flex;
      flex-direction: column;
      gap: 3px;
      flex: 1;
    }

    .step-visual {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 4px;
      flex-wrap: wrap;
    }
    .mini-tile {
      background: rgba(255, 255, 255, 0.1);
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 0.72rem;
      font-weight: 800;
      color: #e2e8f0;
    }
    .step-op {
      font-weight: 900;
      color: #a78bfa;
      font-size: 0.85rem;
    }
    .key-badge {
      width: 22px;
      height: 24px;
      background: #1e293b;
      border: 1px solid #3b82f6;
      border-radius: 5px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 0.72rem;
      color: #93c5fd;
    }
    .hint-mini {
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.3);
      color: #fbbf24;
      font-size: 0.68rem;
      font-weight: 800;
      padding: 2px 7px;
      border-radius: 6px;
    }

    .step-heading {
      font-size: 0.84rem;
      font-weight: 800;
      color: white;
    }
    .step-desc {
      font-size: 0.72rem;
      color: #94a3b8;
      line-height: 1.35;
    }

    .guide-footer {
      margin-top: 18px;
    }
    .got-it-btn {
      width: 100%;
      padding: 13px;
      border-radius: 14px;
      background: linear-gradient(135deg, #10b981, #059669);
      border: none;
      color: white;
      font-weight: 900;
      font-size: 0.9rem;
      cursor: pointer;
      box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
      transition: all 0.2s;
    }
    .got-it-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 28px rgba(16, 185, 129, 0.5);
    }
  `]
})
export class HowToPlayModalComponent {
  get showGuide(): boolean {
    return this.game.showGuideModal();
  }

  constructor(
    public game: GameStateService,
    private sound: SoundService
  ) {}

  close(): void {
    this.sound.playTap();
    this.game.showGuideModal.set(false);
  }
}

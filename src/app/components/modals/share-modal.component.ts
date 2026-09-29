import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameStateService } from '../../core/services/game-state.service';
import { SoundService } from '../../core/services/sound.service';

@Component({
  selector: 'app-share-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (game.showShareModal()) {
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
            <span class="modal-header-icon">🔗</span>
            <h2 class="modal-title">Challenge a Friend!</h2>
            <p class="modal-subtitle">Share this exact Rebus puzzle to see if your friends can solve it!</p>
          </div>

          <!-- Puzzle Preview Box -->
          <div class="preview-box">
            <div class="preview-title">CURRENT PUZZLE:</div>
            <div class="preview-clues">
              @for (img of game.currentPuzzle().images; track $index; let last = $last) {
                <span>{{ img.emoji }} {{ img.label }}</span>
                @if (!last) {
                  <span class="preview-plus">+</span>
                }
              }
            </div>
            <span class="preview-category">{{ game.currentPuzzle().category }} ({{ game.currentPuzzle().difficulty | uppercase }})</span>
          </div>

          <!-- Share Actions -->
          <div class="share-actions-list">
            <!-- WhatsApp Share Button -->
            <a 
              [href]="whatsAppUrl" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="action-btn-whatsapp">
              <span class="btn-icon">💬</span>
              <span>Share on WhatsApp</span>
            </a>

            <!-- Copy Link Button -->
            <button 
              type="button"
              (click)="copyLink()" 
              class="action-btn-copy">
              <span class="btn-icon">{{ isCopied() ? '✅' : '📋' }}</span>
              <span>{{ isCopied() ? 'Link Copied to Clipboard!' : 'Copy Challenge Link' }}</span>
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
      margin-bottom: 18px;
    }
    .modal-header-icon {
      font-size: 32px;
      display: block;
      margin-bottom: 4px;
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
      margin-top: 3px;
    }

    .preview-box {
      padding: 14px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      margin-bottom: 18px;
      text-align: center;
    }
    .preview-title {
      font-size: 0.65rem;
      font-weight: 800;
      color: #94a3b8;
      letter-spacing: 0.08em;
      margin-bottom: 6px;
    }
    .preview-clues {
      font-size: 1.05rem;
      font-weight: 800;
      color: #c4b5fd;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      flex-wrap: wrap;
    }
    .preview-plus {
      color: #94a3b8;
    }
    .preview-category {
      display: block;
      font-size: 0.7rem;
      color: #94a3b8;
      margin-top: 6px;
    }

    .share-actions-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .action-btn-whatsapp {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px;
      border-radius: 14px;
      background: linear-gradient(135deg, #25d366, #128c7e);
      color: white;
      font-weight: 800;
      font-size: 0.88rem;
      text-decoration: none;
      box-shadow: 0 6px 18px rgba(37, 211, 102, 0.35);
      transition: all 0.2s;
    }
    .action-btn-whatsapp:hover {
      transform: translateY(-1px);
      box-shadow: 0 8px 22px rgba(37, 211, 102, 0.45);
    }

    .action-btn-copy {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: white;
      font-weight: 800;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .action-btn-copy:hover {
      background: rgba(255, 255, 255, 0.14);
      transform: translateY(-1px);
    }
    .btn-icon {
      font-size: 16px;
    }
  `]
})
export class ShareModalComponent {
  readonly isCopied = signal<boolean>(false);

  constructor(
    public game: GameStateService,
    private sound: SoundService
  ) {}

  get whatsAppUrl(): string {
    const text = encodeURIComponent(
      `🧩 Can you solve this Rebus Puzzle faster than me?\n\nPlay here: ${this.game.shareUrl()}`
    );
    return `https://api.whatsapp.com/send?text=${text}`;
  }

  copyLink(): void {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(this.game.shareUrl());
      this.sound.playTap();
      this.isCopied.set(true);
      setTimeout(() => this.isCopied.set(false), 2500);
    }
  }

  close(): void {
    this.sound.playTap();
    this.game.showShareModal.set(false);
  }
}

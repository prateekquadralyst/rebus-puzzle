import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppNavService } from '../../core/services/app-nav.service';
import { SoundService } from '../../core/services/sound.service';
import { SpeechService } from '../../core/services/speech.service';
import { ConfettiService } from '../../core/services/confetti.service';

export interface PuzzlePieceItem {
  id: number;
  label: string;
  subLabel: string;
  icon: string;
  gridRow: number;
  gridCol: number;
  isPlaced: boolean;
  color: string;
}

export interface JigsawPuzzle {
  id: string;
  name: string;
  hindiName: string;
  category: string;
  soundKey: string;
  soundWord: string;
  fullEmoji: string;
  bgGrad: string;
  accentColor: string;
  gridCols: number;
  pieces: PuzzlePieceItem[];
}

interface StarBurst {
  id: number;
  x: number;
  y: number;
}

@Component({
  selector: 'app-piece-puzzle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="game-viewport" (pointerdown)="onUserInteract()">
      <!-- Top Header -->
      <header class="game-header">
        <button 
          type="button" 
          (click)="appNav.goToHub()" 
          class="hub-return-btn"
          title="Return to Toddler Hub">
          <span>🏰 Hub</span>
        </button>

        <div class="level-indicator">
          <span class="game-tag">🧩 PUZZLE SNAP</span>
          <span class="stage-tag">{{ currentPuzzle().name }} • Puzzle {{ currentIdx() + 1 }}/{{ puzzles.length }} ⭐</span>
        </div>

        <button 
          type="button" 
          (click)="sound.toggleMute()" 
          class="mute-circle-btn"
          [title]="sound.isMuted() ? 'Turn Sound On' : 'Turn Sound Off'">
          {{ sound.isMuted() ? '🔇' : '🎵' }}
        </button>
      </header>

      <!-- Mascot Cheerleader & Spoken Hint -->
      <div class="mascot-banner animate-pop" (click)="onMascotTap()">
        <div class="mascot-avatar" [class.mascot-bouncing]="isMascotJumping()">
          <span>🧸</span>
        </div>
        <div class="mascot-speech">
          @if (isAllSnapped()) {
            <span class="speech-highlight">🎉 WONDERFUL! You built the {{ currentPuzzle().name }}!</span>
          } @else if (selectedPiece()) {
            <span class="speech-highlight">👉 Snap {{ selectedPiece()?.label }} into its matching spot!</span>
          } @else {
            <span>Drag or tap puzzle pieces below to build the {{ currentPuzzle().name }}! 👇</span>
          }
        </div>
      </div>

      <!-- Main Stage -->
      <main class="puzzle-stage">
        <!-- Target Jigsaw Assembly Board -->
        <div 
          class="jigsaw-board"
          [class.board-complete]="isAllSnapped()"
          [style.--accent-color]="currentPuzzle().accentColor"
          [style.background]="isAllSnapped() ? currentPuzzle().bgGrad : 'rgba(15, 23, 42, 0.8)'">
          
          @if (!isAllSnapped()) {
            <!-- Pieces Slots Grid with Puzzle Cutlines -->
            <div 
              class="puzzle-frame" 
              [class.grid-cols-2]="currentPuzzle().gridCols === 2">
              
              <!-- Ghost Silhouette Background Clue -->
              <div class="ghost-character-clue">
                <span class="ghost-emoji">{{ currentPuzzle().fullEmoji }}</span>
              </div>

              @for (piece of currentPuzzle().pieces; track piece.id) {
                <div 
                  class="puzzle-slot"
                  [attr.data-id]="piece.id"
                  [class.slot-snapped]="piece.isPlaced"
                  [class.is-target]="selectedPiece()?.id === piece.id && !piece.isPlaced"
                  (click)="onSlotClick(piece)">
                  
                  <!-- Target Pointer Arrow when piece is selected -->
                  @if (selectedPiece()?.id === piece.id && !piece.isPlaced) {
                    <div class="target-pointer-arrow animate-bounce">
                      <span class="arrow-icon">⬇️</span>
                      <span class="arrow-text">SNAP HERE!</span>
                    </div>
                  }

                  @if (piece.isPlaced) {
                    <!-- Snapped Puzzle Piece with Lock Border -->
                    <div class="snapped-piece-box animate-pop" [style.background]="piece.color">
                      <span class="snapped-icon">{{ piece.icon }}</span>
                      <span class="snapped-label">{{ piece.label }}</span>
                      <span class="snap-lock-badge">✓</span>
                    </div>
                  } @else {
                    <!-- Empty Puzzle Socket -->
                    <div class="empty-socket">
                      <span class="socket-num">#{{ piece.id }}</span>
                      <span class="socket-hint">{{ piece.label }}</span>
                    </div>
                  }
                </div>
              }
            </div>
          } @else {
            <!-- Full Character Grand Celebration Reveal -->
            <div class="complete-character-reveal animate-pop">
              <span class="grand-emoji animate-float" (click)="replayCharacterSound()">{{ currentPuzzle().fullEmoji }}</span>
              <h2 class="character-title">{{ currentPuzzle().name }}</h2>
              <span class="character-sound-tag">"{{ currentPuzzle().soundWord }}" 🔊</span>
              
              <div class="reveal-stars-row">
                <span class="reveal-star">⭐</span>
                <span class="reveal-star">⭐</span>
                <span class="reveal-star">⭐</span>
              </div>
            </div>
          }
        </div>

        <!-- Available Pieces Tray (Bottom) -->
        @if (!isAllSnapped()) {
          <div class="pieces-tray-container">
            <span class="tray-label">👇 PUZZLE PIECES (Chuno aur Jodo)</span>
            
            <div class="pieces-rack">
              @for (piece of currentPuzzle().pieces; track piece.id) {
                @if (!piece.isPlaced) {
                  <div 
                    class="piece-btn-wrap"
                    [attr.data-id]="piece.id"
                    [class.is-selected]="selectedPiece()?.id === piece.id"
                    [class.is-dragging]="draggingPiece()?.id === piece.id"
                    [style.transform]="getDraggingTransform(piece)"
                    (pointerdown)="onPiecePointerDown(piece, $event)">
                    
                    <button 
                      type="button"
                      class="jigsaw-piece-btn animate-float"
                      [style.--piece-color]="piece.color">
                      
                      <!-- Puzzle Tab Ornament -->
                      <div class="puzzle-tab-knob"></div>

                      <span class="piece-icon">{{ piece.icon }}</span>
                      <span class="piece-title">{{ piece.label }}</span>
                      <span class="piece-sub">{{ piece.subLabel }}</span>
                    </button>
                  </div>
                }
              }
            </div>
          </div>
        } @else {
          <!-- Victory Celebration Next Button -->
          <div class="victory-action-box animate-pop">
            <button 
              type="button" 
              (click)="nextPuzzle()" 
              class="next-puzzle-btn">
              <span>🎉 NEXT PUZZLE ▶</span>
            </button>
          </div>
        }

        <!-- Animated Demo Hand Guide -->
        @if (showDemoHand && demoSource && demoTarget) {
          <div 
            class="demo-hand-pointer"
            [style.--sx]="demoSource.x + 'px'"
            [style.--sy]="demoSource.y + 'px'"
            [style.--tx]="demoTarget.x + 'px'"
            [style.--ty]="demoTarget.y + 'px'">
            <span class="hand-emoji">👆</span>
            <span class="hand-caption">Snap here!</span>
          </div>
        }

        <!-- Star Burst Particles on Snap -->
        @for (star of activeStars; track star.id) {
          <div 
            class="star-burst-cluster"
            [style.left.px]="star.x"
            [style.top.px]="star.y">
            <div class="burst-glow-ring"></div>
            <span class="flying-star s1">⭐</span>
            <span class="flying-star s2">✨</span>
            <span class="flying-star s3">🌟</span>
            <span class="flying-star s4">🧩</span>
          </div>
        }
      </main>

      <footer class="game-footer">
        <p>💡 Tip: Put pieces together to see the friendly character burst into life!</p>
      </footer>
    </div>
  `,
  styles: [`
    .game-viewport {
      min-height: 100vh;
      min-height: 100dvh;
      width: 100%;
      background: radial-gradient(circle at 50% 12%, #312e81 0%, #0f172a 70%, #020617 100%);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      user-select: none;
      overflow-x: hidden;
      touch-action: manipulation;
    }

    .game-header {
      width: 100%;
      max-width: 900px;
      margin: 0 auto;
      padding: 12px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      z-index: 20;
    }

    .hub-return-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.16);
      color: #f1f5f9;
      font-size: 0.82rem;
      font-weight: 800;
      cursor: pointer;
      backdrop-filter: blur(10px);
      transition: all 0.2s;
    }
    .hub-return-btn:hover {
      background: rgba(255, 255, 255, 0.18);
      transform: translateY(-2px);
    }

    .level-indicator {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }
    .game-tag {
      font-size: 0.84rem;
      font-weight: 900;
      color: #a78bfa;
      letter-spacing: 0.06em;
      text-shadow: 0 0 12px rgba(167, 139, 250, 0.5);
    }
    .stage-tag {
      font-size: 0.74rem;
      font-weight: 800;
      color: #facc15;
    }

    .mute-circle-btn {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.16);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      cursor: pointer;
      backdrop-filter: blur(10px);
      transition: all 0.2s;
    }

    /* Mascot Banner */
    .mascot-banner {
      align-self: center;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 8px 20px;
      border-radius: 24px;
      background: rgba(255, 255, 255, 0.08);
      border: 1.5px solid rgba(255, 255, 255, 0.18);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
      cursor: pointer;
      backdrop-filter: blur(8px);
      margin-bottom: 8px;
      transition: transform 0.2s;
      z-index: 10;
    }
    .mascot-banner:hover {
      transform: scale(1.03);
    }
    .mascot-avatar {
      font-size: 1.6rem;
    }
    .mascot-bouncing {
      animation: mascotJump 0.4s ease-in-out infinite alternate;
    }
    @keyframes mascotJump {
      0% { transform: translateY(0) scale(1); }
      100% { transform: translateY(-8px) scale(1.15); }
    }
    .mascot-speech {
      font-size: clamp(0.8rem, 2.6vw, 0.98rem);
      font-weight: 800;
      color: #e2e8f0;
    }
    .speech-highlight {
      color: #fde047;
      text-shadow: 0 0 10px rgba(253, 224, 71, 0.5);
    }

    /* Main Stage */
    .puzzle-stage {
      flex: 1;
      max-width: 900px;
      width: 100%;
      margin: 0 auto;
      padding: 4px 16px 18px 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-around;
      position: relative;
    }

    /* Jigsaw Target Board */
    .jigsaw-board {
      width: 100%;
      max-width: 380px;
      min-height: 250px;
      border-radius: 32px;
      border: 3px solid rgba(255, 255, 255, 0.2);
      box-shadow: 
        0 16px 40px rgba(0, 0, 0, 0.5),
        inset 0 4px 16px rgba(0, 0, 0, 0.4);
      padding: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .jigsaw-board.board-complete {
      border: 3.5px solid #34d399;
      box-shadow: 
        0 20px 50px rgba(0, 0, 0, 0.7),
        0 0 40px rgba(52, 211, 153, 0.5);
      transform: scale(1.03);
    }

    .puzzle-frame {
      width: 100%;
      display: grid;
      gap: 10px;
      position: relative;
    }
    .grid-cols-2 {
      grid-template-columns: repeat(2, 1fr);
    }

    .ghost-character-clue {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      opacity: 0.16;
      z-index: 1;
    }
    .ghost-emoji {
      font-size: clamp(6.5rem, 18vw, 8.5rem);
      filter: blur(1px);
    }

    .puzzle-slot {
      height: clamp(100px, 26vw, 126px);
      border-radius: 20px;
      border: 2.5px dashed rgba(255, 255, 255, 0.25);
      background: rgba(0, 0, 0, 0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      cursor: pointer;
      z-index: 2;
      transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    /* Target Spotlight when piece selected */
    .puzzle-slot.is-target {
      border: 3.5px dashed #fde047;
      background: rgba(253, 224, 71, 0.15);
      box-shadow: 0 0 30px rgba(253, 224, 71, 0.5);
      transform: scale(1.05);
      animation: targetPulse 1.2s ease-in-out infinite;
    }
    @keyframes targetPulse {
      0%, 100% { transform: scale(1.03); }
      50% { transform: scale(1.08); }
    }

    .target-pointer-arrow {
      position: absolute;
      top: -34px;
      display: flex;
      flex-direction: column;
      align-items: center;
      z-index: 15;
      pointer-events: none;
    }
    .arrow-icon {
      font-size: 1.3rem;
      filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.6));
    }
    .arrow-text {
      font-size: 0.62rem;
      font-weight: 900;
      color: #fde047;
      background: #78350f;
      padding: 1px 6px;
      border-radius: 8px;
    }

    .empty-socket {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      opacity: 0.45;
    }
    .socket-num {
      font-size: 1.3rem;
      font-weight: 900;
      color: #94a3b8;
    }
    .socket-hint {
      font-size: 0.65rem;
      font-weight: 800;
      color: #cbd5e1;
      text-transform: uppercase;
    }

    .snapped-piece-box {
      width: 100%;
      height: 100%;
      border-radius: 17px;
      border: 2.5px solid #ffffff;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      box-shadow: inset 0 2px 6px rgba(255, 255, 255, 0.4);
      position: relative;
    }
    .snapped-icon {
      font-size: clamp(2rem, 5.5vw, 2.7rem);
      filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.4));
    }
    .snapped-label {
      font-size: 0.68rem;
      font-weight: 900;
      color: #ffffff;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .snap-lock-badge {
      position: absolute;
      top: 5px;
      right: 5px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #10b981;
      color: white;
      font-size: 11px;
      font-weight: 900;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Complete Reveal State */
    .complete-character-reveal {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      padding: 10px;
      cursor: pointer;
    }
    .grand-emoji {
      font-size: clamp(5.5rem, 16vw, 7.5rem);
      filter: drop-shadow(0 12px 24px rgba(0, 0, 0, 0.5));
      cursor: pointer;
      transition: transform 0.2s;
    }
    .grand-emoji:hover {
      transform: scale(1.1) rotate(5deg);
    }
    .character-title {
      font-family: var(--font-display, sans-serif);
      font-size: clamp(1.4rem, 4.2vw, 1.8rem);
      font-weight: 900;
      color: #ffffff;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
      margin: 0;
    }
    .character-sound-tag {
      font-size: 0.85rem;
      font-weight: 900;
      color: #facc15;
      background: rgba(0, 0, 0, 0.4);
      padding: 3px 12px;
      border-radius: 12px;
      letter-spacing: 0.05em;
    }

    .reveal-stars-row {
      display: flex;
      gap: 8px;
      margin-top: 4px;
    }
    .reveal-star {
      font-size: 1.8rem;
      filter: drop-shadow(0 0 10px #fde047);
      animation: starBounce 0.6s ease-in-out infinite alternate;
    }
    @keyframes starBounce {
      0% { transform: translateY(0) scale(1); }
      100% { transform: translateY(-8px) scale(1.2); }
    }

    /* Pieces Tray */
    .pieces-tray-container {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .tray-label {
      font-size: 0.72rem;
      font-weight: 900;
      color: #cbd5e1;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin-bottom: 10px;
    }

    .pieces-rack {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: 14px;
      width: 100%;
    }

    .piece-btn-wrap {
      touch-action: none;
      position: relative;
      cursor: grab;
      transition: transform 0.15s ease-out;
    }
    .piece-btn-wrap:active {
      cursor: grabbing;
    }

    .jigsaw-piece-btn {
      width: clamp(92px, 24vw, 120px);
      height: clamp(90px, 23vw, 114px);
      border-radius: 24px;
      border: 2.5px solid rgba(255, 255, 255, 0.35);
      background: var(--piece-color);
      box-shadow: 
        0 10px 24px rgba(0, 0, 0, 0.4),
        inset 0 2px 6px rgba(255, 255, 255, 0.4);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      cursor: pointer;
      outline: none;
      position: relative;
      transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .jigsaw-piece-btn:hover {
      transform: translateY(-6px) scale(1.06);
      border-color: #ffffff;
      box-shadow: 0 16px 32px rgba(0, 0, 0, 0.5);
    }

    /* Selected state */
    .piece-btn-wrap.is-selected .jigsaw-piece-btn {
      transform: translateY(-8px) scale(1.1);
      border-color: #fde047;
      box-shadow: 0 0 30px rgba(253, 224, 71, 0.7);
      animation: pieceJiggle 0.6s ease-in-out infinite alternate;
    }
    @keyframes pieceJiggle {
      0% { transform: translateY(-8px) scale(1.08) rotate(-3deg); }
      100% { transform: translateY(-10px) scale(1.12) rotate(3deg); }
    }

    .puzzle-tab-knob {
      position: absolute;
      top: -8px;
      width: 22px;
      height: 12px;
      border-radius: 12px 12px 0 0;
      background: inherit;
      border: 2px solid rgba(255, 255, 255, 0.35);
      border-bottom: none;
    }

    .piece-icon {
      font-size: clamp(2rem, 5.5vw, 2.6rem);
      filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.4));
    }
    .piece-title {
      font-size: 0.72rem;
      font-weight: 900;
      color: #ffffff;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .piece-sub {
      font-size: 0.58rem;
      font-weight: 800;
      color: #fef08a;
    }

    /* Victory Button */
    .victory-action-box {
      margin-top: 14px;
    }
    .next-puzzle-btn {
      padding: 16px 36px;
      border-radius: 24px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border: 2.5px solid #6ee7b7;
      color: white;
      font-size: 1.15rem;
      font-weight: 900;
      cursor: pointer;
      box-shadow: 0 12px 30px rgba(16, 185, 129, 0.5);
      transition: all 0.2s;
    }
    .next-puzzle-btn:hover {
      transform: scale(1.05);
      box-shadow: 0 16px 36px rgba(16, 185, 129, 0.65);
    }

    /* Demo Hand Pointer */
    .demo-hand-pointer {
      position: fixed;
      pointer-events: none;
      z-index: 100;
      display: flex;
      flex-direction: column;
      align-items: center;
      animation: demoHandGuide 2.5s ease-in-out infinite;
    }
    .hand-emoji {
      font-size: 2.2rem;
      filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.6));
    }
    .hand-caption {
      font-size: 0.75rem;
      font-weight: 900;
      color: #fde047;
      background: rgba(0, 0, 0, 0.8);
      padding: 2px 8px;
      border-radius: 10px;
      border: 1px solid #fde047;
    }
    @keyframes demoHandGuide {
      0% {
        left: var(--sx);
        top: var(--sy);
        transform: scale(0.9) translate(-50%, -50%);
        opacity: 0;
      }
      20% {
        left: var(--sx);
        top: var(--sy);
        transform: scale(1.15) translate(-50%, -50%);
        opacity: 1;
      }
      75% {
        left: var(--tx);
        top: var(--ty);
        transform: scale(1.2) translate(-50%, -50%);
        opacity: 1;
      }
      90% {
        left: var(--tx);
        top: var(--ty);
        transform: scale(0.9) translate(-50%, -50%);
        opacity: 1;
      }
      100% {
        left: var(--tx);
        top: var(--ty);
        transform: scale(0.8) translate(-50%, -50%);
        opacity: 0;
      }
    }

    /* Star Burst on Snap */
    .star-burst-cluster {
      position: absolute;
      transform: translate(-50%, -50%);
      pointer-events: none;
      z-index: 60;
    }
    .burst-glow-ring {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      border: 3.5px solid #facc15;
      border-radius: 50%;
      box-shadow: 0 0 20px #facc15;
      animation: burstRingExpand 0.45s ease-out forwards;
    }
    @keyframes burstRingExpand {
      0% { width: 20px; height: 20px; opacity: 1; }
      100% { width: 140px; height: 140px; opacity: 0; }
    }

    .flying-star {
      position: absolute;
      top: 50%;
      left: 50%;
      font-size: 1.4rem;
      animation: flyOutStar 0.65s cubic-bezier(0.12, 0.8, 0.32, 1) forwards;
    }
    .s1 { --dx: 45px; --dy: -45px; }
    .s2 { --dx: -45px; --dy: -45px; }
    .s3 { --dx: 50px; --dy: 30px; }
    .s4 { --dx: -50px; --dy: 30px; }

    @keyframes flyOutStar {
      0% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(0.5);
      }
      100% {
        opacity: 0;
        transform: translate(-50%, -50%) translate(var(--dx), var(--dy)) scale(1.35) rotate(180deg);
      }
    }

    .game-footer {
      width: 100%;
      text-align: center;
      padding: 10px 16px 16px 16px;
      font-size: 0.72rem;
      color: #64748b;
    }
  `]
})
export class PiecePuzzleComponent implements OnInit, OnDestroy {
  readonly currentIdx = signal<number>(0);
  readonly selectedPiece = signal<PuzzlePieceItem | null>(null);
  readonly draggingPiece = signal<PuzzlePieceItem | null>(null);
  readonly isMascotJumping = signal<boolean>(false);

  // Drag coordinates
  private dragStartX = 0;
  private dragStartY = 0;
  private dragCurrX = 0;
  private dragCurrY = 0;

  // Demo Hand
  showDemoHand = false;
  demoSource: { x: number; y: number } | null = null;
  demoTarget: { x: number; y: number } | null = null;
  private demoTimer: any = null;

  activeStars: StarBurst[] = [];
  private starCounter = 1;

  readonly puzzles: JigsawPuzzle[] = [
  // 1. 🐶 Happy Puppy (2-piece beginner puzzle)
  {
    id: 'puppy',
    name: 'Happy Puppy',
    hindiName: 'Pyara Kutta',
    category: 'Pets',
    soundKey: 'puppy',
    soundWord: 'Woof Woof!',
    fullEmoji: '🐶',
    bgGrad: 'linear-gradient(145deg, #f59e0b 0%, #b45309 100%)',
    accentColor: '#f59e0b',
    gridCols: 2,
    pieces: [
      { id: 1, label: 'Puppy Face', subLabel: 'Ears & Eyes', icon: '🐾', gridRow: 1, gridCol: 1, isPlaced: false, color: 'linear-gradient(135deg, #fbbf24, #d97706)' },
      { id: 2, label: 'Wagging Tail', subLabel: 'Happy Tail', icon: '🐕', gridRow: 1, gridCol: 2, isPlaced: false, color: 'linear-gradient(135deg, #f59e0b, #b45309)' }
    ]
  },

  // 2. 🐱 Playful Kitten
  {
    id: 'kitten',
    name: 'Playful Kitten',
    hindiName: 'Choti Billi',
    category: 'Pets',
    soundKey: 'kitten',
    soundWord: 'Meow Meow!',
    fullEmoji: '🐱',
    bgGrad: 'linear-gradient(145deg, #38bdf8 0%, #0369a1 100%)',
    accentColor: '#38bdf8',
    gridCols: 2,
    pieces: [
      { id: 1, label: 'Cute Whiskers', subLabel: 'Little Ears', icon: '😸', gridRow: 1, gridCol: 1, isPlaced: false, color: 'linear-gradient(135deg, #38bdf8, #0284c7)' },
      { id: 2, label: 'Fluffy Paws', subLabel: 'Soft Tail', icon: '🐾', gridRow: 1, gridCol: 2, isPlaced: false, color: 'linear-gradient(135deg, #0284c7, #0369a1)' }
    ]
  },

  // 3. 🚗 Red Race Car
  {
    id: 'car',
    name: 'Red Race Car',
    hindiName: 'Lal Gaadi',
    category: 'Vehicles',
    soundKey: 'car',
    soundWord: 'Beep Beep!',
    fullEmoji: '🚗',
    bgGrad: 'linear-gradient(145deg, #ef4444 0%, #991b1b 100%)',
    accentColor: '#ef4444',
    gridCols: 2,
    pieces: [
      { id: 1, label: 'Front Engine', subLabel: 'Headlights', icon: '🚘', gridRow: 1, gridCol: 1, isPlaced: false, color: 'linear-gradient(135deg, #f87171, #dc2626)' },
      { id: 2, label: 'Back Wheels', subLabel: 'Speed Spoiler', icon: '🛞', gridRow: 1, gridCol: 2, isPlaced: false, color: 'linear-gradient(135deg, #ef4444, #b91c1c)' }
    ]
  },

  // 4. 🦁 Safari Lion
  {
    id: 'lion',
    name: 'Safari Lion',
    hindiName: 'Jungle Ka Raja',
    category: 'Wild',
    soundKey: 'lion',
    soundWord: 'Roaaar!',
    fullEmoji: '🦁',
    bgGrad: 'linear-gradient(145deg, #f97316 0%, #c2410c 100%)',
    accentColor: '#f97316',
    gridCols: 2,
    pieces: [
      { id: 1, label: 'Crown Ears', subLabel: 'Top Left', icon: '👑', gridRow: 1, gridCol: 1, isPlaced: false, color: 'linear-gradient(135deg, #fb923c, #ea580c)' },
      { id: 2, label: 'Golden Mane', subLabel: 'Top Right', icon: '🌞', gridRow: 1, gridCol: 2, isPlaced: false, color: 'linear-gradient(135deg, #f97316, #c2410c)' },
      { id: 3, label: 'Strong Paws', subLabel: 'Bottom Left', icon: '🐾', gridRow: 2, gridCol: 1, isPlaced: false, color: 'linear-gradient(135deg, #f59e0b, #d97706)' },
      { id: 4, label: 'Swish Tail', subLabel: 'Bottom Right', icon: '🌾', gridRow: 2, gridCol: 2, isPlaced: false, color: 'linear-gradient(135deg, #ea580c, #9a3412)' }
    ]
  },

  // 5. 🚀 Cosmic Rocket
  {
    id: 'rocket',
    name: 'Cosmic Rocket',
    hindiName: 'Antariksh Rocket',
    category: 'Space',
    soundKey: 'rocket',
    soundWord: '3 2 1 Blastoff!',
    fullEmoji: '🚀',
    bgGrad: 'linear-gradient(145deg, #8b5cf6 0%, #5b21b6 100%)',
    accentColor: '#8b5cf6',
    gridCols: 2,
    pieces: [
      { id: 1, label: 'Nosecone', subLabel: 'Top Left', icon: '🔺', gridRow: 1, gridCol: 1, isPlaced: false, color: 'linear-gradient(135deg, #a78bfa, #7c3aed)' },
      { id: 2, label: 'Cockpit Window', subLabel: 'Top Right', icon: '🪟', gridRow: 1, gridCol: 2, isPlaced: false, color: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' },
      { id: 3, label: 'Booster Wing', subLabel: 'Bottom Left', icon: '✈️', gridRow: 2, gridCol: 1, isPlaced: false, color: 'linear-gradient(135deg, #7c3aed, #5b21b6)' },
      { id: 4, label: 'Fire Thruster', subLabel: 'Bottom Right', icon: '🔥', gridRow: 2, gridCol: 2, isPlaced: false, color: 'linear-gradient(135deg, #f97316, #ea580c)' }
    ]
  },

  // 6. 🚂 Choo Choo Train
  {
    id: 'train',
    name: 'Choo Choo Train',
    hindiName: 'Railgaadi',
    category: 'Vehicles',
    soundKey: 'train',
    soundWord: 'Choo Choo!',
    fullEmoji: '🚂',
    bgGrad: 'linear-gradient(145deg, #10b981 0%, #047857 100%)',
    accentColor: '#10b981',
    gridCols: 2,
    pieces: [
      { id: 1, label: 'Steam Chimney', subLabel: 'Top Left', icon: '💨', gridRow: 1, gridCol: 1, isPlaced: false, color: 'linear-gradient(135deg, #34d399, #059669)' },
      { id: 2, label: 'Cabin Bell', subLabel: 'Top Right', icon: '🔔', gridRow: 1, gridCol: 2, isPlaced: false, color: 'linear-gradient(135deg, #10b981, #047857)' },
      { id: 3, label: 'Iron Cowcatcher', subLabel: 'Bottom Left', icon: '🚜', gridRow: 2, gridCol: 1, isPlaced: false, color: 'linear-gradient(135deg, #059669, #065f46)' },
      { id: 4, label: 'Heavy Wheels', subLabel: 'Bottom Right', icon: '⚙️', gridRow: 2, gridCol: 2, isPlaced: false, color: 'linear-gradient(135deg, #047857, #064e3b)' }
    ]
  },

  // 7. 🐘 Gentle Elephant
  {
    id: 'elephant',
    name: 'Gentle Elephant',
    hindiName: 'Pyara Haathi',
    category: 'Wild',
    soundKey: 'elephant',
    soundWord: 'Pawooo!',
    fullEmoji: '🐘',
    bgGrad: 'linear-gradient(145deg, #64748b 0%, #334155 100%)',
    accentColor: '#64748b',
    gridCols: 2,
    pieces: [
      { id: 1, label: 'Big Ears', subLabel: 'Wide Ears', icon: '👂', gridRow: 1, gridCol: 1, isPlaced: false, color: 'linear-gradient(135deg, #94a3b8, #64748b)' },
      { id: 2, label: 'Long Trunk', subLabel: 'Strong Trunk', icon: '🐘', gridRow: 1, gridCol: 2, isPlaced: false, color: 'linear-gradient(135deg, #64748b, #475569)' },
      { id: 3, label: 'Strong Legs', subLabel: 'Big Feet', icon: '🐾', gridRow: 2, gridCol: 1, isPlaced: false, color: 'linear-gradient(135deg, #475569, #334155)' },
      { id: 4, label: 'Little Tail', subLabel: 'Tail Swing', icon: '〰️', gridRow: 2, gridCol: 2, isPlaced: false, color: 'linear-gradient(135deg, #334155, #1e293b)' }
    ]
  },

  // 8. 🐯 Striped Tiger
  {
    id: 'tiger',
    name: 'Striped Tiger',
    hindiName: 'Baagh',
    category: 'Wild',
    soundKey: 'tiger',
    soundWord: 'Grrr! Roar!',
    fullEmoji: '🐯',
    bgGrad: 'linear-gradient(145deg, #f97316 0%, #9a3412 100%)',
    accentColor: '#f97316',
    gridCols: 2,
    pieces: [
      { id: 1, label: 'Tiger Face', subLabel: 'Sharp Eyes', icon: '🐯', gridRow: 1, gridCol: 1, isPlaced: false, color: 'linear-gradient(135deg, #fb923c, #ea580c)' },
      { id: 2, label: 'Black Stripes', subLabel: 'Orange Fur', icon: '〰️', gridRow: 1, gridCol: 2, isPlaced: false, color: 'linear-gradient(135deg, #f97316, #c2410c)' },
      { id: 3, label: 'Powerful Paws', subLabel: 'Strong Legs', icon: '🐾', gridRow: 2, gridCol: 1, isPlaced: false, color: 'linear-gradient(135deg, #ea580c, #9a3412)' },
      { id: 4, label: 'Long Tail', subLabel: 'Striped Tail', icon: '🐅', gridRow: 2, gridCol: 2, isPlaced: false, color: 'linear-gradient(135deg, #c2410c, #7c2d12)' }
    ]
  },

  // 9. 🐒 Funny Monkey
  {
    id: 'monkey',
    name: 'Funny Monkey',
    hindiName: 'Masti Wala Bandar',
    category: 'Wild',
    soundKey: 'monkey',
    soundWord: 'Oo-Oo Aa-Aa!',
    fullEmoji: '🐵',
    bgGrad: 'linear-gradient(145deg, #a855f7 0%, #6b21a8 100%)',
    accentColor: '#a855f7',
    gridCols: 2,
    pieces: [
      { id: 1, label: 'Funny Face', subLabel: 'Big Smile', icon: '🐵', gridRow: 1, gridCol: 1, isPlaced: false, color: 'linear-gradient(135deg, #c084fc, #9333ea)' },
      { id: 2, label: 'Round Ears', subLabel: 'Cute Ears', icon: '👂', gridRow: 1, gridCol: 2, isPlaced: false, color: 'linear-gradient(135deg, #a855f7, #7e22ce)' },
      { id: 3, label: 'Swinging Arms', subLabel: 'Long Arms', icon: '🙌', gridRow: 2, gridCol: 1, isPlaced: false, color: 'linear-gradient(135deg, #9333ea, #6b21a8)' },
      { id: 4, label: 'Curly Tail', subLabel: 'Tree Swinger', icon: '🐒', gridRow: 2, gridCol: 2, isPlaced: false, color: 'linear-gradient(135deg, #7e22ce, #581c87)' }
    ]
  },

  // 10. 🐸 Green Frog
  {
    id: 'frog',
    name: 'Green Frog',
    hindiName: 'Hara Mendhak',
    category: 'Animals',
    soundKey: 'frog',
    soundWord: 'Ribbit Ribbit!',
    fullEmoji: '🐸',
    bgGrad: 'linear-gradient(145deg, #84cc16 0%, #3f6212 100%)',
    accentColor: '#84cc16',
    gridCols: 2,
    pieces: [
      { id: 1, label: 'Big Eyes', subLabel: 'Round Eyes', icon: '👀', gridRow: 1, gridCol: 1, isPlaced: false, color: 'linear-gradient(135deg, #a3e635, #65a30d)' },
      { id: 2, label: 'Wide Smile', subLabel: 'Happy Mouth', icon: '😄', gridRow: 1, gridCol: 2, isPlaced: false, color: 'linear-gradient(135deg, #84cc16, #4d7c0f)' },
      { id: 3, label: 'Jumping Legs', subLabel: 'Strong Legs', icon: '🦵', gridRow: 2, gridCol: 1, isPlaced: false, color: 'linear-gradient(135deg, #65a30d, #3f6212)' },
      { id: 4, label: 'Webbed Feet', subLabel: 'Swim Feet', icon: '🐾', gridRow: 2, gridCol: 2, isPlaced: false, color: 'linear-gradient(135deg, #4d7c0f, #365314)' }
    ]
  },

  // 11. 🦜 Colorful Parrot
  {
    id: 'parrot',
    name: 'Colorful Parrot',
    hindiName: 'Rang Biranga Tota',
    category: 'Birds',
    soundKey: 'parrot',
    soundWord: 'Squawk! Hello!',
    fullEmoji: '🦜',
    bgGrad: 'linear-gradient(145deg, #22c55e 0%, #166534 100%)',
    accentColor: '#22c55e',
    gridCols: 2,
    pieces: [
      { id: 1, label: 'Colorful Head', subLabel: 'Bright Feathers', icon: '🦜', gridRow: 1, gridCol: 1, isPlaced: false, color: 'linear-gradient(135deg, #4ade80, #16a34a)' },
      { id: 2, label: 'Curved Beak', subLabel: 'Strong Beak', icon: '🐦', gridRow: 1, gridCol: 2, isPlaced: false, color: 'linear-gradient(135deg, #22c55e, #15803d)' },
      { id: 3, label: 'Green Wings', subLabel: 'Flying Wings', icon: '🪽', gridRow: 2, gridCol: 1, isPlaced: false, color: 'linear-gradient(135deg, #16a34a, #166534)' },
      { id: 4, label: 'Long Tail', subLabel: 'Bright Tail', icon: '🪶', gridRow: 2, gridCol: 2, isPlaced: false, color: 'linear-gradient(135deg, #15803d, #14532d)' }
    ]
  },

  // 12. 🦚 Beautiful Peacock
  {
    id: 'peacock',
    name: 'Beautiful Peacock',
    hindiName: 'Sundar Mor',
    category: 'Birds',
    soundKey: 'peacock',
    soundWord: 'Kee-ow! Kee-ow!',
    fullEmoji: '🦚',
    bgGrad: 'linear-gradient(145deg, #06b6d4 0%, #1d4ed8 100%)',
    accentColor: '#06b6d4',
    gridCols: 2,
    pieces: [
      { id: 1, label: 'Peacock Head', subLabel: 'Crown Feathers', icon: '🦚', gridRow: 1, gridCol: 1, isPlaced: false, color: 'linear-gradient(135deg, #22d3ee, #0891b2)' },
      { id: 2, label: 'Bright Neck', subLabel: 'Blue Feathers', icon: '💙', gridRow: 1, gridCol: 2, isPlaced: false, color: 'linear-gradient(135deg, #06b6d4, #0284c7)' },
      { id: 3, label: 'Open Wings', subLabel: 'Colorful Feathers', icon: '🪽', gridRow: 2, gridCol: 1, isPlaced: false, color: 'linear-gradient(135deg, #0284c7, #1d4ed8)' },
      { id: 4, label: 'Fan Tail', subLabel: 'Eye Feathers', icon: '🪶', gridRow: 2, gridCol: 2, isPlaced: false, color: 'linear-gradient(135deg, #1d4ed8, #1e3a8a)' }
    ]
  },

  // 13. 🐬 Friendly Dolphin
  {
    id: 'dolphin',
    name: 'Friendly Dolphin',
    hindiName: 'Dolphin',
    category: 'Sea',
    soundKey: 'dolphin',
    soundWord: 'Click Click!',
    fullEmoji: '🐬',
    bgGrad: 'linear-gradient(145deg, #3b82f6 0%, #1e40af 100%)',
    accentColor: '#3b82f6',
    gridCols: 2,
    pieces: [
      { id: 1, label: 'Dolphin Face', subLabel: 'Happy Smile', icon: '🐬', gridRow: 1, gridCol: 1, isPlaced: false, color: 'linear-gradient(135deg, #60a5fa, #2563eb)' },
      { id: 2, label: 'Smooth Body', subLabel: 'Ocean Swimmer', icon: '🌊', gridRow: 1, gridCol: 2, isPlaced: false, color: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' },
      { id: 3, label: 'Side Fins', subLabel: 'Fast Fins', icon: '🪽', gridRow: 2, gridCol: 1, isPlaced: false, color: 'linear-gradient(135deg, #2563eb, #1e40af)' },
      { id: 4, label: 'Curved Tail', subLabel: 'Powerful Tail', icon: '🐟', gridRow: 2, gridCol: 2, isPlaced: false, color: 'linear-gradient(135deg, #1d4ed8, #1e3a8a)' }
    ]
  },

  // 14. 🦋 Colorful Butterfly
  {
    id: 'butterfly',
    name: 'Colorful Butterfly',
    hindiName: 'Rang Birangi Titli',
    category: 'Insects',
    soundKey: 'butterfly',
    soundWord: 'Flutter Flutter!',
    fullEmoji: '🦋',
    bgGrad: 'linear-gradient(145deg, #ec4899 0%, #9d174d 100%)',
    accentColor: '#ec4899',
    gridCols: 2,
    pieces: [
      { id: 1, label: 'Left Wing', subLabel: 'Colorful Wing', icon: '🪽', gridRow: 1, gridCol: 1, isPlaced: false, color: 'linear-gradient(135deg, #f472b6, #db2777)' },
      { id: 2, label: 'Right Wing', subLabel: 'Bright Wing', icon: '🪽', gridRow: 1, gridCol: 2, isPlaced: false, color: 'linear-gradient(135deg, #ec4899, #be185d)' },
      { id: 3, label: 'Tiny Body', subLabel: 'Little Body', icon: '🐛', gridRow: 2, gridCol: 1, isPlaced: false, color: 'linear-gradient(135deg, #db2777, #9d174d)' },
      { id: 4, label: 'Tiny Antennae', subLabel: 'Feelers', icon: '〰️', gridRow: 2, gridCol: 2, isPlaced: false, color: 'linear-gradient(135deg, #be185d, #831843)' }
    ]
  },

  // 15. 🐠 Little Fish
  {
    id: 'fish',
    name: 'Little Fish',
    hindiName: 'Choti Machhli',
    category: 'Sea',
    soundKey: 'fish',
    soundWord: 'Blub Blub!',
    fullEmoji: '🐟',
    bgGrad: 'linear-gradient(145deg, #06b6d4 0%, #155e75 100%)',
    accentColor: '#06b6d4',
    gridCols: 2,
    pieces: [
      { id: 1, label: 'Fish Head', subLabel: 'Bright Eye', icon: '🐟', gridRow: 1, gridCol: 1, isPlaced: false, color: 'linear-gradient(135deg, #22d3ee, #0891b2)' },
      { id: 2, label: 'Shiny Scales', subLabel: 'Little Scales', icon: '✨', gridRow: 1, gridCol: 2, isPlaced: false, color: 'linear-gradient(135deg, #06b6d4, #0e7490)' },
      { id: 3, label: 'Side Fin', subLabel: 'Swimming Fin', icon: '🪽', gridRow: 2, gridCol: 1, isPlaced: false, color: 'linear-gradient(135deg, #0891b2, #155e75)' },
      { id: 4, label: 'Fish Tail', subLabel: 'Fast Tail', icon: '🐠', gridRow: 2, gridCol: 2, isPlaced: false, color: 'linear-gradient(135deg, #0e7490, #164e63)' }
    ]
  },

  // 16. 🚌 School Bus
  {
    id: 'bus',
    name: 'School Bus',
    hindiName: 'School Bus',
    category: 'Vehicles',
    soundKey: 'bus',
    soundWord: 'Honk Honk!',
    fullEmoji: '🚌',
    bgGrad: 'linear-gradient(145deg, #facc15 0%, #a16207 100%)',
    accentColor: '#facc15',
    gridCols: 2,
    pieces: [
      { id: 1, label: 'Front Window', subLabel: 'Driver Seat', icon: '🪟', gridRow: 1, gridCol: 1, isPlaced: false, color: 'linear-gradient(135deg, #fde047, #eab308)' },
      { id: 2, label: 'Passenger Windows', subLabel: 'Big Windows', icon: '🚌', gridRow: 1, gridCol: 2, isPlaced: false, color: 'linear-gradient(135deg, #facc15, #ca8a04)' },
      { id: 3, label: 'Yellow Body', subLabel: 'Bright Bus', icon: '🟨', gridRow: 2, gridCol: 1, isPlaced: false, color: 'linear-gradient(135deg, #eab308, #a16207)' },
      { id: 4, label: 'Big Wheels', subLabel: 'Rolling Wheels', icon: '🛞', gridRow: 2, gridCol: 2, isPlaced: false, color: 'linear-gradient(135deg, #ca8a04, #854d0e)' }
    ]
  },

  // 17. 🚜 Friendly Tractor
  {
    id: 'tractor',
    name: 'Friendly Tractor',
    hindiName: 'Tractor',
    category: 'Vehicles',
    soundKey: 'tractor',
    soundWord: 'Put Put! Vroom!',
    fullEmoji: '🚜',
    bgGrad: 'linear-gradient(145deg, #16a34a 0%, #166534 100%)',
    accentColor: '#16a34a',
    gridCols: 2,
    pieces: [
      { id: 1, label: 'Driver Cabin', subLabel: 'Top Cabin', icon: '🚜', gridRow: 1, gridCol: 1, isPlaced: false, color: 'linear-gradient(135deg, #4ade80, #16a34a)' },
      { id: 2, label: 'Big Rear Wheel', subLabel: 'Power Wheel', icon: '⚙️', gridRow: 1, gridCol: 2, isPlaced: false, color: 'linear-gradient(135deg, #22c55e, #15803d)' },
      { id: 3, label: 'Front Wheel', subLabel: 'Small Wheel', icon: '🛞', gridRow: 2, gridCol: 1, isPlaced: false, color: 'linear-gradient(135deg, #16a34a, #166534)' },
      { id: 4, label: 'Farm Plow', subLabel: 'Field Tool', icon: '🪴', gridRow: 2, gridCol: 2, isPlaced: false, color: 'linear-gradient(135deg, #15803d, #14532d)' }
    ]
  },

  // 18. 🍎 Juicy Apple
  {
    id: 'apple',
    name: 'Juicy Apple',
    hindiName: 'Laal Seb',
    category: 'Fruits',
    soundKey: 'apple',
    soundWord: 'Crunch Crunch!',
    fullEmoji: '🍎',
    bgGrad: 'linear-gradient(145deg, #ef4444 0%, #991b1b 100%)',
    accentColor: '#ef4444',
    gridCols: 2,
    pieces: [
      { id: 1, label: 'Apple Top', subLabel: 'Leaf & Stem', icon: '🍃', gridRow: 1, gridCol: 1, isPlaced: false, color: 'linear-gradient(135deg, #f87171, #dc2626)' },
      { id: 2, label: 'Red Skin', subLabel: 'Shiny Apple', icon: '🍎', gridRow: 1, gridCol: 2, isPlaced: false, color: 'linear-gradient(135deg, #ef4444, #b91c1c)' },
      { id: 3, label: 'Juicy Middle', subLabel: 'Sweet Fruit', icon: '❤️', gridRow: 2, gridCol: 1, isPlaced: false, color: 'linear-gradient(135deg, #dc2626, #991b1b)' },
      { id: 4, label: 'Apple Seeds', subLabel: 'Tiny Seeds', icon: '🌱', gridRow: 2, gridCol: 2, isPlaced: false, color: 'linear-gradient(135deg, #b91c1c, #7f1d1d)' }
    ]
  },

  // 19. 🍌 Yellow Banana
  {
    id: 'banana',
    name: 'Yellow Banana',
    hindiName: 'Peela Kela',
    category: 'Fruits',
    soundKey: 'banana',
    soundWord: 'Peel Peel!',
    fullEmoji: '🍌',
    bgGrad: 'linear-gradient(145deg, #facc15 0%, #a16207 100%)',
    accentColor: '#facc15',
    gridCols: 2,
    pieces: [
      { id: 1, label: 'Banana Tip', subLabel: 'Top End', icon: '🍌', gridRow: 1, gridCol: 1, isPlaced: false, color: 'linear-gradient(135deg, #fde047, #eab308)' },
      { id: 2, label: 'Curved Peel', subLabel: 'Yellow Skin', icon: '🌙', gridRow: 1, gridCol: 2, isPlaced: false, color: 'linear-gradient(135deg, #facc15, #ca8a04)' },
      { id: 3, label: 'Sweet Fruit', subLabel: 'Soft Inside', icon: '🍌', gridRow: 2, gridCol: 1, isPlaced: false, color: 'linear-gradient(135deg, #eab308, #a16207)' },
      { id: 4, label: 'Banana Peel', subLabel: 'Easy to Peel', icon: '🟨', gridRow: 2, gridCol: 2, isPlaced: false, color: 'linear-gradient(135deg, #ca8a04, #854d0e)' }
    ]
  },

  // 20. 🍕 Yummy Pizza
  {
    id: 'pizza',
    name: 'Yummy Pizza',
    hindiName: 'Pizza',
    category: 'Food',
    soundKey: 'pizza',
    soundWord: 'Mmm! Yum Yum!',
    fullEmoji: '🍕',
    bgGrad: 'linear-gradient(145deg, #f97316 0%, #9a3412 100%)',
    accentColor: '#f97316',
    gridCols: 2,
    pieces: [
      { id: 1, label: 'Cheesy Top', subLabel: 'Melted Cheese', icon: '🧀', gridRow: 1, gridCol: 1, isPlaced: false, color: 'linear-gradient(135deg, #fb923c, #ea580c)' },
      { id: 2, label: 'Tasty Toppings', subLabel: 'Veggies & Sauce', icon: '🍅', gridRow: 1, gridCol: 2, isPlaced: false, color: 'linear-gradient(135deg, #f97316, #c2410c)' },
      { id: 3, label: 'Crispy Crust', subLabel: 'Golden Crust', icon: '🥖', gridRow: 2, gridCol: 1, isPlaced: false, color: 'linear-gradient(135deg, #ea580c, #9a3412)' },
      { id: 4, label: 'Pizza Slice', subLabel: 'Ready to Eat', icon: '🍕', gridRow: 2, gridCol: 2, isPlaced: false, color: 'linear-gradient(135deg, #c2410c, #7c2d12)' }
    ]
  },

  // 21. 🌈 Rainbow
  {
    id: 'rainbow',
    name: 'Beautiful Rainbow',
    hindiName: 'Indradhanush',
    category: 'Nature',
    soundKey: 'rainbow',
    soundWord: 'Wow! So Colorful!',
    fullEmoji: '🌈',
    bgGrad: 'linear-gradient(145deg, #06b6d4 0%, #7c3aed 100%)',
    accentColor: '#8b5cf6',
    gridCols: 2,
    pieces: [
      { id: 1, label: 'Red Arc', subLabel: 'Bright Red', icon: '🔴', gridRow: 1, gridCol: 1, isPlaced: false, color: 'linear-gradient(135deg, #f87171, #dc2626)' },
      { id: 2, label: 'Yellow Arc', subLabel: 'Sunny Yellow', icon: '🟡', gridRow: 1, gridCol: 2, isPlaced: false, color: 'linear-gradient(135deg, #fde047, #eab308)' },
      { id: 3, label: 'Green Arc', subLabel: 'Fresh Green', icon: '🟢', gridRow: 2, gridCol: 1, isPlaced: false, color: 'linear-gradient(135deg, #4ade80, #16a34a)' },
      { id: 4, label: 'Blue Arc', subLabel: 'Sky Blue', icon: '🔵', gridRow: 2, gridCol: 2, isPlaced: false, color: 'linear-gradient(135deg, #60a5fa, #2563eb)' }
    ]
  },

  // 22. 🌞 Bright Sun
  {
    id: 'sun',
    name: 'Bright Sun',
    hindiName: 'Chamkta Suraj',
    category: 'Nature',
    soundKey: 'sun',
    soundWord: 'Shine Shine!',
    fullEmoji: '☀️',
    bgGrad: 'linear-gradient(145deg, #facc15 0%, #ea580c 100%)',
    accentColor: '#facc15',
    gridCols: 2,
    pieces: [
      { id: 1, label: 'Sun Face', subLabel: 'Happy Face', icon: '😊', gridRow: 1, gridCol: 1, isPlaced: false, color: 'linear-gradient(135deg, #fde047, #facc15)' },
      { id: 2, label: 'Bright Rays', subLabel: 'Warm Light', icon: '☀️', gridRow: 1, gridCol: 2, isPlaced: false, color: 'linear-gradient(135deg, #facc15, #eab308)' },
      { id: 3, label: 'Golden Glow', subLabel: 'Sunny Light', icon: '✨', gridRow: 2, gridCol: 1, isPlaced: false, color: 'linear-gradient(135deg, #eab308, #d97706)' },
      { id: 4, label: 'Warm Sky', subLabel: 'Blue Sky', icon: '🌤️', gridRow: 2, gridCol: 2, isPlaced: false, color: 'linear-gradient(135deg, #f59e0b, #ea580c)' }
    ]
  },

  // 23. 🌙 Sleepy Moon
  {
    id: 'moon',
    name: 'Sleepy Moon',
    hindiName: 'Chand',
    category: 'Space',
    soundKey: 'moon',
    soundWord: 'Twinkle Twinkle!',
    fullEmoji: '🌙',
    bgGrad: 'linear-gradient(145deg, #6366f1 0%, #312e81 100%)',
    accentColor: '#6366f1',
    gridCols: 2,
    pieces: [
      { id: 1, label: 'Moon Face', subLabel: 'Sleepy Smile', icon: '🌙', gridRow: 1, gridCol: 1, isPlaced: false, color: 'linear-gradient(135deg, #818cf8, #4f46e5)' },
      { id: 2, label: 'Moon Glow', subLabel: 'Silver Light', icon: '✨', gridRow: 1, gridCol: 2, isPlaced: false, color: 'linear-gradient(135deg, #6366f1, #4338ca)' },
      { id: 3, label: 'Night Sky', subLabel: 'Dark Sky', icon: '🌌', gridRow: 2, gridCol: 1, isPlaced: false, color: 'linear-gradient(135deg, #4f46e5, #312e81)' },
      { id: 4, label: 'Little Stars', subLabel: 'Twinkling Stars', icon: '⭐', gridRow: 2, gridCol: 2, isPlaced: false, color: 'linear-gradient(135deg, #4338ca, #1e1b4b)' }
    ]
  },

  // 24. 🥁 Big Drum
  {
    id: 'drum',
    name: 'Big Drum',
    hindiName: 'Dhol',
    category: 'Music',
    soundKey: 'drum',
    soundWord: 'Boom Boom!',
    fullEmoji: '🥁',
    bgGrad: 'linear-gradient(145deg, #ef4444 0%, #991b1b 100%)',
    accentColor: '#ef4444',
    gridCols: 2,
    pieces: [
      { id: 1, label: 'Drum Head', subLabel: 'Top Surface', icon: '🥁', gridRow: 1, gridCol: 1, isPlaced: false, color: 'linear-gradient(135deg, #f87171, #dc2626)' },
      { id: 2, label: 'Drum Sticks', subLabel: 'Tap Tap', icon: '🥢', gridRow: 1, gridCol: 2, isPlaced: false, color: 'linear-gradient(135deg, #ef4444, #b91c1c)' },
      { id: 3, label: 'Drum Body', subLabel: 'Round Body', icon: '🔴', gridRow: 2, gridCol: 1, isPlaced: false, color: 'linear-gradient(135deg, #dc2626, #991b1b)' },
      { id: 4, label: 'Loud Beat', subLabel: 'Boom Sound', icon: '💥', gridRow: 2, gridCol: 2, isPlaced: false, color: 'linear-gradient(135deg, #b91c1c, #7f1d1d)' }
    ]
  },

  // 25. 🏠 Cozy House
  {
    id: 'house',
    name: 'Cozy House',
    hindiName: 'Pyara Ghar',
    category: 'Home',
    soundKey: 'door',
    soundWord: 'Knock Knock!',
    fullEmoji: '🏠',
    bgGrad: 'linear-gradient(145deg, #f59e0b 0%, #92400e 100%)',
    accentColor: '#f59e0b',
    gridCols: 2,
    pieces: [
      { id: 1, label: 'Red Roof', subLabel: 'Triangle Roof', icon: '🔺', gridRow: 1, gridCol: 1, isPlaced: false, color: 'linear-gradient(135deg, #fb923c, #ea580c)' },
      { id: 2, label: 'Bright Window', subLabel: 'Sunny Window', icon: '🪟', gridRow: 1, gridCol: 2, isPlaced: false, color: 'linear-gradient(135deg, #fbbf24, #d97706)' },
      { id: 3, label: 'Front Door', subLabel: 'Knock Knock', icon: '🚪', gridRow: 2, gridCol: 1, isPlaced: false, color: 'linear-gradient(135deg, #d97706, #92400e)' },
      { id: 4, label: 'Green Garden', subLabel: 'Flowers & Grass', icon: '🌳', gridRow: 2, gridCol: 2, isPlaced: false, color: 'linear-gradient(135deg, #22c55e, #15803d)' }
    ]
  },

  // 26. 🐼 Cute Panda
  {
    id: 'panda',
    name: 'Cute Panda',
    hindiName: 'Pyara Panda',
    category: 'Animals',
    soundKey: 'panda',
    soundWord: 'Growl Growl!',
    fullEmoji: '🐼',
    bgGrad: 'linear-gradient(145deg, #475569 0%, #1e293b 100%)',
    accentColor: '#64748b',
    gridCols: 2,
    pieces: [
      { id: 1, label: 'Round Ears', subLabel: 'Black Ears', icon: '🐼', gridRow: 1, gridCol: 1, isPlaced: false, color: 'linear-gradient(135deg, #64748b, #334155)' },
      { id: 2, label: 'Cute Eyes', subLabel: 'Black Eye Patches', icon: '👀', gridRow: 1, gridCol: 2, isPlaced: false, color: 'linear-gradient(135deg, #475569, #1e293b)' },
      { id: 3, label: 'Fluffy Body', subLabel: 'Black & White', icon: '🐼', gridRow: 2, gridCol: 1, isPlaced: false, color: 'linear-gradient(135deg, #334155, #1e293b)' },
      { id: 4, label: 'Bamboo Snack', subLabel: 'Yummy Bamboo', icon: '🎋', gridRow: 2, gridCol: 2, isPlaced: false, color: 'linear-gradient(135deg, #22c55e, #166534)' }
    ]
  },

  // 27. 🦒 Tall Giraffe
  {
    id: 'giraffe',
    name: 'Tall Giraffe',
    hindiName: 'Lambi Jiraf',
    category: 'Wild',
    soundKey: 'giraffe',
    soundWord: 'Hum Hum!',
    fullEmoji: '🦒',
    bgGrad: 'linear-gradient(145deg, #eab308 0%, #92400e 100%)',
    accentColor: '#eab308',
    gridCols: 2,
    pieces: [
      { id: 1, label: 'Long Neck', subLabel: 'Very Tall', icon: '🦒', gridRow: 1, gridCol: 1, isPlaced: false, color: 'linear-gradient(135deg, #facc15, #ca8a04)' },
      { id: 2, label: 'Funny Horns', subLabel: 'Little Horns', icon: '🦌', gridRow: 1, gridCol: 2, isPlaced: false, color: 'linear-gradient(135deg, #eab308, #a16207)' },
      { id: 3, label: 'Brown Spots', subLabel: 'Pretty Pattern', icon: '🟤', gridRow: 2, gridCol: 1, isPlaced: false, color: 'linear-gradient(135deg, #d97706, #92400e)' },
      { id: 4, label: 'Long Legs', subLabel: 'Tall Legs', icon: '🦵', gridRow: 2, gridCol: 2, isPlaced: false, color: 'linear-gradient(135deg, #a16207, #713f12)' }
    ]
  },

  // 28. 🐢 Slow Turtle
  {
    id: 'turtle',
    name: 'Slow Turtle',
    hindiName: 'Kachhua',
    category: 'Animals',
    soundKey: 'turtle',
    soundWord: 'Slow Slow!',
    fullEmoji: '🐢',
    bgGrad: 'linear-gradient(145deg, #22c55e 0%, #14532d 100%)',
    accentColor: '#22c55e',
    gridCols: 2,
    pieces: [
      { id: 1, label: 'Turtle Head', subLabel: 'Little Head', icon: '🐢', gridRow: 1, gridCol: 1, isPlaced: false, color: 'linear-gradient(135deg, #4ade80, #16a34a)' },
      { id: 2, label: 'Hard Shell', subLabel: 'Strong Shell', icon: '🛡️', gridRow: 1, gridCol: 2, isPlaced: false, color: 'linear-gradient(135deg, #22c55e, #15803d)' },
      { id: 3, label: 'Tiny Feet', subLabel: 'Four Feet', icon: '🐾', gridRow: 2, gridCol: 1, isPlaced: false, color: 'linear-gradient(135deg, #16a34a, #166534)' },
      { id: 4, label: 'Small Tail', subLabel: 'Little Tail', icon: '〰️', gridRow: 2, gridCol: 2, isPlaced: false, color: 'linear-gradient(135deg, #15803d, #14532d)' }
    ]
  },

  // 29. 🐙 Friendly Octopus
  {
    id: 'octopus',
    name: 'Friendly Octopus',
    hindiName: 'Aath Baanhon Wala',
    category: 'Sea',
    soundKey: 'octopus',
    soundWord: 'Blub Blub!',
    fullEmoji: '🐙',
    bgGrad: 'linear-gradient(145deg, #e11d48 0%, #881337 100%)',
    accentColor: '#e11d48',
    gridCols: 2,
    pieces: [
      { id: 1, label: 'Big Eyes', subLabel: 'Cute Eyes', icon: '👀', gridRow: 1, gridCol: 1, isPlaced: false, color: 'linear-gradient(135deg, #fb7185, #e11d48)' },
      { id: 2, label: 'Round Head', subLabel: 'Soft Head', icon: '🐙', gridRow: 1, gridCol: 2, isPlaced: false, color: 'linear-gradient(135deg, #f43f5e, #be123c)' },
      { id: 3, label: 'Four Arms', subLabel: 'Wiggly Arms', icon: '🫶', gridRow: 2, gridCol: 1, isPlaced: false, color: 'linear-gradient(135deg, #e11d48, #9f1239)' },
      { id: 4, label: 'Four More Arms', subLabel: 'Eight Arms', icon: '🐙', gridRow: 2, gridCol: 2, isPlaced: false, color: 'linear-gradient(135deg, #be123c, #881337)' }
    ]
  },

  // 30. 🎈 Colorful Balloon
  {
    id: 'balloon',
    name: 'Colorful Balloon',
    hindiName: 'Rang Biranga Gubbara',
    category: 'Fun',
    soundKey: 'balloon',
    soundWord: 'Pop!',
    fullEmoji: '🎈',
    bgGrad: 'linear-gradient(145deg, #ec4899 0%, #9d174d 100%)',
    accentColor: '#ec4899',
    gridCols: 2,
    pieces: [
      { id: 1, label: 'Balloon Top', subLabel: 'Round Top', icon: '🎈', gridRow: 1, gridCol: 1, isPlaced: false, color: 'linear-gradient(135deg, #f472b6, #db2777)' },
      { id: 2, label: 'Bright Color', subLabel: 'Shiny Surface', icon: '✨', gridRow: 1, gridCol: 2, isPlaced: false, color: 'linear-gradient(135deg, #ec4899, #be185d)' },
      { id: 3, label: 'Long String', subLabel: 'Thin String', icon: '〰️', gridRow: 2, gridCol: 1, isPlaced: false, color: 'linear-gradient(135deg, #db2777, #9d174d)' },
      { id: 4, label: 'Tiny Knot', subLabel: 'Bottom Knot', icon: '🎀', gridRow: 2, gridCol: 2, isPlaced: false, color: 'linear-gradient(135deg, #be185d, #831843)' }
    ]
  }
];

  readonly currentPuzzle = signal<JigsawPuzzle>(this.puzzles[0]);

  readonly isAllSnapped = signal<boolean>(false);

  constructor(
    public appNav: AppNavService,
    public sound: SoundService,
    private speech: SpeechService,
    private confetti: ConfettiService
  ) {}

  ngOnInit(): void {
    this.loadPuzzle(0);
  }

  ngOnDestroy(): void {
    if (this.demoTimer) clearTimeout(this.demoTimer);
  }

  loadPuzzle(idx: number): void {
    this.currentIdx.set(idx);
    const template = this.puzzles[idx];
    
    // Reset pieces
    template.pieces.forEach(p => p.isPlaced = false);
    this.currentPuzzle.set({ ...template, pieces: template.pieces.map(p => ({ ...p, isPlaced: false })) });
    this.isAllSnapped.set(false);
    this.selectedPiece.set(null);
    this.draggingPiece.set(null);

    // Speak introduction
    setTimeout(() => {
      this.speech.speak(`Let us build the ${template.name}! Snap the pieces!`);
      this.scheduleDemoHand();
    }, 350);
  }

  scheduleDemoHand(): void {
    if (this.demoTimer) clearTimeout(this.demoTimer);
    this.showDemoHand = false;

    this.demoTimer = setTimeout(() => {
      if (this.isAllSnapped()) return;
      const unplaced = this.currentPuzzle().pieces.find(p => !p.isPlaced);
      if (!unplaced) return;

      const pieceEl = document.querySelector(`.piece-btn-wrap[data-id="${unplaced.id}"]`);
      const slotEl = document.querySelector(`.puzzle-slot[data-id="${unplaced.id}"]`);

      if (pieceEl && slotEl) {
        const pRect = pieceEl.getBoundingClientRect();
        const sRect = slotEl.getBoundingClientRect();
        this.demoSource = { x: pRect.left + pRect.width / 2, y: pRect.top + pRect.height / 2 };
        this.demoTarget = { x: sRect.left + sRect.width / 2, y: sRect.top + sRect.height / 2 };
        this.showDemoHand = true;
      }
    }, 2400);
  }

  onUserInteract(): void {
    this.showDemoHand = false;
    if (this.demoTimer) clearTimeout(this.demoTimer);
  }

  onMascotTap(): void {
    this.sound.playGiggle();
    this.isMascotJumping.set(true);
    setTimeout(() => this.isMascotJumping.set(false), 700);

    if (this.selectedPiece()) {
      this.speech.speak(`Snap the ${this.selectedPiece()?.label} into its socket!`);
    } else {
      this.speech.speak(`Build the ${this.currentPuzzle().name}! Tap any piece!`);
    }
  }

  /**
   * Pointer Down on piece in tray (Tap or Drag)
   */
  onPiecePointerDown(piece: PuzzlePieceItem, event: PointerEvent): void {
    this.onUserInteract();

    this.selectedPiece.set(piece);
    this.sound.playTap();
    this.speech.speak(piece.label);

    this.draggingPiece.set(piece);
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    this.dragCurrX = event.clientX;
    this.dragCurrY = event.clientY;

    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  @HostListener('window:pointermove', ['$event'])
  onPointerMove(event: PointerEvent): void {
    if (!this.draggingPiece()) return;
    this.dragCurrX = event.clientX;
    this.dragCurrY = event.clientY;
  }

  @HostListener('window:pointerup', ['$event'])
  onPointerUp(event: PointerEvent): void {
    if (!this.draggingPiece()) return;

    const piece = this.draggingPiece()!;
    const distance = Math.hypot(this.dragCurrX - this.dragStartX, this.dragCurrY - this.dragStartY);
    this.draggingPiece.set(null);

    // If small tap move, keep selected
    if (distance < 12) {
      return;
    }

    // Check if released near matching socket
    const matchingSlot = document.querySelector(`.puzzle-slot[data-id="${piece.id}"]`);
    if (matchingSlot) {
      const rect = matchingSlot.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dist = Math.hypot(event.clientX - centerX, event.clientY - centerY);

      if (dist < 90) {
        this.snapPieceIntoPlace(piece, centerX, centerY);
        return;
      }
    }

    // Dropped outside: gentle boing
    this.sound.playBoing();
  }

  /**
   * Tap on target puzzle socket
   */
  onSlotClick(piece: PuzzlePieceItem): void {
    this.onUserInteract();

    if (piece.isPlaced) {
      this.sound.playTap();
      this.speech.speak(piece.label);
      return;
    }

    // If matching piece is selected
    if (this.selectedPiece()?.id === piece.id) {
      const slot = document.querySelector(`.puzzle-slot[data-id="${piece.id}"]`);
      if (slot) {
        const r = slot.getBoundingClientRect();
        this.snapPieceIntoPlace(this.selectedPiece()!, r.left + r.width / 2, r.top + r.height / 2);
      } else {
        this.snapPieceIntoPlace(this.selectedPiece()!);
      }
      return;
    }

    // Otherwise select the piece from tray automatically
    const targetPiece = this.currentPuzzle().pieces.find(p => p.id === piece.id && !p.isPlaced);
    if (targetPiece) {
      this.selectedPiece.set(targetPiece);
      this.sound.playTap();
      this.speech.speak(`Find the ${targetPiece.label}!`);
    } else {
      this.sound.playBoing();
    }
  }

  snapPieceIntoPlace(piece: PuzzlePieceItem, x?: number, y?: number): void {
    piece.isPlaced = true;
    this.selectedPiece.set(null);

    // Crisp magnetic jigsaw snap sound!
    this.sound.playSnap();

    // Trigger star burst
    if (x && y) {
      this.triggerStarBurst(x, y);
    } else {
      const slot = document.querySelector(`.puzzle-slot[data-id="${piece.id}"]`);
      if (slot) {
        const r = slot.getBoundingClientRect();
        this.triggerStarBurst(r.left + r.width / 2, r.top + r.height / 2);
      }
    }

    this.speech.speak(`Snapped! ${piece.label}!`);

    // Check if whole puzzle is assembled
    const allPlaced = this.currentPuzzle().pieces.every(p => p.isPlaced);
    if (allPlaced) {
      this.isAllSnapped.set(true);

      setTimeout(() => {
        // Play real procedural animal/vehicle sound!
        this.sound.playItemSound(this.currentPuzzle().soundKey);
        this.sound.playSuccess();
        this.confetti.fire();

        setTimeout(() => {
          this.speech.speak(`Hooray! You built the ${this.currentPuzzle().name}! ${this.currentPuzzle().soundWord}`);
        }, 600);
      }, 400);
    } else {
      this.scheduleDemoHand();
    }
  }

  replayCharacterSound(): void {
    this.sound.playItemSound(this.currentPuzzle().soundKey);
    this.speech.speak(`${this.currentPuzzle().name}! ${this.currentPuzzle().soundWord}`);
  }

  triggerStarBurst(x: number, y: number): void {
    const starId = this.starCounter++;
    this.activeStars.push({ id: starId, x, y });
    setTimeout(() => {
      this.activeStars = this.activeStars.filter(s => s.id !== starId);
    }, 700);
  }

  getDraggingTransform(piece: PuzzlePieceItem): string {
    if (this.draggingPiece()?.id !== piece.id) return '';
    const dx = this.dragCurrX - this.dragStartX;
    const dy = this.dragCurrY - this.dragStartY;
    return `translate3d(${dx}px, ${dy}px, 0) scale(1.15)`;
  }

  nextPuzzle(): void {
    this.sound.playTap();
    const nextIdx = (this.currentIdx() + 1) % this.puzzles.length;
    this.loadPuzzle(nextIdx);
  }
}

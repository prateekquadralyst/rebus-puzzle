import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppNavService } from '../../core/services/app-nav.service';
import { SoundService } from '../../core/services/sound.service';
import { SpeechService } from '../../core/services/speech.service';
import { ConfettiService } from '../../core/services/confetti.service';

export interface ShapeItem {
  id: string;
  name: string;
  hindiName: string;
  type: 'circle' | 'square' | 'triangle' | 'star' | 'heart' | 'diamond' | 'moon' | 'flower';
  color: string;
  glow: string;
  placed: boolean;
  isFlying?: boolean;
}

interface StarBurst {
  id: number;
  x: number;
  y: number;
  color: string;
}

@Component({
  selector: 'app-shape-sorter',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="game-viewport" (pointerdown)="onUserInteract()">
      <!-- SVG Defs for Beautiful Gradients -->
      <svg width="0" height="0" class="svg-defs">
        <defs>
          <linearGradient id="grad-circle" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fde047" />
            <stop offset="100%" stop-color="#f59e0b" />
          </linearGradient>
          <linearGradient id="grad-square" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#38bdf8" />
            <stop offset="100%" stop-color="#0284c7" />
          </linearGradient>
          <linearGradient id="grad-triangle" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fb7185" />
            <stop offset="100%" stop-color="#e11d48" />
          </linearGradient>
          <linearGradient id="grad-star" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fef08a" />
            <stop offset="100%" stop-color="#eab308" />
          </linearGradient>
          <linearGradient id="grad-heart" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#f472b6" />
            <stop offset="100%" stop-color="#db2777" />
          </linearGradient>
          <linearGradient id="grad-diamond" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#2dd4bf" />
            <stop offset="100%" stop-color="#0d9488" />
          </linearGradient>
          <linearGradient id="grad-moon" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#c084fc" />
            <stop offset="100%" stop-color="#7c3aed" />
          </linearGradient>
          <linearGradient id="grad-flower" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fb923c" />
            <stop offset="100%" stop-color="#ea580c" />
          </linearGradient>
        </defs>
      </svg>

      <!-- Top Header -->
      <header class="game-header">
        <button 
          type="button" 
          (click)="appNav.goToHub()" 
          class="hub-return-btn"
          title="Return to Toddler Hub">
          <span>🏰 Hub</span>
        </button>

        <!-- Level & Stars Indicator -->
        <div class="level-indicator">
          <span class="game-tag">🔶 SHAPE PUZZLE</span>
          <div class="stars-row">
            <span class="star-icon" [class.earned]="level >= 1">⭐</span>
            <span class="star-icon" [class.earned]="level >= 2">⭐</span>
            <span class="star-icon" [class.earned]="level >= 3">⭐</span>
          </div>
        </div>

        <div class="header-actions">
          <button 
            type="button" 
            (click)="replayPrompt()" 
            class="action-circle-btn sound-prompt-btn"
            title="Repeat instruction">
            <span>📢</span>
          </button>
          <button 
            type="button" 
            (click)="sound.toggleMute()" 
            class="action-circle-btn mute-btn"
            [title]="sound.isMuted() ? 'Turn Sound On' : 'Turn Sound Off'">
            {{ sound.isMuted() ? '🔇' : '🎵' }}
          </button>
        </div>
      </header>

      <!-- Main Playfield -->
      <main class="sorter-stage" #stageContainer>
        <!-- Mascot Cheerleader & Spoken Hint -->
        <div class="mascot-banner animate-pop" (click)="onMascotTap()">
          <div class="mascot-avatar" [class.mascot-bouncing]="isMascotCheering">
            <span>🧸</span>
          </div>
          <div class="mascot-speech">
            @if (isAllPlaced) {
              <span class="speech-highlight">🎉 WONDERFUL! You matched them all!</span>
            } @else if (selectedShape) {
              <span class="speech-highlight">👉 Put {{ selectedShape.name }} into its matching slot!</span>
            } @else {
              <span>Tap or drag any shape into its matching home! 👇</span>
            }
          </div>
        </div>

        <!-- Target Cutouts Rack (Wooden Puzzle Board) -->
        <div class="cutouts-board">
          <div class="board-header">
            <span class="board-label">🎯 SHAPE HOMES (Sahi Jagah Match Karo)</span>
          </div>

          <div class="cutouts-rack">
            @for (shape of currentShapes; track shape.id; let i = $index) {
              <div 
                #cutoutElem
                class="cutout-slot"
                [attr.data-id]="shape.id"
                [class.slot-filled]="shape.placed"
                [class.is-target]="selectedShape?.id === shape.id && !shape.placed"
                [style.--shape-color]="shape.color"
                [style.--shape-glow]="shape.glow"
                (click)="onSlotClick(shape)">

                <!-- Target Pointer Arrow when selected -->
                @if (selectedShape?.id === shape.id && !shape.placed) {
                  <div class="target-pointer-arrow animate-bounce">
                    <span class="arrow-icon">⬇️</span>
                    <span class="arrow-text">HERE!</span>
                  </div>
                }

                @if (shape.placed) {
                  <!-- Placed Living Shape Character -->
                  <div class="slotted-shape animate-pop">
                    <ng-container [ngTemplateOutlet]="shapeSvgTemplate" [ngTemplateOutletContext]="{ type: shape.type, isPlaced: true }"></ng-container>
                    <span class="shape-title">{{ shape.name }}</span>
                    <span class="placed-check-badge">✓</span>
                  </div>
                } @else {
                  <!-- Darkened Recessed Silhouette -->
                  <div class="cutout-silhouette">
                    <ng-container [ngTemplateOutlet]="shapeSvgTemplate" [ngTemplateOutletContext]="{ type: shape.type, isPlaced: false }"></ng-container>
                    <span class="silhouette-title">{{ shape.name }}</span>
                  </div>
                }
              </div>
            }
          </div>
        </div>

        <!-- Available Shapes Toy Tray (Bottom) -->
        <div class="tray-section">
          <div class="tray-title-row">
            <span class="tray-title">🎨 PICK A SHAPE (Chuno aur Rakho)</span>
          </div>

          <div class="shapes-tray">
            @for (shape of currentShapes; track shape.id) {
              @if (!shape.placed) {
                <div 
                  #trayShapeCard
                  class="shape-card-wrap"
                  [attr.data-id]="shape.id"
                  [class.is-selected]="selectedShape?.id === shape.id"
                  [class.is-dragging]="draggingShape?.id === shape.id"
                  [style.transform]="getDraggingTransform(shape)"
                  (pointerdown)="onShapePointerDown(shape, $event)">
                  
                  <div 
                    class="shape-card animate-float"
                    [style.--shape-color]="shape.color"
                    [style.--shape-glow]="shape.glow">
                    
                    <div class="card-character-box">
                      <ng-container [ngTemplateOutlet]="shapeSvgTemplate" [ngTemplateOutletContext]="{ type: shape.type, isPlaced: true }"></ng-container>
                    </div>
                    <span class="card-title">{{ shape.name }}</span>
                    <span class="card-hint-badge">TAP ME</span>
                  </div>
                </div>
              }
            }
          </div>
        </div>

        <!-- Animated Demo Pointer Hand (Shows when toddler is idle) -->
        @if (showDemoHand && demoSource && demoTarget) {
          <div 
            class="demo-hand-pointer"
            [style.--sx]="demoSource.x + 'px'"
            [style.--sy]="demoSource.y + 'px'"
            [style.--tx]="demoTarget.x + 'px'"
            [style.--ty]="demoTarget.y + 'px'">
            <span class="hand-emoji">👆</span>
            <span class="hand-caption">Match!</span>
          </div>
        }

        <!-- Star Burst Particles on Snap -->
        @for (burst of activeBursts; track burst.id) {
          <div 
            class="snap-star-burst"
            [style.left.px]="burst.x"
            [style.top.px]="burst.y"
            [style.--burst-color]="burst.color">
            <div class="burst-ring"></div>
            <span class="flying-star s1">⭐</span>
            <span class="flying-star s2">✨</span>
            <span class="flying-star s3">🌟</span>
            <span class="flying-star s4">💫</span>
            <span class="flying-star s5">⭐</span>
            <span class="flying-star s6">🎉</span>
          </div>
        }

        <!-- Level Completed Celebration Modal Overlay -->
        @if (isAllPlaced) {
          <div class="victory-overlay animate-pop">
            <div class="victory-card">
              <div class="victory-mascot animate-bounce">🧸🎉</div>
              <h2 class="victory-title">FANTASTIC JOB!</h2>
              <p class="victory-subtitle">You matched all {{ currentShapes.length }} shapes!</p>
              
              <div class="earned-stars-row">
                <span class="big-star">⭐</span>
                <span class="big-star">⭐</span>
                <span class="big-star">⭐</span>
              </div>

              <button 
                type="button" 
                (click)="nextLevel()" 
                class="victory-next-btn">
                <span>{{ level < 3 ? 'NEXT SHAPES ▶' : 'PLAY AGAIN 🔄' }}</span>
              </button>
            </div>
          </div>
        }
      </main>

      <footer class="game-footer">
        <p>💡 Tip: Tap a shape to hear its name, or drag it into its hole!</p>
      </footer>
    </div>

    <!-- Reusable Template for Living Character SVGs -->
    <ng-template #shapeSvgTemplate let-type="type" let-isPlaced="isPlaced">
      <div class="character-svg-wrapper" [class.is-silhouette]="!isPlaced">
        @switch (type) {
          @case ('circle') {
            <svg class="char-svg" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" [attr.fill]="isPlaced ? 'url(#grad-circle)' : '#1e1b4b'" [attr.stroke]="isPlaced ? '#ffffff' : '#f59e0b'" stroke-width="3"/>
              @if (isPlaced) {
                <circle cx="36" cy="43" r="5.5" fill="#1e293b"/>
                <circle cx="64" cy="43" r="5.5" fill="#1e293b"/>
                <circle cx="38" cy="41" r="2.2" fill="#ffffff"/>
                <circle cx="66" cy="41" r="2.2" fill="#ffffff"/>
                <ellipse cx="28" cy="53" rx="4.5" ry="3" fill="#f43f5e" opacity="0.6"/>
                <ellipse cx="72" cy="53" rx="4.5" ry="3" fill="#f43f5e" opacity="0.6"/>
                <path d="M 39 56 Q 50 67 61 56" stroke="#1e293b" stroke-width="3.5" stroke-linecap="round" fill="none"/>
              }
            </svg>
          }
          @case ('square') {
            <svg class="char-svg" viewBox="0 0 100 100">
              <rect x="10" y="10" width="80" height="80" rx="18" [attr.fill]="isPlaced ? 'url(#grad-square)' : '#1e1b4b'" [attr.stroke]="isPlaced ? '#ffffff' : '#38bdf8'" stroke-width="3"/>
              @if (isPlaced) {
                <circle cx="36" cy="43" r="5.5" fill="#1e293b"/>
                <circle cx="64" cy="43" r="5.5" fill="#1e293b"/>
                <circle cx="38" cy="41" r="2.2" fill="#ffffff"/>
                <circle cx="66" cy="41" r="2.2" fill="#ffffff"/>
                <ellipse cx="27" cy="54" rx="4.5" ry="3" fill="#f43f5e" opacity="0.6"/>
                <ellipse cx="73" cy="54" rx="4.5" ry="3" fill="#f43f5e" opacity="0.6"/>
                <path d="M 38 56 Q 50 68 62 56" stroke="#1e293b" stroke-width="3.5" stroke-linecap="round" fill="none"/>
              }
            </svg>
          }
          @case ('triangle') {
            <svg class="char-svg" viewBox="0 0 100 100">
              <path d="M 50 10 L 92 84 Q 95 90 88 90 L 12 90 Q 5 90 8 84 Z" [attr.fill]="isPlaced ? 'url(#grad-triangle)' : '#1e1b4b'" [attr.stroke]="isPlaced ? '#ffffff' : '#fb7185'" stroke-width="3"/>
              @if (isPlaced) {
                <circle cx="41" cy="54" r="4.8" fill="#1e293b"/>
                <circle cx="59" cy="54" r="4.8" fill="#1e293b"/>
                <circle cx="43" cy="52" r="2" fill="#ffffff"/>
                <circle cx="61" cy="52" r="2" fill="#ffffff"/>
                <ellipse cx="32" cy="63" rx="4" ry="2.5" fill="#f43f5e" opacity="0.6"/>
                <ellipse cx="68" cy="63" rx="4" ry="2.5" fill="#f43f5e" opacity="0.6"/>
                <path d="M 44 65 Q 50 73 56 65" stroke="#1e293b" stroke-width="3" stroke-linecap="round" fill="none"/>
              }
            </svg>
          }
          @case ('star') {
            <svg class="char-svg" viewBox="0 0 100 100">
              <path d="M 50 6 L 63 36 L 96 38 L 71 60 L 79 93 L 50 75 L 21 93 L 29 60 L 4 38 L 37 36 Z" [attr.fill]="isPlaced ? 'url(#grad-star)' : '#1e1b4b'" [attr.stroke]="isPlaced ? '#ffffff' : '#facc15'" stroke-width="2.5"/>
              @if (isPlaced) {
                <circle cx="42" cy="48" r="4.5" fill="#1e293b"/>
                <circle cx="58" cy="48" r="4.5" fill="#1e293b"/>
                <circle cx="44" cy="46" r="1.8" fill="#ffffff"/>
                <circle cx="60" cy="46" r="1.8" fill="#ffffff"/>
                <ellipse cx="35" cy="56" rx="3.5" ry="2.2" fill="#f43f5e" opacity="0.6"/>
                <ellipse cx="65" cy="56" rx="3.5" ry="2.2" fill="#f43f5e" opacity="0.6"/>
                <path d="M 45 59 Q 50 65 55 59" stroke="#1e293b" stroke-width="2.8" stroke-linecap="round" fill="none"/>
              }
            </svg>
          }
          @case ('heart') {
            <svg class="char-svg" viewBox="0 0 100 100">
              <path d="M 50 88 C 20 65 6 45 6 28 C 6 12 18 6 32 6 C 41 6 47 11 50 17 C 53 11 59 6 68 6 C 82 6 94 12 94 28 C 94 45 80 65 50 88 Z" [attr.fill]="isPlaced ? 'url(#grad-heart)' : '#1e1b4b'" [attr.stroke]="isPlaced ? '#ffffff' : '#f472b6'" stroke-width="2.5"/>
              @if (isPlaced) {
                <circle cx="38" cy="42" r="5" fill="#1e293b"/>
                <circle cx="62" cy="42" r="5" fill="#1e293b"/>
                <circle cx="40" cy="40" r="2" fill="#ffffff"/>
                <circle cx="64" cy="40" r="2" fill="#ffffff"/>
                <ellipse cx="29" cy="51" rx="4" ry="2.5" fill="#f43f5e" opacity="0.6"/>
                <ellipse cx="71" cy="51" rx="4" ry="2.5" fill="#f43f5e" opacity="0.6"/>
                <path d="M 43 54 Q 50 62 57 54" stroke="#1e293b" stroke-width="3" stroke-linecap="round" fill="none"/>
              }
            </svg>
          }
          @case ('diamond') {
            <svg class="char-svg" viewBox="0 0 100 100">
              <polygon points="50,6 94,50 50,94 6,50" [attr.fill]="isPlaced ? 'url(#grad-diamond)' : '#1e1b4b'" [attr.stroke]="isPlaced ? '#ffffff' : '#2dd4bf'" stroke-width="3"/>
              @if (isPlaced) {
                <circle cx="40" cy="46" r="4.8" fill="#1e293b"/>
                <circle cx="60" cy="46" r="4.8" fill="#1e293b"/>
                <circle cx="42" cy="44" r="2" fill="#ffffff"/>
                <circle cx="62" cy="44" r="2" fill="#ffffff"/>
                <ellipse cx="31" cy="55" rx="4" ry="2.5" fill="#f43f5e" opacity="0.6"/>
                <ellipse cx="69" cy="55" rx="4" ry="2.5" fill="#f43f5e" opacity="0.6"/>
                <path d="M 44 58 Q 50 65 56 58" stroke="#1e293b" stroke-width="3" stroke-linecap="round" fill="none"/>
              }
            </svg>
          }
          @case ('moon') {
            <svg class="char-svg" viewBox="0 0 100 100">
              <path d="M 55 8 C 25 15 15 45 28 75 C 38 95 65 98 85 85 C 50 82 40 50 58 25 C 64 16 62 10 55 8 Z" [attr.fill]="isPlaced ? 'url(#grad-moon)' : '#1e1b4b'" [attr.stroke]="isPlaced ? '#ffffff' : '#c084fc'" stroke-width="2.5"/>
              @if (isPlaced) {
                <circle cx="40" cy="48" r="4.5" fill="#1e293b"/>
                <circle cx="42" cy="46" r="1.8" fill="#ffffff"/>
                <ellipse cx="33" cy="56" rx="3.5" ry="2.2" fill="#f43f5e" opacity="0.6"/>
                <path d="M 40 60 Q 47 67 53 62" stroke="#1e293b" stroke-width="2.8" stroke-linecap="round" fill="none"/>
              }
            </svg>
          }
          @case ('flower') {
            <svg class="char-svg" viewBox="0 0 100 100">
              <g [attr.fill]="isPlaced ? 'url(#grad-flower)' : '#1e1b4b'">
                <circle cx="50" cy="22" r="17"/>
                <circle cx="78" cy="50" r="17"/>
                <circle cx="50" cy="78" r="17"/>
                <circle cx="22" cy="50" r="17"/>
                <circle cx="30" cy="30" r="17"/>
                <circle cx="70" cy="30" r="17"/>
                <circle cx="70" cy="70" r="17"/>
                <circle cx="30" cy="70" r="17"/>
              </g>
              <circle cx="50" cy="50" r="23" [attr.fill]="isPlaced ? '#fbbf24' : '#1e1b4b'" stroke="#ffffff" stroke-width="2"/>
              @if (isPlaced) {
                <circle cx="43" cy="46" r="3.5" fill="#1e293b"/>
                <circle cx="57" cy="46" r="3.5" fill="#1e293b"/>
                <circle cx="45" cy="44.5" r="1.5" fill="#ffffff"/>
                <circle cx="59" cy="44.5" r="1.5" fill="#ffffff"/>
                <ellipse cx="36" cy="54" rx="3" ry="1.8" fill="#f43f5e" opacity="0.6"/>
                <ellipse cx="64" cy="54" rx="3" ry="1.8" fill="#f43f5e" opacity="0.6"/>
                <path d="M 45 56 Q 50 63 55 56" stroke="#1e293b" stroke-width="2.5" stroke-linecap="round" fill="none"/>
              }
            </svg>
          }
        }
      </div>
    </ng-template>
  `,
  styles: [`
    .svg-defs {
      position: absolute;
      width: 0;
      height: 0;
      pointer-events: none;
    }

    .game-viewport {
      min-height: 100vh;
      min-height: 100dvh;
      width: 100%;
      background: var(--app-viewport-bg, radial-gradient(circle at 50% 10%, #1e1b4b 0%, #0f172a 70%, #030712 100%));
      transition: background 0.4s ease;
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
      color: #fbbf24;
      letter-spacing: 0.06em;
      text-shadow: 0 0 12px rgba(251, 191, 36, 0.5);
    }
    .stars-row {
      display: flex;
      gap: 4px;
    }
    .star-icon {
      font-size: 1.1rem;
      filter: grayscale(1) opacity(0.35);
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .star-icon.earned {
      filter: none;
      transform: scale(1.15);
      text-shadow: 0 0 8px #fde047;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .action-circle-btn {
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
    .action-circle-btn:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: scale(1.08);
    }

    /* Main Stage */
    .sorter-stage {
      flex: 1;
      max-width: 900px;
      width: 100%;
      margin: 0 auto;
      padding: 6px 16px 18px 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-around;
      position: relative;
    }

    /* Mascot Banner */
    .mascot-banner {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 8px 18px;
      border-radius: 24px;
      background: rgba(255, 255, 255, 0.08);
      border: 1.5px solid rgba(255, 255, 255, 0.18);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
      cursor: pointer;
      backdrop-filter: blur(8px);
      margin-bottom: 12px;
      transition: transform 0.2s;
    }
    .mascot-banner:hover {
      transform: scale(1.03);
    }
    .mascot-avatar {
      font-size: 1.6rem;
      display: flex;
      align-items: center;
      justify-content: center;
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

    /* Cutouts Board (Target Homes) */
    .cutouts-board {
      width: 100%;
      background: rgba(255, 255, 255, 0.04);
      border: 2px solid rgba(255, 255, 255, 0.12);
      border-radius: 28px;
      padding: 16px 14px 20px 14px;
      box-shadow: 
        inset 0 4px 20px rgba(0, 0, 0, 0.5),
        0 12px 32px rgba(0, 0, 0, 0.4);
      margin-bottom: 16px;
    }
    .board-header {
      text-align: center;
      margin-bottom: 14px;
    }
    .board-label {
      font-size: 0.72rem;
      font-weight: 900;
      color: #94a3b8;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .cutouts-rack {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: clamp(10px, 2.5vw, 20px);
      width: 100%;
    }

    .cutout-slot {
      width: clamp(82px, 22vw, 114px);
      height: clamp(96px, 25vw, 128px);
      border-radius: 22px;
      border: 3px dashed rgba(255, 255, 255, 0.25);
      background: rgba(15, 23, 42, 0.7);
      box-shadow: inset 0 6px 14px rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    /* Pulsing Golden Target Spotlight */
    .cutout-slot.is-target {
      border: 3.5px dashed #fde047;
      background: rgba(253, 224, 71, 0.12);
      box-shadow: 
        0 0 28px var(--shape-glow),
        inset 0 0 20px rgba(253, 224, 71, 0.2);
      transform: scale(1.08);
      animation: targetPulse 1.2s ease-in-out infinite;
    }

    @keyframes targetPulse {
      0%, 100% {
        box-shadow: 0 0 20px var(--shape-glow), inset 0 0 15px rgba(253, 224, 71, 0.2);
        transform: scale(1.05);
      }
      50% {
        box-shadow: 0 0 35px var(--shape-glow), inset 0 0 25px rgba(253, 224, 71, 0.4);
        transform: scale(1.1);
      }
    }

    .target-pointer-arrow {
      position: absolute;
      top: -36px;
      display: flex;
      flex-direction: column;
      align-items: center;
      z-index: 15;
      pointer-events: none;
    }
    .arrow-icon {
      font-size: 1.4rem;
      filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.6));
    }
    .arrow-text {
      font-size: 0.65rem;
      font-weight: 900;
      color: #fde047;
      background: #78350f;
      padding: 1px 6px;
      border-radius: 8px;
      letter-spacing: 0.05em;
    }

    .cutout-slot.slot-filled {
      border: 2.5px solid var(--shape-color);
      background: rgba(255, 255, 255, 0.04);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
    }

    .cutout-silhouette {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      opacity: 0.45;
      transition: opacity 0.2s;
    }
    .cutout-slot.is-target .cutout-silhouette {
      opacity: 0.85;
      transform: scale(1.04);
    }

    .silhouette-title {
      font-size: 0.68rem;
      font-weight: 800;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .slotted-shape {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      position: relative;
    }

    .shape-title {
      font-size: 0.72rem;
      font-weight: 900;
      color: #ffffff;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
    }

    .placed-check-badge {
      position: absolute;
      top: 6px;
      right: 6px;
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
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
    }

    /* Shapes Tray */
    .tray-section {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .tray-title-row {
      margin-bottom: 10px;
    }
    .tray-title {
      font-size: 0.72rem;
      font-weight: 900;
      color: #cbd5e1;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .shapes-tray {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: 14px;
      min-height: 125px;
      width: 100%;
    }

    .shape-card-wrap {
      touch-action: none;
      position: relative;
      cursor: grab;
      transition: transform 0.15s ease-out;
    }
    .shape-card-wrap:active {
      cursor: grabbing;
    }

    .shape-card {
      width: clamp(84px, 23vw, 114px);
      height: clamp(96px, 25vw, 126px);
      border-radius: 24px;
      border: 2.5px solid rgba(255, 255, 255, 0.35);
      background: rgba(255, 255, 255, 0.08);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      box-shadow: 
        0 10px 24px rgba(0, 0, 0, 0.45),
        inset 0 2px 6px rgba(255, 255, 255, 0.3);
      backdrop-filter: blur(12px);
      transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      position: relative;
    }

    .shape-card:hover {
      transform: translateY(-6px) scale(1.06);
      border-color: #ffffff;
      box-shadow: 0 16px 32px var(--shape-glow);
    }

    /* Selected State in Tray */
    .shape-card-wrap.is-selected .shape-card {
      transform: translateY(-8px) scale(1.1);
      border: 3px solid #fde047;
      box-shadow: 
        0 0 30px var(--shape-glow),
        0 14px 28px rgba(0, 0, 0, 0.5);
      animation: shapeJiggle 0.6s ease-in-out infinite alternate;
    }

    @keyframes shapeJiggle {
      0% { transform: translateY(-8px) scale(1.08) rotate(-3deg); }
      100% { transform: translateY(-10px) scale(1.12) rotate(3deg); }
    }

    .card-character-box {
      width: 70%;
      height: 60%;
      display: flex;
      align-items: center;
      justify-content: center;
      filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.4));
    }

    .card-title {
      font-size: 0.74rem;
      font-weight: 900;
      color: #ffffff;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
    }

    .card-hint-badge {
      font-size: 0.58rem;
      font-weight: 800;
      color: #fde047;
      background: rgba(0, 0, 0, 0.4);
      padding: 2px 6px;
      border-radius: 8px;
    }

    /* Character SVG Styling */
    .character-svg-wrapper {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .char-svg {
      width: clamp(54px, 14vw, 72px);
      height: clamp(54px, 14vw, 72px);
      filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.35));
    }
    .character-svg-wrapper.is-silhouette .char-svg {
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.6));
    }

    /* Animated Demo Hand Pointer */
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
      background: rgba(0, 0, 0, 0.75);
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
      40% {
        left: var(--sx);
        top: var(--sy);
        transform: scale(0.95) translate(-50%, -50%);
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
    .snap-star-burst {
      position: absolute;
      transform: translate(-50%, -50%);
      pointer-events: none;
      z-index: 60;
    }
    .burst-ring {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      border: 3.5px solid var(--burst-color);
      border-radius: 50%;
      box-shadow: 0 0 20px var(--burst-color);
      animation: snapRingPulse 0.45s ease-out forwards;
    }
    @keyframes snapRingPulse {
      0% { width: 20px; height: 20px; opacity: 1; }
      100% { width: 140px; height: 140px; opacity: 0; }
    }

    .flying-star {
      position: absolute;
      top: 50%;
      left: 50%;
      font-size: 1.3rem;
      animation: flyOutStar 0.6s cubic-bezier(0.12, 0.8, 0.32, 1) forwards;
    }
    .s1 { --dx: 45px; --dy: -40px; }
    .s2 { --dx: -45px; --dy: -40px; }
    .s3 { --dx: 50px; --dy: 20px; }
    .s4 { --dx: -50px; --dy: 20px; }
    .s5 { --dx: 0px; --dy: -60px; }
    .s6 { --dx: 0px; --dy: 45px; }

    @keyframes flyOutStar {
      0% {
        opacity: 1;
        transform: translate(-50%, -50%) translate(0, 0) scale(0.5);
      }
      100% {
        opacity: 0;
        transform: translate(-50%, -50%) translate(var(--dx), var(--dy)) scale(1.3) rotate(180deg);
      }
    }

    /* Victory Celebration Overlay */
    .victory-overlay {
      position: absolute;
      inset: 0;
      background: rgba(3, 7, 18, 0.85);
      backdrop-filter: blur(12px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
      padding: 20px;
    }

    .victory-card {
      background: linear-gradient(145deg, #1e1b4b 0%, #0f172a 100%);
      border: 3px solid #fbbf24;
      border-radius: 32px;
      padding: 30px 24px;
      max-width: 400px;
      width: 100%;
      text-align: center;
      box-shadow: 
        0 20px 50px rgba(0, 0, 0, 0.7),
        0 0 40px rgba(251, 191, 36, 0.4);
    }

    .victory-mascot {
      font-size: 3.5rem;
      margin-bottom: 8px;
    }

    .victory-title {
      font-family: var(--font-display, sans-serif);
      font-size: 1.8rem;
      font-weight: 900;
      color: #fde047;
      margin-bottom: 4px;
      text-shadow: 0 0 15px rgba(253, 224, 71, 0.6);
    }

    .victory-subtitle {
      font-size: 0.95rem;
      font-weight: 700;
      color: #e2e8f0;
      margin-bottom: 16px;
    }

    .earned-stars-row {
      display: flex;
      justify-content: center;
      gap: 12px;
      margin-bottom: 24px;
    }
    .big-star {
      font-size: 2.2rem;
      animation: starPop 0.5s ease-out forwards;
      filter: drop-shadow(0 0 10px #fde047);
    }
    @keyframes starPop {
      0% { transform: scale(0); opacity: 0; }
      80% { transform: scale(1.3); }
      100% { transform: scale(1); opacity: 1; }
    }

    .victory-next-btn {
      width: 100%;
      padding: 16px;
      border-radius: 22px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border: 2px solid #6ee7b7;
      color: white;
      font-size: 1.2rem;
      font-weight: 900;
      cursor: pointer;
      box-shadow: 0 12px 30px rgba(16, 185, 129, 0.5);
      transition: all 0.2s;
    }
    .victory-next-btn:hover {
      transform: scale(1.04);
      box-shadow: 0 16px 36px rgba(16, 185, 129, 0.65);
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
export class ShapeSorterComponent implements OnInit, OnDestroy {
  level = 1;

  allShapeSets: ShapeItem[][] = [
    // Level 1: 3 Basic Shapes with character details
    [
      { id: 'circle', name: 'Circle', hindiName: 'Gola', type: 'circle', color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.6)', placed: false },
      { id: 'square', name: 'Square', hindiName: 'Chaukor', type: 'square', color: '#38bdf8', glow: 'rgba(56, 189, 248, 0.6)', placed: false },
      { id: 'triangle', name: 'Triangle', hindiName: 'Tikona', type: 'triangle', color: '#fb7185', glow: 'rgba(251, 113, 133, 0.6)', placed: false }
    ],
    // Level 2: 4 Shapes
    [
      { id: 'star', name: 'Star', hindiName: 'Tara', type: 'star', color: '#facc15', glow: 'rgba(250, 204, 21, 0.6)', placed: false },
      { id: 'heart', name: 'Heart', hindiName: 'Dil', type: 'heart', color: '#f472b6', glow: 'rgba(244, 114, 182, 0.6)', placed: false },
      { id: 'diamond', name: 'Diamond', hindiName: 'Heera', type: 'diamond', color: '#2dd4bf', glow: 'rgba(45, 212, 191, 0.6)', placed: false },
      { id: 'circle', name: 'Circle', hindiName: 'Gola', type: 'circle', color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.6)', placed: false }
    ],
    // Level 3: 5 Shapes
    [
      { id: 'star', name: 'Star', hindiName: 'Tara', type: 'star', color: '#facc15', glow: 'rgba(250, 204, 21, 0.6)', placed: false },
      { id: 'flower', name: 'Flower', hindiName: 'Phool', type: 'flower', color: '#ea580c', glow: 'rgba(234, 88, 12, 0.6)', placed: false },
      { id: 'triangle', name: 'Triangle', hindiName: 'Tikona', type: 'triangle', color: '#fb7185', glow: 'rgba(251, 113, 133, 0.6)', placed: false },
      { id: 'heart', name: 'Heart', hindiName: 'Dil', type: 'heart', color: '#f472b6', glow: 'rgba(244, 114, 182, 0.6)', placed: false },
      { id: 'moon', name: 'Moon', hindiName: 'Chanda', type: 'moon', color: '#c084fc', glow: 'rgba(192, 132, 252, 0.6)', placed: false }
    ]
  ];

  currentShapes: ShapeItem[] = [];
  selectedShape: ShapeItem | null = null;
  draggingShape: ShapeItem | null = null;
  isMascotCheering = false;

  // Demo Hand Coordinates
  showDemoHand = false;
  demoSource: { x: number; y: number } | null = null;
  demoTarget: { x: number; y: number } | null = null;
  private demoTimer: any = null;
  private burstCounter = 1;

  activeBursts: StarBurst[] = [];

  // Drag offsets
  private dragStartX = 0;
  private dragStartY = 0;
  private dragCurrX = 0;
  private dragCurrY = 0;

  @ViewChild('stageContainer') stageRef!: ElementRef<HTMLElement>;

  get isAllPlaced(): boolean {
    return this.currentShapes.length > 0 && this.currentShapes.every(s => s.placed);
  }

  constructor(
    public appNav: AppNavService,
    public sound: SoundService,
    private speech: SpeechService,
    private confetti: ConfettiService
  ) {}

  ngOnInit(): void {
    this.loadLevel(1);
  }

  ngOnDestroy(): void {
    if (this.demoTimer) clearTimeout(this.demoTimer);
  }

  loadLevel(lvl: number): void {
    this.level = lvl;
    const template = this.allShapeSets[lvl - 1] || this.allShapeSets[0];
    this.currentShapes = template.map(s => ({ ...s, placed: false }));
    this.selectedShape = null;
    this.draggingShape = null;

    // Friendly voice prompt
    setTimeout(() => {
      this.speech.speak(`Match the shapes! Level ${lvl}`);
    }, 350);

    // Schedule Demo Hand if child is idle for 2.2s
    this.scheduleDemoHand();
  }

  scheduleDemoHand(): void {
    if (this.demoTimer) clearTimeout(this.demoTimer);
    this.showDemoHand = false;

    this.demoTimer = setTimeout(() => {
      const unplaced = this.currentShapes.find(s => !s.placed);
      if (!unplaced || this.isAllPlaced) return;

      const card = document.querySelector(`.shape-card-wrap[data-id="${unplaced.id}"]`);
      const slot = document.querySelector(`.cutout-slot[data-id="${unplaced.id}"]`);

      if (card && slot) {
        const cRect = card.getBoundingClientRect();
        const sRect = slot.getBoundingClientRect();

        this.demoSource = { x: cRect.left + cRect.width / 2, y: cRect.top + cRect.height / 2 };
        this.demoTarget = { x: sRect.left + sRect.width / 2, y: sRect.top + sRect.height / 2 };
        this.showDemoHand = true;
      }
    }, 2200);
  }

  onUserInteract(): void {
    this.showDemoHand = false;
    if (this.demoTimer) clearTimeout(this.demoTimer);
    this.demoTimer = setTimeout(() => this.scheduleDemoHand(), 5000);
  }

  replayPrompt(): void {
    this.sound.playTap();
    if (this.selectedShape) {
      this.speech.speak(`Put ${this.selectedShape.name} into its home!`);
    } else {
      this.speech.speak(`Tap any shape at the bottom to match!`);
    }
  }

  onMascotTap(): void {
    this.sound.playGiggle();
    this.isMascotCheering = true;
    setTimeout(() => this.isMascotCheering = false, 800);
    this.replayPrompt();
  }

  /**
   * Pointer Down on Shape Card in Tray:
   * Supports both quick tap and smooth drag & drop
   */
  onShapePointerDown(shape: ShapeItem, event: PointerEvent): void {
    this.onUserInteract();
    
    // Select the shape
    this.selectedShape = shape;
    this.sound.playTap();
    this.speech.speak(shape.name);

    // Start dragging
    this.draggingShape = shape;
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    this.dragCurrX = event.clientX;
    this.dragCurrY = event.clientY;

    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  @HostListener('window:pointermove', ['$event'])
  onPointerMove(event: PointerEvent): void {
    if (!this.draggingShape) return;
    this.dragCurrX = event.clientX;
    this.dragCurrY = event.clientY;
  }

  @HostListener('window:pointerup', ['$event'])
  onPointerUp(event: PointerEvent): void {
    if (!this.draggingShape) return;

    const dragged = this.draggingShape;
    const distanceMoved = Math.hypot(this.dragCurrX - this.dragStartX, this.dragCurrY - this.dragStartY);

    this.draggingShape = null;

    // If it was just a tap (< 12px move), handle as tap-to-select
    if (distanceMoved < 12) {
      return;
    }

    // Check if released near the matching slot
    const matchingSlot = document.querySelector(`.cutout-slot[data-id="${dragged.id}"]`);
    if (matchingSlot) {
      const slotRect = matchingSlot.getBoundingClientRect();
      const slotCenterX = slotRect.left + slotRect.width / 2;
      const slotCenterY = slotRect.top + slotRect.height / 2;
      const dist = Math.hypot(event.clientX - slotCenterX, event.clientY - slotCenterY);

      if (dist < 85) {
        // Successful drop!
        this.snapIntoSlot(dragged, slotCenterX, slotCenterY);
        return;
      }
    }

    // Dropped outside or wrong place: play boing wobble sound
    this.sound.playBoing();
  }

  /**
   * Tap on Cutout Slot
   */
  onSlotClick(shape: ShapeItem): void {
    this.onUserInteract();

    if (shape.placed) {
      // Shape is already placed, celebrate with name
      this.sound.playTap();
      this.speech.speak(shape.name);
      return;
    }

    // If a shape was selected and it matches this slot:
    if (this.selectedShape && this.selectedShape.id === shape.id) {
      const matchingSlot = document.querySelector(`.cutout-slot[data-id="${shape.id}"]`);
      if (matchingSlot) {
        const slotRect = matchingSlot.getBoundingClientRect();
        this.snapIntoSlot(this.selectedShape, slotRect.left + slotRect.width / 2, slotRect.top + slotRect.height / 2);
      } else {
        this.snapIntoSlot(this.selectedShape);
      }
      return;
    }

    // If user clicked the slot without selecting first, select that shape from tray automatically!
    const matchingShape = this.currentShapes.find(s => s.id === shape.id && !s.placed);
    if (matchingShape) {
      this.selectedShape = matchingShape;
      this.sound.playTap();
      this.speech.speak(`Find the ${matchingShape.name}!`);
    } else {
      this.sound.playBoing();
    }
  }

  /**
   * Magnetic snap shape into slot with star burst, audio, and speech
   */
  snapIntoSlot(shape: ShapeItem, x?: number, y?: number): void {
    shape.placed = true;
    this.selectedShape = null;

    // Play crisp magnetic snap sound
    this.sound.playSnap();

    // Trigger star burst
    if (x && y) {
      this.triggerStarburst(x, y, shape.color);
    } else {
      const slot = document.querySelector(`.cutout-slot[data-id="${shape.id}"]`);
      if (slot) {
        const r = slot.getBoundingClientRect();
        this.triggerStarburst(r.left + r.width / 2, r.top + r.height / 2, shape.color);
      }
    }

    // Speech praise
    this.speech.speak(`Great! ${shape.name}!`);

    // Level completion check
    if (this.isAllPlaced) {
      setTimeout(() => {
        this.sound.playFanfare();
        this.confetti.fire();
        this.speech.speak('Hooray! You matched all shapes!');
      }, 500);
    } else {
      // Schedule next demo hint
      this.scheduleDemoHand();
    }
  }

  triggerStarburst(x: number, y: number, color: string): void {
    const burstId = this.burstCounter++;
    this.activeBursts.push({ id: burstId, x, y, color });
    setTimeout(() => {
      this.activeBursts = this.activeBursts.filter(b => b.id !== burstId);
    }, 650);
  }

  getDraggingTransform(shape: ShapeItem): string {
    if (this.draggingShape?.id !== shape.id) return '';
    const dx = this.dragCurrX - this.dragStartX;
    const dy = this.dragCurrY - this.dragStartY;
    return `translate3d(${dx}px, ${dy}px, 0) scale(1.15)`;
  }

  nextLevel(): void {
    this.sound.playTap();
    if (this.level < 3) {
      this.loadLevel(this.level + 1);
    } else {
      this.loadLevel(1);
    }
  }
}

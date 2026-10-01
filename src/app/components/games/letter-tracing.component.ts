import {
  Component,
  ElementRef,
  ViewChild,
  OnInit,
  AfterViewInit,
  OnDestroy,
  HostListener,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppNavService } from '../../core/services/app-nav.service';
import { SoundService } from '../../core/services/sound.service';
import { SpeechService } from '../../core/services/speech.service';
import { ConfettiService } from '../../core/services/confetti.service';
import {
  TracingItem,
  StrokeDef,
  ALPHABET_ITEMS,
  NUMBER_ITEMS,
  HINDI_ITEMS,
  getStrokePoint,
  getPartialPathD
} from '../../core/data/letter-tracing.data';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
}

@Component({
  selector: 'app-letter-tracing',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="tracing-viewport" [style.background]="activeItem.bgGradient">
      <!-- 🌟 Floating Background Magic Orbs -->
      <div class="bg-orb orb-1"></div>
      <div class="bg-orb orb-2"></div>

      <!-- 🌟 Top Header Bar -->
      <header class="tracing-header">
        <div class="header-left">
          <button 
            type="button" 
            (click)="goBack()" 
            class="pill-btn btn-hub" 
            id="btn-tracing-hub"
            title="Back to Toddler Hub">
            <span class="btn-icon">🏰</span>
            <span class="btn-text">Hub</span>
          </button>

          <!-- Star milestone badge -->
          <div class="star-badge" (click)="onStarClick()" title="Total writing stars!">
            <span class="star-icon">⭐</span>
            <span class="star-count">{{ totalStars }}</span>
          </div>
        </div>

        <!-- Category Switcher Tabs -->
        <div class="category-tabs">
          <button 
            type="button" 
            class="cat-tab" 
            [class.cat-active]="activeCategory === 'alphabet'"
            (click)="setCategory('alphabet')">
            <span>🔤 ABCD</span>
          </button>
          <button 
            type="button" 
            class="cat-tab" 
            [class.cat-active]="activeCategory === 'number'"
            (click)="setCategory('number')">
            <span>🔢 1234</span>
          </button>
          <button 
            type="button" 
            class="cat-tab" 
            [class.cat-active]="activeCategory === 'hindi'"
            (click)="setCategory('hindi')">
            <span>🕉️ हिंदी</span>
          </button>
        </div>

        <div class="header-right">
          <!-- All Letters Grid Picker Modal Toggle -->
          <button 
            type="button" 
            (click)="toggleGridModal()" 
            class="icon-btn btn-grid" 
            id="btn-tracing-grid"
            title="Choose any letter from grid">
            <span>🔲</span>
          </button>

          <!-- Sound Toggle -->
          <button 
            type="button" 
            (click)="sound.toggleMute()" 
            class="icon-btn btn-sound" 
            id="btn-tracing-sound"
            [title]="sound.isMuted() ? 'Turn sound on' : 'Turn sound off'">
            {{ sound.isMuted() ? '🔇' : '🎵' }}
          </button>
        </div>
      </header>

      <!-- Hindi Sub-filter Pills (Only shown when Hindi category is active) -->
      @if (activeCategory === 'hindi') {
        <div class="hindi-sub-nav">
          <button 
            type="button" 
            class="sub-pill" 
            [class.sub-active]="hindiFilter === 'all'"
            (click)="setHindiFilter('all')">
            सभी ({{ totalHindiCount }})
          </button>
          <button 
            type="button" 
            class="sub-pill" 
            [class.sub-active]="hindiFilter === 'swar'"
            (click)="setHindiFilter('swar')">
            🍎 स्वर (अ से अः)
          </button>
          <button 
            type="button" 
            class="sub-pill" 
            [class.sub-active]="hindiFilter === 'vyanjan'"
            (click)="setHindiFilter('vyanjan')">
            🕊️ व्यंजन (क से ज्ञ)
          </button>
        </div>
      }

      <!-- Horizontal Letter Strip Selector -->
      <div class="letter-strip-container">
        <button 
          type="button" 
          (click)="prevLetter()" 
          class="strip-nav-btn strip-prev" 
          title="Previous letter">
          ◀
        </button>

        <div class="letter-strip" #letterStrip>
          @for (item of currentList; track item.id; let idx = $index) {
            <button 
              type="button" 
              class="strip-item-btn" 
              [class.strip-item-active]="idx === activeIndex"
              (click)="selectItemByIndex(idx)">
              <span class="strip-char">{{ item.char }}</span>
              <span class="strip-sub-emoji">{{ item.emoji }}</span>
            </button>
          }
        </div>

        <button 
          type="button" 
          (click)="nextLetter()" 
          class="strip-nav-btn strip-next" 
          title="Next letter">
          ▶
        </button>
      </div>

      <!-- Main Stage Area -->
      <main class="tracing-stage">
        <!-- Left / Top Info Pill Card -->
        <div class="letter-info-card">
          <div class="char-display-box" (click)="speakActiveLetter()" title="Tap to listen!">
            <span class="big-char">{{ activeItem.char }}</span>
            <span class="mascot-emoji animate-bounce">{{ activeItem.emoji }}</span>
          </div>

          <div class="char-details">
            <h3 class="char-word">{{ activeItem.name }}</h3>
            <span class="char-phonics">"{{ activeItem.phonics }}"</span>
            <button type="button" class="listen-btn" (click)="speakActiveLetter()">
              <span>🔊 सुनो (Listen)</span>
            </button>
          </div>
        </div>

        <!-- Center Tracing Blackboard Canvas Board -->
        <div class="chalkboard-frame" #boardFrame>
          <!-- Mode Switcher Pill Toolbar -->
          <div class="board-mode-toolbar">
            <button 
              type="button" 
              class="mode-switch-btn" 
              [class.mode-btn-active]="currentMode === 'demo'"
              (click)="startDemoMode()"
              title="Watch magic pencil draw each stroke slowly">
              <span>👀 देखो (Watch)</span>
            </button>
            <button 
              type="button" 
              class="mode-switch-btn" 
              [class.mode-btn-active]="currentMode === 'trace'"
              (click)="startTraceMode()"
              title="Trace with finger or mouse">
              <span>✨ लिखो (Trace)</span>
            </button>
            <button 
              type="button" 
              class="mode-switch-btn" 
              [class.mode-btn-active]="currentMode === 'slate'"
              (click)="startSlateMode()"
              title="Free practice slate">
              <span>🎨 स्लेट (Slate)</span>
            </button>
          </div>

          <!-- Current Step Instruction Cue Banner with Speed & Hint Controls -->
          <div class="step-guide-banner">
            @if (currentMode === 'demo') {
              <div class="guide-tag">👀 DEMO</div>
              <div class="guide-text">{{ currentDemoStepText }}</div>
              <!-- Speed Toggle for Demo -->
              <button 
                type="button" 
                class="speed-toggle-btn" 
                (click)="toggleDemoSpeed()" 
                [title]="demoSpeed === 'slow' ? 'Switch to Normal speed' : 'Switch to Slow speed for toddlers'">
                {{ demoSpeed === 'slow' ? '🐢 धीमा (Slow)' : '🐰 सामान्य (Normal)' }}
              </button>
            } @else if (currentMode === 'trace') {
              @if (!isItemCompleted) {
                <div class="guide-tag">STEP {{ currentStrokeIndex + 1 }}/{{ activeItem.strokes.length }}</div>
                <div class="guide-text">{{ currentStroke?.labelHi || 'उंगली से डॉटेड लाइन मिलाओ!' }}</div>
                <button type="button" class="hint-mini-btn" (click)="showCurrentStrokeHint()" title="Show hint for this stroke">
                  💡 मदद (Hint)
                </button>
              } @else {
                <div class="guide-tag tag-success">🎉 शाबाश!</div>
                <div class="guide-text">आपने {{ activeItem.char }} बहुत सुंदर लिखा!</div>
              }
            } @else {
              <div class="guide-tag">🎨 FREE SLATE</div>
              <div class="guide-text">हल्के अक्षर पर अपनी पेंसिल या चाक से लिखो!</div>
            }
          </div>

          <!-- 🎨 SVG Interactive Tracing Canvas (Used in Demo & Trace modes) -->
          @if (currentMode === 'demo' || currentMode === 'trace') {
            <div class="svg-stage-container">
              <svg 
                class="tracing-svg" 
                viewBox="0 0 200 200" 
                #svgCanvas
                (pointerdown)="onPointerDown($event)"
                (pointermove)="onPointerMove($event)"
                (pointerup)="onPointerUp($event)"
                (pointercancel)="onPointerUp($event)">
                
                <defs>
                  <!-- Glowing Filter
                       FIX: filterUnits="userSpaceOnUse" — with the default objectBoundingBox,
                       perfectly straight horizontal/vertical strokes have a 0-width/height
                       bounding box, so the filter region collapses and the stroke is NOT drawn. -->
                  <filter id="glow" filterUnits="userSpaceOnUse" x="-20" y="-20" width="240" height="240">
                    <feGaussianBlur stdDeviation="3.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>

                  <!-- Rainbow Gradient (userSpaceOnUse guarantees horizontal & vertical strokes are fully rendered) -->
                  <linearGradient id="rainbowGrad" x1="20" y1="20" x2="180" y2="180" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stop-color="#f43f5e" />
                    <stop offset="25%" stop-color="#f59e0b" />
                    <stop offset="50%" stop-color="#10b981" />
                    <stop offset="75%" stop-color="#06b6d4" />
                    <stop offset="100%" stop-color="#8b5cf6" />
                  </linearGradient>

                  <!-- Gold Sparkle Gradient -->
                  <linearGradient id="goldGrad" x1="20" y1="20" x2="180" y2="180" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stop-color="#fde047" />
                    <stop offset="50%" stop-color="#f59e0b" />
                    <stop offset="100%" stop-color="#d97706" />
                  </linearGradient>

                  <!-- Neon Cyan Gradient -->
                  <linearGradient id="cyanGrad" x1="20" y1="20" x2="180" y2="180" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stop-color="#67e8f9" />
                    <stop offset="100%" stop-color="#06b6d4" />
                  </linearGradient>
                </defs>

                <!-- Layer 1: Background Thick Gray Road/Track for all strokes -->
                @for (stroke of activeItem.strokes; track stroke.id) {
                  <path 
                    [attr.d]="stroke.d" 
                    class="bg-track" 
                    fill="none" 
                    stroke-linecap="round" 
                    stroke-linejoin="round" />
                  <!-- Dotted Guide Center Line -->
                  <path 
                    [attr.d]="stroke.d" 
                    class="dotted-track" 
                    fill="none" 
                    stroke-linecap="round" 
                    stroke-linejoin="round" />
                }

                <!-- Layer 2: Completed Strokes Filled with Glowing Neon -->
                @for (stroke of completedStrokes; track stroke.id) {
                  <path 
                    [attr.d]="stroke.d" 
                    class="completed-stroke" 
                    [attr.stroke]="getStrokeColor()" 
                    fill="none" 
                    stroke-linecap="round" 
                    stroke-linejoin="round" 
                    filter="url(#glow)" />
                }

                <!-- Layer 3: Active Stroke Flowing Direction Trail (Fairy Lights Animation) -->
                @if (currentStroke && !isItemCompleted) {
                  <!-- Animated moving flowing dashes that clearly show drawing direction! -->
                  <path 
                    [attr.d]="currentStroke.d" 
                    class="flow-guide-path" 
                    fill="none" 
                    stroke-linecap="round" 
                    stroke-linejoin="round" />

                  <!-- Partial filled path during interactive tracing -->
                  @if (currentMode === 'trace' && activeStrokeProgress > 0) {
                    <path 
                      [attr.d]="getActiveStrokePartialD()" 
                      class="partial-fill-stroke" 
                      [attr.stroke]="getStrokeColor()" 
                      fill="none" 
                      stroke-linecap="round" 
                      stroke-linejoin="round" 
                      filter="url(#glow)" />
                  }

                  <!-- Start Indicator Dot with Pulsing Ring & Marker -->
                  <g class="start-marker-group" [attr.transform]="'translate(' + getStartMarkerPos().x + ',' + getStartMarkerPos().y + ')'">
                    <circle r="15" class="start-pulse-ring" />
                    <circle r="9" class="start-dot" />
                    <text y="3.5" text-anchor="middle" class="start-num">{{ activeStrokeProgress > 0 ? '✨' : currentStroke.id }}</text>
                  </g>
                }

                <!-- Layer 4: Live Pointer Finger Stroke (Instant tactile feedback!) -->
                @if (currentMode === 'trace' && livePointerPath && livePointerPath.startsWith('M')) {
                  <path 
                    [attr.d]="livePointerPath" 
                    class="live-finger-stroke" 
                    [attr.stroke]="getStrokeColor()" 
                    fill="none" 
                    stroke-linecap="round" 
                    stroke-linejoin="round" 
                    filter="url(#glow)" />
                }

                <!-- Layer 5: Demo Mode Animated Stroke & Compact Realistic 3D Pencil -->
                @if (currentMode === 'demo') {
                  <!-- Partial path being drawn in Demo -->
                  @if (currentStroke && demoProgress > 0) {
                    <path 
                      [attr.d]="getDemoStrokePartialD()" 
                      class="demo-active-stroke" 
                      [attr.stroke]="getStrokeColor()" 
                      fill="none" 
                      stroke-linecap="round" 
                      stroke-linejoin="round" 
                      filter="url(#glow)" />
                  }

                  <!-- Compact 3D Pencil with its sharp tip placed EXACTLY at current point! -->
                  @if (demoCursorPos) {
                    <g [attr.transform]="'translate(' + demoCursorPos.x + ',' + demoCursorPos.y + ')'" class="magic-pencil-cursor">
                      <!-- Glowing star effect at pen tip -->
                      <circle r="12" fill="#fde047" opacity="0.7" filter="url(#glow)" />
                      <circle r="3.5" fill="#ffffff" />

                      <!-- 3D Pencil Graphic tilted at -35 degrees, tip centered at (0,0) -->
                      <g transform="rotate(-35)">
                        <!-- Pencil Body -->
                        <rect x="-5" y="-38" width="10" height="28" rx="2" fill="#f59e0b" stroke="#78350f" stroke-width="1" />
                        <rect x="-1.5" y="-38" width="3" height="28" fill="#fde047" />
                        <!-- Metal Ferrule Ring -->
                        <rect x="-5.5" y="-43" width="11" height="5" fill="#94a3b8" stroke="#475569" stroke-width="0.8" />
                        <!-- Eraser on top -->
                        <rect x="-5" y="-50" width="10" height="7" rx="2" fill="#f43f5e" stroke="#881337" stroke-width="0.8" />
                        <!-- Wood Cone -->
                        <polygon points="-5,-10 5,-10 0,0" fill="#fef08a" stroke="#78350f" stroke-width="0.8" />
                        <!-- Graphite Lead Tip touching origin (0,0) -->
                        <polygon points="-1.5,-4 1.5,-4 0,0" fill="#0f172a" />
                      </g>
                    </g>
                  }
                }

                <!-- Layer 6: Stroke Start Step Badges ① ② ③ -->
                @for (stroke of activeItem.strokes; track stroke.id) {
                  @if (shouldShowStrokeBadge(stroke)) {
                    <g 
                      class="stroke-badge" 
                      [attr.transform]="'translate(' + stroke.start.x + ',' + stroke.start.y + ')'" 
                      [class.badge-active]="currentStroke?.id === stroke.id">
                      <circle r="12" class="badge-bg" />
                      <text y="4.5" text-anchor="middle" class="badge-text">{{ stroke.id }}</text>
                    </g>
                  }
                }
              </svg>

              <!-- Live Sparkle Canvas Layer for Finger & Pencil Trails -->
              <canvas #sparkleCanvas class="sparkle-overlay"></canvas>
            </div>
          }

          <!-- 🎨 Free Slate Canvas Board (Used in Slate mode) -->
          @if (currentMode === 'slate') {
            <div class="slate-stage-container">
              <!-- Faint Watermark of the letter to guide independent writing -->
              <div class="slate-watermark">
                {{ activeItem.char }}
              </div>
              <canvas 
                #slateCanvas 
                class="slate-canvas"
                (pointerdown)="onSlatePointerDown($event)"
                (pointermove)="onSlatePointerMove($event)"
                (pointerup)="onSlatePointerUp($event)"
                (pointercancel)="onSlatePointerUp($event)">
              </canvas>
            </div>
          }

          <!-- Bottom Chalkboard Controls Toolbar -->
          <div class="board-bottom-toolbar">
            @if (currentMode === 'demo') {
              <button type="button" class="tool-btn btn-replay" (click)="replayDemo()">
                <span>🔁 फिर से देखो (Replay)</span>
              </button>
              <button type="button" class="tool-btn btn-action-trace" (click)="startTraceMode()">
                <span>✏️ अब मैं लिखूँगा! (Trace Now)</span>
              </button>
            } @else if (currentMode === 'trace') {
              <button type="button" class="tool-btn btn-demo-replay" (click)="startDemoMode()">
                <span>👀 देखो (Demo)</span>
              </button>
              <button type="button" class="tool-btn btn-reset" (click)="resetCurrentLetter()">
                <span>🧼 मिटाओ (Erase)</span>
              </button>
              <button type="button" class="tool-btn btn-free-slate" (click)="startSlateMode()">
                <span>🎨 जादुई स्लेट (Slate)</span>
              </button>
            } @else {
              <!-- Slate Color Palette -->
              <div class="slate-palette">
                @for (color of penColors; track color.name) {
                  <button 
                    type="button" 
                    class="color-dot-btn" 
                    [class.dot-active]="selectedPenColor === color.id"
                    [style.background]="color.css"
                    (click)="setPenColor(color.id)"
                    [title]="color.name">
                  </button>
                }
              </div>
              <button type="button" class="tool-btn btn-clear-slate" (click)="clearSlate()">
                <span>🧼 साफ करो (Clear)</span>
              </button>
              <button type="button" class="tool-btn btn-back-trace" (click)="startTraceMode()">
                <span>✨ गाइडेड ट्रेस</span>
              </button>
            }
          </div>
        </div>
      </main>

      <!-- Bottom Floating Navigation Footer -->
      <footer class="tracing-footer">
        <button 
          type="button" 
          (click)="prevLetter()" 
          class="nav-step-btn prev-btn" 
          id="btn-tracing-prev">
          <span>◀</span>
          <span>पिछला अक्षर</span>
        </button>

        <!-- Current Progress Pill -->
        <div class="progress-capsule">
          <span class="capsule-num">{{ activeIndex + 1 }} / {{ currentList.length }}</span>
          <span class="capsule-title">{{ activeItem.char }} • {{ activeItem.name }}</span>
        </div>

        <button 
          type="button" 
          (click)="nextLetter()" 
          class="nav-step-btn next-btn" 
          id="btn-tracing-next">
          <span>अगला अक्षर</span>
          <span>▶</span>
        </button>
      </footer>

      <!-- 🌟 Win Celebration Modal Card when Letter is completed! -->
      @if (showWinModal) {
        <div class="win-modal-backdrop animate-fade-in" (click)="closeWinModal()">
          <div class="win-modal-card animate-pop-up" (click)="$event.stopPropagation()">
            <div class="win-stars-row">
              <span class="star-win star-1">⭐</span>
              <span class="star-win star-2">⭐</span>
              <span class="star-win star-3">⭐</span>
            </div>

            <div class="win-char-bubble">
              <span class="win-char">{{ activeItem.char }}</span>
              <span class="win-emoji">{{ activeItem.emoji }}</span>
            </div>

            <h2 class="win-title">अद्भुत! Very Good!</h2>
            <p class="win-sub">आपने <strong>{{ activeItem.char }} ({{ activeItem.name }})</strong> बहुत सुंदर लिखा!</p>

            <div class="win-actions-grid">
              <button type="button" class="modal-btn btn-replay-write" (click)="practiceAgain()">
                <span>🔁 फिर से लिखो</span>
              </button>
              <button type="button" class="modal-btn btn-go-next" (click)="nextAfterWin()">
                <span>अगला अक्षर ➡️</span>
              </button>
            </div>
          </div>
        </div>
      }

      <!-- 🔲 All Letters Quick Grid Drawer / Modal -->
      @if (showGridModal) {
        <div class="grid-modal-backdrop" (click)="toggleGridModal()">
          <div class="grid-modal-card" (click)="$event.stopPropagation()">
            <div class="grid-modal-header">
              <div class="grid-title-cluster">
                <span class="grid-title-icon">🔲</span>
                <h3 class="grid-modal-title">अक्षर चुनें (Choose Any Letter)</h3>
              </div>
              <button type="button" class="grid-close-btn" (click)="toggleGridModal()">✕</button>
            </div>

            <div class="grid-items-container">
              @for (item of currentList; track item.id; let idx = $index) {
                <button 
                  type="button" 
                  class="grid-item-card" 
                  [class.grid-item-active]="idx === activeIndex"
                  (click)="selectFromGrid(idx)">
                  <span class="grid-char">{{ item.char }}</span>
                  <span class="grid-emoji">{{ item.emoji }}</span>
                  <span class="grid-name">{{ item.name }}</span>
                </button>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .tracing-viewport {
      min-height: 100vh;
      min-height: 100dvh;
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      user-select: none;
      overflow-x: hidden;
      transition: background 0.5s ease;
      touch-action: manipulation;
    }

    /* Floating Orbs */
    .bg-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(60px);
      pointer-events: none;
      z-index: 1;
      opacity: 0.45;
    }
    .orb-1 {
      width: 280px;
      height: 280px;
      background: radial-gradient(circle, #a855f7 0%, transparent 70%);
      top: 5%;
      left: -50px;
    }
    .orb-2 {
      width: 320px;
      height: 320px;
      background: radial-gradient(circle, #06b6d4 0%, transparent 70%);
      bottom: 10%;
      right: -60px;
    }

    /* 🌟 Header */
    .tracing-header {
      width: 100%;
      max-width: 980px;
      margin: 0 auto;
      padding: 10px 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      position: relative;
      z-index: 20;
    }

    .header-left, .header-right {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }

    .pill-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 14px;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.14);
      border: 1.5px solid rgba(255, 255, 255, 0.25);
      color: #ffffff;
      font-weight: 800;
      font-size: 0.82rem;
      cursor: pointer;
      backdrop-filter: blur(10px);
      transition: transform 0.2s, background 0.2s;
      flex-shrink: 0;
    }
    .pill-btn:hover {
      transform: translateY(-2px);
      background: rgba(255, 255, 255, 0.25);
    }

    .star-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 6px 12px;
      border-radius: 20px;
      background: rgba(245, 158, 11, 0.22);
      border: 1.5px solid #fbbf24;
      color: #fef08a;
      font-weight: 900;
      font-size: 0.82rem;
      cursor: pointer;
      backdrop-filter: blur(8px);
      transition: transform 0.2s;
      flex-shrink: 0;
    }
    .star-badge:hover {
      transform: scale(1.08);
    }

    /* Category Tabs */
    .category-tabs {
      display: flex;
      align-items: center;
      gap: 4px;
      background: rgba(15, 23, 42, 0.45);
      padding: 4px;
      border-radius: 24px;
      border: 1px solid rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(12px);
      flex-shrink: 1;
      min-width: 0;
    }
    .cat-tab {
      padding: 6px 12px;
      border-radius: 18px;
      border: none;
      background: transparent;
      color: rgba(255, 255, 255, 0.75);
      font-weight: 800;
      font-size: 0.78rem;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      white-space: nowrap;
    }
    .cat-tab:hover {
      color: #ffffff;
    }
    .cat-active {
      background: #ffffff;
      color: #0f172a;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      transform: scale(1.04);
    }

    .icon-btn {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.14);
      border: 1.5px solid rgba(255, 255, 255, 0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      cursor: pointer;
      color: #ffffff;
      backdrop-filter: blur(10px);
      transition: transform 0.2s;
      flex-shrink: 0;
    }
    .icon-btn:hover {
      transform: scale(1.1);
      background: rgba(255, 255, 255, 0.25);
    }

    @media (max-width: 600px) {
      .tracing-header {
        padding: 8px 10px;
        gap: 5px;
      }
      .header-left, .header-right {
        gap: 4px;
      }
      .pill-btn {
        padding: 5px 8px;
        font-size: 0.74rem;
        gap: 4px;
      }
      .star-badge {
        padding: 5px 8px;
        font-size: 0.74rem;
      }
      .category-tabs {
        padding: 3px;
        gap: 2px;
      }
      .cat-tab {
        padding: 5px 8px;
        font-size: 0.72rem;
      }
      .icon-btn {
        width: 32px;
        height: 32px;
        font-size: 14px;
      }
    }

    @media (max-width: 480px) {
      .tracing-header {
        padding: 6px 8px;
        gap: 3px;
      }
      .header-left, .header-right {
        gap: 3px;
      }
      .pill-btn {
        padding: 4px 6px;
        font-size: 0.7rem;
        gap: 2px;
      }
      .star-badge {
        padding: 4px 6px;
        font-size: 0.7rem;
      }
      .category-tabs {
        padding: 2px;
        gap: 2px;
      }
      .cat-tab {
        padding: 4px 6px;
        font-size: 0.68rem;
      }
      .icon-btn {
        width: 29px;
        height: 29px;
        font-size: 13px;
      }
    }

    @media (max-width: 360px) {
      .pill-btn .btn-text {
        display: none;
      }
      .cat-tab {
        padding: 3px 4px;
        font-size: 0.62rem;
      }
    }

    /* Hindi Sub Nav */
    .hindi-sub-nav {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 4px 14px 6px 14px;
      position: relative;
      z-index: 15;
    }
    .sub-pill {
      padding: 5px 12px;
      border-radius: 16px;
      background: rgba(0, 0, 0, 0.25);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: rgba(255, 255, 255, 0.85);
      font-size: 0.74rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }
    .sub-active {
      background: #fde047;
      color: #0f172a;
      border-color: #fde047;
      font-weight: 800;
    }

    /* Horizontal Letter Ribbon */
    .letter-strip-container {
      width: 100%;
      max-width: 980px;
      margin: 0 auto;
      padding: 4px 10px 8px 10px;
      display: flex;
      align-items: center;
      gap: 6px;
      position: relative;
      z-index: 15;
    }
    .strip-nav-btn {
      width: 32px;
      height: 48px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #ffffff;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      backdrop-filter: blur(8px);
      flex-shrink: 0;
      transition: all 0.2s;
    }
    .strip-nav-btn:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: scale(1.06);
    }
    .letter-strip {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 8px;
      overflow-x: auto;
      padding: 4px 2px;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
    }
    .letter-strip::-webkit-scrollbar {
      display: none;
    }
    .strip-item-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-width: 50px;
      height: 52px;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.12);
      border: 1.5px solid rgba(255, 255, 255, 0.18);
      color: #ffffff;
      cursor: pointer;
      flex-shrink: 0;
      transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      position: relative;
    }
    .strip-item-btn:hover {
      transform: translateY(-2px);
      background: rgba(255, 255, 255, 0.22);
    }
    .strip-item-active {
      background: #ffffff;
      color: #0f172a;
      border-color: #fde047;
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.3);
      transform: scale(1.12);
    }
    .strip-char {
      font-family: var(--font-display);
      font-size: 1.15rem;
      font-weight: 900;
      line-height: 1;
    }
    .strip-sub-emoji {
      font-size: 11px;
      margin-top: 2px;
    }

    /* 🌟 Main Stage */
    .tracing-stage {
      flex: 1;
      width: 100%;
      max-width: 980px;
      margin: 0 auto;
      padding: 6px 12px 12px 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      position: relative;
      z-index: 10;
    }

    @media (min-width: 768px) {
      .tracing-stage {
        flex-direction: row;
        align-items: stretch;
      }
    }

    /* Letter Info Card */
    .letter-info-card {
      width: 100%;
      max-width: 380px;
      background: rgba(15, 23, 42, 0.45);
      border: 1.5px solid rgba(255, 255, 255, 0.18);
      border-radius: 24px;
      padding: 14px 18px;
      display: flex;
      align-items: center;
      gap: 16px;
      backdrop-filter: blur(14px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
    }
    @media (min-width: 768px) {
      .letter-info-card {
        width: 250px;
        flex-direction: column;
        justify-content: center;
        text-align: center;
      }
    }

    .char-display-box {
      width: 80px;
      height: 80px;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.16);
      border: 2px solid rgba(255, 255, 255, 0.3);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
      cursor: pointer;
      flex-shrink: 0;
      transition: transform 0.2s;
    }
    @media (min-width: 768px) {
      .char-display-box {
        width: 110px;
        height: 110px;
      }
    }
    .char-display-box:hover {
      transform: scale(1.06);
    }
    .big-char {
      font-family: var(--font-display);
      font-size: clamp(2rem, 6vw, 3rem);
      font-weight: 900;
      color: #ffffff;
      text-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
      line-height: 1;
    }
    .mascot-emoji {
      position: absolute;
      bottom: -6px;
      right: -6px;
      font-size: 24px;
      filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.4));
    }

    .char-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 2px;
    }
    @media (min-width: 768px) {
      .char-details {
        align-items: center;
      }
    }
    .char-word {
      font-family: var(--font-display);
      font-size: 1.25rem;
      font-weight: 900;
      color: #ffffff;
      margin: 0;
    }
    .char-phonics {
      font-size: 0.84rem;
      color: #fde047;
      font-weight: 800;
    }
    .listen-btn {
      margin-top: 6px;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 5px 12px;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.25);
      color: #ffffff;
      font-size: 0.72rem;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.2s;
    }
    .listen-btn:hover {
      background: rgba(255, 255, 255, 0.28);
      transform: scale(1.05);
    }

    /* 🎨 Blackboard / Canvas Frame */
    .chalkboard-frame {
      flex: 1;
      width: 100%;
      max-width: 480px;
      background: #0f172a;
      border: 4px solid #334155;
      border-radius: 28px;
      box-shadow: 0 16px 40px -8px rgba(0, 0, 0, 0.5), inset 0 2px 8px rgba(255, 255, 255, 0.08);
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      overflow: hidden;
    }

    /* Board Mode Switcher Toolbar */
    .board-mode-toolbar {
      width: 100%;
      background: rgba(30, 41, 59, 0.85);
      padding: 6px 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      border-bottom: 2px solid rgba(255, 255, 255, 0.08);
    }
    .mode-switch-btn {
      flex: 1;
      max-width: 130px;
      padding: 6px 8px;
      border-radius: 14px;
      border: none;
      background: transparent;
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.75rem;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.2s;
    }
    .mode-btn-active {
      background: #38bdf8;
      color: #0f172a;
      box-shadow: 0 3px 10px rgba(56, 189, 248, 0.35);
      font-weight: 900;
    }

    /* Step Banner */
    .step-guide-banner {
      width: 100%;
      padding: 8px 12px;
      background: rgba(15, 23, 42, 0.65);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      border-bottom: 1px dashed rgba(255, 255, 255, 0.12);
    }
    .guide-tag {
      font-size: 0.65rem;
      font-weight: 900;
      background: #8b5cf6;
      color: #ffffff;
      padding: 3px 8px;
      border-radius: 10px;
      letter-spacing: 0.03em;
      flex-shrink: 0;
    }
    .tag-success {
      background: #10b981;
    }
    .guide-text {
      font-size: 0.82rem;
      color: #f1f5f9;
      font-weight: 700;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
      text-align: center;
    }
    .speed-toggle-btn, .hint-mini-btn {
      padding: 3px 8px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.25);
      color: #fde047;
      font-size: 0.7rem;
      font-weight: 800;
      cursor: pointer;
      flex-shrink: 0;
      transition: transform 0.2s;
    }
    .speed-toggle-btn:hover, .hint-mini-btn:hover {
      transform: scale(1.05);
      background: rgba(255, 255, 255, 0.25);
    }

    /* SVG Tracing Stage */
    .svg-stage-container {
      width: 100%;
      aspect-ratio: 1 / 1;
      max-width: 360px;
      max-height: 360px;
      margin: 8px auto;
      position: relative;
      touch-action: none;
    }
    .tracing-svg {
      width: 100%;
      height: 100%;
      display: block;
      touch-action: none;
    }

    /* Track Styles */
    .bg-track {
      stroke: rgba(255, 255, 255, 0.15);
      stroke-width: 26;
    }
    .dotted-track {
      stroke: rgba(255, 255, 255, 0.45);
      stroke-width: 4;
      stroke-dasharray: 6 9;
    }
    .completed-stroke {
      stroke-width: 22;
    }

    /* 🌊 Moving Flowing Dashes to show drawing direction clearly! */
    .flow-guide-path {
      stroke: #38bdf8;
      stroke-width: 5;
      stroke-dasharray: 10 16;
      stroke-linecap: round;
      animation: flowArrows 1.2s linear infinite;
      opacity: 0.95;
      filter: drop-shadow(0 0 5px #38bdf8);
    }
    @keyframes flowArrows {
      from { stroke-dashoffset: 26; }
      to { stroke-dashoffset: 0; }
    }

    .partial-fill-stroke {
      stroke-width: 22;
    }
    .demo-active-stroke {
      stroke-width: 22;
    }
    .live-finger-stroke {
      stroke-width: 20;
      opacity: 0.85;
    }

    /* Start Marker Beacon */
    .start-pulse-ring {
      fill: none;
      stroke: #10b981;
      stroke-width: 3;
      animation: pulseMarker 1.3s infinite ease-out;
    }
    .start-dot {
      fill: #10b981;
      filter: drop-shadow(0 0 8px #10b981);
    }
    .start-num {
      fill: #ffffff;
      font-size: 11px;
      font-weight: 900;
    }

    /* Numbered Badges */
    .stroke-badge {
      opacity: 0.9;
      transition: transform 0.2s;
    }
    .badge-bg {
      fill: #3b82f6;
      stroke: #ffffff;
      stroke-width: 1.5;
    }
    .badge-text {
      fill: #ffffff;
      font-size: 11px;
      font-weight: 900;
    }
    .badge-active {
      transform: scale(1.25);
    }
    .badge-active .badge-bg {
      fill: #f59e0b;
      filter: drop-shadow(0 0 6px #f59e0b);
    }

    /* Magic Pencil Cursor in Demo */
    .magic-pencil-cursor {
      pointer-events: none;
      filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.5));
    }

    /* Sparkle Particle Overlay */
    .sparkle-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }

    /* Slate Mode Stage */
    .slate-stage-container {
      width: 100%;
      aspect-ratio: 1 / 1;
      max-width: 360px;
      max-height: 360px;
      margin: 8px auto;
      position: relative;
      touch-action: none;
      border-radius: 18px;
      overflow: hidden;
    }
    .slate-watermark {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      font-family: var(--font-display, system-ui, sans-serif);
      font-size: clamp(9.5rem, 46vw, 15.5rem);
      font-weight: 900;
      color: rgba(255, 255, 255, 0.15);
      text-shadow: 0 0 15px rgba(255, 255, 255, 0.08);
      pointer-events: none;
      user-select: none;
      line-height: 1;
    }
    .slate-canvas {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: block;
      cursor: crosshair;
      touch-action: none;
    }

    /* Bottom Toolbar */
    .board-bottom-toolbar {
      width: 100%;
      padding: 8px 12px;
      background: rgba(30, 41, 59, 0.85);
      border-top: 2px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .tool-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 7px 14px;
      border-radius: 16px;
      border: none;
      font-size: 0.76rem;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.2s;
    }
    .tool-btn:hover {
      transform: scale(1.05);
    }
    .btn-replay, .btn-demo-replay {
      background: rgba(255, 255, 255, 0.15);
      color: #ffffff;
    }
    .btn-action-trace {
      background: #10b981;
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
    }
    .btn-reset {
      background: #f43f5e;
      color: #ffffff;
    }
    .btn-free-slate {
      background: #8b5cf6;
      color: #ffffff;
    }
    .btn-clear-slate {
      background: #ef4444;
      color: #ffffff;
    }
    .btn-back-trace {
      background: #0ea5e9;
      color: #ffffff;
    }

    /* Palette Dots */
    .slate-palette {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .color-dot-btn {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 2px solid #ffffff;
      cursor: pointer;
      transition: transform 0.2s;
    }
    .color-dot-btn:hover {
      transform: scale(1.15);
    }
    .dot-active {
      transform: scale(1.25);
      box-shadow: 0 0 10px #ffffff;
    }

    /* Bottom Navigation Footer */
    .tracing-footer {
      width: 100%;
      max-width: 980px;
      margin: 0 auto;
      padding: 10px 14px 14px 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      position: relative;
      z-index: 20;
    }
    .nav-step-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 10px 18px;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.18);
      border: 1.5px solid rgba(255, 255, 255, 0.3);
      color: #ffffff;
      font-size: 0.85rem;
      font-weight: 800;
      cursor: pointer;
      backdrop-filter: blur(10px);
      transition: all 0.2s;
    }
    .nav-step-btn:hover {
      background: rgba(255, 255, 255, 0.3);
      transform: scale(1.05);
    }
    .progress-capsule {
      display: flex;
      flex-direction: column;
      align-items: center;
      background: rgba(0, 0, 0, 0.35);
      padding: 4px 14px;
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.15);
    }
    .capsule-num {
      font-size: 0.72rem;
      color: #fde047;
      font-weight: 800;
    }
    .capsule-title {
      font-size: 0.82rem;
      color: #ffffff;
      font-weight: 900;
    }

    /* 🌟 Win Modal Card */
    .win-modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(8px);
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }
    .win-modal-card {
      width: 100%;
      max-width: 360px;
      background: linear-gradient(145deg, #1e1b4b 0%, #0f172a 100%);
      border: 3px solid #fde047;
      border-radius: 32px;
      padding: 24px 20px;
      text-align: center;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(253, 224, 71, 0.4);
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .win-stars-row {
      display: flex;
      gap: 6px;
      font-size: 32px;
      margin-bottom: 8px;
    }
    .star-win {
      animation: bounceStar 1s infinite alternate ease-in-out;
    }
    .star-1 { animation-delay: 0s; }
    .star-2 { animation-delay: 0.2s; font-size: 40px; }
    .star-3 { animation-delay: 0.4s; }

    .win-char-bubble {
      width: 90px;
      height: 90px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.15);
      border: 3px solid #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      margin: 8px 0 12px 0;
    }
    .win-char {
      font-family: var(--font-display);
      font-size: 42px;
      font-weight: 900;
      color: #ffffff;
    }
    .win-emoji {
      position: absolute;
      bottom: -6px;
      right: -6px;
      font-size: 26px;
    }
    .win-title {
      font-family: var(--font-display);
      font-size: 1.5rem;
      font-weight: 900;
      color: #fde047;
      margin: 0;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
    }
    .win-sub {
      color: #e2e8f0;
      font-size: 0.9rem;
      margin: 6px 0 18px 0;
    }
    .win-actions-grid {
      width: 100%;
      display: flex;
      gap: 10px;
    }
    .modal-btn {
      flex: 1;
      padding: 12px 14px;
      border-radius: 20px;
      border: none;
      font-family: var(--font-display);
      font-size: 0.88rem;
      font-weight: 900;
      cursor: pointer;
      transition: transform 0.2s;
    }
    .modal-btn:hover {
      transform: scale(1.05);
    }
    .btn-replay-write {
      background: rgba(255, 255, 255, 0.15);
      color: #ffffff;
    }
    .btn-go-next {
      background: #10b981;
      color: #ffffff;
      box-shadow: 0 6px 18px rgba(16, 185, 129, 0.4);
    }

    /* 🔲 All Letters Grid Modal */
    .grid-modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(8px);
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }
    .grid-modal-card {
      width: 100%;
      max-width: 600px;
      max-height: 85vh;
      background: #0f172a;
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: 28px;
      padding: 18px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7);
    }
    .grid-modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 14px;
      padding-bottom: 10px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.12);
    }
    .grid-title-cluster {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .grid-modal-title {
      font-family: var(--font-display);
      font-size: 1.15rem;
      font-weight: 900;
      color: #ffffff;
      margin: 0;
    }
    .grid-close-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.12);
      border: none;
      color: #ffffff;
      font-size: 16px;
      cursor: pointer;
    }
    .grid-items-container {
      flex: 1;
      overflow-y: auto;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(75px, 1fr));
      gap: 10px;
      padding: 4px;
    }
    .grid-item-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 10px 4px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.08);
      border: 1.5px solid rgba(255, 255, 255, 0.15);
      color: #ffffff;
      cursor: pointer;
      transition: all 0.2s;
    }
    .grid-item-card:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-2px);
    }
    .grid-item-active {
      background: #fde047;
      color: #0f172a;
      border-color: #fde047;
      font-weight: 900;
    }
    .grid-char {
      font-family: var(--font-display);
      font-size: 1.35rem;
      font-weight: 900;
      line-height: 1;
    }
    .grid-emoji {
      font-size: 14px;
      margin-top: 3px;
    }
    .grid-name {
      font-size: 0.62rem;
      font-weight: 700;
      margin-top: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 90%;
    }

    /* Keyframes */
    @keyframes pulseMarker {
      0% { transform: scale(0.85); opacity: 1; }
      100% { transform: scale(2.4); opacity: 0; }
    }
    @keyframes bounceStar {
      0% { transform: translateY(0) scale(1); }
      100% { transform: translateY(-8px) scale(1.15); }
    }
  `]
})
export class LetterTracingComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('sparkleCanvas') sparkleCanvasRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('slateCanvas') slateCanvasRef?: ElementRef<HTMLCanvasElement>;
  @ViewChild('svgCanvas') svgCanvasRef?: ElementRef<SVGSVGElement>;
  @ViewChild('letterStrip') letterStripRef?: ElementRef<HTMLDivElement>;

  // Data & State
  activeCategory: 'alphabet' | 'number' | 'hindi' = 'alphabet';
  hindiFilter: 'all' | 'swar' | 'vyanjan' = 'all';

  currentList: TracingItem[] = ALPHABET_ITEMS;
  activeIndex = 0;
  totalStars = 28;

  // Mode: 'demo' | 'trace' | 'slate'
  currentMode: 'demo' | 'trace' | 'slate' = 'trace';
  demoSpeed: 'slow' | 'normal' = 'normal';

  // Tracing State
  currentStrokeIndex = 0;
  completedStrokes: StrokeDef[] = [];
  activeStrokeProgress = 0; // 0 to 1 along current stroke
  isPointerDown = false;
  livePointerPath = '';
  hasActiveStrokeTracking = false;

  // Free Slate State
  selectedPenColor = 'rainbow';
  penColors = [
    { id: 'rainbow', name: 'Rainbow Sparkle', css: 'linear-gradient(135deg, #f43f5e, #eab308, #10b981, #06b6d4, #8b5cf6)' },
    { id: 'gold', name: 'Gold Magic', css: '#f59e0b' },
    { id: 'cyan', name: 'Neon Sky', css: '#06b6d4' },
    { id: 'pink', name: 'Candy Pink', css: '#ec4899' },
    { id: 'lime', name: 'Apple Green', css: '#10b981' },
    { id: 'white', name: 'Classroom Chalk', css: '#ffffff' }
  ];
  isSlateDrawing = false;
  lastSlatePoint: { x: number; y: number } | null = null;

  // Demo Animation State
  demoProgress = 0; // 0 to 1
  demoCursorPos: { x: number; y: number } | null = null;
  currentDemoStepText = '';
  private demoRafId: number | null = null;
  private demoTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private isDemoRunning = false;
  private demoRunId = 0;

  // Completion Modals
  isItemCompleted = false;
  showWinModal = false;
  showGridModal = false;

  // Particles
  private particles: Particle[] = [];
  private particleAnimFrameId: number | null = null;

  get activeItem(): TracingItem {
    return this.currentList[this.activeIndex] || ALPHABET_ITEMS[0];
  }

  get currentStroke(): StrokeDef | undefined {
    return this.activeItem.strokes[this.currentStrokeIndex];
  }

  get totalHindiCount(): number {
    return HINDI_ITEMS.length;
  }

  constructor(
    public appNav: AppNavService,
    public sound: SoundService,
    public speech: SpeechService,
    private confetti: ConfettiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const targetCat = this.appNav.tracingTargetCategory();
    if (targetCat) {
      this.activeCategory = targetCat;
    }
    this.refreshCurrentList();

    const targetChar = this.appNav.tracingTargetChar();
    if (targetChar) {
      const idx = this.currentList.findIndex(item => item.id === targetChar || item.char === targetChar);
      if (idx !== -1) {
        this.activeIndex = idx;
      }
    }

    const savedStars = localStorage.getItem('toddler_total_stars');
    if (savedStars) {
      this.totalStars = parseInt(savedStars, 10) || 28;
    }

    this.resetCurrentLetter();
  }

  ngAfterViewInit(): void {
    this.initParticleCanvas();
    this.initSlateCanvas();
    this.scrollToActiveStrip();
    setTimeout(() => {
      this.speakActiveLetter();
    }, 450);
  }

  ngOnDestroy(): void {
    this.stopDemoAnimation();
    if (this.particleAnimFrameId) {
      cancelAnimationFrame(this.particleAnimFrameId);
      this.particleAnimFrameId = null;
    }
  }

  // -------------------------------------------------------------
  // Navigation & Category Management
  // -------------------------------------------------------------
  setCategory(cat: 'alphabet' | 'number' | 'hindi'): void {
    this.sound.playTap();
    this.activeCategory = cat;
    this.refreshCurrentList();
    this.activeIndex = 0;
    this.resetCurrentLetter();
    this.scrollToActiveStrip();
    this.speakActiveLetter();
  }

  setHindiFilter(filter: 'all' | 'swar' | 'vyanjan'): void {
    this.sound.playTap();
    this.hindiFilter = filter;
    this.refreshCurrentList();
    this.activeIndex = 0;
    this.resetCurrentLetter();
    this.scrollToActiveStrip();
  }

  private refreshCurrentList(): void {
    if (this.activeCategory === 'alphabet') {
      this.currentList = ALPHABET_ITEMS;
    } else if (this.activeCategory === 'number') {
      this.currentList = NUMBER_ITEMS;
    } else {
      if (this.hindiFilter === 'swar') {
        this.currentList = HINDI_ITEMS.filter(item => item.subCategory === 'swar');
      } else if (this.hindiFilter === 'vyanjan') {
        this.currentList = HINDI_ITEMS.filter(item => item.subCategory === 'vyanjan');
      } else {
        this.currentList = HINDI_ITEMS;
      }
    }
  }

  selectItemByIndex(idx: number): void {
    this.sound.playTap();
    this.activeIndex = idx;
    this.resetCurrentLetter();
    this.scrollToActiveStrip();
    this.speakActiveLetter();
  }

  nextLetter(): void {
    this.sound.playTap();
    if (this.activeIndex < this.currentList.length - 1) {
      this.activeIndex++;
    } else {
      this.activeIndex = 0;
    }
    this.resetCurrentLetter();
    this.scrollToActiveStrip();
    this.speakActiveLetter();
  }

  prevLetter(): void {
    this.sound.playTap();
    if (this.activeIndex > 0) {
      this.activeIndex--;
    } else {
      this.activeIndex = this.currentList.length - 1;
    }
    this.resetCurrentLetter();
    this.scrollToActiveStrip();
    this.speakActiveLetter();
  }

  private scrollToActiveStrip(): void {
    if (!this.letterStripRef) return;
    setTimeout(() => {
      const container = this.letterStripRef?.nativeElement;
      if (!container) return;
      const activeBtn = container.querySelector('.strip-item-active') as HTMLElement;
      if (activeBtn) {
        activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }, 100);
  }

  goBack(): void {
    this.sound.playTap();
    this.appNav.goToHub();
  }

  // -------------------------------------------------------------
  // Mode Switching
  // -------------------------------------------------------------
  startDemoMode(): void {
    this.sound.playTap();
    this.currentMode = 'demo';
    this.resetCurrentLetter();
    this.runDemoAnimation();
    // FIX: the sparkle <canvas> is re-created when switching modes; re-size it
    setTimeout(() => this.initParticleCanvas(), 50);
  }

  startTraceMode(): void {
    this.sound.playTap();
    this.stopDemoAnimation();
    this.currentMode = 'trace';
    this.resetCurrentLetter();
    // FIX: the sparkle <canvas> is re-created when switching modes; re-size it
    setTimeout(() => this.initParticleCanvas(), 50);
    const prompt = this.activeCategory === 'hindi'
      ? `चलो ${this.activeItem.char} लिखें! पहले बिंदु से उंगली फेरो!`
      : `Let's trace letter ${this.activeItem.char}! Start from dot 1!`;
    this.speech.speak(prompt, this.activeCategory === 'hindi' ? 'hi' : 'en');
  }

  startSlateMode(): void {
    this.sound.playTap();
    this.stopDemoAnimation();
    this.currentMode = 'slate';
    this.particles = []; // no sparkle canvas in slate mode
    setTimeout(() => {
      this.initSlateCanvas();
    }, 40);
  }

  toggleDemoSpeed(): void {
    this.sound.playTap();
    this.demoSpeed = this.demoSpeed === 'slow' ? 'normal' : 'slow';
    if (this.currentMode === 'demo') {
      this.replayDemo();
    }
  }

  showCurrentStrokeHint(): void {
    this.sound.playHint();
    if (!this.currentStroke) return;
    const stroke = this.currentStroke;
    let t = 0;
    const interval = setInterval(() => {
      t += 0.05;
      if (t > 1) {
        clearInterval(interval);
        return;
      }
      const pt = getStrokePoint(stroke, t);
      this.spawnSparkleFromSvg(pt.x, pt.y);
    }, 30);
  }

  // -------------------------------------------------------------
  // Reset & Helpers
  // -------------------------------------------------------------
  resetCurrentLetter(): void {
    // FIX: clear the free-slate drawing whenever the letter changes / is reset
    this.wipeSlate();
    this.stopDemoAnimation();
    this.currentStrokeIndex = 0;
    this.completedStrokes = [];
    this.activeStrokeProgress = 0;
    this.hasActiveStrokeTracking = false;
    this.isItemCompleted = false;
    this.showWinModal = false;
    this.livePointerPath = '';
    this.isPointerDown = false;
  }

  isStrokeCompleted(strokeId: number): boolean {
    return this.completedStrokes.some(s => s.id === strokeId);
  }

  shouldShowStrokeBadge(stroke: StrokeDef): boolean {
    if (this.isItemCompleted) return false;
    if (this.isStrokeCompleted(stroke.id)) return false;
    // Current stroke is already prominently highlighted by the start-marker-group
    if (this.currentStroke?.id === stroke.id) return false;

    // Don't show upcoming stroke badge if it collides with current stroke or earlier pending stroke
    const pendingStrokes = this.activeItem.strokes.filter(s => !this.isStrokeCompleted(s.id));
    const earlierClash = pendingStrokes.some(
      s => s.id < stroke.id && Math.hypot(s.start.x - stroke.start.x, s.start.y - stroke.start.y) < 28
    );
    return !earlierClash;
  }

  getStrokeColor(): string {
    if (this.selectedPenColor === 'gold') return 'url(#goldGrad)';
    if (this.selectedPenColor === 'cyan') return 'url(#cyanGrad)';
    if (this.selectedPenColor === 'pink') return '#f472b6';
    if (this.selectedPenColor === 'lime') return '#4ade80';
    if (this.selectedPenColor === 'white') return '#ffffff';
    return 'url(#rainbowGrad)';
  }

  getStartMarkerPos(): { x: number; y: number } {
    if (!this.currentStroke) return { x: 100, y: 100 };
    if (this.activeStrokeProgress > 0) {
      return getStrokePoint(this.currentStroke, this.activeStrokeProgress);
    }
    return this.currentStroke.start;
  }

  getActiveStrokePartialD(): string {
    if (!this.currentStroke) return 'M 0 0';
    const d = getPartialPathD(this.currentStroke, this.activeStrokeProgress);
    return d && d.startsWith('M') ? d : 'M 0 0';
  }

  getDemoStrokePartialD(): string {
    if (!this.currentStroke) return 'M 0 0';
    const d = getPartialPathD(this.currentStroke, this.demoProgress);
    return d && d.startsWith('M') ? d : 'M 0 0';
  }

  // -------------------------------------------------------------
  // 🌟 Ultra-Clear, Smooth "Watch & Learn" Demo
  // -------------------------------------------------------------
  private runDemoAnimation(): void {
    this.stopDemoAnimation();
    this.isDemoRunning = true;
    this.isItemCompleted = false;
    this.completedStrokes = [];
    this.currentStrokeIndex = 0;
    this.demoProgress = 0;
    const runId = ++this.demoRunId;
    this.cdr.detectChanges();

    const strokes = this.activeItem.strokes;
    let sIdx = 0;

    const runStroke = () => {
      if (!this.isDemoRunning || this.demoRunId !== runId) return;

      if (sIdx >= strokes.length) {
        // Complete Demo!
        this.isItemCompleted = true; // Turn off flow-guide-path and beacons so full letter is clear
        this.currentDemoStepText = this.activeCategory === 'hindi'
          ? `शाबाश! यह बना ${this.activeItem.char}!`
          : `Great! That's letter ${this.activeItem.char}!`;
        this.sound.playSuccess();
        this.demoCursorPos = null;
        this.demoProgress = 0;
        this.confetti.fire();
        this.cdr.detectChanges();
        setTimeout(() => {
          if (this.isDemoRunning && this.demoRunId === runId) {
            this.speech.speak(
              this.activeCategory === 'hindi'
                ? 'अब आपकी बारी! उंगली से लिखो!'
                : "Now it's your turn to trace!",
              this.activeCategory === 'hindi' ? 'hi' : 'en'
            );
          }
        }, 600);
        return;
      }

      this.currentStrokeIndex = sIdx;
      const stroke = strokes[sIdx];
      this.currentDemoStepText = this.activeCategory === 'hindi' ? stroke.labelHi : stroke.labelEn;

      // Announce step voice clearly
      this.speech.speak(this.currentDemoStepText, this.activeCategory === 'hindi' ? 'hi' : 'en');

      // 1. Move pencil to start point and pause for 500ms so child sees where it starts
      this.demoCursorPos = stroke.start;
      this.demoProgress = 0;
      this.sound.playTap();
      this.cdr.detectChanges();

      this.demoTimeoutId = setTimeout(() => {
        if (!this.isDemoRunning || this.demoRunId !== runId) return;

        // Smooth drawing duration: 1.6s (or 2.4s if slow)
        const duration = this.demoSpeed === 'slow' ? 2400 : 1600;
        const startTime = performance.now();
        let lastPopTime = 0;

        const animateFrame = (now: number) => {
          if (!this.isDemoRunning || this.demoRunId !== runId) return;
          const elapsed = now - startTime;
          const t = Math.min(1, elapsed / duration);
          this.demoProgress = t;
          this.demoCursorPos = getStrokePoint(stroke, t);
          this.spawnSparkleFromSvg(this.demoCursorPos.x, this.demoCursorPos.y);

          // Pop sound every 160ms
          if (now - lastPopTime > 160) {
            lastPopTime = now;
            this.sound.playPop(1 + t * 0.4);
          }

          // Force Angular to render pencil movement and stroke drawing at 60fps
          this.cdr.detectChanges();

          if (t < 1) {
            this.demoRafId = requestAnimationFrame(animateFrame);
          } else {
            // Finished this stroke!
            this.completedStrokes.push(stroke);
            this.demoProgress = 1;
            this.sound.playSnap();
            this.cdr.detectChanges();
            sIdx++;

            // Pause 400ms before next stroke
            this.demoTimeoutId = setTimeout(() => {
              if (this.isDemoRunning && this.demoRunId === runId) {
                runStroke();
              }
            }, 400);
          }
        };

        this.demoRafId = requestAnimationFrame(animateFrame);
      }, 500);
    };

    runStroke();
  }

  replayDemo(): void {
    this.sound.playTap();
    this.runDemoAnimation();
  }

  private stopDemoAnimation(): void {
    this.demoRunId++;
    this.isDemoRunning = false;
    if (this.demoRafId) {
      cancelAnimationFrame(this.demoRafId);
      this.demoRafId = null;
    }
    if (this.demoTimeoutId) {
      clearTimeout(this.demoTimeoutId);
      this.demoTimeoutId = null;
    }
    this.demoCursorPos = null;
    this.demoProgress = 0;
    this.cdr.detectChanges();
  }

  // -------------------------------------------------------------
  // 🌟 Ultra-Responsive, Toddler-Friendly Guided Tracing
  // -------------------------------------------------------------
  onPointerDown(e: PointerEvent): void {
    if (this.currentMode !== 'trace' || this.isItemCompleted) return;
    this.isPointerDown = true;
    (e.target as Element)?.setPointerCapture?.(e.pointerId);

    const pt = this.getSvgCoordinates(e);
    if (!pt) return;

    // ALWAYS start drawing the finger trail immediately with 'M' command!
    const x = Math.round(pt.x);
    const y = Math.round(pt.y);
    this.livePointerPath = `M ${x} ${y}`;
    this.spawnSparkleFromSvg(x, y);

    const stroke = this.currentStroke;
    if (!stroke) return;

    // Check proximity to stroke start or current marker (precise 32px radius)
    const currentMarker = this.getStartMarkerPos();
    const distToMarker = Math.hypot(x - currentMarker.x, y - currentMarker.y);
    const distToStart = Math.hypot(x - stroke.start.x, y - stroke.start.y);

    if (distToMarker <= 32 || (this.activeStrokeProgress === 0 && distToStart <= 32) || (this.activeStrokeProgress > 0 && distToMarker <= 36)) {
      this.hasActiveStrokeTracking = true;
      this.updateTracingProgress(pt);
    }
    this.cdr.detectChanges();
  }

  onPointerMove(e: PointerEvent): void {
    if (!this.isPointerDown || this.currentMode !== 'trace' || this.isItemCompleted) return;
    const pt = this.getSvgCoordinates(e);
    if (!pt) return;

    const x = Math.round(pt.x);
    const y = Math.round(pt.y);

    // CRITICAL: Guarantee livePointerPath ALWAYS starts with 'M' command!
    if (!this.livePointerPath || !this.livePointerPath.startsWith('M')) {
      this.livePointerPath = `M ${x} ${y}`;
    } else {
      this.livePointerPath += ` L ${x} ${y}`;
    }
    this.spawnSparkleFromSvg(x, y);

    if (this.hasActiveStrokeTracking) {
      this.updateTracingProgress(pt);
    } else {
      // Check if finger moved close to current marker
      const currentMarker = this.getStartMarkerPos();
      const dist = Math.hypot(x - currentMarker.x, y - currentMarker.y);
      if (dist <= 32) {
        this.hasActiveStrokeTracking = true;
        this.sound.playPop(1);
        this.updateTracingProgress(pt);
      }
    }
    this.cdr.detectChanges();
  }

  onPointerUp(e: PointerEvent): void {
    if (!this.isPointerDown) return;
    this.isPointerDown = false;
    this.hasActiveStrokeTracking = false;
    this.livePointerPath = '';

    const stroke = this.currentStroke;
    if (!stroke) return;

    // If child reached 88%+ of the stroke, snap to 100% complete!
    if (this.activeStrokeProgress >= 0.88) {
      this.completeCurrentStroke();
    } else if (this.activeStrokeProgress > 0) {
      // Child lifted finger mid-stroke: Keep their progress! Give gentle encouraging chime
      this.sound.playPop(1.1);
    }
    this.cdr.detectChanges();
  }

  private updateTracingProgress(pt: { x: number; y: number }): void {
    const stroke = this.currentStroke;
    if (!stroke) return;

    const wps = stroke.waypoints;
    if (!wps || wps.length === 0) return;

    // Single-point strokes (bindi / visarga dots): complete on touch
    if (wps.length === 1) {
      if (Math.hypot(pt.x - stroke.start.x, pt.y - stroke.start.y) <= 32) {
        this.completeCurrentStroke();
      }
      return;
    }

    // Find the closest waypoint to touch (strict 28px tolerance prevents cross-loop false jumps)
    let closestIdx = -1;
    let closestDist = 28;

    for (let i = 0; i < wps.length; i++) {
      const d = Math.hypot(pt.x - wps[i].x, pt.y - wps[i].y);
      if (d < closestDist) {
        closestDist = d;
        closestIdx = i;
      }
    }

    // Also check if near stroke end only after child has already traced at least 80%
    const distToEnd = Math.hypot(pt.x - stroke.end.x, pt.y - stroke.end.y);
    if (distToEnd <= 25 && this.activeStrokeProgress >= 0.80) {
      closestIdx = wps.length - 1;
    }

    if (closestIdx !== -1) {
      const candidateProgress = closestIdx / (wps.length - 1);
      // Strictly guard progress jump (max 0.22 per event) to ensure true tracing
      if (candidateProgress >= this.activeStrokeProgress && candidateProgress <= this.activeStrokeProgress + 0.22) {
        const prev = this.activeStrokeProgress;
        this.activeStrokeProgress = candidateProgress;

        if (candidateProgress - prev > 0.08) {
          this.sound.playPop(1 + candidateProgress * 0.5);
        }

        // Auto-complete if reached 90%+ of stroke
        if (this.activeStrokeProgress >= 0.90) {
          this.completeCurrentStroke();
        }
      }
    }
  }

  private completeCurrentStroke(): void {
    const stroke = this.currentStroke;
    if (!stroke) return;

    this.activeStrokeProgress = 1;
    this.completedStrokes.push(stroke);
    this.livePointerPath = '';
    this.isPointerDown = false; // Disengage pointer so next stroke requires intentional start at dot
    this.hasActiveStrokeTracking = false;
    this.sound.playSnap();
    this.sound.playSuccess();

    this.currentStrokeIndex++;
    this.activeStrokeProgress = 0;

    if (this.currentStrokeIndex >= this.activeItem.strokes.length) {
      // Completed entire Letter!
      this.triggerCompletion();
    } else {
      // Next stroke prompt
      const next = this.currentStroke;
      if (next) {
        const prompt = this.activeCategory === 'hindi' ? next.labelHi : next.labelEn;
        this.speech.speak(prompt, this.activeCategory === 'hindi' ? 'hi' : 'en');
      }
    }
    this.cdr.detectChanges();
  }

  // 100% Mathematically exact coordinate translation from screen to SVG viewBox
  private getSvgCoordinates(e: PointerEvent): { x: number; y: number } | null {
    const svg = this.svgCanvasRef?.nativeElement;
    if (!svg) return null;

    try {
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const ctm = svg.getScreenCTM();
      if (!ctm) return null;
      const svgPt = pt.matrixTransform(ctm.inverse());
      if (isNaN(svgPt.x) || isNaN(svgPt.y)) return null;
      return { x: svgPt.x, y: svgPt.y };
    } catch {
      const rect = svg.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return null;
      const x = ((e.clientX - rect.left) / rect.width) * 200;
      const y = ((e.clientY - rect.top) / rect.height) * 200;
      if (isNaN(x) || isNaN(y)) return null;
      return { x, y };
    }
  }

  // Helper to spawn sparkles scaled accurately from SVG 0-200 coordinates to screen canvas pixels
  private spawnSparkleFromSvg(svgX: number, svgY: number): void {
    const canvas = this.sparkleCanvasRef?.nativeElement;
    if (!canvas || canvas.width === 0) return;
    const scaleX = canvas.width / 200;
    const scaleY = canvas.height / 200;
    this.spawnSparkle(svgX * scaleX, svgY * scaleY);
  }

  private triggerCompletion(): void {
    this.isItemCompleted = true;
    this.confetti.fire();
    this.sound.playFanfare();

    this.totalStars += 3;
    localStorage.setItem('toddler_total_stars', this.totalStars.toString());

    this.speech.speak(
      this.activeCategory === 'hindi'
        ? `वाह! आपने बहुत सुंदर लिखा! ${this.activeItem.char} से ${this.activeItem.name}!`
        : `Awesome! You wrote letter ${this.activeItem.char}! ${this.activeItem.char} for ${this.activeItem.name}!`,
      this.activeCategory === 'hindi' ? 'hi' : 'en'
    );

    setTimeout(() => {
      this.showWinModal = true;
    }, 600);
  }

  closeWinModal(): void {
    this.showWinModal = false;
  }

  practiceAgain(): void {
    this.sound.playTap();
    this.closeWinModal();
    this.resetCurrentLetter();
  }

  nextAfterWin(): void {
    this.sound.playTap();
    this.closeWinModal();
    this.nextLetter();
  }

  // -------------------------------------------------------------
  // Free Slate Canvas ("जादुई स्लेट")
  // -------------------------------------------------------------
  private initSlateCanvas(): void {
    const canvas = this.slateCanvasRef?.nativeElement;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    const targetW = Math.round(rect.width * dpr);
    const targetH = Math.round(rect.height * dpr);

    if (canvas.width === targetW && canvas.height === targetH) return;

    // Preserve any existing strokes across minor resizes if possible
    let existingData: ImageData | null = null;
    const ctx = canvas.getContext('2d');
    if (ctx && canvas.width > 0 && canvas.height > 0) {
      try {
        existingData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      } catch {
        existingData = null;
      }
    }

    canvas.width = targetW;
    canvas.height = targetH;

    if (ctx) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      if (existingData) {
        ctx.putImageData(existingData, 0, 0);
      }
    }
  }

  // FIX: fully clears the slate (used on letter change and by the Clear button)
  private wipeSlate(): void {
    const canvas = this.slateCanvasRef?.nativeElement;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    this.isSlateDrawing = false;
    this.lastSlatePoint = null;
  }

  setPenColor(colorId: string): void {
    this.sound.playTap();
    this.selectedPenColor = colorId;
  }

  clearSlate(): void {
    this.sound.playBalloonBurst();
    this.wipeSlate();
  }

  private getSlatePoint(e: PointerEvent, canvas: HTMLCanvasElement): { x: number; y: number } {
    const rect = canvas.getBoundingClientRect();
    const scaleX = rect.width > 0 ? canvas.width / rect.width : 1;
    const scaleY = rect.height > 0 ? canvas.height / rect.height : 1;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }

  onSlatePointerDown(e: PointerEvent): void {
    const canvas = this.slateCanvasRef?.nativeElement;
    if (!canvas) return;
    this.initSlateCanvas();
    this.isSlateDrawing = true;
    canvas.setPointerCapture?.(e.pointerId);

    const pt = this.getSlatePoint(e, canvas);
    this.lastSlatePoint = pt;
    this.drawSlateStroke(pt, pt);
  }

  onSlatePointerMove(e: PointerEvent): void {
    if (!this.isSlateDrawing || !this.lastSlatePoint) return;
    const canvas = this.slateCanvasRef?.nativeElement;
    if (!canvas) return;

    const current = this.getSlatePoint(e, canvas);
    this.drawSlateStroke(this.lastSlatePoint, current);
    this.lastSlatePoint = current;
  }

  onSlatePointerUp(e: PointerEvent): void {
    this.isSlateDrawing = false;
    this.lastSlatePoint = null;
  }

  private drawSlateStroke(p1: { x: number; y: number }, p2: { x: number; y: number }): void {
    const canvas = this.slateCanvasRef?.nativeElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = rect.width > 0 ? canvas.width / rect.width : 1;
    const strokeWidth = 14 * dpr;

    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (this.selectedPenColor === 'rainbow') {
      const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x + 20 * dpr, p2.y + 20 * dpr);
      grad.addColorStop(0, '#f43f5e');
      grad.addColorStop(0.5, '#f59e0b');
      grad.addColorStop(1, '#06b6d4');
      ctx.strokeStyle = grad;
      ctx.fillStyle = grad;
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 10 * dpr;
    } else if (this.selectedPenColor === 'gold') {
      ctx.strokeStyle = '#f59e0b';
      ctx.fillStyle = '#f59e0b';
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 12 * dpr;
    } else if (this.selectedPenColor === 'cyan') {
      ctx.strokeStyle = '#06b6d4';
      ctx.fillStyle = '#06b6d4';
      ctx.shadowColor = '#67e8f9';
      ctx.shadowBlur = 12 * dpr;
    } else if (this.selectedPenColor === 'pink') {
      ctx.strokeStyle = '#ec4899';
      ctx.fillStyle = '#ec4899';
      ctx.shadowColor = '#f472b6';
      ctx.shadowBlur = 10 * dpr;
    } else if (this.selectedPenColor === 'lime') {
      ctx.strokeStyle = '#10b981';
      ctx.fillStyle = '#10b981';
      ctx.shadowColor = '#6ee7b7';
      ctx.shadowBlur = 10 * dpr;
    } else {
      ctx.strokeStyle = '#ffffff';
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
    }

    // Always fill a circle at the point so even single taps draw a neat round chalk mark
    ctx.beginPath();
    ctx.arc(p1.x, p1.y, strokeWidth / 2, 0, Math.PI * 2);
    ctx.fill();

    if (p1.x !== p2.x || p1.y !== p2.y) {
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }

    this.sound.playPop(1.2);
  }

  // -------------------------------------------------------------
  // Particle Sparkle System
  // -------------------------------------------------------------
  // FIX: resizes the current sparkle canvas and starts the RAF loop only ONCE
  private initParticleCanvas(): void {
    const canvas = this.sparkleCanvasRef?.nativeElement;
    const parent = canvas?.parentElement;
    if (canvas && parent) {
      if (canvas.width !== parent.clientWidth || canvas.height !== parent.clientHeight) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    }

    if (this.particleAnimFrameId) return; // loop already running
    const loop = () => {
      this.updateAndDrawParticles();
      this.particleAnimFrameId = requestAnimationFrame(loop);
    };
    this.particleAnimFrameId = requestAnimationFrame(loop);
  }

  private spawnSparkle(x: number, y: number): void {
    // FIX: no sparkle canvas (e.g. slate mode) => don't pile up invisible particles
    if (!this.sparkleCanvasRef?.nativeElement) return;
    const colors = ['#fde047', '#f43f5e', '#38bdf8', '#a855f7', '#4ade80', '#ffffff'];
    for (let i = 0; i < 3; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 15,
        y: y + (Math.random() - 0.5) * 15,
        vx: (Math.random() - 0.5) * 2.5,
        vy: (Math.random() - 0.5) * 2.5,
        size: Math.random() * 4 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        life: 1
      });
    }
  }

  private updateAndDrawParticles(): void {
    const canvas = this.sparkleCanvasRef?.nativeElement;
    if (!canvas) {
      this.particles.length = 0;
      return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.04;
      p.alpha = Math.max(0, p.life);

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // -------------------------------------------------------------
  // Audio & Dialogs
  // -------------------------------------------------------------
  speakActiveLetter(): void {
    this.sound.playTap();
    const item = this.activeItem;
    if (this.activeCategory === 'hindi') {
      this.speech.speak(item.speechHi, 'hi');
    } else {
      this.speech.speak(item.speechEn, 'en');
    }
  }

  onStarClick(): void {
    this.sound.playSuccess();
    this.confetti.fire();
    this.speech.speak(
      `You have ${this.totalStars} stars! Super writer!`,
      'en'
    );
  }

  toggleGridModal(): void {
    this.sound.playTap();
    this.showGridModal = !this.showGridModal;
  }

  selectFromGrid(idx: number): void {
    this.showGridModal = false;
    this.selectItemByIndex(idx);
  }

  @HostListener('window:resize')
  onResize(): void {
    this.initParticleCanvas();
    this.initSlateCanvas();
  }
}
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppNavService } from '../../core/services/app-nav.service';
import { SoundService } from '../../core/services/sound.service';
import { SpeechService } from '../../core/services/speech.service';
import { ConfettiService } from '../../core/services/confetti.service';
import { ThemeService } from '../../core/services/theme.service';

export type PrimaryColorKey = 'red' | 'yellow' | 'blue' | 'green' | 'white' | 'black' | 'orange' | 'purple';

interface ColorFlask {
  key: PrimaryColorKey;
  name: string;
  hindiName: string;
  hex: string;
  emoji: string;
  streamColor: string;
}

interface ColorRecipe {
  id: string;
  ingredients: PrimaryColorKey[];
  resultName: string;
  resultHindi: string;
  resultHex: string;
  glowColor: string;
  surpriseEmoji: string;
  surpriseToy: string;
  surpriseToyHi: string;
  congratsLine: string;
  congratsLineHi: string;
  voiceSound: 'frog' | 'giggle' | 'chime' | 'fanfare' | 'pop';
  animalGreeting: string;
}

interface FloatingBubble {
  id: number;
  leftPct: number;
  size: number;
  delaySec: number;
  speedSec: number;
  popped: boolean;
}

@Component({
  selector: 'app-color-mixing',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="lab-viewport">
      <!-- 🌟 Top Header Bar -->
      <header class="lab-header">
        <button 
          type="button" 
          (click)="goBack()" 
          class="nav-circle-btn" 
          id="btn-lab-back"
          title="Back to Hub / हब पर वापस">
          <span class="btn-icon">🏠</span>
          <span class="btn-text">Hub</span>
        </button>

        <div class="title-pill">
          <span class="title-icon">🧪</span>
          <div class="title-text-col">
            <span class="main-title">Magic Color Lab</span>
            <span class="sub-title">जादुई रंग मिलाओ</span>
          </div>
        </div>

        <div class="header-right">
          <!-- Star Milestone -->
          <div class="star-counter-pill" (click)="onStarClick()" title="Total Stars">
            <span class="star-icon">⭐</span>
            <span class="star-count">{{ totalStars }}</span>
          </div>
          <button 
            type="button" 
            (click)="themeService.open()" 
            class="action-icon-btn" 
            title="Theme Options">
            🎨
          </button>
          <button 
            type="button" 
            (click)="sound.toggleMute()" 
            class="action-icon-btn" 
            [title]="sound.isMuted() ? 'Unmute' : 'Mute'">
            {{ sound.isMuted() ? '🔇' : '🎵' }}
          </button>
        </div>
      </header>

      <!-- 🎪 Main Lab Content -->
      <main class="lab-content">
        <!-- Mode Switcher & Mission Card -->
        <div class="mission-bar">
          <div class="mode-toggles">
            <button 
              type="button" 
              class="mode-btn"
              [class.mode-btn-active]="playMode === 'quest'"
              (click)="setPlayMode('quest')">
              <span>🎯 Color Quest (चुनौती)</span>
            </button>
            <button 
              type="button" 
              class="mode-btn"
              [class.mode-btn-active]="playMode === 'free'"
              (click)="setPlayMode('free')">
              <span>🌈 Free Mix (खुला जादू)</span>
            </button>
          </div>

          @if (playMode === 'quest' && currentQuest) {
            <div class="quest-prompt-card animate-pop">
              <span class="quest-badge">🎯 MISSION:</span>
              <span class="quest-text">
                बनाओ <b>{{ currentQuest.resultHindi }}</b> ({{ currentQuest.resultName }}) {{ currentQuest.surpriseEmoji }}
              </span>
              <button 
                type="button" 
                class="quest-hint-btn" 
                (click)="speakQuestHint()" 
                title="Hear clue">
                🔊 Clue
              </button>
            </div>
          } @else {
            <div class="free-prompt-card">
              <span>✨ कोई भी 2 रंग कड़ाही में डालो और जादुई कमाल देखो! 🪄</span>
            </div>
          }
        </div>

        <!-- 🧪 The 8 Color Flasks on Wooden Rack (4 Primary + 4 Rich Secondary) -->
        <div class="flask-rack">
          <div class="rack-header">
            <span class="rack-title">👇 बोतल छुओ और रंग डालो • Tap a color to pour:</span>
          </div>

          <div class="flasks-grid">
            @for (flask of flasks; track flask.key) {
              <button 
                type="button" 
                class="flask-btn"
                [class.flask-active-poured]="isFlaskPoured(flask.key)"
                [class.flask-selected]="pouringFlask?.key === flask.key"
                [style.--flask-glow]="flask.hex"
                (click)="pourColor(flask)"
                [disabled]="isPouringAnimation"
                [title]="flask.hindiName + ' (' + flask.name + ')'">
                
                <div class="flask-bottle">
                  <div class="flask-neck"></div>
                  <div class="flask-body">
                    <div class="flask-liquid" [style.background]="flask.hex"></div>
                    <span class="flask-emoji">{{ flask.emoji }}</span>
                  </div>
                </div>

                <span class="flask-name">{{ flask.hindiName }}</span>
                <span class="flask-sub">{{ flask.name }}</span>

                @if (isFlaskPoured(flask.key)) {
                  <span class="poured-badge">✓ डाला गया</span>
                }
              </button>
            }
          </div>
        </div>

        <!-- 🫧 Central Magical Bubbling Cauldron with Dedicated Pouring Stage -->
        <div class="cauldron-stage">
          <!-- ⚗️ REALISTIC HERO POURING ANIMATION DIRECTLY OVER CAULDRON -->
          @if (isPouringAnimation && pouringFlask) {
            <div class="cauldron-hero-pour-stage animate-pour-entry">
              <!-- Tilting Flask Positioned Directly Over Cauldron Lip -->
              <div class="hero-flask-wrapper animate-flask-tilt">
                <div class="hero-flask-neck"></div>
                <div class="hero-flask-body">
                  <div class="hero-flask-liquid" [style.background]="pouringFlask.hex"></div>
                  <span class="hero-flask-emoji">{{ pouringFlask.emoji }}</span>
                </div>
              </div>

              <!-- Flowing Stream of Liquid and Droplets entering Cauldron directly -->
              <div class="hero-pour-stream" [style.background]="pouringFlask.streamColor">
                <span class="stream-drop drop-1">💧</span>
                <span class="stream-drop drop-2">✨</span>
                <span class="stream-drop drop-3">💧</span>
              </div>
            </div>
          }

          <!-- 🫧 Floating Tappable Bubbles (Child can pop them!) -->
          <div class="bubbles-air-layer">
            @for (b of bubbles; track b.id) {
              @if (!b.popped) {
                <button 
                  type="button"
                  class="air-bubble-btn"
                  [style.left.%]="b.leftPct"
                  [style.width.px]="b.size"
                  [style.height.px]="b.size"
                  [style.animationDuration.s]="b.speedSec"
                  [style.animationDelay.s]="b.delaySec"
                  (click)="popBubble(b, $event)"
                  title="Pop bubble! 🫧">
                  🫧
                </button>
              }
            }
          </div>

          <!-- The Cauldron Vessel with Metallic Rim & Radiant Core Glow -->
          <div 
            class="cauldron-vessel" 
            [style.box-shadow]="cauldronGlow"
            [class.cauldron-stirring]="isStirring">
            
            <!-- Metallic Rim & Handles -->
            <div class="cauldron-rim">
              <span class="rim-gem gem-left">💎</span>
              <span class="rim-title">✨ MAGIC CAULDRON ✨</span>
              <span class="rim-gem gem-right">💎</span>
            </div>

            <!-- Dynamic Liquid with Multi-Color Waves -->
            <div 
              class="cauldron-liquid" 
              [style.background]="cauldronGradient">
              <div class="liquid-swirl" [class.swirl-fast]="isStirring"></div>
              
              <!-- Cauldron Surface Ripples & Steam -->
              @if (isPouringAnimation) {
                <div class="splash-ripple animate-ripple"></div>
              }
            </div>

            <!-- 🌟 Active Surprised Mascot Creature or Potion State -->
            @if (activeResult) {
              <div 
                class="creature-reveal-stage animate-pop" 
                (click)="tickleCreature()" 
                title="Tap to make it talk! 👆">
                
                <div class="creature-halo">✨🌟✨</div>
                <span class="creature-emoji animate-bounce">{{ activeResult.surpriseEmoji }}</span>
                
                <div class="creature-tag-pill">
                  <span class="tag-title">{{ activeResult.resultHindi }}! ({{ activeResult.resultName }})</span>
                  <span class="tag-sub">{{ activeResult.surpriseToyHi }} • Tap me! 👆</span>
                </div>
              </div>
            } @else if (pouredColors.length === 1) {
              <div class="potion-prompt-box animate-bounce">
                <span class="potion-icon">🧪</span>
                <span class="potion-text">
                  <b>{{ getFlaskName(pouredColors[0]) }}</b> डाला!
                  <br>अब एक और रंग मिलाओ! 🪄
                </span>
              </div>
            } @else {
              <div class="empty-potion-prompt">
                <span class="empty-wand">🪄</span>
                <span class="empty-txt">ऊपर से रंग चुनो और कड़ाही में डालो!</span>
              </div>
            }
          </div>

          <!-- 🥄 Interactive Stirring Spoon & Action Controls -->
          <div class="cauldron-controls-row">
            <button 
              type="button" 
              class="spoon-stir-btn"
              [class.spoon-active]="isStirring"
              (click)="stirCauldron()"
              title="Stir with magic spoon! चमचे से घुमाओ">
              <span class="spoon-icon animate-bounce">🥄</span>
              <span class="spoon-text">जादुई चम्मच से घुमाओ (Stir!)</span>
            </button>

            @if (pouredColors.length > 0) {
              <button 
                type="button" 
                class="wash-cauldron-btn animate-pop" 
                (click)="resetCauldron()"
                title="Clean Cauldron / नया जादू">
                <span>🧹 कड़ाही साफ़ करो • New</span>
              </button>
            }
          </div>
        </div>

        <!-- 📜 Recipes & Discoveries Tray -->
        <div class="recipes-tray">
          <div class="recipes-header">
            <span class="recipes-title">📖 जादुई फॉर्मूले • Magic Recipes ({{ achievedRecipeCount }}/{{ recipes.length }} Unlocked):</span>
            <span class="recipes-stars-badge">⭐ +3 Stars per Recipe</span>
          </div>

          <div class="recipes-grid">
            @for (rec of recipes; track rec.id) {
              <button 
                type="button"
                class="recipe-card"
                [class.recipe-unlocked]="isRecipeAchieved(rec)"
                [class.recipe-target]="playMode === 'quest' && currentQuest?.id === rec.id"
                (click)="applyRecipeHint(rec)"
                [title]="rec.resultHindi + ' (' + rec.resultName + ')'">
                
                <div class="recipe-formula-row">
                  <span class="ingredients-txt">{{ getIngredientsDisplay(rec.ingredients) }}</span>
                  <span class="recipe-arrow">➔</span>
                  <span class="recipe-result-pill" [style.background]="rec.resultHex">
                    {{ rec.surpriseEmoji }} {{ rec.resultHindi }}
                  </span>
                </div>

                @if (isRecipeAchieved(rec)) {
                  <span class="recipe-done-check">⭐ अनलॉक्ड!</span>
                }
              </button>
            }
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .lab-viewport {
      position: fixed;
      inset: 0;
      background: radial-gradient(circle at 50% 15%, #2e1065 0%, #0f172a 65%, #050508 100%);
      color: #ffffff;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      overflow-x: hidden;
      font-family: var(--font-body, system-ui, sans-serif);
      z-index: 50;
      user-select: none;
    }

    /* 🌟 Header Bar */
    .lab-header {
      width: 100%;
      max-width: 900px;
      margin: 0 auto;
      padding: 8px 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
      position: relative;
      z-index: 30;
      flex-wrap: nowrap;
    }

    .nav-circle-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 5px 10px;
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #e2e8f0;
      font-size: 0.78rem;
      font-weight: 700;
      cursor: pointer;
      backdrop-filter: blur(10px);
      transition: all 0.2s;
      flex-shrink: 0;
    }
    .nav-circle-btn:hover {
      background: rgba(255, 255, 255, 0.22);
      transform: translateY(-2px);
      color: #ffffff;
    }

    .title-pill {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(168, 85, 247, 0.2);
      border: 1.5px solid rgba(192, 132, 252, 0.45);
      padding: 4px 10px;
      border-radius: 20px;
      backdrop-filter: blur(10px);
      min-width: 0;
      flex-shrink: 1;
    }
    .title-icon {
      font-size: 1.3rem;
      line-height: 1;
    }
    .title-text-col {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .main-title {
      font-family: var(--font-display, sans-serif);
      font-size: 0.85rem;
      font-weight: 900;
      color: #e9d5ff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .sub-title {
      font-size: 0.65rem;
      color: #ffffff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 5px;
      flex-shrink: 0;
    }

    .star-counter-pill {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      padding: 4px 8px;
      border-radius: 18px;
      background: rgba(245, 158, 11, 0.2);
      border: 1.5px solid rgba(251, 191, 36, 0.45);
      color: #fde047;
      font-size: 0.76rem;
      font-weight: 800;
      cursor: pointer;
      backdrop-filter: blur(10px);
      flex-shrink: 0;
    }

    .action-icon-btn {
      width: 33px;
      height: 33px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
      cursor: pointer;
      backdrop-filter: blur(10px);
      transition: all 0.2s;
      outline: none;
      color: #ffffff;
      flex-shrink: 0;
      padding: 0;
    }
    .action-icon-btn:hover {
      transform: scale(1.1);
      background: rgba(255, 255, 255, 0.25);
    }

    /* Content Stage */
    .lab-content {
      flex: 1;
      max-width: 820px;
      width: 100%;
      margin: 0 auto;
      padding: 0 10px 18px 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }

    /* Mission / Quest Bar */
    .mission-bar {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
    }

    .mode-toggles {
      display: flex;
      background: rgba(15, 23, 42, 0.7);
      border: 1.5px solid rgba(255, 255, 255, 0.2);
      border-radius: 20px;
      padding: 3px;
      gap: 4px;
    }
    .mode-btn {
      padding: 4px 12px;
      border-radius: 16px;
      border: none;
      background: transparent;
      color: #94a3b8;
      font-family: var(--font-display, sans-serif);
      font-size: 0.74rem;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.2s;
    }
    .mode-btn-active {
      background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%);
      color: #ffffff;
      box-shadow: 0 2px 10px rgba(168, 85, 247, 0.4);
    }

    .quest-prompt-card {
      width: 100%;
      background: linear-gradient(135deg, rgba(234, 88, 12, 0.3) 0%, rgba(245, 158, 11, 0.35) 100%);
      border: 1.5px solid rgba(251, 191, 36, 0.55);
      border-radius: 16px;
      padding: 6px 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      backdrop-filter: blur(8px);
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.25);
    }
    .quest-badge {
      font-size: 0.68rem;
      font-weight: 900;
      color: #fde047;
      letter-spacing: 0.05em;
    }
    .quest-text {
      font-family: var(--font-display, sans-serif);
      font-size: clamp(0.85rem, 2.8vw, 1.05rem);
      font-weight: 800;
      color: #ffffff;
    }
    .quest-hint-btn {
      padding: 3px 8px;
      border-radius: 10px;
      background: rgba(0,0,0,0.35);
      border: 1px solid rgba(255,255,255,0.4);
      color: #fef08a;
      font-size: 0.68rem;
      font-weight: 800;
      cursor: pointer;
    }

    .free-prompt-card {
      width: 100%;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.18);
      border-radius: 14px;
      padding: 5px 10px;
      text-align: center;
      font-size: 0.75rem;
      color: #fde047;
      font-weight: 700;
    }

    /* 🧪 8-Flask Rack Grid */
    .flask-rack {
      width: 100%;
      background: rgba(30, 41, 59, 0.72);
      border: 1.5px solid rgba(255, 255, 255, 0.18);
      border-radius: 18px;
      padding: 8px 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      backdrop-filter: blur(10px);
      box-shadow: 0 6px 18px rgba(0,0,0,0.35);
    }
    .rack-header {
      font-size: 0.74rem;
      font-weight: 800;
      color: #38bdf8;
    }

    .flasks-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px;
      width: 100%;
    }

    .flask-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      background: rgba(255, 255, 255, 0.08);
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: 14px;
      padding: 6px 4px;
      cursor: pointer;
      outline: none;
      transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      position: relative;
    }
    .flask-btn:hover {
      transform: translateY(-3px) scale(1.05);
      border-color: var(--flask-glow);
      box-shadow: 0 4px 14px rgba(0,0,0,0.4);
    }
    .flask-active-poured {
      border-color: #fde047 !important;
      background: rgba(253, 224, 71, 0.18) !important;
      box-shadow: 0 0 12px rgba(253, 224, 71, 0.4) !important;
    }
    .flask-selected {
      border-color: #38bdf8 !important;
      box-shadow: 0 0 16px #38bdf8 !important;
      transform: scale(1.08);
    }

    .flask-bottle {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .flask-neck {
      width: 10px;
      height: 6px;
      border: 1.5px solid rgba(255, 255, 255, 0.6);
      border-bottom: none;
      border-radius: 3px 3px 0 0;
      background: rgba(255, 255, 255, 0.15);
    }
    .flask-body {
      position: relative;
      width: 32px;
      height: 36px;
      border: 1.5px solid rgba(255, 255, 255, 0.6);
      border-radius: 0 0 12px 12px;
      background: rgba(255, 255, 255, 0.12);
      display: flex;
      align-items: flex-end;
      overflow: hidden;
      box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.3);
    }
    .flask-liquid {
      width: 100%;
      height: 70%;
      border-radius: 0 0 10px 10px;
      transition: height 0.3s;
    }
    .flask-emoji {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 1rem;
    }

    .flask-name {
      font-family: var(--font-display, sans-serif);
      font-size: 0.72rem;
      font-weight: 800;
      color: #ffffff;
      margin-top: 2px;
      white-space: nowrap;
    }
    .flask-sub {
      font-size: 0.58rem;
      color: #94a3b8;
    }
    .poured-badge {
      font-size: 0.54rem;
      font-weight: 900;
      color: #4ade80;
      background: rgba(0,0,0,0.4);
      padding: 1px 4px;
      border-radius: 6px;
      margin-top: 1px;
    }

    /* ⚗️ REALISTIC HERO POURING STAGE (Positioned right over cauldron mouth) */
    .cauldron-hero-pour-stage {
      position: absolute;
      top: -38px;
      left: 58%;
      transform: translateX(-50%);
      z-index: 45;
      display: flex;
      flex-direction: column;
      align-items: center;
      pointer-events: none;
    }

    .hero-flask-wrapper {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      transform-origin: 0% 0%;
      filter: drop-shadow(0 6px 16px rgba(0,0,0,0.6));
    }
    .animate-flask-tilt {
      animation: flaskTiltPour 0.65s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    }

    .hero-flask-neck {
      width: 14px;
      height: 10px;
      border: 2px solid rgba(255, 255, 255, 0.8);
      border-bottom: none;
      border-radius: 4px 4px 0 0;
      background: rgba(255, 255, 255, 0.25);
    }
    .hero-flask-body {
      position: relative;
      width: 44px;
      height: 48px;
      border: 2px solid rgba(255, 255, 255, 0.8);
      border-radius: 0 0 16px 16px;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: flex-end;
      overflow: hidden;
      box-shadow: inset 0 2px 8px rgba(255, 255, 255, 0.4);
    }
    .hero-flask-liquid {
      width: 100%;
      height: 65%;
      border-radius: 0 0 14px 14px;
      animation: liquidDrain 0.65s forwards;
    }
    .hero-flask-emoji {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 1.3rem;
    }

    /* Stream that shoots directly into the cauldron */
    .hero-pour-stream {
      position: absolute;
      top: 30px;
      left: -20px;
      width: 8px;
      height: 70px;
      border-radius: 6px;
      box-shadow: 0 0 14px currentColor;
      transform: rotate(20deg);
      transform-origin: top center;
    }
    .stream-drop {
      position: absolute;
      font-size: 0.95rem;
      animation: dropStream 0.45s infinite linear;
    }
    .drop-1 { top: 10%; left: -6px; animation-delay: 0s; }
    .drop-2 { top: 45%; left: -4px; animation-delay: 0.15s; }
    .drop-3 { top: 80%; left: -6px; animation-delay: 0.3s; }

    /* 🫧 Cauldron Stage */
    .cauldron-stage {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      margin-top: 10px;
    }

    .bubbles-air-layer {
      position: absolute;
      top: -30px;
      left: 10%;
      right: 10%;
      height: 60px;
      pointer-events: auto;
      z-index: 20;
    }
    .air-bubble-btn {
      position: absolute;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1.4rem;
      line-height: 1;
      padding: 0;
      filter: drop-shadow(0 2px 6px rgba(255,255,255,0.4));
      animation: floatUp 2.8s infinite linear;
      transition: transform 0.15s;
    }
    .air-bubble-btn:active {
      transform: scale(1.4);
    }

    .cauldron-vessel {
      position: relative;
      width: clamp(230px, 68vw, 300px);
      height: clamp(160px, 44vw, 205px);
      background: radial-gradient(circle at 50% 100%, #09090b 0%, #1e1b4b 50%, #0f172a 100%);
      border: 4px solid rgba(255, 255, 255, 0.35);
      border-radius: 45px 45px 100px 100px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-shadow: 0 12px 36px rgba(0, 0, 0, 0.7);
      transition: all 0.4s ease;
      z-index: 10;
    }
    .cauldron-stirring {
      animation: cauldronShake 0.4s ease-in-out infinite;
    }

    .cauldron-rim {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 28px;
      background: linear-gradient(180deg, #475569 0%, #1e293b 100%);
      border-bottom: 2px solid rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 10px;
      z-index: 15;
    }
    .rim-gem {
      font-size: 0.85rem;
    }
    .rim-title {
      font-size: 0.62rem;
      font-weight: 900;
      color: #cbd5e1;
      letter-spacing: 0.08em;
    }

    .cauldron-liquid {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 70%;
      border-radius: 0 0 95px 95px;
      opacity: 0.88;
      transition: background 0.5s ease;
      overflow: hidden;
    }
    .liquid-swirl {
      position: absolute;
      inset: 0;
      background: radial-gradient(circle, rgba(255,255,255,0.25) 0%, transparent 70%);
      animation: swirl 4s linear infinite;
    }
    .swirl-fast {
      animation: swirl 0.8s linear infinite !important;
      filter: brightness(1.3);
    }

    .splash-ripple {
      position: absolute;
      top: 20%;
      left: 35%;
      width: 30%;
      height: 30%;
      border: 3px solid rgba(255, 255, 255, 0.8);
      border-radius: 50%;
      animation: rippleExpand 0.6s ease-out infinite;
    }

    /* Mascot Creature Reveal */
    .creature-reveal-stage {
      position: relative;
      z-index: 20;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      cursor: pointer;
      gap: 2px;
      margin-top: 14px;
    }
    .creature-halo {
      font-size: 1.1rem;
      animation: twinkle 1.5s infinite alternate;
    }
    .creature-emoji {
      font-size: clamp(3.4rem, 11vw, 4.6rem);
      line-height: 1;
      filter: drop-shadow(0 8px 18px rgba(0,0,0,0.6));
      transition: transform 0.2s;
    }
    .creature-reveal-stage:hover .creature-emoji {
      transform: scale(1.15) rotate(5deg);
    }

    .creature-tag-pill {
      display: flex;
      flex-direction: column;
      align-items: center;
      background: rgba(0, 0, 0, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.3);
      padding: 3px 10px;
      border-radius: 14px;
      backdrop-filter: blur(6px);
    }
    .tag-title {
      font-family: var(--font-display, sans-serif);
      font-size: 0.88rem;
      font-weight: 900;
      color: #ffffff;
      text-shadow: 0 2px 4px rgba(0,0,0,0.8);
    }
    .tag-sub {
      font-size: 0.65rem;
      font-weight: 800;
      color: #fde047;
    }

    .potion-prompt-box {
      position: relative;
      z-index: 20;
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(0, 0, 0, 0.55);
      border: 1px solid rgba(253, 224, 71, 0.5);
      padding: 6px 12px;
      border-radius: 16px;
      text-align: center;
      margin-top: 14px;
    }
    .potion-icon {
      font-size: 1.3rem;
    }
    .potion-text {
      font-size: 0.76rem;
      color: #ffffff;
      line-height: 1.25;
    }

    .empty-potion-prompt {
      position: relative;
      z-index: 20;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      margin-top: 14px;
      opacity: 0.8;
    }
    .empty-wand {
      font-size: 1.8rem;
    }
    .empty-txt {
      font-size: 0.74rem;
      color: rgba(255, 255, 255, 0.85);
      font-weight: 700;
      text-align: center;
    }

    /* Cauldron Controls Row */
    .cauldron-controls-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 8px;
    }

    .spoon-stir-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 20px;
      background: linear-gradient(135deg, rgba(234, 179, 8, 0.3) 0%, rgba(202, 138, 4, 0.4) 100%);
      border: 1.5px solid rgba(251, 191, 36, 0.6);
      color: #fef08a;
      font-family: var(--font-display, sans-serif);
      font-size: 0.8rem;
      font-weight: 900;
      cursor: pointer;
      backdrop-filter: blur(8px);
      box-shadow: 0 4px 14px rgba(234, 179, 8, 0.3);
      transition: all 0.2s;
    }
    .spoon-stir-btn:hover {
      transform: scale(1.06);
      background: rgba(234, 179, 8, 0.5);
    }
    .spoon-active {
      transform: scale(1.1) rotate(-8deg);
      border-color: #ffffff;
      background: #ca8a04 !important;
      color: #ffffff !important;
      box-shadow: 0 0 20px rgba(251, 191, 36, 0.7);
    }
    .spoon-icon {
      font-size: 1.2rem;
    }

    .wash-cauldron-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 8px 14px;
      border-radius: 20px;
      background: rgba(239, 68, 68, 0.25);
      border: 1.5px solid rgba(248, 113, 113, 0.5);
      color: #fca5a5;
      font-size: 0.78rem;
      font-weight: 800;
      cursor: pointer;
      backdrop-filter: blur(8px);
      transition: all 0.2s;
    }
    .wash-cauldron-btn:hover {
      background: rgba(239, 68, 68, 0.45);
      transform: scale(1.06);
    }

    /* 📜 Recipes Tray */
    .recipes-tray {
      width: 100%;
      background: rgba(15, 23, 42, 0.75);
      border: 1.5px solid rgba(255, 255, 255, 0.16);
      border-radius: 18px;
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      backdrop-filter: blur(10px);
      margin-top: auto;
    }
    .recipes-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
    }
    .recipes-title {
      font-size: 0.74rem;
      font-weight: 800;
      color: #fde047;
    }
    .recipes-stars-badge {
      font-size: 0.65rem;
      font-weight: 800;
      color: #86efac;
    }

    .recipes-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 6px;
      max-height: 180px;
      overflow-y: auto;
      padding-right: 4px;
    }

    .recipe-card {
      background: rgba(255, 255, 255, 0.07);
      border: 1.5px solid rgba(255, 255, 255, 0.14);
      border-radius: 12px;
      padding: 6px 8px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: 2px;
      text-align: left;
      transition: all 0.2s;
    }
    .recipe-card:hover {
      background: rgba(255, 255, 255, 0.16);
      border-color: #38bdf8;
      transform: translateY(-2px);
    }
    .recipe-unlocked {
      border-color: #4ade80 !important;
      background: rgba(34, 197, 94, 0.15) !important;
    }
    .recipe-target {
      border-color: #fde047 !important;
      background: rgba(245, 158, 11, 0.25) !important;
      box-shadow: 0 0 14px rgba(253, 224, 71, 0.45);
      animation: targetPulse 2s infinite alternate;
    }

    .recipe-formula-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 4px;
      font-size: 0.68rem;
      font-weight: 700;
    }
    .ingredients-txt {
      color: #e2e8f0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 0.65rem;
    }
    .recipe-arrow {
      opacity: 0.6;
    }
    .recipe-result-pill {
      padding: 2px 6px;
      border-radius: 8px;
      font-weight: 900;
      color: #ffffff;
      text-shadow: 0 1px 3px rgba(0,0,0,0.6);
      font-size: 0.65rem;
      white-space: nowrap;
    }
    .recipe-done-check {
      font-size: 0.6rem;
      font-weight: 800;
      color: #4ade80;
    }

    /* Keyframes */
    @keyframes flaskTiltPour {
      0% {
        transform: rotate(0deg) translateY(0);
        opacity: 0;
      }
      25% {
        transform: rotate(-35deg) translateY(-4px);
        opacity: 1;
      }
      50% {
        transform: rotate(-75deg) translateY(-8px);
        opacity: 1;
      }
      85% {
        transform: rotate(-75deg) translateY(-8px);
        opacity: 1;
      }
      100% {
        transform: rotate(-10deg) translateY(0);
        opacity: 0;
      }
    }

    @keyframes liquidDrain {
      0% { height: 75%; }
      100% { height: 15%; }
    }

    @keyframes dropStream {
      0% { transform: translateY(0); opacity: 1; }
      100% { transform: translateY(60px); opacity: 0; }
    }

    @keyframes swirl {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @keyframes rippleExpand {
      0% { transform: scale(0.2); opacity: 1; }
      100% { transform: scale(2); opacity: 0; }
    }

    @keyframes floatUp {
      0% { transform: translateY(40px) scale(0.6); opacity: 0; }
      20% { opacity: 0.9; }
      80% { opacity: 0.9; }
      100% { transform: translateY(-30px) scale(1.1); opacity: 0; }
    }

    @keyframes cauldronShake {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(-1.5deg); }
      75% { transform: rotate(1.5deg); }
    }

    @keyframes targetPulse {
      0% { transform: scale(1); }
      100% { transform: scale(1.03); }
    }

    @keyframes popIn {
      0% { transform: scale(0.3); opacity: 0; }
      70% { transform: scale(1.15); opacity: 1; }
      100% { transform: scale(1); opacity: 1; }
    }
    .animate-pop {
      animation: popIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }
    .animate-bounce {
      animation: bounce 2s ease-in-out infinite;
    }

    @keyframes twinkle {
      0% { opacity: 0.4; }
      100% { opacity: 1; }
    }

    @media (max-width: 480px) {
      .lab-header {
        padding: 6px 8px;
        gap: 3px;
      }
      .title-pill {
        padding: 3px 6px;
      }
      .main-title {
        font-size: 0.78rem;
      }
      .flasks-grid {
        grid-template-columns: repeat(4, 1fr);
        gap: 4px;
      }
      .flask-btn {
        padding: 4px 2px;
      }
      .flask-body {
        width: 26px;
        height: 30px;
      }
      .flask-name {
        font-size: 0.66rem;
      }
      .recipes-grid {
        grid-template-columns: 1fr;
      }
      .spoon-stir-btn {
        padding: 6px 12px;
        font-size: 0.74rem;
      }
      .wash-cauldron-btn {
        padding: 6px 10px;
        font-size: 0.72rem;
      }
    }
  `]
})
export class ColorMixingComponent implements OnInit {
  totalStars = 28;
  playMode: 'quest' | 'free' = 'quest';
  pouredColors: PrimaryColorKey[] = [];
  activeResult: ColorRecipe | null = null;
  achievedRecipeIds = new Set<string>();

  // Interactive Animations
  isPouringAnimation = false;
  pouringFlask: ColorFlask | null = null;
  isStirring = false;
  questIndex = 0;

  // 🫧 Floating air bubbles
  bubbles: FloatingBubble[] = [
    { id: 1, leftPct: 15, size: 28, delaySec: 0, speedSec: 2.6, popped: false },
    { id: 2, leftPct: 40, size: 34, delaySec: 0.8, speedSec: 3.1, popped: false },
    { id: 3, leftPct: 65, size: 26, delaySec: 1.4, speedSec: 2.8, popped: false },
    { id: 4, leftPct: 82, size: 32, delaySec: 0.4, speedSec: 3.3, popped: false }
  ];

  // 🎨 8 Vibrant Color Flasks
  readonly flasks: ColorFlask[] = [
    { key: 'red', name: 'Red', hindiName: 'लाल', hex: '#ef4444', emoji: '🔴', streamColor: 'linear-gradient(180deg, #ef4444 0%, #b91c1c 100%)' },
    { key: 'yellow', name: 'Yellow', hindiName: 'पीला', hex: '#facc15', emoji: '🟡', streamColor: 'linear-gradient(180deg, #facc15 0%, #ca8a04 100%)' },
    { key: 'blue', name: 'Blue', hindiName: 'नीला', hex: '#3b82f6', emoji: '🔵', streamColor: 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)' },
    { key: 'green', name: 'Green', hindiName: 'हरा', hex: '#22c55e', emoji: '🟢', streamColor: 'linear-gradient(180deg, #22c55e 0%, #15803d 100%)' },
    { key: 'white', name: 'White', hindiName: 'सफ़ेद', hex: '#ffffff', emoji: '⚪', streamColor: 'linear-gradient(180deg, #ffffff 0%, #cbd5e1 100%)' },
    { key: 'black', name: 'Black', hindiName: 'काला', hex: '#1e293b', emoji: '🖤', streamColor: 'linear-gradient(180deg, #334155 0%, #0f172a 100%)' },
    { key: 'orange', name: 'Orange', hindiName: 'संतरा', hex: '#f97316', emoji: '🟠', streamColor: 'linear-gradient(180deg, #f97316 0%, #c2410c 100%)' },
    { key: 'purple', name: 'Purple', hindiName: 'बैंगनी', hex: '#a855f7', emoji: '🟣', streamColor: 'linear-gradient(180deg, #a855f7 0%, #7e22ce 100%)' }
  ];

  // 📖 14 Rich Magic Recipes!
  readonly recipes: ColorRecipe[] = [
    // 1. Red + Yellow = Orange 🍊
    {
      id: 'orange',
      ingredients: ['red', 'yellow'],
      resultName: 'Orange',
      resultHindi: 'संतरी रंग',
      resultHex: '#f97316',
      glowColor: '0 0 40px rgba(249, 115, 22, 0.85)',
      surpriseEmoji: '🍊',
      surpriseToy: 'Juicy Orange',
      surpriseToyHi: 'रसीला संतरा',
      congratsLine: 'Red and Yellow make ORANGE!',
      congratsLineHi: 'लाल और पीला मिलकर बना संतरी रंग!',
      voiceSound: 'pop',
      animalGreeting: 'I am Juicy Orange! संतरा बहुत मीठा है!'
    },
    // 2. Yellow + Blue = Green 🐸
    {
      id: 'green',
      ingredients: ['yellow', 'blue'],
      resultName: 'Green',
      resultHindi: 'हरा रंग',
      resultHex: '#22c55e',
      glowColor: '0 0 40px rgba(34, 197, 94, 0.85)',
      surpriseEmoji: '🐸',
      surpriseToy: 'Hoppy Frog',
      surpriseToyHi: 'कूदने वाला मेंढक',
      congratsLine: 'Yellow and Blue make GREEN!',
      congratsLineHi: 'पीला और नीला मिलकर बना हरा रंग!',
      voiceSound: 'frog',
      animalGreeting: 'Ribbit ribbit! मेंढक बोला टर्र-टर्र!'
    },
    // 3. Red + Blue = Purple 🍇
    {
      id: 'purple',
      ingredients: ['red', 'blue'],
      resultName: 'Purple',
      resultHindi: 'जादुई बैंगनी',
      resultHex: '#a855f7',
      glowColor: '0 0 40px rgba(168, 85, 247, 0.85)',
      surpriseEmoji: '🍇',
      surpriseToy: 'Sweet Grapes',
      surpriseToyHi: 'मीठे रसीले अंगूर',
      congratsLine: 'Red and Blue make PURPLE!',
      congratsLineHi: 'लाल और नीला मिलकर बना जादुई बैंगनी!',
      voiceSound: 'chime',
      animalGreeting: 'Sweet purple grapes! मीठे-मीठे अंगूर!'
    },
    // 4. Red + White = Pink 🌸
    {
      id: 'pink',
      ingredients: ['red', 'white'],
      resultName: 'Pink',
      resultHindi: 'प्यारा गुलाबी',
      resultHex: '#ec4899',
      glowColor: '0 0 40px rgba(236, 72, 153, 0.85)',
      surpriseEmoji: '🌸',
      surpriseToy: 'Pink Lotus Flower',
      surpriseToyHi: 'प्यारा गुलाबी कमल',
      congratsLine: 'Red and White make PINK!',
      congratsLineHi: 'लाल और सफ़ेद मिलकर बना प्यारा गुलाबी!',
      voiceSound: 'chime',
      animalGreeting: 'Pretty pink flower! सुंदर गुलाबी फूल!'
    },
    // 5. Blue + White = Sky Blue ☁️
    {
      id: 'skyblue',
      ingredients: ['blue', 'white'],
      resultName: 'Sky Blue',
      resultHindi: 'हल्का आसमानी',
      resultHex: '#38bdf8',
      glowColor: '0 0 40px rgba(56, 189, 248, 0.85)',
      surpriseEmoji: '☁️',
      surpriseToy: 'Fluffy White Cloud',
      surpriseToyHi: 'सफ़ेद नन्हा बादल',
      congratsLine: 'Blue and White make SKY BLUE!',
      congratsLineHi: 'नीला और सफ़ेद मिलकर बना आसमानी रंग!',
      voiceSound: 'chime',
      animalGreeting: 'Whoosh! Soft fluffy sky cloud! आसमानी बादल!'
    },
    // 6. Black + White = Silver Grey 🐘
    {
      id: 'grey',
      ingredients: ['black', 'white'],
      resultName: 'Silver Grey',
      resultHindi: 'सिल्वर ग्रे',
      resultHex: '#94a3b8',
      glowColor: '0 0 40px rgba(148, 163, 184, 0.85)',
      surpriseEmoji: '🐘',
      surpriseToy: 'Gentle Elephant',
      surpriseToyHi: 'नन्हा हाथी भैया',
      congratsLine: 'Black and White make GREY!',
      congratsLineHi: 'काला और सफ़ेद मिलकर बना सलेटी रंग!',
      voiceSound: 'fanfare',
      animalGreeting: 'Trumpet! I am happy Elephant! हाथी बोला चिंघाड़!'
    },
    // 7. Red + Black = Maroon 🍒
    {
      id: 'maroon',
      ingredients: ['black', 'red'],
      resultName: 'Maroon',
      resultHindi: 'गहरा लाल',
      resultHex: '#881337',
      glowColor: '0 0 40px rgba(136, 19, 55, 0.85)',
      surpriseEmoji: '🍒',
      surpriseToy: 'Sweet Cherries',
      surpriseToyHi: 'रसीली मीठी चेरी',
      congratsLine: 'Red and Black make MAROON!',
      congratsLineHi: 'लाल और काला मिलकर बना गहरा लाल रंग!',
      voiceSound: 'pop',
      animalGreeting: 'Yum! Juicy deep red cherries! मीठी चेरी!'
    },
    // 8. Green + Yellow = Lime Neon 🦜
    {
      id: 'lime',
      ingredients: ['green', 'yellow'],
      resultName: 'Lime Green',
      resultHindi: 'नींबू हरा',
      resultHex: '#84cc16',
      glowColor: '0 0 40px rgba(132, 204, 22, 0.85)',
      surpriseEmoji: '🦜',
      surpriseToy: 'Green Parrot',
      surpriseToyHi: 'हरा मिट्ठू तोता',
      congratsLine: 'Green and Yellow make LIME GREEN!',
      congratsLineHi: 'हरा और पीला मिलकर बना तोता रंग!',
      voiceSound: 'chime',
      animalGreeting: 'Mithoo mithoo! मिट्ठू तोता बोला!'
    },
    // 9. Green + Blue = Aqua Teal 🐬
    {
      id: 'teal',
      ingredients: ['blue', 'green'],
      resultName: 'Aqua Teal',
      resultHindi: 'समुद्री नीला',
      resultHex: '#06b6d4',
      glowColor: '0 0 40px rgba(6, 182, 212, 0.85)',
      surpriseEmoji: '🐬',
      surpriseToy: 'Ocean Dolphin',
      surpriseToyHi: 'कूदती डॉल्फ़िन',
      congratsLine: 'Green and Blue make AQUA TEAL!',
      congratsLineHi: 'हरा और नीला मिलकर बना समुद्री रंग!',
      voiceSound: 'chime',
      animalGreeting: 'Splash! Friendly Dolphin! छपाक डॉल्फ़िन!'
    },
    // 10. Purple + White = Lavender 🪻
    {
      id: 'lavender',
      ingredients: ['purple', 'white'],
      resultName: 'Lavender',
      resultHindi: 'हल्का जामुनी',
      resultHex: '#c084fc',
      glowColor: '0 0 40px rgba(192, 132, 252, 0.85)',
      surpriseEmoji: '🪻',
      surpriseToy: 'Lavender Flower',
      surpriseToyHi: 'सुगंधित लैवेंडर',
      congratsLine: 'Purple and White make LAVENDER!',
      congratsLineHi: 'बैंगनी और सफ़ेद मिलकर बना लैवेंडर!',
      voiceSound: 'chime',
      animalGreeting: 'Lovely soothing lavender! महकता फूल!'
    },
    // 11. Orange + White = Peach 🍑
    {
      id: 'peach',
      ingredients: ['orange', 'white'],
      resultName: 'Peach',
      resultHindi: 'आड़ू रंग',
      resultHex: '#fdba74',
      glowColor: '0 0 40px rgba(253, 186, 116, 0.85)',
      surpriseEmoji: '🍑',
      surpriseToy: 'Sweet Peach',
      surpriseToyHi: 'मीठा आड़ू फल',
      congratsLine: 'Orange and White make PEACH!',
      congratsLineHi: 'संतरी और सफ़ेद मिलकर बना आड़ू रंग!',
      voiceSound: 'pop',
      animalGreeting: 'Sweet soft peach! मीठा-मीठा आड़ू!'
    },
    // 12. Red + Green = Earth Brown 🥥
    {
      id: 'coconut',
      ingredients: ['green', 'red'],
      resultName: 'Earth Brown',
      resultHindi: 'मिट्टी भूरा',
      resultHex: '#78350f',
      glowColor: '0 0 40px rgba(120, 53, 15, 0.85)',
      surpriseEmoji: '🥥',
      surpriseToy: 'Fresh Coconut',
      surpriseToyHi: 'नारियल फल',
      congratsLine: 'Red and Green make EARTH BROWN!',
      congratsLineHi: 'लाल और हरा मिलकर बना मिट्टी भूरा रंग!',
      voiceSound: 'pop',
      animalGreeting: 'Coconut surprise! ताजा नारियल!'
    },
    // 13. Red + Yellow + Blue = Teddy Brown 🧸
    {
      id: 'brown',
      ingredients: ['blue', 'red', 'yellow'],
      resultName: 'Teddy Brown',
      resultHindi: 'भूरा भालू रंग',
      resultHex: '#92400e',
      glowColor: '0 0 40px rgba(146, 64, 14, 0.85)',
      surpriseEmoji: '🧸',
      surpriseToy: 'Cuddly Teddy Bear',
      surpriseToyHi: 'प्यारा टेडी भालू',
      congratsLine: 'Red, Yellow & Blue make Teddy BROWN!',
      congratsLineHi: 'सब रंग मिलकर बन गया भूरा भालू रंग!',
      voiceSound: 'giggle',
      animalGreeting: 'Hello friend! I am brown Teddy! मैं भूरा टेडी हूँ!'
    },
    // 14. 🌈 Secret Rainbow Surprise (Any 4 or more colors!)
    {
      id: 'rainbow',
      ingredients: ['blue', 'green', 'red', 'yellow'],
      resultName: 'Magic Rainbow',
      resultHindi: 'जादुई इंद्रधनुष',
      resultHex: 'linear-gradient(135deg, #ef4444, #f59e0b, #10b981, #3b82f6, #8b5cf6)',
      glowColor: '0 0 55px rgba(236, 72, 153, 0.95)',
      surpriseEmoji: '🦄',
      surpriseToy: 'Magic Rainbow Unicorn',
      surpriseToyHi: 'जादुई इंद्रधनुषी यूनिकॉर्न',
      congratsLine: 'ALL COLORS MIXED INTO RAINBOW MAGIC!',
      congratsLineHi: 'सारे रंग मिलकर बना जादुई इंद्रधनुष!',
      voiceSound: 'fanfare',
      animalGreeting: 'Magic Unicorn Sparkles! जादुई इंद्रधनुषी चमक!'
    }
  ];

  constructor(
    public appNav: AppNavService,
    public sound: SoundService,
    public speech: SpeechService,
    public themeService: ThemeService,
    private confetti: ConfettiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const saved = localStorage.getItem('toddler_total_stars');
    if (saved) {
      this.totalStars = parseInt(saved, 10) || 28;
    }
    const savedUnlocked = localStorage.getItem('toddler_color_recipes');
    if (savedUnlocked) {
      try {
        const arr = JSON.parse(savedUnlocked);
        this.achievedRecipeIds = new Set(arr);
      } catch (e) {}
    }

    setTimeout(() => {
      this.speakQuestHint();
    }, 300);
  }

  get currentQuest(): ColorRecipe {
    return this.recipes[this.questIndex % this.recipes.length];
  }

  get achievedRecipeCount(): number {
    return this.achievedRecipeIds.size;
  }

  get cauldronGradient(): string {
    if (this.activeResult) {
      return this.activeResult.resultHex;
    }
    if (this.pouredColors.length === 1) {
      const f = this.flasks.find(x => x.key === this.pouredColors[0]);
      return f ? f.hex : 'rgba(255,255,255,0.2)';
    }
    if (this.pouredColors.length >= 2) {
      const hexes = this.pouredColors.map(k => this.flasks.find(f => f.key === k)?.hex || '#ffffff');
      return `linear-gradient(135deg, ${hexes.join(', ')})`;
    }
    return 'rgba(255,255,255,0.15)';
  }

  get cauldronGlow(): string {
    if (this.activeResult) {
      return this.activeResult.glowColor;
    }
    if (this.pouredColors.length >= 1) {
      const f = this.flasks.find(x => x.key === this.pouredColors[this.pouredColors.length - 1]);
      return f ? `0 0 30px ${f.hex}88` : '0 12px 36px rgba(0,0,0,0.7)';
    }
    return '0 12px 36px rgba(0,0,0,0.7)';
  }

  setPlayMode(mode: 'quest' | 'free'): void {
    this.sound.playTap();
    this.playMode = mode;
    this.resetCauldron();
    if (mode === 'quest') {
      this.speakQuestHint();
    } else {
      this.speech.speakClue('Free play! Mix any colors you want in the cauldron! कोई भी रंग मिलाओ!');
    }
  }

  isFlaskPoured(key: PrimaryColorKey): boolean {
    return this.pouredColors.includes(key);
  }

  isRecipeAchieved(recipe: ColorRecipe): boolean {
    return this.achievedRecipeIds.has(recipe.id);
  }

  getFlaskName(key: PrimaryColorKey): string {
    return this.flasks.find(f => f.key === key)?.hindiName || key;
  }

  getIngredientsDisplay(keys: PrimaryColorKey[]): string {
    return keys.map(k => {
      const f = this.flasks.find(x => x.key === k);
      return f ? `${f.emoji} ${f.name}` : k;
    }).join(' + ');
  }

  pourColor(flask: ColorFlask): void {
    if (this.isPouringAnimation) return;

    if (this.pouredColors.includes(flask.key)) {
      this.sound.playBoing();
      this.speech.speakClue(`${flask.name} is already in the cauldron! दूसरा रंग चुनो!`);
      return;
    }

    // Trigger physical pouring animation right over cauldron
    this.isPouringAnimation = true;
    this.pouringFlask = flask;
    this.sound.playBrushSplash();

    setTimeout(() => {
      this.pouredColors.push(flask.key);
      this.isPouringAnimation = false;
      this.pouringFlask = null;
      this.sound.playChime();
      this.speech.speakClue(`${flask.name} poured! ${flask.hindiName} रंग डाला!`);

      // Check mixing result
      this.checkMixingResult();
      this.cdr.detectChanges();
    }, 700);

    this.cdr.detectChanges();
  }

  stirCauldron(): void {
    if (this.isStirring) return;
    this.isStirring = true;
    this.sound.playChime();
    this.sound.playBrushSplash();

    setTimeout(() => {
      this.isStirring = false;
      this.cdr.detectChanges();
    }, 900);

    if (this.pouredColors.length === 0) {
      this.speech.speakClue('The cauldron is empty! Add colors to brew magic! पहले रंग डालो!');
    } else {
      this.speech.speakClue('Swish and stir! जादुई कड़ाही घूमी!');
    }
    this.cdr.detectChanges();
  }

  popBubble(b: FloatingBubble, event: MouseEvent): void {
    event.stopPropagation();
    b.popped = true;
    this.sound.playPop();
    this.totalStars += 1;
    localStorage.setItem('toddler_total_stars', this.totalStars.toString());

    // Respawn bubble after 2s
    setTimeout(() => {
      b.popped = false;
      b.leftPct = Math.floor(Math.random() * 70) + 15;
      this.cdr.detectChanges();
    }, 2000);
  }

  private checkMixingResult(): void {
    if (this.pouredColors.length < 2) return;

    const currentSorted = [...this.pouredColors].sort().join(',');

    // Match 2 or 3 color recipes
    let matched = this.recipes.find(r => [...r.ingredients].sort().join(',') === currentSorted);

    // If 4 or more colors poured and no direct match, trigger Rainbow Unicorn!
    if (!matched && this.pouredColors.length >= 4) {
      matched = this.recipes.find(r => r.id === 'rainbow');
    }

    if (matched) {
      this.activeResult = matched;
      this.sound.playSuccess();
      this.confetti.fire();

      // Check Quest match
      const isQuestMatch = this.playMode === 'quest' && this.currentQuest.id === matched.id;

      if (!this.achievedRecipeIds.has(matched.id)) {
        this.achievedRecipeIds.add(matched.id);
        const bonus = isQuestMatch ? 5 : 3;
        this.totalStars += bonus;
        localStorage.setItem('toddler_total_stars', this.totalStars.toString());
        localStorage.setItem('toddler_color_recipes', JSON.stringify(Array.from(this.achievedRecipeIds)));
      }

      setTimeout(() => {
        this.playCreatureVoice(matched);
        this.speech.speakClue(`${matched.congratsLine} Look, ${matched.surpriseToy}! ${matched.congratsLineHi}`);

        if (isQuestMatch) {
          setTimeout(() => {
            this.confetti.fire();
            this.sound.playFanfare();
            this.speech.speakClue(`Quest Completed! शाबाश! आपने ${matched.resultHindi} बना दिया!`);
            this.questIndex++;
            this.cdr.detectChanges();
          }, 2400);
        }
        this.cdr.detectChanges();
      }, 350);
    } else {
      this.sound.playChime();
      this.speech.speakClue('Bubbling magic potion! जादुई रंग बन गया!');
    }
  }

  tickleCreature(): void {
    if (!this.activeResult) return;
    this.playCreatureVoice(this.activeResult);
    this.confetti.fire();
    this.speech.speakClue(this.activeResult.animalGreeting);
  }

  private playCreatureVoice(rec: ColorRecipe): void {
    switch (rec.voiceSound) {
      case 'frog':
        this.sound.playFrogCroak();
        break;
      case 'giggle':
        this.sound.playGiggle();
        break;
      case 'fanfare':
        this.sound.playFanfare();
        break;
      case 'chime':
        this.sound.playChime();
        break;
      case 'pop':
      default:
        this.sound.playPop();
        break;
    }
  }

  applyRecipeHint(recipe: ColorRecipe): void {
    this.sound.playTap();
    this.resetCauldron();
    this.speech.speakClue(`Let's brew ${recipe.resultName}! Pour ${recipe.ingredients.join(' and ')}!`);
  }

  speakQuestHint(): void {
    if (this.playMode === 'quest' && this.currentQuest) {
      this.speech.speakClue(`Can you make ${this.currentQuest.resultName}? ${this.currentQuest.resultHindi} बनाओ! Hint: ${this.currentQuest.ingredients.join(' and ')}!`);
    } else {
      this.speech.speakClue('Welcome to Magic Color Lab! Pick 2 colors to brew!');
    }
  }

  resetCauldron(): void {
    this.sound.playTap();
    this.pouredColors = [];
    this.activeResult = null;
    this.isPouringAnimation = false;
    this.pouringFlask = null;
    this.speech.speakClue('Cauldron washed clean! Start fresh! साफ़ हो गया!');
    this.cdr.detectChanges();
  }

  onStarClick(): void {
    this.sound.playSuccess();
    this.confetti.fire();
    this.speech.speakClue(`You have ${this.totalStars} stars! Keep shining!`);
  }

  goBack(): void {
    this.sound.playTap();
    this.appNav.goToHub();
  }
}

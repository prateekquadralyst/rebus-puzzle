import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppNavService } from '../../core/services/app-nav.service';
import { SoundService } from '../../core/services/sound.service';
import { SpeechService } from '../../core/services/speech.service';
import { ConfettiService } from '../../core/services/confetti.service';

interface FloatingBalloon {
  id: number;
  colorName: string;
  emoji: string;
  leftPct: number;
  bottomPct: number;
  durationSec: number;
  delaySec: number;
  isPopped: boolean;
  popX?: number;
  popY?: number;
}

interface RainbowStar {
  id: string;
  note: string;
  noteLabel: string;
  solfege: string;
  emoji: string;
  color: string;
  glow: string;
}

interface MascotBuddy {
  id: string;
  name: string;
  hindiName: string;
  emoji: string;
  paw: string;
  soundKey: string;
  color: string;
  greeting: string;
  hindiGreeting: string;
}

@Component({
  selector: 'app-start-portal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="portal-viewport">
      <!-- 🌌 Interactive Sky Decor (Tappable Clouds, Sun, Stars & Balloons) -->
      <div class="sky-elements">
        <!-- Interactive Smiling Sun -->
        <button 
          type="button" 
          class="interactive-sun" 
          [class.sun-squish]="isSunSquishing"
          (click)="onSunClick($event)"
          title="Tap the warm smiling sun!">
          <div class="sun-glow"></div>
          <span class="sun-face">☀️</span>
          @if (sunSparkle) {
            <span class="sun-sparkle-fx animate-pop">✨💛✨</span>
          }
        </button>

        <!-- Floating Interactive Clouds -->
        <button 
          type="button" 
          class="floating-cloud cloud-1" 
          [class.cloud-raining]="isCloudRaining(0)"
          (click)="onCloudClick(0)"
          title="Tap the fluffy cloud!">
          ☁️
          @if (isCloudRaining(0)) {
            <span class="rain-sparkles">🌧️✨</span>
          }
        </button>

        <button 
          type="button" 
          class="floating-cloud cloud-2" 
          [class.cloud-raining]="isCloudRaining(1)"
          (click)="onCloudClick(1)"
          title="Tap the cloud for sprinkles!">
          ☁️
          @if (isCloudRaining(1)) {
            <span class="rain-sparkles">🌈✨</span>
          }
        </button>

        <button 
          type="button" 
          class="floating-cloud cloud-3" 
          [class.cloud-raining]="isCloudRaining(2)"
          (click)="onCloudClick(2)">
          ☁️
          @if (isCloudRaining(2)) {
            <span class="rain-sparkles">⭐✨</span>
          }
        </button>

        <!-- Twinkle Musical Stars -->
        <button type="button" class="twinkle-star star-1" (click)="onStarClick('star-1')">⭐</button>
        <button type="button" class="twinkle-star star-2" (click)="onStarClick('star-2')">✨</button>
        <button type="button" class="twinkle-star star-3" (click)="onStarClick('star-3')">🌟</button>
        <button type="button" class="twinkle-star star-4" (click)="onStarClick('star-4')">💫</button>

        <!-- 🎈 Floating Tappable Balloons (Can be popped right on the home screen!) -->
        @for (b of balloons; track b.id) {
          @if (!b.isPopped) {
            <button 
              type="button"
              class="interactive-balloon"
              [style.left.%]="b.leftPct"
              [style.bottom.%]="b.bottomPct"
              [style.animation-duration.s]="b.durationSec"
              [style.animation-delay.s]="b.delaySec"
              (click)="popBalloon(b, $event)"
              [title]="'Pop the ' + b.colorName + ' balloon!'">
              {{ b.emoji }}
            </button>
          } @else if (b.popX !== undefined && b.popY !== undefined) {
            <div 
              class="pop-badge animate-pop"
              [style.left.px]="b.popX"
              [style.top.px]="b.popY">
              💥 POP!
            </div>
          }
        }
      </div>

      <!-- 🌟 Top Header Navigation Bar -->
      <header class="portal-header">
        <!-- 🛡️ Parent Gate Button -->
        <button 
          type="button" 
          (click)="openParentGate()"
          class="parent-gate-btn"
          id="btn-parent-gate"
          title="Parent Zone & Settings">
          <span class="gate-icon">🛡️</span>
          <span class="gate-label">Parents</span>
        </button>

        <!-- Center Star Milestone Trophy Pill -->
        <div class="star-milestone-pill" (click)="onStarPillClick()" title="Your collected stars!">
          <span class="star-pill-icon">⭐</span>
          <span class="star-pill-text">{{ totalStars }} Stars</span>
        </div>

        <!-- 🎵 Sound & Voice Controls -->
        <div class="header-actions">
          <button 
            type="button" 
            (click)="sound.toggleMute()" 
            class="header-circle-btn"
            [title]="sound.isMuted() ? 'Turn Sound On' : 'Turn Sound Off'">
            {{ sound.isMuted() ? '🔇' : '🎵' }}
          </button>
        </div>
      </header>

      <!-- 🎪 Center Stage: Animated Living Mascot, Musical Rainbow, & Mega Play Button -->
      <main class="portal-content">
        <!-- 🌈 Musical Piano Rainbow Arch (Tap stars to play real piano notes!) -->
        <div class="rainbow-arch-banner">
          <div class="rainbow-arch-track">
            <span class="rainbow-curve-line"></span>
            <div class="rainbow-stars-cluster">
              @for (star of rainbowStars; track star.id) {
                <button 
                  type="button" 
                  class="rainbow-star-item"
                  [style.--star-color]="star.color"
                  [style.--star-glow]="star.glow"
                  [class.star-tapped]="tappedStarId === star.id"
                  (click)="onRainbowStarClick(star, $event)"
                  [title]="'Play musical note ' + star.noteLabel + ' (' + star.solfege + ')'">
                  <span class="star-glyph">{{ star.emoji }}</span>
                  <span class="star-note-tag">{{ star.solfege }}</span>
                </button>
              }
            </div>
          </div>
          <span class="rainbow-hint-text">🎵 Tap stars to play music! 🎹</span>
        </div>

        <!-- 🧸 Living Mascot Companion Stage -->
        <div 
          class="mascot-stage" 
          (click)="onMascotClick()"
          [class.mascot-jumping]="isMascotJumping"
          title="Tap me to play!">
          
          <div class="mascot-aura"></div>
          
          <!-- Cloud Pillow Base -->
          <div class="mascot-cloud-pillow">☁️</div>

          <!-- Cute Mascot Avatar with Swapping Moods -->
          <div class="mascot-avatar">
            <span class="mascot-emoji">{{ currentBuddy.emoji }}</span>
            <div class="waving-paw">{{ currentBuddy.paw }}</div>
          </div>

          <!-- Interactive Speech Bubble -->
          <div class="speech-bubble animate-pop">
            <span class="speech-text">{{ currentSpeechText }}</span>
            <span class="speech-tap-hint">👆 Tap me!</span>
          </div>
        </div>

        <!-- 🐾 Mascot Buddy Picker Pills (Choose favorite friend!) -->
        <div class="buddies-picker-row">
          <span class="buddies-label">Choose Friend:</span>
          <div class="buddies-pills">
            @for (buddy of buddies; track buddy.id) {
              <button 
                type="button" 
                class="buddy-pill-btn"
                [class.buddy-active]="currentBuddy.id === buddy.id"
                [style.--buddy-color]="buddy.color"
                (click)="selectBuddy(buddy)"
                [title]="'Play with ' + buddy.name + ' (' + buddy.hindiName + ')'">
                <span class="buddy-pill-emoji">{{ buddy.emoji }}</span>
                <span class="buddy-pill-name">{{ buddy.hindiName }}</span>
              </button>
            }
          </div>
        </div>

        <!-- Grand Game Title -->
        <div class="title-group">
          <span class="title-badge">🌈 PLAY • LEARN • EXPLORE 🌈</span>
          <h1 class="portal-title">
            TODDLER<span class="title-accent">MIND</span>
          </h1>
          <p class="portal-sub">जादुई दुनिया • खेल-खेल में सीखो और मुस्कुराओ!</p>
        </div>

        <!-- 🚀 Grand Jelly "TAP TO PLAY! • चलो खेलें!" Mega 3D Button -->
        <div class="grand-play-dock">
          <button 
            type="button" 
            (click)="onPlayClick()"
            class="grand-candy-play-btn animate-pop"
            id="btn-toddler-play"
            title="Start your learning adventure!">
            <div class="play-pulse-ring ring-1"></div>
            <div class="play-pulse-ring ring-2"></div>
            
            <div class="btn-inner-content">
              <div class="play-icon-glow">
                <span class="play-triangle">▶</span>
              </div>
              <div class="play-text-col">
                <span class="grand-play-title">TAP TO PLAY! 🌟</span>
                <span class="grand-play-hindi">चलो खेलें! • Let's Play!</span>
              </div>
              <span class="grand-sparkle-star">✨</span>
            </div>
          </button>
          <span class="sub-play-tip">👆 Touch to enter the fun game hub! 🏰</span>
        </div>
      </main>

      <!-- 🚂 Rolling Meadow Track & Interactive Critters -->
      <footer class="portal-ground">
        <!-- Interactive Choo Choo Train on the Hill -->
        <div class="train-track-hill">
          <button 
            type="button" 
            class="choo-train" 
            [class.train-racing]="isTrainRacing"
            (click)="onTrainClick()"
            title="Tap the Choo Choo Train!">
            <span class="train-smoke">💨☁️</span>
            <span class="train-engine">🚂</span>
            <span class="train-car">🚃</span>
            <span class="train-car">🚃</span>
            <span class="train-car">🎈</span>
            @if (trainBubble) {
              <span class="train-speech-pop animate-pop">Choo Choo! 🚂💨</span>
            }
          </button>
        </div>

        <!-- Bottom Garden Meadow Critters & Flowers -->
        <div class="garden-decor">
          <button type="button" class="critter-btn frog-btn" [class.frog-jumping]="isFrogJumping" (click)="onFrogClick()" title="Tap Froggy!">
            🐸
          </button>
          <span class="flower-item" (click)="onFlowerClick('🌸')">🌸</span>
          <span class="flower-item" (click)="onFlowerClick('🍄')">🍄</span>
          <button type="button" class="critter-btn butterfly-item" (click)="onButterflyClick()" title="Tap Butterfly!">
            🦋
          </button>
          <span class="flower-item" (click)="onFlowerClick('🌻')">🌻</span>
          <button type="button" class="critter-btn bee-btn" (click)="onBeeClick()" title="Tap Busy Bee!">
            🐝
          </button>
          <span class="flower-item" (click)="onFlowerClick('🌼')">🌼</span>
          <span class="flower-item" (click)="onFlowerClick('🌷')">🌷</span>
          <span class="flower-item" (click)="onFlowerClick('🍀')">🍀</span>
        </div>
      </footer>

      <!-- 🛡️ Kid-Safe Parent Gate Glassmorphism Modal -->
      @if (isParentGateOpen) {
        <div class="parent-modal-backdrop" (click)="closeParentGate()">
          <div class="parent-modal-card glass-panel" (click)="$event.stopPropagation()">
            <div class="parent-modal-header">
              <div class="parent-modal-title">
                <span class="parent-badge-icon">🛡️</span>
                <h3>Parent Zone & Settings</h3>
              </div>
              <button type="button" class="btn-close-modal" (click)="closeParentGate()">✕</button>
            </div>

            <!-- Stage 1: Adult Math Lock Verification -->
            @if (!isParentVerified) {
              <div class="parent-lock-stage">
                <div class="lock-shield">🔒</div>
                <h4 class="lock-question-title">Grown-Up Verification</h4>
                <p class="lock-instruction">
                  Please solve this simple problem to verify you are a parent or guardian:
                </p>

                <div class="math-problem-box font-display">
                  <span>{{ mathNum1 }} + {{ mathNum2 }} = ?</span>
                </div>

                @if (mathErrorMsg) {
                  <p class="math-error-text animate-shake">{{ mathErrorMsg }}</p>
                }

                <div class="math-options-grid">
                  @for (opt of mathOptions; track opt) {
                    <button 
                      type="button" 
                      class="math-option-btn" 
                      (click)="onMathOptionSelect(opt)">
                      {{ opt }}
                    </button>
                  }
                </div>
              </div>
            } @else {
              <!-- Stage 2: Parent Controls Dashboard -->
              <div class="parent-dashboard-stage">
                <div class="verified-badge">
                  <span>✅ Grown-Up Access Unlocked</span>
                </div>

                <div class="settings-list">
                  <!-- Audio Mute -->
                  <div class="setting-row">
                    <div class="setting-info">
                      <span class="setting-label">🎵 Sound Effects</span>
                      <span class="setting-sub">Play animal noises, pops, and chimes</span>
                    </div>
                    <button 
                      type="button" 
                      class="toggle-switch"
                      [class.toggle-on]="!sound.isMuted()"
                      (click)="sound.toggleMute()">
                      <span class="toggle-thumb"></span>
                    </button>
                  </div>

                  <!-- Speech Voiceover -->
                  <div class="setting-row">
                    <div class="setting-info">
                      <span class="setting-label">🗣️ Friendly Voiceover</span>
                      <span class="setting-sub">Speaks words and encouraging praise</span>
                    </div>
                    <button 
                      type="button" 
                      class="toggle-switch"
                      [class.toggle-on]="voiceEnabled"
                      (click)="toggleVoice()">
                      <span class="toggle-thumb"></span>
                    </button>
                  </div>

                  <!-- Screen Time Limit -->
                  <div class="setting-row screen-time-row">
                    <div class="setting-info">
                      <span class="setting-label">⏳ Play Time Limit</span>
                      <span class="setting-sub">Gently remind toddler when time is up</span>
                    </div>
                    <div class="screen-time-pills">
                      @for (time of screenTimeOptions; track time) {
                        <button 
                          type="button"
                          class="time-pill"
                          [class.time-pill-active]="selectedScreenTime === time"
                          (click)="setScreenTime(time)">
                          {{ time }}
                        </button>
                      }
                    </div>
                  </div>

                  <!-- Stars & Progress Overview -->
                  <div class="setting-row">
                    <div class="setting-info">
                      <span class="setting-label">⭐ Stars Earned</span>
                      <span class="setting-sub">{{ totalStars }} learning milestone stars</span>
                    </div>
                    <button 
                      type="button" 
                      class="btn-reset-stars"
                      (click)="resetStars()">
                      🔄 Reset Stars
                    </button>
                  </div>
                </div>

                <div class="parent-modal-footer">
                  <button type="button" class="btn-done" (click)="closeParentGate()">
                    Done & Return to Fun
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .portal-viewport {
      min-height: 100vh;
      min-height: 100dvh;
      width: 100%;
      background: radial-gradient(circle at 50% 15%, #1e1b4b 0%, #0f172a 65%, #030712 100%);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      overflow-x: hidden;
      user-select: none;
    }

    /* 🌌 Sky Elements & Interactive Decorations */
    .sky-elements {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 1;
    }

    /* Interactive Smiling Sun */
    .interactive-sun {
      position: absolute;
      top: -30px;
      right: 12%;
      width: 160px;
      height: 160px;
      border: none;
      background: transparent;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: auto;
      transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .interactive-sun:hover {
      transform: scale(1.1) rotate(15deg);
    }
    .sun-glow {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(253, 224, 71, 0.35) 0%, transparent 70%);
      filter: blur(25px);
      animation: pulseSun 4s ease-in-out infinite;
    }
    .sun-face {
      font-size: clamp(3.5rem, 8vw, 4.8rem);
      line-height: 1;
      filter: drop-shadow(0 0 20px rgba(250, 204, 21, 0.6));
      animation: spinSun 30s linear infinite;
    }
    .sun-squish {
      animation: squishSun 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .sun-sparkle-fx {
      position: absolute;
      top: 65%;
      font-size: 1.5rem;
      pointer-events: none;
    }

    /* Interactive Floating Clouds */
    .floating-cloud {
      position: absolute;
      background: none;
      border: none;
      font-size: clamp(2.4rem, 6.5vw, 3.8rem);
      opacity: 0.38;
      cursor: pointer;
      pointer-events: auto;
      transition: transform 0.2s, opacity 0.2s;
    }
    .floating-cloud:hover {
      opacity: 0.8;
      transform: scale(1.15);
    }
    .cloud-1 { top: 10%; left: -40px; animation: driftCloud 24s linear infinite; }
    .cloud-2 { top: 22%; right: -40px; animation: driftCloudReverse 28s linear infinite; }
    .cloud-3 { top: 48%; left: -40px; animation: driftCloud 34s linear infinite; animation-delay: -10s; }
    .cloud-raining {
      animation: squishSun 0.4s ease;
      opacity: 0.9 !important;
    }
    .rain-sparkles {
      position: absolute;
      top: 90%;
      left: 50%;
      transform: translateX(-50%);
      font-size: 1.2rem;
      animation: dropRain 1s ease forwards;
    }

    /* Twinkle Musical Stars */
    .twinkle-star {
      position: absolute;
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      pointer-events: auto;
      animation: twinkle 3s ease-in-out infinite;
      transition: transform 0.2s;
    }
    .twinkle-star:hover {
      transform: scale(1.4) rotate(20deg);
    }
    .star-1 { top: 16%; left: 18%; animation-delay: 0.2s; }
    .star-2 { top: 20%; right: 26%; animation-delay: 1.2s; font-size: 1.8rem; }
    .star-3 { top: 38%; left: 10%; animation-delay: 2.1s; }
    .star-4 { top: 44%; right: 14%; animation-delay: 0.8s; }

    /* Interactive Balloons */
    .interactive-balloon {
      position: absolute;
      background: none;
      border: none;
      font-size: clamp(2.2rem, 5.5vw, 3.2rem);
      cursor: pointer;
      pointer-events: auto;
      animation: floatBalloon linear infinite;
      filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.4));
      transition: transform 0.15s;
    }
    .interactive-balloon:hover {
      transform: scale(1.2);
    }
    .pop-badge {
      position: fixed;
      transform: translate(-50%, -50%);
      font-size: 1.8rem;
      font-weight: 900;
      color: #fde047;
      text-shadow: 0 0 16px rgba(253, 224, 71, 0.9), 0 3px 0 #b45309;
      pointer-events: none;
      z-index: 20;
    }

    /* 🌟 Header Navigation */
    .portal-header {
      width: 100%;
      max-width: 900px;
      margin: 0 auto;
      padding: 16px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      z-index: 10;
    }

    .parent-gate-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.18);
      color: #e2e8f0;
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
      backdrop-filter: blur(12px);
      transition: all 0.2s;
    }
    .parent-gate-btn:hover {
      background: rgba(255, 255, 255, 0.18);
      transform: translateY(-2px);
      border-color: rgba(167, 139, 250, 0.5);
    }

    .star-milestone-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 16px;
      border-radius: 24px;
      background: rgba(245, 158, 11, 0.15);
      border: 1.5px solid rgba(251, 191, 36, 0.35);
      color: #fde047;
      font-size: 0.82rem;
      font-weight: 800;
      cursor: pointer;
      backdrop-filter: blur(10px);
      transition: transform 0.2s;
    }
    .star-milestone-pill:hover {
      transform: scale(1.06);
      background: rgba(245, 158, 11, 0.25);
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .header-circle-btn {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.18);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      cursor: pointer;
      backdrop-filter: blur(10px);
      transition: all 0.2s;
      outline: none;
      color: #ffffff;
    }
    .header-circle-btn:hover {
      transform: scale(1.08);
      background: rgba(255, 255, 255, 0.2);
    }

    /* 🎪 Main Content Area */
    .portal-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 8px 16px;
      text-align: center;
      position: relative;
      z-index: 10;
    }

    /* 🧸 Living Mascot Stage */
    .mascot-stage {
      position: relative;
      cursor: pointer;
      margin-bottom: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      transition: transform 0.2s;
    }
    .mascot-stage:hover {
      transform: scale(1.05);
    }
    .mascot-stage:active {
      transform: scale(0.96);
    }

    .mascot-aura {
      position: absolute;
      top: 40%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 150px;
      height: 150px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(251, 191, 36, 0.4) 0%, transparent 70%);
      animation: pulseSun 2.8s ease-in-out infinite;
    }

    .mascot-cloud-pillow {
      position: absolute;
      bottom: -6px;
      left: 50%;
      transform: translateX(-50%);
      font-size: clamp(3.2rem, 9vw, 4.4rem);
      opacity: 0.55;
      filter: drop-shadow(0 8px 12px rgba(0, 0, 0, 0.5));
      animation: bobCloud 3s ease-in-out infinite;
    }

    .mascot-avatar {
      position: relative;
      display: inline-block;
      z-index: 2;
    }

    .mascot-emoji {
      font-size: clamp(4.6rem, 14vw, 6.2rem);
      line-height: 1;
      display: inline-block;
      filter: drop-shadow(0 14px 28px rgba(0, 0, 0, 0.6));
      animation: floatGentle 3s ease-in-out infinite;
    }

    .waving-paw {
      position: absolute;
      top: -4px;
      right: -12px;
      font-size: clamp(1.8rem, 5vw, 2.5rem);
      animation: wavePaw 1.4s ease-in-out infinite;
      transform-origin: 70% 70%;
    }

    .mascot-jumping {
      animation: superFlip 0.6s ease;
    }

    /* Speech Bubble */
    .speech-bubble {
      margin-top: 10px;
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      padding: 7px 18px;
      border-radius: 20px;
      background: #ffffff;
      color: #1e1b4b;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35);
      position: relative;
      z-index: 3;
    }
    .speech-bubble::before {
      content: '';
      position: absolute;
      top: -7px;
      left: 50%;
      transform: translateX(-50%);
      border-left: 7px solid transparent;
      border-right: 7px solid transparent;
      border-bottom: 7px solid #ffffff;
    }
    .speech-text {
      font-size: clamp(0.85rem, 2.5vw, 1rem);
      font-weight: 800;
      color: #1e1b4b;
    }
    .speech-tap-hint {
      font-size: 0.68rem;
      font-weight: 700;
      color: #6366f1;
      margin-top: 1px;
    }

    /* Titles */
    .title-group {
      margin-bottom: 18px;
    }

    .title-badge {
      display: inline-block;
      font-size: clamp(0.68rem, 2vw, 0.78rem);
      font-weight: 900;
      color: #fde047;
      letter-spacing: 0.14em;
      margin-bottom: 4px;
      text-shadow: 0 0 12px rgba(253, 224, 71, 0.6);
    }

    .portal-title {
      font-size: clamp(2.2rem, 7.5vw, 3.6rem);
      font-weight: 900;
      color: #ffffff;
      letter-spacing: -0.03em;
      line-height: 1.08;
      text-shadow: 0 4px 25px rgba(99, 102, 241, 0.5);
    }

    .title-accent {
      color: #a78bfa;
      text-shadow: 0 0 30px rgba(167, 139, 250, 0.8);
    }

    .portal-sub {
      font-size: clamp(0.78rem, 2.4vw, 0.95rem);
      color: #94a3b8;
      font-weight: 500;
      margin-top: 5px;
      max-width: 440px;
    }

    /* 🌈 Musical Rainbow Arch */
    .rainbow-arch-banner {
      width: 100%;
      max-width: 500px;
      margin: 0 auto 10px auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
    }

    .rainbow-arch-track {
      width: 100%;
      padding: 10px 14px;
      border-radius: 26px;
      background: rgba(255, 255, 255, 0.06);
      border: 2px solid rgba(255, 255, 255, 0.16);
      backdrop-filter: blur(12px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2);
      position: relative;
      overflow: hidden;
    }

    .rainbow-curve-line {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #ef4444, #f97316, #eab308, #10b981, #06b6d4, #6366f1, #ec4899);
      box-shadow: 0 0 12px rgba(236, 72, 153, 0.8);
      animation: rainbowShift 3s linear infinite;
    }
    @keyframes rainbowShift {
      0% { filter: hue-rotate(0deg); }
      100% { filter: hue-rotate(360deg); }
    }

    .rainbow-stars-cluster {
      display: flex;
      align-items: center;
      justify-content: space-around;
      gap: 6px;
      width: 100%;
    }

    .rainbow-star-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 4px 6px;
      border-radius: 14px;
      border: 1.5px solid var(--star-color);
      background: rgba(255, 255, 255, 0.08);
      cursor: pointer;
      outline: none;
      transition: all 0.18s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      box-shadow: 0 4px 12px var(--star-glow);
    }
    .rainbow-star-item:hover {
      transform: translateY(-4px) scale(1.15);
      background: rgba(255, 255, 255, 0.2);
      box-shadow: 0 6px 18px var(--star-glow);
    }
    .rainbow-star-item:active, .rainbow-star-item.star-tapped {
      transform: scale(1.25) rotate(10deg);
      background: var(--star-color);
    }

    .star-glyph {
      font-size: clamp(1.2rem, 3.5vw, 1.5rem);
      line-height: 1;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4));
    }

    .star-note-tag {
      font-size: 0.64rem;
      font-weight: 900;
      color: #ffffff;
      margin-top: 2px;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
    }

    .rainbow-hint-text {
      font-size: 0.68rem;
      font-weight: 800;
      color: #a7f3d0;
      margin-top: 4px;
      letter-spacing: 0.04em;
    }

    /* 🐾 Mascot Buddies Switcher */
    .buddies-picker-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-bottom: 12px;
      flex-wrap: wrap;
    }

    .buddies-label {
      font-size: 0.72rem;
      font-weight: 800;
      color: #cbd5e1;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .buddies-pills {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
      justify-content: center;
    }

    .buddy-pill-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 5px 11px;
      border-radius: 18px;
      border: 1.5px solid rgba(255, 255, 255, 0.18);
      background: rgba(255, 255, 255, 0.08);
      color: #e2e8f0;
      font-size: 0.76rem;
      font-weight: 800;
      cursor: pointer;
      backdrop-filter: blur(8px);
      transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .buddy-pill-btn:hover {
      transform: translateY(-2px) scale(1.06);
      background: rgba(255, 255, 255, 0.18);
    }
    .buddy-pill-btn.buddy-active {
      border-color: #fde047 !important;
      background: rgba(253, 224, 71, 0.22) !important;
      box-shadow: 0 0 16px rgba(253, 224, 71, 0.65);
      color: #ffffff;
      transform: scale(1.08);
    }

    .buddy-pill-emoji {
      font-size: 1.15rem;
    }
    .buddy-pill-name {
      line-height: 1;
    }

    /* 🚀 Grand Jelly Play Mega Button */
    .grand-play-dock {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      max-width: 420px;
      margin: 6px auto 14px auto;
      position: relative;
    }

    .grand-candy-play-btn {
      width: 100%;
      height: 84px;
      border-radius: 32px;
      border: 3.5px solid #6ee7b7;
      background: linear-gradient(135deg, #10b981 0%, #059669 45%, #047857 100%);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      outline: none;
      position: relative;
      box-shadow: 
        0 18px 42px -4px rgba(16, 185, 129, 0.7),
        0 0 32px rgba(52, 211, 153, 0.5),
        inset 0 3px 5px rgba(255, 255, 255, 0.8),
        inset 0 -5px 0 rgba(0, 0, 0, 0.25);
      animation: grandPulse 2.2s infinite;
      transition: all 0.22s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .grand-candy-play-btn:hover {
      transform: translateY(-4px) scale(1.03);
      box-shadow: 
        0 24px 50px -4px rgba(16, 185, 129, 0.85),
        0 0 45px rgba(52, 211, 153, 0.7);
    }
    .grand-candy-play-btn:active {
      transform: translateY(2px) scale(0.97);
    }

    .play-pulse-ring {
      position: absolute;
      inset: -8px;
      border-radius: 38px;
      border: 2.5px solid #34d399;
      opacity: 0;
      pointer-events: none;
    }
    .ring-1 {
      animation: ringWave 2.2s ease-out infinite;
    }
    .ring-2 {
      animation: ringWave 2.2s ease-out infinite 0.7s;
    }
    @keyframes ringWave {
      0% { transform: scale(0.96); opacity: 0.8; }
      100% { transform: scale(1.22); opacity: 0; }
    }

    .btn-inner-content {
      display: flex;
      align-items: center;
      gap: 14px;
      z-index: 2;
    }

    .play-icon-glow {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: #ffffff;
      color: #059669;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      font-weight: 900;
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
    }

    .play-text-col {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      line-height: 1.15;
    }

    .grand-play-title {
      font-family: var(--font-display, sans-serif);
      font-size: clamp(1.3rem, 4.4vw, 1.65rem);
      font-weight: 900;
      letter-spacing: 0.04em;
      color: #ffffff;
      text-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
    }

    .grand-play-hindi {
      font-size: clamp(0.78rem, 2.5vw, 0.92rem);
      font-weight: 800;
      color: #fef08a;
      letter-spacing: 0.02em;
    }

    .grand-sparkle-star {
      font-size: 1.6rem;
      animation: twinkle 1.5s infinite;
    }

    .sub-play-tip {
      font-size: 0.74rem;
      font-weight: 700;
      color: #94a3b8;
      margin-top: 8px;
    }

    @keyframes grandPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.025); }
    }

    /* 🚂 Interactive Choo Choo Train Track */
    .train-track-hill {
      width: 100%;
      max-width: 600px;
      display: flex;
      justify-content: center;
      margin-bottom: 4px;
      position: relative;
    }

    .choo-train {
      background: none;
      border: none;
      cursor: pointer;
      outline: none;
      display: inline-flex;
      align-items: center;
      gap: 2px;
      font-size: 1.5rem;
      animation: trainPuff 4s ease-in-out infinite alternate;
      position: relative;
      transition: transform 0.3s;
    }
    .choo-train:hover {
      transform: scale(1.15);
    }
    .choo-train.train-racing {
      animation: trainZoom 1.8s ease-in-out;
    }
    @keyframes trainPuff {
      0% { transform: translateX(-15px); }
      100% { transform: translateX(15px); }
    }
    @keyframes trainZoom {
      0% { transform: translateX(-40px) scale(1.1); }
      50% { transform: translateX(60px) scale(1.25); }
      100% { transform: translateX(0) scale(1); }
    }

    .train-speech-pop {
      position: absolute;
      top: -26px;
      left: 50%;
      transform: translateX(-50%);
      padding: 3px 10px;
      border-radius: 12px;
      background: #fde047;
      color: #713f12;
      font-size: 0.72rem;
      font-weight: 900;
      white-space: nowrap;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    }

    /* 🌸 Bottom Meadow */
    .portal-ground {
      width: 100%;
      padding: 6px 16px 16px 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      position: relative;
      z-index: 5;
    }

    .garden-decor {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: clamp(10px, 3.2vw, 20px);
      font-size: clamp(1.3rem, 3.8vw, 1.7rem);
      filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.45));
    }

    .critter-btn {
      background: none;
      border: none;
      font-size: clamp(1.4rem, 4vw, 1.85rem);
      cursor: pointer;
      outline: none;
      transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      padding: 0;
    }
    .critter-btn:hover {
      transform: scale(1.3);
    }
    .frog-jumping {
      animation: frogHop 0.5s ease;
    }
    @keyframes frogHop {
      0%, 100% { transform: translateY(0) scale(1); }
      40% { transform: translateY(-30px) scale(1.3) rotate(-12deg); }
      70% { transform: translateY(-10px) scale(1.1) rotate(6deg); }
    }
    .bee-btn {
      animation: beeHover 2.5s ease-in-out infinite alternate;
    }
    @keyframes beeHover {
      0% { transform: translate(0, 0) rotate(0deg); }
      50% { transform: translate(5px, -7px) rotate(12deg); }
      100% { transform: translate(-4px, 4px) rotate(-8deg); }
    }

    .flower-item {
      cursor: pointer;
      display: inline-block;
      transition: transform 0.2s;
    }
    .flower-item:hover {
      transform: scale(1.3) rotate(15deg);
    }
    .butterfly-item {
      animation: flutter 4s ease-in-out infinite;
    }

    /* 🛡️ Parent Gate Glassmorphism Modal */
    .parent-modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(3, 7, 18, 0.82);
      backdrop-filter: blur(12px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .parent-modal-card {
      width: 100%;
      max-width: 440px;
      background: #0f172a;
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 28px;
      padding: 24px;
      box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.8);
      position: relative;
      color: #ffffff;
    }

    .parent-modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 12px;
    }

    .parent-modal-title {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .parent-badge-icon {
      font-size: 1.4rem;
    }
    .parent-modal-title h3 {
      font-size: 1.15rem;
      font-weight: 800;
      margin: 0;
    }

    .btn-close-modal {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #94a3b8;
      font-size: 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .btn-close-modal:hover {
      color: #ffffff;
      background: rgba(255, 255, 255, 0.18);
    }

    /* Lock Stage */
    .parent-lock-stage {
      text-align: center;
      padding: 8px 0;
    }
    .lock-shield {
      font-size: 2.6rem;
      margin-bottom: 8px;
    }
    .lock-question-title {
      font-size: 1.1rem;
      font-weight: 800;
      margin-bottom: 6px;
    }
    .lock-instruction {
      font-size: 0.82rem;
      color: #94a3b8;
      margin-bottom: 16px;
      line-height: 1.4;
    }

    .math-problem-box {
      background: rgba(99, 102, 241, 0.12);
      border: 2px dashed rgba(99, 102, 241, 0.4);
      border-radius: 16px;
      padding: 14px;
      font-size: 1.8rem;
      font-weight: 900;
      color: #c7d2fe;
      margin-bottom: 18px;
    }

    .math-options-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }

    .math-option-btn {
      padding: 14px 10px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #ffffff;
      font-size: 1.4rem;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.2s;
    }
    .math-option-btn:hover {
      background: #6366f1;
      border-color: #818cf8;
      transform: scale(1.05);
    }

    .math-error-text {
      color: #f87171;
      font-size: 0.8rem;
      font-weight: 700;
      margin-bottom: 10px;
    }

    /* Dashboard Stage */
    .parent-dashboard-stage {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .verified-badge {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.35);
      color: #34d399;
      border-radius: 12px;
      padding: 8px 12px;
      font-size: 0.8rem;
      font-weight: 700;
      text-align: center;
    }

    .settings-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .setting-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 10px 12px;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.07);
    }

    .setting-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
      text-align: left;
    }

    .setting-label {
      font-size: 0.85rem;
      font-weight: 800;
      color: #f1f5f9;
    }

    .setting-sub {
      font-size: 0.72rem;
      color: #94a3b8;
    }

    .toggle-switch {
      width: 48px;
      height: 28px;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.15);
      border: none;
      position: relative;
      cursor: pointer;
      transition: background 0.2s;
    }
    .toggle-thumb {
      position: absolute;
      top: 3px;
      left: 3px;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #ffffff;
      transition: transform 0.2s;
    }
    .toggle-on {
      background: #10b981;
    }
    .toggle-on .toggle-thumb {
      transform: translateX(20px);
    }

    .screen-time-row {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }

    .screen-time-pills {
      display: flex;
      gap: 8px;
      width: 100%;
    }

    .time-pill {
      flex: 1;
      padding: 6px 4px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #cbd5e1;
      font-size: 0.74rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.18s;
    }
    .time-pill-active {
      background: #6366f1;
      border-color: #818cf8;
      color: #ffffff;
    }

    .btn-reset-stars {
      padding: 6px 12px;
      border-radius: 10px;
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.35);
      color: #fca5a5;
      font-size: 0.74rem;
      font-weight: 700;
      cursor: pointer;
    }
    .btn-reset-stars:hover {
      background: rgba(239, 68, 68, 0.3);
    }

    .parent-modal-footer {
      margin-top: 6px;
    }

    .btn-done {
      width: 100%;
      padding: 12px;
      border-radius: 16px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      border: none;
      color: #ffffff;
      font-weight: 800;
      font-size: 0.9rem;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
    }
    .btn-done:hover {
      filter: brightness(1.1);
    }

    /* 🎬 Keyframe Animations */
    @keyframes pulseSun {
      0%, 100% { transform: scale(1); opacity: 0.4; }
      50% { transform: scale(1.15); opacity: 0.7; }
    }

    @keyframes spinSun {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @keyframes squishSun {
      0%, 100% { transform: scale(1); }
      35% { transform: scale(1.3, 0.75) rotate(10deg); }
      65% { transform: scale(0.85, 1.25) rotate(-8deg); }
    }

    @keyframes driftCloud {
      0% { transform: translateX(0); }
      100% { transform: translateX(115vw); }
    }

    @keyframes driftCloudReverse {
      0% { transform: translateX(0); }
      100% { transform: translateX(-115vw); }
    }

    @keyframes dropRain {
      0% { opacity: 1; transform: translate(-50%, 0); }
      100% { opacity: 0; transform: translate(-50%, 40px); }
    }

    @keyframes twinkle {
      0%, 100% { opacity: 0.3; transform: scale(0.85); }
      50% { opacity: 1; transform: scale(1.15) rotate(15deg); }
    }

    @keyframes floatBalloon {
      0% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-60vh) rotate(8deg); }
      100% { transform: translateY(-110vh) rotate(-6deg); }
    }

    @keyframes bobCloud {
      0%, 100% { transform: translate(-50%, 0); }
      50% { transform: translate(-50%, -6px); }
    }

    @keyframes wavePaw {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(26deg); }
    }

    @keyframes superFlip {
      0% { transform: translateY(0) rotate(0deg) scale(1); }
      40% { transform: translateY(-30px) rotate(-15deg) scale(1.2); }
      70% { transform: translateY(-15px) rotate(10deg) scale(1.1); }
      100% { transform: translateY(0) rotate(0deg) scale(1); }
    }

    @keyframes jellyPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.03); }
    }

    @keyframes flutter {
      0%, 100% { transform: translate(0, 0) rotate(0deg); }
      25% { transform: translate(8px, -12px) rotate(12deg); }
      50% { transform: translate(16px, 0) rotate(-10deg); }
      75% { transform: translate(8px, 10px) rotate(8deg); }
    }
  `]
})
export class StartPortalComponent implements OnInit {
  isMascotJumping = false;
  isSunSquishing = false;
  sunSparkle = false;
  rainingClouds = new Set<number>();
  totalStars = 28;

  // 🌈 Musical Rainbow Piano Stars (7 notes for toddlers)
  readonly rainbowStars: RainbowStar[] = [
    { id: 'rs-1', note: 'C4', noteLabel: 'Do', solfege: 'सा', emoji: '⭐', color: '#ef4444', glow: 'rgba(239, 68, 68, 0.85)' },
    { id: 'rs-2', note: 'D4', noteLabel: 'Re', solfege: 'रे', emoji: '🌟', color: '#f97316', glow: 'rgba(249, 115, 22, 0.85)' },
    { id: 'rs-3', note: 'E4', noteLabel: 'Mi', solfege: 'ग', emoji: '✨', color: '#eab308', glow: 'rgba(234, 179, 8, 0.85)' },
    { id: 'rs-4', note: 'F4', noteLabel: 'Fa', solfege: 'म', emoji: '💫', color: '#10b981', glow: 'rgba(16, 185, 129, 0.85)' },
    { id: 'rs-5', note: 'G4', noteLabel: 'Sol', solfege: 'प', emoji: '🎵', color: '#06b6d4', glow: 'rgba(6, 182, 212, 0.85)' },
    { id: 'rs-6', note: 'A4', noteLabel: 'La', solfege: 'ध', emoji: '🎶', color: '#6366f1', glow: 'rgba(99, 102, 241, 0.85)' },
    { id: 'rs-7', note: 'C5', noteLabel: 'High Do', solfege: 'सां', emoji: '🌈', color: '#ec4899', glow: 'rgba(236, 72, 153, 0.85)' }
  ];
  tappedStarId: string | null = null;

  // 🐾 Interactive Mascot Buddies
  readonly buddies: MascotBuddy[] = [
    {
      id: 'teddy',
      name: 'Teddy',
      hindiName: 'टेडी 🧸',
      emoji: '🧸',
      paw: '👋',
      soundKey: 'giggle',
      color: '#f59e0b',
      greeting: 'Hi friend! Ready to play? नमस्ते!',
      hindiGreeting: 'नमस्ते दोस्त! मैं टेडी हूँ, चलो मिलकर खेलें!'
    },
    {
      id: 'puppy',
      name: 'Puppy',
      hindiName: 'पिल्ला 🐶',
      emoji: '🐶',
      paw: '🐾',
      soundKey: 'dog',
      color: '#3b82f6',
      greeting: 'Woof Woof! I am puppy! भो-भो!',
      hindiGreeting: 'भो-भो! मैं प्यारा पिल्ला हूँ, बहुत मज़ा आएगा!'
    },
    {
      id: 'kitty',
      name: 'Kitty',
      hindiName: 'किट्टी 🐱',
      emoji: '🐱',
      paw: '🐾',
      soundKey: 'cat',
      color: '#ec4899',
      greeting: 'Meow Meow! Sweet kitty! म्याऊँ!',
      hindiGreeting: 'म्याऊँ-म्याऊँ! मैं मीठी बिल्ली किट्टी हूँ!'
    },
    {
      id: 'bunny',
      name: 'Bunny',
      hindiName: 'बनी 🐰',
      emoji: '🐰',
      paw: '🥕',
      soundKey: 'boing',
      color: '#10b981',
      greeting: 'Hop Hop! Crunchy carrots! हॉप-हॉप!',
      hindiGreeting: 'हॉप-हॉप! मैं नटखट खरगोश बनी हूँ!'
    },
    {
      id: 'lion',
      name: 'Lion',
      hindiName: 'शेर 🦁',
      emoji: '🦁',
      paw: '👑',
      soundKey: 'lion',
      color: '#f97316',
      greeting: 'Roaaar! Brave little king! दहाड़!',
      hindiGreeting: 'दहाड़! मैं जंगल का राजा शेर हूँ, तुम बहुत बहादुर हो!'
    },
    {
      id: 'elephant',
      name: 'Elephant',
      hindiName: 'हाथी 🐘',
      emoji: '🐘',
      paw: '🎪',
      soundKey: 'elephant',
      color: '#8b5cf6',
      greeting: 'Pawooo! Big hugs! चिंघाड़!',
      hindiGreeting: 'चिंघाड़! मैं गोलू हाथी हूँ, ढेर सारा प्यार!'
    }
  ];

  selectedBuddyId = 'teddy';

  get currentBuddy(): MascotBuddy {
    return this.buddies.find(b => b.id === this.selectedBuddyId) || this.buddies[0];
  }

  get currentSpeechText(): string {
    return this.currentBuddy.greeting;
  }

  // Floating Balloons on Home Screen
  balloons: FloatingBalloon[] = [
    { id: 1, colorName: 'Red', emoji: '🎈', leftPct: 10, bottomPct: -10, durationSec: 16, delaySec: 0, isPopped: false },
    { id: 2, colorName: 'Gold', emoji: '🟡', leftPct: 32, bottomPct: -25, durationSec: 18, delaySec: 3, isPopped: false },
    { id: 3, colorName: 'Purple', emoji: '🟣', leftPct: 68, bottomPct: -15, durationSec: 15, delaySec: 1.5, isPopped: false },
    { id: 4, colorName: 'Blue', emoji: '🔵', leftPct: 86, bottomPct: -20, durationSec: 20, delaySec: 5, isPopped: false },
    { id: 5, colorName: 'Green', emoji: '🟢', leftPct: 50, bottomPct: -30, durationSec: 17, delaySec: 4, isPopped: false }
  ];

  // Animation states
  isTrainRacing = false;
  trainBubble = false;
  isFrogJumping = false;

  // Parent Gate Modal State
  isParentGateOpen = false;
  isParentVerified = false;
  mathNum1 = 3;
  mathNum2 = 4;
  mathAnswer = 7;
  mathOptions: number[] = [5, 7, 9];
  mathErrorMsg = '';
  voiceEnabled = true;
  selectedScreenTime = 'Unlimited';
  readonly screenTimeOptions = ['15 min', '30 min', '45 min', 'Unlimited'];

  constructor(
    public appNav: AppNavService,
    public sound: SoundService,
    private speech: SpeechService,
    private confetti: ConfettiService
  ) {}

  ngOnInit(): void {
    const savedStars = localStorage.getItem('toddler_total_stars');
    if (savedStars) {
      this.totalStars = parseInt(savedStars, 10) || 28;
    }
  }

  isCloudRaining(index: number): boolean {
    return this.rainingClouds.has(index);
  }

  onMascotClick(): void {
    this.selectBuddy(this.currentBuddy);
  }

  onSunClick(event: MouseEvent): void {
    this.sound.playBoing();
    this.isSunSquishing = true;
    this.sunSparkle = true;
    if (this.voiceEnabled) {
      this.speech.speakWord('Hello bright sunshine!');
    }
    setTimeout(() => {
      this.isSunSquishing = false;
      this.sunSparkle = false;
    }, 800);
  }

  onCloudClick(cloudIndex: number): void {
    this.sound.playHint();
    this.rainingClouds.add(cloudIndex);
    if (this.voiceEnabled) {
      this.speech.speakWord('Puffy cloud!');
    }
    setTimeout(() => {
      this.rainingClouds.delete(cloudIndex);
    }, 1200);
  }

  onStarClick(starName: string): void {
    this.sound.playSuccess();
    this.confetti.fire();
  }

  popBalloon(balloon: FloatingBalloon, event: MouseEvent): void {
    event.stopPropagation();
    this.sound.playBalloonBurst();
    balloon.isPopped = true;
    balloon.popX = event.clientX;
    balloon.popY = event.clientY;

    if (this.voiceEnabled) {
      this.speech.speakWord(balloon.colorName + ' balloon!');
    }

    // Respawn after 2.5s
    setTimeout(() => {
      balloon.isPopped = false;
      balloon.popX = undefined;
      balloon.popY = undefined;
      balloon.leftPct = Math.floor(Math.random() * 80) + 10;
    }, 2500);
  }

  onPlayClick(): void {
    this.sound.playFanfare();
    this.confetti.fire();
    if (this.voiceEnabled) {
      this.speech.speakClue("Let's go play!");
    }
    setTimeout(() => {
      this.appNav.goToHub();
    }, 280);
  }

  onRainbowStarClick(star: RainbowStar, event: MouseEvent): void {
    event.stopPropagation();
    this.tappedStarId = star.id;
    this.sound.playPianoNote(star.note);
    this.confetti.fire();
    if (this.voiceEnabled) {
      this.speech.speakWord(star.noteLabel);
    }
    setTimeout(() => {
      this.tappedStarId = null;
    }, 500);
  }

  selectBuddy(buddy: MascotBuddy): void {
    this.selectedBuddyId = buddy.id;
    this.isMascotJumping = true;
    this.confetti.fire();

    // Play authentic animal sound
    if (buddy.soundKey === 'dog') {
      this.sound.playDogBark();
    } else if (buddy.soundKey === 'cat') {
      this.sound.playCatMeow();
    } else if (buddy.soundKey === 'lion') {
      this.sound.playLionRoar();
    } else if (buddy.soundKey === 'elephant') {
      this.sound.playElephantTrumpet();
    } else if (buddy.soundKey === 'boing') {
      this.sound.playBoing();
    } else {
      this.sound.playGiggle();
    }

    if (this.voiceEnabled) {
      this.speech.speakHindi(buddy.hindiGreeting);
    }

    setTimeout(() => {
      this.isMascotJumping = false;
    }, 700);
  }

  onTrainClick(): void {
    this.sound.playTrainWhistle();
    this.isTrainRacing = true;
    this.trainBubble = true;
    this.confetti.fire();
    if (this.voiceEnabled) {
      this.speech.speakWord('Choo Choo! All aboard the fun train!');
    }
    setTimeout(() => {
      this.trainBubble = false;
    }, 1800);
    setTimeout(() => {
      this.isTrainRacing = false;
    }, 2200);
  }

  onFrogClick(): void {
    this.sound.playBoing();
    this.sound.playItemSound('frog');
    this.isFrogJumping = true;
    if (this.voiceEnabled) {
      this.speech.speakWord('Ribbit! Hop little froggy!');
    }
    setTimeout(() => {
      this.isFrogJumping = false;
    }, 600);
  }

  onBeeClick(): void {
    this.sound.playItemSound('bee');
    if (this.voiceEnabled) {
      this.speech.speakWord('Bzzz! Busy little honey bee!');
    }
  }

  onStarPillClick(): void {
    this.sound.playSuccess();
    this.confetti.fire();
    if (this.voiceEnabled) {
      this.speech.speakClue('You have collected ' + this.totalStars + ' shining stars! You are doing amazing!');
    }
  }

  onFlowerClick(flower: string): void {
    this.sound.playPop();
  }

  onButterflyClick(): void {
    this.sound.playGiggle();
    if (this.voiceEnabled) {
      this.speech.speakWord('Flitter flutter butterfly!');
    }
  }

  // Parent Gate Methods
  openParentGate(): void {
    this.sound.playTap();
    this.generateMathProblem();
    this.isParentVerified = false;
    this.mathErrorMsg = '';
    this.isParentGateOpen = true;
  }

  closeParentGate(): void {
    this.sound.playTap();
    this.isParentGateOpen = false;
  }

  generateMathProblem(): void {
    this.mathNum1 = Math.floor(Math.random() * 5) + 2;
    this.mathNum2 = Math.floor(Math.random() * 5) + 1;
    this.mathAnswer = this.mathNum1 + this.mathNum2;
    
    const wrong1 = this.mathAnswer + (Math.random() > 0.5 ? 2 : -2);
    const wrong2 = this.mathAnswer + (Math.random() > 0.5 ? 3 : -1);
    const opts = Array.from(new Set([this.mathAnswer, wrong1, wrong2]));
    while (opts.length < 3) {
      opts.push(opts[opts.length - 1] + 1);
    }
    this.mathOptions = opts.sort(() => Math.random() - 0.5);
  }

  onMathOptionSelect(selected: number): void {
    if (selected === this.mathAnswer) {
      this.sound.playSuccess();
      this.isParentVerified = true;
      this.mathErrorMsg = '';
    } else {
      this.sound.playBoing();
      this.mathErrorMsg = 'Oops! Only grown-ups can enter. Try again 😊';
      this.generateMathProblem();
    }
  }

  toggleVoice(): void {
    this.voiceEnabled = !this.voiceEnabled;
    this.sound.playTap();
  }

  setScreenTime(time: string): void {
    this.selectedScreenTime = time;
    this.sound.playTap();
  }

  resetStars(): void {
    this.totalStars = 0;
    localStorage.setItem('toddler_total_stars', '0');
    this.sound.playPop();
  }
}

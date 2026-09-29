import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppNavService, AppScreen } from '../../core/services/app-nav.service';
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

interface QuickGame {
  id: AppScreen;
  title: string;
  emoji: string;
  tag: string;
  bgGradient: string;
  borderColor: string;
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

      <!-- 🎪 Center Stage: Animated Living Mascot & Title -->
      <main class="portal-content">
        <!-- Living Mascot Companion -->
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
            <span class="mascot-emoji">{{ currentMood.emoji }}</span>
            <div class="waving-paw">{{ currentMood.paw }}</div>
          </div>

          <!-- Interactive Speech Bubble -->
          <div class="speech-bubble animate-pop">
            <span class="speech-text">{{ currentMood.msg }}</span>
            <span class="speech-tap-hint">👆 Tap me!</span>
          </div>
        </div>

        <!-- Grand Game Title -->
        <div class="title-group">
          <span class="title-badge">🌈 PLAY • LEARN • EXPLORE 🌈</span>
          <h1 class="portal-title">
            TODDLER<span class="title-accent">MIND</span>
          </h1>
          <p class="portal-sub">Magical world of fun learning games for smart kids!</p>
        </div>

        <!-- 🚀 Grand Jelly "TAP TO PLAY!" Mega Button -->
        <div class="action-dock">
          <button 
            type="button" 
            (click)="onPlayClick()"
            class="jelly-play-btn"
            id="btn-toddler-play"
            title="Start your learning adventure!">
            <div class="play-pulse-ring"></div>
            <span class="play-icon-box">▶</span>
            <span class="play-text">TAP TO PLAY!</span>
            <span class="sparkle-tail">✨</span>
          </button>
        </div>

        <!-- ⚡ Quick Play Mini-Game Dock (Jump straight into favorite games) -->
        <div class="quick-dock-wrapper">
          <div class="dock-header">
            <span class="dock-line"></span>
            <span class="dock-title">⚡ QUICK PLAY FAVORITES</span>
            <span class="dock-line"></span>
          </div>

          <div class="quick-games-grid">
            @for (game of quickGames; track game.id) {
              <button 
                type="button" 
                class="quick-game-card"
                [style.background]="game.bgGradient"
                [style.border-color]="game.borderColor"
                (click)="launchGame(game.id)"
                [title]="'Jump into ' + game.title">
                <span class="quick-game-emoji">{{ game.emoji }}</span>
                <span class="quick-game-name">{{ game.title }}</span>
                <span class="quick-game-tag">{{ game.tag }}</span>
              </button>
            }
          </div>
        </div>
      </main>

      <!-- 🌸 Bottom Garden Meadow -->
      <footer class="portal-ground">
        <div class="garden-decor">
          <span class="flower-item" (click)="onFlowerClick('🌸')">🌸</span>
          <span class="flower-item" (click)="onFlowerClick('🍄')">🍄</span>
          <span class="flower-item" (click)="onFlowerClick('🌻')">🌻</span>
          <span class="flower-item butterfly-item" (click)="onButterflyClick()">🦋</span>
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

    /* 🚀 Action Dock: Mega Play Button */
    .action-dock {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      max-width: 360px;
      margin-bottom: 22px;
      position: relative;
    }

    .jelly-play-btn {
      width: 100%;
      height: 74px;
      border-radius: 28px;
      border: 3.5px solid #fde047;
      background: linear-gradient(135deg, #f59e0b 0%, #ef4444 60%, #ec4899 100%);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      cursor: pointer;
      outline: none;
      position: relative;
      box-shadow: 
        0 14px 40px -5px rgba(239, 68, 68, 0.65),
        0 0 30px rgba(245, 158, 11, 0.55),
        inset 0 3px 4px rgba(255, 255, 255, 0.7),
        inset 0 -4px 0 rgba(0, 0, 0, 0.3);
      animation: jellyPulse 2.4s infinite;
      transition: all 0.22s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .jelly-play-btn:hover {
      transform: translateY(-4px) scale(1.03);
      box-shadow: 
        0 20px 50px -5px rgba(239, 68, 68, 0.8),
        0 0 40px rgba(245, 158, 11, 0.7);
    }
    .jelly-play-btn:active {
      transform: translateY(2px) scale(0.97);
    }

    .play-icon-box {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: #ffffff;
      color: #ef4444;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 19px;
      font-weight: 900;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
    }

    .play-text {
      font-family: var(--font-display);
      font-size: clamp(1.25rem, 4.2vw, 1.55rem);
      font-weight: 900;
      letter-spacing: 0.04em;
      text-shadow: 0 2px 5px rgba(0, 0, 0, 0.35);
    }

    .sparkle-tail {
      font-size: 1.5rem;
      animation: twinkle 1.5s infinite;
    }

    /* ⚡ Quick Games Dock */
    .quick-dock-wrapper {
      width: 100%;
      max-width: 580px;
      margin-top: 4px;
    }

    .dock-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
      opacity: 0.85;
    }

    .dock-line {
      flex: 1;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    }

    .dock-title {
      font-size: 0.72rem;
      font-weight: 800;
      color: #cbd5e1;
      letter-spacing: 0.08em;
    }

    .quick-games-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
    }

    @media (max-width: 500px) {
      .quick-games-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .quick-game-card {
      padding: 10px 8px;
      border-radius: 18px;
      border: 1.5px solid;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 3px;
      cursor: pointer;
      backdrop-filter: blur(8px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
      transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .quick-game-card:hover {
      transform: translateY(-3px) scale(1.04);
      box-shadow: 0 10px 22px rgba(0, 0, 0, 0.35);
    }
    .quick-game-card:active {
      transform: scale(0.96);
    }

    .quick-game-emoji {
      font-size: clamp(1.4rem, 4vw, 1.8rem);
      line-height: 1;
      filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.3));
    }

    .quick-game-name {
      font-size: 0.76rem;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: 0.02em;
      white-space: nowrap;
    }

    .quick-game-tag {
      font-size: 0.62rem;
      font-weight: 700;
      color: rgba(255, 255, 255, 0.8);
    }

    /* 🌸 Bottom Meadow */
    .portal-ground {
      width: 100%;
      padding: 14px 20px 20px 20px;
      display: flex;
      justify-content: center;
      position: relative;
      z-index: 5;
    }

    .garden-decor {
      display: flex;
      align-items: center;
      gap: clamp(12px, 3.5vw, 24px);
      font-size: clamp(1.3rem, 3.8vw, 1.7rem);
      filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.45));
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

  // Mascot Moods
  readonly mascotMoods = [
    { emoji: '🧸', paw: '👋', msg: 'Hi friend! Ready to play?', voice: 'Hi friend! Welcome to Toddler Mind! Tap me again!' },
    { emoji: '😎', paw: '✌️', msg: 'You are super smart!', voice: 'You are super smart! Let us play together!' },
    { emoji: '🥳', paw: '🎉', msg: 'Yay! Party time!', voice: 'Yay! It is party time! Let us have fun!' },
    { emoji: '🥰', paw: '💖', msg: 'Big warm teddy hugs!', voice: 'Big warm teddy hugs for you! You are wonderful!' },
    { emoji: '🚀', paw: '🌟', msg: 'Ready for space adventure?', voice: 'Ready for a fun adventure! Blast off!' }
  ];
  moodIndex = 0;

  get currentMood() {
    return this.mascotMoods[this.moodIndex];
  }

  // Floating Balloons on Home Screen
  balloons: FloatingBalloon[] = [
    { id: 1, colorName: 'Red', emoji: '🎈', leftPct: 10, bottomPct: -10, durationSec: 16, delaySec: 0, isPopped: false },
    { id: 2, colorName: 'Gold', emoji: '🟡', leftPct: 32, bottomPct: -25, durationSec: 18, delaySec: 3, isPopped: false },
    { id: 3, colorName: 'Purple', emoji: '🟣', leftPct: 68, bottomPct: -15, durationSec: 15, delaySec: 1.5, isPopped: false },
    { id: 4, colorName: 'Blue', emoji: '🔵', leftPct: 86, bottomPct: -20, durationSec: 20, delaySec: 5, isPopped: false },
    { id: 5, colorName: 'Green', emoji: '🟢', leftPct: 50, bottomPct: -30, durationSec: 17, delaySec: 4, isPopped: false }
  ];

  // Quick Game Shortcuts
  readonly quickGames: QuickGame[] = [
    {
      id: 'alphabet_safari',
      title: 'ABCD Safari',
      emoji: '🔤',
      tag: 'Phonics & A-Z',
      bgGradient: 'linear-gradient(135deg, rgba(99, 102, 241, 0.28), rgba(168, 85, 247, 0.22))',
      borderColor: 'rgba(167, 139, 250, 0.5)'
    },
    {
      id: 'number_counting',
      title: '123 Numbers',
      emoji: '🔢',
      tag: 'Tap & Count',
      bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.28), rgba(6, 182, 212, 0.22))',
      borderColor: 'rgba(52, 211, 153, 0.5)'
    },
    {
      id: 'hindi_varnamala',
      title: 'क ख ग घ',
      emoji: '🕉️',
      tag: 'हिंदी वर्णमाला',
      bgGradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.28), rgba(239, 68, 68, 0.22))',
      borderColor: 'rgba(251, 191, 36, 0.5)'
    },
    {
      id: 'balloon_pop',
      title: 'Balloon Pop',
      emoji: '🎈',
      tag: 'Colors & Fun',
      bgGradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(245, 158, 11, 0.2))',
      borderColor: 'rgba(239, 68, 68, 0.45)'
    },
    {
      id: 'piece_puzzle',
      title: 'Puzzle Snap',
      emoji: '🧩',
      tag: 'Jigsaw Puzzles',
      bgGradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(147, 51, 234, 0.2))',
      borderColor: 'rgba(59, 130, 246, 0.45)'
    },
    {
      id: 'sound_matcher',
      title: 'Animal Sounds',
      emoji: '🐮',
      tag: 'Real Sounds',
      bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(245, 158, 11, 0.2))',
      borderColor: 'rgba(16, 185, 129, 0.45)'
    }
  ];

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
    this.sound.playGiggle();
    this.isMascotJumping = true;
    
    // Cycle mascot mood
    this.moodIndex = (this.moodIndex + 1) % this.mascotMoods.length;
    
    if (this.voiceEnabled) {
      this.speech.speakClue(this.currentMood.voice);
    }
    
    // Confetti pop
    this.confetti.fire();

    setTimeout(() => {
      this.isMascotJumping = false;
    }, 650);
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

  launchGame(screen: AppScreen): void {
    this.sound.playTap();
    switch (screen) {
      case 'alphabet_safari':
        this.appNav.goToAlphabet();
        break;
      case 'number_counting':
        this.appNav.goToNumbers();
        break;
      case 'hindi_varnamala':
        this.appNav.goToHindi();
        break;
      case 'balloon_pop':
        this.appNav.goToBalloonPop();
        break;
      case 'piece_puzzle':
        this.appNav.goToPiecePuzzle();
        break;
      case 'sound_matcher':
        this.appNav.goToSoundMatcher();
        break;
      case 'shape_sorter':
        this.appNav.goToShapeSorter();
        break;
      case 'memory_flip':
        this.appNav.goToMemoryFlip();
        break;
      case 'rebus':
        this.appNav.goToRebus();
        break;
      default:
        this.appNav.goToHub();
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

import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppNavService } from '../../core/services/app-nav.service';
import { SoundService } from '../../core/services/sound.service';
import { SpeechService } from '../../core/services/speech.service';
import { ConfettiService } from '../../core/services/confetti.service';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { Capacitor } from '@capacitor/core';

interface PianoKey {
  note: string;
  hindiSwar: string;
  solfege: string;
  freq: number;
  color: string;
  keyLabel: string;
}

interface SongGuide {
  id: string;
  title: string;
  hindiTitle: string;
  emoji: string;
  notes: number[]; // index of key in keys array (0-7)
}

@Component({
  selector: 'app-animal-piano',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="piano-viewport" [class.is-landscape]="!isPortrait">
      <!-- 📱 Portrait Mode Rotation Helper Banner -->
      @if (isPortrait) {
        <div class="rotate-helper-banner animate-slide-down">
          <div class="rotate-icon animate-spin-pulse">🔄</div>
          <div class="rotate-text">
            <strong>फोन को आड़ा (Landscape) घुमाएँ</strong>
            <span>Rotate phone sideways for the best giant piano keys!</span>
          </div>
          <button type="button" class="fullscreen-pill-btn" (click)="toggleFullscreen()">
            ⛶ Fullscreen
          </button>
        </div>
      }

      <!-- 🌟 Sleek Compact Top Bar -->
      <header class="piano-header">
        <div class="header-left">
          <button 
            type="button" 
            (click)="goBack()" 
            class="nav-btn"
            id="btn-piano-back"
            title="Back to Hub">
            <span class="btn-icon">⬅️</span>
            <span class="btn-text">Hub</span>
          </button>

          <div class="title-badge">
            <span class="badge-emoji">{{ currentModeEmoji }}</span>
            <div class="badge-texts">
              <h2 class="title-text">Rainbow Piano</h2>
              <span class="title-hindi">जादुई पियानो</span>
            </div>
          </div>
        </div>

        <!-- 🐱 INSTRUMENT & ANIMAL SOUND SELECTOR -->
        <nav class="sound-mode-selector">
          <button 
            type="button" 
            class="mode-btn"
            [class.mode-active]="soundMode === 'piano'"
            (click)="setSoundMode('piano')"
            title="Real Grand Piano">
            <span class="mode-icon">🎹</span>
            <span class="mode-label">Piano</span>
          </button>
          <button 
            type="button" 
            class="mode-btn"
            [class.mode-active]="soundMode === 'cat'"
            (click)="setSoundMode('cat')"
            title="Singing Cat Meow">
            <span class="mode-icon">🐱</span>
            <span class="mode-label">Meow</span>
          </button>
          <button 
            type="button" 
            class="mode-btn"
            [class.mode-active]="soundMode === 'dog'"
            (click)="setSoundMode('dog')"
            title="Playful Dog Woof">
            <span class="mode-icon">🐶</span>
            <span class="mode-label">Woof</span>
          </button>
          <button 
            type="button" 
            class="mode-btn"
            [class.mode-active]="soundMode === 'duck'"
            (click)="setSoundMode('duck')"
            title="Cheerful Duck Quack">
            <span class="mode-icon">🦆</span>
            <span class="mode-label">Quack</span>
          </button>
        </nav>

        <div class="header-right">
          <button 
            type="button" 
            (click)="sound.toggleMute()" 
            class="sound-btn"
            [title]="sound.isMuted() ? 'Turn Sound On' : 'Turn Sound Off'">
            {{ sound.isMuted() ? '🔇' : '🎵' }}
          </button>
        </div>
      </header>

      <!-- 🎶 SONG TUTOR DOCK (Guided Nursery Rhymes & Demo Mode) -->
      <section class="songs-bar">
        <div class="songs-pill-group">
          <span class="songs-heading">🎵 Songs:</span>
          @for (song of songs; track song.id) {
            <button 
              type="button" 
              class="song-pill"
              [class.song-active]="activeSong?.id === song.id"
              (click)="selectSong(song)">
              <span>{{ song.emoji }} {{ song.title }}</span>
            </button>
          }
          @if (activeSong) {
            <button type="button" class="stop-song-pill" (click)="stopSong()">
              <span>✕ Free Play</span>
            </button>
          }
        </div>

        <!-- Demo & Play Along Action Controls -->
        @if (activeSong) {
          <div class="song-action-controls animate-pop">
            <button 
              type="button" 
              class="action-btn demo-btn"
              [class.btn-glowing]="isDemoPlaying"
              (click)="toggleDemoPlay()">
              <span>{{ isDemoPlaying ? '⏸️ Pause Demo' : '🎧 Demo सुनो (Auto)' }}</span>
            </button>

            <button 
              type="button" 
              class="action-btn play-along-btn"
              [class.btn-active-tutor]="!isDemoPlaying"
              (click)="startGuidedPlay()">
              <span>🎹 अब आप बजाओ (Play)</span>
            </button>

            <span class="song-progress-badge">
              Step: {{ songStep + 1 }} / {{ activeSong.notes.length }}
            </span>
          </div>
        }
      </section>

      <!-- 🎪 INTERACTIVE KEYBOARD STAGE -->
      <main class="keyboard-stage">
        <!-- Mascot Reaction Bubble -->
        <div class="mascot-stage" [class.mascot-bounce]="lastPlayedIndex !== null || isDemoPlaying">
          <span class="mascot-face">{{ getMascotFace() }}</span>
          <div class="speech-cloud">
            @if (isDemoPlaying) {
              <span>🎶 सुनिए और देखिए कौन-सी चाबियाँ बज रही हैं!</span>
            } @else if (activeSong) {
              <span>चमकती चाबी दबाओ: <strong>{{ keys[activeSong.notes[songStep]].solfege }} ({{ keys[activeSong.notes[songStep]].hindiSwar }})</strong>!</span>
            } @else {
              <span>रंग-बिरंगी चाबियाँ दबाकर मधुर धुन बजाओ! 🎶</span>
            }
          </div>
        </div>

        <!-- 🌈 8 Giant Rainbow Piano Keys -->
        <div class="piano-keys-container">
          @for (k of keys; track k.note; let i = $index) {
            <button 
              type="button" 
              class="rainbow-key"
              [class.key-pressed]="lastPlayedIndex === i || demoActiveKeyIndex === i"
              [class.key-guide-glow]="!isDemoPlaying && activeSong && activeSong.notes[songStep] === i"
              [style.--key-color]="k.color"
              (pointerdown)="playKey(i)"
              (keydown.enter)="playKey(i)">
              
              <!-- Sparkle Star on Guide -->
              @if (!isDemoPlaying && activeSong && activeSong.notes[songStep] === i) {
                <div class="guide-star-cluster">
                  <span class="guide-star">⭐</span>
                  <span class="guide-finger">👇</span>
                </div>
              }

              <!-- Demo Note Glow Sparkle -->
              @if (demoActiveKeyIndex === i) {
                <span class="demo-sparkle">✨</span>
              }

              <!-- Top animal/note icon -->
              <span class="key-emoji">{{ getKeyEmoji(i) }}</span>

              <div class="key-bottom-info">
                <span class="solfege-text">{{ k.solfege }}</span>
                <span class="hindi-swar">{{ k.hindiSwar }}</span>
                <span class="note-label">{{ k.note }}</span>
              </div>
            </button>
          }
        </div>
      </main>

      <!-- Bottom Hint Footer -->
      <footer class="piano-footer">
        <p class="footer-text">
          💡 Fun Tip: Switch to 🐱 Cat, 🐶 Dog or 🦆 Duck mode for singing animal voices! 
          Tap <strong>'Demo सुनो'</strong> to hear melodies first!
        </p>
      </footer>
    </div>
  `,
  styles: [`
    .piano-viewport {
      height: 100vh;
      height: 100dvh;
      width: 100%;
      background: var(--app-viewport-bg, radial-gradient(circle at 50% 20%, #2e1065 0%, #0f172a 60%, #020617 100%));
      transition: background 0.4s ease;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      user-select: none;
      overflow: hidden;
      touch-action: manipulation;
    }

    /* 📱 Rotate Helper Banner */
    .rotate-helper-banner {
      position: absolute;
      top: 8px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 50;
      background: linear-gradient(135deg, rgba(234, 179, 8, 0.95), rgba(249, 115, 22, 0.95));
      color: #0f172a;
      padding: 6px 14px;
      border-radius: 24px;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
      max-width: 90%;
      backdrop-filter: blur(8px);
      font-size: 0.76rem;
    }
    .rotate-icon {
      font-size: 1.2rem;
    }
    .rotate-text {
      display: flex;
      flex-direction: column;
      line-height: 1.2;
    }
    .rotate-text strong {
      font-weight: 900;
    }
    .fullscreen-pill-btn {
      padding: 4px 10px;
      border-radius: 14px;
      background: #0f172a;
      color: #fde047;
      border: none;
      font-size: 0.7rem;
      font-weight: 800;
      cursor: pointer;
    }

    /* Top Nav */
    .piano-header {
      width: 100%;
      max-width: 1100px;
      margin: 0 auto;
      padding: 6px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      z-index: 20;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .nav-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 6px 12px;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.22);
      color: #ffffff;
      font-size: 0.78rem;
      font-weight: 800;
      cursor: pointer;
      backdrop-filter: blur(8px);
      transition: all 0.2s;
    }
    .nav-btn:hover {
      background: rgba(255, 255, 255, 0.25);
      transform: translateY(-2px);
    }

    .title-badge {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .badge-emoji {
      font-size: 24px;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4));
    }
    .badge-texts {
      display: flex;
      flex-direction: column;
      line-height: 1.1;
    }
    .title-text {
      font-family: inherit;
      font-size: clamp(0.95rem, 2vw, 1.2rem);
      font-weight: 900;
      color: #ffffff;
      margin: 0;
      letter-spacing: -0.01em;
    }
    .title-hindi {
      font-size: 0.72rem;
      font-weight: 700;
      color: #fde047;
    }

    /* Sound Mode Selectors */
    .sound-mode-selector {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      background: rgba(255, 255, 255, 0.06);
      padding: 4px;
      border-radius: 24px;
      border: 1px solid rgba(255, 255, 255, 0.12);
    }

    .mode-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 5px 12px;
      border-radius: 18px;
      background: transparent;
      border: none;
      color: #cbd5e1;
      font-size: 0.74rem;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .mode-btn:hover {
      background: rgba(255, 255, 255, 0.15);
      color: #ffffff;
    }
    .mode-btn.mode-active {
      background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(168, 85, 247, 0.5);
      transform: scale(1.05);
    }
    .mode-icon {
      font-size: 16px;
    }

    .header-right {
      display: flex;
      align-items: center;
    }
    .sound-btn {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 1px solid rgba(255, 255, 255, 0.2);
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
      font-size: 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Songs Bar */
    .songs-bar {
      width: 100%;
      max-width: 1050px;
      margin: 0 auto;
      padding: 4px 14px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
    }
    .songs-pill-group {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      flex-wrap: wrap;
    }
    .songs-heading {
      color: #fde047;
      font-size: 0.74rem;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .song-pill {
      padding: 4px 10px;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.18);
      color: #e2e8f0;
      font-size: 0.7rem;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.2s;
    }
    .song-pill:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    .song-pill.song-active {
      background: #f59e0b;
      color: #0f172a;
      border-color: #fde047;
      font-weight: 900;
      box-shadow: 0 0 12px rgba(245, 158, 11, 0.6);
      transform: scale(1.05);
    }
    .stop-song-pill {
      padding: 4px 8px;
      border-radius: 14px;
      background: rgba(239, 68, 68, 0.2);
      border: 1px solid rgba(239, 68, 68, 0.4);
      color: #fca5a5;
      font-size: 0.7rem;
      font-weight: 800;
      cursor: pointer;
    }

    .song-action-controls {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      justify-content: center;
      margin-top: 2px;
    }
    .action-btn {
      padding: 5px 12px;
      border-radius: 16px;
      font-size: 0.74rem;
      font-weight: 800;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .demo-btn {
      background: linear-gradient(135deg, #06b6d4, #0284c7);
      color: #ffffff;
      box-shadow: 0 4px 10px rgba(6, 182, 212, 0.4);
    }
    .demo-btn.btn-glowing {
      background: linear-gradient(135deg, #ec4899, #f43f5e);
      animation: pulseGlow 1.2s infinite alternate;
    }
    .play-along-btn {
      background: linear-gradient(135deg, #10b981, #059669);
      color: #ffffff;
      box-shadow: 0 4px 10px rgba(16, 185, 129, 0.4);
    }
    .play-along-btn.btn-active-tutor {
      border: 2px solid #fde047;
      transform: scale(1.04);
    }
    .song-progress-badge {
      font-size: 0.72rem;
      color: #fde047;
      font-weight: 800;
      background: rgba(255, 255, 255, 0.1);
      padding: 3px 8px;
      border-radius: 10px;
    }

    /* Keyboard Stage */
    .keyboard-stage {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      padding: 4px 12px 8px 12px;
      max-width: 1200px;
      width: 100%;
      margin: 0 auto;
      gap: 8px;
    }

    .mascot-stage {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.16);
      padding: 4px 14px;
      border-radius: 20px;
      backdrop-filter: blur(10px);
      transition: transform 0.15s;
    }
    .mascot-bounce {
      transform: scale(1.05);
    }
    .mascot-face {
      font-size: 24px;
    }
    .speech-cloud {
      color: #ffffff;
      font-size: 0.8rem;
      font-weight: 700;
    }

    /* 🌈 Rainbow Keys */
    .piano-keys-container {
      width: 100%;
      height: 58vh;
      max-height: 420px;
      min-height: 220px;
      display: flex;
      gap: 8px;
      padding: 8px;
      background: rgba(15, 23, 42, 0.8);
      border: 3px solid rgba(255, 255, 255, 0.2);
      border-radius: 24px;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6), inset 0 0 0 2px rgba(255, 255, 255, 0.1);
    }

    .rainbow-key {
      flex: 1;
      height: 100%;
      border-radius: 16px;
      background: var(--key-color);
      border: 3px solid rgba(255, 255, 255, 0.7);
      box-shadow: 0 8px 18px rgba(0, 0, 0, 0.35), inset 0 -8px 0 rgba(0, 0, 0, 0.25), inset 0 8px 0 rgba(255, 255, 255, 0.5);
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      padding: 12px 4px 16px 4px;
      position: relative;
      touch-action: none;
      transition: transform 0.08s, filter 0.1s, box-shadow 0.1s;
    }

    .rainbow-key:active, .rainbow-key.key-pressed {
      transform: translateY(8px) scale(0.96);
      filter: brightness(1.25);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4), inset 0 0 18px rgba(255, 255, 255, 0.9);
    }

    .rainbow-key.key-guide-glow {
      animation: keyPulse 0.9s infinite alternate;
      border-color: #ffffff;
      box-shadow: 0 0 30px #ffffff, 0 8px 18px rgba(0, 0, 0, 0.35);
      z-index: 5;
    }

    .guide-star-cluster {
      position: absolute;
      top: -18px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      animation: starBounce 0.5s infinite alternate;
    }
    .guide-star {
      font-size: 26px;
      filter: drop-shadow(0 0 10px #facc15);
    }
    .guide-finger {
      font-size: 20px;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
    }

    .demo-sparkle {
      position: absolute;
      top: -10px;
      font-size: 24px;
      animation: sparkleRotate 0.6s infinite alternate;
    }

    .key-emoji {
      font-size: clamp(20px, 4vw, 32px);
      filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.4));
    }

    .key-bottom-info {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1px;
    }

    .solfege-text {
      font-size: clamp(0.85rem, 2.2vw, 1.15rem);
      font-weight: 900;
      color: #ffffff;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
      letter-spacing: -0.02em;
    }

    .hindi-swar {
      font-size: clamp(0.72rem, 1.8vw, 0.95rem);
      font-weight: 800;
      color: #ffffff;
      background: rgba(0, 0, 0, 0.25);
      padding: 1px 6px;
      border-radius: 8px;
    }

    .note-label {
      font-size: 0.6rem;
      font-weight: 700;
      color: rgba(255, 255, 255, 0.85);
      margin-top: 1px;
    }

    /* Footer */
    .piano-footer {
      width: 100%;
      text-align: center;
      padding: 4px 16px 8px 16px;
    }
    .footer-text {
      color: #94a3b8;
      font-size: 0.68rem;
      margin: 0;
    }

    /* Animations */
    @keyframes keyPulse {
      0% {
        transform: translateY(0);
        box-shadow: 0 0 15px rgba(255, 255, 255, 0.6);
      }
      100% {
        transform: translateY(-4px);
        box-shadow: 0 0 32px #ffffff, 0 10px 20px rgba(0, 0, 0, 0.5);
      }
    }

    @keyframes starBounce {
      0% { transform: translateY(0) scale(1); }
      100% { transform: translateY(-8px) scale(1.15); }
    }

    @keyframes sparkleRotate {
      0% { transform: rotate(0deg) scale(0.9); }
      100% { transform: rotate(35deg) scale(1.2); }
    }

    @keyframes pulseGlow {
      0% { box-shadow: 0 0 8px rgba(236, 72, 153, 0.5); }
      100% { box-shadow: 0 0 20px rgba(236, 72, 153, 0.9); }
    }

    @keyframes spinPulse {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(180deg); }
    }
    .animate-spin-pulse {
      animation: spinPulse 2s ease-in-out infinite alternate;
    }

    .animate-slide-down {
      animation: slideDown 0.3s ease-out;
    }
    @keyframes slideDown {
      from { transform: translate(-50%, -20px); opacity: 0; }
      to { transform: translate(-50%, 0); opacity: 1; }
    }

    .animate-pop {
      animation: popIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    @keyframes popIn {
      from { transform: scale(0.85); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
  `]
})
export class AnimalPianoComponent implements OnInit, OnDestroy {
  // 8 Rainbow Piano Keys (C4 to C5 octave)
  readonly keys: PianoKey[] = [
    { note: 'C4', hindiSwar: 'सा', solfege: 'Do', freq: 261.63, color: 'linear-gradient(180deg, #ef4444 0%, #b91c1c 100%)', keyLabel: '1' },
    { note: 'D4', hindiSwar: 'रे', solfege: 'Re', freq: 293.66, color: 'linear-gradient(180deg, #f97316 0%, #c2410c 100%)', keyLabel: '2' },
    { note: 'E4', hindiSwar: 'ग', solfege: 'Mi', freq: 329.63, color: 'linear-gradient(180deg, #eab308 0%, #a16207 100%)', keyLabel: '3' },
    { note: 'F4', hindiSwar: 'म', solfege: 'Fa', freq: 349.23, color: 'linear-gradient(180deg, #22c55e 0%, #15803d 100%)', keyLabel: '4' },
    { note: 'G4', hindiSwar: 'प', solfege: 'So', freq: 392.00, color: 'linear-gradient(180deg, #06b6d4 0%, #0369a1 100%)', keyLabel: '5' },
    { note: 'A4', hindiSwar: 'ध', solfege: 'La', freq: 440.00, color: 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)', keyLabel: '6' },
    { note: 'B4', hindiSwar: 'नि', solfege: 'Ti', freq: 493.88, color: 'linear-gradient(180deg, #8b5cf6 0%, #6d28d9 100%)', keyLabel: '7' },
    { note: 'C5', hindiSwar: 'सां', solfege: 'Do', freq: 523.25, color: 'linear-gradient(180deg, #ec4899 0%, #be185d 100%)', keyLabel: '8' }
  ];

  // 6 Popular Kids Songs
  readonly songs: SongGuide[] = [
    {
      id: 'twinkle',
      title: 'Twinkle Star',
      hindiTitle: 'ट्विंकल ट्विंकल',
      emoji: '🌟',
      notes: [0, 0, 4, 4, 5, 5, 4, 3, 3, 2, 2, 1, 1, 0]
    },
    {
      id: 'birthday',
      title: 'Happy Birthday',
      hindiTitle: 'जन्मदिन गीत',
      emoji: '🎂',
      notes: [0, 0, 1, 0, 3, 2, 0, 0, 1, 0, 4, 3]
    },
    {
      id: 'macdonald',
      title: 'Old MacDonald',
      hindiTitle: 'ओल्ड मैकडोनाल्ड',
      emoji: '🚜',
      notes: [4, 4, 4, 1, 2, 2, 1, 6, 6, 5, 5, 4]
    },
    {
      id: 'jingle',
      title: 'Jingle Bells',
      hindiTitle: 'जिंगल बेल्स',
      emoji: '🔔',
      notes: [2, 2, 2, 2, 2, 2, 2, 4, 0, 1, 2, 3, 3, 3]
    },
    {
      id: 'lamb',
      title: 'Mary Lamb',
      hindiTitle: 'नन्हीं मेरी',
      emoji: '🐑',
      notes: [2, 1, 0, 1, 2, 2, 2, 1, 1, 1, 2, 4, 4]
    },
    {
      id: 'saregama',
      title: 'Sa Re Ga Ma',
      hindiTitle: 'सा रे ग म',
      emoji: '🌈',
      notes: [0, 1, 2, 3, 4, 5, 6, 7]
    }
  ];

  soundMode: 'piano' | 'cat' | 'dog' | 'duck' = 'piano';
  lastPlayedIndex: number | null = null;
  activeSong: SongGuide | null = null;
  songStep = 0;
  isDemoPlaying = false;
  demoActiveKeyIndex: number | null = null;
  isPortrait = false;

  private bounceTimeout: ReturnType<typeof setTimeout> | null = null;
  private demoInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    public appNav: AppNavService,
    public sound: SoundService,
    private speech: SpeechService,
    private confetti: ConfettiService
  ) {}

  ngOnInit(): void {
    this.checkOrientation();
    this.lockOrientationLandscape();
  }

  ngOnDestroy(): void {
    this.stopDemoPlay();
    if (this.bounceTimeout) clearTimeout(this.bounceTimeout);
    this.unlockOrientation();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkOrientation();
  }

  @HostListener('window:orientationchange')
  onOrientationChange(): void {
    setTimeout(() => this.checkOrientation(), 200);
  }

  private checkOrientation(): void {
    if (typeof window !== 'undefined') {
      const isNarrow = window.innerWidth < window.innerHeight && window.innerWidth < 650;
      this.isPortrait = isNarrow;
    }
  }

  private async lockOrientationLandscape(): Promise<void> {
    try {
      if (Capacitor.isNativePlatform()) {
        await ScreenOrientation.lock({ orientation: 'landscape' });
      } else if (typeof screen !== 'undefined' && 'orientation' in screen && (screen.orientation as any).lock) {
        await (screen.orientation as any).lock('landscape').catch(() => {});
      }
    } catch (err) {
      console.warn('Orientation lock skipped:', err);
    }
  }

  private async unlockOrientation(): Promise<void> {
    try {
      if (Capacitor.isNativePlatform()) {
        await ScreenOrientation.unlock();
      } else if (typeof screen !== 'undefined' && 'orientation' in screen && (screen.orientation as any).unlock) {
        (screen.orientation as any).unlock();
      }
    } catch (err) {
      console.warn('Orientation unlock skipped:', err);
    }
  }

  toggleFullscreen(): void {
    if (typeof document !== 'undefined') {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().then(() => {
          this.lockOrientationLandscape();
        }).catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    }
  }

  get currentModeEmoji(): string {
    switch (this.soundMode) {
      case 'cat': return '🐱';
      case 'dog': return '🐶';
      case 'duck': return '🦆';
      default: return '🎹';
    }
  }

  getMascotFace(): string {
    if (this.isDemoPlaying) return '🎶';
    if (this.lastPlayedIndex !== null) return '🥳';
    switch (this.soundMode) {
      case 'cat': return '😺';
      case 'dog': return '🐶';
      case 'duck': return '🐥';
      default: return '🧸';
    }
  }

  getKeyEmoji(idx: number): string {
    if (this.soundMode === 'cat') return '🐱';
    if (this.soundMode === 'dog') return '🐶';
    if (this.soundMode === 'duck') return '🦆';
    const emojis = ['🎈', '🍓', '🌟', '🍀', '🐬', '🚀', '🔮', '💖'];
    return emojis[idx % emojis.length];
  }

  setSoundMode(mode: 'piano' | 'cat' | 'dog' | 'duck'): void {
    this.sound.playTap();
    this.soundMode = mode;
    if (mode === 'cat') {
      this.sound.playCatMeow();
      this.speech.speakClue('म्याऊं! बिल्ली वाला पियानो!');
    } else if (mode === 'dog') {
      this.sound.playDogBark();
      this.speech.speakClue('भौं भौं! डॉगी वाला पियानो!');
    } else if (mode === 'duck') {
      this.sound.playDuckQuack();
      this.speech.speakClue('क्वाक क्वाक! बत्तख वाला पियानो!');
    } else {
      this.sound.playPianoNote('C4');
      this.speech.speakClue('रेनबो पियानो!');
    }
  }

  playKey(index: number, isDemoTrigger = false): void {
    const key = this.keys[index];
    this.lastPlayedIndex = index;

    if (this.bounceTimeout) clearTimeout(this.bounceTimeout);
    this.bounceTimeout = setTimeout(() => {
      this.lastPlayedIndex = null;
    }, 180);

    // Play based on sound mode
    if (this.soundMode === 'cat') {
      this.sound.playCatMeow();
    } else if (this.soundMode === 'dog') {
      this.sound.playDogBark();
    } else if (this.soundMode === 'duck') {
      this.sound.playDuckQuack();
    } else {
      // 🎹 Real Acoustic Grand Piano Sample!
      this.sound.playPianoNote(key.note);
    }

    // Check Guided Play Progress (only for manual child taps)
    if (!isDemoTrigger && this.activeSong && !this.isDemoPlaying) {
      const expectedIndex = this.activeSong.notes[this.songStep];
      if (index === expectedIndex) {
        this.songStep++;
        if (this.songStep >= this.activeSong.notes.length) {
          this.celebrateSong();
        }
      }
    }
  }

  selectSong(song: SongGuide): void {
    this.sound.playTap();
    this.stopDemoPlay();
    this.activeSong = song;
    this.songStep = 0;
    this.speech.speakHindi(`चलो ${song.hindiTitle} सीखते हैं! 'Demo सुनो' दबाओ या चमकती चाबी बजाओ!`);
  }

  startGuidedPlay(): void {
    this.sound.playTap();
    this.stopDemoPlay();
    if (this.activeSong) {
      this.songStep = 0;
      this.speech.speakHindi(`अब आपकी बारी! चमकती चाबी दबाओ!`);
    }
  }

  toggleDemoPlay(): void {
    this.sound.playTap();
    if (this.isDemoPlaying) {
      this.stopDemoPlay();
    } else {
      this.startDemoPlay();
    }
  }

  private startDemoPlay(): void {
    if (!this.activeSong) return;
    this.stopDemoPlay();
    this.isDemoPlaying = true;
    let step = 0;
    const notes = this.activeSong.notes;

    this.demoInterval = setInterval(() => {
      if (step >= notes.length) {
        this.stopDemoPlay();
        this.speech.speakHindi(`गाना पूरा हुआ! अब आप खुद बजाओ!`);
        this.startGuidedPlay();
        return;
      }

      const noteIdx = notes[step];
      this.demoActiveKeyIndex = noteIdx;
      this.playKey(noteIdx, true);
      step++;

      setTimeout(() => {
        this.demoActiveKeyIndex = null;
      }, 350);
    }, 550);
  }

  private stopDemoPlay(): void {
    this.isDemoPlaying = false;
    this.demoActiveKeyIndex = null;
    if (this.demoInterval) {
      clearInterval(this.demoInterval);
      this.demoInterval = null;
    }
  }

  stopSong(): void {
    this.sound.playTap();
    this.stopDemoPlay();
    this.activeSong = null;
    this.songStep = 0;
  }

  private celebrateSong(): void {
    this.sound.playFanfare();
    this.confetti.fire();
    this.speech.speakHindi('शाबाश! आपने पूरा गाना बहुत सुंदर बजाया! बहुत बढ़िया!');
    this.songStep = 0;
  }

  goBack(): void {
    this.sound.playTap();
    this.unlockOrientation();
    this.appNav.goToHub();
  }
}

import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppNavService } from '../../core/services/app-nav.service';
import { SoundService } from '../../core/services/sound.service';
import { SpeechService } from '../../core/services/speech.service';
import { ConfettiService } from '../../core/services/confetti.service';

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
    <div class="piano-viewport">
      <!-- 🌟 Header -->
      <header class="piano-header">
        <button 
          type="button" 
          (click)="goBack()" 
          class="nav-btn"
          id="btn-piano-back"
          title="Back to Hub">
          <span class="btn-icon">⬅️</span>
          <span class="btn-text">Hub</span>
        </button>

        <div class="title-container">
          <span class="title-emoji">{{ currentModeEmoji }}</span>
          <h2 class="title-text">Rainbow Piano</h2>
          <span class="title-hindi">जादुई पियानो</span>
        </div>

        <div class="header-actions">
          <button 
            type="button" 
            (click)="sound.toggleMute()" 
            class="sound-btn"
            [title]="sound.isMuted() ? 'Turn Sound On' : 'Turn Sound Off'">
            {{ sound.isMuted() ? '🔇' : '🎵' }}
          </button>
        </div>
      </header>

      <!-- 🐱 INSTRUMENT & ANIMAL SOUND SELECTOR -->
      <nav class="sound-mode-selector">
        <button 
          type="button" 
          class="mode-btn"
          [class.mode-active]="soundMode === 'piano'"
          (click)="setSoundMode('piano')">
          <span class="mode-icon">🎹</span>
          <span class="mode-label">Piano</span>
        </button>
        <button 
          type="button" 
          class="mode-btn"
          [class.mode-active]="soundMode === 'cat'"
          (click)="setSoundMode('cat')">
          <span class="mode-icon">🐱</span>
          <span class="mode-label">Meow</span>
        </button>
        <button 
          type="button" 
          class="mode-btn"
          [class.mode-active]="soundMode === 'dog'"
          (click)="setSoundMode('dog')">
          <span class="mode-icon">🐶</span>
          <span class="mode-label">Woof</span>
        </button>
        <button 
          type="button" 
          class="mode-btn"
          [class.mode-active]="soundMode === 'duck'"
          (click)="setSoundMode('duck')">
          <span class="mode-icon">🦆</span>
          <span class="mode-label">Quack</span>
        </button>
      </nav>

      <!-- 🎶 SONG TUTOR DOCK (Guided Nursery Rhymes) -->
      <div class="songs-bar">
        <div class="songs-pill-group">
          <span class="songs-heading">🎵 Songs:</span>
          @for (song of songs; track song.id) {
            <button 
              type="button" 
              class="song-pill"
              [class.song-active]="activeSong?.id === song.id"
              (click)="startSong(song)">
              <span>{{ song.emoji }} {{ song.title }}</span>
            </button>
          }
          @if (activeSong) {
            <button type="button" class="stop-song-pill" (click)="stopSong()">
              <span>✕ Free Play</span>
            </button>
          }
        </div>
      </div>

      <!-- 🎪 INTERACTIVE KEYBOARD STAGE -->
      <main class="keyboard-stage">
        <!-- Mascot Reaction Bubble -->
        <div class="mascot-stage" [class.mascot-bounce]="lastPlayedIndex !== null">
          <span class="mascot-face">{{ getMascotFace() }}</span>
          <div class="speech-cloud">
            @if (activeSong) {
              <span>Tap glowing key: <strong>{{ keys[activeSong.notes[songStep]].solfege }}</strong>!</span>
            } @else {
              <span>Tap keys to play cheerful tunes! 🎶</span>
            }
          </div>
        </div>

        <!-- 🌈 8 Giant Rainbow Piano Keys -->
        <div class="piano-keys-container">
          @for (k of keys; track k.note; let i = $index) {
            <button 
              type="button" 
              class="rainbow-key"
              [class.key-pressed]="lastPlayedIndex === i"
              [class.key-guide-glow]="activeSong && activeSong.notes[songStep] === i"
              [style.--key-color]="k.color"
              (pointerdown)="playKey(i)"
              (keydown.enter)="playKey(i)">
              
              <!-- Sparkle Star on Guide -->
              @if (activeSong && activeSong.notes[songStep] === i) {
                <span class="guide-star">⭐</span>
              }

              <!-- Top animal icon -->
              <span class="key-emoji">{{ getKeyEmoji(i) }}</span>

              <div class="key-bottom-info">
                <span class="solfege-text">{{ k.solfege }}</span>
                <span class="hindi-swar">{{ k.hindiSwar }}</span>
              </div>
            </button>
          }
        </div>
      </main>

      <!-- Bottom Hint Footer -->
      <footer class="piano-footer">
        <p class="footer-text">💡 Fun Tip: Switch to 🐱 Cat or 🐶 Dog mode to hear singing animal voices!</p>
      </footer>
    </div>
  `,
  styles: [`
    .piano-viewport {
      min-height: 100vh;
      min-height: 100dvh;
      width: 100%;
      background: radial-gradient(circle at 50% 15%, #2e1065 0%, #0f172a 65%, #020617 100%);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      user-select: none;
      overflow-x: hidden;
      touch-action: manipulation;
    }

    /* Top Nav */
    .piano-header {
      width: 100%;
      max-width: 960px;
      margin: 0 auto;
      padding: 10px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      z-index: 20;
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

    .title-container {
      display: flex;
      align-items: center;
      gap: 6px;
      text-align: center;
    }
    .title-emoji {
      font-size: 20px;
    }
    .title-text {
      font-family: var(--font-display);
      font-size: clamp(0.95rem, 3.2vw, 1.25rem);
      font-weight: 900;
      color: #ffffff;
      margin: 0;
      letter-spacing: -0.01em;
    }
    .title-hindi {
      font-size: 0.72rem;
      font-weight: 700;
      color: #fde047;
      background: rgba(253, 224, 71, 0.15);
      padding: 2px 7px;
      border-radius: 12px;
      border: 1px solid rgba(253, 224, 71, 0.35);
    }

    .header-actions {
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

    /* Sound Mode Selectors */
    .sound-mode-selector {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 6px 16px;
    }

    .mode-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 14px;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.08);
      border: 1.5px solid rgba(255, 255, 255, 0.18);
      color: #cbd5e1;
      font-size: 0.78rem;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .mode-btn:hover {
      background: rgba(255, 255, 255, 0.18);
      transform: translateY(-2px);
    }
    .mode-btn.mode-active {
      background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
      border-color: #f472b6;
      color: #ffffff;
      box-shadow: 0 4px 14px rgba(168, 85, 247, 0.5);
      transform: scale(1.08);
    }
    .mode-icon {
      font-size: 18px;
    }

    /* Songs Bar */
    .songs-bar {
      width: 100%;
      max-width: 860px;
      margin: 0 auto;
      padding: 4px 16px;
    }
    .songs-pill-group {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .songs-heading {
      color: #fde047;
      font-size: 0.76rem;
      font-weight: 800;
    }
    .song-pill {
      padding: 5px 12px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.18);
      color: #e2e8f0;
      font-size: 0.72rem;
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
      padding: 5px 10px;
      border-radius: 16px;
      background: rgba(239, 68, 68, 0.2);
      border: 1px solid rgba(239, 68, 68, 0.4);
      color: #fca5a5;
      font-size: 0.72rem;
      font-weight: 800;
      cursor: pointer;
    }

    /* Keyboard Stage */
    .keyboard-stage {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 10px 14px;
      max-width: 900px;
      width: 100%;
      margin: 0 auto;
      gap: 12px;
    }

    .mascot-stage {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(255, 255, 255, 0.07);
      border: 1px solid rgba(255, 255, 255, 0.15);
      padding: 6px 16px;
      border-radius: 24px;
      backdrop-filter: blur(10px);
      transition: transform 0.15s;
    }
    .mascot-bounce {
      transform: scale(1.06);
    }
    .mascot-face {
      font-size: 30px;
    }
    .speech-cloud {
      color: #ffffff;
      font-size: 0.84rem;
      font-weight: 700;
    }

    /* 🌈 Rainbow Keys */
    .piano-keys-container {
      width: 100%;
      height: 48vh;
      max-height: 400px;
      min-height: 250px;
      display: flex;
      gap: 8px;
      padding: 10px;
      background: rgba(15, 23, 42, 0.75);
      border: 3px solid rgba(255, 255, 255, 0.15);
      border-radius: 28px;
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5), inset 0 0 0 2px rgba(255, 255, 255, 0.1);
    }

    .rainbow-key {
      flex: 1;
      height: 100%;
      border-radius: 18px;
      background: var(--key-color);
      border: 3px solid rgba(255, 255, 255, 0.65);
      box-shadow: 0 8px 18px rgba(0, 0, 0, 0.35), inset 0 -6px 0 rgba(0, 0, 0, 0.25), inset 0 6px 0 rgba(255, 255, 255, 0.45);
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      padding: 14px 6px;
      position: relative;
      touch-action: none;
      transition: transform 0.08s, filter 0.1s, box-shadow 0.1s;
    }

    .rainbow-key:active, .rainbow-key.key-pressed {
      transform: translateY(10px) scale(0.96);
      filter: brightness(1.25);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4), inset 0 0 15px rgba(255, 255, 255, 0.8);
    }

    .rainbow-key.key-guide-glow {
      animation: keyPulse 1s infinite alternate;
      border-color: #ffffff;
      box-shadow: 0 0 25px #ffffff, 0 8px 18px rgba(0, 0, 0, 0.35);
    }

    .guide-star {
      position: absolute;
      top: -12px;
      font-size: 24px;
      animation: starBounce 0.6s infinite alternate;
      filter: drop-shadow(0 0 8px #facc15);
    }

    .key-emoji {
      font-size: clamp(20px, 3.5vw, 28px);
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
    }

    .key-bottom-info {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
    }

    .solfege-text {
      font-family: var(--font-display);
      font-size: clamp(0.85rem, 2.5vw, 1.15rem);
      font-weight: 900;
      color: #ffffff;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    }

    .hindi-swar {
      font-size: clamp(0.7rem, 2vw, 0.88rem);
      font-weight: 800;
      color: rgba(255, 255, 255, 0.9);
      background: rgba(0, 0, 0, 0.2);
      padding: 1px 6px;
      border-radius: 8px;
    }

    /* Footer */
    .piano-footer {
      text-align: center;
      padding: 10px 16px;
      color: #94a3b8;
      font-size: 0.72rem;
    }

    @keyframes keyPulse {
      0% { transform: scale(1); filter: brightness(1); }
      100% { transform: scale(1.05); filter: brightness(1.35); }
    }

    @keyframes starBounce {
      0% { transform: translateY(0); }
      100% { transform: translateY(-8px); }
    }
  `]
})
export class AnimalPianoComponent implements OnDestroy {
  readonly keys: PianoKey[] = [
    { note: 'C4', solfege: 'Do', hindiSwar: 'सा', freq: 261.63, color: '#ef4444', keyLabel: 'C' },
    { note: 'D4', solfege: 'Re', hindiSwar: 'रे', freq: 293.66, color: '#f97316', keyLabel: 'D' },
    { note: 'E4', solfege: 'Mi', hindiSwar: 'ग', freq: 329.63, color: '#facc15', keyLabel: 'E' },
    { note: 'F4', solfege: 'Fa', hindiSwar: 'म', freq: 349.23, color: '#22c55e', keyLabel: 'F' },
    { note: 'G4', solfege: 'So', hindiSwar: 'प', freq: 392.00, color: '#06b6d4', keyLabel: 'G' },
    { note: 'A4', solfege: 'La', hindiSwar: 'ध', freq: 440.00, color: '#3b82f6', keyLabel: 'A' },
    { note: 'B4', solfege: 'Ti', hindiSwar: 'नि', freq: 493.88, color: '#a855f7', keyLabel: 'B' },
    { note: 'C5', solfege: 'Do', hindiSwar: 'सां', freq: 523.25, color: '#ec4899', keyLabel: 'C2' }
  ];

  readonly songs: SongGuide[] = [
    {
      id: 'twinkle',
      title: 'Twinkle Star',
      hindiTitle: 'ट्विंकल ट्विंकल',
      emoji: '🌟',
      // C C G G A A G | F F E E D D C
      notes: [0, 0, 4, 4, 5, 5, 4, 3, 3, 2, 2, 1, 1, 0]
    },
    {
      id: 'macdonald',
      title: 'Old MacDonald',
      hindiTitle: 'ओल्ड मैकडोनाल्ड',
      emoji: '🚜',
      // G G G D E E D | B B A A G
      notes: [4, 4, 4, 1, 2, 2, 1, 6, 6, 5, 5, 4]
    },
    {
      id: 'birthday',
      title: 'Happy Birthday',
      hindiTitle: 'जन्मदिन गीत',
      emoji: '🎂',
      // C C D C F E | C C D C G F
      notes: [0, 0, 1, 0, 3, 2, 0, 0, 1, 0, 4, 3]
    }
  ];

  soundMode: 'piano' | 'cat' | 'dog' | 'duck' = 'piano';
  lastPlayedIndex: number | null = null;
  activeSong: SongGuide | null = null;
  songStep = 0;
  private bounceTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(
    public appNav: AppNavService,
    public sound: SoundService,
    private speech: SpeechService,
    private confetti: ConfettiService
  ) {}

  ngOnDestroy(): void {
    if (this.bounceTimeout) clearTimeout(this.bounceTimeout);
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
      this.speech.speakClue('रेनबो पियानो!');
    }
  }

  playKey(index: number): void {
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
      // Crisp musical bell/piano note
      this.sound.playMusicalNote(key.freq);
    }

    // Check Song Guide progress
    if (this.activeSong) {
      const expectedIndex = this.activeSong.notes[this.songStep];
      if (index === expectedIndex) {
        this.songStep++;
        if (this.songStep >= this.activeSong.notes.length) {
          // Song Complete Celebration!
          this.celebrateSong();
        }
      }
    }
  }

  startSong(song: SongGuide): void {
    this.sound.playTap();
    this.activeSong = song;
    this.songStep = 0;
    this.speech.speakHindi(`चलो ${song.hindiTitle} बजाते हैं! चमकती चाबी दबाओ!`);
  }

  stopSong(): void {
    this.sound.playTap();
    this.activeSong = null;
    this.songStep = 0;
  }

  private celebrateSong(): void {
    this.sound.playFanfare();
    this.confetti.fire();
    this.speech.speakHindi('शाबाश! आपने पूरा गाना बहुत सुंदर बजाया!');
    this.songStep = 0;
  }

  goBack(): void {
    this.sound.playTap();
    this.appNav.goToHub();
  }
}

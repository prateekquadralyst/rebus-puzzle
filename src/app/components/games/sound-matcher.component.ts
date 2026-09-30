import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppNavService } from '../../core/services/app-nav.service';
import { SoundService } from '../../core/services/sound.service';
import { SpeechService } from '../../core/services/speech.service';
import { ConfettiService } from '../../core/services/confetti.service';

export interface SoundItem {
  id: string;
  name: string;
  hindiName: string;
  category: any;
  emoji: string;
  soundText: string;
  voiceText: string;
  color: string;
  bgGrad: string;
}

export interface SoundQuiz {
  correctItem: SoundItem;
  options: SoundItem[];
}

@Component({
  selector: 'app-sound-matcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="game-viewport">
      <!-- Top Header -->
      <header class="game-header">
        <button 
          type="button" 
          (click)="appNav.goToHub()" 
          class="hub-return-btn"
          title="Return to Toddler Hub">
          <span>🏰 Hub</span>
        </button>

        <div class="mode-switcher">
          <button 
            type="button"
            class="mode-toggle-btn"
            [class.active]="activeMode() === 'quiz'"
            (click)="setMode('quiz')">
            <span>🎯 Guess Sound</span>
          </button>
          <button 
            type="button"
            class="mode-toggle-btn"
            [class.active]="activeMode() === 'explore'"
            (click)="setMode('explore')">
            <span>🎹 Soundboard</span>
          </button>
        </div>

        <button 
          type="button" 
          (click)="sound.toggleMute()" 
          class="mute-circle-btn"
          [title]="sound.isMuted() ? 'Turn Sound On' : 'Turn Sound Off'">
          {{ sound.isMuted() ? '🔇' : '🎵' }}
        </button>
      </header>

      <!-- Mascot Cheerleader & Banner -->
      <div class="mascot-banner animate-pop" (click)="onMascotTap()">
        <div class="mascot-avatar" [class.mascot-bouncing]="isMascotJumping()">
          <span>🧸</span>
        </div>
        <div class="mascot-speech">
          @if (activeMode() === 'quiz') {
            <span>Listen closely! Who makes this sound? 👂</span>
          } @else {
            <span>Tap any animal or vehicle to hear its real sound! 🔊</span>
          }
        </div>
      </div>

      <!-- ==============================================
           MODE 1: GUESS THE SOUND QUIZ
           ============================================== -->
      @if (activeMode() === 'quiz') {
        <main class="matcher-stage">
          <div class="score-stars-bar">
            <span class="score-tag">Score: {{ score() }} ⭐</span>
            <button 
              type="button" 
              class="next-quiz-btn"
              [class.btn-glow-pulse]="selectedCorrect() !== null"
              (click)="nextQuizQuestion()"
              title="Next sound question">
              <span>{{ selectedCorrect() !== null ? 'Next 🌟 ➡️' : 'Next Sound ⏭️' }}</span>
            </button>
          </div>

          <!-- Giant Interactive Speaker Card -->
          <button 
            type="button" 
            (click)="replayQuizSound()" 
            class="speaker-giant-btn animate-float"
            [class.is-playing]="isPlayingAudio()"
            title="Tap to listen again!">
            
            <div class="sound-wave-glow" [class.radiating]="isPlayingAudio()"></div>
            
            <div class="speaker-inner">
              <span class="speaker-emoji">{{ isPlayingAudio() ? '🔊' : '📢' }}</span>
              <span class="sound-phrase">"{{ currentQuiz()?.correctItem?.soundText }}"</span>
              <span class="sound-tip">Tap to Listen Again 🔁</span>
            </div>

            <!-- Visual Equalizer Bars -->
            <div class="eq-bars-container" [class.eq-active]="isPlayingAudio()">
              <div class="eq-bar bar-1"></div>
              <div class="eq-bar bar-2"></div>
              <div class="eq-bar bar-3"></div>
              <div class="eq-bar bar-4"></div>
              <div class="eq-bar bar-5"></div>
            </div>
          </button>

          <!-- 3 Jumbo Option Cards -->
          <div class="options-rack">
            @for (opt of currentQuiz()?.options; track opt.id) {
              <button 
                type="button" 
                (click)="onSelectOption(opt)" 
                class="option-card"
                [class.card-winner]="selectedCorrect() === opt.id"
                [class.card-wobble]="selectedWrong() === opt.id"
                [style.--card-glow]="opt.color">
                
                <span class="option-emoji">{{ opt.emoji }}</span>
                <span class="option-name">{{ opt.name }}</span>
                <span class="option-hindi">{{ opt.hindiName }}</span>
              </button>
            }
          </div>
        </main>
      }

      <!-- ==============================================
           MODE 2: INTERACTIVE SOUNDBOARD (EXPLORE ALL)
           ============================================== -->
      @if (activeMode() === 'explore') {
        <main class="explore-stage">
          <!-- Category Filters -->
          <div class="filter-pills">
            @for (cat of categories; track cat.key) {
              <button 
                type="button" 
                class="filter-pill"
                [class.active]="activeCategory() === cat.key"
                (click)="setCategory(cat.key)">
                <span>{{ cat.label }}</span>
              </button>
            }
          </div>

          <!-- Soundboard Cards Grid -->
          <div class="soundboard-grid">
            @for (item of filteredLibrary(); track item.id) {
              <button 
                type="button"
                (click)="playItemDirectly(item)"
                class="sound-tile"
                [class.tile-playing]="activePlayingId() === item.id"
                [style.--tile-color]="item.color"
                [style.background]="item.bgGrad">
                
                <span class="tile-emoji">{{ item.emoji }}</span>
                <div class="tile-text-col">
                  <span class="tile-name">{{ item.name }}</span>
                  <span class="tile-sound-label">{{ item.soundText }}</span>
                </div>
                <span class="tile-speaker-icon">🔊</span>
              </button>
            }
          </div>
        </main>
      }

      <footer class="game-footer">
        <p>💡 Tip: Tap any card to hear realistic animal barks, roars, and vehicle horns!</p>
      </footer>
    </div>
  `,
  styles: [`
    .game-viewport {
      min-height: 100vh;
      min-height: 100dvh;
      width: 100%;
      background: var(--app-viewport-bg, radial-gradient(circle at 50% 12%, #064e3b 0%, #0f172a 70%, #020617 100%));
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

    .mode-switcher {
      display: flex;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: 20px;
      padding: 3px;
      gap: 4px;
    }

    .mode-toggle-btn {
      padding: 6px 14px;
      border-radius: 16px;
      border: none;
      background: transparent;
      color: #94a3b8;
      font-size: 0.76rem;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.2s;
    }
    .mode-toggle-btn.active {
      background: #10b981;
      color: #ffffff;
      box-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
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
    .mute-circle-btn:hover {
      background: rgba(255, 255, 255, 0.18);
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

    /* ==================== QUIZ STAGE ==================== */
    .matcher-stage {
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

    .score-stars-bar {
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 14px;
      flex-wrap: wrap;
    }
    .score-tag {
      font-size: 0.85rem;
      font-weight: 900;
      color: #facc15;
      text-shadow: 0 0 10px rgba(250, 204, 21, 0.5);
    }
    .next-quiz-btn {
      padding: 6px 16px;
      border-radius: 18px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border: 1.5px solid #6ee7b7;
      color: #ffffff;
      font-size: 0.78rem;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
    }
    .next-quiz-btn:hover {
      transform: scale(1.06);
      background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
    }
    .btn-glow-pulse {
      animation: soundNextPulse 0.9s infinite alternate;
      border-color: #fde047 !important;
      box-shadow: 0 0 18px rgba(253, 224, 71, 0.85) !important;
    }
    @keyframes soundNextPulse {
      0% { transform: scale(1); }
      100% { transform: scale(1.08); }
    }

    /* Giant Sound Speaker */
    .speaker-giant-btn {
      width: clamp(190px, 48vw, 250px);
      padding: 24px 20px;
      border-radius: 36px;
      border: 3.5px solid #34d399;
      background: linear-gradient(135deg, #059669 0%, #065f46 100%);
      box-shadow: 
        0 16px 40px rgba(5, 150, 105, 0.5), 
        inset 0 2px 6px rgba(255, 255, 255, 0.4);
      cursor: pointer;
      outline: none;
      margin-bottom: 22px;
      position: relative;
      transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .speaker-giant-btn:hover {
      transform: scale(1.06);
    }
    .speaker-giant-btn:active {
      transform: scale(0.96);
    }
    .speaker-giant-btn.is-playing {
      border-color: #facc15;
      box-shadow: 
        0 0 35px rgba(250, 204, 21, 0.8),
        inset 0 0 15px rgba(255, 255, 255, 0.5);
    }

    .sound-wave-glow {
      position: absolute;
      inset: -12px;
      border-radius: 46px;
      border: 3px solid #34d399;
      opacity: 0;
      pointer-events: none;
    }
    .sound-wave-glow.radiating {
      animation: soundWaveRadiate 1s ease-out infinite;
    }
    @keyframes soundWaveRadiate {
      0% { transform: scale(0.95); opacity: 0.9; }
      100% { transform: scale(1.25); opacity: 0; }
    }

    .speaker-inner {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
    }
    .speaker-emoji {
      font-size: clamp(3rem, 9vw, 4.2rem);
      filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
    }
    .sound-phrase {
      font-family: var(--font-display, sans-serif);
      font-size: clamp(1.2rem, 3.8vw, 1.6rem);
      font-weight: 900;
      color: #ffffff;
      text-shadow: 0 2px 5px rgba(0, 0, 0, 0.5);
    }
    .sound-tip {
      font-size: 0.68rem;
      font-weight: 800;
      color: #a7f3d0;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* Equalizer Bars */
    .eq-bars-container {
      display: flex;
      align-items: flex-end;
      justify-content: center;
      gap: 4px;
      height: 16px;
      margin-top: 10px;
    }
    .eq-bar {
      width: 4px;
      height: 4px;
      background: #facc15;
      border-radius: 3px;
      transition: height 0.1s;
    }
    .eq-active .bar-1 { animation: eqJump 0.4s ease-in-out infinite alternate; }
    .eq-active .bar-2 { animation: eqJump 0.3s ease-in-out infinite alternate 0.1s; }
    .eq-active .bar-3 { animation: eqJump 0.5s ease-in-out infinite alternate 0.2s; }
    .eq-active .bar-4 { animation: eqJump 0.35s ease-in-out infinite alternate 0.15s; }
    .eq-active .bar-5 { animation: eqJump 0.45s ease-in-out infinite alternate 0.05s; }

    @keyframes eqJump {
      0% { height: 4px; }
      100% { height: 16px; }
    }

    /* Options Cards Rack */
    .options-rack {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: clamp(12px, 3vw, 20px);
      width: 100%;
    }

    .option-card {
      width: clamp(96px, 26vw, 130px);
      height: clamp(116px, 30vw, 146px);
      border-radius: 26px;
      border: 2.5px solid rgba(255, 255, 255, 0.2);
      background: rgba(255, 255, 255, 0.08);
      box-shadow: 0 10px 24px rgba(0, 0, 0, 0.4);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      cursor: pointer;
      outline: none;
      backdrop-filter: blur(14px);
      transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .option-card:hover {
      transform: translateY(-6px) scale(1.06);
      border-color: #34d399;
      background: rgba(16, 185, 129, 0.2);
    }

    .card-winner {
      border-color: #34d399 !important;
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.5), rgba(5, 150, 105, 0.6)) !important;
      box-shadow: 0 0 35px rgba(52, 211, 153, 0.8) !important;
      animation: winnerJump 0.5s ease;
    }
    @keyframes winnerJump {
      0%, 100% { transform: translateY(0) scale(1); }
      40% { transform: translateY(-18px) scale(1.15); }
      60% { transform: translateY(-6px) scale(1.08); }
    }

    .card-wobble {
      animation: cardWobble 0.4s ease-in-out;
    }
    @keyframes cardWobble {
      0%, 100% { transform: translateX(0); }
      20% { transform: translateX(-8px) rotate(-4deg); }
      40% { transform: translateX(8px) rotate(4deg); }
      60% { transform: translateX(-5px) rotate(-2deg); }
      80% { transform: translateX(5px) rotate(2deg); }
    }

    .option-emoji {
      font-size: clamp(2.8rem, 8vw, 3.8rem);
      filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.45));
    }
    .option-name {
      font-size: clamp(0.76rem, 2.2vw, 0.9rem);
      font-weight: 900;
      color: #ffffff;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .option-hindi {
      font-size: 0.65rem;
      font-weight: 800;
      color: #cbd5e1;
    }

    /* ==================== EXPLORE SOUNDBOARD STAGE ==================== */
    .explore-stage {
      flex: 1;
      max-width: 900px;
      width: 100%;
      margin: 0 auto;
      padding: 6px 16px 18px 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .filter-pills {
      display: flex;
      gap: 8px;
      margin-bottom: 14px;
      flex-wrap: wrap;
      justify-content: center;
    }
    .filter-pill {
      padding: 6px 16px;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.16);
      color: #cbd5e1;
      font-size: 0.78rem;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.2s;
    }
    .filter-pill.active {
      background: #10b981;
      color: white;
      border-color: #34d399;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
    }

    .soundboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
      gap: 12px;
      width: 100%;
      max-height: 58vh;
      overflow-y: auto;
      padding: 4px;
    }

    .sound-tile {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: 20px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      cursor: pointer;
      text-align: left;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35);
      transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .sound-tile:hover {
      transform: translateY(-4px) scale(1.04);
      border-color: #ffffff;
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.5);
    }
    .sound-tile:active {
      transform: scale(0.95);
    }
    .sound-tile.tile-playing {
      border-color: #facc15 !important;
      box-shadow: 0 0 25px rgba(250, 204, 21, 0.8) !important;
      animation: tilePulse 0.4s ease infinite alternate;
    }
    @keyframes tilePulse {
      0% { transform: scale(1); }
      100% { transform: scale(1.08); }
    }

    .tile-emoji {
      font-size: 2rem;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4));
    }
    .tile-text-col {
      flex: 1;
      display: flex;
      flex-direction: column;
      line-height: 1.2;
    }
    .tile-name {
      font-size: 0.82rem;
      font-weight: 900;
      color: #ffffff;
    }
    .tile-sound-label {
      font-size: 0.65rem;
      font-weight: 800;
      color: #fef08a;
    }
    .tile-speaker-icon {
      font-size: 1rem;
      opacity: 0.8;
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
export class SoundMatcherComponent implements OnInit, OnDestroy {
  readonly activeMode = signal<'quiz' | 'explore'>('quiz');
  readonly activeCategory = signal<string>('all');
  readonly score = signal<number>(0);
  readonly currentQuiz = signal<SoundQuiz | null>(null);
  readonly isPlayingAudio = signal<boolean>(false);
  readonly selectedCorrect = signal<string | null>(null);
  readonly selectedWrong = signal<string | null>(null);
  readonly activePlayingId = signal<string | null>(null);
  readonly isMascotJumping = signal<boolean>(false);

  readonly categories = [
    { key: 'all', label: '🌟 All Sounds' },
    { key: 'animal', label: '🐾 Animals' },
    { key: 'bird', label: '🐦 Birds' },
    { key: 'insect', label: '🐝 Insects' },
    { key: 'sea', label: '🐠 Sea Creatures' },
    { key: 'vehicle', label: '🚗 Vehicles' },
    { key: 'nature', label: '🌧️ Nature' },
    { key: 'instrument', label: '🎵 Music' },
    { key: 'household', label: '🏠 Household' },
    { key: 'kitchen', label: '🍳 Kitchen' },
    { key: 'human', label: '👏 Human' },
    { key: 'fun', label: '🎉 Fun' }
  ];

  // Complete Library of Animals & Vehicles with Real Sounds
readonly soundLibrary: SoundItem[] = [
  // 🐾 Animals
  { id: 'dog', name: 'Dog', hindiName: 'Kutta', category: 'animal', emoji: '🐶', soundText: 'Woof! Woof!', voiceText: 'Dog says Woof Woof!', color: '#f59e0b', bgGrad: 'linear-gradient(135deg, #f59e0b, #d97706)' },
  { id: 'cat', name: 'Cat', hindiName: 'Billi', category: 'animal', emoji: '🐱', soundText: 'Meow! Meow!', voiceText: 'Cat says Meow Meow!', color: '#38bdf8', bgGrad: 'linear-gradient(135deg, #38bdf8, #0284c7)' },
  { id: 'cow', name: 'Cow', hindiName: 'Gaay', category: 'animal', emoji: '🐮', soundText: 'Moooo! Moooo!', voiceText: 'Cow says Moooo!', color: '#10b981', bgGrad: 'linear-gradient(135deg, #10b981, #047857)' },
  { id: 'lion', name: 'Lion', hindiName: 'Sher', category: 'animal', emoji: '🦁', soundText: 'Roaaar! Roaaar!', voiceText: 'Lion says Roaaar!', color: '#f97316', bgGrad: 'linear-gradient(135deg, #f97316, #c2410c)' },
  { id: 'duck', name: 'Duck', hindiName: 'Batakh', category: 'animal', emoji: '🦆', soundText: 'Quack! Quack!', voiceText: 'Duck says Quack Quack!', color: '#eab308', bgGrad: 'linear-gradient(135deg, #eab308, #a16207)' },
  { id: 'frog', name: 'Frog', hindiName: 'Mendhak', category: 'animal', emoji: '🐸', soundText: 'Ribbit! Ribbit!', voiceText: 'Frog says Ribbit Ribbit!', color: '#84cc16', bgGrad: 'linear-gradient(135deg, #84cc16, #4d7c0f)' },
  { id: 'bird', name: 'Bird', hindiName: 'Chidiya', category: 'animal', emoji: '🐦', soundText: 'Chirp! Chirp!', voiceText: 'Bird says Chirp Chirp!', color: '#0ea5e9', bgGrad: 'linear-gradient(135deg, #0ea5e9, #0369a1)' },
  { id: 'elephant', name: 'Elephant', hindiName: 'Haathi', category: 'animal', emoji: '🐘', soundText: 'Paaaawooo!', voiceText: 'Elephant trumpets Paaaawooo!', color: '#64748b', bgGrad: 'linear-gradient(135deg, #64748b, #334155)' },
  { id: 'horse', name: 'Horse', hindiName: 'Ghoda', category: 'animal', emoji: '🐴', soundText: 'Neigh! Neigh!', voiceText: 'Horse says Neigh Neigh!', color: '#92400e', bgGrad: 'linear-gradient(135deg, #92400e, #78350f)' },
  { id: 'pig', name: 'Pig', hindiName: 'Suar', category: 'animal', emoji: '🐷', soundText: 'Oink! Oink!', voiceText: 'Pig says Oink Oink!', color: '#f472b6', bgGrad: 'linear-gradient(135deg, #f472b6, #db2777)' },
  { id: 'sheep', name: 'Sheep', hindiName: 'Bhed', category: 'animal', emoji: '🐑', soundText: 'Baaa! Baaa!', voiceText: 'Sheep says Baaa Baaa!', color: '#94a3b8', bgGrad: 'linear-gradient(135deg, #94a3b8, #64748b)' },
  { id: 'goat', name: 'Goat', hindiName: 'Bakri', category: 'animal', emoji: '🐐', soundText: 'Maa! Maa!', voiceText: 'Goat says Maa Maa!', color: '#a16207', bgGrad: 'linear-gradient(135deg, #a16207, #713f12)' },
  { id: 'monkey', name: 'Monkey', hindiName: 'Bandar', category: 'animal', emoji: '🐵', soundText: 'Oo-oo! Aa-aa!', voiceText: 'Monkey makes Oo-oo Aa-aa sounds!', color: '#a855f7', bgGrad: 'linear-gradient(135deg, #a855f7, #7e22ce)' },
  { id: 'tiger', name: 'Tiger', hindiName: 'Baagh', category: 'animal', emoji: '🐯', soundText: 'Grrr! Roar!', voiceText: 'Tiger growls Grrr and Roars!', color: '#f97316', bgGrad: 'linear-gradient(135deg, #f97316, #ea580c)' },
  { id: 'bear', name: 'Bear', hindiName: 'Bhalu', category: 'animal', emoji: '🐻', soundText: 'Grrr! Growl!', voiceText: 'Bear growls Grrr!', color: '#92400e', bgGrad: 'linear-gradient(135deg, #92400e, #78350f)' },
  { id: 'panda', name: 'Panda', hindiName: 'Panda', category: 'animal', emoji: '🐼', soundText: 'Growl! Grunt!', voiceText: 'Panda makes a soft Growl!', color: '#475569', bgGrad: 'linear-gradient(135deg, #475569, #1e293b)' },
  { id: 'fox', name: 'Fox', hindiName: 'Lomdi', category: 'animal', emoji: '🦊', soundText: 'Yip! Yow! Bark!', voiceText: 'Fox says Yip Yow and sometimes Barks!', color: '#fb923c', bgGrad: 'linear-gradient(135deg, #fb923c, #ea580c)' },
  { id: 'wolf', name: 'Wolf', hindiName: 'Bhediya', category: 'animal', emoji: '🐺', soundText: 'Awooooo! Awooooo!', voiceText: 'Wolf howls Awooooo!', color: '#64748b', bgGrad: 'linear-gradient(135deg, #64748b, #334155)' },
  { id: 'snake', name: 'Snake', hindiName: 'Saanp', category: 'animal', emoji: '🐍', soundText: 'Sssss! Sssss!', voiceText: 'Snake hisses Sssss!', color: '#22c55e', bgGrad: 'linear-gradient(135deg, #22c55e, #15803d)' },
  { id: 'mouse', name: 'Mouse', hindiName: 'Chuha', category: 'animal', emoji: '🐭', soundText: 'Squeak! Squeak!', voiceText: 'Mouse says Squeak Squeak!', color: '#94a3b8', bgGrad: 'linear-gradient(135deg, #94a3b8, #64748b)' },
  { id: 'rabbit', name: 'Rabbit', hindiName: 'Khargosh', category: 'animal', emoji: '🐰', soundText: 'Squeak! Sniff! Sniff!', voiceText: 'Rabbit makes soft Squeak sounds!', color: '#ec4899', bgGrad: 'linear-gradient(135deg, #ec4899, #be185d)' },
  { id: 'deer', name: 'Deer', hindiName: 'Hiran', category: 'animal', emoji: '🦌', soundText: 'Bark! Snort!', voiceText: 'Deer makes a soft Barking sound!', color: '#a16207', bgGrad: 'linear-gradient(135deg, #a16207, #713f12)' },
  { id: 'donkey', name: 'Donkey', hindiName: 'Gadha', category: 'animal', emoji: '🫏', soundText: 'Hee-Haw! Hee-Haw!', voiceText: 'Donkey says Hee Haw!', color: '#78716c', bgGrad: 'linear-gradient(135deg, #78716c, #44403c)' },
  { id: 'camel', name: 'Camel', hindiName: 'Oont', category: 'animal', emoji: '🐪', soundText: 'Grunt! Groan!', voiceText: 'Camel makes a Grunting sound!', color: '#d97706', bgGrad: 'linear-gradient(135deg, #d97706, #92400e)' },

  // 🐦 Birds
  { id: 'parrot', name: 'Parrot', hindiName: 'Tota', category: 'bird', emoji: '🦜', soundText: 'Squawk! Hello!', voiceText: 'Parrot says Squawk and Hello!', color: '#22c55e', bgGrad: 'linear-gradient(135deg, #22c55e, #15803d)' },
  { id: 'owl', name: 'Owl', hindiName: 'Ullu', category: 'bird', emoji: '🦉', soundText: 'Hoo! Hoo!', voiceText: 'Owl says Hoo Hoo!', color: '#a16207', bgGrad: 'linear-gradient(135deg, #a16207, #713f12)' },
  { id: 'eagle', name: 'Eagle', hindiName: 'Baaz', category: 'bird', emoji: '🦅', soundText: 'Screeech! Screeech!', voiceText: 'Eagle makes a loud Screech!', color: '#78716c', bgGrad: 'linear-gradient(135deg, #78716c, #44403c)' },
  { id: 'chicken', name: 'Chicken', hindiName: 'Murgi', category: 'bird', emoji: '🐔', soundText: 'Cluck! Cluck!', voiceText: 'Chicken says Cluck Cluck!', color: '#facc15', bgGrad: 'linear-gradient(135deg, #facc15, #ca8a04)' },
  { id: 'rooster', name: 'Rooster', hindiName: 'Murga', category: 'bird', emoji: '🐓', soundText: 'Cock-a-doodle-doo!', voiceText: 'Rooster says Cock-a-doodle-doo!', color: '#ef4444', bgGrad: 'linear-gradient(135deg, #ef4444, #b91c1c)' },
  { id: 'turkey', name: 'Turkey', hindiName: 'Turkey', category: 'bird', emoji: '🦃', soundText: 'Gobble! Gobble!', voiceText: 'Turkey says Gobble Gobble!', color: '#b45309', bgGrad: 'linear-gradient(135deg, #b45309, #78350f)' },
  { id: 'crow', name: 'Crow', hindiName: 'Kauwa', category: 'bird', emoji: '🐦‍⬛', soundText: 'Caw! Caw!', voiceText: 'Crow says Caw Caw!', color: '#334155', bgGrad: 'linear-gradient(135deg, #334155, #0f172a)' },
  { id: 'penguin', name: 'Penguin', hindiName: 'Penguin', category: 'bird', emoji: '🐧', soundText: 'Honk! Squawk!', voiceText: 'Penguin makes Honk and Squawk sounds!', color: '#475569', bgGrad: 'linear-gradient(135deg, #475569, #1e293b)' },

  // 🐝 Insects
  { id: 'bee', name: 'Bee', hindiName: 'Madhumakhi', category: 'insect', emoji: '🐝', soundText: 'Bzzz! Bzzz!', voiceText: 'Bee goes Bzzz Bzzz!', color: '#eab308', bgGrad: 'linear-gradient(135deg, #eab308, #a16207)' },
  { id: 'fly', name: 'Fly', hindiName: 'Makkhi', category: 'insect', emoji: '🪰', soundText: 'Bzzzz! Bzzzz!', voiceText: 'Fly makes a buzzing Bzzzz sound!', color: '#64748b', bgGrad: 'linear-gradient(135deg, #64748b, #334155)' },
  { id: 'mosquito', name: 'Mosquito', hindiName: 'Machhar', category: 'insect', emoji: '🦟', soundText: 'Bzzzzzz!', voiceText: 'Mosquito makes a high Bzzzz sound!', color: '#84cc16', bgGrad: 'linear-gradient(135deg, #84cc16, #4d7c0f)' },
  { id: 'cricket', name: 'Cricket', hindiName: 'Jhingur', category: 'insect', emoji: '🦗', soundText: 'Chirp! Chirp! Chirp!', voiceText: 'Cricket chirps at night!', color: '#16a34a', bgGrad: 'linear-gradient(135deg, #16a34a, #166534)' },
  { id: 'butterfly', name: 'Butterfly', hindiName: 'Titli', category: 'insect', emoji: '🦋', soundText: 'Flutter! Flutter!', voiceText: 'Butterfly wings make a soft Flutter sound!', color: '#8b5cf6', bgGrad: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' },

  // 🐠 Sea Animals
  { id: 'fish', name: 'Fish', hindiName: 'Machhli', category: 'sea', emoji: '🐟', soundText: 'Blub! Blub!', voiceText: 'Fish goes Blub Blub!', color: '#06b6d4', bgGrad: 'linear-gradient(135deg, #06b6d4, #0e7490)' },
  { id: 'dolphin', name: 'Dolphin', hindiName: 'Dolphin', category: 'sea', emoji: '🐬', soundText: 'Click! Click! Eee!', voiceText: 'Dolphin makes Click and Eee sounds!', color: '#3b82f6', bgGrad: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' },
  { id: 'whale', name: 'Whale', hindiName: 'Whale', category: 'sea', emoji: '🐳', soundText: 'Whooo! Whooo!', voiceText: 'Whale makes deep Whooo sounds!', color: '#2563eb', bgGrad: 'linear-gradient(135deg, #2563eb, #1e40af)' },
  { id: 'seal', name: 'Seal', hindiName: 'Seal', category: 'sea', emoji: '🦭', soundText: 'Arf! Arf! Bark!', voiceText: 'Seal barks Arf Arf!', color: '#64748b', bgGrad: 'linear-gradient(135deg, #64748b, #334155)' },
  { id: 'octopus', name: 'Octopus', hindiName: 'Octopus', category: 'sea', emoji: '🐙', soundText: 'Blub! Blub!', voiceText: 'Octopus makes soft underwater sounds!', color: '#e11d48', bgGrad: 'linear-gradient(135deg, #e11d48, #9f1239)' },

  // 🚗 Vehicles
  { id: 'car', name: 'Car', hindiName: 'Gaadi', category: 'vehicle', emoji: '🚗', soundText: 'Beep Beep! Vroom!', voiceText: 'Car goes Beep Beep!', color: '#ef4444', bgGrad: 'linear-gradient(135deg, #ef4444, #b91c1c)' },
  { id: 'train', name: 'Train', hindiName: 'Railgaadi', category: 'vehicle', emoji: '🚂', soundText: 'Choo Choo! Chug Chug!', voiceText: 'Train goes Choo Choo!', color: '#8b5cf6', bgGrad: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' },
  { id: 'police', name: 'Police Car', hindiName: 'Police Gaadi', category: 'vehicle', emoji: '🚓', soundText: 'Wee-Woo! Wee-Woo!', voiceText: 'Police car siren Wee-Woo!', color: '#3b82f6', bgGrad: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' },
  { id: 'ambulance', name: 'Ambulance', hindiName: 'Ambulance', category: 'vehicle', emoji: '🚑', soundText: 'Nee-Naw! Nee-Naw!', voiceText: 'Ambulance siren Nee-Naw!', color: '#ef4444', bgGrad: 'linear-gradient(135deg, #ef4444, #b91c1c)' },
  { id: 'firetruck', name: 'Fire Truck', hindiName: 'Fire Brigade', category: 'vehicle', emoji: '🚒', soundText: 'Wee-Woo! Wee-Woo!', voiceText: 'Fire truck siren Wee-Woo!', color: '#dc2626', bgGrad: 'linear-gradient(135deg, #dc2626, #991b1b)' },
  { id: 'bus', name: 'Bus', hindiName: 'Bus', category: 'vehicle', emoji: '🚌', soundText: 'Honk! Honk!', voiceText: 'Bus goes Honk Honk!', color: '#eab308', bgGrad: 'linear-gradient(135deg, #eab308, #a16207)' },
  { id: 'truck', name: 'Truck', hindiName: 'Truck', category: 'vehicle', emoji: '🚚', soundText: 'Honk! Vroom!', voiceText: 'Truck goes Honk Vroom!', color: '#f97316', bgGrad: 'linear-gradient(135deg, #f97316, #c2410c)' },
  { id: 'bicycle', name: 'Bicycle', hindiName: 'Cycle', category: 'vehicle', emoji: '🚲', soundText: 'Tring Tring!', voiceText: 'Bicycle bell Tring Tring!', color: '#22c55e', bgGrad: 'linear-gradient(135deg, #22c55e, #15803d)' },
  { id: 'motorcycle', name: 'Motorcycle', hindiName: 'Bike', category: 'vehicle', emoji: '🏍️', soundText: 'Vroom! Vroom!', voiceText: 'Motorcycle goes Vroom Vroom!', color: '#475569', bgGrad: 'linear-gradient(135deg, #475569, #1e293b)' },
  { id: 'helicopter', name: 'Helicopter', hindiName: 'Helicopter', category: 'vehicle', emoji: '🚁', soundText: 'Chop Chop Chop!', voiceText: 'Helicopter blades Chop Chop Chop!', color: '#f59e0b', bgGrad: 'linear-gradient(135deg, #f59e0b, #d97706)' },
  { id: 'airplane', name: 'Airplane', hindiName: 'Hawai Jahaz', category: 'vehicle', emoji: '✈️', soundText: 'Whoooosh! Whoooosh!', voiceText: 'Airplane goes Whoooosh!', color: '#0ea5e9', bgGrad: 'linear-gradient(135deg, #0ea5e9, #0369a1)' },
  { id: 'rocket', name: 'Rocket', hindiName: 'Rocket', category: 'vehicle', emoji: '🚀', soundText: '3 2 1... BLASTOFF!', voiceText: 'Rocket blasting off into space!', color: '#ec4899', bgGrad: 'linear-gradient(135deg, #ec4899, #be185d)' },
  { id: 'boat', name: 'Boat', hindiName: 'Naav', category: 'vehicle', emoji: '🚤', soundText: 'Put Put! Splash!', voiceText: 'Boat engine goes Put Put!', color: '#0284c7', bgGrad: 'linear-gradient(135deg, #0284c7, #075985)' },

  // 🌧️ Nature & Weather
  { id: 'rain', name: 'Rain', hindiName: 'Baarish', category: 'nature', emoji: '🌧️', soundText: 'Drip! Drop! Pitter-Patter!', voiceText: 'Rain makes a soft Drip Drop sound!', color: '#38bdf8', bgGrad: 'linear-gradient(135deg, #38bdf8, #0284c7)' },
  { id: 'thunder', name: 'Thunder', hindiName: 'Garaj', category: 'nature', emoji: '⛈️', soundText: 'BOOOOM! Rumble!', voiceText: 'Thunder goes BOOM and Rumble!', color: '#6366f1', bgGrad: 'linear-gradient(135deg, #6366f1, #4338ca)' },
  { id: 'wind', name: 'Wind', hindiName: 'Hawa', category: 'nature', emoji: '💨', soundText: 'Whooosh! Whooosh!', voiceText: 'Wind goes Whooosh!', color: '#06b6d4', bgGrad: 'linear-gradient(135deg, #06b6d4, #0e7490)' },
  { id: 'ocean', name: 'Ocean Waves', hindiName: 'Samundar Ki Lehrein', category: 'nature', emoji: '🌊', soundText: 'Whoosh! Splash! Whoosh!', voiceText: 'Ocean waves go Whoosh and Splash!', color: '#2563eb', bgGrad: 'linear-gradient(135deg, #2563eb, #1e40af)' },
  { id: 'fire', name: 'Fire', hindiName: 'Aag', category: 'nature', emoji: '🔥', soundText: 'Crackle! Crackle! Pop!', voiceText: 'Fire makes a Crackle and Pop sound!', color: '#f97316', bgGrad: 'linear-gradient(135deg, #f97316, #c2410c)' },

  // 🎵 Musical Instruments
  { id: 'drum', name: 'Drum', hindiName: 'Dhol', category: 'instrument', emoji: '🥁', soundText: 'Boom! Boom! Tap-Tap!', voiceText: 'Drum goes Boom Boom!', color: '#ef4444', bgGrad: 'linear-gradient(135deg, #ef4444, #b91c1c)' },
  { id: 'guitar', name: 'Guitar', hindiName: 'Guitar', category: 'instrument', emoji: '🎸', soundText: 'Strum! Strum! Pling!', voiceText: 'Guitar strings go Strum Strum!', color: '#a16207', bgGrad: 'linear-gradient(135deg, #a16207, #713f12)' },
  { id: 'piano', name: 'Piano', hindiName: 'Piano', category: 'instrument', emoji: '🎹', soundText: 'Plink! Plonk! Ding!', voiceText: 'Piano keys go Plink Plonk!', color: '#475569', bgGrad: 'linear-gradient(135deg, #475569, #1e293b)' },
  { id: 'trumpet', name: 'Trumpet', hindiName: 'Trumpet', category: 'instrument', emoji: '🎺', soundText: 'Toot! Toot! Ta-da!', voiceText: 'Trumpet goes Toot Toot!', color: '#eab308', bgGrad: 'linear-gradient(135deg, #eab308, #a16207)' },
  { id: 'bell', name: 'Bell', hindiName: 'Ghanti', category: 'instrument', emoji: '🔔', soundText: 'Ding! Ding! Dong!', voiceText: 'Bell rings Ding Ding Dong!', color: '#f59e0b', bgGrad: 'linear-gradient(135deg, #f59e0b, #d97706)' },
  { id: 'flute', name: 'Flute', hindiName: 'Baansuri', category: 'instrument', emoji: '🪈', soundText: 'Toot! Toot! Whistle!', voiceText: 'Flute makes a soft musical sound!', color: '#10b981', bgGrad: 'linear-gradient(135deg, #10b981, #047857)' },

  // 🏠 Household Sounds
  { id: 'doorbell', name: 'Doorbell', hindiName: 'Doorbell', category: 'household', emoji: '🔔', soundText: 'Ding-Dong! Ding-Dong!', voiceText: 'Doorbell rings Ding Dong!', color: '#8b5cf6', bgGrad: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' },
  { id: 'alarm', name: 'Alarm Clock', hindiName: 'Alarm Ghadi', category: 'household', emoji: '⏰', soundText: 'Beep! Beep! Beep!', voiceText: 'Alarm clock goes Beep Beep!', color: '#ef4444', bgGrad: 'linear-gradient(135deg, #ef4444, #b91c1c)' },
  { id: 'phone', name: 'Phone', hindiName: 'Mobile', category: 'household', emoji: '📱', soundText: 'Ring! Ring! Ring!', voiceText: 'Phone rings Ring Ring!', color: '#6366f1', bgGrad: 'linear-gradient(135deg, #6366f1, #4338ca)' },
  { id: 'vacuum', name: 'Vacuum Cleaner', hindiName: 'Vacuum Cleaner', category: 'household', emoji: '🧹', soundText: 'Vrrrrrrr! Vrrrrrrr!', voiceText: 'Vacuum cleaner goes Vrrrrrr!', color: '#64748b', bgGrad: 'linear-gradient(135deg, #64748b, #334155)' },
  { id: 'washing-machine', name: 'Washing Machine', hindiName: 'Washing Machine', category: 'household', emoji: '🧺', soundText: 'Whirr! Spin! Beep!', voiceText: 'Washing machine spins and beeps!', color: '#06b6d4', bgGrad: 'linear-gradient(135deg, #06b6d4, #0e7490)' },
  { id: 'microwave', name: 'Microwave', hindiName: 'Microwave', category: 'household', emoji: '📟', soundText: 'Beep! Beep! Ding!', voiceText: 'Microwave beeps when food is ready!', color: '#475569', bgGrad: 'linear-gradient(135deg, #475569, #1e293b)' },
  { id: 'door', name: 'Door', hindiName: 'Darwaza', category: 'household', emoji: '🚪', soundText: 'Knock! Knock!', voiceText: 'Someone knocks Knock Knock on the door!', color: '#92400e', bgGrad: 'linear-gradient(135deg, #92400e, #78350f)' },

  // 🍳 Kitchen Sounds
  { id: 'kettle', name: 'Kettle', hindiName: 'Ketli', category: 'kitchen', emoji: '🫖', soundText: 'Whistle! Whistle!', voiceText: 'Kettle whistles when the water is hot!', color: '#f97316', bgGrad: 'linear-gradient(135deg, #f97316, #c2410c)' },
  { id: 'blender', name: 'Blender', hindiName: 'Blender', category: 'kitchen', emoji: '🥤', soundText: 'Brrrrrrr! Whirr!', voiceText: 'Blender goes Brrrrrr!', color: '#8b5cf6', bgGrad: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' },
  { id: 'frying', name: 'Frying Pan', hindiName: 'Tawa', category: 'kitchen', emoji: '🍳', soundText: 'Sizzle! Sizzle!', voiceText: 'Food sizzles in the frying pan!', color: '#ef4444', bgGrad: 'linear-gradient(135deg, #ef4444, #b91c1c)' },
  { id: 'toaster', name: 'Toaster', hindiName: 'Toaster', category: 'kitchen', emoji: '🍞', soundText: 'Pop! Ding!', voiceText: 'Toaster pops and makes a Ding sound!', color: '#d97706', bgGrad: 'linear-gradient(135deg, #d97706, #92400e)' },

  // 👏 Human Sounds
  { id: 'clap', name: 'Clapping', hindiName: 'Taali', category: 'human', emoji: '👏', soundText: 'Clap! Clap! Clap!', voiceText: 'People clap their hands Clap Clap!', color: '#ec4899', bgGrad: 'linear-gradient(135deg, #ec4899, #be185d)' },
  { id: 'laugh', name: 'Laughing', hindiName: 'Hansi', category: 'human', emoji: '😂', soundText: 'Ha Ha Ha! Hee Hee!', voiceText: 'Someone is laughing Ha Ha Ha!', color: '#facc15', bgGrad: 'linear-gradient(135deg, #facc15, #ca8a04)' },
  { id: 'sneeze', name: 'Sneezing', hindiName: 'Chheenk', category: 'human', emoji: '🤧', soundText: 'Achoo! Achoo!', voiceText: 'Someone sneezes Achoo Achoo!', color: '#38bdf8', bgGrad: 'linear-gradient(135deg, #38bdf8, #0284c7)' },
  { id: 'cough', name: 'Coughing', hindiName: 'Khaansi', category: 'human', emoji: '😷', soundText: 'Cough! Cough!', voiceText: 'Someone is coughing Cough Cough!', color: '#64748b', bgGrad: 'linear-gradient(135deg, #64748b, #334155)' },
  { id: 'baby', name: 'Baby Crying', hindiName: 'Bacche Ka Rona', category: 'human', emoji: '👶', soundText: 'Waaah! Waaah!', voiceText: 'Baby is crying Waaah Waaah!', color: '#f472b6', bgGrad: 'linear-gradient(135deg, #f472b6, #db2777)' },

  // 🎉 Fun Sounds
  { id: 'balloon', name: 'Balloon', hindiName: 'Gubbara', category: 'fun', emoji: '🎈', soundText: 'Pop! Bang!', voiceText: 'Balloon goes Pop!', color: '#ec4899', bgGrad: 'linear-gradient(135deg, #ec4899, #be185d)' },
  { id: 'fireworks', name: 'Fireworks', hindiName: 'Aatishbaazi', category: 'fun', emoji: '🎆', soundText: 'Boom! Bang! Crackle!', voiceText: 'Fireworks go Boom Bang Crackle!', color: '#8b5cf6', bgGrad: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' },
  { id: 'whistle', name: 'Whistle', hindiName: 'Seeti', category: 'fun', emoji: '📣', soundText: 'Fweeeet! Fweeeet!', voiceText: 'Whistle goes Fweeeet!', color: '#14b8a6', bgGrad: 'linear-gradient(135deg, #14b8a6, #0f766e)' },
  { id: 'camera', name: 'Camera', hindiName: 'Camera', category: 'fun', emoji: '📸', soundText: 'Click! Click!', voiceText: 'Camera makes a Click sound!', color: '#475569', bgGrad: 'linear-gradient(135deg, #475569, #1e293b)' }
];

  filteredLibrary = () => {
    const cat = this.activeCategory();
    if (cat === 'all') return this.soundLibrary;
    return this.soundLibrary.filter(item => item.category === cat);
  };

  private quizIndex = 0;
  private quizAdvanceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    public appNav: AppNavService,
    public sound: SoundService,
    private speech: SpeechService,
    private confetti: ConfettiService
  ) {}

  ngOnInit(): void {
    this.generateNewQuiz();
  }

  ngOnDestroy(): void {
    if (this.quizAdvanceTimer) {
      clearTimeout(this.quizAdvanceTimer);
      this.quizAdvanceTimer = null;
    }
  }

  nextQuizQuestion(): void {
    if (this.quizAdvanceTimer) {
      clearTimeout(this.quizAdvanceTimer);
      this.quizAdvanceTimer = null;
    }
    this.sound.playTap();
    this.generateNewQuiz();
  }

  setMode(mode: 'quiz' | 'explore'): void {
    this.sound.playTap();
    this.activeMode.set(mode);
    if (mode === 'quiz') {
      this.generateNewQuiz();
    } else {
      this.speech.speak('Explore the soundboard! Tap any animal or vehicle!');
    }
  }

  setCategory(cat: string): void {
    this.sound.playTap();
    this.activeCategory.set(cat);
  }

  onMascotTap(): void {
    this.sound.playGiggle();
    this.isMascotJumping.set(true);
    setTimeout(() => this.isMascotJumping.set(false), 700);
    if (this.activeMode() === 'quiz') {
      this.replayQuizSound();
    } else {
      this.speech.speak('Tap any card to hear its sound!');
    }
  }

  generateNewQuiz(): void {
    if (this.quizAdvanceTimer) {
      clearTimeout(this.quizAdvanceTimer);
      this.quizAdvanceTimer = null;
    }
    this.selectedCorrect.set(null);
    this.selectedWrong.set(null);

    // Pick random target
    const target = this.soundLibrary[Math.floor(Math.random() * this.soundLibrary.length)];

    // Pick 2 other random distractors
    const others = this.soundLibrary.filter(item => item.id !== target.id);
    const shuffledOthers = others.sort(() => 0.5 - Math.random());
    const options = [target, shuffledOthers[0], shuffledOthers[1]].sort(() => 0.5 - Math.random());

    this.currentQuiz.set({ correctItem: target, options });
    this.playQuizAudio();
  }

  playQuizAudio(): void {
    const quiz = this.currentQuiz();
    if (!quiz) return;

    this.isPlayingAudio.set(true);

    // 1. Play real synthesized sound effect
    this.sound.playItemSound(quiz.correctItem.id);

    // 2. Play speech audio guide
    setTimeout(() => {
      this.speech.speak(`Who makes this sound? ${quiz.correctItem.soundText}`);
      setTimeout(() => {
        this.isPlayingAudio.set(false);
      }, 1200);
    }, 450);
  }

  replayQuizSound(): void {
    this.sound.playTap();
    this.playQuizAudio();
  }

  onSelectOption(opt: SoundItem): void {
    const quiz = this.currentQuiz();
    if (!quiz) return;

    if (opt.id === quiz.correctItem.id) {
      // 🎉 Correct!
      this.selectedCorrect.set(opt.id);
      this.sound.playItemSound(opt.id);
      this.sound.playSuccess();
      this.confetti.fire();
      this.score.update(s => s + 1);

      this.speech.speak(`Awesome! That is a ${opt.name}! ${opt.soundText}`);

      if (this.quizAdvanceTimer) {
        clearTimeout(this.quizAdvanceTimer);
      }
      this.quizAdvanceTimer = setTimeout(() => {
        this.generateNewQuiz();
        this.quizAdvanceTimer = null;
      }, 1800);
    } else {
      // ❌ Friendly wrong wobble
      this.selectedWrong.set(opt.id);
      this.sound.playBoing();
      this.sound.playItemSound(opt.id);
      this.speech.speak(`That is a ${opt.name}! Listen again!`);

      setTimeout(() => {
        this.selectedWrong.set(null);
      }, 600);
    }
  }

  playItemDirectly(item: SoundItem): void {
    this.activePlayingId.set(item.id);

    // Play synthesized sound effect
    this.sound.playItemSound(item.id);

    // Speak name and sound
    setTimeout(() => {
      this.speech.speak(`${item.name}! ${item.soundText}`);
      setTimeout(() => {
        this.activePlayingId.set(null);
      }, 1200);
    }, 400);
  }
}

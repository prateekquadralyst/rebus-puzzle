import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppNavService } from '../../core/services/app-nav.service';
import { SoundService } from '../../core/services/sound.service';
import { SpeechService } from '../../core/services/speech.service';
import { ConfettiService } from '../../core/services/confetti.service';

interface NumberStage {
  num: number;
  word: string;
  itemSingular: string;
  itemPlural: string;
  emoji: string;
  bgGradient: string;
  borderColor: string;
  shadowColor: string;
}

interface CountItem {
  id: number;
  counted: boolean;
  countOrder?: number;
}

@Component({
  selector: 'app-number-counting',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="counting-viewport">
      <!-- 🌟 Top Navigation Header -->
      <header class="counting-header">
        <button 
          type="button" 
          (click)="goBack()" 
          class="nav-btn"
          id="btn-counting-back"
          title="Back to Hub">
          <span>🏰</span>
          <span>Hub</span>
        </button>

        <div class="title-cluster">
          <span class="title-badge">🔢 1 2 3 4 PLAYGROUND</span>
          <h2 class="title-text">Numbers & Counting</h2>
        </div>

        <button 
          type="button" 
          (click)="sound.toggleMute()" 
          class="sound-btn"
          [title]="sound.isMuted() ? 'Turn Sound On' : 'Turn Sound Off'">
          {{ sound.isMuted() ? '🔇' : '🎵' }}
        </button>
      </header>

      <!-- Mode Selector -->
      <div class="mode-bar">
        <button 
          type="button" 
          class="mode-pill"
          [class.active-pill]="currentMode === 'tap_count'"
          (click)="setMode('tap_count')">
          <span>👆</span>
          <span>Tap & Count</span>
        </button>
        <button 
          type="button" 
          class="mode-pill"
          [class.active-pill]="currentMode === 'quiz'"
          (click)="setMode('quiz')">
          <span>🎯</span>
          <span>How Many? Quiz</span>
        </button>
      </div>

      <!-- Main Stage -->
      <main class="counting-content">
        @if (currentMode === 'tap_count') {
          <!-- Number Ribbon Selector (1 to 10) -->
          <div class="numbers-ribbon">
            @for (stage of stages; track stage.num) {
              <button 
                type="button"
                class="num-pill-btn"
                [class.active-num]="activeStage.num === stage.num"
                [style.background]="activeStage.num === stage.num ? stage.bgGradient : 'rgba(255,255,255,0.08)'"
                [style.border-color]="stage.borderColor"
                (click)="selectStage(stage)">
                {{ stage.num }}
              </button>
            }
          </div>

          <!-- 🌈 Vibrant Active Stage Card -->
          <div 
            class="count-stage-card" 
            [style.background]="activeStage.bgGradient"
            [style.border-color]="activeStage.borderColor"
            [style.box-shadow]="'0 12px 35px -5px ' + activeStage.shadowColor">
            
            <div class="stage-banner">
              <span class="big-num font-display">
                {{ activeStage.num }}
              </span>
              <div class="banner-text">
                <h3 class="banner-title">{{ activeStage.num }} {{ activeStage.num === 1 ? activeStage.itemSingular : activeStage.itemPlural }}</h3>
                <p class="banner-sub">
                  @if (countedCount === activeStage.num) {
                    🎉 Fantastic! You counted all {{ activeStage.num }}!
                  } @else {
                    Tap each {{ activeStage.itemSingular }} to count: {{ countedCount }} / {{ activeStage.num }}
                  }
                </p>
              </div>
            </div>

            <!-- Tappable Objects Canvas -->
            <div class="items-canvas">
              @for (item of countItems; track item.id) {
                <button 
                  type="button"
                  class="count-obj-btn"
                  [class.obj-counted]="item.counted"
                  (click)="onItemTap(item)">
                  <span class="obj-emoji">{{ activeStage.emoji }}</span>
                  @if (item.counted) {
                    <span class="count-badge animate-pop font-display">
                      {{ item.countOrder }}
                    </span>
                  }
                </button>
              }
            </div>

            <!-- Stage Bottom Controls -->
            <div class="stage-controls">
              <button 
                type="button" 
                class="action-btn btn-replay" 
                (click)="resetActiveStage()">
                🔄 Count Again
              </button>

              @if (activeStage.num < stages.length) {
                <button 
                  type="button" 
                  class="action-btn btn-next"
                  [class.glow-next]="countedCount === activeStage.num"
                  (click)="nextStage()">
                  Next ({{ activeStage.num + 1 }}) ⏩
                </button>
              }
            </div>
          </div>
        } @else {
          <!-- 🎯 Quiz Mode: How Many? -->
          <div class="quiz-container">
            <div class="quiz-question-box">
              <span class="quiz-mascot">🧸</span>
              <h3 class="quiz-prompt">
                How many <span class="highlight-item">{{ quizStage.itemPlural }}</span>&nbsp;do you see?
              </h3>
              <p class="quiz-hint">Count them and tap the right number below!</p>
              
              <div class="quiz-controls-row">
                <button 
                  type="button" 
                  class="quiz-replay-btn" 
                  (click)="speakQuizQuestion()">
                  🔊 Hear Question
                </button>

                <button 
                  type="button" 
                  class="quiz-next-btn"
                  [class.btn-glow-pulse]="quizFeedback === 'correct'"
                  (click)="nextQuizQuestion()"
                  title="Next question">
                  <span>{{ quizFeedback === 'correct' ? 'Next 🌟 ➡️' : 'Next Question ⏭️' }}</span>
                </button>
              </div>
            </div>

            <!-- Random Objects Display -->
            <div class="quiz-items-box">
              @for (item of quizItems; track item) {
                <span class="quiz-item-emoji animate-pop">{{ quizStage.emoji }}</span>
              }
            </div>

            <!-- Options Grid (Numbers to pick) -->
            <div class="quiz-options-grid">
              @for (opt of quizOptions; track opt) {
                <button 
                  type="button" 
                  class="quiz-num-card font-display"
                  [class.opt-correct]="quizFeedback === 'correct' && opt === quizStage.num"
                  [class.opt-wrong]="wrongSelectedNum === opt"
                  (click)="onQuizAnswer(opt)">
                  {{ opt }}
                </button>
              }
            </div>

            <div class="quiz-meta-score">
              <span class="star-badge">⭐ {{ quizStars }} Stars Earned</span>
            </div>
          </div>
        }
      </main>

      <!-- Footer -->
      <footer class="counting-footer">
        <p class="footer-tip">💡 Fun Counting Tip: Tap each object one-by-one to count together!</p>
      </footer>
    </div>
  `,
  styles: [`
    .counting-viewport {
      min-height: 100vh;
      min-height: 100dvh;
      width: 100%;
      background: var(--app-viewport-bg, radial-gradient(circle at 50% 12%, #1e1b4b 0%, #0f172a 65%, #030712 100%));
      transition: background 0.4s ease;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      user-select: none;
      overflow-x: hidden;
    }

    /* Header */
    .counting-header {
      width: 100%;
      max-width: 920px;
      margin: 0 auto;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      z-index: 10;
    }

    .nav-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 7px 14px;
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.18);
      color: #e2e8f0;
      font-size: 0.78rem;
      font-weight: 700;
      cursor: pointer;
      backdrop-filter: blur(10px);
      transition: all 0.2s;
    }
    .nav-btn:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-2px);
      color: #ffffff;
    }

    .title-cluster {
      text-align: center;
    }
    .title-badge {
      display: inline-block;
      font-size: 0.65rem;
      font-weight: 900;
      color: #fde047;
      letter-spacing: 0.08em;
    }
    .title-text {
      font-family: var(--font-display);
      font-size: clamp(1.05rem, 3.4vw, 1.35rem);
      font-weight: 900;
      color: #ffffff;
      margin: 0;
    }

    .sound-btn {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.18);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      cursor: pointer;
      backdrop-filter: blur(10px);
      color: #ffffff;
      outline: none;
      transition: all 0.2s;
    }
    .sound-btn:hover {
      transform: scale(1.08);
      background: rgba(255, 255, 255, 0.22);
    }

    /* Mode Bar */
    .mode-bar {
      display: flex;
      justify-content: center;
      gap: 10px;
      padding: 0 16px 10px 16px;
    }
    .mode-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 16px;
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.08);
      border: 1.5px solid rgba(255, 255, 255, 0.16);
      color: #cbd5e1;
      font-size: 0.78rem;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.2s;
    }
    .mode-pill:hover {
      background: rgba(255, 255, 255, 0.15);
      transform: translateY(-2px);
    }
    .active-pill {
      background: linear-gradient(135deg, #10b981, #059669) !important;
      border-color: #34d399 !important;
      color: #ffffff !important;
      box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
    }

    /* Main Content */
    .counting-content {
      flex: 1;
      max-width: 920px;
      width: 100%;
      margin: 0 auto;
      padding: 0 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    /* Numbers Ribbon */
    .numbers-ribbon {
      display: flex;
      gap: 6px;
      overflow-x: auto;
      max-width: 100%;
      padding: 2px 2px 10px 2px;
      scrollbar-width: none;
    }
    .numbers-ribbon::-webkit-scrollbar {
      display: none;
    }

    .num-pill-btn {
      min-width: 42px;
      height: 42px;
      border-radius: 14px;
      border: 2px solid;
      color: #ffffff;
      font-family: var(--font-display);
      font-size: 1.25rem;
      font-weight: 900;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.35);
    }
    .num-pill-btn:hover {
      transform: translateY(-2px) scale(1.08);
    }
    .active-num {
      transform: scale(1.14);
      box-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
      border-color: #fde047 !important;
    }

    /* Count Stage Card */
    .count-stage-card {
      width: 100%;
      border-radius: 24px;
      border: 2px solid;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      color: #ffffff;
      animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .stage-banner {
      display: flex;
      align-items: center;
      gap: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      padding-bottom: 10px;
    }

    .big-num {
      font-size: clamp(2.8rem, 8vw, 3.8rem);
      font-weight: 900;
      line-height: 1;
      color: #ffffff;
      text-shadow: 0 3px 8px rgba(0, 0, 0, 0.35);
      background: rgba(0, 0, 0, 0.2);
      padding: 4px 16px;
      border-radius: 18px;
    }

    .banner-text {
      text-align: left;
    }
    .banner-title {
      font-family: var(--font-display);
      font-size: clamp(1.15rem, 3.8vw, 1.45rem);
      font-weight: 900;
      color: #ffffff;
      margin: 0;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
    .banner-sub {
      font-size: 0.78rem;
      color: #fef08a;
      margin-top: 2px;
      font-weight: 700;
    }

    /* Items Canvas */
    .items-canvas {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 12px 6px;
      min-height: 140px;
      background: rgba(0, 0, 0, 0.15);
      border-radius: 20px;
    }

    .count-obj-btn {
      position: relative;
      background: rgba(255, 255, 255, 0.22);
      border: 2px solid rgba(255, 255, 255, 0.35);
      border-radius: 22px;
      width: clamp(60px, 16vw, 76px);
      height: clamp(60px, 16vw, 76px);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 6px 14px rgba(0, 0, 0, 0.25);
      transition: all 0.22s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .count-obj-btn:hover {
      transform: scale(1.12) rotate(6deg);
      background: rgba(255, 255, 255, 0.32);
    }
    .count-obj-btn:active {
      transform: scale(0.92);
    }

    .obj-emoji {
      font-size: clamp(2.2rem, 6vw, 2.8rem);
      filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.3));
    }

    .obj-counted {
      background: rgba(255, 255, 255, 0.4) !important;
      border-color: #fde047 !important;
      box-shadow: 0 0 20px rgba(253, 224, 71, 0.7) !important;
      transform: scale(1.06);
    }

    .count-badge {
      position: absolute;
      top: -6px;
      right: -6px;
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: #fde047;
      border: 2px solid #0f172a;
      color: #0f172a;
      font-size: 0.85rem;
      font-weight: 900;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 3px 8px rgba(0, 0, 0, 0.35);
    }

    /* Stage Controls */
    .stage-controls {
      display: flex;
      gap: 10px;
      justify-content: space-between;
    }

    .action-btn {
      flex: 1;
      padding: 10px 14px;
      border-radius: 16px;
      font-weight: 900;
      font-size: 0.82rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-replay {
      background: rgba(255, 255, 255, 0.18);
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: #ffffff;
    }
    .btn-replay:hover {
      background: rgba(255, 255, 255, 0.28);
    }

    .btn-next {
      background: #ffffff;
      border: none;
      color: #0f172a;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
    }
    .btn-next:hover {
      background: #fde047;
      transform: scale(1.04);
    }
    .glow-next {
      animation: jellyPulse 1.8s infinite;
      background: #fde047 !important;
    }

    /* 🎯 Quiz Mode */
    .quiz-container {
      width: 100%;
      max-width: 520px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 6px 0;
    }

    .quiz-question-box {
      width: 100%;
      background: rgba(255, 255, 255, 0.08);
      border: 2px solid rgba(255, 255, 255, 0.16);
      border-radius: 22px;
      padding: 16px;
      text-align: center;
      backdrop-filter: blur(10px);
    }

    .quiz-mascot {
      font-size: 2.8rem;
    }

    .quiz-prompt {
      font-family: var(--font-display);
      font-size: clamp(1.2rem, 4vw, 1.6rem);
      font-weight: 900;
      color: #ffffff;
      margin: 4px 0;
    }

    .highlight-item {
      color: #fde047;
      display: inline-block;
      margin: 0 4px;
    }

    .quiz-hint {
      font-size: 0.8rem;
      color: #cbd5e1;
    }

    .quiz-items-box {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 12px;
      padding: 16px;
      background: rgba(255, 255, 255, 0.06);
      border-radius: 22px;
      width: 100%;
      min-height: 110px;
    }

    .quiz-item-emoji {
      font-size: clamp(2.4rem, 7vw, 3.2rem);
      filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.35));
    }

    .quiz-controls-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      flex-wrap: wrap;
      margin-top: 8px;
    }

    .quiz-replay-btn {
      padding: 7px 16px;
      border-radius: 16px;
      background: rgba(99, 102, 241, 0.25);
      border: 1px solid rgba(99, 102, 241, 0.4);
      color: #c7d2fe;
      font-size: 0.78rem;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.2s;
    }
    .quiz-replay-btn:hover {
      background: #6366f1;
      color: #ffffff;
      transform: scale(1.05);
    }

    .quiz-next-btn {
      padding: 7px 18px;
      border-radius: 16px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border: 1.5px solid #6ee7b7;
      color: #ffffff;
      font-size: 0.78rem;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);
    }
    .quiz-next-btn:hover {
      transform: scale(1.06);
      background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
    }

    .btn-glow-pulse {
      animation: countNextPulse 0.9s infinite alternate;
      border-color: #fde047 !important;
      box-shadow: 0 0 18px rgba(253, 224, 71, 0.85) !important;
    }

    @keyframes countNextPulse {
      0% { transform: scale(1); }
      100% { transform: scale(1.08); }
    }

    .quiz-options-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      width: 100%;
    }

    .quiz-num-card {
      padding: 16px 10px;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.1);
      border: 2px solid rgba(255, 255, 255, 0.22);
      color: #ffffff;
      font-size: clamp(2.2rem, 7vw, 3rem);
      font-weight: 900;
      cursor: pointer;
      backdrop-filter: blur(10px);
      box-shadow: 0 8px 18px rgba(0, 0, 0, 0.3);
      transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .quiz-num-card:hover {
      transform: translateY(-4px) scale(1.06);
      background: rgba(255, 255, 255, 0.18);
    }

    .opt-correct {
      background: rgba(16, 185, 129, 0.35) !important;
      border-color: #34d399 !important;
      box-shadow: 0 0 25px rgba(52, 211, 153, 0.6) !important;
    }

    .opt-wrong {
      animation: shake 0.4s ease;
      border-color: #ef4444 !important;
    }

    .quiz-meta-score {
      display: flex;
      justify-content: center;
    }
    .star-badge {
      display: inline-flex;
      align-items: center;
      padding: 6px 16px;
      border-radius: 18px;
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.3);
      color: #fde047;
      font-size: 0.82rem;
      font-weight: 800;
    }

    /* Footer */
    .counting-footer {
      text-align: center;
      padding: 8px 16px 14px 16px;
      color: #64748b;
      font-size: 0.7rem;
    }

    @keyframes jellyPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%, 60% { transform: translateX(-8px); }
      40%, 80% { transform: translateX(8px); }
    }

    @keyframes popIn {
      0% { transform: scale(0.85); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
  `]
})
export class NumberCountingComponent implements OnInit {
  readonly stages: NumberStage[] = [
    {
      num: 1, word: 'One', itemSingular: 'Sun', itemPlural: 'Suns', emoji: '☀️',
      bgGradient: 'linear-gradient(145deg, #f59e0b 0%, #d97706 100%)',
      borderColor: '#fde047', shadowColor: 'rgba(245, 158, 11, 0.5)'
    },
    {
      num: 2, word: 'Two', itemSingular: 'Duck', itemPlural: 'Ducks', emoji: '🦆',
      bgGradient: 'linear-gradient(145deg, #10b981 0%, #059669 100%)',
      borderColor: '#6ee7b7', shadowColor: 'rgba(16, 185, 129, 0.5)'
    },
    {
      num: 3, word: 'Three', itemSingular: 'Star', itemPlural: 'Stars', emoji: '⭐',
      bgGradient: 'linear-gradient(145deg, #eab308 0%, #ca8a04 100%)',
      borderColor: '#fef08a', shadowColor: 'rgba(234, 179, 8, 0.5)'
    },
    {
      num: 4, word: 'Four', itemSingular: 'Apple', itemPlural: 'Apples', emoji: '🍎',
      bgGradient: 'linear-gradient(145deg, #ef4444 0%, #dc2626 100%)',
      borderColor: '#fca5a5', shadowColor: 'rgba(239, 68, 68, 0.5)'
    },
    {
      num: 5, word: 'Five', itemSingular: 'Balloon', itemPlural: 'Balloons', emoji: '🎈',
      bgGradient: 'linear-gradient(145deg, #8b5cf6 0%, #7c3aed 100%)',
      borderColor: '#c4b5fd', shadowColor: 'rgba(139, 92, 246, 0.5)'
    },
    {
      num: 6, word: 'Six', itemSingular: 'Strawberry', itemPlural: 'Strawberries', emoji: '🍓',
      bgGradient: 'linear-gradient(145deg, #ec4899 0%, #db2777 100%)',
      borderColor: '#fbcfe8', shadowColor: 'rgba(236, 72, 153, 0.5)'
    },
    {
      num: 7, word: 'Seven', itemSingular: 'Butterfly', itemPlural: 'Butterflies', emoji: '🦋',
      bgGradient: 'linear-gradient(145deg, #06b6d4 0%, #0284c7 100%)',
      borderColor: '#67e8f9', shadowColor: 'rgba(6, 182, 212, 0.5)'
    },
    {
      num: 8, word: 'Eight', itemSingular: 'Car', itemPlural: 'Cars', emoji: '🚗',
      bgGradient: 'linear-gradient(145deg, #3b82f6 0%, #1d4ed8 100%)',
      borderColor: '#93c5fd', shadowColor: 'rgba(59, 130, 246, 0.5)'
    },
    {
      num: 9, word: 'Nine', itemSingular: 'Flower', itemPlural: 'Flowers', emoji: '🌸',
      bgGradient: 'linear-gradient(145deg, #d946ef 0%, #c026d3 100%)',
      borderColor: '#f5d0fe', shadowColor: 'rgba(217, 70, 239, 0.5)'
    },
    {
      num: 10, word: 'Ten', itemSingular: 'Puppy', itemPlural: 'Puppies', emoji: '🐶',
      bgGradient: 'linear-gradient(145deg, #f97316 0%, #ea580c 100%)',
      borderColor: '#fed7aa', shadowColor: 'rgba(249, 115, 22, 0.5)'
    }
  ];

  activeStage!: NumberStage;
  countItems: CountItem[] = [];
  countedCount = 0;
  currentMode: 'tap_count' | 'quiz' = 'tap_count';

  // Quiz State
  quizStage!: NumberStage;
  quizItems: number[] = [];
  quizOptions: number[] = [];
  quizStars = 0;
  quizFeedback: 'idle' | 'correct' | 'wrong' = 'idle';
  wrongSelectedNum: number | null = null;

  private quizTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    public appNav: AppNavService,
    public sound: SoundService,
    private speech: SpeechService,
    private confetti: ConfettiService
  ) {}

  ngOnInit(): void {
    this.selectStage(this.stages[0]);
    this.initQuizRound();
  }

  ngOnDestroy(): void {
    this.clearQuizTimer();
  }

  setMode(mode: 'tap_count' | 'quiz'): void {
    this.sound.playTap();
    this.clearQuizTimer();
    this.currentMode = mode;
    if (mode === 'quiz') {
      this.initQuizRound();
      this.speakQuizQuestion();
    } else {
      this.sound.playCountNumber(this.activeStage.num);
      setTimeout(() => {
        this.speech.speak(`Let's count ${this.activeStage.num} ${this.activeStage.itemPlural}!`);
      }, 500);
    }
  }

  selectStage(stage: NumberStage): void {
    this.sound.playTap();
    this.activeStage = stage;
    this.resetActiveStage();
    // 🔢 Real voice for number
    this.sound.playCountNumber(stage.num);
    setTimeout(() => {
      this.speech.speak(`Number ${stage.num}! Count ${stage.num} ${stage.num === 1 ? stage.itemSingular : stage.itemPlural}!`);
    }, 600);
  }

  resetActiveStage(): void {
    this.countedCount = 0;
    this.countItems = Array.from({ length: this.activeStage.num }, (_, i) => ({
      id: i + 1,
      counted: false
    }));
  }

  onItemTap(item: CountItem): void {
    if (item.counted) return;

    this.countedCount++;
    item.counted = true;
    item.countOrder = this.countedCount;

    this.sound.playPop(1 + (this.countedCount * 0.1));
    // 🔢 Real voice counting!
    this.sound.playCountNumber(this.countedCount);

    // If all counted!
    if (this.countedCount === this.activeStage.num) {
      setTimeout(() => {
        this.sound.playFanfare();
        this.confetti.fire();
        this.speech.speak(`Great job! You counted all ${this.activeStage.num} ${this.activeStage.num === 1 ? this.activeStage.itemSingular : this.activeStage.itemPlural}!`);
      }, 600);
    }
  }

  nextStage(): void {
    const currentIndex = this.stages.findIndex(s => s.num === this.activeStage.num);
    if (currentIndex < this.stages.length - 1) {
      this.selectStage(this.stages[currentIndex + 1]);
    }
  }

  // Quiz Methods
  initQuizRound(): void {
    const randomIndex = Math.floor(Math.random() * this.stages.length);
    this.quizStage = this.stages[randomIndex];
    this.quizItems = Array.from({ length: this.quizStage.num }, (_, i) => i + 1);

    // Pick 2 wrong numbers
    const correct = this.quizStage.num;
    let wrong1 = correct + (Math.random() > 0.5 ? 1 : -1);
    if (wrong1 < 1) wrong1 = correct + 2;
    if (wrong1 > 10) wrong1 = correct - 2;

    let wrong2 = correct + (Math.random() > 0.5 ? 2 : -2);
    if (wrong2 < 1 || wrong2 === wrong1) wrong2 = correct + 3;
    if (wrong2 > 10 || wrong2 === wrong1) wrong2 = 1;

    const opts = Array.from(new Set([correct, wrong1, wrong2]));
    while (opts.length < 3) {
      opts.push(opts[opts.length - 1] + 1);
    }
    this.quizOptions = opts.sort(() => Math.random() - 0.5);
    this.quizFeedback = 'idle';
    this.wrongSelectedNum = null;
  }

  speakQuizQuestion(): void {
    this.speech.speak(`How many ${this.quizStage.itemPlural} do you see? Count them!`);
  }

  onQuizAnswer(selectedNum: number): void {
    if (this.quizFeedback === 'correct') return;

    if (selectedNum === this.quizStage.num) {
      this.sound.playFanfare();
      this.confetti.fire();
      this.quizFeedback = 'correct';
      this.quizStars++;
      this.sound.playCountNumber(selectedNum);
      setTimeout(() => {
        this.speech.speak(`Yes! There are ${this.quizStage.num} ${this.quizStage.itemPlural}!`);
      }, 600);

      this.clearQuizTimer();
      this.quizTimer = setTimeout(() => {
        this.initQuizRound();
        this.speakQuizQuestion();
      }, 2400);
    } else {
      this.sound.playBoing();
      this.wrongSelectedNum = selectedNum;
      this.sound.playCountNumber(selectedNum);
      setTimeout(() => {
        this.speech.speak(`That is ${selectedNum}! Let's count again!`);
      }, 600);
      setTimeout(() => {
        this.wrongSelectedNum = null;
      }, 900);
    }
  }

  nextQuizQuestion(): void {
    this.sound.playTap();
    this.clearQuizTimer();
    this.initQuizRound();
    this.speakQuizQuestion();
  }

  private clearQuizTimer(): void {
    if (this.quizTimer) {
      clearTimeout(this.quizTimer);
      this.quizTimer = null;
    }
  }

  goBack(): void {
    this.sound.playTap();
    this.clearQuizTimer();
    this.appNav.goToHub();
  }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppNavService } from '../../core/services/app-nav.service';
import { SoundService } from '../../core/services/sound.service';
import { SpeechService } from '../../core/services/speech.service';
import { ConfettiService } from '../../core/services/confetti.service';

interface LetterItem {
  upper: string;
  lower: string;
  phonics: string;
  word: string;
  emoji: string;
  bgGradient: string;
  borderColor: string;
  shadowColor: string;
}

@Component({
  selector: 'app-alphabet-safari',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="safari-viewport">
      <!-- 🌟 Top Navigation Header -->
      <header class="safari-header">
        <button 
          type="button" 
          (click)="goBack()" 
          class="nav-btn"
          id="btn-safari-back"
          title="Back to Hub">
          <span>🏰</span>
          <span>Hub</span>
        </button>

        <div class="title-cluster">
          <span class="title-badge">🔤 ABCD SAFARI</span>
          <h2 class="title-text">Alphabet & Phonics</h2>
        </div>

        <button 
          type="button" 
          (click)="sound.toggleMute()" 
          class="sound-btn"
          [title]="sound.isMuted() ? 'Turn Sound On' : 'Turn Sound Off'">
          {{ sound.isMuted() ? '🔇' : '🎵' }}
        </button>
      </header>

      <!-- Mode Selector Pills -->
      <div class="mode-bar">
        <button 
          type="button" 
          class="mode-pill"
          [class.active-pill]="currentMode === 'explore'"
          (click)="setMode('explore')">
          <span>🎓</span>
          <span>Explore A-Z</span>
        </button>
        <button 
          type="button" 
          class="mode-pill"
          [class.active-pill]="currentMode === 'quiz'"
          (click)="setMode('quiz')">
          <span>🎯</span>
          <span>Find Letter Quiz</span>
        </button>
      </div>

      <!-- Main Stage -->
      <main class="safari-content">
        @if (currentMode === 'explore') {
          <!-- 🌈 Interactive Spotlight Theater Card -->
          <div 
            class="spotlight-card" 
            [style.background]="activeLetter.bgGradient"
            [style.border-color]="activeLetter.borderColor"
            [style.box-shadow]="'0 12px 35px -5px ' + activeLetter.shadowColor">
            
            <!-- Left: Big 3D Letters Badge -->
            <div class="spotlight-letter-box">
              <span class="spotlight-upper">{{ activeLetter.upper }}</span>
              <span class="spotlight-lower">{{ activeLetter.lower }}</span>
            </div>

            <!-- Center: Floating Mascot Emoji Character -->
            <div class="spotlight-emoji-box" (click)="playLetterSpeech(activeLetter)">
              <span class="spotlight-emoji animate-bounce">{{ activeLetter.emoji }}</span>
            </div>

            <!-- Right: Phonics & Info -->
            <div class="spotlight-info">
              <div class="spotlight-word-title">{{ activeLetter.word }}</div>
              <div class="spotlight-phonics-badge">"{{ activeLetter.phonics }}"</div>
            </div>

            <!-- Navigation & Audio Actions -->
            <div class="spotlight-actions">
              <button 
                type="button" 
                class="spot-nav-btn" 
                (click)="prevLetter()"
                title="Previous Letter">
                ◀
              </button>
              
              <button 
                type="button" 
                class="spotlight-audio-btn" 
                (click)="playLetterSpeech(activeLetter)"
                title="Hear letter sound">
                <span>🔊 Hear</span>
              </button>

              <button 
                type="button" 
                class="spotlight-audio-btn write-btn" 
                (click)="goToTracing(activeLetter.upper)"
                title="Learn to write this letter">
                <span>✏️ Write</span>
              </button>

              <button 
                type="button" 
                class="spot-nav-btn" 
                (click)="nextLetter()"
                title="Next Letter">
                ▶
              </button>
            </div>
          </div>

          <!-- 🍬 Vibrant 3D Candy Alphabet Grid -->
          <div class="alphabet-grid-wrapper">
            <div class="alphabet-grid">
              @for (item of letters; track item.upper) {
                <button 
                  type="button" 
                  class="letter-card"
                  [class.selected-card]="activeLetter.upper === item.upper"
                  [style.background]="item.bgGradient"
                  [style.border-color]="item.borderColor"
                  [style.box-shadow]="'0 8px 20px -3px ' + item.shadowColor"
                  (click)="onLetterSelect(item)">
                  
                  <div class="card-letters">
                    <span class="char-upper">{{ item.upper }}</span>
                    <span class="char-lower">{{ item.lower }}</span>
                  </div>

                  <span class="card-emoji">{{ item.emoji }}</span>
                  <span class="card-word">{{ item.word }}</span>
                </button>
              }
            </div>
          </div>
        } @else {
          <!-- 🎯 Quiz Mode: Find the Letter -->
          <div class="quiz-container">
            <div class="quiz-prompt-card">
              <div class="mascot-speaker">🧸</div>
              <h3 class="quiz-question">
                Where is letter <span class="highlight-target">{{ quizTarget.upper }}</span>?
              </h3>
              <p class="quiz-sub">Find {{ quizTarget.upper }} for {{ quizTarget.word }} {{ quizTarget.emoji }}</p>
              
              <div class="quiz-controls-row">
                <button 
                  type="button" 
                  class="quiz-replay-btn" 
                  (click)="speakQuizQuestion()">
                  🔊 Hear Again
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

            <!-- Quiz Options Cards -->
            <div class="quiz-options-grid">
              @for (opt of quizOptions; track opt.upper) {
                <button 
                  type="button" 
                  class="quiz-opt-card"
                  [class.opt-correct]="quizFeedback === 'correct' && opt.upper === quizTarget.upper"
                  [class.opt-wrong]="wrongSelectedUpper === opt.upper"
                  [style.background]="opt.bgGradient"
                  [style.border-color]="opt.borderColor"
                  [style.box-shadow]="'0 12px 25px -4px ' + opt.shadowColor"
                  (click)="onQuizOptionSelect(opt)">
                  <div class="opt-letters">
                    <span class="opt-upper">{{ opt.upper }}</span>
                    <span class="opt-lower">{{ opt.lower }}</span>
                  </div>
                  <span class="opt-emoji">{{ opt.emoji }}</span>
                  <span class="opt-word">{{ opt.word }}</span>
                </button>
              }
            </div>

            <!-- Quiz Score & Streaks -->
            <div class="quiz-footer-meta">
              <span class="stars-counter">⭐ {{ quizScore }} Correct Answers</span>
            </div>
          </div>
        }
      </main>

      <!-- Bottom Ground Footer -->
      <footer class="safari-footer">
        <p class="footer-tip">💡 Tap any letter card to hear phonics and words!</p>
      </footer>
    </div>
  `,
  styles: [`
    .safari-viewport {
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
    .safari-header {
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
      background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
      border-color: #a78bfa !important;
      color: #ffffff !important;
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
    }

    /* Content Stage */
    .safari-content {
      flex: 1;
      max-width: 920px;
      width: 100%;
      margin: 0 auto;
      padding: 0 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    /* 🌈 Spotlight Card */
    .spotlight-card {
      width: 100%;
      border-radius: 22px;
      border: 2px solid;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 12px;
      color: #ffffff;
      animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .spotlight-letter-box {
      display: flex;
      align-items: baseline;
      gap: 2px;
      font-family: var(--font-display);
      background: rgba(0, 0, 0, 0.25);
      padding: 6px 12px;
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.25);
    }
    .spotlight-upper {
      font-size: clamp(2rem, 6.5vw, 2.8rem);
      font-weight: 900;
      line-height: 1;
      color: #ffffff;
      text-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
    }
    .spotlight-lower {
      font-size: clamp(1.4rem, 4.5vw, 1.9rem);
      font-weight: 800;
      color: #fde047;
    }

    .spotlight-emoji-box {
      font-size: clamp(2.4rem, 7vw, 3.4rem);
      filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.35));
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s;
    }
    .spotlight-emoji-box:hover {
      transform: scale(1.15) rotate(8deg);
    }

    .spotlight-info {
      display: flex;
      flex-direction: column;
      text-align: left;
      flex: 1;
    }
    .spotlight-word-title {
      font-family: var(--font-display);
      font-size: clamp(1.05rem, 3.4vw, 1.35rem);
      font-weight: 900;
      color: #ffffff;
      letter-spacing: 0.02em;
      line-height: 1.1;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
    .spotlight-phonics-badge {
      font-size: 0.74rem;
      font-weight: 800;
      color: #fef08a;
      margin-top: 2px;
    }

    .spotlight-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .spot-nav-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.22);
      border: 1px solid rgba(255, 255, 255, 0.35);
      color: #ffffff;
      font-size: 12px;
      font-weight: 900;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.18s;
    }
    .spot-nav-btn:hover {
      transform: scale(1.12);
      background: rgba(255, 255, 255, 0.35);
    }

    .spotlight-audio-btn {
      padding: 7px 12px;
      border-radius: 14px;
      background: #ffffff;
      border: none;
      color: #0f172a;
      font-family: var(--font-display);
      font-size: 0.75rem;
      font-weight: 900;
      cursor: pointer;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
      transition: transform 0.18s;
      white-space: nowrap;
    }
    .spotlight-audio-btn:hover {
      transform: scale(1.08);
      background: #fde047;
    }

    /* 🍬 Alphabet Grid */
    .alphabet-grid-wrapper {
      width: 100%;
      flex: 1;
      overflow-y: auto;
      padding-bottom: 10px;
    }

    .alphabet-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      width: 100%;
      padding: 2px;
    }

    @media (min-width: 600px) {
      .alphabet-grid {
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
      }
    }

    @media (min-width: 850px) {
      .alphabet-grid {
        grid-template-columns: repeat(6, 1fr);
        gap: 14px;
      }
    }

    /* 🍬 Candy Letter Card */
    .letter-card {
      border-radius: 20px;
      border: 2px solid;
      padding: 10px 6px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      cursor: pointer;
      transition: all 0.22s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .letter-card:hover {
      transform: translateY(-4px) scale(1.05);
      filter: brightness(1.08);
    }
    .letter-card:active {
      transform: scale(0.95);
    }

    .selected-card {
      transform: scale(1.08) !important;
      border-color: #fde047 !important;
      border-width: 3px !important;
      box-shadow: 0 0 25px rgba(253, 224, 71, 0.8), 0 8px 20px rgba(0, 0, 0, 0.45) !important;
      animation: jellyPulse 1.8s infinite;
    }

    .card-letters {
      display: flex;
      align-items: baseline;
      gap: 2px;
      background: rgba(0, 0, 0, 0.22);
      padding: 2px 8px;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
    .char-upper {
      font-family: var(--font-display);
      font-size: 1.35rem;
      font-weight: 900;
      color: #ffffff;
      line-height: 1;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.35);
    }
    .char-lower {
      font-family: var(--font-display);
      font-size: 1.05rem;
      font-weight: 800;
      color: #fef08a;
    }

    .card-emoji {
      font-size: 2.2rem;
      line-height: 1;
      filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3));
      transition: transform 0.2s;
    }
    .letter-card:hover .card-emoji {
      transform: scale(1.15) rotate(6deg);
    }

    .card-word {
      font-size: 0.72rem;
      font-weight: 900;
      color: #ffffff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
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

    .quiz-prompt-card {
      width: 100%;
      background: rgba(255, 255, 255, 0.08);
      border: 2px solid rgba(255, 255, 255, 0.16);
      border-radius: 22px;
      padding: 16px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      backdrop-filter: blur(10px);
    }

    .mascot-speaker {
      font-size: 2.8rem;
      animation: floatGentle 2.5s ease-in-out infinite;
    }

    .quiz-question {
      font-family: var(--font-display);
      font-size: clamp(1.2rem, 4vw, 1.6rem);
      font-weight: 900;
      color: #ffffff;
      margin: 6px 0 2px 0;
    }

    .highlight-target {
      color: #fde047;
      text-shadow: 0 0 16px rgba(253, 224, 71, 0.6);
      font-size: 1.25em;
    }

    .quiz-sub {
      font-size: 0.82rem;
      color: #cbd5e1;
      margin-bottom: 10px;
    }

    .quiz-controls-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      flex-wrap: wrap;
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
      animation: nextPulse 0.9s infinite alternate;
      border-color: #fde047 !important;
      box-shadow: 0 0 18px rgba(253, 224, 71, 0.85) !important;
    }

    @keyframes nextPulse {
      0% { transform: scale(1); }
      100% { transform: scale(1.08); }
    }

    .quiz-options-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      width: 100%;
    }

    .quiz-opt-card {
      padding: 16px 8px;
      border-radius: 22px;
      border: 2.5px solid;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .quiz-opt-card:hover {
      transform: translateY(-4px) scale(1.06);
    }
    .quiz-opt-card:active {
      transform: scale(0.96);
    }

    .opt-letters {
      display: flex;
      align-items: baseline;
      gap: 2px;
      background: rgba(0, 0, 0, 0.25);
      padding: 2px 10px;
      border-radius: 12px;
    }

    .opt-upper {
      font-family: var(--font-display);
      font-size: clamp(2rem, 6.5vw, 2.6rem);
      font-weight: 900;
      color: #ffffff;
      line-height: 1;
      text-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
    }
    .opt-lower {
      font-family: var(--font-display);
      font-size: 1.3rem;
      font-weight: 800;
      color: #fef08a;
    }
    .opt-emoji {
      font-size: 2.4rem;
      line-height: 1;
      filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.3));
    }
    .opt-word {
      font-size: 0.72rem;
      font-weight: 900;
      color: #ffffff;
    }

    .opt-correct {
      border-color: #34d399 !important;
      border-width: 3.5px !important;
      animation: popIn 0.3s ease;
      box-shadow: 0 0 28px rgba(52, 211, 153, 0.8) !important;
    }

    .opt-wrong {
      animation: shake 0.4s ease;
      border-color: #ef4444 !important;
    }

    .quiz-footer-meta {
      display: flex;
      justify-content: center;
    }
    .stars-counter {
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
    .safari-footer {
      text-align: center;
      padding: 8px 16px 14px 16px;
      color: #64748b;
      font-size: 0.7rem;
    }

    @keyframes popIn {
      0% { transform: scale(0.85); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }

    @keyframes floatGentle {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-6px); }
    }

    @keyframes jellyPulse {
      0%, 100% { transform: scale(1.08); }
      50% { transform: scale(1.12); }
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%, 60% { transform: translateX(-8px); }
      40%, 80% { transform: translateX(8px); }
    }
  `]
})
export class AlphabetSafariComponent implements OnInit {
  readonly letters: LetterItem[] = [
    {
      upper: 'A', lower: 'a', phonics: 'A says Ah', word: 'Apple', emoji: '🍎',
      bgGradient: 'linear-gradient(145deg, #ef4444 0%, #dc2626 100%)',
      borderColor: '#fca5a5', shadowColor: 'rgba(239, 68, 68, 0.5)'
    },
    {
      upper: 'B', lower: 'b', phonics: 'B says Buh', word: 'Bear', emoji: '🐻',
      bgGradient: 'linear-gradient(145deg, #d97706 0%, #b45309 100%)',
      borderColor: '#fcd34d', shadowColor: 'rgba(217, 119, 6, 0.5)'
    },
    {
      upper: 'C', lower: 'c', phonics: 'C says Kuh', word: 'Cat', emoji: '🐱',
      bgGradient: 'linear-gradient(145deg, #f97316 0%, #ea580c 100%)',
      borderColor: '#fed7aa', shadowColor: 'rgba(249, 115, 22, 0.5)'
    },
    {
      upper: 'D', lower: 'd', phonics: 'D says Duh', word: 'Duck', emoji: '🦆',
      bgGradient: 'linear-gradient(145deg, #10b981 0%, #059669 100%)',
      borderColor: '#6ee7b7', shadowColor: 'rgba(16, 185, 129, 0.5)'
    },
    {
      upper: 'E', lower: 'e', phonics: 'E says Eh', word: 'Elephant', emoji: '🐘',
      bgGradient: 'linear-gradient(145deg, #7c3aed 0%, #6366f1 100%)',
      borderColor: '#c4b5fd', shadowColor: 'rgba(124, 58, 237, 0.5)'
    },
    {
      upper: 'F', lower: 'f', phonics: 'F says Fuh', word: 'Fish', emoji: '🐟',
      bgGradient: 'linear-gradient(145deg, #06b6d4 0%, #0284c7 100%)',
      borderColor: '#67e8f9', shadowColor: 'rgba(6, 182, 212, 0.5)'
    },
    {
      upper: 'G', lower: 'g', phonics: 'G says Guh', word: 'Giraffe', emoji: '🦒',
      bgGradient: 'linear-gradient(145deg, #eab308 0%, #ca8a04 100%)',
      borderColor: '#fef08a', shadowColor: 'rgba(234, 179, 8, 0.5)'
    },
    {
      upper: 'H', lower: 'h', phonics: 'H says Huh', word: 'Horse', emoji: '🐴',
      bgGradient: 'linear-gradient(145deg, #ea580c 0%, #c2410c 100%)',
      borderColor: '#ffedd5', shadowColor: 'rgba(234, 88, 12, 0.5)'
    },
    {
      upper: 'I', lower: 'i', phonics: 'I says Ih', word: 'Ice Cream', emoji: '🍦',
      bgGradient: 'linear-gradient(145deg, #38bdf8 0%, #0284c7 100%)',
      borderColor: '#bae6fd', shadowColor: 'rgba(56, 189, 248, 0.5)'
    },
    {
      upper: 'J', lower: 'j', phonics: 'J says Juh', word: 'Jellyfish', emoji: '🪼',
      bgGradient: 'linear-gradient(145deg, #a855f7 0%, #9333ea 100%)',
      borderColor: '#f0abfc', shadowColor: 'rgba(168, 85, 247, 0.5)'
    },
    {
      upper: 'K', lower: 'k', phonics: 'K says Kuh', word: 'Kangaroo', emoji: '🦘',
      bgGradient: 'linear-gradient(145deg, #f97316 0%, #d97706 100%)',
      borderColor: '#fed7aa', shadowColor: 'rgba(249, 115, 22, 0.5)'
    },
    {
      upper: 'L', lower: 'l', phonics: 'L says Luh', word: 'Lion', emoji: '🦁',
      bgGradient: 'linear-gradient(145deg, #facc15 0%, #eab308 100%)',
      borderColor: '#fef9c3', shadowColor: 'rgba(250, 204, 21, 0.5)'
    },
    {
      upper: 'M', lower: 'm', phonics: 'M says Muh', word: 'Monkey', emoji: '🐵',
      bgGradient: 'linear-gradient(145deg, #84cc16 0%, #65a30d 100%)',
      borderColor: '#bef264', shadowColor: 'rgba(132, 204, 22, 0.5)'
    },
    {
      upper: 'N', lower: 'n', phonics: 'N says Nuh', word: 'Nest', emoji: '🪺',
      bgGradient: 'linear-gradient(145deg, #14b8a6 0%, #0f766e 100%)',
      borderColor: '#99f6e4', shadowColor: 'rgba(20, 184, 166, 0.5)'
    },
    {
      upper: 'O', lower: 'o', phonics: 'O says Oh', word: 'Owl', emoji: '🦉',
      bgGradient: 'linear-gradient(145deg, #6366f1 0%, #4f46e5 100%)',
      borderColor: '#c7d2fe', shadowColor: 'rgba(99, 102, 241, 0.5)'
    },
    {
      upper: 'P', lower: 'p', phonics: 'P says Puh', word: 'Penguin', emoji: '🐧',
      bgGradient: 'linear-gradient(145deg, #3b82f6 0%, #1d4ed8 100%)',
      borderColor: '#93c5fd', shadowColor: 'rgba(59, 130, 246, 0.5)'
    },
    {
      upper: 'Q', lower: 'q', phonics: 'Q says Kwuh', word: 'Queen', emoji: '👑',
      bgGradient: 'linear-gradient(145deg, #f59e0b 0%, #d97706 100%)',
      borderColor: '#fef08a', shadowColor: 'rgba(245, 158, 11, 0.5)'
    },
    {
      upper: 'R', lower: 'r', phonics: 'R says Ruh', word: 'Rabbit', emoji: '🐰',
      bgGradient: 'linear-gradient(145deg, #f43f5e 0%, #e11d48 100%)',
      borderColor: '#fecdd3', shadowColor: 'rgba(244, 63, 94, 0.5)'
    },
    {
      upper: 'S', lower: 's', phonics: 'S says Sss', word: 'Sun', emoji: '☀️',
      bgGradient: 'linear-gradient(145deg, #f59e0b 0%, #ea580c 100%)',
      borderColor: '#fde047', shadowColor: 'rgba(245, 158, 11, 0.5)'
    },
    {
      upper: 'T', lower: 't', phonics: 'T says Tuh', word: 'Tiger', emoji: '🐯',
      bgGradient: 'linear-gradient(145deg, #f97316 0%, #c2410c 100%)',
      borderColor: '#fed7aa', shadowColor: 'rgba(249, 115, 22, 0.5)'
    },
    {
      upper: 'U', lower: 'u', phonics: 'U says Uh', word: 'Umbrella', emoji: '☂️',
      bgGradient: 'linear-gradient(145deg, #8b5cf6 0%, #7c3aed 100%)',
      borderColor: '#ddd6fe', shadowColor: 'rgba(139, 92, 246, 0.5)'
    },
    {
      upper: 'V', lower: 'v', phonics: 'V says Vuh', word: 'Violin', emoji: '🎻',
      bgGradient: 'linear-gradient(145deg, #b45309 0%, #92400e 100%)',
      borderColor: '#fed7aa', shadowColor: 'rgba(180, 83, 9, 0.5)'
    },
    {
      upper: 'W', lower: 'w', phonics: 'W says Wuh', word: 'Whale', emoji: '🐳',
      bgGradient: 'linear-gradient(145deg, #0284c7 0%, #0369a1 100%)',
      borderColor: '#7dd3fc', shadowColor: 'rgba(2, 132, 199, 0.5)'
    },
    {
      upper: 'X', lower: 'x', phonics: 'X says Xss', word: 'Xylophone', emoji: '🎶',
      bgGradient: 'linear-gradient(145deg, #10b981 0%, #047857 100%)',
      borderColor: '#a7f3d0', shadowColor: 'rgba(16, 185, 129, 0.5)'
    },
    {
      upper: 'Y', lower: 'y', phonics: 'Y says Yuh', word: 'Yacht', emoji: '⛵',
      bgGradient: 'linear-gradient(145deg, #06b6d4 0%, #0891b2 100%)',
      borderColor: '#a5f3fc', shadowColor: 'rgba(6, 182, 212, 0.5)'
    },
    {
      upper: 'Z', lower: 'z', phonics: 'Z says Zzz', word: 'Zebra', emoji: '🦓',
      bgGradient: 'linear-gradient(145deg, #475569 0%, #334155 100%)',
      borderColor: '#cbd5e1', shadowColor: 'rgba(71, 85, 105, 0.5)'
    }
  ];

  activeLetter!: LetterItem;
  currentMode: 'explore' | 'quiz' = 'explore';

  // Quiz State
  quizTarget!: LetterItem;
  quizOptions: LetterItem[] = [];
  quizScore = 0;
  quizFeedback: 'idle' | 'correct' | 'wrong' = 'idle';
  wrongSelectedUpper = '';
  private quizTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    public appNav: AppNavService,
    public sound: SoundService,
    private speech: SpeechService,
    private confetti: ConfettiService
  ) {}

  ngOnInit(): void {
    this.activeLetter = this.letters[0];
    this.initQuizRound();
  }

  ngOnDestroy(): void {
    this.clearQuizTimer();
  }

  setMode(mode: 'explore' | 'quiz'): void {
    this.sound.playTap();
    this.clearQuizTimer();
    this.currentMode = mode;
    if (mode === 'quiz') {
      this.initQuizRound();
      this.speakQuizQuestion();
    } else {
      this.playLetterSpeech(this.activeLetter);
    }
  }

  onLetterSelect(letter: LetterItem): void {
    this.sound.playPop();
    this.activeLetter = letter;
    this.playLetterSpeech(letter);
  }

  playLetterSpeech(letter: LetterItem): void {
    // 🔤 Real crystal-clear letter pronunciation
    this.sound.playLetterVoice(letter.upper);
    setTimeout(() => {
      this.speech.speak(`${letter.upper} is for ${letter.word}!`);
    }, 600);
  }

  prevLetter(): void {
    const idx = this.letters.findIndex(l => l.upper === this.activeLetter.upper);
    const prevIdx = idx > 0 ? idx - 1 : this.letters.length - 1;
    this.onLetterSelect(this.letters[prevIdx]);
  }

  nextLetter(): void {
    const idx = this.letters.findIndex(l => l.upper === this.activeLetter.upper);
    const nextIdx = (idx + 1) % this.letters.length;
    this.onLetterSelect(this.letters[nextIdx]);
  }

  goToTracing(char: string): void {
    this.sound.playTap();
    this.appNav.goToLetterTracing('alphabet', char);
  }

  initQuizRound(): void {
    const randomIndex = Math.floor(Math.random() * this.letters.length);
    this.quizTarget = this.letters[randomIndex];

    // Pick 2 random wrong options
    const others = this.letters.filter(l => l.upper !== this.quizTarget.upper);
    const shuffledOthers = others.sort(() => Math.random() - 0.5);
    const wrong1 = shuffledOthers[0];
    const wrong2 = shuffledOthers[1];

    this.quizOptions = [this.quizTarget, wrong1, wrong2].sort(() => Math.random() - 0.5);
    this.quizFeedback = 'idle';
    this.wrongSelectedUpper = '';
  }

  speakQuizQuestion(): void {
    this.speech.speak(`Can you find the letter ${this.quizTarget.upper}? ${this.quizTarget.upper} for ${this.quizTarget.word}!`);
  }

  onQuizOptionSelect(option: LetterItem): void {
    if (this.quizFeedback === 'correct') return;

    if (option.upper === this.quizTarget.upper) {
      // Correct!
      this.sound.playFanfare();
      this.confetti.fire();
      this.quizFeedback = 'correct';
      this.quizScore++;
      this.sound.playLetterVoice(option.upper);
      setTimeout(() => {
        this.speech.speak(`Super job! ${option.upper} is for ${option.word}!`);
      }, 600);

      this.clearQuizTimer();
      this.quizTimer = setTimeout(() => {
        this.initQuizRound();
        this.speakQuizQuestion();
      }, 2400);
    } else {
      // Wrong
      this.sound.playBoing();
      this.wrongSelectedUpper = option.upper;
      this.sound.playLetterVoice(option.upper);
      setTimeout(() => {
        this.speech.speak(`That is letter ${option.upper}! Let's find letter ${this.quizTarget.upper}!`);
      }, 600);
      setTimeout(() => {
        this.wrongSelectedUpper = '';
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

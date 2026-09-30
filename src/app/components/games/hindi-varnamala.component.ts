import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppNavService } from '../../core/services/app-nav.service';
import { SoundService } from '../../core/services/sound.service';
import { SpeechService } from '../../core/services/speech.service';
import { ConfettiService } from '../../core/services/confetti.service';

interface HindiAkshar {
  letter: string;
  word: string;
  emoji: string;
  type: 'swar' | 'vyanjan' | 'samyukt';
  audioKey?: string;
  speechPhrase: string;
  bgGradient: string;
  borderColor: string;
  shadowColor: string;
}

@Component({
  selector: 'app-hindi-varnamala',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="hindi-viewport">
      <!-- 🌟 Top Navigation Header -->
      <header class="hindi-header">
        <button 
          type="button" 
          (click)="goBack()" 
          class="nav-btn"
          id="btn-hindi-back"
          title="Back to Hub">
          <span>🏰</span>
          <span>Hub</span>
        </button>

        <div class="title-cluster">
          <span class="title-badge">🕉️ हिंदी वर्णमाला</span>
          <h2 class="title-text">क, ख, ग, घ अक्षर मेला</h2>
        </div>

        <button 
          type="button" 
          (click)="sound.toggleMute()" 
          class="sound-btn"
          [title]="sound.isMuted() ? 'Turn Sound On' : 'Turn Sound Off'">
          {{ sound.isMuted() ? '🔇' : '🎵' }}
        </button>
      </header>

      <!-- Mode & Category Bars -->
      <div class="controls-bar">
        <!-- Main Mode Tabs -->
        <div class="mode-tabs">
          <button 
            type="button" 
            class="mode-btn"
            [class.active-mode]="currentMode === 'learn'"
            (click)="setMode('learn')">
            <span>📖</span>
            <span>वर्णमाला सीखो</span>
          </button>
          <button 
            type="button" 
            class="mode-btn"
            [class.active-mode]="currentMode === 'quiz'"
            (click)="setMode('quiz')">
            <span>🎯</span>
            <span>अक्षर खोजो क्विज</span>
          </button>
        </div>

        <!-- Category Filter Pills -->
        @if (currentMode === 'learn') {
          <div class="category-pills">
            <button 
              type="button"
              class="cat-pill"
              [class.active-cat]="selectedCategory === 'all'"
              (click)="filterCategory('all')">
              सभी अक्षर (All)
            </button>
            <button 
              type="button"
              class="cat-pill"
              [class.active-cat]="selectedCategory === 'swar'"
              (click)="filterCategory('swar')">
              🍎 स्वर (अ, आ, इ...)
            </button>
            <button 
              type="button"
              class="cat-pill"
              [class.active-cat]="selectedCategory === 'vyanjan'"
              (click)="filterCategory('vyanjan')">
              🕊️ व्यंजन (क, ख, ग...)
            </button>
            <button 
              type="button"
              class="cat-pill"
              [class.active-cat]="selectedCategory === 'samyukt'"
              (click)="filterCategory('samyukt')">
              ⚔️ संयुक्त (क्ष, त्र, ज्ञ)
            </button>
          </div>
        }
      </div>

      <!-- Main Stage -->
      <main class="hindi-content">
        @if (currentMode === 'learn') {
          <!-- 🌈 Interactive Spotlight Theater Card -->
          <div 
            class="spotlight-card" 
            [style.background]="activeAkshar.bgGradient"
            [style.border-color]="activeAkshar.borderColor"
            [style.box-shadow]="'0 12px 35px -5px ' + activeAkshar.shadowColor">
            
            <!-- Big Letter Box -->
            <div class="spotlight-letter-box">
              <span class="spotlight-letter">{{ activeAkshar.letter }}</span>
            </div>

            <!-- Mascot Emoji Sticker -->
            <div class="spotlight-emoji-box" (click)="speakAkshar(activeAkshar)">
              <span class="spotlight-emoji animate-bounce">{{ activeAkshar.emoji }}</span>
            </div>

            <!-- Phrase & Word -->
            <div class="spotlight-info">
              <div class="spotlight-phrase">{{ activeAkshar.speechPhrase }}</div>
              <div class="spotlight-word">{{ activeAkshar.word }}</div>
            </div>

            <!-- Actions -->
            <div class="spotlight-actions">
              <button 
                type="button" 
                class="spot-nav-btn" 
                (click)="prevAkshar()"
                title="Previous Akshar">
                ◀
              </button>
              
              <button 
                type="button" 
                class="spotlight-speak-btn"
                (click)="speakAkshar(activeAkshar)"
                title="Hear Hindi pronunciation">
                <span>🔊 सुनो</span>
              </button>

              <button 
                type="button" 
                class="spot-nav-btn" 
                (click)="nextAkshar()"
                title="Next Akshar">
                ▶
              </button>
            </div>
          </div>

          <!-- 🍬 Full Candy Akshar Cards Grid -->
          <div class="akshar-grid-wrapper">
            <div class="akshar-grid">
              @for (item of filteredAkshars; track item.letter) {
                <button 
                  type="button"
                  class="akshar-card"
                  [class.selected-akshar]="activeAkshar.letter === item.letter"
                  [style.background]="item.bgGradient"
                  [style.border-color]="item.borderColor"
                  [style.box-shadow]="'0 8px 20px -3px ' + item.shadowColor"
                  (click)="onSelectAkshar(item)">
                  <span class="akshar-char">{{ item.letter }}</span>
                  <span class="akshar-emoji">{{ item.emoji }}</span>
                  <span class="akshar-word">{{ item.word }}</span>
                </button>
              }
            </div>
          </div>
        } @else {
          <!-- 🎯 Quiz Mode: Find the Hindi Letter -->
          <div class="quiz-container">
            <div class="quiz-prompt-card">
              <span class="mascot-avatar">🧸</span>
              <h3 class="quiz-prompt-title">
                <span class="highlight-akshar">{{ quizTarget.speechPhrase }}</span>&nbsp;कहाँ है?
              </h3>
              <p class="quiz-sub">नीचे दिए गए अक्षरों में से सही अक्षर चुनो!</p>

              <div class="quiz-controls-row">
                <button 
                  type="button" 
                  class="quiz-replay-btn" 
                  (click)="speakQuizQuestion()">
                  🔊 आवाज़ फिर से सुनो
                </button>

                <button 
                  type="button" 
                  class="quiz-next-btn"
                  [class.btn-glow-pulse]="quizFeedback === 'correct'"
                  (click)="nextQuizQuestion()"
                  title="अगला सवाल">
                  <span>{{ quizFeedback === 'correct' ? 'अगला 🌟 ➡️' : 'अगला सवाल ⏭️' }}</span>
                </button>
              </div>
            </div>

            <!-- Quiz Options Cards -->
            <div class="quiz-options-grid">
              @for (opt of quizOptions; track opt.letter) {
                <button 
                  type="button"
                  class="quiz-card"
                  [class.opt-correct]="quizFeedback === 'correct' && opt.letter === quizTarget.letter"
                  [class.opt-wrong]="wrongSelectedLetter === opt.letter"
                  [style.background]="opt.bgGradient"
                  [style.border-color]="opt.borderColor"
                  [style.box-shadow]="'0 12px 25px -4px ' + opt.shadowColor"
                  (click)="onQuizOptionSelect(opt)">
                  <span class="quiz-char">{{ opt.letter }}</span>
                  <span class="quiz-emoji">{{ opt.emoji }}</span>
                  <span class="quiz-word">{{ opt.word }}</span>
                </button>
              }
            </div>

            <div class="quiz-score-badge">
              <span>⭐ {{ quizScore }} सही जवाब (Correct!)</span>
            </div>
          </div>
        }
      </main>

      <!-- Footer -->
      <footer class="hindi-footer">
        <p class="footer-tip">💡 सुझाव: किसी भी अक्षर पर टैप करके उसकी हिंदी आवाज़ सुनो!</p>
      </footer>
    </div>
  `,
  styles: [`
    .hindi-viewport {
      min-height: 100vh;
      min-height: 100dvh;
      width: 100%;
      background: radial-gradient(circle at 50% 12%, #1e1b4b 0%, #0f172a 65%, #030712 100%);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      user-select: none;
      overflow-x: hidden;
    }

    /* Header */
    .hindi-header {
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

    /* Controls Bar */
    .controls-bar {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 0 16px 8px 16px;
    }

    .mode-tabs {
      display: flex;
      gap: 10px;
    }
    .mode-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
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
    .mode-btn:hover {
      background: rgba(255, 255, 255, 0.15);
      transform: translateY(-2px);
    }
    .active-mode {
      background: linear-gradient(135deg, #f59e0b, #ef4444) !important;
      border-color: #fde047 !important;
      color: #ffffff !important;
      box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
    }

    .category-pills {
      display: flex;
      gap: 6px;
      overflow-x: auto;
      width: 100%;
      padding: 2px;
      scrollbar-width: none;
    }
    .category-pills::-webkit-scrollbar {
      display: none;
    }
    .cat-pill {
      padding: 5px 11px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.07);
      border: 1px solid rgba(255, 255, 255, 0.14);
      color: #cbd5e1;
      font-size: 0.72rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.18s;
      white-space: nowrap;
    }
    .active-cat {
      background: rgba(255, 255, 255, 0.22);
      border-color: #ffffff;
      color: #ffffff;
    }

    /* Main Content */
    .hindi-content {
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
      font-size: clamp(2.4rem, 7vw, 3.2rem);
      font-weight: 900;
      line-height: 1;
      text-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
      background: rgba(0, 0, 0, 0.25);
      padding: 4px 14px;
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.25);
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
    .spotlight-phrase {
      font-size: clamp(1rem, 3.2vw, 1.3rem);
      font-weight: 900;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
    .spotlight-word {
      font-size: 0.76rem;
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

    .spotlight-speak-btn {
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
    .spotlight-speak-btn:hover {
      transform: scale(1.08);
      background: #fde047;
    }

    /* 🍬 Candy Akshar Cards Grid */
    .akshar-grid-wrapper {
      width: 100%;
      flex: 1;
      overflow-y: auto;
      padding-bottom: 10px;
    }

    .akshar-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      width: 100%;
      padding: 2px;
    }

    @media (min-width: 600px) {
      .akshar-grid {
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
      }
    }

    @media (min-width: 850px) {
      .akshar-grid {
        grid-template-columns: repeat(6, 1fr);
        gap: 14px;
      }
    }

    .akshar-card {
      border-radius: 20px;
      border: 2px solid;
      padding: 10px 6px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
      cursor: pointer;
      transition: all 0.22s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .akshar-card:hover {
      transform: translateY(-4px) scale(1.05);
      filter: brightness(1.08);
    }
    .akshar-card:active {
      transform: scale(0.95);
    }

    .selected-akshar {
      transform: scale(1.08) !important;
      border-color: #fde047 !important;
      border-width: 3px !important;
      box-shadow: 0 0 25px rgba(253, 224, 71, 0.8), 0 8px 20px rgba(0, 0, 0, 0.45) !important;
      animation: jellyPulse 1.8s infinite;
    }

    .akshar-char {
      font-size: 1.8rem;
      font-weight: 900;
      color: #ffffff;
      line-height: 1;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
    }
    .akshar-emoji {
      font-size: 2.1rem;
      line-height: 1;
      filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.3));
      transition: transform 0.2s;
    }
    .akshar-card:hover .akshar-emoji {
      transform: scale(1.15) rotate(6deg);
    }

    .akshar-word {
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

    .mascot-avatar {
      font-size: 2.8rem;
    }

    .quiz-prompt-title {
      font-size: clamp(1.2rem, 4vw, 1.6rem);
      font-weight: 900;
      color: #ffffff;
      margin: 6px 0 2px 0;
      word-spacing: 0.18em;
    }

    .highlight-akshar {
      color: #fde047;
      text-shadow: 0 0 16px rgba(253, 224, 71, 0.6);
      display: inline-block;
      margin-right: 8px;
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
      background: rgba(245, 158, 11, 0.25);
      border: 1px solid rgba(245, 158, 11, 0.4);
      color: #fde047;
      font-size: 0.78rem;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.2s;
    }
    .quiz-replay-btn:hover {
      background: #f59e0b;
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
      animation: hindiNextPulse 0.9s infinite alternate;
      border-color: #fde047 !important;
      box-shadow: 0 0 18px rgba(253, 224, 71, 0.85) !important;
    }

    @keyframes hindiNextPulse {
      0% { transform: scale(1); }
      100% { transform: scale(1.08); }
    }

    .quiz-options-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      width: 100%;
    }

    .quiz-card {
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
    .quiz-card:hover {
      transform: translateY(-4px) scale(1.06);
    }
    .quiz-card:active {
      transform: scale(0.96);
    }

    .quiz-char {
      font-size: clamp(2.2rem, 7vw, 3rem);
      font-weight: 900;
      color: #ffffff;
      line-height: 1;
      text-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
    }
    .quiz-emoji {
      font-size: 2.2rem;
      line-height: 1;
      filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.3));
    }
    .quiz-word {
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

    .quiz-score-badge {
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
    .hindi-footer {
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
export class HindiVarnamalaComponent implements OnInit {
  readonly akshars: HindiAkshar[] = [
    // स्वर (Swar)
    { letter: 'अ', word: 'अनार', emoji: '🍎', type: 'swar', audioKey: 'swar_0', speechPhrase: 'अ से अनार', bgGradient: 'linear-gradient(145deg, #ef4444 0%, #dc2626 100%)', borderColor: '#fca5a5', shadowColor: 'rgba(239, 68, 68, 0.5)' },
    { letter: 'आ', word: 'आम', emoji: '🥭', type: 'swar', audioKey: 'swar_1', speechPhrase: 'आ से आम', bgGradient: 'linear-gradient(145deg, #f59e0b 0%, #d97706 100%)', borderColor: '#fde047', shadowColor: 'rgba(245, 158, 11, 0.5)' },
    { letter: 'इ', word: 'इमली', emoji: '🌿', type: 'swar', audioKey: 'swar_2', speechPhrase: 'इ से इमली', bgGradient: 'linear-gradient(145deg, #10b981 0%, #059669 100%)', borderColor: '#6ee7b7', shadowColor: 'rgba(16, 185, 129, 0.5)' },
    { letter: 'ई', word: 'ईख', emoji: '🎋', type: 'swar', audioKey: 'swar_3', speechPhrase: 'ई से ईख', bgGradient: 'linear-gradient(145deg, #84cc16 0%, #65a30d 100%)', borderColor: '#bef264', shadowColor: 'rgba(132, 204, 22, 0.5)' },
    { letter: 'उ', word: 'उल्लू', emoji: '🦉', type: 'swar', audioKey: 'swar_4', speechPhrase: 'उ से उल्लू', bgGradient: 'linear-gradient(145deg, #6366f1 0%, #4f46e5 100%)', borderColor: '#c7d2fe', shadowColor: 'rgba(99, 102, 241, 0.5)' },
    { letter: 'ऊ', word: 'ऊन', emoji: '🧶', type: 'swar', audioKey: 'swar_5', speechPhrase: 'ऊ से ऊन', bgGradient: 'linear-gradient(145deg, #ec4899 0%, #db2777 100%)', borderColor: '#fbcfe8', shadowColor: 'rgba(236, 72, 153, 0.5)' },
    { letter: 'ए', word: 'एड़ी', emoji: '🦶', type: 'swar', audioKey: 'swar_7', speechPhrase: 'ए से एड़ी', bgGradient: 'linear-gradient(145deg, #f97316 0%, #ea580c 100%)', borderColor: '#fed7aa', shadowColor: 'rgba(249, 115, 22, 0.5)' },
    { letter: 'ऐ', word: 'ऐनक', emoji: '👓', type: 'swar', audioKey: 'swar_8', speechPhrase: 'ऐ से ऐनक', bgGradient: 'linear-gradient(145deg, #06b6d4 0%, #0284c7 100%)', borderColor: '#a5f3fc', shadowColor: 'rgba(6, 182, 212, 0.5)' },
    { letter: 'ओ', word: 'ओखली', emoji: '🥣', type: 'swar', audioKey: 'swar_9', speechPhrase: 'ओ से ओखली', bgGradient: 'linear-gradient(145deg, #8b5cf6 0%, #7c3aed 100%)', borderColor: '#ddd6fe', shadowColor: 'rgba(139, 92, 246, 0.5)' },
    { letter: 'औ', word: 'औरत', emoji: '👩', type: 'swar', audioKey: 'swar_10', speechPhrase: 'औ से औरत', bgGradient: 'linear-gradient(145deg, #d946ef 0%, #c026d3 100%)', borderColor: '#f5d0fe', shadowColor: 'rgba(217, 70, 239, 0.5)' },
    { letter: 'अं', word: 'अंगूर', emoji: '🍇', type: 'swar', audioKey: 'swar_11', speechPhrase: 'अं से अंगूर', bgGradient: 'linear-gradient(145deg, #9333ea 0%, #7e22ce 100%)', borderColor: '#e9d5ff', shadowColor: 'rgba(147, 51, 234, 0.5)' },

    // व्यंजन (Vyanjan)
    { letter: 'क', word: 'कबूतर', emoji: '🕊️', type: 'vyanjan', audioKey: 'vyanjan_0', speechPhrase: 'क से कबूतर', bgGradient: 'linear-gradient(145deg, #3b82f6 0%, #1d4ed8 100%)', borderColor: '#93c5fd', shadowColor: 'rgba(59, 130, 246, 0.5)' },
    { letter: 'ख', word: 'खरगोश', emoji: '🐇', type: 'vyanjan', audioKey: 'vyanjan_1', speechPhrase: 'ख से खरगोश', bgGradient: 'linear-gradient(145deg, #10b981 0%, #059669 100%)', borderColor: '#6ee7b7', shadowColor: 'rgba(16, 185, 129, 0.5)' },
    { letter: 'ग', word: 'गमला', emoji: '🪴', type: 'vyanjan', audioKey: 'vyanjan_2', speechPhrase: 'ग से गमला', bgGradient: 'linear-gradient(145deg, #f59e0b 0%, #d97706 100%)', borderColor: '#fde047', shadowColor: 'rgba(245, 158, 11, 0.5)' },
    { letter: 'घ', word: 'घड़ी', emoji: '⏰', type: 'vyanjan', audioKey: 'vyanjan_3', speechPhrase: 'घ से घड़ी', bgGradient: 'linear-gradient(145deg, #ef4444 0%, #dc2626 100%)', borderColor: '#fca5a5', shadowColor: 'rgba(239, 68, 68, 0.5)' },
    { letter: 'च', word: 'चम्मच', emoji: '🥄', type: 'vyanjan', audioKey: 'vyanjan_5', speechPhrase: 'च से चम्मच', bgGradient: 'linear-gradient(145deg, #06b6d4 0%, #0891b2 100%)', borderColor: '#67e8f9', shadowColor: 'rgba(6, 182, 212, 0.5)' },
    { letter: 'छ', word: 'छतरी', emoji: '☂️', type: 'vyanjan', audioKey: 'vyanjan_6', speechPhrase: 'छ से छतरी', bgGradient: 'linear-gradient(145deg, #8b5cf6 0%, #6d28d9 100%)', borderColor: '#c4b5fd', shadowColor: 'rgba(139, 92, 246, 0.5)' },
    { letter: 'ज', word: 'जहाज', emoji: '🚢', type: 'vyanjan', audioKey: 'vyanjan_7', speechPhrase: 'ज से जहाज', bgGradient: 'linear-gradient(145deg, #3b82f6 0%, #2563eb 100%)', borderColor: '#60a5fa', shadowColor: 'rgba(59, 130, 246, 0.5)' },
    { letter: 'झ', word: 'झंडा', emoji: '🇮🇳', type: 'vyanjan', audioKey: 'vyanjan_8', speechPhrase: 'झ से झंडा', bgGradient: 'linear-gradient(145deg, #f97316 0%, #ea580c 100%)', borderColor: '#fed7aa', shadowColor: 'rgba(249, 115, 22, 0.5)' },
    { letter: 'ट', word: 'टमाटर', emoji: '🍅', type: 'vyanjan', audioKey: 'vyanjan_10', speechPhrase: 'ट से टमाटर', bgGradient: 'linear-gradient(145deg, #ef4444 0%, #b91c1c 100%)', borderColor: '#fca5a5', shadowColor: 'rgba(239, 68, 68, 0.5)' },
    { letter: 'ठ', word: 'ठठेरा', emoji: '🔨', type: 'vyanjan', audioKey: 'vyanjan_11', speechPhrase: 'ठ से ठठेरा', bgGradient: 'linear-gradient(145deg, #64748b 0%, #475569 100%)', borderColor: '#cbd5e1', shadowColor: 'rgba(100, 116, 139, 0.5)' },
    { letter: 'ड', word: 'डमरू', emoji: '🪘', type: 'vyanjan', audioKey: 'vyanjan_12', speechPhrase: 'ड से डमरू', bgGradient: 'linear-gradient(145deg, #d97706 0%, #b45309 100%)', borderColor: '#fcd34d', shadowColor: 'rgba(217, 119, 6, 0.5)' },
    { letter: 'ढ', word: 'ढोलक', emoji: '🥁', type: 'vyanjan', audioKey: 'vyanjan_13', speechPhrase: 'ढ से ढोलक', bgGradient: 'linear-gradient(145deg, #eab308 0%, #ca8a04 100%)', borderColor: '#fef08a', shadowColor: 'rgba(234, 179, 8, 0.5)' },
    { letter: 'त', word: 'तितली', emoji: '🦋', type: 'vyanjan', audioKey: 'vyanjan_15', speechPhrase: 'त से तितली', bgGradient: 'linear-gradient(145deg, #ec4899 0%, #be185d 100%)', borderColor: '#fbcfe8', shadowColor: 'rgba(236, 72, 153, 0.5)' },
    { letter: 'थ', word: 'थर्मस', emoji: '🫖', type: 'vyanjan', audioKey: 'vyanjan_16', speechPhrase: 'थ से थर्मस', bgGradient: 'linear-gradient(145deg, #14b8a6 0%, #0f766e 100%)', borderColor: '#99f6e4', shadowColor: 'rgba(20, 184, 166, 0.5)' },
    { letter: 'द', word: 'दवात', emoji: '🖋️', type: 'vyanjan', audioKey: 'vyanjan_17', speechPhrase: 'द से दवात', bgGradient: 'linear-gradient(145deg, #6366f1 0%, #4338ca 100%)', borderColor: '#a5b4fc', shadowColor: 'rgba(99, 102, 241, 0.5)' },
    { letter: 'ध', word: 'धनुष', emoji: '🏹', type: 'vyanjan', audioKey: 'vyanjan_18', speechPhrase: 'ध से धनुष', bgGradient: 'linear-gradient(145deg, #84cc16 0%, #4d7c0f 100%)', borderColor: '#bef264', shadowColor: 'rgba(132, 204, 22, 0.5)' },
    { letter: 'न', word: 'नल', emoji: '🚰', type: 'vyanjan', audioKey: 'vyanjan_19', speechPhrase: 'न से नल', bgGradient: 'linear-gradient(145deg, #0284c7 0%, #0369a1 100%)', borderColor: '#7dd3fc', shadowColor: 'rgba(2, 132, 199, 0.5)' },
    { letter: 'प', word: 'पतंग', emoji: '🪁', type: 'vyanjan', audioKey: 'vyanjan_20', speechPhrase: 'प से पतंग', bgGradient: 'linear-gradient(145deg, #f59e0b 0%, #b45309 100%)', borderColor: '#fde047', shadowColor: 'rgba(245, 158, 11, 0.5)' },
    { letter: 'फ', word: 'फल', emoji: '🍉', type: 'vyanjan', audioKey: 'vyanjan_21', speechPhrase: 'फ से फल', bgGradient: 'linear-gradient(145deg, #10b981 0%, #047857 100%)', borderColor: '#6ee7b7', shadowColor: 'rgba(16, 185, 129, 0.5)' },
    { letter: 'ब', word: 'बतख', emoji: '🦆', type: 'vyanjan', audioKey: 'vyanjan_22', speechPhrase: 'ब से बतख', bgGradient: 'linear-gradient(145deg, #eab308 0%, #a16207 100%)', borderColor: '#fef08a', shadowColor: 'rgba(234, 179, 8, 0.5)' },
    { letter: 'भ', word: 'भालू', emoji: '🐻', type: 'vyanjan', audioKey: 'vyanjan_23', speechPhrase: 'भ से भालू', bgGradient: 'linear-gradient(145deg, #d97706 0%, #92400e 100%)', borderColor: '#fed7aa', shadowColor: 'rgba(217, 119, 6, 0.5)' },
    { letter: 'म', word: 'मछली', emoji: '🐟', type: 'vyanjan', audioKey: 'vyanjan_24', speechPhrase: 'म से मछली', bgGradient: 'linear-gradient(145deg, #06b6d4 0%, #0e7490 100%)', borderColor: '#67e8f9', shadowColor: 'rgba(6, 182, 212, 0.5)' },
    { letter: 'य', word: 'यज्ञ', emoji: '🪔', type: 'vyanjan', audioKey: 'vyanjan_25', speechPhrase: 'य से यज्ञ', bgGradient: 'linear-gradient(145deg, #f97316 0%, #c2410c 100%)', borderColor: '#fed7aa', shadowColor: 'rgba(249, 115, 22, 0.5)' },
    { letter: 'र', word: 'रथ', emoji: '🛞', type: 'vyanjan', audioKey: 'vyanjan_26', speechPhrase: 'र से रथ', bgGradient: 'linear-gradient(145deg, #8b5cf6 0%, #5b21b6 100%)', borderColor: '#c4b5fd', shadowColor: 'rgba(139, 92, 246, 0.5)' },
    { letter: 'ल', word: 'लट्टू', emoji: '🪀', type: 'vyanjan', audioKey: 'vyanjan_27', speechPhrase: 'ल से लट्टू', bgGradient: 'linear-gradient(145deg, #ec4899 0%, #9d174d 100%)', borderColor: '#fbcfe8', shadowColor: 'rgba(236, 72, 153, 0.5)' },
    { letter: 'व', word: 'वक', emoji: '🦩', type: 'vyanjan', audioKey: 'vyanjan_28', speechPhrase: 'व से वक', bgGradient: 'linear-gradient(145deg, #f43f5e 0%, #be123c 100%)', borderColor: '#fecdd3', shadowColor: 'rgba(244, 63, 94, 0.5)' },
    { letter: 'श', word: 'शलजम', emoji: '🧅', type: 'vyanjan', audioKey: 'vyanjan_29', speechPhrase: 'श से शलजम', bgGradient: 'linear-gradient(145deg, #a855f7 0%, #7e22ce 100%)', borderColor: '#e9d5ff', shadowColor: 'rgba(168, 85, 247, 0.5)' },
    { letter: 'ष', word: 'षट्कोण', emoji: '⬡', type: 'vyanjan', audioKey: 'vyanjan_30', speechPhrase: 'ष से षट्कोण', bgGradient: 'linear-gradient(145deg, #3b82f6 0%, #1e40af 100%)', borderColor: '#bfdbfe', shadowColor: 'rgba(59, 130, 246, 0.5)' },
    { letter: 'स', word: 'सेब', emoji: '🍏', type: 'vyanjan', audioKey: 'vyanjan_31', speechPhrase: 'स से सेब', bgGradient: 'linear-gradient(145deg, #84cc16 0%, #3f6212 100%)', borderColor: '#bef264', shadowColor: 'rgba(132, 204, 22, 0.5)' },
    { letter: 'ह', word: 'हाथी', emoji: '🐘', type: 'vyanjan', audioKey: 'vyanjan_32', speechPhrase: 'ह से हाथी', bgGradient: 'linear-gradient(145deg, #64748b 0%, #334155 100%)', borderColor: '#cbd5e1', shadowColor: 'rgba(100, 116, 139, 0.5)' },

    // संयुक्त व्यंजन (Samyukt Vyanjan)
    { letter: 'क्ष', word: 'क्षत्रिय', emoji: '⚔️', type: 'samyukt', audioKey: 'vyanjan_33', speechPhrase: 'क्ष से क्षत्रिय', bgGradient: 'linear-gradient(145deg, #f59e0b 0%, #b45309 100%)', borderColor: '#fde047', shadowColor: 'rgba(245, 158, 11, 0.5)' },
    { letter: 'त्र', word: 'त्रिशूल', emoji: '🔱', type: 'samyukt', audioKey: 'vyanjan_34', speechPhrase: 'त्र से त्रिशूल', bgGradient: 'linear-gradient(145deg, #06b6d4 0%, #0891b2 100%)', borderColor: '#67e8f9', shadowColor: 'rgba(6, 182, 212, 0.5)' },
    { letter: 'ज्ञ', word: 'ज्ञानी', emoji: '📜', type: 'samyukt', audioKey: 'vyanjan_35', speechPhrase: 'ज्ञ से ज्ञानी', bgGradient: 'linear-gradient(145deg, #8b5cf6 0%, #6d28d9 100%)', borderColor: '#c4b5fd', shadowColor: 'rgba(139, 92, 246, 0.5)' }
  ];

  filteredAkshars: HindiAkshar[] = [];
  activeAkshar!: HindiAkshar;
  selectedCategory: 'all' | 'swar' | 'vyanjan' | 'samyukt' = 'all';
  currentMode: 'learn' | 'quiz' = 'learn';

  // Quiz State
  quizTarget!: HindiAkshar;
  quizOptions: HindiAkshar[] = [];
  quizScore = 0;
  quizFeedback: 'idle' | 'correct' | 'wrong' = 'idle';
  wrongSelectedLetter = '';
  private quizTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    public appNav: AppNavService,
    public sound: SoundService,
    private speech: SpeechService,
    private confetti: ConfettiService
  ) {}

  ngOnInit(): void {
    this.filteredAkshars = this.akshars;
    this.activeAkshar = this.akshars.find(a => a.letter === 'क') || this.akshars[0];
    this.initQuizRound();
  }

  ngOnDestroy(): void {
    this.clearQuizTimer();
  }

  setMode(mode: 'learn' | 'quiz'): void {
    this.sound.playTap();
    this.currentMode = mode;
    if (mode === 'quiz') {
      this.initQuizRound();
      this.speakQuizQuestion();
    } else {
      this.speakAkshar(this.activeAkshar);
    }
  }

  filterCategory(category: 'all' | 'swar' | 'vyanjan' | 'samyukt'): void {
    this.sound.playTap();
    this.selectedCategory = category;
    if (category === 'all') {
      this.filteredAkshars = this.akshars;
    } else if (category === 'vyanjan') {
      this.filteredAkshars = this.akshars.filter(a => a.type === 'vyanjan' || a.type === 'samyukt');
    } else {
      this.filteredAkshars = this.akshars.filter(a => a.type === category);
    }
    if (this.filteredAkshars.length > 0) {
      this.activeAkshar = this.filteredAkshars[0];
    }
  }

  onSelectAkshar(item: HindiAkshar): void {
    this.sound.playPop();
    this.activeAkshar = item;
    this.speakAkshar(item);
  }

  speakAkshar(item: HindiAkshar): void {
    // 🕉️ Real authentic Hindi audio pronunciation
    if (item.audioKey) {
      this.sound.playHindiAudio(item.audioKey);
    } else {
      const list = this.akshars.filter(a => a.type === item.type);
      const idx = list.findIndex(a => a.letter === item.letter);
      if (idx !== -1) {
        this.sound.playHindiPhrase(item.type === 'samyukt' ? 'vyanjan' : item.type, idx);
      }
    }
    setTimeout(() => {
      this.speech.speakHindi(`${item.speechPhrase}!`);
    }, 700);
  }

  prevAkshar(): void {
    const idx = this.filteredAkshars.findIndex(a => a.letter === this.activeAkshar.letter);
    const prevIdx = idx > 0 ? idx - 1 : this.filteredAkshars.length - 1;
    this.onSelectAkshar(this.filteredAkshars[prevIdx]);
  }

  nextAkshar(): void {
    const idx = this.filteredAkshars.findIndex(a => a.letter === this.activeAkshar.letter);
    const nextIdx = (idx + 1) % this.filteredAkshars.length;
    this.onSelectAkshar(this.filteredAkshars[nextIdx]);
  }

  initQuizRound(): void {
    const randomIndex = Math.floor(Math.random() * this.akshars.length);
    this.quizTarget = this.akshars[randomIndex];

    // Pick 2 random wrong options
    const others = this.akshars.filter(a => a.letter !== this.quizTarget.letter);
    const shuffled = others.sort(() => Math.random() - 0.5);
    const wrong1 = shuffled[0];
    const wrong2 = shuffled[1];

    this.quizOptions = [this.quizTarget, wrong1, wrong2].sort(() => Math.random() - 0.5);
    this.quizFeedback = 'idle';
    this.wrongSelectedLetter = '';
  }

  speakQuizQuestion(): void {
    this.speakAkshar(this.quizTarget);
  }

  onQuizOptionSelect(option: HindiAkshar): void {
    if (this.quizFeedback === 'correct') return;

    if (option.letter === this.quizTarget.letter) {
      this.sound.playFanfare();
      this.confetti.fire();
      this.quizFeedback = 'correct';
      this.quizScore++;
      this.speakAkshar(option);

      this.clearQuizTimer();
      this.quizTimer = setTimeout(() => {
        this.initQuizRound();
        this.speakQuizQuestion();
      }, 2500);
    } else {
      this.sound.playBoing();
      this.wrongSelectedLetter = option.letter;
      this.speakAkshar(option);
      setTimeout(() => {
        this.wrongSelectedLetter = '';
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

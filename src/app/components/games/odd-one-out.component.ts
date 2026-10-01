import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppNavService } from '../../core/services/app-nav.service';
import { SoundService } from '../../core/services/sound.service';
import { SpeechService } from '../../core/services/speech.service';
import { ConfettiService } from '../../core/services/confetti.service';
import { ThemeService } from '../../core/services/theme.service';

interface OddOption {
  id: string;
  name: string;
  hindiName: string;
  emoji: string;
  isOdd: boolean;
  reason: string;
  hindiReason: string;
}

interface OddQuestion {
  id: number;
  category: string;
  hindiCategory: string;
  prompt: string;
  hindiPrompt: string;
  options: OddOption[];
}

@Component({
  selector: 'app-odd-one-out',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="odd-viewport">
      <!-- 🌟 Top Header -->
      <header class="odd-header">
        <button 
          type="button" 
          (click)="goBack()" 
          class="nav-circle-btn" 
          title="Back to Hub / वापस जाएँ">
          <span class="btn-icon">🏠</span>
          <span class="btn-text">Hub</span>
        </button>

        <div class="title-pill">
          <span class="title-icon">🔍</span>
          <div class="title-text-col">
            <span class="main-title">Odd One Out</span>
            <span class="sub-title">अलग कौन सा है?</span>
          </div>
        </div>

        <div class="header-right">
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

      <!-- 🎪 Main Question Stage -->
      <main class="odd-content">
        <!-- Progress Bar & Mascot Speech Bubble -->
        <div class="mascot-speech-container">
          <div class="mascot-avatar-box" (click)="repeatPrompt()" title="Tap to listen again!">
            <span class="mascot-avatar animate-bounce">🦉</span>
            <span class="listen-bubble">🔊 Tap to hear</span>
          </div>

          <div class="speech-bubble-card">
            <div class="category-badge">
              <span>{{ currentQuestion.hindiCategory }} • {{ currentQuestion.category }}</span>
              <span class="level-indicator">Q {{ currentIndex + 1 }}/{{ questions.length }}</span>
            </div>
            <p class="speech-prompt-hindi">{{ currentQuestion.hindiPrompt }}</p>
            <p class="speech-prompt-eng">{{ currentQuestion.prompt }}</p>
          </div>
        </div>

        <!-- 4 Candy Option Cards Grid -->
        <div class="options-grid">
          @for (opt of currentQuestion.options; track opt.id) {
            <button 
              type="button" 
              class="option-card"
              [class.card-correct]="selectedOptionId === opt.id && opt.isOdd"
              [class.card-wrong]="selectedOptionId === opt.id && !opt.isOdd"
              [class.card-disabled]="isAnswered && !opt.isOdd"
              (click)="onSelectOption(opt)"
              [title]="opt.hindiName + ' (' + opt.name + ')'">
              
              <div class="card-glow-ring"></div>
              
              <div class="emoji-wrapper">
                <span class="card-emoji">{{ opt.emoji }}</span>
              </div>

              <div class="card-labels">
                <span class="card-hindi">{{ opt.hindiName }}</span>
                <span class="card-eng">{{ opt.name }}</span>
              </div>

              @if (selectedOptionId === opt.id && opt.isOdd) {
                <div class="badge-feedback badge-win animate-pop">
                  <span>⭐ सही जवाब!</span>
                </div>
              } @else if (selectedOptionId === opt.id && !opt.isOdd) {
                <div class="badge-feedback badge-try animate-pop">
                  <span>यह तो दोस्त है! 😊</span>
                </div>
              }
            </button>
          }
        </div>

        <!-- 💡 Explanation & Progression Dock -->
        <div class="action-dock">
          @if (isAnswered && wonCurrent) {
            <div class="celebration-panel animate-pop">
              <div class="explanation-box">
                <span class="explanation-icon">🎉</span>
                <div class="explanation-text">
                  <strong class="expl-hindi">{{ winningExplanationHindi }}</strong>
                  <span class="expl-eng">{{ winningExplanationEng }}</span>
                </div>
              </div>

              <button 
                type="button" 
                class="btn-next-question animate-pop" 
                (click)="nextQuestion()" 
                id="btn-next-odd">
                <span>अगला सवाल ⏭️ NEXT QUESTION</span>
              </button>
            </div>
          } @else if (isAnswered && !wonCurrent) {
            <div class="try-again-panel animate-pop">
              <span class="hint-text">💡 दोबारा कोशिश करो! बाकी 3 चीज़ें एक जैसी हैं, जो सबसे अलग है उसे चुनो! 🌟</span>
            </div>
          }
        </div>
      </main>

      <!-- 🌈 Bottom Footer -->
      <footer class="odd-footer">
        <span class="tip-pill">💡 Tip: टैप करके सुनो और जो सबसे अलग है उसे चुनो!</span>
      </footer>
    </div>
  `,
  styles: [`
    .odd-viewport {
      min-height: 100vh;
      min-height: 100dvh;
      width: 100%;
      background: radial-gradient(circle at 50% 12%, #1e1b4b 0%, #0f172a 60%, #020617 100%);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      user-select: none;
      overflow-x: hidden;
      position: relative;
    }

    /* Top Header */
    .odd-header {
      width: 100%;
      max-width: 900px;
      margin: 0 auto;
      padding: 8px 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
      z-index: 10;
      flex-wrap: nowrap;
    }

    .nav-circle-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 6px 11px;
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.12);
      border: 1.5px solid rgba(255, 255, 255, 0.22);
      color: #ffffff;
      font-size: 0.78rem;
      font-weight: 800;
      cursor: pointer;
      backdrop-filter: blur(10px);
      white-space: nowrap;
      flex-shrink: 0;
      transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .nav-circle-btn:hover {
      background: rgba(255, 255, 255, 0.22);
      transform: translateY(-2px);
    }

    .title-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(255, 255, 255, 0.08);
      border: 1.5px solid rgba(99, 102, 241, 0.4);
      padding: 4px 10px;
      border-radius: 18px;
      backdrop-filter: blur(8px);
      white-space: nowrap;
      min-width: 0;
      flex-shrink: 1;
    }
    .title-icon {
      font-size: 1.15rem;
      filter: drop-shadow(0 2px 6px rgba(99, 102, 241, 0.6));
      flex-shrink: 0;
    }
    .title-text-col {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      line-height: 1.15;
      min-width: 0;
    }
    .main-title {
      font-family: var(--font-display, sans-serif);
      font-size: clamp(0.74rem, 2.6vw, 0.9rem);
      font-weight: 900;
      color: #ffffff;
      letter-spacing: 0.02em;
      margin: 0;
      white-space: nowrap;
    }
    .sub-title {
      font-size: clamp(0.6rem, 1.8vw, 0.7rem);
      font-weight: 800;
      color: #a5b4fc;
      white-space: nowrap;
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
      padding: 5px 9px;
      border-radius: 16px;
      background: rgba(245, 158, 11, 0.2);
      border: 1.5px solid rgba(251, 191, 36, 0.45);
      color: #fde047;
      font-size: 0.78rem;
      font-weight: 900;
      cursor: pointer;
      white-space: nowrap;
    }
    .action-icon-btn {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #ffffff;
      font-size: 0.92rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: transform 0.2s;
      flex-shrink: 0;
    }
    .action-icon-btn:hover {
      transform: scale(1.1);
    }

    /* Main Content */
    .odd-content {
      width: 100%;
      max-width: 820px;
      margin: 0 auto;
      padding: 8px 16px 20px 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      flex: 1;
    }

    /* Mascot Speech Banner */
    .mascot-speech-container {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .mascot-avatar-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      flex-shrink: 0;
    }
    .mascot-avatar {
      font-size: clamp(2.5rem, 6vw, 3.2rem);
      filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.4));
    }
    .listen-bubble {
      font-size: 0.64rem;
      font-weight: 800;
      color: #fde047;
      background: rgba(0, 0, 0, 0.6);
      padding: 2px 6px;
      border-radius: 8px;
      white-space: nowrap;
      margin-top: 2px;
    }
    .speech-bubble-card {
      flex: 1;
      background: rgba(255, 255, 255, 0.08);
      border: 1.5px solid rgba(255, 255, 255, 0.18);
      border-radius: 20px;
      padding: 10px 16px;
      backdrop-filter: blur(12px);
      box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.3);
      position: relative;
    }
    .category-badge {
      display: flex;
      justify-content: space-between;
      font-size: 0.72rem;
      font-weight: 800;
      color: #93c5fd;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-bottom: 4px;
    }
    .level-indicator {
      color: #fde047;
    }
    .speech-prompt-hindi {
      font-size: clamp(0.95rem, 2.8vw, 1.15rem);
      font-weight: 900;
      color: #ffffff;
      margin: 0;
      line-height: 1.25;
    }
    .speech-prompt-eng {
      font-size: clamp(0.78rem, 2vw, 0.88rem);
      font-weight: 700;
      color: #cbd5e1;
      margin: 2px 0 0 0;
    }

    /* 4-Card Options Grid */
    .options-grid {
      width: 100%;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 14px;
      margin-top: 6px;
    }
    @media (min-width: 600px) {
      .options-grid {
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
      }
    }

    .option-card {
      aspect-ratio: 1 / 1.08;
      border-radius: 26px;
      background: linear-gradient(145deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.04) 100%);
      border: 3px solid rgba(255, 255, 255, 0.22);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 12px;
      cursor: pointer;
      position: relative;
      outline: none;
      box-shadow: 0 12px 28px -6px rgba(0, 0, 0, 0.45);
      transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .option-card:hover {
      transform: translateY(-4px) scale(1.04);
      border-color: #a78bfa;
      background: linear-gradient(145deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.08) 100%);
    }
    .option-card:active {
      transform: translateY(2px) scale(0.96);
    }

    .card-correct {
      border-color: #34d399 !important;
      background: linear-gradient(145deg, rgba(16, 185, 129, 0.4) 0%, rgba(5, 150, 105, 0.2) 100%) !important;
      box-shadow: 0 0 35px rgba(52, 211, 153, 0.7) !important;
      transform: scale(1.08) !important;
    }
    .card-wrong {
      border-color: #f87171 !important;
      background: linear-gradient(145deg, rgba(239, 68, 68, 0.3) 0%, rgba(185, 28, 28, 0.15) 100%) !important;
      animation: cardShake 0.45s ease;
    }
    @keyframes cardShake {
      0%, 100% { transform: translateX(0); }
      20% { transform: translateX(-8px) rotate(-4deg); }
      40% { transform: translateX(8px) rotate(4deg); }
      60% { transform: translateX(-6px) rotate(-2deg); }
      80% { transform: translateX(6px) rotate(2deg); }
    }
    .card-disabled {
      opacity: 0.55;
      filter: grayscale(30%);
    }

    .emoji-wrapper {
      width: clamp(65px, 14vw, 85px);
      height: clamp(65px, 14vw, 85px);
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.2);
    }
    .card-emoji {
      font-size: clamp(2.4rem, 6vw, 3.4rem);
      filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.35));
    }

    .card-labels {
      display: flex;
      flex-direction: column;
      align-items: center;
      line-height: 1.15;
    }
    .card-hindi {
      font-size: clamp(0.92rem, 2.4vw, 1.1rem);
      font-weight: 900;
      color: #ffffff;
      letter-spacing: 0.02em;
    }
    .card-eng {
      font-size: clamp(0.72rem, 1.8vw, 0.82rem);
      font-weight: 700;
      color: #94a3b8;
    }

    .badge-feedback {
      position: absolute;
      bottom: -10px;
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 0.72rem;
      font-weight: 900;
      white-space: nowrap;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    }
    .badge-win {
      background: #10b981;
      color: #ffffff;
      border: 1px solid #6ee7b7;
    }
    .badge-try {
      background: #f59e0b;
      color: #ffffff;
      border: 1px solid #fde047;
    }

    /* Action Dock */
    .action-dock {
      width: 100%;
      min-height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 10px;
    }
    .celebration-panel {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }
    .explanation-box {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(16, 185, 129, 0.15);
      border: 1.5px solid rgba(52, 211, 153, 0.4);
      border-radius: 18px;
      padding: 8px 18px;
      backdrop-filter: blur(8px);
      text-align: center;
    }
    .explanation-icon {
      font-size: 1.6rem;
    }
    .explanation-text {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      line-height: 1.2;
    }
    .expl-hindi {
      font-size: 0.95rem;
      color: #34d399;
      font-weight: 900;
    }
    .expl-eng {
      font-size: 0.78rem;
      color: #cbd5e1;
      font-weight: 700;
    }

    .btn-next-question {
      width: 100%;
      max-width: 380px;
      padding: 14px 20px;
      border-radius: 22px;
      border: 2px solid #fde047;
      background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%);
      color: #ffffff;
      font-family: var(--font-display, sans-serif);
      font-size: 1.05rem;
      font-weight: 900;
      letter-spacing: 0.04em;
      cursor: pointer;
      box-shadow: 0 10px 28px -4px rgba(245, 158, 11, 0.7), 0 0 20px rgba(251, 191, 36, 0.4);
      transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .btn-next-question:hover {
      transform: translateY(-3px) scale(1.03);
    }

    .try-again-panel {
      padding: 8px 16px;
      border-radius: 16px;
      background: rgba(245, 158, 11, 0.18);
      border: 1px solid rgba(251, 191, 36, 0.4);
      color: #fde047;
      font-size: 0.82rem;
      font-weight: 800;
      text-align: center;
    }

    /* Footer */
    .odd-footer {
      padding: 10px 16px;
      text-align: center;
    }
    .tip-pill {
      font-size: 0.72rem;
      font-weight: 700;
      color: #94a3b8;
    }

    .animate-pop {
      animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
    }
    @keyframes popIn {
      0% { transform: scale(0.85); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
    .animate-bounce {
      animation: gentleBounce 2.5s ease-in-out infinite;
    }
    @keyframes gentleBounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }
  `]
})
export class OddOneOutComponent implements OnInit {
  totalStars = 28;
  currentIndex = 0;
  selectedOptionId: string | null = null;
  isAnswered = false;
  wonCurrent = false;

  winningExplanationHindi = '';
  winningExplanationEng = '';

  readonly questions: OddQuestion[] = [
    // 1. Animals vs Vehicle
    {
      id: 1,
      category: 'Creatures vs Vehicle',
      hindiCategory: 'जानवर और वाहन',
      prompt: 'Which one is NOT an animal?',
      hindiPrompt: 'इनमें से कौन सा जानवर नहीं है?',
      options: [
        { id: '1a', name: 'Dog', hindiName: 'कुत्ता', emoji: '🐶', isOdd: false, reason: 'Dog is a cute pet animal', hindiReason: 'कुत्ता एक पालतू जानवर है' },
        { id: '1b', name: 'Cat', hindiName: 'बिल्ली', emoji: '🐱', isOdd: false, reason: 'Cat is an animal', hindiReason: 'बिल्ली एक जानवर है' },
        { id: '1c', name: 'Bunny', hindiName: 'खरगोश', emoji: '🐰', isOdd: false, reason: 'Bunny is a fluffy animal', hindiReason: 'खरगोश एक जानवर है' },
        { id: '1d', name: 'Car', hindiName: 'कार', emoji: '🚗', isOdd: true, reason: 'Car is a vehicle with wheels, not an animal!', hindiReason: 'कार एक गाड़ी (वाहन) है, जानवर नहीं!' }
      ]
    },
    // 2. Fruits vs Animal
    {
      id: 2,
      category: 'Fruits vs Animal',
      hindiCategory: 'फल और शेर',
      prompt: 'Which one is NOT a fruit?',
      hindiPrompt: 'इनमें से कौन सा फल नहीं है?',
      options: [
        { id: '2a', name: 'Apple', hindiName: 'सेब', emoji: '🍎', isOdd: false, reason: 'Apple is a tasty fruit', hindiReason: 'सेब एक मीठा फल है' },
        { id: '2b', name: 'Banana', hindiName: 'केला', emoji: '🍌', isOdd: false, reason: 'Banana is a fruit', hindiReason: 'केला एक फल है' },
        { id: '2c', name: 'Lion', hindiName: 'शेर', emoji: '🦁', isOdd: true, reason: 'Lion is a brave animal king, not a fruit!', hindiReason: 'शेर जंगल का राजा है, कोई फल नहीं!' },
        { id: '2d', name: 'Grapes', hindiName: 'अंगूर', emoji: '🍇', isOdd: false, reason: 'Grapes are juicy fruits', hindiReason: 'अंगूर एक फल है' }
      ]
    },
    // 3. Flying Birds vs Elephant
    {
      id: 3,
      category: 'Birds vs Heavy Animal',
      hindiCategory: 'पक्षी और हाथी',
      prompt: 'Which one CANNOT fly in the sky?',
      hindiPrompt: 'इनमें से कौन आसमान में नहीं उड़ सकता?',
      options: [
        { id: '3a', name: 'Pigeon', hindiName: 'कबूतर', emoji: '🕊️', isOdd: false, reason: 'Pigeon flies in the sky', hindiReason: 'कबूतर आसमान में उड़ता है' },
        { id: '3b', name: 'Parrot', hindiName: 'तोता', emoji: '🦜', isOdd: false, reason: 'Parrot has wings to fly', hindiReason: 'तोता उड़ता है' },
        { id: '3c', name: 'Elephant', hindiName: 'हाथी', emoji: '🐘', isOdd: true, reason: 'Elephant is huge and walks on ground!', hindiReason: 'हाथी ज़मीन पर चलता है, उड़ नहीं सकता!' },
        { id: '3d', name: 'Eagle', hindiName: 'चील', emoji: '🦅', isOdd: false, reason: 'Eagle soars high', hindiReason: 'चील बहुत ऊँचा उड़ती है' }
      ]
    },
    // 4. Sea Animals vs Monkey
    {
      id: 4,
      category: 'Water Animals vs Monkey',
      hindiCategory: 'जलचर और बंदर',
      prompt: 'Which one does NOT live in water?',
      hindiPrompt: 'इनमें से कौन पानी में नहीं रहता?',
      options: [
        { id: '4a', name: 'Fish', hindiName: 'मछली', emoji: '🐟', isOdd: false, reason: 'Fish swims in water', hindiReason: 'मछली पानी में तैरती है' },
        { id: '4b', name: 'Dolphin', hindiName: 'डॉल्फिन', emoji: '🐬', isOdd: false, reason: 'Dolphin lives in the ocean', hindiReason: 'डॉल्फिन समुद्र में रहती है' },
        { id: '4c', name: 'Octopus', hindiName: 'ऑक्टोपस', emoji: '🐙', isOdd: false, reason: 'Octopus lives underwater', hindiReason: 'ऑक्टोपस पानी में रहता है' },
        { id: '4d', name: 'Monkey', hindiName: 'बंदर', emoji: '🐒', isOdd: true, reason: 'Monkey jumps on trees!', hindiReason: 'बंदर पेड़ों पर कूदता है, पानी में नहीं रहता!' }
      ]
    },
    // 5. Yummy Foods vs Soccer Ball
    {
      id: 5,
      category: 'Food vs Toy',
      hindiCategory: 'खाना और खिलौना',
      prompt: 'Which one is NOT food to eat?',
      hindiPrompt: 'इनमें से किसे हम खा नहीं सकते?',
      options: [
        { id: '5a', name: 'Pizza', hindiName: 'पिज़्ज़ा', emoji: '🍕', isOdd: false, reason: 'Pizza is delicious food', hindiReason: 'पिज़्ज़ा खाया जाता है' },
        { id: '5b', name: 'Soccer Ball', hindiName: 'फुटबॉल', emoji: '⚽', isOdd: true, reason: 'Soccer Ball is for kicking and playing!', hindiReason: 'फुटबॉल खेलने का खिलौना है, खाने की चीज़ नहीं!' },
        { id: '5c', name: 'Ice Cream', hindiName: 'आइसक्रीम', emoji: '🍦', isOdd: false, reason: 'Ice cream is sweet food', hindiReason: 'आइसक्रीम खाई जाती है' },
        { id: '5d', name: 'Burger', hindiName: 'बर्गर', emoji: '🍔', isOdd: false, reason: 'Burger is food', hindiReason: 'बर्गर खाया जाता है' }
      ]
    },
    // 6. Healthy Veggies vs Birthday Cake
    {
      id: 6,
      category: 'Vegetables vs Sweet Cake',
      hindiCategory: 'सब्जियां और केक',
      prompt: 'Which one is a sweet dessert, NOT a vegetable?',
      hindiPrompt: 'इनमें से कौन सी मीठी मिठाई (केक) है, सब्ज़ी नहीं?',
      options: [
        { id: '6a', name: 'Carrot', hindiName: 'गाजर', emoji: '🥕', isOdd: false, reason: 'Carrot is an orange vegetable', hindiReason: 'गाजर एक सब्जी है' },
        { id: '6b', name: 'Broccoli', hindiName: 'ब्रोकोली', emoji: '🥦', isOdd: false, reason: 'Broccoli is a green vegetable', hindiReason: 'ब्रोकोली एक हरी सब्जी है' },
        { id: '6c', name: 'Cake', hindiName: 'केक', emoji: '🎂', isOdd: true, reason: 'Cake is a sweet celebration dessert!', hindiReason: 'केक मीठा जन्मदिन का पकवान है, सब्ज़ी नहीं!' },
        { id: '6d', name: 'Corn', hindiName: 'भुट्टा/मक्का', emoji: '🌽', isOdd: false, reason: 'Corn is a vegetable', hindiReason: 'मक्का एक अनाज/सब्जी है' }
      ]
    },
    // 7. Sky Objects vs Chair
    {
      id: 7,
      category: 'Sky vs Furniture',
      hindiCategory: 'आसमान और कुर्सी',
      prompt: 'Which one is NOT found in the sky?',
      hindiPrompt: 'इनमें से कौन आसमान में नहीं होता?',
      options: [
        { id: '7a', name: 'Sun', hindiName: 'सूरज', emoji: '☀️', isOdd: false, reason: 'Sun shines in the sky', hindiReason: 'सूरज आसमान में चमकता है' },
        { id: '7b', name: 'Star', hindiName: 'तारा', emoji: '🌟', isOdd: false, reason: 'Stars twinkle in the sky', hindiReason: 'तारे रात में चमकते हैं' },
        { id: '7c', name: 'Chair', hindiName: 'कुर्सी', emoji: '🪑', isOdd: true, reason: 'Chair is in our room to sit on!', hindiReason: 'कुर्सी कमरे में बैठने के लिए है, आसमान में नहीं!' },
        { id: '7d', name: 'Moon', hindiName: 'चाँद', emoji: '🌙', isOdd: false, reason: 'Moon glows in the sky', hindiReason: 'चाँद आसमान में रहता है' }
      ]
    },
    // 8. Clothes vs Smartphone
    {
      id: 8,
      category: 'Clothes vs Phone',
      hindiCategory: 'कपड़े और फोन',
      prompt: 'Which one do you NOT wear as clothes?',
      hindiPrompt: 'इनमें से किसे कपड़े की तरह पहना नहीं जाता?',
      options: [
        { id: '8a', name: 'T-Shirt', hindiName: 'टी-शर्ट', emoji: '👕', isOdd: false, reason: 'T-shirt is worn', hindiReason: 'टी-शर्ट पहनी जाती है' },
        { id: '8b', name: 'Pants', hindiName: 'पैंट', emoji: '👖', isOdd: false, reason: 'Pants are worn', hindiReason: 'पैंट पहनी जाती है' },
        { id: '8c', name: 'Mobile', hindiName: 'मोबाइल', emoji: '📱', isOdd: true, reason: 'Phone is a gadget to call and play!', hindiReason: 'मोबाइल फोन बात करने के लिए है, पहना नहीं जाता!' },
        { id: '8d', name: 'Dress', hindiName: 'फ्रॉक/ड्रेस', emoji: '👗', isOdd: false, reason: 'Dress is worn', hindiReason: 'ड्रेस पहनी जाती है' }
      ]
    },
    // 9. Musical Instruments vs Sandwich
    {
      id: 9,
      category: 'Music vs Food',
      hindiCategory: 'संगीत और सैंडविच',
      prompt: 'Which one CANNOT play music?',
      hindiPrompt: 'इनमें से कौन संगीत (धुन) नहीं बजा सकता?',
      options: [
        { id: '9a', name: 'Guitar', hindiName: 'गिटार', emoji: '🎸', isOdd: false, reason: 'Guitar plays tunes', hindiReason: 'गिटार से संगीत बजता है' },
        { id: '9b', name: 'Sandwich', hindiName: 'सैंडविच', emoji: '🥪', isOdd: true, reason: 'Sandwich is yummy food to eat!', hindiReason: 'सैंडविच खाने की चीज़ है, बजने वाला वाद्य नहीं!' },
        { id: '9c', name: 'Piano', hindiName: 'पियानो', emoji: '🎹', isOdd: false, reason: 'Piano plays beautiful notes', hindiReason: 'पियानो से धुन बजती है' },
        { id: '9d', name: 'Drum', hindiName: 'ढोलक/ड्रम', emoji: '🥁', isOdd: false, reason: 'Drum goes boom-boom', hindiReason: 'ड्रम से आवाज़ आती है' }
      ]
    },
    // 10. Water Vehicles vs Helicopter
    {
      id: 10,
      category: 'Water Boats vs Flying Copter',
      hindiCategory: 'नाव और हेलिकॉप्टर',
      prompt: 'Which one flies in air, NOT sailing in water?',
      hindiPrompt: 'इनमें से कौन हवा में उड़ता है, पानी में नहीं तैरता?',
      options: [
        { id: '10a', name: 'Big Ship', hindiName: 'जहाज़', emoji: '🚢', isOdd: false, reason: 'Ship floats in water', hindiReason: 'पानी का जहाज़ पानी में चलता है' },
        { id: '10b', name: 'Sailboat', hindiName: 'नाव', emoji: '⛵', isOdd: false, reason: 'Boat sails on water', hindiReason: 'नाव पानी पर चलती है' },
        { id: '10c', name: 'Speedboat', hindiName: 'स्पीडबोट', emoji: '🚤', isOdd: false, reason: 'Speedboat zooms on water', hindiReason: 'बोट पानी में चलती है' },
        { id: '10d', name: 'Helicopter', hindiName: 'हेलिकॉप्टर', emoji: '🚁', isOdd: true, reason: 'Helicopter flies high in the air!', hindiReason: 'हेलिकॉप्टर आसमान में उड़ता है, पानी में नहीं!' }
      ]
    }
  ];

  get currentQuestion(): OddQuestion {
    return this.questions[this.currentIndex];
  }

  constructor(
    public appNav: AppNavService,
    public sound: SoundService,
    public themeService: ThemeService,
    private speech: SpeechService,
    private confetti: ConfettiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const savedStars = localStorage.getItem('toddler_total_stars');
    if (savedStars) {
      this.totalStars = parseInt(savedStars, 10) || 28;
    }
    setTimeout(() => {
      this.speakCurrentQuestion();
      this.cdr.detectChanges();
    }, 400);
  }

  repeatPrompt(): void {
    this.sound.playGiggle();
    this.speakCurrentQuestion();
  }

  speakCurrentQuestion(): void {
    this.speech.speakHindi(this.currentQuestion.hindiPrompt);
  }

  onSelectOption(opt: OddOption): void {
    if (this.isAnswered && this.wonCurrent) return;

    this.selectedOptionId = opt.id;
    this.isAnswered = true;

    if (opt.isOdd) {
      this.wonCurrent = true;
      this.sound.playFanfare();
      this.confetti.fire();

      this.winningExplanationHindi = opt.hindiReason;
      this.winningExplanationEng = opt.reason;

      this.totalStars += 1;
      localStorage.setItem('toddler_total_stars', this.totalStars.toString());

      this.speech.speakHindi(`शाबाश! बिल्कुल सही जवाब! ${opt.hindiReason}`);
      this.cdr.detectChanges();
    } else {
      this.wonCurrent = false;
      this.sound.playBoing();
      this.speech.speakHindi('अरे नहीं! यह तो दोस्त है, जो सबसे अलग है उसे चुनो!');
      this.cdr.detectChanges();
    }
  }

  nextQuestion(): void {
    this.sound.playSuccess();
    this.confetti.fire();
    this.selectedOptionId = null;
    this.isAnswered = false;
    this.wonCurrent = false;

    this.currentIndex = (this.currentIndex + 1) % this.questions.length;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.speakCurrentQuestion();
      this.cdr.detectChanges();
    }, 300);
  }

  onStarClick(): void {
    this.sound.playSuccess();
    this.confetti.fire();
    this.speech.speakClue(`You have ${this.totalStars} stars! Wonderful!`);
  }

  goBack(): void {
    this.sound.playTap();
    this.appNav.goToHub();
  }
}

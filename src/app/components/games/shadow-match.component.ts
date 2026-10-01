import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppNavService } from '../../core/services/app-nav.service';
import { SoundService } from '../../core/services/sound.service';
import { SpeechService } from '../../core/services/speech.service';
import { ConfettiService } from '../../core/services/confetti.service';
import { ThemeService } from '../../core/services/theme.service';

interface ShadowItem {
  id: string;
  name: string;
  hindiName: string;
  emoji: string;
  soundKey: string;
  isMatched: boolean;
}

interface ShadowPuzzleSet {
  id: number;
  category: string;
  hindiCategory: string;
  items: ShadowItem[];
}

@Component({
  selector: 'app-shadow-match',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="shadow-viewport">
      <!-- 🌟 Top Header Bar -->
      <header class="shadow-header">
        <button 
          type="button" 
          (click)="goBack()" 
          class="nav-circle-btn" 
          title="Back to Hub / वापस जाएँ">
          <span class="btn-icon">🏠</span>
          <span class="btn-text">Hub</span>
        </button>

        <div class="title-pill">
          <span class="title-icon">👥</span>
          <div class="title-text-col">
            <span class="main-title">Shadow Match</span>
            <span class="sub-title">परछाई पहचानो</span>
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

      <!-- 🎪 Main Puzzle Content Stage -->
      <main class="shadow-content">
        <!-- Progress Bar & Prompt Card -->
        <div class="stage-banner">
          <div class="banner-badge">
            <span>{{ currentSet.hindiCategory }} • {{ currentSet.category }}</span>
            <span class="badge-stage">Set {{ currentSetIndex + 1 }}/{{ puzzleSets.length }}</span>
          </div>
          <h2 class="prompt-heading">सही चित्र को उसकी काली परछाई से मिलाओ! 🌟</h2>
          <p class="prompt-sub">Match each colorful buddy with its dark silhouette shadow!</p>
        </div>

        <!-- 1. Top Shelf: Colorful Buddies to Pick -->
        <div class="items-shelf-stage">
          <span class="shelf-label">👆 Tap a Buddy • एक दोस्त चुनो:</span>
          <div class="items-row">
            @for (item of currentSet.items; track item.id) {
              <button 
                type="button" 
                class="buddy-card"
                [class.buddy-selected]="selectedItemId === item.id"
                [class.buddy-matched]="item.isMatched"
                (click)="selectBuddyItem(item)"
                [disabled]="item.isMatched"
                [title]="item.hindiName + ' (' + item.name + ')'">
                
                <span class="card-emoji animate-bounce">{{ item.emoji }}</span>
                <span class="card-name">{{ item.hindiName }}</span>
                
                @if (item.isMatched) {
                  <span class="matched-star animate-pop">⭐</span>
                }
              </button>
            }
          </div>
        </div>

        <!-- 2. Bottom Shelf: Dark Silhouette Shadows -->
        <div class="shadows-stage">
          <span class="shelf-label">👥 Tap its Matching Shadow • उसकी परछाई पर टैप करो:</span>
          <div class="shadows-row">
            @for (slot of shuffledSlots; track slot.id) {
              <button 
                type="button" 
                class="shadow-card"
                [class.shadow-revealed]="slot.isMatched"
                [class.shadow-target]="selectedItemId !== null && !slot.isMatched"
                (click)="matchWithShadow(slot)"
                [title]="slot.isMatched ? slot.name : 'Unknown Shadow'">
                
                <div class="silhouette-box" [class.silhouette-box-matched]="slot.isMatched">
                  <span 
                    class="silhouette-emoji"
                    [class.silhouette-dark]="!slot.isMatched"
                    [class.silhouette-vivid]="slot.isMatched">
                    {{ slot.emoji }}
                  </span>
                </div>

                <div class="shadow-footer">
                  @if (slot.isMatched) {
                    <span class="revealed-name animate-pop">{{ slot.hindiName }} ✅</span>
                  } @else {
                    <span class="mystery-name">❓ परछाई</span>
                  }
                </div>
              </button>
            }
          </div>
        </div>

        <!-- 💡 Victory & Next Puzzle Dock -->
        <div class="action-dock">
          @if (isCurrentSetComplete) {
            <div class="set-completed-banner animate-pop">
              <div class="completed-info">
                <span class="completed-icon">🏆</span>
                <div class="completed-text">
                  <h3 class="win-title">अरे वाह! सभी परछाइयाँ मिल गईं! 🎉</h3>
                  <span class="win-sub">All shadows matched! +3 Stars awarded!</span>
                </div>
              </div>

              <button 
                type="button" 
                class="btn-next-puzzle animate-pop" 
                (click)="nextPuzzleSet()" 
                id="btn-next-shadow">
                <span>अगली परछाई पहेली ⏭️ NEXT PUZZLE</span>
              </button>
            </div>
          } @else if (selectedItemId !== null) {
            <div class="selection-hint-pill animate-pop">
              <span>👉 अब नीचे उसकी काली परछाई पर टैप करो! (Tap matching shadow)</span>
            </div>
          }
        </div>
      </main>

      <!-- Bottom Ground Footer -->
      <footer class="shadow-footer-bar">
        <span class="footer-tip">💡 Tip: चित्र चुनकर उसकी परछाई पर टैप करो!</span>
      </footer>
    </div>
  `,
  styles: [`
    .shadow-viewport {
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

    /* Top Bar */
    .shadow-header {
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
      border: 1.5px solid rgba(168, 85, 247, 0.35);
      padding: 4px 10px;
      border-radius: 18px;
      backdrop-filter: blur(8px);
      white-space: nowrap;
      min-width: 0;
      flex-shrink: 1;
    }
    .title-icon {
      font-size: 1.15rem;
      filter: drop-shadow(0 2px 6px rgba(168, 85, 247, 0.6));
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
      color: #c084fc;
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
      font-size: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: transform 0.2s;
    }
    .action-icon-btn:hover {
      transform: scale(1.1);
    }

    /* Content Stage */
    .shadow-content {
      width: 100%;
      max-width: 840px;
      margin: 0 auto;
      padding: 8px 16px 20px 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      flex: 1;
    }

    .stage-banner {
      width: 100%;
      background: rgba(255, 255, 255, 0.07);
      border: 1.5px solid rgba(255, 255, 255, 0.18);
      border-radius: 20px;
      padding: 12px 18px;
      text-align: center;
      backdrop-filter: blur(10px);
    }
    .banner-badge {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      padding: 3px 12px;
      border-radius: 14px;
      background: rgba(168, 85, 247, 0.2);
      border: 1px solid rgba(192, 132, 252, 0.4);
      color: #e9d5ff;
      font-size: 0.74rem;
      font-weight: 800;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    .badge-stage {
      color: #fde047;
    }
    .prompt-heading {
      font-family: var(--font-display, sans-serif);
      font-size: clamp(1rem, 3vw, 1.25rem);
      font-weight: 900;
      color: #ffffff;
      margin: 0;
    }
    .prompt-sub {
      font-size: clamp(0.78rem, 2vw, 0.88rem);
      font-weight: 700;
      color: #cbd5e1;
      margin: 3px 0 0 0;
    }

    /* Shelves & Cards */
    .items-shelf-stage, .shadows-stage {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }
    .shelf-label {
      font-size: 0.78rem;
      font-weight: 800;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .items-row, .shadows-row {
      width: 100%;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
    }

    .buddy-card {
      aspect-ratio: 1 / 1.05;
      border-radius: 24px;
      background: linear-gradient(145deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%);
      border: 3px solid rgba(255, 255, 255, 0.25);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 10px;
      cursor: pointer;
      position: relative;
      outline: none;
      box-shadow: 0 10px 24px -4px rgba(0, 0, 0, 0.4);
      transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .buddy-card:hover {
      transform: translateY(-4px) scale(1.05);
      border-color: #38bdf8;
    }
    .buddy-selected {
      border-color: #38bdf8 !important;
      background: linear-gradient(145deg, rgba(56, 189, 248, 0.4) 0%, rgba(14, 165, 233, 0.15) 100%) !important;
      box-shadow: 0 0 30px rgba(56, 189, 248, 0.8) !important;
      transform: scale(1.08) !important;
    }
    .buddy-matched {
      opacity: 0.45;
      filter: grayscale(40%);
      cursor: default;
    }
    .matched-star {
      position: absolute;
      top: 6px;
      right: 8px;
      font-size: 1.2rem;
    }

    .card-emoji {
      font-size: clamp(2.4rem, 6.5vw, 3.4rem);
      filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.35));
    }
    .card-name {
      font-size: clamp(0.85rem, 2.2vw, 1rem);
      font-weight: 900;
      color: #ffffff;
    }

    /* Silhouette Shadow Cards */
    .shadow-card {
      aspect-ratio: 1 / 1.12;
      border-radius: 24px;
      background: linear-gradient(145deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.06) 100%);
      border: 3px dashed rgba(251, 191, 36, 0.7);
      backdrop-filter: blur(12px);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 10px 8px;
      cursor: pointer;
      position: relative;
      outline: none;
      box-shadow: 0 10px 24px -4px rgba(0, 0, 0, 0.45);
      transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .shadow-card:hover {
      transform: translateY(-3px) scale(1.04);
      border-color: #fde047;
    }
    .shadow-target {
      border-color: #fde047 !important;
      box-shadow: 0 0 25px rgba(253, 224, 71, 0.6) !important;
      animation: targetPulse 1.6s infinite;
    }
    @keyframes targetPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.04); box-shadow: 0 0 28px rgba(253, 224, 71, 0.75); }
    }
    .shadow-revealed {
      border-style: solid !important;
      border-color: #34d399 !important;
      background: linear-gradient(145deg, rgba(16, 185, 129, 0.25) 0%, rgba(5, 150, 105, 0.1) 100%) !important;
      box-shadow: 0 0 30px rgba(52, 211, 153, 0.6) !important;
    }

    /* 🔦 High-Contrast Spotlight Disk (Shows Shadow Shape Crystal Clear!) */
    .silhouette-box {
      width: clamp(70px, 16vw, 95px);
      height: clamp(70px, 16vw, 95px);
      border-radius: 50%;
      background: radial-gradient(circle at 40% 35%, #ffffff 0%, #f1f5f9 60%, #cbd5e1 100%);
      border: 3px solid rgba(255, 255, 255, 0.95);
      box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.12), 0 6px 18px rgba(0, 0, 0, 0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      transition: all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .silhouette-box-matched {
      background: radial-gradient(circle at 40% 35%, #ecfdf5 0%, #a7f3d0 60%, #34d399 100%) !important;
      border-color: #34d399 !important;
      box-shadow: 0 0 25px rgba(52, 211, 153, 0.8) !important;
    }

    .silhouette-emoji {
      font-size: clamp(2.4rem, 6.5vw, 3.4rem);
      transition: all 0.4s ease;
      line-height: 1;
    }
    .silhouette-dark {
      filter: brightness(0);
      opacity: 0.96;
      transform: scale(1.06);
    }
    .silhouette-vivid {
      filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.3));
      transform: scale(1.15);
    }

    .shadow-footer {
      font-size: clamp(0.78rem, 2vw, 0.9rem);
      font-weight: 800;
    }
    .mystery-name {
      color: #94a3b8;
    }
    .revealed-name {
      color: #34d399;
    }

    /* Action Dock */
    .action-dock {
      width: 100%;
      min-height: 75px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 8px;
    }
    .selection-hint-pill {
      padding: 8px 18px;
      border-radius: 20px;
      background: rgba(56, 189, 248, 0.2);
      border: 1px solid rgba(56, 189, 248, 0.45);
      color: #7dd3fc;
      font-size: 0.85rem;
      font-weight: 800;
      text-align: center;
    }

    .set-completed-banner {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }
    .completed-info {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 20px;
      border-radius: 20px;
      background: rgba(16, 185, 129, 0.2);
      border: 1.5px solid rgba(52, 211, 153, 0.5);
    }
    .completed-icon {
      font-size: 1.8rem;
    }
    .completed-text {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      line-height: 1.2;
    }
    .win-title {
      font-family: var(--font-display, sans-serif);
      font-size: 1.05rem;
      font-weight: 900;
      color: #34d399;
      margin: 0;
    }
    .win-sub {
      font-size: 0.8rem;
      font-weight: 700;
      color: #cbd5e1;
    }

    .btn-next-puzzle {
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
      box-shadow: 0 10px 28px -4px rgba(245, 158, 11, 0.7);
      transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .btn-next-puzzle:hover {
      transform: translateY(-3px) scale(1.03);
    }

    .shadow-footer-bar {
      padding: 10px 16px;
      text-align: center;
    }
    .footer-tip {
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
      50% { transform: translateY(-6px); }
    }
  `]
})
export class ShadowMatchComponent implements OnInit {
  totalStars = 28;
  currentSetIndex = 0;
  selectedItemId: string | null = null;
  shuffledSlots: ShadowItem[] = [];

  readonly puzzleSets: ShadowPuzzleSet[] = [
    // 1. Safari Animals
    {
      id: 1,
      category: 'Safari Animals',
      hindiCategory: 'जंगली जानवर',
      items: [
        { id: 'lion', name: 'Lion', hindiName: 'शेर 🦁', emoji: '🦁', soundKey: 'lion', isMatched: false },
        { id: 'elephant', name: 'Elephant', hindiName: 'हाथी 🐘', emoji: '🐘', soundKey: 'elephant', isMatched: false },
        { id: 'butterfly', name: 'Butterfly', hindiName: 'तितली 🦋', emoji: '🦋', soundKey: 'giggle', isMatched: false }
      ]
    },
    // 2. Friendly Pets
    {
      id: 2,
      category: 'Cute Pets',
      hindiCategory: 'प्यारे पालतू',
      items: [
        { id: 'puppy', name: 'Puppy', hindiName: 'पिल्ला 🐶', emoji: '🐶', soundKey: 'dog', isMatched: false },
        { id: 'kitty', name: 'Kitty', hindiName: 'बिल्ली 🐱', emoji: '🐱', soundKey: 'cat', isMatched: false },
        { id: 'bunny', name: 'Bunny', hindiName: 'खरगोश 🐰', emoji: '🐰', soundKey: 'boing', isMatched: false }
      ]
    },
    // 3. Zooming Vehicles
    {
      id: 3,
      category: 'Vehicles',
      hindiCategory: 'गाड़ियाँ',
      items: [
        { id: 'car', name: 'Car', hindiName: 'कार 🚗', emoji: '🚗', soundKey: 'car', isMatched: false },
        { id: 'rocket', name: 'Rocket', hindiName: 'रॉकेट 🚀', emoji: '🚀', soundKey: 'fanfare', isMatched: false },
        { id: 'train', name: 'Train', hindiName: 'रेलगाड़ी 🚂', emoji: '🚂', soundKey: 'train', isMatched: false }
      ]
    },
    // 4. Tasty Fruits
    {
      id: 4,
      category: 'Yummy Fruits',
      hindiCategory: 'ताज़े फल',
      items: [
        { id: 'apple', name: 'Apple', hindiName: 'सेब 🍎', emoji: '🍎', soundKey: 'pop', isMatched: false },
        { id: 'banana', name: 'Banana', hindiName: 'केला 🍌', emoji: '🍌', soundKey: 'pop', isMatched: false },
        { id: 'grapes', name: 'Grapes', hindiName: 'अंगूर 🍇', emoji: '🍇', soundKey: 'pop', isMatched: false }
      ]
    },
    // 5. Pond Critters
    {
      id: 5,
      category: 'Pond Critters',
      hindiCategory: 'तालाब के साथी',
      items: [
        { id: 'frog', name: 'Frog', hindiName: 'मेंढक 🐸', emoji: '🐸', soundKey: 'frog', isMatched: false },
        { id: 'duck', name: 'Duck', hindiName: 'बत्तख 🦆', emoji: '🦆', soundKey: 'duck', isMatched: false },
        { id: 'fish', name: 'Fish', hindiName: 'मछली 🐟', emoji: '🐟', soundKey: 'pop', isMatched: false }
      ]
    },
    // 6. Sky Magic
    {
      id: 6,
      category: 'Sky Magic',
      hindiCategory: 'आसमान का जादू',
      items: [
        { id: 'sun', name: 'Sun', hindiName: 'सूरज ☀️', emoji: '☀️', soundKey: 'fanfare', isMatched: false },
        { id: 'moon', name: 'Moon', hindiName: 'चाँद 🌙', emoji: '🌙', soundKey: 'chime', isMatched: false },
        { id: 'star', name: 'Star', hindiName: 'तारा ⭐', emoji: '⭐', soundKey: 'success', isMatched: false }
      ]
    }
  ];

  get currentSet(): ShadowPuzzleSet {
    return this.puzzleSets[this.currentSetIndex];
  }

  get isCurrentSetComplete(): boolean {
    return this.currentSet.items.every(item => item.isMatched);
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
    this.prepareCurrentSet();
  }

  prepareCurrentSet(): void {
    this.selectedItemId = null;
    this.currentSet.items.forEach(i => i.isMatched = false);
    // Shuffle slots for the shadows
    this.shuffledSlots = [...this.currentSet.items].sort(() => Math.random() - 0.5);
    this.cdr.detectChanges();
    setTimeout(() => {
      this.speech.speakHindi(`सही चित्र को उसकी काली परछाई से मिलाओ!`);
      this.cdr.detectChanges();
    }, 400);
  }

  selectBuddyItem(item: ShadowItem): void {
    if (item.isMatched) return;

    this.selectedItemId = item.id;
    this.sound.playTap();
    this.speech.speakHindi(item.hindiName);
    this.cdr.detectChanges();
  }

  matchWithShadow(slot: ShadowItem): void {
    if (!this.selectedItemId || slot.isMatched) return;

    if (this.selectedItemId === slot.id) {
      // Correct Match!
      slot.isMatched = true;
      const matchedBuddy = this.currentSet.items.find(i => i.id === slot.id);
      if (matchedBuddy) {
        matchedBuddy.isMatched = true;
      }

      this.sound.playSuccess();
      this.confetti.fire();

      // Play creature/vehicle audio
      if (slot.soundKey === 'lion') this.sound.playLionRoar();
      else if (slot.soundKey === 'elephant') this.sound.playElephantTrumpet();
      else if (slot.soundKey === 'dog') this.sound.playDogBark();
      else if (slot.soundKey === 'cat') this.sound.playCatMeow();
      else if (slot.soundKey === 'duck') this.sound.playDuckQuack();
      else if (slot.soundKey === 'frog') this.sound.playFrogCroak();
      else if (slot.soundKey === 'car') this.sound.playCarHorn();
      else if (slot.soundKey === 'train') this.sound.playTrainWhistle();
      else this.sound.playPop();

      this.speech.speakHindi(`शाबाश! ${slot.hindiName} की परछाई मिल गई!`);
      this.selectedItemId = null;
      this.cdr.detectChanges();

      // Check if all 3 complete
      if (this.isCurrentSetComplete) {
        this.totalStars += 3;
        localStorage.setItem('toddler_total_stars', this.totalStars.toString());
        this.cdr.detectChanges();
        setTimeout(() => {
          this.sound.playFanfare();
          this.confetti.fire();
          this.speech.speakHindi('वाह! बहुत बढ़िया! आपने सभी परछाइयाँ मिला लीं!');
          this.cdr.detectChanges();
        }, 600);
      }
    } else {
      // Wrong match
      this.sound.playBoing();
      this.speech.speakHindi('यह तो किसी और की परछाई है! दोबारा देखो!');
      this.cdr.detectChanges();
    }
  }

  nextPuzzleSet(): void {
    this.sound.playFanfare();
    this.confetti.fire();
    this.currentSetIndex = (this.currentSetIndex + 1) % this.puzzleSets.length;
    this.prepareCurrentSet();
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

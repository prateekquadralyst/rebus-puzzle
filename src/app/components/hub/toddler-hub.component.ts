import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppNavService } from '../../core/services/app-nav.service';
import { SoundService } from '../../core/services/sound.service';
import { SpeechService } from '../../core/services/speech.service';
import { ConfettiService } from '../../core/services/confetti.service';

interface GameItem {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  badge: string;
  category: 'new' | 'puzzle' | 'fun';
  tag: string;
  bgGradient: string;
  borderColor: string;
  shadowColor: string;
  isNew?: boolean;
}

@Component({
  selector: 'app-toddler-hub',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="hub-viewport">
      <!-- 🌟 Top Header Navigation -->
      <header class="hub-header">
        <button 
          type="button" 
          (click)="goBack()" 
          class="hub-back-btn"
          id="btn-hub-back"
          title="Back to Welcome Wonderland">
          <span class="back-icon">🏠</span>
          <span class="back-text">Home</span>
        </button>

        <div class="hub-title-box">
          <span class="hub-icon">🏰</span>
          <h2 class="hub-heading">Toddler Hub</h2>
        </div>

        <div class="header-right">
          <!-- Star Trophy Pill -->
          <div class="star-milestone-pill" (click)="onStarClick()" title="Total stars collected!">
            <span class="star-pill-icon">⭐</span>
            <span class="star-pill-text">{{ totalStars }}</span>
          </div>

          <!-- Sound Toggle -->
          <button 
            type="button" 
            (click)="sound.toggleMute()" 
            class="hub-sound-btn"
            [title]="sound.isMuted() ? 'Turn Sound On' : 'Turn Sound Off'">
            {{ sound.isMuted() ? '🔇' : '🎵' }}
          </button>
        </div>
      </header>

      <!-- 🎪 Main Hub Content Stage -->
      <main class="hub-content">
        <!-- Compact Friendly Mascot Welcome Banner -->
        <div class="mascot-welcome-banner" (click)="onMascotBannerClick()" title="Tap teddy for giggles!">
          <div class="mascot-banner-left">
            <span class="mascot-banner-emoji animate-bounce">🧸</span>
          </div>
          <div class="mascot-banner-text">
            <div class="banner-badge">✨ TODDLER LEARNING WORLD</div>
            <h3 class="banner-title">What shall we play today?</h3>
          </div>
          <span class="banner-sparkle">🌟</span>
        </div>

        <!-- Category Filter Tabs -->
        <div class="category-tabs-bar">
          <button 
            type="button"
            class="cat-tab-btn"
            [class.cat-active]="activeCategory === 'all'"
            (click)="setCategory('all')">
            <span>🌈 All ({{ games.length }})</span>
          </button>
          <button 
            type="button"
            class="cat-tab-btn"
            [class.cat-active]="activeCategory === 'new'"
            (click)="setCategory('new')">
            <span class="new-dot"></span>
            <span>✨ New ABC & 123 (3)</span>
          </button>
          <button 
            type="button"
            class="cat-tab-btn"
            [class.cat-active]="activeCategory === 'fun'"
            (click)="setCategory('fun')">
            <span>🎈 Fun & Sounds (3)</span>
          </button>
          <button 
            type="button"
            class="cat-tab-btn"
            [class.cat-active]="activeCategory === 'puzzle'"
            (click)="setCategory('puzzle')">
            <span>🧩 Puzzles (3)</span>
          </button>
        </div>

        <!-- 🎮 2-Column Responsive Games Grid (New Games at Top!) -->
        <div class="games-grid">
          @for (game of filteredGames; track game.id) {
            <div 
              class="game-card" 
              [class.game-card-new]="game.isNew"
              [style.background]="game.bgGradient"
              [style.border-color]="game.borderColor"
              [style.box-shadow]="'0 10px 24px -4px ' + game.shadowColor"
              (click)="selectGame(game)">
              
              <!-- Badge -->
              <div class="card-badge" [class.badge-new]="game.isNew">
                {{ game.badge }}
              </div>
              
              <!-- 3D Emoji Icon Box -->
              <div class="card-emoji-box">
                <span class="card-emoji">{{ game.emoji }}</span>
              </div>

              <!-- Card Text Info -->
              <div class="card-info">
                <span class="card-tag">{{ game.tag }}</span>
                <h3 class="card-title">{{ game.title }}</h3>
                <p class="card-sub">{{ game.subtitle }}</p>
              </div>

              <!-- Tactile Play Button -->
              <div class="card-action-cue">
                <button type="button" class="play-pill" [class.play-pill-new]="game.isNew">
                  <span class="play-arrow">▶</span>
                  <span class="play-label">PLAY</span>
                </button>
              </div>
            </div>
          }
        </div>
      </main>

      <!-- Bottom Ground Footer -->
      <footer class="hub-footer">
        <p class="footer-tip">💡 Tip: Tap 🏠 anytime to visit the balloon-popping start screen!</p>
      </footer>
    </div>
  `,
  styles: [`
    .hub-viewport {
      min-height: 100vh;
      min-height: 100dvh;
      width: 100%;
      background: radial-gradient(circle at 50% 10%, #1e1b4b 0%, #0f172a 60%, #030712 100%);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      user-select: none;
      overflow-x: hidden;
    }

    /* Top Bar */
    .hub-header {
      width: 100%;
      max-width: 960px;
      margin: 0 auto;
      padding: 12px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      z-index: 10;
    }

    .hub-back-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 7px 13px;
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
    .hub-back-btn:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-2px);
      color: #ffffff;
    }

    .hub-title-box {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .hub-icon {
      font-size: 20px;
    }
    .hub-heading {
      font-family: var(--font-display);
      font-size: clamp(1.05rem, 3.5vw, 1.35rem);
      font-weight: 900;
      color: #ffffff;
      margin: 0;
      letter-spacing: -0.01em;
      text-shadow: 0 2px 10px rgba(99, 102, 241, 0.4);
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .star-milestone-pill {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 5px 11px;
      border-radius: 18px;
      background: rgba(245, 158, 11, 0.18);
      border: 1.5px solid rgba(251, 191, 36, 0.4);
      color: #fde047;
      font-size: 0.76rem;
      font-weight: 800;
      cursor: pointer;
      backdrop-filter: blur(8px);
      transition: transform 0.2s;
    }
    .star-milestone-pill:hover {
      transform: scale(1.08);
      background: rgba(245, 158, 11, 0.28);
    }

    .hub-sound-btn {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.18);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 17px;
      cursor: pointer;
      backdrop-filter: blur(10px);
      color: #ffffff;
      outline: none;
      transition: all 0.2s;
    }
    .hub-sound-btn:hover {
      transform: scale(1.08);
      background: rgba(255, 255, 255, 0.22);
    }

    /* Content Stage */
    .hub-content {
      flex: 1;
      max-width: 960px;
      width: 100%;
      margin: 0 auto;
      padding: 0 12px 16px 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    /* Welcome Mascot Banner */
    .mascot-welcome-banner {
      width: 100%;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.22) 0%, rgba(168, 85, 247, 0.18) 100%);
      border: 1.5px solid rgba(167, 139, 250, 0.35);
      border-radius: 18px;
      padding: 10px 14px;
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
      cursor: pointer;
      backdrop-filter: blur(12px);
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
      transition: transform 0.2s;
    }
    .mascot-welcome-banner:hover {
      transform: translateY(-2px);
      border-color: rgba(253, 224, 71, 0.6);
    }

    .mascot-banner-left {
      font-size: 2rem;
      line-height: 1;
      filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.35));
    }

    .mascot-banner-text {
      flex: 1;
      text-align: left;
    }

    .banner-badge {
      font-size: 0.62rem;
      font-weight: 900;
      color: #fde047;
      letter-spacing: 0.08em;
    }

    .banner-title {
      font-family: var(--font-display);
      font-size: clamp(0.92rem, 3vw, 1.15rem);
      font-weight: 900;
      color: #ffffff;
      margin: 2px 0 0 0;
    }

    .banner-sparkle {
      font-size: 1.3rem;
      animation: twinkle 2s ease-in-out infinite;
    }

    /* Category Filter Tabs */
    .category-tabs-bar {
      display: flex;
      gap: 6px;
      overflow-x: auto;
      width: 100%;
      padding: 2px 2px 10px 2px;
      scrollbar-width: none;
    }
    .category-tabs-bar::-webkit-scrollbar {
      display: none;
    }

    .cat-tab-btn {
      padding: 6px 13px;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.16);
      color: #cbd5e1;
      font-size: 0.74rem;
      font-weight: 800;
      cursor: pointer;
      backdrop-filter: blur(8px);
      white-space: nowrap;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      transition: all 0.2s;
    }
    .cat-tab-btn:hover {
      background: rgba(255, 255, 255, 0.16);
      transform: translateY(-2px);
      color: #ffffff;
    }
    .cat-active {
      background: #6366f1 !important;
      border-color: #818cf8 !important;
      color: #ffffff !important;
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
    }
    .new-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #fde047;
      box-shadow: 0 0 6px #fde047;
    }

    /* 🎮 2-Column Responsive Games Grid */
    .games-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      width: 100%;
    }

    @media (min-width: 680px) {
      .games-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 14px;
      }
    }

    @media (min-width: 960px) {
      .games-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
      }
    }

    /* Game Card */
    .game-card {
      position: relative;
      border-radius: 20px;
      border: 2px solid;
      padding: 12px 10px 10px 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      cursor: pointer;
      backdrop-filter: blur(12px);
      transition: all 0.22s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .game-card:hover {
      transform: translateY(-4px) scale(1.025);
    }
    .game-card:active {
      transform: scale(0.96);
    }

    /* Glowing border for new cards */
    .game-card-new {
      border-width: 2.5px;
    }

    .card-badge {
      position: absolute;
      top: 8px;
      right: 8px;
      font-size: 0.58rem;
      font-weight: 800;
      padding: 2px 7px;
      border-radius: 10px;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.25);
      color: #ffffff;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .badge-new {
      background: linear-gradient(135deg, #f59e0b, #ef4444) !important;
      border-color: #fde047 !important;
      color: #ffffff !important;
      box-shadow: 0 2px 8px rgba(245, 158, 11, 0.6);
      font-weight: 900;
      animation: pulseGlow 2s infinite;
    }

    .card-emoji-box {
      width: clamp(52px, 14vw, 64px);
      height: clamp(52px, 14vw, 64px);
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.18);
      border: 1.5px solid rgba(255, 255, 255, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 2px;
      margin-bottom: 8px;
      box-shadow: 0 6px 14px rgba(0, 0, 0, 0.25);
      transition: transform 0.2s;
    }
    .game-card:hover .card-emoji-box {
      transform: scale(1.1) rotate(6deg);
    }

    .card-emoji {
      font-size: clamp(28px, 8vw, 36px);
      line-height: 1;
      filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.35));
    }

    .card-info {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      margin-bottom: 8px;
      width: 100%;
      flex: 1;
    }

    .card-tag {
      font-size: 0.6rem;
      font-weight: 800;
      color: #fde047;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 95%;
    }

    .card-title {
      font-family: var(--font-display);
      font-size: clamp(0.88rem, 2.8vw, 1.08rem);
      font-weight: 900;
      color: #ffffff;
      letter-spacing: -0.01em;
      margin: 0;
      line-height: 1.2;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    .card-sub {
      font-size: 0.66rem;
      color: rgba(255, 255, 255, 0.85);
      margin-top: 2px;
      line-height: 1.25;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      max-width: 95%;
    }

    /* Play Button Pill */
    .card-action-cue {
      width: 100%;
      display: flex;
      justify-content: center;
      margin-top: auto;
    }

    .play-pill {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 6px 18px;
      border-radius: 16px;
      background: #ffffff;
      border: none;
      color: #0f172a;
      font-family: var(--font-display);
      font-size: 0.74rem;
      font-weight: 900;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
      letter-spacing: 0.04em;
      cursor: pointer;
      transition: all 0.2s;
    }
    .game-card:hover .play-pill {
      transform: scale(1.08);
      background: #fde047;
      color: #0f172a;
      box-shadow: 0 6px 14px rgba(253, 224, 71, 0.5);
    }

    .play-pill-new {
      background: #ffffff;
      color: #b45309;
      box-shadow: 0 4px 12px rgba(253, 224, 71, 0.4);
    }

    .play-arrow {
      font-size: 10px;
    }

    /* Footer */
    .hub-footer {
      text-align: center;
      padding: 10px 16px 16px 16px;
      color: #64748b;
      font-size: 0.7rem;
    }

    /* Keyframes */
    @keyframes pulseGlow {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.06); }
    }

    @keyframes twinkle {
      0%, 100% { opacity: 0.3; transform: scale(0.85); }
      50% { opacity: 1; transform: scale(1.2) rotate(15deg); }
    }
  `]
})
export class ToddlerHubComponent implements OnInit {
  // ⭐ Newly Added Games Placed First at the Top with Rich Saturated Vibrant Colors!
  readonly games: GameItem[] = [
    // 1. 🔤 ABCD Alphabet Safari (New!)
    {
      id: 'alphabet',
      title: 'ABCD Safari',
      subtitle: 'A to Z letters, phonics sounds & animals!',
      emoji: '🔤',
      badge: '✨ New!',
      category: 'new',
      tag: 'Phonics & A-Z',
      bgGradient: 'linear-gradient(145deg, #4f46e5 0%, #7c3aed 100%)',
      borderColor: '#a78bfa',
      shadowColor: 'rgba(124, 58, 237, 0.5)',
      isNew: true
    },
    // 2. 🔢 1 2 3 4 Numbers & Counting (New!)
    {
      id: 'numbers',
      title: '1 2 3 4 Counting',
      subtitle: 'Tap & count ducks, balloons & stars!',
      emoji: '🔢',
      badge: '✨ New!',
      category: 'new',
      tag: 'Math & Counting',
      bgGradient: 'linear-gradient(145deg, #059669 0%, #0284c7 100%)',
      borderColor: '#34d399',
      shadowColor: 'rgba(16, 185, 129, 0.5)',
      isNew: true
    },
    // 3. 🕉️ क ख ग घ वर्णमाला मेला (New!)
    {
      id: 'hindi',
      title: 'क ख ग घ वर्णमाला',
      subtitle: 'हिंदी स्वर-व्यंजन सचित्र आवाज़ों के साथ!',
      emoji: '🕉️',
      badge: '✨ New!',
      category: 'new',
      tag: 'हिंदी वर्णमाला',
      bgGradient: 'linear-gradient(145deg, #d97706 0%, #dc2626 100%)',
      borderColor: '#fde047',
      shadowColor: 'rgba(245, 158, 11, 0.5)',
      isNew: true
    },
    // 4. 🎈 Balloon Pop Burst
    {
      id: 'balloon',
      title: 'Balloon Pop',
      subtitle: 'Pop floating balloons with real burst physics!',
      emoji: '🎈',
      badge: 'Popular',
      category: 'fun',
      tag: 'Colors & Motor',
      bgGradient: 'linear-gradient(145deg, #e11d48 0%, #db2777 100%)',
      borderColor: '#fb7185',
      shadowColor: 'rgba(225, 29, 72, 0.45)'
    },
    // 5. 🧩 2-4 Piece Puzzle Snap
    {
      id: 'puzzle',
      title: 'Puzzle Snap',
      subtitle: 'Magnetic snap jigsaws of cute animals!',
      emoji: '🧩',
      badge: 'Popular',
      category: 'puzzle',
      tag: 'Jigsaw Puzzles',
      bgGradient: 'linear-gradient(145deg, #2563eb 0%, #4f46e5 100%)',
      borderColor: '#60a5fa',
      shadowColor: 'rgba(37, 99, 235, 0.45)'
    },
    // 6. 🐮 Animal & Vehicle Sounds
    {
      id: 'sound',
      title: 'Animal Sounds',
      subtitle: '50+ real animal and vehicle sounds quiz!',
      emoji: '🐮',
      badge: 'Sounds',
      category: 'fun',
      tag: 'Soundboard',
      bgGradient: 'linear-gradient(145deg, #059669 0%, #16a34a 100%)',
      borderColor: '#4ade80',
      shadowColor: 'rgba(5, 150, 105, 0.45)'
    },
    // 7. 🔶 Shape & Color Sorter
    {
      id: 'shape',
      title: 'Shape Sorter',
      subtitle: 'Match cute animated cartoon shapes!',
      emoji: '🔶',
      badge: 'Shapes',
      category: 'puzzle',
      tag: 'Colors & Shapes',
      bgGradient: 'linear-gradient(145deg, #db2777 0%, #9333ea 100%)',
      borderColor: '#f472b6',
      shadowColor: 'rgba(219, 39, 119, 0.45)'
    },
    // 8. 🃏 Toddler Memory Flip
    {
      id: 'memory',
      title: 'Memory Match',
      subtitle: 'Find identical cute pairs with instant peek!',
      emoji: '🃏',
      badge: 'Memory',
      category: 'puzzle',
      tag: 'Memory & Pairs',
      bgGradient: 'linear-gradient(145deg, #ea580c 0%, #d97706 100%)',
      borderColor: '#fb923c',
      shadowColor: 'rgba(234, 88, 12, 0.45)'
    },
    // 9. 🔡 Picture-Word Puzzle (Rebus)
    {
      id: 'rebus',
      title: 'Rebus Words',
      subtitle: 'Guess secret words using emoji clues!',
      emoji: '🔡',
      badge: 'Words',
      category: 'fun',
      tag: 'Word Puzzles',
      bgGradient: 'linear-gradient(145deg, #7c3aed 0%, #4338ca 100%)',
      borderColor: '#c084fc',
      shadowColor: 'rgba(124, 58, 237, 0.45)'
    }
  ];

  filteredGames: GameItem[] = [];
  activeCategory: 'all' | 'new' | 'puzzle' | 'fun' = 'all';
  totalStars = 28;

  constructor(
    public appNav: AppNavService,
    public sound: SoundService,
    private speech: SpeechService,
    private confetti: ConfettiService
  ) {}

  ngOnInit(): void {
    this.filteredGames = this.games;
    const savedStars = localStorage.getItem('toddler_total_stars');
    if (savedStars) {
      this.totalStars = parseInt(savedStars, 10) || 28;
    }
  }

  setCategory(category: 'all' | 'new' | 'puzzle' | 'fun'): void {
    this.sound.playTap();
    this.activeCategory = category;
    if (category === 'all') {
      this.filteredGames = this.games;
    } else {
      this.filteredGames = this.games.filter(g => g.category === category);
    }
  }

  selectGame(game: GameItem): void {
    this.sound.playTap();
    this.speech.speakClue(`Playing ${game.title}!`);

    switch (game.id) {
      case 'alphabet':
        this.appNav.goToAlphabet();
        break;
      case 'numbers':
        this.appNav.goToNumbers();
        break;
      case 'hindi':
        this.appNav.goToHindi();
        break;
      case 'balloon':
        this.appNav.goToBalloonPop();
        break;
      case 'puzzle':
        this.appNav.goToPiecePuzzle();
        break;
      case 'sound':
        this.appNav.goToSoundMatcher();
        break;
      case 'shape':
        this.appNav.goToShapeSorter();
        break;
      case 'memory':
        this.appNav.goToMemoryFlip();
        break;
      case 'rebus':
        this.appNav.goToRebus();
        break;
      default:
        this.appNav.goToRebus();
        break;
    }
  }

  onMascotBannerClick(): void {
    this.sound.playGiggle();
    this.confetti.fire();
    this.speech.speakClue('Hehehe! Pick your favorite game and have fun!');
  }

  onStarClick(): void {
    this.sound.playSuccess();
    this.confetti.fire();
    this.speech.speakClue(`You have ${this.totalStars} stars! Keep shining!`);
  }

  goBack(): void {
    this.sound.playTap();
    this.appNav.goToPortal();
  }
}

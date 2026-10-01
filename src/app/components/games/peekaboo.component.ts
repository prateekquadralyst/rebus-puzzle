import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppNavService } from '../../core/services/app-nav.service';
import { SoundService } from '../../core/services/sound.service';
import { SpeechService } from '../../core/services/speech.service';
import { ConfettiService } from '../../core/services/confetti.service';
import { ThemeService } from '../../core/services/theme.service';

interface HidingSpot {
  id: string;
  name: string;
  hindiName: string;
  coverEmoji: string;
  emptyEmoji: string;
  isRevealed: boolean;
  hasAnimal: boolean;
}

interface PeekabooScene {
  id: number;
  title: string;
  hindiTitle: string;
  bgGradient: string;
  animalName: string;
  animalHindi: string;
  animalEmoji: string;
  soundType: 'dog' | 'cat' | 'cow' | 'bird' | 'lion' | 'duck';
  soundClueText: string;
  revealGreeting: string;
  revealGreetingHi: string;
  spots: HidingSpot[];
}

@Component({
  selector: 'app-peekaboo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="peekaboo-viewport" [style.background]="currentScene.bgGradient">
      <!-- 🌟 Top Header Bar -->
      <header class="peekaboo-header">
        <button 
          type="button" 
          (click)="goBack()" 
          class="nav-circle-btn" 
          id="btn-peekaboo-back"
          title="Back to Hub / हब पर वापस">
          <span class="btn-icon">🏠</span>
          <span class="btn-text">Hub</span>
        </button>

        <div class="title-pill">
          <span class="title-icon">🙈</span>
          <div class="title-text-col">
            <span class="main-title">Peekaboo Hide & Seek</span>
            <span class="sub-title">कहाँ छुपा है? / ढूंढो मुझे!</span>
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

      <!-- 🎪 Main Game Stage -->
      <main class="peekaboo-content">
        <!-- Stage Announcement Banner -->
        <div class="stage-banner">
          <div class="banner-badge">
            <span>{{ currentScene.hindiTitle }} • {{ currentScene.title }}</span>
            <span class="badge-stage">Scene {{ currentSceneIndex + 1 }} / {{ scenes.length }}</span>
          </div>

          <h2 class="prompt-heading">
            कहाँ छुपा है {{ currentScene.animalHindi }}? छूकर ढूंढो! 🙈
          </h2>
          <p class="prompt-sub">
            Where is {{ currentScene.animalName }} hiding? Tap a spot to peek!
          </p>

          <!-- 🔊 Sound Clue Button -->
          <button 
            type="button" 
            class="sound-clue-btn"
            (click)="playAnimalClueSound()"
            title="Listen to animal clue!">
            <span class="clue-icon animate-bounce">👂🔊</span>
            <span class="clue-text">आवाज़ सुनो • Listen Clue: <i>"{{ currentScene.soundClueText }}"</i></span>
          </button>
        </div>

        <!-- 🎪 The 3 Hiding Spots -->
        <div class="spots-stage">
          @for (spot of currentScene.spots; track spot.id) {
            <div 
              class="spot-pod"
              [class.spot-opened]="spot.isRevealed"
              [class.spot-found]="spot.isRevealed && spot.hasAnimal"
              (click)="tapSpot(spot)">
              
              <!-- When NOT yet revealed: Floating Wiggling Cover -->
              @if (!spot.isRevealed) {
                <div class="cover-card animate-wiggle">
                  <span class="cover-emoji">{{ spot.coverEmoji }}</span>
                  <span class="spot-title">{{ spot.hindiName }}</span>
                  <span class="tap-hint">Tap me! 👆</span>
                </div>
              } @else {
                <!-- When REVEALED -->
                <div class="revealed-box animate-pop">
                  @if (spot.hasAnimal) {
                    <!-- 🌟 ANIMAL FOUND! PEEKABOO POP-UP! -->
                    <div class="animal-revealed-stage">
                      <div class="peekaboo-badge animate-bounce">
                        🙈 ➡️ 🐶 CUCKOO!
                      </div>
                      <span class="revealed-animal-emoji animate-pop">
                        {{ currentScene.animalEmoji }}
                      </span>
                      <span class="revealed-animal-name">
                        {{ currentScene.animalHindi }} ({{ currentScene.animalName }})
                      </span>
                      <span class="tap-tickle-cue">✨ छुओ मुझे! Tap to tickle! ✨</span>
                    </div>
                  } @else {
                    <!-- EMPTY SPOT! -->
                    <div class="empty-revealed-stage">
                      <span class="empty-emoji">{{ spot.emptyEmoji }}</span>
                      <span class="empty-text">यहाँ कोई नहीं है! Nothing here! 🍃</span>
                    </div>
                  }
                </div>
              }
            </div>
          }
        </div>

        <!-- 🌟 Winner Card when Animal is Found -->
        @if (isCurrentFound) {
          <div class="found-celebration-card animate-pop">
            <div class="celeb-header">
              <span class="celeb-sparkles">🎉🌟🎉</span>
              <h3 class="celeb-title">ढूंढ लिया! You found {{ currentScene.animalName }}!</h3>
              <p class="celeb-sub">{{ currentScene.revealGreetingHi }} • {{ currentScene.revealGreeting }}</p>
            </div>

            <button 
              type="button" 
              class="next-scene-btn animate-bounce"
              (click)="nextScene()">
              <span>अगला खेलें • Next Hide & Seek ➡️</span>
            </button>
          </div>
        }
      </main>
    </div>
  `,
  styles: [`
    .peekaboo-viewport {
      position: fixed;
      inset: 0;
      color: #ffffff;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      overflow-x: hidden;
      font-family: var(--font-body, system-ui, sans-serif);
      z-index: 50;
      user-select: none;
      transition: background 0.5s ease;
    }

    /* 🌟 Header Bar */
    .peekaboo-header {
      width: 100%;
      max-width: 900px;
      margin: 0 auto;
      padding: 8px 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
      position: relative;
      z-index: 30;
      flex-wrap: nowrap;
    }

    .nav-circle-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 5px 10px;
      border-radius: 18px;
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.25);
      color: #ffffff;
      font-size: 0.78rem;
      font-weight: 700;
      cursor: pointer;
      backdrop-filter: blur(10px);
      transition: all 0.2s;
      flex-shrink: 0;
    }
    .nav-circle-btn:hover {
      background: rgba(255, 255, 255, 0.25);
      transform: translateY(-2px);
    }

    .title-pill {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(236, 72, 153, 0.2);
      border: 1.5px solid rgba(244, 114, 182, 0.5);
      padding: 4px 10px;
      border-radius: 20px;
      backdrop-filter: blur(10px);
      min-width: 0;
      flex-shrink: 1;
    }
    .title-icon {
      font-size: 1.3rem;
      line-height: 1;
    }
    .title-text-col {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .main-title {
      font-family: var(--font-display, sans-serif);
      font-size: 0.85rem;
      font-weight: 900;
      color: #fbcfe8;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .sub-title {
      font-size: 0.65rem;
      color: #ffffff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
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
      padding: 4px 8px;
      border-radius: 18px;
      background: rgba(245, 158, 11, 0.2);
      border: 1.5px solid rgba(251, 191, 36, 0.45);
      color: #fde047;
      font-size: 0.76rem;
      font-weight: 800;
      cursor: pointer;
      backdrop-filter: blur(10px);
      flex-shrink: 0;
    }

    .action-icon-btn {
      width: 33px;
      height: 33px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
      cursor: pointer;
      backdrop-filter: blur(10px);
      transition: all 0.2s;
      outline: none;
      color: #ffffff;
      flex-shrink: 0;
      padding: 0;
    }
    .action-icon-btn:hover {
      transform: scale(1.1);
      background: rgba(255, 255, 255, 0.3);
    }

    /* Content Stage */
    .peekaboo-content {
      flex: 1;
      max-width: 800px;
      width: 100%;
      margin: 0 auto;
      padding: 0 12px 18px 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    /* Stage Announcement Banner */
    .stage-banner {
      width: 100%;
      background: rgba(15, 23, 42, 0.65);
      border: 1.5px solid rgba(255, 255, 255, 0.2);
      border-radius: 18px;
      padding: 10px 14px;
      text-align: center;
      backdrop-filter: blur(12px);
      box-shadow: 0 6px 18px rgba(0,0,0,0.3);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }
    .banner-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.68rem;
      font-weight: 800;
      color: #fde047;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .badge-stage {
      padding: 1px 6px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.15);
      color: #ffffff;
    }
    .prompt-heading {
      margin: 0;
      font-family: var(--font-display, sans-serif);
      font-size: clamp(1rem, 3.5vw, 1.35rem);
      font-weight: 900;
      color: #ffffff;
      text-shadow: 0 2px 6px rgba(0,0,0,0.4);
    }
    .prompt-sub {
      margin: 0;
      font-size: clamp(0.74rem, 2.4vw, 0.88rem);
      color: rgba(255, 255, 255, 0.85);
    }

    .sound-clue-btn {
      margin-top: 4px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: 16px;
      background: linear-gradient(135deg, rgba(234, 88, 12, 0.4) 0%, rgba(245, 158, 11, 0.45) 100%);
      border: 1.5px solid rgba(251, 191, 36, 0.6);
      color: #fef08a;
      font-size: 0.78rem;
      font-weight: 800;
      cursor: pointer;
      backdrop-filter: blur(8px);
      box-shadow: 0 3px 10px rgba(0,0,0,0.25);
      transition: all 0.2s;
    }
    .sound-clue-btn:hover {
      transform: scale(1.05);
      background: rgba(245, 158, 11, 0.6);
    }
    .clue-icon {
      font-size: 1rem;
    }

    /* 🎪 The 3 Hiding Spots */
    .spots-stage {
      width: 100%;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-top: 6px;
    }

    .spot-pod {
      background: rgba(15, 23, 42, 0.5);
      border: 2px solid rgba(255, 255, 255, 0.25);
      border-radius: 20px;
      padding: 12px 6px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      min-height: 180px;
      position: relative;
      transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      backdrop-filter: blur(8px);
    }
    .spot-pod:hover {
      transform: translateY(-4px) scale(1.03);
      border-color: #38bdf8;
      background: rgba(56, 189, 248, 0.15);
    }
    .spot-found {
      border-color: #fde047 !important;
      background: linear-gradient(135deg, rgba(234, 179, 8, 0.25) 0%, rgba(245, 158, 11, 0.35) 100%) !important;
      box-shadow: 0 0 25px rgba(253, 224, 71, 0.5) !important;
    }

    /* Cover Card */
    .cover-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      text-align: center;
    }
    .cover-emoji {
      font-size: clamp(3rem, 9vw, 4.2rem);
      line-height: 1;
      filter: drop-shadow(0 6px 12px rgba(0,0,0,0.4));
    }
    .spot-title {
      font-family: var(--font-display, sans-serif);
      font-size: 0.82rem;
      font-weight: 800;
      color: #ffffff;
      text-shadow: 0 2px 4px rgba(0,0,0,0.5);
    }
    .tap-hint {
      font-size: 0.65rem;
      font-weight: 900;
      color: #fde047;
      background: rgba(0,0,0,0.3);
      padding: 2px 6px;
      border-radius: 10px;
    }

    /* Revealed Stage */
    .revealed-box {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .animal-revealed-stage {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      text-align: center;
    }
    .peekaboo-badge {
      font-size: 0.65rem;
      font-weight: 900;
      color: #0f172a;
      background: #fde047;
      padding: 2px 8px;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }
    .revealed-animal-emoji {
      font-size: clamp(3.2rem, 10vw, 4.5rem);
      line-height: 1;
      filter: drop-shadow(0 8px 18px rgba(0,0,0,0.5));
    }
    .revealed-animal-name {
      font-family: var(--font-display, sans-serif);
      font-size: 0.85rem;
      font-weight: 900;
      color: #ffffff;
    }
    .tap-tickle-cue {
      font-size: 0.62rem;
      color: #fde047;
      font-weight: 800;
    }

    .empty-revealed-stage {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      opacity: 0.75;
      text-align: center;
    }
    .empty-emoji {
      font-size: 2.8rem;
    }
    .empty-text {
      font-size: 0.72rem;
      color: #94a3b8;
      font-weight: 700;
      padding: 0 4px;
    }

    /* Celebration Card */
    .found-celebration-card {
      width: 100%;
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(5, 150, 105, 0.35) 100%);
      border: 2px solid #34d399;
      border-radius: 20px;
      padding: 12px 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      text-align: center;
      box-shadow: 0 8px 24px rgba(0,0,0,0.35);
      backdrop-filter: blur(12px);
      margin-top: auto;
    }
    .celeb-sparkles {
      font-size: 1.5rem;
    }
    .celeb-title {
      margin: 0;
      font-family: var(--font-display, sans-serif);
      font-size: clamp(1rem, 3.5vw, 1.25rem);
      font-weight: 900;
      color: #ffffff;
    }
    .celeb-sub {
      margin: 2px 0 0 0;
      font-size: 0.8rem;
      color: #d1fae5;
    }
    .next-scene-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 10px 22px;
      border-radius: 20px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border: 2px solid #6ee7b7;
      color: #ffffff;
      font-family: var(--font-display, sans-serif);
      font-size: 0.88rem;
      font-weight: 900;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(16, 185, 129, 0.45);
      transition: all 0.2s;
    }
    .next-scene-btn:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 18px rgba(16, 185, 129, 0.6);
    }

    /* Keyframes */
    @keyframes wiggle {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(-3deg); }
      75% { transform: rotate(3deg); }
    }
    .animate-wiggle {
      animation: wiggle 2.5s ease-in-out infinite;
    }

    @keyframes popIn {
      0% { transform: scale(0.3); opacity: 0; }
      70% { transform: scale(1.15); opacity: 1; }
      100% { transform: scale(1); opacity: 1; }
    }
    .animate-pop {
      animation: popIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }
    .animate-bounce {
      animation: bounce 1.8s ease-in-out infinite;
    }

    @media (max-width: 380px) {
      .peekaboo-header {
        padding: 6px 8px;
        gap: 3px;
      }
      .title-pill {
        padding: 3px 6px;
      }
      .main-title {
        font-size: 0.78rem;
      }
      .spots-stage {
        gap: 6px;
      }
      .spot-pod {
        min-height: 155px;
        padding: 8px 4px;
      }
    }
  `]
})
export class PeekabooComponent implements OnInit {
  totalStars = 28;
  currentSceneIndex = 0;
  isCurrentFound = false;

  readonly scenes: PeekabooScene[] = [
    // 1. Garden (बगीचा) -> Puppy 🐶
    {
      id: 1,
      title: 'Sunny Garden',
      hindiTitle: 'सुहाना बगीचा',
      bgGradient: 'radial-gradient(circle at 50% 20%, #064e3b 0%, #022c22 100%)',
      animalName: 'Puppy',
      animalHindi: 'कुत्ता (पिल्लू)',
      animalEmoji: '🐶',
      soundType: 'dog',
      soundClueText: 'Woof Woof!',
      revealGreeting: 'Peekaboo! Puppy says Woof Woof!',
      revealGreetingHi: 'कूकू! पिल्लू बोला वूफ-वूफ!',
      spots: [
        { id: 'spot-1-1', name: 'Green Bush', hindiName: 'हरी झाड़ी', coverEmoji: '🌳', emptyEmoji: '🍂', isRevealed: false, hasAnimal: true },
        { id: 'spot-1-2', name: 'Flower Pot', hindiName: 'फूलों का गमला', coverEmoji: '🪴', emptyEmoji: '🌸', isRevealed: false, hasAnimal: false },
        { id: 'spot-1-3', name: 'Wooden Barrel', hindiName: 'लकड़ी का पीपा', coverEmoji: '🛢️', emptyEmoji: '🪵', isRevealed: false, hasAnimal: false }
      ]
    },
    // 2. Cloud Sky (नीला आकाश) -> Bird 🐦
    {
      id: 2,
      title: 'Sky & Clouds',
      hindiTitle: 'नीला आकाश',
      bgGradient: 'radial-gradient(circle at 50% 20%, #0369a1 0%, #082f49 100%)',
      animalName: 'Little Birdie',
      animalHindi: 'नन्हीं चिड़िया',
      animalEmoji: '🐦',
      soundType: 'bird',
      soundClueText: 'Tweet Tweet!',
      revealGreeting: 'Peekaboo! Little Birdie tweets Tweet Tweet!',
      revealGreetingHi: 'कूकू! नन्हीं चिड़िया बोली चीं-चीं!',
      spots: [
        { id: 'spot-2-1', name: 'Fluffy Cloud', hindiName: 'सफ़ेद बादल', coverEmoji: '☁️', emptyEmoji: '🌧️', isRevealed: false, hasAnimal: false },
        { id: 'spot-2-2', name: 'Rainbow Arch', hindiName: 'इंद्रधनुष', coverEmoji: '🌈', emptyEmoji: '✨', isRevealed: false, hasAnimal: true },
        { id: 'spot-2-3', name: 'Golden Sun', hindiName: 'चमकता सूरज', coverEmoji: '☀️', emptyEmoji: '⭐', isRevealed: false, hasAnimal: false }
      ]
    },
    // 3. Farm Barn (खेत खलिहान) -> Cow 🐮
    {
      id: 3,
      title: 'Farm Barn',
      hindiTitle: 'खेत और खलिहान',
      bgGradient: 'radial-gradient(circle at 50% 20%, #854d0e 0%, #451a03 100%)',
      animalName: 'Daisy Cow',
      animalHindi: 'गैया रानी',
      animalEmoji: '🐮',
      soundType: 'cow',
      soundClueText: 'Moo Moo!',
      revealGreeting: 'Peekaboo! Daisy Cow says Moo Moo!',
      revealGreetingHi: 'कूकू! गैया रानी बोली मूँ-मूँ!',
      spots: [
        { id: 'spot-3-1', name: 'Red Barn', hindiName: 'लाल खलिहान', coverEmoji: '🚜', emptyEmoji: '🌾', isRevealed: false, hasAnimal: false },
        { id: 'spot-3-2', name: 'Haystack', hindiName: 'घास का ढेर', coverEmoji: '🌾', emptyEmoji: '🍂', isRevealed: false, hasAnimal: true },
        { id: 'spot-3-3', name: 'Wooden Crate', hindiName: 'लकड़ी की पेटी', coverEmoji: '📦', emptyEmoji: '🪵', isRevealed: false, hasAnimal: false }
      ]
    },
    // 4. Safari Jungle (जंगल सफारी) -> Lion 🦁
    {
      id: 4,
      title: 'Jungle Safari',
      hindiTitle: 'जंगल सफारी',
      bgGradient: 'radial-gradient(circle at 50% 20%, #713f12 0%, #1c1917 100%)',
      animalName: 'Baby Lion',
      animalHindi: 'शेर का बच्चा',
      animalEmoji: '🦁',
      soundType: 'lion',
      soundClueText: 'Roar Roar!',
      revealGreeting: 'Peekaboo! Baby Lion roars Roar Roar!',
      revealGreetingHi: 'कूकू! नन्हा शेर बोला दहाड़!',
      spots: [
        { id: 'spot-4-1', name: 'Palm Tree', hindiName: 'ताड़ का पेड़', coverEmoji: '🌴', emptyEmoji: '🥥', isRevealed: false, hasAnimal: false },
        { id: 'spot-4-2', name: 'Bamboo Grove', hindiName: 'बांस की झाड़ी', coverEmoji: '🎋', emptyEmoji: '🍃', isRevealed: false, hasAnimal: false },
        { id: 'spot-4-3', name: 'Hollow Log', hindiName: 'बड़ा तना', coverEmoji: '🪵', emptyEmoji: '🌿', isRevealed: false, hasAnimal: true }
      ]
    },
    // 5. Pond & Stream (तालाब का किनारा) -> Duck 🦆
    {
      id: 5,
      title: 'Pond & Stream',
      hindiTitle: 'तालाब का किनारा',
      bgGradient: 'radial-gradient(circle at 50% 20%, #0e7490 0%, #164e63 100%)',
      animalName: 'Yellow Duckling',
      animalHindi: 'बत्तख का बच्चा',
      animalEmoji: '🦆',
      soundType: 'duck',
      soundClueText: 'Quack Quack!',
      revealGreeting: 'Peekaboo! Duckling says Quack Quack!',
      revealGreetingHi: 'कूकू! बत्तख बोली क्वैक-क्वैक!',
      spots: [
        { id: 'spot-5-1', name: 'Water Lily', hindiName: 'कमल का पत्ता', coverEmoji: '🪷', emptyEmoji: '💧', isRevealed: false, hasAnimal: true },
        { id: 'spot-5-2', name: 'Reeds & Grass', hindiName: 'नदी की घास', coverEmoji: '🌿', emptyEmoji: '🐸', isRevealed: false, hasAnimal: false },
        { id: 'spot-5-3', name: 'Smooth Stones', hindiName: 'चिकने पत्थर', coverEmoji: '🪨', emptyEmoji: '🫧', isRevealed: false, hasAnimal: false }
      ]
    },
    // 6. Cozy Bedroom (प्यारा कमरा) -> Kitty Cat 🐱
    {
      id: 6,
      title: 'Cozy Bedroom',
      hindiTitle: 'प्यारा कमरा',
      bgGradient: 'radial-gradient(circle at 50% 20%, #4c1d95 0%, #1e1b4b 100%)',
      animalName: 'Fluffy Kitty',
      animalHindi: 'प्यारी बिल्ली',
      animalEmoji: '🐱',
      soundType: 'cat',
      soundClueText: 'Meow Meow!',
      revealGreeting: 'Peekaboo! Fluffy Kitty says Meow Meow!',
      revealGreetingHi: 'कूकू! प्यारी बिल्ली बोली म्याऊँ-म्याऊँ!',
      spots: [
        { id: 'spot-6-1', name: 'Cushion Chair', hindiName: 'सोफ़ा कुशन', coverEmoji: '🛋️', emptyEmoji: '🧶', isRevealed: false, hasAnimal: false },
        { id: 'spot-6-2', name: 'Toy Chest', hindiName: 'खिलौने का डिब्बा', coverEmoji: '🧸', emptyEmoji: '🎁', isRevealed: false, hasAnimal: true },
        { id: 'spot-6-3', name: 'Warm Blanket', hindiName: 'नरम चादर', coverEmoji: '🛏️', emptyEmoji: '⭐', isRevealed: false, hasAnimal: false }
      ]
    }
  ];

  constructor(
    public appNav: AppNavService,
    public sound: SoundService,
    public speech: SpeechService,
    public themeService: ThemeService,
    private confetti: ConfettiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const saved = localStorage.getItem('toddler_total_stars');
    if (saved) {
      this.totalStars = parseInt(saved, 10) || 28;
    }
    this.announceScene();
  }

  get currentScene(): PeekabooScene {
    return this.scenes[this.currentSceneIndex];
  }

  tapSpot(spot: HidingSpot): void {
    if (spot.isRevealed) {
      // If already revealed and has animal, tickle animal!
      if (spot.hasAnimal) {
        this.playAnimalSound();
        this.sound.playGiggle();
        this.confetti.fire();
        this.speech.speakClue(`Hehehe! ${this.currentScene.animalName} loves tickles!`);
      } else {
        this.sound.playTap();
      }
      return;
    }

    spot.isRevealed = true;

    if (spot.hasAnimal) {
      // Animal found! PEEKABOO!
      this.isCurrentFound = true;
      this.playAnimalSound();
      this.confetti.fire();

      this.totalStars += 2;
      localStorage.setItem('toddler_total_stars', this.totalStars.toString());

      setTimeout(() => {
        this.speech.speakClue(`${this.currentScene.revealGreeting} ${this.currentScene.revealGreetingHi}`);
      }, 250);
    } else {
      // Empty spot
      this.sound.playGiggle();
      this.speech.speakClue(`Nothing here! Keep looking for ${this.currentScene.animalName}!`);
    }

    this.cdr.detectChanges();
  }

  playAnimalClueSound(): void {
    this.playAnimalSound();
    this.speech.speakClue(`Listen closely! ${this.currentScene.animalName} says ${this.currentScene.soundClueText}`);
  }

  private playAnimalSound(): void {
    switch (this.currentScene.soundType) {
      case 'dog':
        this.sound.playDogBark();
        break;
      case 'cat':
        this.sound.playCatMeow();
        break;
      case 'cow':
        this.sound.playCowMoo();
        break;
      case 'bird':
        this.sound.playBirdChirp();
        break;
      case 'lion':
        this.sound.playLionRoar();
        break;
      case 'duck':
        this.sound.playDuckQuack();
        break;
      default:
        this.sound.playChime();
        break;
    }
  }

  nextScene(): void {
    this.sound.playTap();
    this.currentSceneIndex = (this.currentSceneIndex + 1) % this.scenes.length;
    // Reset spots in new scene
    for (const spot of this.currentScene.spots) {
      spot.isRevealed = false;
    }
    this.isCurrentFound = false;
    this.announceScene();
    this.cdr.detectChanges();
  }

  private announceScene(): void {
    setTimeout(() => {
      this.speech.speakClue(`Where is ${this.currentScene.animalName} hiding? ${this.currentScene.animalHindi} कहाँ छुपा है?`);
    }, 250);
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

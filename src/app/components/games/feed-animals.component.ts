import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppNavService } from '../../core/services/app-nav.service';
import { SoundService } from '../../core/services/sound.service';
import { SpeechService } from '../../core/services/speech.service';
import { ConfettiService } from '../../core/services/confetti.service';
import { ThemeService } from '../../core/services/theme.service';

interface FoodItem {
  id: string;
  name: string;
  hindiName: string;
  emoji: string;
}

interface HungryAnimal {
  id: string;
  name: string;
  hindiName: string;
  emoji: string;
  soundKey: string;
  desiredFood: FoodItem;
  foodChoices: FoodItem[];
  hungerPrompt: string;
  hindiPrompt: string;
  thankYouMsg: string;
  hindiThankYou: string;
}

@Component({
  selector: 'app-feed-animals',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="feed-viewport">
      <!-- 🌟 Top Header -->
      <header class="feed-header">
        <button 
          type="button" 
          (click)="goBack()" 
          class="nav-circle-btn" 
          title="Back to Hub / वापस जाएँ">
          <span class="btn-icon">🏠</span>
          <span class="btn-text">Hub</span>
        </button>

        <div class="title-pill">
          <span class="title-icon">🍽️</span>
          <div class="title-text-col">
            <span class="main-title">Feed Animals</span>
            <span class="sub-title">खाना खिलाओ</span>
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

      <!-- 🎪 Main Feeding Stage -->
      <main class="feed-content">
        <!-- Progress Counter -->
        <div class="progress-pill">
          <span>Buddy {{ currentAnimalIndex + 1 }} of {{ animals.length }}</span>
        </div>

        <!-- Animal Center Stage -->
        <div class="animal-stage">
          <!-- Hunger Speech Cloud -->
          <div class="hunger-bubble animate-pop" (click)="repeatPrompt()" title="Tap to listen again!">
            <div class="bubble-thought">
              <span class="bubble-hindi">{{ currentAnimal.hindiPrompt }}</span>
              <span class="bubble-eng">{{ currentAnimal.hungerPrompt }}</span>
            </div>
            <div class="desired-badge animate-bounce" (click)="feedDesiredFood($event)" title="Feed this directly! / सीधे खिलाओ!">
              <span>Must have: {{ currentAnimal.desiredFood.emoji }} 👆</span>
            </div>
          </div>

          <!-- Giant Cartoon Animal Character -->
          <div 
            class="animal-avatar-container" 
            [class.animal-chewing]="isChewing"
            [class.animal-happy]="isFed"
            (click)="onAnimalTap()">
            
            <div class="animal-aura"></div>
            
            <span class="animal-emoji">{{ currentAnimal.emoji }}</span>

            <!-- Open Mouth / Chomping Overlay -->
            @if (isChewing) {
              <div class="mouth-eating-fx animate-pop">
                <span class="eating-particles">😋 Nom Nom! ✨</span>
              </div>
            }

            @if (isFed) {
              <div class="hearts-burst animate-pop">
                <span>💖 Yum! 🌟</span>
              </div>
            }
          </div>

          <h2 class="animal-name-title">{{ currentAnimal.hindiName }} ({{ currentAnimal.name }})</h2>
        </div>

        <!-- 3 Food Plates Selection Row -->
        <div class="food-dock">
          <span class="food-dock-label">🍽️ Pick the yummy food • सही खाना चुनो:</span>
          
          <div class="food-plates-row">
            @for (food of currentAnimal.foodChoices; track food.id) {
              <button 
                type="button" 
                class="food-plate-card"
                [class.plate-selected]="selectedFoodId === food.id"
                [class.plate-fed]="isFed && food.id === currentAnimal.desiredFood.id"
                (click)="feedFood(food)"
                [disabled]="isChewing || isFed"
                [title]="food.hindiName + ' (' + food.name + ')'">
                
                <div class="plate-dish">
                  <span class="food-emoji animate-bounce">{{ food.emoji }}</span>
                </div>

                <div class="plate-labels">
                  <span class="food-hindi">{{ food.hindiName }}</span>
                  <span class="food-eng">{{ food.name }}</span>
                </div>
              </button>
            }
          </div>
        </div>

        <!-- 💡 Feedback & Progression Dock -->
        <div class="action-dock">
          @if (isFed) {
            <div class="fed-panel animate-pop">
              <div class="fed-info">
                <span class="fed-icon">😋</span>
                <div class="fed-text">
                  <strong class="fed-hindi">{{ currentAnimal.hindiThankYou }}</strong>
                  <span class="fed-eng">{{ currentAnimal.thankYouMsg }}</span>
                </div>
              </div>

              <button 
                type="button" 
                class="btn-next-animal animate-pop" 
                (click)="nextAnimal()" 
                id="btn-next-feed">
                <span>अगले दोस्त को खिलाओ ⏭️ NEXT BUDDY</span>
              </button>
            </div>
          } @else if (wrongChoiceMsg) {
            <div class="wrong-choice-pill animate-pop">
              <span>{{ wrongChoiceMsg }}</span>
            </div>
          }
        </div>
      </main>

      <!-- Bottom Ground Footer -->
      <footer class="feed-footer">
        <span class="footer-tip">💡 Tip: जानवर को उसका पसंदीदा भोजन खिलाओ!</span>
      </footer>
    </div>
  `,
  styles: [`
    .feed-viewport {
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
    .feed-header {
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
      border: 1.5px solid rgba(245, 158, 11, 0.4);
      padding: 4px 10px;
      border-radius: 18px;
      backdrop-filter: blur(8px);
      white-space: nowrap;
      min-width: 0;
      flex-shrink: 1;
    }
    .title-icon {
      font-size: 1.15rem;
      filter: drop-shadow(0 2px 6px rgba(245, 158, 11, 0.6));
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
      color: #fde047;
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

    /* Content Stage */
    .feed-content {
      width: 100%;
      max-width: 800px;
      margin: 0 auto;
      padding: 4px 16px 16px 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      flex: 1;
    }

    .progress-pill {
      padding: 3px 12px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #94a3b8;
      font-size: 0.72rem;
      font-weight: 800;
      text-transform: uppercase;
    }

    /* Animal Stage */
    .animal-stage {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      position: relative;
    }

    .hunger-bubble {
      background: rgba(255, 255, 255, 0.1);
      border: 2px solid rgba(255, 255, 255, 0.22);
      border-radius: 22px;
      padding: 8px 16px;
      display: flex;
      align-items: center;
      gap: 10px;
      backdrop-filter: blur(10px);
      box-shadow: 0 6px 20px -2px rgba(0, 0, 0, 0.4);
      cursor: pointer;
    }
    .bubble-thought {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      line-height: 1.2;
    }
    .bubble-hindi {
      font-size: clamp(0.92rem, 2.5vw, 1.1rem);
      font-weight: 900;
      color: #ffffff;
    }
    .bubble-eng {
      font-size: clamp(0.74rem, 1.8vw, 0.84rem);
      font-weight: 700;
      color: #cbd5e1;
    }
    .desired-badge {
      padding: 4px 10px;
      border-radius: 12px;
      background: rgba(245, 158, 11, 0.28);
      border: 1.5px solid rgba(251, 191, 36, 0.55);
      color: #fde047;
      font-size: 0.74rem;
      font-weight: 900;
      white-space: nowrap;
      cursor: pointer;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
      transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .desired-badge:hover {
      transform: scale(1.08);
      background: rgba(245, 158, 11, 0.45);
      border-color: #fef08a;
    }

    .animal-avatar-container {
      width: clamp(125px, 24vw, 170px);
      height: clamp(125px, 24vw, 170px);
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.03) 70%);
      border: 3px solid rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      cursor: pointer;
      box-shadow: 0 16px 36px -6px rgba(0, 0, 0, 0.5);
      transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .animal-avatar-container:hover {
      transform: scale(1.06);
    }
    .animal-emoji {
      font-size: clamp(4.4rem, 11vw, 6.6rem);
      filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.5));
      transition: transform 0.2s;
    }

    .animal-chewing {
      animation: chewMotion 0.35s ease-in-out infinite alternate;
    }
    @keyframes chewMotion {
      0% { transform: scale(1) translateY(0); }
      100% { transform: scale(1.15, 0.9) translateY(6px); }
    }
    .animal-happy {
      animation: happyJump 0.6s ease;
    }
    @keyframes happyJump {
      0%, 100% { transform: scale(1) translateY(0); }
      50% { transform: scale(1.18) translateY(-20px) rotate(6deg); }
    }

    .mouth-eating-fx {
      position: absolute;
      bottom: -15px;
      padding: 4px 14px;
      border-radius: 14px;
      background: #10b981;
      color: #ffffff;
      font-size: 0.82rem;
      font-weight: 900;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    }
    .hearts-burst {
      position: absolute;
      top: -15px;
      padding: 4px 14px;
      border-radius: 14px;
      background: #ec4899;
      color: #ffffff;
      font-size: 0.82rem;
      font-weight: 900;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    }

    .animal-name-title {
      font-family: var(--font-display, sans-serif);
      font-size: clamp(1.1rem, 3.2vw, 1.35rem);
      font-weight: 900;
      color: #ffffff;
      margin: 0;
      letter-spacing: 0.02em;
    }

    /* Food Plates */
    .food-dock {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }
    .food-dock-label {
      font-size: 0.78rem;
      font-weight: 800;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .food-plates-row {
      width: 100%;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
    }

    .food-plate-card {
      aspect-ratio: 1 / 1.05;
      border-radius: 24px;
      background: linear-gradient(145deg, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.04) 100%);
      border: 3px solid rgba(255, 255, 255, 0.22);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 10px;
      cursor: pointer;
      position: relative;
      outline: none;
      box-shadow: 0 10px 24px -4px rgba(0, 0, 0, 0.45);
      transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .food-plate-card:hover {
      transform: translateY(-4px) scale(1.05);
      border-color: #fde047;
      background: linear-gradient(145deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.08) 100%);
    }
    .food-plate-card:active {
      transform: translateY(2px) scale(0.96);
    }

    .plate-fed {
      border-color: #34d399 !important;
      background: linear-gradient(145deg, rgba(16, 185, 129, 0.4) 0%, rgba(5, 150, 105, 0.15) 100%) !important;
      box-shadow: 0 0 30px rgba(52, 211, 153, 0.7) !important;
      transform: scale(1.06) !important;
    }

    .plate-dish {
      width: clamp(65px, 14vw, 85px);
      height: clamp(65px, 14vw, 85px);
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.04) 70%);
      border: 2px solid rgba(255, 255, 255, 0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }
    .food-emoji {
      font-size: clamp(2.4rem, 6.5vw, 3.4rem);
      filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.35));
    }

    .plate-labels {
      display: flex;
      flex-direction: column;
      align-items: center;
      line-height: 1.15;
    }
    .food-hindi {
      font-size: clamp(0.88rem, 2.2vw, 1.05rem);
      font-weight: 900;
      color: #ffffff;
    }
    .food-eng {
      font-size: clamp(0.72rem, 1.8vw, 0.82rem);
      font-weight: 700;
      color: #94a3b8;
    }

    /* Action Dock */
    .action-dock {
      width: 100%;
      min-height: 75px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 6px;
    }

    .fed-panel {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }
    .fed-info {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 20px;
      border-radius: 20px;
      background: rgba(16, 185, 129, 0.2);
      border: 1.5px solid rgba(52, 211, 153, 0.5);
    }
    .fed-icon {
      font-size: 1.8rem;
    }
    .fed-text {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      line-height: 1.2;
    }
    .fed-hindi {
      font-size: 0.95rem;
      font-weight: 900;
      color: #34d399;
    }
    .fed-eng {
      font-size: 0.78rem;
      font-weight: 700;
      color: #cbd5e1;
    }

    .btn-next-animal {
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
    .btn-next-animal:hover {
      transform: translateY(-3px) scale(1.03);
    }

    .wrong-choice-pill {
      padding: 8px 18px;
      border-radius: 18px;
      background: rgba(245, 158, 11, 0.2);
      border: 1.5px solid rgba(251, 191, 36, 0.45);
      color: #fde047;
      font-size: 0.82rem;
      font-weight: 800;
      text-align: center;
    }

    .feed-footer {
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
export class FeedAnimalsComponent implements OnInit {
  totalStars = 28;
  currentAnimalIndex = 0;
  selectedFoodId: string | null = null;
  isChewing = false;
  isFed = false;
  wrongChoiceMsg = '';

  readonly animals: HungryAnimal[] = [
    // 1. Monkey -> Banana
    {
      id: 'monkey',
      name: 'Monkey',
      hindiName: 'नटखट बंदर',
      emoji: '🐒',
      soundKey: 'giggle',
      desiredFood: { id: 'banana', name: 'Banana', hindiName: 'केला', emoji: '🍌' },
      foodChoices: [
        { id: 'fish', name: 'Fish', hindiName: 'मछली', emoji: '🐟' },
        { id: 'banana', name: 'Banana', hindiName: 'केला', emoji: '🍌' },
        { id: 'bone', name: 'Bone', hindiName: 'हड्डी', emoji: '🦴' }
      ],
      hungerPrompt: "I'm hungry! Please feed me sweet Banana!",
      hindiPrompt: 'मुझे बहुत भूख लगी है, मुझे मीठा केला खिलाओ! 🍌',
      thankYouMsg: 'Yum yum! The banana was delicious! Nom Nom!',
      hindiThankYou: 'वाह! केला बहुत मीठा और स्वादिष्ट था! 😋'
    },
    // 2. Bunny -> Carrot
    {
      id: 'bunny',
      name: 'Bunny',
      hindiName: 'प्यारा खरगोश',
      emoji: '🐰',
      soundKey: 'boing',
      desiredFood: { id: 'carrot', name: 'Carrot', hindiName: 'गाजर', emoji: '🥕' },
      foodChoices: [
        { id: 'carrot', name: 'Carrot', hindiName: 'गाजर', emoji: '🥕' },
        { id: 'honey', name: 'Honey', hindiName: 'शहद', emoji: '🍯' },
        { id: 'pizza', name: 'Pizza', hindiName: 'पिज़्ज़ा', emoji: '🍕' }
      ],
      hungerPrompt: 'Crunch crunch! I want crunchy orange Carrot!',
      hindiPrompt: 'हॉप-हॉप! मुझे लाल-लाल कुरकुरी गाजर खिलाओ! 🥕',
      thankYouMsg: 'Crunch crunch! Crunchy carrots are the best!',
      hindiThankYou: 'मज़ा आ गया! गाजर बहुत कुरकुरी थी! 🥕'
    },
    // 3. Puppy -> Bone
    {
      id: 'puppy',
      name: 'Puppy Dog',
      hindiName: 'वफादार पिल्ला',
      emoji: '🐶',
      soundKey: 'dog',
      desiredFood: { id: 'bone', name: 'Bone', hindiName: 'हड्डी', emoji: '🦴' },
      foodChoices: [
        { id: 'apple', name: 'Apple', hindiName: 'सेब', emoji: '🍎' },
        { id: 'leaf', name: 'Grass', hindiName: 'घास', emoji: '🍀' },
        { id: 'bone', name: 'Bone', hindiName: 'हड्डी', emoji: '🦴' }
      ],
      hungerPrompt: 'Woof woof! Little puppy wants a yummy Bone!',
      hindiPrompt: 'भो-भो! मुझे मेरा पसंदीदा खिलौना हड्डी दो! 🦴',
      thankYouMsg: 'Woof woof! Thank you little pal! Wagging tail!',
      hindiThankYou: 'भो-भो! शुक्रिया दोस्त! मेरी पूँछ खुशी से हिल रही है!'
    },
    // 4. Kitty -> Fish
    {
      id: 'kitty',
      name: 'Sweet Kitty',
      hindiName: 'मीठी किट्टी',
      emoji: '🐱',
      soundKey: 'cat',
      desiredFood: { id: 'fish', name: 'Fish', hindiName: 'मछली', emoji: '🐟' },
      foodChoices: [
        { id: 'fish', name: 'Fish', hindiName: 'मछली', emoji: '🐟' },
        { id: 'banana', name: 'Banana', hindiName: 'केला', emoji: '🍌' },
        { id: 'carrot', name: 'Carrot', hindiName: 'गाजर', emoji: '🥕' }
      ],
      hungerPrompt: 'Meow meow! Soft kitty loves fresh Fish!',
      hindiPrompt: 'म्याऊँ-म्याऊँ! मुझे ताज़ी मछली खिला दो! 🐟',
      thankYouMsg: 'Purrr! Fish is so yummy! Thank you!',
      hindiThankYou: 'म्याऊँ! मछली बहुत स्वादिष्ट थी, ढेर सारा प्यार!'
    },
    // 5. Honey Bear -> Honey Jar
    {
      id: 'bear',
      name: 'Honey Bear',
      hindiName: 'गोलू भालू',
      emoji: '🐻',
      soundKey: 'giggle',
      desiredFood: { id: 'honey', name: 'Honey', hindiName: 'मीठा शहद', emoji: '🍯' },
      foodChoices: [
        { id: 'bone', name: 'Bone', hindiName: 'हड्डी', emoji: '🦴' },
        { id: 'honey', name: 'Honey', hindiName: 'मीठा शहद', emoji: '🍯' },
        { id: 'fish', name: 'Fish', hindiName: 'मछली', emoji: '🐟' }
      ],
      hungerPrompt: 'Roar-giggle! Sweet honey makes bear happy!',
      hindiPrompt: 'हम्म-हम्म! मुझे मीठा-मीठा शहद खिलाओ! 🍯',
      thankYouMsg: 'Yum! Sweet golden honey is my favorite!',
      hindiThankYou: 'वाह! शहद तो बहुत मीठा था! पेट भर गया!'
    },
    // 6. Gentle Cow -> Green Grass
    {
      id: 'cow',
      name: 'Gentle Cow',
      hindiName: 'गौ माता / गाय',
      emoji: '🐮',
      soundKey: 'cow',
      desiredFood: { id: 'grass', name: 'Fresh Grass', hindiName: 'हरी घास', emoji: '🍀' },
      foodChoices: [
        { id: 'burger', name: 'Burger', hindiName: 'बर्गर', emoji: '🍔' },
        { id: 'grass', name: 'Fresh Grass', hindiName: 'हरी घास', emoji: '🍀' },
        { id: 'icecream', name: 'Ice Cream', hindiName: 'आइसक्रीम', emoji: '🍦' }
      ],
      hungerPrompt: 'Mooo! Gentle cow wants fresh green grass!',
      hindiPrompt: 'आंभा-आंभा! मुझे ताज़ी-ताज़ी हरी घास खिलाओ! 🍀',
      thankYouMsg: 'Mooo! Fresh grass was super healthy and crisp!',
      hindiThankYou: 'अरे वाह! हरी घास बहुत ताज़ी और अच्छी थी! 🐮'
    }
  ];

  get currentAnimal(): HungryAnimal {
    return this.animals[this.currentAnimalIndex];
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
      this.speakAnimalPrompt();
      this.cdr.detectChanges();
    }, 400);
  }

  speakAnimalPrompt(): void {
    this.speech.speakHindi(this.currentAnimal.hindiPrompt);
  }

  repeatPrompt(): void {
    this.sound.playGiggle();
    this.speakAnimalPrompt();
  }

  onAnimalTap(): void {
    if (this.currentAnimal.soundKey === 'dog') this.sound.playDogBark();
    else if (this.currentAnimal.soundKey === 'cat') this.sound.playCatMeow();
    else if (this.currentAnimal.soundKey === 'cow') this.sound.playCowMoo();
    else this.sound.playGiggle();
  }

  feedDesiredFood(event?: MouseEvent): void {
    if (event) event.stopPropagation();
    this.feedFood(this.currentAnimal.desiredFood);
  }

  feedFood(food: FoodItem): void {
    if (this.isChewing || this.isFed) return;

    this.selectedFoodId = food.id;

    if (food.id === this.currentAnimal.desiredFood.id) {
      // Correct food!
      this.wrongChoiceMsg = '';
      this.isChewing = true;
      this.sound.playChew();
      this.cdr.detectChanges(); // Immediately render chewing animation!

      setTimeout(() => {
        this.isChewing = false;
        this.isFed = true;
        this.sound.playSuccess();
        this.confetti.fire();

        this.totalStars += 1;
        localStorage.setItem('toddler_total_stars', this.totalStars.toString());

        this.speech.speakHindi(`वाह! बहुत बढ़िया! ${this.currentAnimal.hindiThankYou}`);
        this.cdr.detectChanges(); // Immediately render "Next Buddy" button & victory state!
      }, 700);
    } else {
      // Wrong food
      this.sound.playBoing();
      this.wrongChoiceMsg = `अरे नहीं! ${this.currentAnimal.name} यह नहीं खाता, उसे ${this.currentAnimal.desiredFood.hindiName} पसंद है!`;
      this.speech.speakHindi(this.wrongChoiceMsg);
      this.cdr.detectChanges();
    }
  }

  nextAnimal(): void {
    this.sound.playFanfare();
    this.confetti.fire();
    this.selectedFoodId = null;
    this.isChewing = false;
    this.isFed = false;
    this.wrongChoiceMsg = '';

    this.currentAnimalIndex = (this.currentAnimalIndex + 1) % this.animals.length;
    this.cdr.detectChanges();
    setTimeout(() => {
      this.speakAnimalPrompt();
      this.cdr.detectChanges();
    }, 400);
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

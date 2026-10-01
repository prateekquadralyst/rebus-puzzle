import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppNavService } from '../../core/services/app-nav.service';
import { SoundService } from '../../core/services/sound.service';
import { SpeechService } from '../../core/services/speech.service';
import { ConfettiService } from '../../core/services/confetti.service';
import { ThemeService } from '../../core/services/theme.service';

export type SizeCategory = 'big' | 'medium' | 'small';

interface SorterItem {
  id: string;
  name: string;
  hindiName: string;
  emoji: string;
  size: SizeCategory;
  scaleFactor: number;
  isSorted: boolean;
}

interface SorterSet {
  id: number;
  title: string;
  hindiTitle: string;
  themeEmoji: string;
  promptHindi: string;
  promptEnglish: string;
  items: SorterItem[];
}

@Component({
  selector: 'app-size-sorter',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="sorter-viewport">
      <!-- 🌟 Top Header Bar -->
      <header class="sorter-header">
        <button 
          type="button" 
          (click)="goBack()" 
          class="nav-circle-btn" 
          id="btn-sorter-back"
          title="Back to Hub / हब पर वापस">
          <span class="btn-icon">🏠</span>
          <span class="btn-text">Hub</span>
        </button>

        <div class="title-pill">
          <span class="title-icon">🐻</span>
          <div class="title-text-col">
            <span class="main-title">Size Sorter</span>
            <span class="sub-title">बड़ा, मंझला और छोटा</span>
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
      <main class="sorter-content">
        <!-- Banner Stage Instruction -->
        <div class="stage-banner">
          <div class="banner-badge">
            <span>{{ currentSet.themeEmoji }} {{ currentSet.hindiTitle }} • {{ currentSet.title }}</span>
            <span class="badge-stage">Set {{ currentSetIndex + 1 }} / {{ sets.length }}</span>
          </div>
          <h2 class="prompt-heading">{{ currentSet.promptHindi }}</h2>
          <p class="prompt-sub">{{ currentSet.promptEnglish }}</p>
        </div>

        <!-- 🧺 The 3 Size Target Baskets: Big, Medium, Small -->
        <div class="baskets-stage">
          <!-- 1. BIG BASKET (बड़ा) -->
          <div 
            class="size-zone zone-big"
            [class.zone-highlight]="selectedItem?.size === 'big'"
            [class.zone-occupied]="getSortedItem('big') !== null"
            (click)="placeInZone('big')">
            
            <div class="zone-badge badge-big">
              <span class="zone-size-icon">🐘</span>
              <span class="zone-label-hi">बड़ा</span>
              <span class="zone-label-en">Big</span>
            </div>

            <div class="zone-slot slot-big">
              @if (getSortedItem('big'); as bigItem) {
                <div class="placed-item animate-pop" style="transform: scale(1.42)">
                  <span class="placed-emoji">{{ bigItem.emoji }}</span>
                  <span class="placed-name">{{ bigItem.hindiName }}</span>
                  <span class="placed-star">⭐</span>
                </div>
              } @else {
                <div class="empty-placeholder">
                  <span class="placeholder-icon">🧺</span>
                  <span class="placeholder-text">बड़ा यहाँ रखें</span>
                </div>
              }
            </div>
          </div>

          <!-- 2. MEDIUM BASKET (मंझला) -->
          <div 
            class="size-zone zone-medium"
            [class.zone-highlight]="selectedItem?.size === 'medium'"
            [class.zone-occupied]="getSortedItem('medium') !== null"
            (click)="placeInZone('medium')">
            
            <div class="zone-badge badge-medium">
              <span class="zone-size-icon">🐕</span>
              <span class="zone-label-hi">मंझला</span>
              <span class="zone-label-en">Medium</span>
            </div>

            <div class="zone-slot slot-medium">
              @if (getSortedItem('medium'); as medItem) {
                <div class="placed-item animate-pop" style="transform: scale(1.05)">
                  <span class="placed-emoji">{{ medItem.emoji }}</span>
                  <span class="placed-name">{{ medItem.hindiName }}</span>
                  <span class="placed-star">⭐</span>
                </div>
              } @else {
                <div class="empty-placeholder">
                  <span class="placeholder-icon">🧺</span>
                  <span class="placeholder-text">मंझला यहाँ रखें</span>
                </div>
              }
            </div>
          </div>

          <!-- 3. SMALL BASKET (छोटा) -->
          <div 
            class="size-zone zone-small"
            [class.zone-highlight]="selectedItem?.size === 'small'"
            [class.zone-occupied]="getSortedItem('small') !== null"
            (click)="placeInZone('small')">
            
            <div class="zone-badge badge-small">
              <span class="zone-size-icon">🐣</span>
              <span class="zone-label-hi">छोटा</span>
              <span class="zone-label-en">Small</span>
            </div>

            <div class="zone-slot slot-small">
              @if (getSortedItem('small'); as smallItem) {
                <div class="placed-item animate-pop" style="transform: scale(0.72)">
                  <span class="placed-emoji">{{ smallItem.emoji }}</span>
                  <span class="placed-name">{{ smallItem.hindiName }}</span>
                  <span class="placed-star">⭐</span>
                </div>
              } @else {
                <div class="empty-placeholder">
                  <span class="placeholder-icon">🧺</span>
                  <span class="placeholder-text">छोटा यहाँ रखें</span>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- 🪵 Bottom Holding Tray: Unsorted Items to Pick -->
        <div class="holding-tray">
          <div class="tray-label">
            <span>👇 किसी एक को छुओ और सही टोकरी में रखो!</span>
          </div>

          <div class="tray-items-row">
            @for (item of currentSet.items; track item.id) {
              @if (!item.isSorted) {
                <button 
                  type="button" 
                  class="tray-item-card"
                  [class.item-selected]="selectedItem?.id === item.id"
                  [class.wobble-item]="wobbleItemId === item.id"
                  (click)="selectItem(item)"
                  [title]="item.hindiName + ' (' + item.name + ')'">
                  
                  <div class="item-visual-box" [style.transform]="'scale(' + item.scaleFactor + ')'">
                    <span class="item-emoji">{{ item.emoji }}</span>
                  </div>

                  <span class="item-title">{{ item.hindiName }}</span>
                  <span class="item-size-tag">{{ getSizeLabel(item.size) }}</span>
                </button>
              }
            }
          </div>

          @if (allCurrentSorted) {
            <div class="all-sorted-congrats animate-pop">
              <span class="congrats-stars">🌟🎉🌟</span>
              <span class="congrats-text">वाह! बहुत अच्छे! All sizes sorted!</span>
              <button 
                type="button" 
                class="next-round-btn animate-bounce"
                (click)="nextSet()">
                <span>अगला सेट खेलें • Next Set ➡️</span>
              </button>
            </div>
          }
        </div>
      </main>
    </div>
  `,
  styles: [`
    .sorter-viewport {
      position: fixed;
      inset: 0;
      background: radial-gradient(circle at 50% 20%, #1e1b4b 0%, #0f172a 100%);
      color: #ffffff;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      overflow-x: hidden;
      font-family: var(--font-body, system-ui, sans-serif);
      z-index: 50;
      user-select: none;
    }

    /* 🌟 Header Bar */
    .sorter-header {
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
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #e2e8f0;
      font-size: 0.78rem;
      font-weight: 700;
      cursor: pointer;
      backdrop-filter: blur(10px);
      transition: all 0.2s;
      flex-shrink: 0;
    }
    .nav-circle-btn:hover {
      background: rgba(255, 255, 255, 0.22);
      transform: translateY(-2px);
      color: #ffffff;
    }

    .title-pill {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(245, 158, 11, 0.15);
      border: 1.5px solid rgba(251, 191, 36, 0.45);
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
      color: #fde047;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .sub-title {
      font-size: 0.65rem;
      color: rgba(255, 255, 255, 0.85);
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
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
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
      background: rgba(255, 255, 255, 0.25);
    }

    /* Content Stage */
    .sorter-content {
      flex: 1;
      max-width: 800px;
      width: 100%;
      margin: 0 auto;
      padding: 0 10px 16px 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }

    /* Stage Banner */
    .stage-banner {
      width: 100%;
      background: linear-gradient(135deg, rgba(79, 70, 229, 0.25) 0%, rgba(147, 51, 234, 0.2) 100%);
      border: 1.5px solid rgba(167, 139, 250, 0.35);
      border-radius: 16px;
      padding: 8px 12px;
      text-align: center;
      backdrop-filter: blur(10px);
      box-shadow: 0 4px 14px rgba(0,0,0,0.3);
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
      margin: 2px 0 0 0;
      font-family: var(--font-display, sans-serif);
      font-size: clamp(0.95rem, 3.2vw, 1.25rem);
      font-weight: 900;
      color: #ffffff;
      text-shadow: 0 2px 6px rgba(0,0,0,0.4);
    }
    .prompt-sub {
      margin: 2px 0 0 0;
      font-size: clamp(0.72rem, 2.3vw, 0.85rem);
      color: rgba(255, 255, 255, 0.82);
    }

    /* 🧺 The 3 Size Target Baskets */
    .baskets-stage {
      width: 100%;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin-top: 4px;
    }

    .size-zone {
      display: flex;
      flex-direction: column;
      align-items: center;
      background: rgba(30, 41, 59, 0.7);
      border: 2px dashed rgba(255, 255, 255, 0.25);
      border-radius: 16px;
      padding: 8px 4px 10px 4px;
      cursor: pointer;
      position: relative;
      transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      min-height: 140px;
    }
    .size-zone:hover {
      background: rgba(51, 65, 85, 0.85);
      transform: translateY(-2px);
    }
    .zone-highlight {
      border-style: solid;
      border-color: #fde047 !important;
      background: rgba(245, 158, 11, 0.25) !important;
      box-shadow: 0 0 18px rgba(251, 191, 36, 0.5);
      transform: scale(1.03);
    }
    .zone-occupied {
      border-style: solid;
      border-color: rgba(74, 222, 128, 0.6);
      background: rgba(34, 197, 94, 0.15);
    }

    .zone-badge {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 3px 8px;
      border-radius: 12px;
      font-weight: 900;
      font-size: 0.72rem;
      margin-bottom: 6px;
    }
    .badge-big {
      background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);
      color: #ffffff;
      box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
    }
    .badge-medium {
      background: linear-gradient(135deg, #eab308 0%, #ca8a04 100%);
      color: #0f172a;
      box-shadow: 0 2px 8px rgba(234, 179, 8, 0.4);
    }
    .badge-small {
      background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
      color: #ffffff;
      box-shadow: 0 2px 8px rgba(6, 182, 212, 0.4);
    }

    .zone-size-icon {
      font-size: 0.9rem;
    }
    .zone-label-hi {
      font-weight: 900;
    }
    .zone-label-en {
      font-size: 0.65rem;
      opacity: 0.85;
    }

    .zone-slot {
      flex: 1;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .empty-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      opacity: 0.55;
    }
    .placeholder-icon {
      font-size: clamp(1.8rem, 5vw, 2.4rem);
    }
    .placeholder-text {
      font-size: 0.65rem;
      font-weight: 700;
      color: #94a3b8;
      text-align: center;
    }

    .placed-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
    }
    .placed-emoji {
      font-size: clamp(2.4rem, 6.5vw, 3.2rem);
      line-height: 1;
      filter: drop-shadow(0 4px 8px rgba(0,0,0,0.4));
    }
    .placed-name {
      font-size: 0.68rem;
      font-weight: 800;
      color: #fde047;
      margin-top: 3px;
      white-space: nowrap;
    }
    .placed-star {
      position: absolute;
      top: -8px;
      right: -8px;
      font-size: 1rem;
      filter: drop-shadow(0 0 6px #fde047);
    }

    /* 🪵 Holding Tray */
    .holding-tray {
      width: 100%;
      background: rgba(15, 23, 42, 0.75);
      border: 1.5px solid rgba(255, 255, 255, 0.15);
      border-radius: 18px;
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      backdrop-filter: blur(12px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
      margin-top: auto;
    }
    .tray-label {
      font-size: 0.75rem;
      font-weight: 800;
      color: #38bdf8;
      margin-bottom: 8px;
      text-align: center;
    }

    .tray-items-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      flex-wrap: wrap;
      width: 100%;
    }

    .tray-item-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 8px 12px;
      border-radius: 16px;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
      border: 2px solid rgba(255, 255, 255, 0.2);
      cursor: pointer;
      outline: none;
      transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
      min-width: 82px;
    }
    .tray-item-card:hover {
      transform: translateY(-4px) scale(1.06);
      border-color: #38bdf8;
      background: rgba(56, 189, 248, 0.2);
    }
    .item-selected {
      border-color: #fde047 !important;
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.3) 0%, rgba(251, 191, 36, 0.2) 100%) !important;
      box-shadow: 0 0 18px rgba(253, 224, 71, 0.6) !important;
      transform: scale(1.1) translateY(-4px);
    }
    .wobble-item {
      animation: wobble 0.4s ease-in-out;
    }

    .item-visual-box {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 60px;
      width: 60px;
    }
    .item-emoji {
      font-size: 2.5rem;
      line-height: 1;
      filter: drop-shadow(0 3px 6px rgba(0,0,0,0.3));
    }
    .item-title {
      font-size: 0.72rem;
      font-weight: 800;
      color: #ffffff;
      margin-top: 2px;
    }
    .item-size-tag {
      font-size: 0.6rem;
      font-weight: 700;
      color: #fde047;
      opacity: 0.9;
    }

    /* All Sorted Banner */
    .all-sorted-congrats {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      padding: 10px;
      width: 100%;
    }
    .congrats-stars {
      font-size: 1.5rem;
    }
    .congrats-text {
      font-size: 0.9rem;
      font-weight: 900;
      color: #4ade80;
      text-shadow: 0 2px 6px rgba(0,0,0,0.4);
    }
    .next-round-btn {
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
    .next-round-btn:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 18px rgba(16, 185, 129, 0.6);
    }

    /* Animations */
    @keyframes wobble {
      0%, 100% { transform: translateX(0); }
      20% { transform: translateX(-8px) rotate(-6deg); }
      40% { transform: translateX(8px) rotate(6deg); }
      60% { transform: translateX(-5px) rotate(-3deg); }
      80% { transform: translateX(5px) rotate(3deg); }
    }

    @keyframes popIn {
      0% { transform: scale(0.4); opacity: 0; }
      70% { transform: scale(1.15); opacity: 1; }
      100% { transform: scale(1); opacity: 1; }
    }
    .animate-pop {
      animation: popIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-6px); }
    }
    .animate-bounce {
      animation: bounce 1.8s ease-in-out infinite;
    }

    @media (max-width: 380px) {
      .sorter-header {
        padding: 6px 8px;
        gap: 3px;
      }
      .title-pill {
        padding: 3px 6px;
      }
      .main-title {
        font-size: 0.78rem;
      }
      .baskets-stage {
        gap: 5px;
      }
      .size-zone {
        padding: 6px 2px;
        min-height: 125px;
      }
      .zone-badge {
        font-size: 0.65rem;
        padding: 2px 5px;
      }
      .tray-item-card {
        min-width: 72px;
        padding: 6px 8px;
      }
    }
  `]
})
export class SizeSorterComponent implements OnInit {
  totalStars = 28;
  currentSetIndex = 0;
  selectedItem: SorterItem | null = null;
  wobbleItemId: string | null = null;

  readonly sets: SorterSet[] = [
    // 1. Bears (भालू परिवार)
    {
      id: 1,
      title: 'Bear Family',
      hindiTitle: 'भालू परिवार',
      themeEmoji: '🐻',
      promptHindi: 'बड़ा भालू, मंझला भालू और छोटा भालू!',
      promptEnglish: 'Papa Bear, Mama Bear, and Baby Bear!',
      items: [
        { id: 'bear-big', name: 'Papa Bear', hindiName: 'बड़ा पापा भालू', emoji: '🐻', size: 'big', scaleFactor: 1.45, isSorted: false },
        { id: 'bear-med', name: 'Mama Bear', hindiName: 'मंझली मम्मी भालू', emoji: '🐻', size: 'medium', scaleFactor: 1.05, isSorted: false },
        { id: 'bear-sml', name: 'Baby Bear', hindiName: 'छोटा बेबी भालू', emoji: '🐻', size: 'small', scaleFactor: 0.7, isSorted: false }
      ]
    },
    // 2. Apples (रसीले सेब)
    {
      id: 2,
      title: 'Juicy Apples',
      hindiTitle: 'रसीले सेब',
      themeEmoji: '🍎',
      promptHindi: 'बड़ा सेब, मंझला सेब और नन्हा सेब!',
      promptEnglish: 'Big Apple, Medium Apple, and Tiny Apple!',
      items: [
        { id: 'apple-big', name: 'Giant Apple', hindiName: 'बड़ा सेब', emoji: '🍎', size: 'big', scaleFactor: 1.45, isSorted: false },
        { id: 'apple-med', name: 'Medium Apple', hindiName: 'मंझला सेब', emoji: '🍎', size: 'medium', scaleFactor: 1.05, isSorted: false },
        { id: 'apple-sml', name: 'Tiny Apple', hindiName: 'छोटा सेब', emoji: '🍎', size: 'small', scaleFactor: 0.7, isSorted: false }
      ]
    },
    // 3. Vehicles (वाहनों की सवारी)
    {
      id: 3,
      title: 'Vehicles',
      hindiTitle: 'वाहनों का आकार',
      themeEmoji: '🚛',
      promptHindi: 'बड़ा ट्रक, मंझली कार और छोटी स्कूटी!',
      promptEnglish: 'Big Truck, Family Car, and Scooter!',
      items: [
        { id: 'veh-big', name: 'Big Truck', hindiName: 'बड़ा ट्रक', emoji: '🚛', size: 'big', scaleFactor: 1.4, isSorted: false },
        { id: 'veh-med', name: 'Family Car', hindiName: 'मंझली कार', emoji: '🚗', size: 'medium', scaleFactor: 1.05, isSorted: false },
        { id: 'veh-sml', name: 'Scooter', hindiName: 'छोटी स्कूटी', emoji: '🛵', size: 'small', scaleFactor: 0.75, isSorted: false }
      ]
    },
    // 4. Trees & Plants (पेड़ और पौधे)
    {
      id: 4,
      title: 'Trees & Plants',
      hindiTitle: 'पेड़ और पौधे',
      themeEmoji: '🌳',
      promptHindi: 'बड़ा पेड़, मंझली झाड़ी और नन्हा पौधा!',
      promptEnglish: 'Giant Tree, Green Bush, and Tiny Sprout!',
      items: [
        { id: 'tree-big', name: 'Giant Tree', hindiName: 'बड़ा पेड़', emoji: '🌳', size: 'big', scaleFactor: 1.45, isSorted: false },
        { id: 'tree-med', name: 'Potted Bush', hindiName: 'मंझली झाड़ी', emoji: '🪴', size: 'medium', scaleFactor: 1.05, isSorted: false },
        { id: 'tree-sml', name: 'Tiny Sprout', hindiName: 'नन्हा पौधा', emoji: '🌱', size: 'small', scaleFactor: 0.7, isSorted: false }
      ]
    },
    // 5. Ocean Friends (समुद्र के दोस्त)
    {
      id: 5,
      title: 'Ocean Friends',
      hindiTitle: 'समुद्र के दोस्त',
      themeEmoji: '🐋',
      promptHindi: 'बड़ी व्हेल, मंझली डॉल्फ़िन और छोटी मछली!',
      promptEnglish: 'Big Whale, Medium Dolphin, and Little Fish!',
      items: [
        { id: 'ocean-big', name: 'Blue Whale', hindiName: 'बड़ी व्हेल', emoji: '🐋', size: 'big', scaleFactor: 1.45, isSorted: false },
        { id: 'ocean-med', name: 'Dolphin', hindiName: 'मंझली डॉल्फ़िन', emoji: '🐬', size: 'medium', scaleFactor: 1.05, isSorted: false },
        { id: 'ocean-sml', name: 'Baby Fish', hindiName: 'छोटी मछली', emoji: '🐠', size: 'small', scaleFactor: 0.7, isSorted: false }
      ]
    },
    // 6. Play Balls (खेल की गेंदें)
    {
      id: 6,
      title: 'Play Balls',
      hindiTitle: 'रंग-बिरंगी गेंदें',
      themeEmoji: '⚽',
      promptHindi: 'बड़ी बीच बॉल, मंझली बास्केटबॉल और छोटी बॉल!',
      promptEnglish: 'Big Beach Ball, Basketball, and Tennis Ball!',
      items: [
        { id: 'ball-big', name: 'Beach Ball', hindiName: 'बड़ी बीच बॉल', emoji: '🏐', size: 'big', scaleFactor: 1.45, isSorted: false },
        { id: 'ball-med', name: 'Basketball', hindiName: 'मंझली बॉल', emoji: '🏀', size: 'medium', scaleFactor: 1.05, isSorted: false },
        { id: 'ball-sml', name: 'Tennis Ball', hindiName: 'छोटी टेनिस बॉल', emoji: '🎾', size: 'small', scaleFactor: 0.7, isSorted: false }
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
    this.announceCurrentSet();
  }

  get currentSet(): SorterSet {
    return this.sets[this.currentSetIndex];
  }

  get allCurrentSorted(): boolean {
    return this.currentSet.items.every(item => item.isSorted);
  }

  getSortedItem(size: SizeCategory): SorterItem | null {
    return this.currentSet.items.find(i => i.size === size && i.isSorted) || null;
  }

  getSizeLabel(size: SizeCategory): string {
    switch (size) {
      case 'big': return 'बड़ा • Big';
      case 'medium': return 'मंझला • Medium';
      case 'small': return 'छोटा • Small';
    }
  }

  selectItem(item: SorterItem): void {
    if (item.isSorted) return;
    this.sound.playTap();
    this.selectedItem = item;
    
    // Friendly speech cue
    const sizeHi = item.size === 'big' ? 'बड़ा' : item.size === 'medium' ? 'मंझला' : 'छोटा';
    const sizeEn = item.size.toUpperCase();
    this.speech.speakClue(`${item.name}! Find the ${sizeEn} basket! ${sizeHi} टोकरी कहाँ है?`);
    this.cdr.detectChanges();
  }

  placeInZone(targetZone: SizeCategory): void {
    if (!this.selectedItem) {
      // If user tapped a basket first without selecting an item, speak hint
      this.sound.playTap();
      const zoneHi = targetZone === 'big' ? 'बड़ा' : targetZone === 'medium' ? 'मंझला' : 'छोटा';
      this.speech.speakClue(`This is the ${targetZone.toUpperCase()} basket! Choose an item below! नीचे से ${zoneHi} चुनो!`);
      return;
    }

    if (this.selectedItem.size === targetZone) {
      // Correct placement!
      this.selectedItem.isSorted = true;
      this.sound.playSuccess();
      this.totalStars += 1;
      localStorage.setItem('toddler_total_stars', this.totalStars.toString());

      const sizeHi = targetZone === 'big' ? 'बड़ा' : targetZone === 'medium' ? 'मंझला' : 'छोटा';
      this.speech.speakClue(`Hooray! That is ${targetZone.toUpperCase()}! शाबाश, यह है ${sizeHi}!`);

      this.selectedItem = null;

      if (this.allCurrentSorted) {
        setTimeout(() => {
          this.sound.playFanfare();
          this.confetti.fire();
          this.totalStars += 3;
          localStorage.setItem('toddler_total_stars', this.totalStars.toString());
          this.speech.speakClue('Superstar! You sorted big, medium, and small! बहुत बढ़िया!');
          this.cdr.detectChanges();
        }, 300);
      }
    } else {
      // Gentle mismatch feedback
      this.sound.playBoing();
      this.wobbleItemId = this.selectedItem.id;
      setTimeout(() => {
        this.wobbleItemId = null;
        this.cdr.detectChanges();
      }, 500);

      const targetHi = targetZone === 'big' ? 'बड़ा' : targetZone === 'medium' ? 'मंझला' : 'छोटा';
      const actualHi = this.selectedItem.size === 'big' ? 'बड़ा' : this.selectedItem.size === 'medium' ? 'मंझला' : 'छोटा';
      this.speech.speakClue(`Oopsie! This is ${actualHi}, try the ${this.selectedItem.size} basket! यह ${actualHi} है!`);
    }

    this.cdr.detectChanges();
  }

  nextSet(): void {
    this.sound.playTap();
    this.currentSetIndex = (this.currentSetIndex + 1) % this.sets.length;
    // Reset sorted state of newly selected set
    for (const item of this.currentSet.items) {
      item.isSorted = false;
    }
    this.selectedItem = null;
    this.announceCurrentSet();
    this.cdr.detectChanges();
  }

  private announceCurrentSet(): void {
    setTimeout(() => {
      this.speech.speakClue(this.currentSet.promptEnglish + ' ' + this.currentSet.promptHindi);
    }, 200);
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

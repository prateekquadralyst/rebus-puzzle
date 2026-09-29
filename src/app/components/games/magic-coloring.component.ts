import { Component, ElementRef, ViewChild, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppNavService } from '../../core/services/app-nav.service';
import { SoundService } from '../../core/services/sound.service';
import { SpeechService } from '../../core/services/speech.service';
import { ConfettiService } from '../../core/services/confetti.service';

interface ColoringTemplate {
  id: string;
  name: string;
  hindiName: string;
  emoji: string;
  allParts: string[];
}

interface ColorOption {
  name: string;
  hex: string;
  isRainbow?: boolean;
}

interface SparkleParticle {
  x: number;
  y: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  vx: number;
  vy: number;
}

@Component({
  selector: 'app-magic-coloring',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="coloring-viewport">
      <!-- 🌟 Enhanced Magical Header Bar -->
      <header class="enhanced-coloring-header">
        <div class="header-left-cluster">
          <!-- 🏰 Back to Hub Button -->
          <button 
            type="button" 
            (click)="goBack()" 
            class="header-pill-btn back-pill-btn"
            id="btn-coloring-back"
            title="Back to Hub">
            <span class="pill-emoji">🏰</span>
            <span class="pill-text">Hub</span>
          </button>

          <!-- ⭐ Star Milestone Pill -->
          <div class="star-milestone-pill" (click)="onStarClick()" title="Total stars collected!">
            <span class="star-pill-icon">⭐</span>
            <span class="star-pill-count">{{ totalStars }}</span>
          </div>
        </div>

        <!-- 🎨 Center Title Capsule with Gradient & Floating Badge -->
        <div class="header-title-capsule">
          <div class="title-avatar-badge" [class.badge-sparkle]="mode === 'slate'">
            <span class="avatar-emoji">{{ mode === 'paint' ? '🎨' : '✨' }}</span>
          </div>
          <div class="title-text-stack">
            <div class="title-top-row">
              <h2 class="title-main">{{ mode === 'paint' ? 'Magic Coloring' : 'Glow Slate' }}</h2>
              <span class="title-tag-chip">{{ mode === 'paint' ? 'रंग भरो' : 'जादुई स्लेट' }}</span>
            </div>
            <span class="title-sub-cue">{{ mode === 'paint' ? 'Tap parts to color with vibrant candy paints!' : 'Draw glowing rainbow art with magic fairy dust!' }}</span>
          </div>
        </div>

        <!-- 🎛️ Right Actions Cluster -->
        <div class="header-right-cluster">
          <!-- Mode Switcher Pill -->
          <div class="mode-pill-toggle">
            <button 
              type="button" 
              class="mode-pill-btn" 
              [class.active-pill]="mode === 'paint'"
              (click)="setMode('paint')"
              title="Tap to Color Templates">
              <span>🎨 Fill</span>
            </button>
            <button 
              type="button" 
              class="mode-pill-btn" 
              [class.active-pill]="mode === 'slate'"
              (click)="setMode('slate')"
              title="Magic Glow Neon Slate">
              <span>✨ Draw</span>
            </button>
          </div>

          <!-- Sound Toggle Button -->
          <button 
            type="button" 
            (click)="sound.toggleMute()" 
            class="header-sound-btn"
            [title]="sound.isMuted() ? 'Turn Sound On' : 'Turn Sound Off'">
            <span>{{ sound.isMuted() ? '🔇' : '🎵' }}</span>
          </button>
        </div>
      </header>

      <!-- 🧸 TEMPLATE PICKER (Visible in Tap & Color mode) -->
      @if (mode === 'paint') {
        <nav class="templates-scroll-bar">
          <div class="templates-track">
            @for (tpl of templates; track tpl.id) {
              <button 
                type="button" 
                class="tpl-btn"
                [class.tpl-active]="currentTemplate.id === tpl.id"
                (click)="selectTemplate(tpl)">
                <span class="tpl-emoji">{{ tpl.emoji }}</span>
                <span class="tpl-name">{{ tpl.name }}</span>
              </button>
            }
          </div>
        </nav>
      }

      <!-- 🖼️ MAIN CANVAS STAGE -->
      <main class="canvas-stage">
        @if (mode === 'paint') {
          <!-- SVG Coloring Stage with Rich Outlines -->
          <div class="paint-stage-wrapper">
            <!-- 🌟 Live Coloring Progress Tracker (Toddler Visual Cue) -->
            <div class="progress-pill-bar">
              <span class="progress-emoji">🎨</span>
              <span class="progress-text">
                {{ coloredCount }} / {{ totalPartsCount }} {{ isFullyColored ? '🎉 पूरा रंग भर गया!' : 'हिस्से रंगे' }}
              </span>
              <div class="progress-track">
                <div 
                  class="progress-fill" 
                  [style.width.%]="(coloredCount / totalPartsCount) * 100"
                  [class.progress-complete]="isFullyColored">
                </div>
              </div>
            </div>

            <div class="drawing-paper">
              <!-- TEMPLATE 1: Teddy Bear -->
              @if (currentTemplate.id === 'teddy') {
                <svg viewBox="0 0 400 400" class="coloring-svg">
                  <!-- Ears Outer -->
                  <circle cx="120" cy="110" r="45" [attr.fill]="partColors['ear_l'] || '#ffffff'" stroke="#262626" stroke-width="8" (click)="onPartClick('ear_l', $event)" />
                  <circle cx="280" cy="110" r="45" [attr.fill]="partColors['ear_r'] || '#ffffff'" stroke="#262626" stroke-width="8" (click)="onPartClick('ear_r', $event)" />
                  <!-- Ears Inner -->
                  <circle cx="120" cy="110" r="24" [attr.fill]="partColors['ear_in_l'] || '#ffffff'" stroke="#262626" stroke-width="6" (click)="onPartClick('ear_in_l', $event)" />
                  <circle cx="280" cy="110" r="24" [attr.fill]="partColors['ear_in_r'] || '#ffffff'" stroke="#262626" stroke-width="6" (click)="onPartClick('ear_in_r', $event)" />
                  
                  <!-- Body -->
                  <ellipse cx="200" cy="275" rx="95" ry="85" [attr.fill]="partColors['body'] || '#ffffff'" stroke="#262626" stroke-width="8" (click)="onPartClick('body', $event)" />
                  <!-- Tummy -->
                  <ellipse cx="200" cy="285" rx="55" ry="50" [attr.fill]="partColors['tummy'] || '#ffffff'" stroke="#262626" stroke-width="6" (click)="onPartClick('tummy', $event)" />

                  <!-- Paws / Feet -->
                  <ellipse cx="125" cy="330" rx="35" ry="25" [attr.fill]="partColors['foot_l'] || '#ffffff'" stroke="#262626" stroke-width="7" (click)="onPartClick('foot_l', $event)" />
                  <ellipse cx="275" cy="330" rx="35" ry="25" [attr.fill]="partColors['foot_r'] || '#ffffff'" stroke="#262626" stroke-width="7" (click)="onPartClick('foot_r', $event)" />
                  <!-- Foot pads -->
                  <circle cx="125" cy="330" r="14" [attr.fill]="partColors['pad_l'] || '#ffffff'" stroke="#262626" stroke-width="4" (click)="onPartClick('pad_l', $event)" />
                  <circle cx="275" cy="330" r="14" [attr.fill]="partColors['pad_r'] || '#ffffff'" stroke="#262626" stroke-width="4" (click)="onPartClick('pad_r', $event)" />

                  <!-- Arms -->
                  <ellipse cx="95" cy="250" rx="25" ry="40" transform="rotate(25 95 250)" [attr.fill]="partColors['arm_l'] || '#ffffff'" stroke="#262626" stroke-width="7" (click)="onPartClick('arm_l', $event)" />
                  <ellipse cx="305" cy="250" rx="25" ry="40" transform="rotate(-25 305 250)" [attr.fill]="partColors['arm_r'] || '#ffffff'" stroke="#262626" stroke-width="7" (click)="onPartClick('arm_r', $event)" />

                  <!-- Head -->
                  <circle cx="200" cy="165" r="85" [attr.fill]="partColors['head'] || '#ffffff'" stroke="#262626" stroke-width="8" (click)="onPartClick('head', $event)" />
                  <!-- Snout -->
                  <ellipse cx="200" cy="190" rx="42" ry="32" [attr.fill]="partColors['snout'] || '#ffffff'" stroke="#262626" stroke-width="6" (click)="onPartClick('snout', $event)" />
                  
                  <!-- Cute Bow Tie -->
                  <polygon points="170,230 170,255 200,242" [attr.fill]="partColors['bow_l'] || '#ffffff'" stroke="#262626" stroke-width="6" (click)="onPartClick('bow_l', $event)" />
                  <polygon points="230,230 230,255 200,242" [attr.fill]="partColors['bow_r'] || '#ffffff'" stroke="#262626" stroke-width="6" (click)="onPartClick('bow_r', $event)" />
                  <circle cx="200" cy="242" r="9" [attr.fill]="partColors['bow_c'] || '#ffffff'" stroke="#262626" stroke-width="5" (click)="onPartClick('bow_c', $event)" />

                  <!-- Eyes, Nose, Mouth (Black details) -->
                  <circle cx="165" cy="148" r="9" fill="#1e293b" />
                  <circle cx="168" cy="145" r="3" fill="#ffffff" />
                  <circle cx="235" cy="148" r="9" fill="#1e293b" />
                  <circle cx="238" cy="145" r="3" fill="#ffffff" />
                  <!-- Cheeks -->
                  <circle cx="145" cy="175" r="11" [attr.fill]="partColors['cheek_l'] || '#ffffff'" stroke="#262626" stroke-width="4" (click)="onPartClick('cheek_l', $event)" />
                  <circle cx="255" cy="175" r="11" [attr.fill]="partColors['cheek_r'] || '#ffffff'" stroke="#262626" stroke-width="4" (click)="onPartClick('cheek_r', $event)" />
                  <!-- Nose & Mouth -->
                  <ellipse cx="200" cy="180" rx="14" ry="10" fill="#1e293b" />
                  <path d="M 200 190 L 200 202 M 190 202 Q 200 212 210 202" fill="none" stroke="#1e293b" stroke-width="5" stroke-linecap="round" />
                </svg>
              }

              <!-- TEMPLATE 2: Butterfly -->
              @else if (currentTemplate.id === 'butterfly') {
                <svg viewBox="0 0 400 400" class="coloring-svg">
                  <!-- Wings Upper Left & Right -->
                  <path d="M 195 190 C 140 70 40 90 60 180 C 70 230 150 220 195 200 Z" [attr.fill]="partColors['wing_top_l'] || '#ffffff'" stroke="#262626" stroke-width="8" (click)="onPartClick('wing_top_l', $event)" />
                  <path d="M 205 190 C 260 70 360 90 340 180 C 330 230 250 220 205 200 Z" [attr.fill]="partColors['wing_top_r'] || '#ffffff'" stroke="#262626" stroke-width="8" (click)="onPartClick('wing_top_r', $event)" />
                  
                  <!-- Wings Lower Left & Right -->
                  <path d="M 195 210 C 130 230 70 270 90 330 C 110 380 180 340 195 240 Z" [attr.fill]="partColors['wing_bot_l'] || '#ffffff'" stroke="#262626" stroke-width="8" (click)="onPartClick('wing_bot_l', $event)" />
                  <path d="M 205 210 C 270 230 330 270 310 330 C 290 380 220 340 205 240 Z" [attr.fill]="partColors['wing_bot_r'] || '#ffffff'" stroke="#262626" stroke-width="8" (click)="onPartClick('wing_bot_r', $event)" />

                  <!-- Wing Spots (Circles for Kids to color) -->
                  <circle cx="115" cy="165" r="22" [attr.fill]="partColors['spot_1'] || '#ffffff'" stroke="#262626" stroke-width="6" (click)="onPartClick('spot_1', $event)" />
                  <circle cx="285" cy="165" r="22" [attr.fill]="partColors['spot_2'] || '#ffffff'" stroke="#262626" stroke-width="6" (click)="onPartClick('spot_2', $event)" />
                  <circle cx="140" cy="300" r="16" [attr.fill]="partColors['spot_3'] || '#ffffff'" stroke="#262626" stroke-width="5" (click)="onPartClick('spot_3', $event)" />
                  <circle cx="260" cy="300" r="16" [attr.fill]="partColors['spot_4'] || '#ffffff'" stroke="#262626" stroke-width="5" (click)="onPartClick('spot_4', $event)" />

                  <!-- Butterfly Body -->
                  <rect x="188" y="150" width="24" height="130" rx="12" [attr.fill]="partColors['body'] || '#ffffff'" stroke="#262626" stroke-width="7" (click)="onPartClick('body', $event)" />
                  <!-- Head -->
                  <circle cx="200" cy="130" r="24" [attr.fill]="partColors['head'] || '#ffffff'" stroke="#262626" stroke-width="7" (click)="onPartClick('head', $event)" />

                  <!-- Antennas -->
                  <path d="M 192 110 Q 170 65 145 75" fill="none" stroke="#262626" stroke-width="6" stroke-linecap="round" />
                  <circle cx="145" cy="75" r="8" [attr.fill]="partColors['ant_l'] || '#ffffff'" stroke="#262626" stroke-width="4" (click)="onPartClick('ant_l', $event)" />
                  <path d="M 208 110 Q 230 65 255 75" fill="none" stroke="#262626" stroke-width="6" stroke-linecap="round" />
                  <circle cx="255" cy="75" r="8" [attr.fill]="partColors['ant_r'] || '#ffffff'" stroke="#262626" stroke-width="4" (click)="onPartClick('ant_r', $event)" />

                  <!-- Cute Eyes & Smile -->
                  <circle cx="192" cy="125" r="3.5" fill="#1e293b" />
                  <circle cx="208" cy="125" r="3.5" fill="#1e293b" />
                  <path d="M 194 136 Q 200 142 206 136" fill="none" stroke="#1e293b" stroke-width="3" stroke-linecap="round" />
                </svg>
              }

              <!-- TEMPLATE 3: Cute Car -->
              @else if (currentTemplate.id === 'car') {
                <svg viewBox="0 0 400 400" class="coloring-svg">
                  <!-- Car Body Base -->
                  <path d="M 60 250 L 340 250 C 355 250 365 240 360 225 L 340 190 C 335 180 320 180 310 180 L 275 180 L 240 120 C 235 110 220 110 210 110 L 140 110 C 130 110 120 120 110 135 L 75 180 L 50 195 C 40 205 40 225 45 235 Z" 
                    [attr.fill]="partColors['car_body'] || '#ffffff'" stroke="#262626" stroke-width="8" (click)="onPartClick('car_body', $event)" />

                  <!-- Front & Rear Windows -->
                  <polygon points="125,180 148,125 190,125 190,180" [attr.fill]="partColors['win_front'] || '#ffffff'" stroke="#262626" stroke-width="6" (click)="onPartClick('win_front', $event)" />
                  <polygon points="205,180 205,125 235,125 265,180" [attr.fill]="partColors['win_back'] || '#ffffff'" stroke="#262626" stroke-width="6" (click)="onPartClick('win_back', $event)" />

                  <!-- Headlight & Taillight -->
                  <path d="M 45 210 C 40 210 40 225 45 230 Z" [attr.fill]="partColors['light_rear'] || '#ffffff'" stroke="#262626" stroke-width="5" (click)="onPartClick('light_rear', $event)" />
                  <path d="M 350 200 C 362 205 362 220 350 225 Z" [attr.fill]="partColors['light_front'] || '#ffffff'" stroke="#262626" stroke-width="5" (click)="onPartClick('light_front', $event)" />

                  <!-- Road Ground -->
                  <line x1="30" y1="315" x2="370" y2="315" stroke="#94a3b8" stroke-width="6" stroke-dasharray="16 12" stroke-linecap="round" />

                  <!-- Left Wheel Outer & Hub -->
                  <circle cx="120" cy="265" r="42" [attr.fill]="partColors['wheel_l'] || '#ffffff'" stroke="#262626" stroke-width="8" (click)="onPartClick('wheel_l', $event)" />
                  <circle cx="120" cy="265" r="20" [attr.fill]="partColors['hub_l'] || '#ffffff'" stroke="#262626" stroke-width="5" (click)="onPartClick('hub_l', $event)" />

                  <!-- Right Wheel Outer & Hub -->
                  <circle cx="280" cy="265" r="42" [attr.fill]="partColors['wheel_r'] || '#ffffff'" stroke="#262626" stroke-width="8" (click)="onPartClick('wheel_r', $event)" />
                  <circle cx="280" cy="265" r="20" [attr.fill]="partColors['hub_r'] || '#ffffff'" stroke="#262626" stroke-width="5" (click)="onPartClick('hub_r', $event)" />
                </svg>
              }

              <!-- TEMPLATE 4: Apple & Leaf -->
              @else if (currentTemplate.id === 'apple') {
                <svg viewBox="0 0 400 400" class="coloring-svg">
                  <!-- Leaf -->
                  <path d="M 215 110 C 240 70 290 80 300 100 C 290 140 240 140 215 110 Z" [attr.fill]="partColors['leaf'] || '#ffffff'" stroke="#262626" stroke-width="7" (click)="onPartClick('leaf', $event)" />
                  <!-- Stem -->
                  <path d="M 200 150 C 190 110 205 70 215 60" fill="none" stroke="#78350f" stroke-width="12" stroke-linecap="round" />

                  <!-- Apple Left Half -->
                  <path d="M 200 150 C 150 110 70 140 70 220 C 70 300 140 350 200 340 Z" [attr.fill]="partColors['apple_l'] || '#ffffff'" stroke="#262626" stroke-width="8" (click)="onPartClick('apple_l', $event)" />
                  <!-- Apple Right Half -->
                  <path d="M 200 150 C 250 110 330 140 330 220 C 330 300 260 350 200 340 Z" [attr.fill]="partColors['apple_r'] || '#ffffff'" stroke="#262626" stroke-width="8" (click)="onPartClick('apple_r', $event)" />

                  <!-- Cute smiling face on Apple -->
                  <circle cx="160" cy="220" r="8" fill="#1e293b" />
                  <circle cx="162" cy="217" r="2.5" fill="#ffffff" />
                  <circle cx="240" cy="220" r="8" fill="#1e293b" />
                  <circle cx="242" cy="217" r="2.5" fill="#ffffff" />
                  <!-- Cheeks -->
                  <circle cx="140" cy="240" r="10" [attr.fill]="partColors['cheek_l'] || '#ffffff'" stroke="#262626" stroke-width="4" (click)="onPartClick('cheek_l', $event)" />
                  <circle cx="260" cy="240" r="10" [attr.fill]="partColors['cheek_r'] || '#ffffff'" stroke="#262626" stroke-width="4" (click)="onPartClick('cheek_r', $event)" />
                  <path d="M 185 245 Q 200 260 215 245" fill="none" stroke="#1e293b" stroke-width="5" stroke-linecap="round" />
                </svg>
              }

              <!-- TEMPLATE 5: Cute Dinosaur -->
              @else if (currentTemplate.id === 'dino') {
                <svg viewBox="0 0 400 400" class="coloring-svg">
                  <!-- Spikes / Plates on back -->
                  <polygon points="120,110 135,70 150,105" [attr.fill]="partColors['spike_1'] || '#ffffff'" stroke="#262626" stroke-width="6" (click)="onPartClick('spike_1', $event)" />
                  <polygon points="155,115 175,75 190,115" [attr.fill]="partColors['spike_2'] || '#ffffff'" stroke="#262626" stroke-width="6" (click)="onPartClick('spike_2', $event)" />
                  <polygon points="90,140 70,115 95,160" [attr.fill]="partColors['spike_3'] || '#ffffff'" stroke="#262626" stroke-width="6" (click)="onPartClick('spike_3', $event)" />

                  <!-- Dinosaur Body & Tail -->
                  <path d="M 100 240 C 60 240 30 200 20 170 C 50 190 80 200 110 200 L 120 120 C 130 90 190 90 230 110 C 270 130 280 160 260 180 C 240 195 210 190 200 200 C 190 210 210 270 190 320 L 150 320 C 140 280 130 240 100 240 Z" 
                    [attr.fill]="partColors['dino_body'] || '#ffffff'" stroke="#262626" stroke-width="8" (click)="onPartClick('dino_body', $event)" />

                  <!-- Tummy Patch -->
                  <path d="M 160 195 C 190 195 195 240 180 280 C 160 280 150 230 160 195 Z" [attr.fill]="partColors['dino_tummy'] || '#ffffff'" stroke="#262626" stroke-width="6" (click)="onPartClick('dino_tummy', $event)" />

                  <!-- Legs -->
                  <rect x="135" y="300" width="30" height="45" rx="12" [attr.fill]="partColors['leg_l'] || '#ffffff'" stroke="#262626" stroke-width="7" (click)="onPartClick('leg_l', $event)" />
                  <rect x="175" y="300" width="30" height="45" rx="12" [attr.fill]="partColors['leg_r'] || '#ffffff'" stroke="#262626" stroke-width="7" (click)="onPartClick('leg_r', $event)" />

                  <!-- Eye & Smile -->
                  <circle cx="215" cy="135" r="9" fill="#1e293b" />
                  <circle cx="218" cy="132" r="3" fill="#ffffff" />
                  <path d="M 230 155 Q 245 165 240 175" fill="none" stroke="#1e293b" stroke-width="4" stroke-linecap="round" />
                </svg>
              }

              <!-- TEMPLATE 6: Birthday Cake -->
              @else if (currentTemplate.id === 'cake') {
                <svg viewBox="0 0 400 400" class="coloring-svg">
                  <!-- Plate -->
                  <ellipse cx="200" cy="335" rx="150" ry="25" [attr.fill]="partColors['plate'] || '#ffffff'" stroke="#262626" stroke-width="7" (click)="onPartClick('plate', $event)" />

                  <!-- Bottom Cake Tier -->
                  <rect x="80" y="240" width="240" height="85" rx="14" [attr.fill]="partColors['cake_base'] || '#ffffff'" stroke="#262626" stroke-width="8" (click)="onPartClick('cake_base', $event)" />
                  <!-- Bottom Frosting drips -->
                  <path d="M 80 240 Q 110 270 140 240 Q 170 270 200 240 Q 230 270 260 240 Q 290 270 320 240 Z" [attr.fill]="partColors['frost_base'] || '#ffffff'" stroke="#262626" stroke-width="6" (click)="onPartClick('frost_base', $event)" />

                  <!-- Top Cake Tier -->
                  <rect x="120" y="160" width="160" height="80" rx="12" [attr.fill]="partColors['cake_top'] || '#ffffff'" stroke="#262626" stroke-width="8" (click)="onPartClick('cake_top', $event)" />
                  <!-- Top Frosting drips -->
                  <path d="M 120 160 Q 150 185 180 160 Q 210 185 240 160 Q 260 180 280 160 Z" [attr.fill]="partColors['frost_top'] || '#ffffff'" stroke="#262626" stroke-width="6" (click)="onPartClick('frost_top', $event)" />

                  <!-- 3 Candles -->
                  <rect x="150" y="105" width="14" height="55" rx="5" [attr.fill]="partColors['candle_1'] || '#ffffff'" stroke="#262626" stroke-width="4" (click)="onPartClick('candle_1', $event)" />
                  <polygon points="157,80 164,100 150,100" [attr.fill]="partColors['flame_1'] || '#ffffff'" stroke="#ea580c" stroke-width="3" (click)="onPartClick('flame_1', $event)" />

                  <rect x="193" y="95" width="14" height="65" rx="5" [attr.fill]="partColors['candle_2'] || '#ffffff'" stroke="#262626" stroke-width="4" (click)="onPartClick('candle_2', $event)" />
                  <polygon points="200,70 207,90 193,90" [attr.fill]="partColors['flame_2'] || '#ffffff'" stroke="#ea580c" stroke-width="3" (click)="onPartClick('flame_2', $event)" />

                  <rect x="236" y="105" width="14" height="55" rx="5" [attr.fill]="partColors['candle_3'] || '#ffffff'" stroke="#262626" stroke-width="4" (click)="onPartClick('candle_3', $event)" />
                  <polygon points="243,80 250,100 236,100" [attr.fill]="partColors['flame_3'] || '#ffffff'" stroke="#ea580c" stroke-width="3" (click)="onPartClick('flame_3', $event)" />
                </svg>
              }

              <!-- TEMPLATE 7: Space Rocket -->
              @else {
                <svg viewBox="0 0 400 400" class="coloring-svg">
                  <!-- Exhaust Flame -->
                  <polygon points="175,290 200,360 225,290" [attr.fill]="partColors['flame_out'] || '#ffffff'" stroke="#262626" stroke-width="6" (click)="onPartClick('flame_out', $event)" />
                  <polygon points="185,290 200,335 215,290" [attr.fill]="partColors['flame_in'] || '#ffffff'" stroke="#262626" stroke-width="4" (click)="onPartClick('flame_in', $event)" />

                  <!-- Side Wings -->
                  <path d="M 160 230 L 105 285 L 160 280 Z" [attr.fill]="partColors['wing_l'] || '#ffffff'" stroke="#262626" stroke-width="7" (click)="onPartClick('wing_l', $event)" />
                  <path d="M 240 230 L 295 285 L 240 280 Z" [attr.fill]="partColors['wing_r'] || '#ffffff'" stroke="#262626" stroke-width="7" (click)="onPartClick('wing_r', $event)" />

                  <!-- Rocket Body Cylinder -->
                  <path d="M 160 140 C 160 240 160 290 160 290 L 240 290 C 240 290 240 240 240 140 Z" [attr.fill]="partColors['body'] || '#ffffff'" stroke="#262626" stroke-width="8" (click)="onPartClick('body', $event)" />

                  <!-- Rocket Nosecone -->
                  <path d="M 160 140 C 160 100 200 50 200 50 C 200 50 240 100 240 140 Z" [attr.fill]="partColors['nose'] || '#ffffff'" stroke="#262626" stroke-width="8" (click)="onPartClick('nose', $event)" />

                  <!-- Porthole Window -->
                  <circle cx="200" cy="180" r="28" [attr.fill]="partColors['port_ring'] || '#ffffff'" stroke="#262626" stroke-width="6" (click)="onPartClick('port_ring', $event)" />
                  <circle cx="200" cy="180" r="18" [attr.fill]="partColors['port_glass'] || '#ffffff'" stroke="#262626" stroke-width="4" (click)="onPartClick('port_glass', $event)" />
                </svg>
              }
            </div>
          </div>
        } @else {
          <!-- ✨ MAGIC GLOW SLATE (Touch Canvas with Neon Rainbow Sparkles) -->
          <div class="glow-slate-container">
            <canvas 
              #slateCanvas 
              class="slate-canvas"
              (mousedown)="startDrawing($event)"
              (mousemove)="draw($event)"
              (mouseup)="stopDrawing()"
              (mouseleave)="stopDrawing()"
              (touchstart)="handleTouchStart($event)"
              (touchmove)="handleTouchMove($event)"
              (touchend)="stopDrawing()">
            </canvas>
            
            <div class="slate-hint-pill">
              <span>✨ Use your finger to draw glowing rainbow art!</span>
            </div>
          </div>
        }
      </main>

      <!-- 🎨 CHUNKY COLOR PALETTE & TOOLS DOCK -->
      <footer class="controls-dock">
        <!-- Color Circles Track -->
        <div class="palette-bar">
          @for (color of colorPalette; track color.name) {
            <button 
              type="button" 
              class="color-btn"
              [class.active-color]="selectedColor.name === color.name"
              [style.background]="color.isRainbow ? 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)' : color.hex"
              (click)="selectColor(color)"
              [title]="color.name">
              @if (color.isRainbow) {
                <span class="rainbow-star">🌈</span>
              } @else if (selectedColor.name === color.name) {
                <span class="check-mark">✓</span>
              }
            </button>
          }
        </div>

        <!-- Utility Action Tools -->
        <div class="action-tools-row">
          @if (mode === 'slate') {
            <!-- Brush Size Picker -->
            <div class="brush-size-group">
              <button 
                type="button" 
                class="tool-btn size-btn" 
                [class.size-active]="brushSize === 10" 
                (click)="setBrushSize(10)">
                <span class="dot dot-sm"></span>
              </button>
              <button 
                type="button" 
                class="tool-btn size-btn" 
                [class.size-active]="brushSize === 22" 
                (click)="setBrushSize(22)">
                <span class="dot dot-md"></span>
              </button>
              <button 
                type="button" 
                class="tool-btn size-btn" 
                [class.size-active]="brushSize === 36" 
                (click)="setBrushSize(36)">
                <span class="dot dot-lg"></span>
              </button>
            </div>

            <!-- Clear Slate -->
            <button 
              type="button" 
              class="tool-btn clear-btn" 
              (click)="clearSlate()"
              title="Clear Slate">
              <span>🧹 Clear</span>
            </button>
          } @else {
            <!-- Reset Colors -->
            <button 
              type="button" 
              class="tool-btn clear-btn" 
              (click)="resetTemplateColors()"
              title="Start Over">
              <span>🔄 Reset</span>
            </button>
          }

          <!-- Celebration Cheer Button (Manual trigger if fully colored or clicked) -->
          <button 
            type="button" 
            class="tool-btn celebrate-btn" 
            (click)="onDoneClick()"
            title="Celebrate!">
            <span>🌟 Done!</span>
          </button>
        </div>
      </footer>

      <!-- 🥳 WIN CELEBRATION POPUP (Triggers ONLY when 100% of parts are colored!) -->
      @if (showWinModal) {
        <div class="win-overlay" (click)="closeWinModal()">
          <div class="win-card animate-pop" (click)="$event.stopPropagation()">
            <span class="win-star-emoji">🌟🧸🎨</span>
            <h3 class="win-heading">वाह! कितना सुंदर!</h3>
            <p class="win-sub">Super Artist! आपने पूरा चित्र बहुत सुंदर रंग दिया!</p>

            <div class="win-actions">
              <button type="button" class="win-btn primary-win" (click)="closeWinModal()">
                <span>🎨 Keep Playing</span>
              </button>
              <button type="button" class="win-btn secondary-win" (click)="nextTemplate()">
                <span>➡️ Next Picture (अगला चित्र)</span>
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .coloring-viewport {
      min-height: 100vh;
      min-height: 100dvh;
      width: 100%;
      background: radial-gradient(circle at 50% 15%, #1e1b4b 0%, #0f172a 65%, #020617 100%);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      user-select: none;
      overflow-x: hidden;
      touch-action: manipulation;
    }

    /* 🌟 Enhanced Magical Header */
    .enhanced-coloring-header {
      width: 100%;
      max-width: 980px;
      margin: 8px auto 4px auto;
      padding: 10px 18px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      background: rgba(15, 23, 42, 0.72);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1.5px solid rgba(255, 255, 255, 0.16);
      border-radius: 28px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45), 0 0 20px rgba(124, 58, 237, 0.15);
      z-index: 30;
      position: relative;
    }

    .header-left-cluster {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }

    .header-pill-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 14px;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.12);
      border: 1.5px solid rgba(255, 255, 255, 0.24);
      color: #ffffff;
      font-family: var(--font-display);
      font-size: 0.8rem;
      font-weight: 800;
      cursor: pointer;
      backdrop-filter: blur(8px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .header-pill-btn:hover {
      background: rgba(255, 255, 255, 0.25);
      transform: translateY(-2px) scale(1.04);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
    }
    .header-pill-btn:active {
      transform: translateY(1px) scale(0.96);
    }
    .pill-emoji {
      font-size: 17px;
    }

    .star-milestone-pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 6px 12px;
      border-radius: 20px;
      background: rgba(245, 158, 11, 0.2);
      border: 1.5px solid rgba(251, 191, 36, 0.5);
      color: #fde047;
      font-family: var(--font-display);
      font-size: 0.8rem;
      font-weight: 900;
      cursor: pointer;
      box-shadow: 0 2px 10px rgba(245, 158, 11, 0.25);
      transition: all 0.2s;
    }
    .star-milestone-pill:hover {
      transform: scale(1.08);
      background: rgba(245, 158, 11, 0.3);
      box-shadow: 0 0 15px rgba(253, 224, 71, 0.5);
    }
    .star-pill-icon {
      font-size: 15px;
      animation: starTwinkle 2s infinite alternate ease-in-out;
    }

    /* Center Title Capsule */
    .header-title-capsule {
      display: flex;
      align-items: center;
      gap: 10px;
      text-align: left;
    }

    .title-avatar-badge {
      width: 44px;
      height: 44px;
      min-width: 44px;
      border-radius: 50%;
      background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
      border: 2px solid rgba(255, 255, 255, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 6px 16px rgba(236, 72, 153, 0.4);
      transition: transform 0.3s;
    }
    .avatar-emoji {
      font-size: 22px;
    }
    .title-avatar-badge.badge-sparkle {
      background: linear-gradient(135deg, #f59e0b 0%, #a855f7 100%);
      box-shadow: 0 6px 20px rgba(168, 85, 247, 0.5);
    }

    .title-text-stack {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }
    .title-top-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .title-main {
      font-family: var(--font-display);
      font-size: clamp(1.05rem, 3.2vw, 1.32rem);
      font-weight: 900;
      margin: 0;
      letter-spacing: -0.01em;
      background: linear-gradient(135deg, #ffffff 10%, #fde047 60%, #f472b6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 0 2px 14px rgba(236, 72, 153, 0.3);
    }
    .title-tag-chip {
      font-size: 0.72rem;
      font-weight: 800;
      color: #fde047;
      background: rgba(253, 224, 71, 0.18);
      padding: 2px 8px;
      border-radius: 12px;
      border: 1px solid rgba(253, 224, 71, 0.45);
      letter-spacing: 0.02em;
    }
    .title-sub-cue {
      font-size: 0.68rem;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.75);
      line-height: 1.2;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    /* Right Cluster */
    .header-right-cluster {
      display: flex;
      align-items: center;
      gap: 9px;
      flex-shrink: 0;
    }

    .mode-pill-toggle {
      display: flex;
      background: rgba(255, 255, 255, 0.08);
      padding: 4px;
      border-radius: 24px;
      border: 1.5px solid rgba(255, 255, 255, 0.18);
      box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.3);
    }
    .mode-pill-btn {
      padding: 6px 13px;
      border-radius: 18px;
      border: none;
      background: transparent;
      color: #cbd5e1;
      font-family: var(--font-display);
      font-size: 0.76rem;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .mode-pill-btn.active-pill {
      background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
      color: #ffffff;
      box-shadow: 0 4px 14px rgba(236, 72, 153, 0.5);
      transform: scale(1.05);
    }

    .header-sound-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 1.5px solid rgba(255, 255, 255, 0.24);
      background: rgba(255, 255, 255, 0.12);
      color: #ffffff;
      font-size: 18px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(8px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .header-sound-btn:hover {
      background: rgba(255, 255, 255, 0.25);
      transform: scale(1.1);
    }
    .header-sound-btn:active {
      transform: scale(0.94);
    }

    @keyframes starTwinkle {
      0% { transform: scale(0.9) rotate(0deg); opacity: 0.85; }
      100% { transform: scale(1.15) rotate(15deg); opacity: 1; }
    }

    @media (max-width: 640px) {
      .enhanced-coloring-header {
        border-radius: 20px;
        padding: 8px 12px;
        gap: 8px;
      }
      .title-sub-cue {
        display: none;
      }
      .title-avatar-badge {
        width: 36px;
        height: 36px;
        min-width: 36px;
      }
      .avatar-emoji {
        font-size: 18px;
      }
      .title-main {
        font-size: 1rem;
      }
      .header-pill-btn {
        padding: 6px 10px;
        font-size: 0.74rem;
      }
      .star-milestone-pill {
        padding: 5px 9px;
        font-size: 0.74rem;
      }
      .mode-pill-btn {
        padding: 5px 9px;
        font-size: 0.7rem;
      }
      .header-sound-btn {
        width: 34px;
        height: 34px;
        font-size: 15px;
      }
    }

    /* Template Picker Bar */
    .templates-scroll-bar {
      width: 100%;
      max-width: 800px;
      margin: 0 auto;
      padding: 4px 14px;
      overflow-x: auto;
      scrollbar-width: none;
    }
    .templates-scroll-bar::-webkit-scrollbar {
      display: none;
    }
    .templates-track {
      display: flex;
      gap: 8px;
      justify-content: center;
      min-width: max-content;
      margin: 0 auto;
    }
    .tpl-btn {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 6px 12px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.08);
      border: 1.5px solid rgba(255, 255, 255, 0.18);
      color: #cbd5e1;
      font-size: 0.74rem;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.2s;
    }
    .tpl-btn:hover {
      background: rgba(255, 255, 255, 0.16);
      transform: translateY(-2px);
    }
    .tpl-btn.tpl-active {
      background: linear-gradient(135deg, #f59e0b, #ec4899);
      border-color: #fde047;
      color: #ffffff;
      box-shadow: 0 4px 14px rgba(245, 158, 11, 0.45);
      transform: scale(1.05);
    }
    .tpl-emoji {
      font-size: 16px;
    }

    /* Main Stage */
    .canvas-stage {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 6px 10px;
      position: relative;
    }

    .paint-stage-wrapper {
      width: 100%;
      max-width: 440px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    /* Progress pill bar */
    .progress-pill-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      padding: 5px 14px;
      border-radius: 20px;
      backdrop-filter: blur(8px);
    }
    .progress-emoji {
      font-size: 16px;
    }
    .progress-text {
      color: #fde047;
      font-size: 0.76rem;
      font-weight: 800;
    }
    .progress-track {
      width: 80px;
      height: 8px;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.2);
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #ec4899, #f59e0b);
      border-radius: 6px;
      transition: width 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .progress-fill.progress-complete {
      background: #10b981;
      box-shadow: 0 0 10px #10b981;
    }

    .drawing-paper {
      width: 100%;
      aspect-ratio: 1;
      background: #ffffff;
      border-radius: 28px;
      box-shadow: 0 12px 35px rgba(0, 0, 0, 0.5), inset 0 0 0 6px #fef08a;
      overflow: hidden;
      padding: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .coloring-svg {
      width: 100%;
      height: 100%;
      cursor: pointer;
    }
    .coloring-svg path, 
    .coloring-svg circle, 
    .coloring-svg ellipse, 
    .coloring-svg polygon, 
    .coloring-svg rect {
      cursor: pointer;
      transition: fill 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.15s;
    }
    .coloring-svg path:hover, 
    .coloring-svg circle:hover, 
    .coloring-svg ellipse:hover, 
    .coloring-svg polygon:hover, 
    .coloring-svg rect:hover {
      filter: brightness(0.92);
    }

    /* Glow Slate Canvas */
    .glow-slate-container {
      width: 100%;
      max-width: 500px;
      height: 60vh;
      max-height: 480px;
      position: relative;
      background: #090d16;
      border-radius: 28px;
      box-shadow: 0 12px 35px rgba(0, 0, 0, 0.6), inset 0 0 0 3px rgba(168, 85, 247, 0.4);
      overflow: hidden;
      touch-action: none;
    }

    .slate-canvas {
      width: 100%;
      height: 100%;
      display: block;
      cursor: crosshair;
      touch-action: none;
    }

    .slate-hint-pill {
      position: absolute;
      bottom: 12px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.2);
      padding: 5px 14px;
      border-radius: 20px;
      color: #cbd5e1;
      font-size: 0.72rem;
      font-weight: 700;
      pointer-events: none;
      backdrop-filter: blur(6px);
    }

    /* Bottom Dock Controls */
    .controls-dock {
      width: 100%;
      max-width: 720px;
      margin: 0 auto;
      padding: 8px 16px 14px 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      z-index: 20;
    }

    .palette-bar {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      overflow-x: auto;
      padding: 4px 6px;
      scrollbar-width: none;
    }
    .palette-bar::-webkit-scrollbar {
      display: none;
    }

    .color-btn {
      width: 38px;
      height: 38px;
      min-width: 38px;
      border-radius: 50%;
      border: 3px solid rgba(255, 255, 255, 0.6);
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.35);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .color-btn:hover {
      transform: scale(1.15);
    }
    .color-btn.active-color {
      transform: scale(1.28);
      border-color: #ffffff;
      box-shadow: 0 0 16px rgba(255, 255, 255, 0.8);
    }
    .check-mark {
      color: #0f172a;
      font-weight: 900;
      font-size: 14px;
      text-shadow: 0 0 4px #ffffff;
    }
    .rainbow-star {
      font-size: 15px;
    }

    /* Tools Bar */
    .action-tools-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }

    .brush-size-group {
      display: flex;
      align-items: center;
      gap: 4px;
      background: rgba(255, 255, 255, 0.1);
      padding: 3px 6px;
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.15);
    }
    .size-btn {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: transparent;
      cursor: pointer;
      border-radius: 50%;
    }
    .size-btn.size-active {
      background: rgba(255, 255, 255, 0.25);
    }
    .dot {
      background: #ffffff;
      border-radius: 50%;
      display: inline-block;
    }
    .dot-sm { width: 6px; height: 6px; }
    .dot-md { width: 12px; height: 12px; }
    .dot-lg { width: 18px; height: 18px; }

    .tool-btn {
      padding: 8px 16px;
      border-radius: 20px;
      font-family: var(--font-display);
      font-size: 0.78rem;
      font-weight: 900;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }

    .clear-btn {
      background: rgba(239, 68, 68, 0.2);
      border: 1.5px solid rgba(239, 68, 68, 0.4);
      color: #fca5a5;
    }
    .clear-btn:hover {
      background: rgba(239, 68, 68, 0.35);
      color: #ffffff;
      transform: translateY(-2px);
    }

    .celebrate-btn {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.45);
    }
    .celebrate-btn:hover {
      transform: scale(1.06);
      box-shadow: 0 6px 18px rgba(16, 185, 129, 0.65);
    }

    /* Win Celebration Popup */
    .win-overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(10px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      z-index: 100;
    }
    .win-card {
      background: linear-gradient(165deg, #1e1b4b 0%, #0f172a 100%);
      border: 3px solid #facc15;
      border-radius: 32px;
      padding: 28px 24px;
      max-width: 380px;
      width: 100%;
      text-align: center;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7), 0 0 35px rgba(250, 204, 21, 0.4);
    }
    .win-star-emoji {
      font-size: 52px;
      display: block;
      margin-bottom: 10px;
      animation: bounce 1.2s infinite;
    }
    .win-heading {
      font-family: var(--font-display);
      font-size: 1.6rem;
      font-weight: 900;
      color: #fde047;
      margin: 0;
      text-shadow: 0 2px 10px rgba(253, 224, 71, 0.5);
    }
    .win-sub {
      color: #e2e8f0;
      font-size: 0.9rem;
      font-weight: 600;
      margin: 8px 0 20px 0;
    }
    .win-actions {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .win-btn {
      padding: 12px;
      border-radius: 20px;
      font-family: var(--font-display);
      font-size: 0.92rem;
      font-weight: 900;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
    }
    .primary-win {
      background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);
      color: #ffffff;
      box-shadow: 0 6px 18px rgba(236, 72, 153, 0.5);
    }
    .secondary-win {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: #ffffff;
      box-shadow: 0 6px 18px rgba(16, 185, 129, 0.4);
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
    .animate-pop {
      animation: popIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    @keyframes popIn {
      0% { transform: scale(0.6); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
  `]
})
export class MagicColoringComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('slateCanvas') slateCanvasRef?: ElementRef<HTMLCanvasElement>;

  mode: 'paint' | 'slate' = 'paint';

  readonly templates: ColoringTemplate[] = [
    {
      id: 'teddy',
      name: 'Teddy',
      hindiName: 'टेडी',
      emoji: '🧸',
      allParts: [
        'ear_l', 'ear_r', 'ear_in_l', 'ear_in_r',
        'head', 'snout', 'cheek_l', 'cheek_r',
        'bow_l', 'bow_r', 'bow_c',
        'body', 'tummy', 'arm_l', 'arm_r',
        'foot_l', 'foot_r', 'pad_l', 'pad_r'
      ]
    },
    {
      id: 'butterfly',
      name: 'Butterfly',
      hindiName: 'तितली',
      emoji: '🦋',
      allParts: [
        'wing_top_l', 'wing_top_r', 'wing_bot_l', 'wing_bot_r',
        'spot_1', 'spot_2', 'spot_3', 'spot_4',
        'body', 'head', 'ant_l', 'ant_r'
      ]
    },
    {
      id: 'car',
      name: 'Car',
      hindiName: 'कार',
      emoji: '🚗',
      allParts: [
        'car_body', 'win_front', 'win_back',
        'light_front', 'light_rear',
        'wheel_l', 'wheel_r', 'hub_l', 'hub_r'
      ]
    },
    {
      id: 'apple',
      name: 'Apple',
      hindiName: 'सेब',
      emoji: '🍎',
      allParts: [
        'apple_l', 'apple_r', 'leaf',
        'cheek_l', 'cheek_r'
      ]
    },
    {
      id: 'dino',
      name: 'Baby Dino',
      hindiName: 'डायनासोर',
      emoji: '🦕',
      allParts: [
        'dino_body', 'dino_tummy',
        'spike_1', 'spike_2', 'spike_3',
        'leg_l', 'leg_r'
      ]
    },
    {
      id: 'cake',
      name: 'Cake',
      hindiName: 'केक',
      emoji: '🎂',
      allParts: [
        'plate', 'cake_base', 'frost_base',
        'cake_top', 'frost_top',
        'candle_1', 'flame_1', 'candle_2', 'flame_2', 'candle_3', 'flame_3'
      ]
    },
    {
      id: 'rocket',
      name: 'Rocket',
      hindiName: 'रॉकेट',
      emoji: '🚀',
      allParts: [
        'nose', 'body', 'wing_l', 'wing_r',
        'port_ring', 'port_glass', 'flame_out', 'flame_in'
      ]
    }
  ];

  readonly colorPalette: ColorOption[] = [
    { name: 'Red', hex: '#ef4444' },
    { name: 'Orange', hex: '#f97316' },
    { name: 'Yellow', hex: '#facc15' },
    { name: 'Lime', hex: '#22c55e' },
    { name: 'Aqua', hex: '#06b6d4' },
    { name: 'Blue', hex: '#3b82f6' },
    { name: 'Purple', hex: '#a855f7' },
    { name: 'Pink', hex: '#ec4899' },
    { name: 'Brown', hex: '#854d0e' },
    { name: 'White', hex: '#ffffff' },
    { name: 'Dark', hex: '#1e293b' },
    { name: 'Rainbow', hex: '#ff007f', isRainbow: true }
  ];

  currentTemplate: ColoringTemplate = this.templates[0];
  partColors: { [partId: string]: string } = {};
  coloredPartIds = new Set<string>();
  selectedColor: ColorOption = this.colorPalette[0];
  brushSize = 22;
  showWinModal = false;
  totalStars = 28;

  // Drawing state for Canvas
  private isDrawing = false;
  private lastX = 0;
  private lastY = 0;
  private ctx: CanvasRenderingContext2D | null = null;
  private rainbowHue = 0;
  private sparkles: SparkleParticle[] = [];
  private animFrameId: number | null = null;
  private completionTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(
    public appNav: AppNavService,
    public sound: SoundService,
    private speech: SpeechService,
    private confetti: ConfettiService
  ) {}

  ngOnInit(): void {
    const saved = localStorage.getItem('toddler_total_stars');
    if (saved) {
      this.totalStars = parseInt(saved, 10) || 28;
    }
  }

  onStarClick(): void {
    this.sound.playSuccess();
    this.confetti.fire();
    this.speech.speakClue(`You have ${this.totalStars} stars! Super artist!`);
  }

  get coloredCount(): number {
    return this.coloredPartIds.size;
  }

  get totalPartsCount(): number {
    return this.currentTemplate.allParts.length;
  }

  get isFullyColored(): boolean {
    return this.coloredCount >= this.totalPartsCount;
  }

  ngAfterViewInit(): void {
    if (this.mode === 'slate') {
      this.initCanvas();
    }
  }

  ngOnDestroy(): void {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }
    if (this.completionTimeout) {
      clearTimeout(this.completionTimeout);
    }
  }

  setMode(mode: 'paint' | 'slate'): void {
    this.sound.playTap();
    this.mode = mode;
    if (mode === 'slate') {
      setTimeout(() => this.initCanvas(), 60);
      this.speech.speakClue('जादुई स्लेट! अपनी उंगली से रेनबो ड्रॉइंग बनाओ!');
    } else {
      this.speech.speakClue(`रंग भरो! चलो ${this.currentTemplate.hindiName} में रंग भरें!`);
    }
  }

  selectTemplate(tpl: ColoringTemplate): void {
    this.sound.playTap();
    this.currentTemplate = tpl;
    this.resetTemplateColors();
    this.speech.speakClue(`वाह, ${tpl.hindiName}!`);
  }

  nextTemplate(): void {
    this.closeWinModal();
    const currIdx = this.templates.findIndex(t => t.id === this.currentTemplate.id);
    const nextIdx = (currIdx + 1) % this.templates.length;
    this.selectTemplate(this.templates[nextIdx]);
  }

  selectColor(color: ColorOption): void {
    this.selectedColor = color;
    this.sound.playPop();
    if (color.isRainbow) {
      this.sound.playMagicSparkle();
    }
  }

  setBrushSize(size: number): void {
    this.brushSize = size;
    this.sound.playTap();
  }

  onPartClick(partId: string, event: MouseEvent): void {
    event.stopPropagation();
    
    // Assign color
    const fillColor = this.selectedColor.isRainbow 
      ? `hsl(${Math.floor(Math.random() * 360)}, 95%, 60%)` 
      : this.selectedColor.hex;

    this.partColors[partId] = fillColor;
    this.coloredPartIds.add(partId);
    this.sound.playBrushSplash();

    // ⭐ ONLY popup when 100% of parts have been colored!
    if (this.coloredPartIds.size >= this.totalPartsCount) {
      if (this.completionTimeout) clearTimeout(this.completionTimeout);
      // Give a gentle 500ms delay so child sees their last filled color!
      this.completionTimeout = setTimeout(() => {
        this.celebrateArtwork();
      }, 500);
    }
  }

  resetTemplateColors(): void {
    this.partColors = {};
    this.coloredPartIds.clear();
    if (this.completionTimeout) clearTimeout(this.completionTimeout);
  }

  onDoneClick(): void {
    if (this.isFullyColored) {
      this.celebrateArtwork();
    } else {
      // Gentle encouragement
      this.sound.playGiggle();
      const remaining = this.totalPartsCount - this.coloredCount;
      this.speech.speakHindi(`अरे वाह! अभी ${remaining} हिस्से बाकी हैं, पूरा रंग भरें!`);
    }
  }

  celebrateArtwork(): void {
    this.sound.playFanfare();
    this.sound.playMagicSparkle();
    this.confetti.fire();
    this.speech.speakHindi('वाह! आपने पूरा चित्र बहुत सुंदर रंग दिया! शाबाश!');
    this.showWinModal = true;
  }

  closeWinModal(): void {
    this.showWinModal = false;
  }

  goBack(): void {
    this.sound.playTap();
    this.appNav.goToHub();
  }

  /* ------------------ ✨ CANVAS GLOW SLATE LOGIC ------------------ */

  private initCanvas(): void {
    const canvas = this.slateCanvasRef?.nativeElement;
    if (!canvas) return;

    // Handle high DPI
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * (window.devicePixelRatio || 1);
    canvas.height = rect.height * (window.devicePixelRatio || 1);

    this.ctx = canvas.getContext('2d');
    if (this.ctx) {
      this.ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
    }

    this.startSparkleLoop();
  }

  startDrawing(e: MouseEvent): void {
    this.isDrawing = true;
    const pos = this.getCanvasCoords(e);
    this.lastX = pos.x;
    this.lastY = pos.y;
    this.sound.playChime(1.2);
  }

  draw(e: MouseEvent): void {
    if (!this.isDrawing || !this.ctx) return;
    const pos = this.getCanvasCoords(e);

    this.executeStroke(pos.x, pos.y);
  }

  stopDrawing(): void {
    this.isDrawing = false;
  }

  handleTouchStart(e: TouchEvent): void {
    if (e.touches.length === 0) return;
    e.preventDefault();
    const touch = e.touches[0];
    const pos = this.getTouchCoords(touch);
    this.isDrawing = true;
    this.lastX = pos.x;
    this.lastY = pos.y;
    this.sound.playChime(1.2);
  }

  handleTouchMove(e: TouchEvent): void {
    if (!this.isDrawing || !this.ctx || e.touches.length === 0) return;
    e.preventDefault();
    const touch = e.touches[0];
    const pos = this.getTouchCoords(touch);
    this.executeStroke(pos.x, pos.y);
  }

  private executeStroke(currX: number, currY: number): void {
    if (!this.ctx) return;

    this.ctx.lineWidth = this.brushSize;

    // Rainbow or chosen color
    let strokeColor = this.selectedColor.hex;
    if (this.selectedColor.isRainbow) {
      this.rainbowHue = (this.rainbowHue + 4) % 360;
      strokeColor = `hsl(${this.rainbowHue}, 100%, 65%)`;
    }

    // Glowing Neon Stroke
    this.ctx.shadowBlur = 15;
    this.ctx.shadowColor = strokeColor;
    this.ctx.strokeStyle = strokeColor;

    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(currX, currY);
    this.ctx.stroke();

    // Spawn sparkling fairy dust along stroke
    if (Math.random() < 0.45) {
      this.spawnSparkle(currX, currY, strokeColor);
      this.sound.playChime(0.9 + Math.random() * 0.6);
    }

    this.lastX = currX;
    this.lastY = currY;
  }

  clearSlate(): void {
    const canvas = this.slateCanvasRef?.nativeElement;
    if (!canvas || !this.ctx) return;
    this.sound.playSwoosh();
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.sparkles = [];
  }

  private getCanvasCoords(e: MouseEvent): { x: number; y: number } {
    const canvas = this.slateCanvasRef?.nativeElement;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  private getTouchCoords(touch: Touch): { x: number; y: number } {
    const canvas = this.slateCanvasRef?.nativeElement;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
  }

  private spawnSparkle(x: number, y: number, color: string): void {
    this.sparkles.push({
      x,
      y,
      color,
      size: 3 + Math.random() * 5,
      life: 20,
      maxLife: 20,
      vx: (Math.random() - 0.5) * 3,
      vy: (Math.random() - 0.5) * 3
    });
    if (this.sparkles.length > 50) {
      this.sparkles.shift();
    }
  }

  private startSparkleLoop(): void {
    const loop = () => {
      if (this.ctx && this.sparkles.length > 0) {
        for (let i = this.sparkles.length - 1; i >= 0; i--) {
          const sp = this.sparkles[i];
          sp.x += sp.vx;
          sp.y += sp.vy;
          sp.life--;

          // Draw star
          this.ctx.fillStyle = sp.color;
          this.ctx.shadowBlur = 10;
          this.ctx.shadowColor = '#ffffff';
          this.ctx.beginPath();
          this.ctx.arc(sp.x, sp.y, (sp.size * sp.life) / sp.maxLife, 0, Math.PI * 2);
          this.ctx.fill();

          if (sp.life <= 0) {
            this.sparkles.splice(i, 1);
          }
        }
      }
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }
}

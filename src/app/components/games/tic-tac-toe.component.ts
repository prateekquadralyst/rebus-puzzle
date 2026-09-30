import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppNavService } from '../../core/services/app-nav.service';
import { SoundService } from '../../core/services/sound.service';
import { SpeechService } from '../../core/services/speech.service';
import { ConfettiService } from '../../core/services/confetti.service';

export type GameMode = 'vs_computer' | 'pvp';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type PlayerSymbol = 'X' | 'O';
export type CellValue = PlayerSymbol | null;

interface WinningLine {
  combo: number[];
  type: 'h-0' | 'h-1' | 'h-2' | 'v-0' | 'v-1' | 'v-2' | 'diag-0' | 'diag-1';
}

const WINNING_COMBOS: { combo: number[]; type: WinningLine['type'] }[] = [
  // Horizontal
  { combo: [0, 1, 2], type: 'h-0' },
  { combo: [3, 4, 5], type: 'h-1' },
  { combo: [6, 7, 8], type: 'h-2' },
  // Vertical
  { combo: [0, 3, 6], type: 'v-0' },
  { combo: [1, 4, 7], type: 'v-1' },
  { combo: [2, 5, 8], type: 'v-2' },
  // Diagonals
  { combo: [0, 4, 8], type: 'diag-0' },
  { combo: [2, 4, 6], type: 'diag-1' }
];

@Component({
  selector: 'app-tic-tac-toe',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ttt-viewport">
      <!-- 🌟 Ambient Background Glowing Orbs -->
      <div class="glow-orb orb-top"></div>
      <div class="glow-orb orb-bottom"></div>

      <!-- 👑 Header Navigation -->
      <header class="ttt-header">
        <button 
          type="button" 
          (click)="goBackToHub()" 
          class="nav-btn hub-btn"
          id="btn-ttt-hub"
          title="Return to Hub / हब में वापस जाएं">
          <span class="btn-icon">🏰</span>
          <span class="btn-text">Hub</span>
        </button>

        <div class="header-title-box">
          <div class="title-badge">
            <span class="badge-icon-duo">
              <span class="icon-x">✕</span>
              <span class="icon-o">○</span>
            </span>
            <span class="badge-text">TIC TAC TOE</span>
          </div>
          <span class="title-sub">शून्य-काँटा (Cyan ✕ vs Gold ○)</span>
        </div>

        <div class="header-actions">
          <button 
            type="button" 
            (click)="sound.toggleMute()" 
            class="action-icon-btn"
            [title]="sound.isMuted() ? 'Turn Sound On' : 'Turn Sound Off'">
            {{ sound.isMuted() ? '🔇' : '🎵' }}
          </button>
          <button 
            type="button" 
            (click)="speakStatus()" 
            class="action-icon-btn"
            title="Speak Game Status / स्थिति सुनें">
            📢
          </button>
        </div>
      </header>

      <!-- 🎮 Main Game Stage -->
      <main class="ttt-stage">
        <!-- ⚙️ Mode & Difficulty Controls Panel -->
        <section class="controls-panel">
          <!-- Game Mode Selector -->
          <div class="segmented-control mode-selector">
            <button 
              type="button" 
              class="segment-btn" 
              [class.active]="gameMode() === 'vs_computer'"
              (click)="setGameMode('vs_computer')"
              id="btn-mode-computer">
              <span class="seg-icon">🤖</span>
              <span>vs Computer</span>
            </button>
            <button 
              type="button" 
              class="segment-btn" 
              [class.active]="gameMode() === 'pvp'"
              (click)="setGameMode('pvp')"
              id="btn-mode-pvp">
              <span class="seg-icon">👥</span>
              <span>2 Players</span>
            </button>
          </div>

          <!-- Difficulty Selector (Only visible in vs Computer mode) -->
          @if (gameMode() === 'vs_computer') {
            <div class="difficulty-bar animate-fade-in">
              <span class="diff-label">Difficulty:</span>
              <div class="diff-pills">
                <button 
                  type="button" 
                  class="diff-btn diff-easy" 
                  [class.active]="difficulty() === 'easy'"
                  (click)="setDifficulty('easy')"
                  id="btn-diff-easy">
                  <span>🟢 Easy</span>
                </button>
                <button 
                  type="button" 
                  class="diff-btn diff-medium" 
                  [class.active]="difficulty() === 'medium'"
                  (click)="setDifficulty('medium')"
                  id="btn-diff-medium">
                  <span>🟡 Medium</span>
                </button>
                <button 
                  type="button" 
                  class="diff-btn diff-hard" 
                  [class.active]="difficulty() === 'hard'"
                  (click)="setDifficulty('hard')"
                  id="btn-diff-hard">
                  <span>🔴 Hard (AI)</span>
                </button>
              </div>
            </div>
          }
        </section>

        <!-- 📊 Live Scoreboard Tracker -->
        <section class="scoreboard-card">
          <div class="score-item score-x" [class.turn-active]="!isGameOver() && currentTurn() === 'X'">
            <div class="score-avatar avatar-x">
              <svg class="score-svg mark-x" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="11" stroke-linecap="round">
                <line x1="16" y1="16" x2="48" y2="48" />
                <line x1="48" y1="16" x2="16" y2="48" />
              </svg>
            </div>
            <div class="score-meta">
              <span class="player-title title-x">
                {{ gameMode() === 'vs_computer' ? 'Player (X)' : 'Player 1 (X)' }}
              </span>
              <span class="score-val val-x">{{ scoreX() }}</span>
            </div>
            @if (!isGameOver() && currentTurn() === 'X') {
              <span class="turn-dot dot-x"></span>
            }
          </div>

          <div class="score-item score-tie">
            <div class="score-avatar">🤝</div>
            <div class="score-meta">
              <span class="player-title">Ties</span>
              <span class="score-val">{{ scoreTies() }}</span>
            </div>
          </div>

          <div class="score-item score-o" [class.turn-active]="!isGameOver() && currentTurn() === 'O'">
            <div class="score-avatar avatar-o">
              <svg class="score-svg mark-o" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="9.5" stroke-linecap="round">
                <circle cx="32" cy="32" r="18.5" />
              </svg>
            </div>
            <div class="score-meta">
              <span class="player-title title-o">
                {{ gameMode() === 'vs_computer' ? 'Computer (O)' : 'Player 2 (O)' }}
              </span>
              <span class="score-val val-o">{{ scoreO() }}</span>
            </div>
            @if (!isGameOver() && currentTurn() === 'O') {
              <span class="turn-dot dot-o"></span>
            }
          </div>
        </section>

        <!-- 📢 Turn Status & Mascot Banner -->
        <section class="status-banner animate-pop">
          <div class="banner-avatar">
            @if (isGameOver()) {
              @if (winner() === 'X') { 🏆 }
              @else if (winner() === 'O') { 👑 }
              @else { 🤝 }
            } @else if (isBotThinking()) {
              <span class="animate-spin-slow">🤖</span>
            } @else if (currentTurn() === 'X') {
              <svg class="banner-mark-svg mark-x" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="11" stroke-linecap="round">
                <line x1="16" y1="16" x2="48" y2="48" />
                <line x1="48" y1="16" x2="16" y2="48" />
              </svg>
            } @else {
              <svg class="banner-mark-svg mark-o" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="10" stroke-linecap="round">
                <circle cx="32" cy="32" r="18.5" />
              </svg>
            }
          </div>

          <div class="banner-text">
            @if (isGameOver()) {
              @if (winner() === 'draw') {
                <span class="text-main draw-text">It's a Draw! बराबर की टक्कर 🤝</span>
              } @else if (gameMode() === 'vs_computer') {
                @if (winner() === 'X') {
                  <span class="text-main win-text-x">🎉 You Win! बधाई हो, आप (X) जीत गए!</span>
                } @else {
                  <span class="text-main win-text-o">🤖 Computer Won! कंप्यूटर (O) जीता!</span>
                }
              } @else {
                <span class="text-main" [class.win-text-x]="winner() === 'X'" [class.win-text-o]="winner() === 'O'">
                  🎉 Player {{ winner() }} Wins! खिलाड़ी {{ winner() }} की जीत!
                </span>
              }
            } @else if (isBotThinking()) {
              <span class="text-main thinking-text">
                Computer is thinking... सोचने दें 🧠
              </span>
            } @else {
              <span class="text-main">
                @if (gameMode() === 'vs_computer') {
                  @if (currentTurn() === 'X') {
                    <span class="highlight-x">Your Turn (X)</span> — खाली डिब्बे पर टैप करें!
                  } @else {
                    <span class="highlight-o">Computer Turn (O)</span>...
                  }
                } @else {
                  @if (currentTurn() === 'X') {
                    <span class="highlight-x">Player X's Turn</span> — आपकी बारी है!
                  } @else {
                    <span class="highlight-o">Player O's Turn</span> — आपकी बारी है!
                  }
                }
              </span>
            }
          </div>
        </section>

        <!-- 🎲 3x3 Tic Tac Toe Grid Board -->
        <div class="board-wrapper">
          <div class="board-grid" [class.board-disabled]="isBotThinking() || isGameOver()">
            @for (cell of board(); track $index) {
              <button 
                type="button" 
                class="board-cell"
                [id]="'cell-' + $index"
                [class.cell-x]="cell === 'X'"
                [class.cell-o]="cell === 'O'"
                [class.cell-winner]="isWinningCell($index)"
                [disabled]="cell !== null || isBotThinking() || isGameOver()"
                (click)="onCellClick($index)"
                [attr.aria-label]="'Cell ' + ($index + 1) + (cell ? ': ' + cell : ' empty')">
                
                @if (cell === 'X') {
                  <svg class="mark-svg mark-x" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="8.5" stroke-linecap="round">
                    <line x1="16" y1="16" x2="48" y2="48" />
                    <line x1="48" y1="16" x2="16" y2="48" />
                  </svg>
                } @else if (cell === 'O') {
                  <svg class="mark-svg mark-o" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="8" stroke-linecap="round">
                    <circle cx="32" cy="32" r="18.5" />
                  </svg>
                } @else {
                  <span class="empty-hint"></span>
                }
              </button>
            }

            <!-- ⚡ Strike Winning Line SVG Overlay -->
            @if (winningLine(); as line) {
              <svg 
                class="strike-svg-overlay" 
                viewBox="0 0 300 300"
                [class.strike-x]="winner() === 'X'"
                [class.strike-o]="winner() === 'O'">
                <line 
                  [attr.x1]="getStrikeCoordinates(line.type).x1" 
                  [attr.y1]="getStrikeCoordinates(line.type).y1" 
                  [attr.x2]="getStrikeCoordinates(line.type).x2" 
                  [attr.y2]="getStrikeCoordinates(line.type).y2"
                  stroke-linecap="round" />
              </svg>
            }
          </div>
        </div>

        <!-- 🕹️ Action Buttons Bar -->
        <footer class="action-footer">
          <button 
            type="button" 
            (click)="resetBoard()" 
            class="action-btn restart-btn"
            id="btn-ttt-restart"
            title="New Round / नया राउंड">
            <span class="btn-icon">🔄</span>
            <span class="btn-text">Play Again / नया मैच</span>
          </button>

          <button 
            type="button" 
            (click)="resetScores()" 
            class="action-btn clear-score-btn"
            id="btn-ttt-clear-scores"
            title="Reset Scores / स्कोर शून्य करें">
            <span class="btn-icon">🗑️</span>
            <span class="btn-text">Reset Score</span>
          </button>
        </footer>
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      min-height: 100vh;
      min-height: 100dvh;
      background: radial-gradient(circle at top, #1e1b4b 0%, #0f172a 60%, #020617 100%);
      color: #ffffff;
      font-family: var(--font-body, system-ui, -apple-system, sans-serif);
      box-sizing: border-box;
      user-select: none;
      -webkit-user-select: none;
      overflow-x: hidden;
    }

    * {
      box-sizing: border-box;
    }

    .ttt-viewport {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: 100vh;
      min-height: 100dvh;
      position: relative;
      padding: 12px 16px 24px 16px;
      max-width: 600px;
      margin: 0 auto;
    }

    /* Ambient Background Glows */
    .glow-orb {
      position: fixed;
      border-radius: 50%;
      filter: blur(80px);
      pointer-events: none;
      z-index: 0;
      opacity: 0.35;
    }
    .orb-top {
      width: 280px;
      height: 280px;
      top: -40px;
      left: 10%;
      background: #6366f1;
    }
    .orb-bottom {
      width: 320px;
      height: 320px;
      bottom: -60px;
      right: 5%;
      background: #ec4899;
    }

    /* 👑 Header Navigation */
    .ttt-header {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: relative;
      z-index: 10;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .nav-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.18);
      color: #e2e8f0;
      font-size: 0.85rem;
      font-weight: 800;
      cursor: pointer;
      backdrop-filter: blur(12px);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .nav-btn:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-2px);
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }

    .header-title-box {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .title-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(236, 72, 153, 0.3) 100%);
      padding: 4px 14px;
      border-radius: 16px;
      border: 1.5px solid rgba(255, 255, 255, 0.25);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.25);
    }
    .badge-icon-duo {
      display: inline-flex;
      align-items: center;
      gap: 3px;
      font-weight: 900;
      font-size: 1rem;
    }
    .icon-x {
      color: #00f0ff;
      text-shadow: 0 0 6px #00f0ff;
    }
    .icon-o {
      color: #fbbf24;
      text-shadow: 0 0 6px #fbbf24;
    }
    .badge-text {
      font-family: var(--font-display, inherit);
      font-weight: 900;
      font-size: 0.95rem;
      letter-spacing: 0.05em;
      background: linear-gradient(to right, #67e8f9, #f472b6, #fde047);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .title-sub {
      font-size: 0.72rem;
      color: #94a3b8;
      font-weight: 600;
      margin-top: 2px;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .action-icon-btn {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      border: 1px solid rgba(255, 255, 255, 0.18);
      background: rgba(255, 255, 255, 0.08);
      color: #ffffff;
      font-size: 1.05rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      backdrop-filter: blur(8px);
      transition: all 0.2s;
    }
    .action-icon-btn:hover {
      background: rgba(255, 255, 255, 0.22);
      transform: scale(1.08);
    }

    /* 🎮 Main Stage */
    .ttt-stage {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      z-index: 5;
      margin-top: 14px;
      gap: 14px;
    }

    /* Controls Panel */
    .controls-panel {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }

    .segmented-control {
      display: flex;
      background: rgba(15, 23, 42, 0.75);
      border: 1.5px solid rgba(255, 255, 255, 0.15);
      border-radius: 28px;
      padding: 4px;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
      backdrop-filter: blur(12px);
    }
    .segment-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 18px;
      border-radius: 22px;
      border: none;
      background: transparent;
      color: #94a3b8;
      font-weight: 800;
      font-size: 0.84rem;
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .segment-btn.active {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.5);
    }

    /* Difficulty Bar */
    .difficulty-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      justify-content: center;
      background: rgba(255, 255, 255, 0.05);
      padding: 6px 14px;
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .diff-label {
      font-size: 0.76rem;
      font-weight: 700;
      color: #cbd5e1;
    }
    .diff-pills {
      display: flex;
      gap: 6px;
    }
    .diff-btn {
      padding: 5px 12px;
      border-radius: 14px;
      border: 1px solid rgba(255, 255, 255, 0.15);
      background: rgba(255, 255, 255, 0.07);
      color: #cbd5e1;
      font-size: 0.76rem;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.2s;
    }
    .diff-btn:hover {
      background: rgba(255, 255, 255, 0.18);
    }
    .diff-easy.active {
      background: #059669;
      color: #ffffff;
      border-color: #34d399;
      box-shadow: 0 0 10px rgba(52, 211, 153, 0.5);
    }
    .diff-medium.active {
      background: #d97706;
      color: #ffffff;
      border-color: #fde047;
      box-shadow: 0 0 10px rgba(253, 224, 71, 0.5);
    }
    .diff-hard.active {
      background: #dc2626;
      color: #ffffff;
      border-color: #f87171;
      box-shadow: 0 0 10px rgba(248, 113, 113, 0.5);
    }

    /* 📊 Scoreboard */
    .scoreboard-card {
      width: 100%;
      max-width: 440px;
      display: grid;
      grid-template-columns: 1fr 0.8fr 1fr;
      gap: 8px;
      background: rgba(30, 41, 59, 0.6);
      border: 1.5px solid rgba(255, 255, 255, 0.14);
      border-radius: 20px;
      padding: 10px 12px;
      backdrop-filter: blur(14px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
    }
    .score-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 10px;
      border-radius: 14px;
      background: rgba(255, 255, 255, 0.04);
      border: 1.5px solid transparent;
      position: relative;
      transition: all 0.25s;
    }
    .score-avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 28px;
    }
    .avatar-x {
      color: #00f0ff;
    }
    .avatar-o {
      color: #fbbf24;
    }
    .score-svg {
      width: 22px;
      height: 22px;
      display: block;
    }
    .score-meta {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .player-title {
      font-size: 0.68rem;
      font-weight: 700;
      color: #94a3b8;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .title-x {
      color: #7dd3fc;
    }
    .title-o {
      color: #fde68a;
    }
    .score-val {
      font-family: var(--font-display, inherit);
      font-size: 1.25rem;
      font-weight: 900;
      color: #ffffff;
      line-height: 1.1;
    }
    .val-x {
      color: #38bdf8;
      text-shadow: 0 0 8px rgba(56, 189, 248, 0.5);
    }
    .val-o {
      color: #fbbf24;
      text-shadow: 0 0 8px rgba(251, 191, 36, 0.5);
    }
    .score-item.score-x.turn-active {
      border-color: #00f0ff;
      background: rgba(0, 240, 255, 0.15);
      box-shadow: 0 0 16px rgba(0, 240, 255, 0.4);
      transform: scale(1.02);
    }
    .score-item.score-o.turn-active {
      border-color: #fbbf24;
      background: rgba(251, 191, 36, 0.15);
      box-shadow: 0 0 16px rgba(251, 191, 36, 0.4);
      transform: scale(1.02);
    }
    .turn-dot {
      position: absolute;
      top: 6px;
      right: 6px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      animation: pulseDot 1s infinite alternate;
    }
    .dot-x {
      background: #00f0ff;
      box-shadow: 0 0 8px #00f0ff;
    }
    .dot-o {
      background: #fbbf24;
      box-shadow: 0 0 8px #fbbf24;
    }

    /* 📢 Status Banner */
    .status-banner {
      width: 100%;
      max-width: 440px;
      display: flex;
      align-items: center;
      gap: 12px;
      background: rgba(15, 23, 42, 0.7);
      border: 1.5px solid rgba(255, 255, 255, 0.16);
      border-radius: 18px;
      padding: 10px 16px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(12px);
    }
    .banner-avatar {
      font-size: 1.4rem;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 36px;
    }
    .banner-mark-svg {
      width: 28px;
      height: 28px;
      display: block;
    }
    .banner-text {
      flex: 1;
    }
    .text-main {
      font-size: 0.88rem;
      font-weight: 800;
      color: #f8fafc;
      letter-spacing: -0.01em;
      line-height: 1.25;
      display: block;
    }
    .highlight-x {
      color: #38bdf8;
      font-weight: 900;
      text-shadow: 0 0 8px rgba(56, 189, 248, 0.6);
    }
    .highlight-o {
      color: #fbbf24;
      font-weight: 900;
      text-shadow: 0 0 8px rgba(251, 191, 36, 0.6);
    }
    .win-text-x {
      color: #00f0ff;
      text-shadow: 0 0 12px rgba(0, 240, 255, 0.7);
      font-weight: 900;
    }
    .win-text-o {
      color: #fbbf24;
      text-shadow: 0 0 12px rgba(251, 191, 36, 0.7);
      font-weight: 900;
    }
    .draw-text {
      color: #fde047;
      text-shadow: 0 0 10px rgba(253, 224, 71, 0.5);
    }
    .thinking-text {
      color: #38bdf8;
    }

    /* 🎲 3x3 Tic Tac Toe Grid Board */
    .board-wrapper {
      position: relative;
      width: 100%;
      max-width: 360px;
      aspect-ratio: 1 / 1;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 4px 0;
    }

    .board-grid {
      position: relative;
      width: 100%;
      height: 100%;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: repeat(3, 1fr);
      gap: 10px;
      background: rgba(30, 41, 59, 0.75);
      border: 3px solid rgba(255, 255, 255, 0.22);
      border-radius: 26px;
      padding: 12px;
      backdrop-filter: blur(16px);
      box-shadow: 0 16px 36px rgba(0, 0, 0, 0.55), inset 0 2px 6px rgba(255, 255, 255, 0.15);
      touch-action: manipulation;
    }

    .board-cell {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(145deg, rgba(51, 65, 85, 0.6) 0%, rgba(30, 41, 59, 0.8) 100%);
      border: 1.5px solid rgba(255, 255, 255, 0.12);
      border-radius: 18px;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
      box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.08), 0 4px 10px rgba(0, 0, 0, 0.25);
      padding: 0;
    }
    .board-cell:hover:not(:disabled) {
      background: rgba(71, 85, 105, 0.8);
      border-color: rgba(255, 255, 255, 0.35);
      transform: translateY(-2px) scale(1.03);
      box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
    }
    .board-cell:active:not(:disabled) {
      transform: scale(0.96);
    }
    .board-cell:disabled {
      cursor: default;
    }

    /* Distinct Cell Colors for X and O */
    .board-cell.cell-x {
      background: radial-gradient(circle, rgba(14, 165, 233, 0.22) 0%, rgba(30, 41, 59, 0.85) 100%) !important;
      border-color: rgba(56, 189, 248, 0.65) !important;
      box-shadow: inset 0 0 16px rgba(56, 189, 248, 0.3), 0 4px 14px rgba(0, 0, 0, 0.3) !important;
    }

    .board-cell.cell-o {
      background: radial-gradient(circle, rgba(245, 158, 11, 0.22) 0%, rgba(30, 41, 59, 0.85) 100%) !important;
      border-color: rgba(251, 191, 36, 0.65) !important;
      box-shadow: inset 0 0 16px rgba(251, 191, 36, 0.3), 0 4px 14px rgba(0, 0, 0, 0.3) !important;
    }

    /* SVG Marks Styling */
    .mark-svg {
      width: clamp(44px, 11vw, 64px);
      height: clamp(44px, 11vw, 64px);
      display: block;
    }

    .mark-x {
      color: #00f0ff; /* ⚡ Vibrant Electric Cyan */
      filter: drop-shadow(0 0 6px #00f0ff) drop-shadow(0 0 14px rgba(0, 240, 255, 0.75));
      animation: markPop 0.26s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }

    .mark-o {
      color: #fbbf24; /* 🌟 Radiant Sun Amber-Gold */
      filter: drop-shadow(0 0 6px #fbbf24) drop-shadow(0 0 14px rgba(251, 191, 36, 0.75));
      animation: markPop 0.26s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }

    /* Winner cell highlight with matching colors */
    .cell-winner {
      animation: winnerGlow 1.2s infinite alternate;
    }
    .cell-winner.cell-x {
      background: linear-gradient(135deg, rgba(14, 165, 233, 0.45) 0%, rgba(56, 189, 248, 0.25) 100%) !important;
      border: 2.5px solid #00f0ff !important;
      box-shadow: 0 0 24px rgba(0, 240, 255, 0.9), inset 0 0 14px rgba(0, 240, 255, 0.5) !important;
    }
    .cell-winner.cell-o {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.45) 0%, rgba(251, 191, 36, 0.25) 100%) !important;
      border: 2.5px solid #fbbf24 !important;
      box-shadow: 0 0 24px rgba(251, 191, 36, 0.9), inset 0 0 14px rgba(251, 191, 36, 0.5) !important;
    }

    /* Winning Strike Line SVG Overlay */
    .strike-svg-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 25;
      overflow: visible;
    }
    .strike-svg-overlay line {
      stroke-width: 9;
      stroke-dasharray: 450;
      stroke-dashoffset: 450;
      animation: laserStrike 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
    }
    .strike-svg-overlay.strike-x line {
      stroke: #00f0ff;
      filter: drop-shadow(0 0 8px #00f0ff) drop-shadow(0 0 20px rgba(0, 240, 255, 0.95));
    }
    .strike-svg-overlay.strike-o line {
      stroke: #fbbf24;
      filter: drop-shadow(0 0 8px #fbbf24) drop-shadow(0 0 20px rgba(251, 191, 36, 0.95));
    }
    @keyframes laserStrike {
      from {
        stroke-dashoffset: 450;
      }
      to {
        stroke-dashoffset: 0;
      }
    }

    /* 🕹️ Footer Action Buttons */
    .action-footer {
      width: 100%;
      max-width: 440px;
      display: flex;
      gap: 12px;
      margin-top: 4px;
    }

    .action-btn {
      flex: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 18px;
      border-radius: 18px;
      font-family: var(--font-display, inherit);
      font-size: 0.86rem;
      font-weight: 800;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
      border: none;
    }
    .restart-btn {
      background: linear-gradient(135deg, #059669 0%, #10b981 100%);
      color: #ffffff;
      box-shadow: 0 6px 18px rgba(16, 185, 129, 0.45);
    }
    .restart-btn:hover {
      background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
      transform: translateY(-2px) scale(1.02);
      box-shadow: 0 8px 22px rgba(16, 185, 129, 0.6);
    }
    .clear-score-btn {
      flex: 0.7;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.16);
      color: #cbd5e1;
    }
    .clear-score-btn:hover {
      background: rgba(239, 68, 68, 0.2);
      border-color: rgba(239, 68, 68, 0.4);
      color: #fca5a5;
      transform: translateY(-2px);
    }

    /* Keyframe Animations */
    @keyframes winnerGlow {
      0% { transform: scale(1); }
      100% { transform: scale(1.04); }
    }
    @keyframes pulseDot {
      0% { opacity: 0.4; transform: scale(0.8); }
      100% { opacity: 1; transform: scale(1.2); }
    }
    @keyframes spinSlow {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .animate-spin-slow {
      display: inline-block;
      animation: spinSlow 3s linear infinite;
    }
    .animate-pop {
      animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    @keyframes popIn {
      0% { opacity: 0; transform: scale(0.5); }
      100% { opacity: 1; transform: scale(1); }
    }
    @keyframes markPop {
      0% { opacity: 0; transform: scale(0.35) rotate(-15deg); }
      70% { transform: scale(1.15) rotate(3deg); }
      100% { opacity: 1; transform: scale(1) rotate(0deg); }
    }
    .animate-fade-in {
      animation: fadeIn 0.25s ease-out;
    }
    @keyframes fadeIn {
      0% { opacity: 0; transform: translateY(-4px); }
      100% { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 400px) {
      .ttt-viewport {
        padding: 8px 10px 18px 10px;
      }
      .board-wrapper {
        max-width: 310px;
      }
      .symbol {
        font-size: 2.2rem;
      }
      .segment-btn {
        padding: 6px 12px;
        font-size: 0.78rem;
      }
    }
  `]
})
export class TicTacToeComponent implements OnInit {
  // Game Configuration Signals
  readonly gameMode = signal<GameMode>('vs_computer');
  readonly difficulty = signal<Difficulty>('medium');

  // Board & State Signals
  readonly board = signal<CellValue[]>(Array(9).fill(null));
  readonly currentTurn = signal<PlayerSymbol>('X');
  readonly isBotThinking = signal<boolean>(false);
  readonly isGameOver = signal<boolean>(false);
  readonly winner = signal<PlayerSymbol | 'draw' | null>(null);
  readonly winningLine = signal<WinningLine | null>(null);

  // Scores
  readonly scoreX = signal<number>(0);
  readonly scoreO = signal<number>(0);
  readonly scoreTies = signal<number>(0);

  constructor(
    public appNav: AppNavService,
    public sound: SoundService,
    public speech: SpeechService,
    private confetti: ConfettiService
  ) {}

  ngOnInit(): void {
    this.loadSavedScores();
  }

  private loadSavedScores(): void {
    const saved = localStorage.getItem('rebus_ttt_scores');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        this.scoreX.set(data.x || 0);
        this.scoreO.set(data.o || 0);
        this.scoreTies.set(data.ties || 0);
      } catch (e) {
        // Ignore parse error
      }
    }
  }

  private saveScores(): void {
    const data = {
      x: this.scoreX(),
      o: this.scoreO(),
      ties: this.scoreTies()
    };
    localStorage.setItem('rebus_ttt_scores', JSON.stringify(data));
  }

  setGameMode(mode: GameMode): void {
    this.sound.playTap();
    this.gameMode.set(mode);
    this.resetBoard();
  }

  setDifficulty(diff: Difficulty): void {
    this.sound.playTap();
    this.difficulty.set(diff);
    this.speech.speakClue(`${diff} difficulty selected`);
  }

  onCellClick(index: number): void {
    if (
      this.board()[index] !== null || 
      this.isBotThinking() || 
      this.isGameOver()
    ) {
      return;
    }

    // Play move for current turn
    this.executeMove(index, this.currentTurn());
  }

  private executeMove(index: number, player: PlayerSymbol): void {
    this.sound.playTap();

    const newBoard = [...this.board()];
    newBoard[index] = player;
    this.board.set(newBoard);

    // Check winner
    const winResult = this.checkWinner(newBoard);

    if (winResult) {
      this.handleGameOver(winResult.winner, winResult.line);
      return;
    }

    // Check if board full -> Draw
    if (newBoard.every(cell => cell !== null)) {
      this.handleGameOver('draw', null);
      return;
    }

    // Switch turn
    const nextTurn: PlayerSymbol = player === 'X' ? 'O' : 'X';
    this.currentTurn.set(nextTurn);

    // If vs computer and next turn is O (computer), make bot move
    if (this.gameMode() === 'vs_computer' && nextTurn === 'O') {
      this.triggerComputerTurn(newBoard);
    }
  }

  private triggerComputerTurn(currentBoard: CellValue[]): void {
    this.isBotThinking.set(true);

    // Give subtle natural delay (400ms)
    setTimeout(() => {
      if (this.isGameOver()) {
        this.isBotThinking.set(false);
        return;
      }

      const botMoveIndex = this.computeBotMove(currentBoard, this.difficulty());
      this.isBotThinking.set(false);

      if (botMoveIndex >= 0 && botMoveIndex < 9) {
        this.executeMove(botMoveIndex, 'O');
      }
    }, 450);
  }

  /**
   * AI Strategy according to chosen difficulty:
   * - Easy: mostly random moves
   * - Medium: check immediate win/block, center preference, then random
   * - Hard: Unbeatable Minimax Algorithm
   */
  private computeBotMove(board: CellValue[], diff: Difficulty): number {
    const emptyIndices: number[] = [];
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) emptyIndices.push(i);
    }
    if (emptyIndices.length === 0) return -1;

    if (diff === 'easy') {
      // 70% random, 30% take immediate win if available
      if (Math.random() > 0.3) {
        return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
      }
      const winMove = this.findImmediateWinningMove(board, 'O');
      if (winMove !== -1) return winMove;
      return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    }

    if (diff === 'medium') {
      // 1. Can bot win?
      const winMove = this.findImmediateWinningMove(board, 'O');
      if (winMove !== -1) return winMove;

      // 2. Can player win? Block it!
      const blockMove = this.findImmediateWinningMove(board, 'X');
      if (blockMove !== -1) return blockMove;

      // 3. Take center if open (60% chance)
      if (board[4] === null && Math.random() > 0.4) {
        return 4;
      }

      // 4. Take random available corner or side
      const corners = [0, 2, 6, 8].filter(c => board[c] === null);
      if (corners.length > 0 && Math.random() > 0.5) {
        return corners[Math.floor(Math.random() * corners.length)];
      }

      return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    }

    // Hard Level: Unbeatable Minimax
    return this.getBestMinimaxMove(board);
  }

  private findImmediateWinningMove(board: CellValue[], player: PlayerSymbol): number {
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        const testBoard = [...board];
        testBoard[i] = player;
        const res = this.checkWinner(testBoard);
        if (res && res.winner === player) {
          return i;
        }
      }
    }
    return -1;
  }

  /**
   * Minimax implementation for Tic Tac Toe (AI is 'O', Human is 'X')
   */
  private getBestMinimaxMove(board: CellValue[]): number {
    let bestScore = -Infinity;
    let bestMove = -1;

    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = 'O';
        const score = this.minimax(board, 0, false);
        board[i] = null;
        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }
    return bestMove;
  }

  private minimax(board: CellValue[], depth: number, isMaximizing: boolean): number {
    const winResult = this.checkWinner(board);
    if (winResult) {
      if (winResult.winner === 'O') return 10 - depth;
      if (winResult.winner === 'X') return depth - 10;
    }
    if (board.every(cell => cell !== null)) {
      return 0; // Draw
    }

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = 'O';
          const evaluation = this.minimax(board, depth + 1, false);
          board[i] = null;
          maxEval = Math.max(maxEval, evaluation);
        }
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = 'X';
          const evaluation = this.minimax(board, depth + 1, true);
          board[i] = null;
          minEval = Math.min(minEval, evaluation);
        }
      }
      return minEval;
    }
  }

  private checkWinner(board: CellValue[]): { winner: PlayerSymbol; line: WinningLine } | null {
    for (const item of WINNING_COMBOS) {
      const [a, b, c] = item.combo;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return {
          winner: board[a] as PlayerSymbol,
          line: { combo: item.combo, type: item.type }
        };
      }
    }
    return null;
  }

  isWinningCell(index: number): boolean {
    const line = this.winningLine();
    return !!line && line.combo.includes(index);
  }

  private handleGameOver(resWinner: PlayerSymbol | 'draw', line: WinningLine | null): void {
    this.isGameOver.set(true);
    this.winner.set(resWinner);
    this.winningLine.set(line);

    if (resWinner === 'X') {
      this.scoreX.update(v => v + 1);
      this.sound.playSuccess();
      this.confetti.fire();
      const msg = this.gameMode() === 'vs_computer' 
        ? 'Congratulations! You won!' 
        : 'Player X is the winner!';
      this.speech.speakClue(msg);
    } else if (resWinner === 'O') {
      this.scoreO.update(v => v + 1);
      if (this.gameMode() === 'vs_computer') {
        this.sound.playError();
        this.speech.speakClue('Computer won this round! Try again!');
      } else {
        this.sound.playSuccess();
        this.confetti.fire();
        this.speech.speakClue('Player O is the winner!');
      }
    } else {
      this.scoreTies.update(v => v + 1);
      this.sound.playTap();
      this.speech.speakClue("It is a draw match! Well played!");
    }

    this.saveScores();
  }

  resetBoard(): void {
    this.sound.playTap();
    this.board.set(Array(9).fill(null));
    this.currentTurn.set('X');
    this.isBotThinking.set(false);
    this.isGameOver.set(false);
    this.winner.set(null);
    this.winningLine.set(null);
  }

  resetScores(): void {
    this.sound.playTap();
    this.scoreX.set(0);
    this.scoreO.set(0);
    this.scoreTies.set(0);
    this.saveScores();
    this.speech.speakClue('Scores reset');
  }

  speakStatus(): void {
    if (this.isGameOver()) {
      if (this.winner() === 'draw') {
        this.speech.speakClue("It's a draw!");
      } else {
        this.speech.speakClue(`Winner is ${this.winner()}`);
      }
    } else {
      this.speech.speakClue(`${this.currentTurn()}'s turn`);
    }
  }

  getStrikeCoordinates(type: WinningLine['type']): { x1: number; y1: number; x2: number; y2: number } {
    switch (type) {
      // Horizontal rows
      case 'h-0': return { x1: 24, y1: 50, x2: 276, y2: 50 };
      case 'h-1': return { x1: 24, y1: 150, x2: 276, y2: 150 };
      case 'h-2': return { x1: 24, y1: 250, x2: 276, y2: 250 };
      // Vertical columns
      case 'v-0': return { x1: 50, y1: 24, x2: 50, y2: 276 };
      case 'v-1': return { x1: 150, y1: 24, x2: 150, y2: 276 };
      case 'v-2': return { x1: 250, y1: 24, x2: 250, y2: 276 };
      // Diagonals (pass exactly through cell centers)
      case 'diag-0': return { x1: 28, y1: 28, x2: 272, y2: 272 }; // [0, 4, 8] top-left to bottom-right
      case 'diag-1': return { x1: 272, y1: 28, x2: 28, y2: 272 }; // [2, 4, 6] top-right to bottom-left
    }
  }

  goBackToHub(): void {
    this.sound.playTap();
    this.appNav.goToHub();
  }
}

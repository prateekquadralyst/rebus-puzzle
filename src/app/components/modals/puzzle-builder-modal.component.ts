import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameStateService } from '../../core/services/game-state.service';
import { SoundService } from '../../core/services/sound.service';
import { Difficulty, Puzzle, PuzzleImage } from '../../core/models/puzzle.model';

interface ClueDraft {
  emoji: string;
  label: string;
}

@Component({
  selector: 'app-puzzle-builder-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (game.showBuilderModal()) {
      <div class="modal-overlay" (click)="close()">
        <div class="modal-box glass-panel animate-pop" (click)="$event.stopPropagation()">
          <!-- Close Button -->
          <button 
            type="button"
            (click)="close()" 
            class="modal-close-btn"
            title="Close">
            ✕
          </button>

          <!-- Header -->
          <div class="modal-header">
            <span class="modal-header-icon">🎨</span>
            <h2 class="modal-title">Create Custom Rebus Puzzle</h2>
            <p class="modal-subtitle">Design your own puzzle with 2, 3, or 4 emoji clues!</p>
          </div>

          <form (ngSubmit)="saveAndPlay()" class="builder-form">
            <!-- Difficulty Selector -->
            <div class="form-group">
              <label class="form-label">Difficulty Mode</label>
              <div class="diff-btn-group">
                <button 
                  type="button" 
                  (click)="difficulty = 'easy'"
                  class="diff-choice-btn"
                  [class.diff-active-easy]="difficulty === 'easy'">
                  🟢 Easy
                </button>
                <button 
                  type="button" 
                  (click)="difficulty = 'medium'"
                  class="diff-choice-btn"
                  [class.diff-active-medium]="difficulty === 'medium'">
                  🟡 Medium
                </button>
                <button 
                  type="button" 
                  (click)="difficulty = 'hard'"
                  class="diff-choice-btn"
                  [class.diff-active-hard]="difficulty === 'hard'">
                  🔴 Hard (3-4 Clues)
                </button>
              </div>
            </div>

            <!-- Answer Input -->
            <div class="form-group">
              <label class="form-label">Answer Word (Uppercase Letters Only)</label>
              <input 
                type="text" 
                [(ngModel)]="answer" 
                name="answer"
                placeholder="e.g. WATERMELON, SUNGLASSES, CATFISH" 
                class="form-input text-uppercase font-display font-bold"
                maxlength="16"
                required>
            </div>

            <!-- Category Input -->
            <div class="form-group">
              <label class="form-label">Category Name</label>
              <input 
                type="text" 
                [(ngModel)]="category" 
                name="category"
                placeholder="e.g. Movies, Nature, Food, Sci-Fi" 
                class="form-input"
                required>
            </div>

            <!-- Clue Cards List (2 to 4) -->
            <div class="form-group">
              <div class="clues-header-row">
                <label class="form-label">Visual Clues ({{ clues.length }} / 4)</label>
                @if (clues.length < 4) {
                  <button 
                    type="button" 
                    (click)="addClue()" 
                    class="add-clue-btn">
                    <span>➕ Add Emoji Clue</span>
                  </button>
                }
              </div>

              <div class="clues-list">
                @for (clue of clues; track $index; let idx = $index) {
                  <div class="clue-input-card">
                    <span class="clue-num-tag">#{{ idx + 1 }}</span>
                    <input 
                      type="text" 
                      [(ngModel)]="clue.emoji" 
                      [name]="'emoji_' + idx"
                      placeholder="Emoji (e.g. ☀️)" 
                      class="emoji-field"
                      maxlength="4"
                      required>
                    <input 
                      type="text" 
                      [(ngModel)]="clue.label" 
                      [name]="'label_' + idx"
                      placeholder="Label (e.g. SUN)" 
                      class="label-field"
                      maxlength="12"
                      required>
                    @if (clues.length > 2) {
                      <button 
                        type="button" 
                        (click)="removeClue(idx)" 
                        class="remove-clue-btn"
                        title="Remove clue">
                        ✕
                      </button>
                    }
                  </div>
                }
              </div>
            </div>

            <!-- Riddle / Hint -->
            <div class="form-group">
              <label class="form-label">Contextual Hint / Riddle</label>
              <input 
                type="text" 
                [(ngModel)]="hintText" 
                name="hintText"
                placeholder="e.g. A juicy sweet summer treat with black seeds" 
                class="form-input">
            </div>

            <!-- Submit Button -->
            <div class="modal-footer">
              <button 
                type="submit" 
                class="create-play-btn">
                <span>🚀 Save & Play Puzzle Now</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(3, 7, 18, 0.85);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      z-index: 9999;
    }

    .modal-box {
      width: 100%;
      max-width: 480px;
      max-height: 90vh;
      overflow-y: auto;
      padding: 24px;
      border-radius: 24px;
      background: #0f172a;
      border: 1px solid rgba(255, 255, 255, 0.12);
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(139, 92, 246, 0.2);
      position: relative;
    }

    .modal-close-btn {
      position: absolute;
      top: 16px;
      right: 16px;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.06);
      border: none;
      color: #94a3b8;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
    }
    .modal-close-btn:hover {
      background: rgba(255, 255, 255, 0.14);
      color: white;
    }

    .modal-header {
      text-align: center;
      margin-bottom: 18px;
    }
    .modal-header-icon {
      font-size: 30px;
      display: block;
      margin-bottom: 4px;
    }
    .modal-title {
      font-size: 1.25rem;
      font-weight: 800;
      color: white;
      font-family: var(--font-display);
    }
    .modal-subtitle {
      font-size: 0.74rem;
      color: #94a3b8;
      margin-top: 3px;
    }

    .builder-form {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-label {
      font-size: 0.72rem;
      font-weight: 700;
      color: #cbd5e1;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .form-input {
      width: 100%;
      padding: 10px 14px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: white;
      font-family: var(--font-body);
      font-size: 0.82rem;
      outline: none;
      transition: all 0.2s;
    }
    .form-input:focus {
      border-color: #8b5cf6;
      background: rgba(139, 92, 246, 0.08);
      box-shadow: 0 0 12px rgba(139, 92, 246, 0.3);
    }

    .text-uppercase {
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    /* Diff Buttons */
    .diff-btn-group {
      display: flex;
      gap: 6px;
    }
    .diff-choice-btn {
      flex: 1;
      padding: 8px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #94a3b8;
      font-size: 0.74rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }
    .diff-active-easy {
      background: rgba(16, 185, 129, 0.2);
      border-color: #10b981;
      color: #34d399;
    }
    .diff-active-medium {
      background: rgba(245, 158, 11, 0.2);
      border-color: #f59e0b;
      color: #fbbf24;
    }
    .diff-active-hard {
      background: rgba(239, 68, 68, 0.2);
      border-color: #ef4444;
      color: #f87171;
    }

    /* Clues Header */
    .clues-header-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .add-clue-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 10px;
      border-radius: 8px;
      background: rgba(139, 92, 246, 0.2);
      border: 1px solid rgba(139, 92, 246, 0.4);
      color: #c4b5fd;
      font-size: 0.7rem;
      font-weight: 700;
      cursor: pointer;
    }
    .add-clue-btn:hover {
      background: rgba(139, 92, 246, 0.35);
      color: white;
    }

    .clues-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .clue-input-card {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 10px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .clue-num-tag {
      font-size: 0.7rem;
      font-weight: 800;
      color: #8b5cf6;
      width: 22px;
    }
    .emoji-field {
      width: 58px;
      padding: 6px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: white;
      font-size: 1.2rem;
      text-align: center;
      outline: none;
    }
    .label-field {
      flex: 1;
      padding: 6px 10px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: white;
      font-size: 0.8rem;
      text-transform: uppercase;
      font-weight: 700;
      outline: none;
    }
    .remove-clue-btn {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      background: rgba(244, 63, 94, 0.15);
      border: 1px solid rgba(244, 63, 94, 0.3);
      color: #f87171;
      font-size: 11px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .remove-clue-btn:hover {
      background: rgba(244, 63, 94, 0.3);
      color: white;
    }

    .modal-footer {
      margin-top: 10px;
    }
    .create-play-btn {
      width: 100%;
      padding: 12px;
      border-radius: 14px;
      background: linear-gradient(135deg, #10b981, #059669);
      border: none;
      color: white;
      font-weight: 800;
      font-size: 0.88rem;
      cursor: pointer;
      box-shadow: 0 8px 20px rgba(16, 185, 129, 0.35);
      transition: all 0.2s;
    }
    .create-play-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 10px 24px rgba(16, 185, 129, 0.45);
    }
  `]
})
export class PuzzleBuilderModalComponent {
  difficulty: Difficulty = 'hard';
  answer = '';
  category = 'Custom Challenge';
  hintText = '';

  clues: ClueDraft[] = [
    { emoji: '☀️', label: 'SUN' },
    { emoji: '👓', label: 'GLASSES' },
    { emoji: '🌊', label: 'SUMMER' }
  ];

  constructor(
    public game: GameStateService,
    private sound: SoundService
  ) {}

  addClue(): void {
    if (this.clues.length >= 4) return;
    this.sound.playTap();
    this.clues.push({ emoji: '✨', label: 'CLUE' });
  }

  removeClue(index: number): void {
    if (this.clues.length <= 2) return;
    this.sound.playRemove();
    this.clues.splice(index, 1);
  }

  saveAndPlay(): void {
    const cleanAnswer = this.answer.trim().toUpperCase().replace(/[^A-Z]/g, '');
    if (!cleanAnswer || cleanAnswer.length < 3) {
      alert('Please enter a valid answer word (at least 3 letters)!');
      return;
    }

    const images: PuzzleImage[] = this.clues.map((c, i) => ({
      emoji: c.emoji || '❓',
      label: c.label.toUpperCase() || `CLUE ${i + 1}`,
      alt: c.label
    }));

    const equationExplanation = images.map(img => `${img.emoji} ${img.label}`).join(' + ') + ` = ${cleanAnswer}!`;

    const newPuzzle: Puzzle = {
      id: 'custom_' + Date.now(),
      difficulty: this.difficulty,
      category: this.category || 'Custom Challenge',
      answer: cleanAnswer,
      hintText: this.hintText || `Custom riddle for ${cleanAnswer}`,
      points: this.difficulty === 'easy' ? 100 : this.difficulty === 'medium' ? 250 : 400,
      explanation: equationExplanation,
      images
    };

    this.game.addCustomPuzzle(newPuzzle);
  }

  close(): void {
    this.sound.playTap();
    this.game.showBuilderModal.set(false);
  }
}

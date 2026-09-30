import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { PuzzleStageComponent } from './components/puzzle-stage/puzzle-stage.component';
import { AnswerSlotsComponent } from './components/answer-slots/answer-slots.component';
import { LetterBankComponent } from './components/letter-bank/letter-bank.component';
import { HintDockComponent } from './components/hint-dock/hint-dock.component';
import { ModeModalComponent } from './components/modals/mode-modal.component';
import { WinModalComponent } from './components/modals/win-modal.component';
import { StatsModalComponent } from './components/modals/stats-modal.component';
import { PuzzleBuilderModalComponent } from './components/modals/puzzle-builder-modal.component';
import { ThemeModalComponent } from './components/modals/theme-modal.component';
import { ShareModalComponent } from './components/modals/share-modal.component';
import { HowToPlayModalComponent } from './components/modals/how-to-play-modal.component';
import { GameMenuModalComponent } from './components/modals/game-menu-modal.component';
import { StartPortalComponent } from './components/start-portal/start-portal.component';
import { ToddlerHubComponent } from './components/hub/toddler-hub.component';
import { ShapeSorterComponent } from './components/games/shape-sorter.component';
import { SoundMatcherComponent } from './components/games/sound-matcher.component';
import { MemoryFlipComponent } from './components/games/memory-flip.component';
import { BalloonPopComponent } from './components/games/balloon-pop.component';
import { PiecePuzzleComponent } from './components/games/piece-puzzle.component';
import { AlphabetSafariComponent } from './components/games/alphabet-safari.component';
import { NumberCountingComponent } from './components/games/number-counting.component';
import { HindiVarnamalaComponent } from './components/games/hindi-varnamala.component';
import { MagicColoringComponent } from './components/games/magic-coloring.component';
import { AnimalPianoComponent } from './components/games/animal-piano.component';
import { LetterTracingComponent } from './components/games/letter-tracing.component';
import { TicTacToeComponent } from './components/games/tic-tac-toe.component';
import { GameStateService } from './core/services/game-state.service';
import { SoundService } from './core/services/sound.service';
import { AppNavService } from './core/services/app-nav.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    StartPortalComponent,
    ToddlerHubComponent,
    ShapeSorterComponent,
    SoundMatcherComponent,
    MemoryFlipComponent,
    BalloonPopComponent,
    PiecePuzzleComponent,
    AlphabetSafariComponent,
    NumberCountingComponent,
    HindiVarnamalaComponent,
    MagicColoringComponent,
    AnimalPianoComponent,
    LetterTracingComponent,
    TicTacToeComponent,
    HeaderComponent,
    PuzzleStageComponent,
    AnswerSlotsComponent,
    LetterBankComponent,
    HintDockComponent,
    ModeModalComponent,
    WinModalComponent,
    StatsModalComponent,
    PuzzleBuilderModalComponent,
    ThemeModalComponent,
    ShareModalComponent,
    HowToPlayModalComponent,
    GameMenuModalComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  constructor(
    public game: GameStateService,
    public sound: SoundService,
    public nav: AppNavService
  ) {}

  /**
   * Keyboard support: Type directly on desktop keyboard or hit Backspace/Delete!
   */
  @HostListener('window:keydown', ['$event'])
  handleKeyboardInput(event: KeyboardEvent): void {
    // Ignore if modal open or solved
    if (this.game.showModeModal() || this.game.showStatsModal() || this.game.isSolved()) {
      return;
    }

    const key = event.key.toUpperCase();

    // Check letter input A-Z
    if (/^[A-Z]$/.test(key)) {
      // Find available matching letter in bank
      const bank = this.game.letterBank();
      const match = bank.find(l => l.char === key && !l.isUsed && !l.isEliminated);
      if (match) {
        this.game.selectBankLetter(match.id);
      }
    } else if (event.key === 'Backspace' || event.key === 'Delete') {
      // Remove last filled unrevealed letter
      const slots = this.game.answerSlots();
      for (let i = slots.length - 1; i >= 0; i--) {
        if (slots[i].char !== null && !slots[i].isRevealed) {
          this.game.removeSlotLetter(i);
          break;
        }
      }
    }
  }
}

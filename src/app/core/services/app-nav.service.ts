import { Injectable, signal } from '@angular/core';

export type AppScreen = 
  | 'portal' 
  | 'hub' 
  | 'rebus' 
  | 'shape_sorter' 
  | 'sound_matcher' 
  | 'memory_flip' 
  | 'balloon_pop' 
  | 'piece_puzzle'
  | 'alphabet_safari'
  | 'number_counting'
  | 'hindi_varnamala'
  | 'magic_coloring'
  | 'animal_piano'
  | 'letter_tracing'
  | 'tic_tac_toe'
  | 'odd_one_out'
  | 'shadow_match'
  | 'feed_animals'
  | 'size_sorter'
  | 'peekaboo'
  | 'color_mixing';

@Injectable({
  providedIn: 'root'
})
export class AppNavService {
  /**
   * Current active screen. Default starts on 'portal' (Animated Start Screen).
   */
  readonly currentScreen = signal<AppScreen>('portal');
  readonly parentGateOpen = signal<boolean>(false);

  // Optional target category & letter for direct jump to tracing
  readonly tracingTargetCategory = signal<'alphabet' | 'number' | 'hindi'>('alphabet');
  readonly tracingTargetChar = signal<string | null>(null);

  goToPortal(): void {
    this.currentScreen.set('portal');
  }

  goToHub(): void {
    this.currentScreen.set('hub');
  }

  goToRebus(): void {
    this.currentScreen.set('rebus');
  }

  goToShapeSorter(): void {
    this.currentScreen.set('shape_sorter');
  }

  goToSoundMatcher(): void {
    this.currentScreen.set('sound_matcher');
  }

  goToMemoryFlip(): void {
    this.currentScreen.set('memory_flip');
  }

  goToBalloonPop(): void {
    this.currentScreen.set('balloon_pop');
  }

  goToPiecePuzzle(): void {
    this.currentScreen.set('piece_puzzle');
  }

  goToAlphabet(): void {
    this.currentScreen.set('alphabet_safari');
  }

  goToNumbers(): void {
    this.currentScreen.set('number_counting');
  }

  goToHindi(): void {
    this.currentScreen.set('hindi_varnamala');
  }

  goToColoring(): void {
    this.currentScreen.set('magic_coloring');
  }

  goToPiano(): void {
    this.currentScreen.set('animal_piano');
  }

  goToLetterTracing(category: 'alphabet' | 'number' | 'hindi' = 'alphabet', targetChar?: string): void {
    this.tracingTargetCategory.set(category);
    this.tracingTargetChar.set(targetChar || null);
    this.currentScreen.set('letter_tracing');
  }

  goToTicTacToe(): void {
    this.currentScreen.set('tic_tac_toe');
  }

  goToOddOneOut(): void {
    this.currentScreen.set('odd_one_out');
  }

  goToShadowMatch(): void {
    this.currentScreen.set('shadow_match');
  }

  goToFeedAnimals(): void {
    this.currentScreen.set('feed_animals');
  }

  goToSizeSorter(): void {
    this.currentScreen.set('size_sorter');
  }

  goToPeekaboo(): void {
    this.currentScreen.set('peekaboo');
  }

  goToColorMixing(): void {
    this.currentScreen.set('color_mixing');
  }

  openParentGate(): void {
    this.parentGateOpen.set(true);
  }

  closeParentGate(): void {
    this.parentGateOpen.set(false);
  }
}

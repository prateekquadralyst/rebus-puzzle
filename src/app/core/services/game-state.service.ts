import { Injectable, computed, signal } from '@angular/core';
import { Difficulty, Puzzle, BankLetter, UserStats } from '../models/puzzle.model';
import { REBUS_PUZZLES } from '../data/puzzles.data';
import { SoundService } from './sound.service';
import { ConfettiService } from './confetti.service';
import { SpeechService } from './speech.service';

export interface AnswerSlot {
  index: number;
  char: string | null;
  bankId: number | null;
  isRevealed: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class GameStateService {
  // Game Configuration Signals
  readonly currentDifficulty = signal<Difficulty>('easy');
  readonly currentLevelIndex = signal<number>(0);

  // User Progression & Economy Signals
  readonly score = signal<number>(0);
  readonly coins = signal<number>(120);
  readonly streak = signal<number>(0);
  readonly maxStreak = signal<number>(0);
  readonly completedIds = signal<Set<string>>(new Set());
  readonly maxUnlockedLevel = signal<Record<Difficulty, number>>({ easy: 0, medium: 0, hard: 0 });

  // Current Puzzle State Signals
  readonly answerSlots = signal<AnswerSlot[]>([]);
  readonly letterBank = signal<BankLetter[]>([]);
  readonly isSolved = signal<boolean>(false);
  readonly isError = signal<boolean>(false);
  readonly hintsUsedThisLevel = signal<number>(0);

  // ⏱️ Timer Attack Signals
  readonly isTimerMode = signal<boolean>(false);
  readonly timerSeconds = signal<number>(45);
  readonly isTimeUp = signal<boolean>(false);
  readonly maxTimerSeconds = 45;
  private timerInterval: any = null;

  // 🔗 Friend & Daily Challenge Signals
  readonly isFriendChallenge = signal<boolean>(false);
  readonly isDailyChallenge = signal<boolean>(false);
  readonly challengePuzzle = signal<Puzzle | null>(null);
  readonly shareUrl = signal<string>('');

  // Modals & UI View Signals
  readonly showHintModal = signal<boolean>(false);
  readonly showModeModal = signal<boolean>(false);
  readonly showStatsModal = signal<boolean>(false);
  readonly showClueDrawer = signal<boolean>(false);
  readonly showBuilderModal = signal<boolean>(false);
  readonly showThemeModal = signal<boolean>(false);
  readonly showShareModal = signal<boolean>(false);
  readonly showMenuModal = signal<boolean>(false);
  readonly showGuideModal = signal<boolean>(false);

  // Custom User Puzzles
  readonly customPuzzles = signal<Puzzle[]>([]);

  // Combined Puzzles (Custom + Built-in)
  readonly allPuzzles = computed<Puzzle[]>(() => {
    return [...this.customPuzzles(), ...REBUS_PUZZLES];
  });

  // Filtered puzzles for currently selected difficulty mode
  readonly currentModePuzzles = computed<Puzzle[]>(() => {
    return this.allPuzzles().filter(p => p.difficulty === this.currentDifficulty());
  });

  // Current Active Puzzle (Overrides if friend challenge or daily is active)
  readonly currentPuzzle = computed<Puzzle>(() => {
    if (this.isFriendChallenge() && this.challengePuzzle()) {
      return this.challengePuzzle()!;
    }
    const list = this.currentModePuzzles();
    const idx = Math.min(Math.max(0, this.currentLevelIndex()), list.length - 1);
    return list[idx] || REBUS_PUZZLES[0];
  });

  // Level Progression Info
  readonly totalLevelsInMode = computed<number>(() => this.currentModePuzzles().length);
  readonly maxUnlockedForCurrentMode = computed<number>(() => {
    return this.maxUnlockedLevel()[this.currentDifficulty()] ?? 0;
  });
  readonly hasNextLevel = computed<boolean>(() => !this.isFriendChallenge() && this.currentLevelIndex() < this.totalLevelsInMode() - 1);
  readonly canGoNextLevel = computed<boolean>(() => {
    if (this.isFriendChallenge()) return false;
    const currentIdx = this.currentLevelIndex();
    const maxInMode = this.totalLevelsInMode();
    if (currentIdx >= maxInMode - 1) return false;

    const diff = this.currentDifficulty();
    const maxUnlocked = this.maxUnlockedLevel()[diff] ?? 0;
    const isCurrentCompleted = this.completedIds().has(this.currentPuzzle().id) || this.isSolved();

    // Allowed to proceed only if current is solved/completed OR next level is already unlocked!
    return isCurrentCompleted || currentIdx < maxUnlocked;
  });
  readonly hasPrevLevel = computed<boolean>(() => !this.isFriendChallenge() && this.currentLevelIndex() > 0);

  // Computed word from slots
  readonly currentEnteredWord = computed<string>(() => {
    return this.answerSlots().map(s => s.char || '').join('');
  });

  readonly isAllSlotsFilled = computed<boolean>(() => {
    const slots = this.answerSlots();
    return slots.length > 0 && slots.every(s => s.char !== null);
  });

  constructor(
    private soundService: SoundService,
    private confettiService: ConfettiService,
    public speechService: SpeechService
  ) {
    this.loadFromStorage();
    this.checkUrlForChallenge();
    this.initPuzzle();
  }

  /**
   * Initialize slots and letter bank for the active puzzle
   */
  initPuzzle(): void {
    const puzzle = this.currentPuzzle();
    if (!puzzle) return;

    this.isSolved.set(false);
    this.isError.set(false);
    this.isTimeUp.set(false);
    this.hintsUsedThisLevel.set(0);

    const cleanAnswer = puzzle.answer.trim().toUpperCase();

    // Setup answer slots
    const slots: AnswerSlot[] = cleanAnswer.split('').map((_, i) => ({
      index: i,
      char: null,
      bankId: null,
      isRevealed: false
    }));
    this.answerSlots.set(slots);

    // Setup scrambled letter bank
    // Easy mode: 10 letters (gentle for kids)
    // Medium mode: 12-14 letters (clever)
    // Hard mode: 14-16 letters (5+ tricky distractors)
    const answerChars = cleanAnswer.split('');
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const bankTargetLength = puzzle.difficulty === 'easy' 
      ? Math.max(10, answerChars.length + 2) 
      : puzzle.difficulty === 'medium' 
        ? Math.max(12, answerChars.length + 3) 
        : Math.max(14, answerChars.length + 5);

    // Distractors
    const neededFillers = Math.max(2, bankTargetLength - answerChars.length);
    const fillers: string[] = [];
    for (let i = 0; i < neededFillers; i++) {
      const randChar = alphabet[Math.floor(Math.random() * alphabet.length)];
      fillers.push(randChar);
    }

    const pool = [...answerChars, ...fillers];
    // Fisher-Yates shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    const bankLetters: BankLetter[] = pool.map((char, index) => ({
      id: index,
      char,
      isUsed: false,
      isEliminated: false
    }));

    this.letterBank.set(bankLetters);

    // Reset and start timer if Timer Mode is on
    this.resetTimer();
  }

  // ==========================================
  // ⏱️ TIMER / BLITZ ATTACK ENGINE
  // ==========================================
  toggleTimerMode(): void {
    this.soundService.playTap();
    const nextState = !this.isTimerMode();
    this.isTimerMode.set(nextState);
    if (nextState) {
      this.resetTimer();
    } else {
      this.stopTimer();
    }
  }

  private resetTimer(): void {
    this.stopTimer();
    if (!this.isTimerMode()) return;

    this.timerSeconds.set(this.maxTimerSeconds);
    this.isTimeUp.set(false);

    this.timerInterval = setInterval(() => {
      if (this.isSolved()) {
        this.stopTimer();
        return;
      }

      const cur = this.timerSeconds();
      if (cur <= 1) {
        this.timerSeconds.set(0);
        this.isTimeUp.set(true);
        this.soundService.playError();
        this.stopTimer();
      } else {
        this.timerSeconds.set(cur - 1);
        if (cur <= 10) {
          // Play urgent ticking sound
          this.soundService.playTap();
        }
      }
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  retryTimerPuzzle(): void {
    this.soundService.playTap();
    this.initPuzzle();
  }

  /**
   * Change difficulty mode (Easy, Medium, Hard)
   */
  setDifficulty(mode: Difficulty): void {
    this.isFriendChallenge.set(false);
    this.isDailyChallenge.set(false);
    if (this.currentDifficulty() === mode) return;
    this.soundService.playTap();
    this.currentDifficulty.set(mode);
    const unlocked = this.maxUnlockedLevel()[mode] ?? 0;
    const maxInMode = this.currentModePuzzles().length;
    this.currentLevelIndex.set(Math.min(unlocked, Math.max(0, maxInMode - 1)));
    this.showModeModal.set(false);
    this.initPuzzle();
    this.saveToStorage();
  }

  /**
   * Jump to specific level index in current mode
   */
  setLevelIndex(index: number): void {
    this.isFriendChallenge.set(false);
    if (index < 0 || index >= this.totalLevelsInMode()) return;
    const maxUnlocked = this.maxUnlockedLevel()[this.currentDifficulty()] ?? 0;
    if (index > maxUnlocked) {
      this.soundService.playError();
      return;
    }
    this.soundService.playTap();
    this.currentLevelIndex.set(index);
    this.initPuzzle();
  }

  nextLevel(): void {
    this.isFriendChallenge.set(false);
    if (!this.canGoNextLevel()) {
      this.soundService.playError();
      return;
    }
    this.soundService.playTap();
    this.currentLevelIndex.update(idx => idx + 1);
    this.initPuzzle();
  }

  prevLevel(): void {
    this.isFriendChallenge.set(false);
    if (this.hasPrevLevel()) {
      this.soundService.playTap();
      this.currentLevelIndex.update(idx => idx - 1);
      this.initPuzzle();
    }
  }

  /**
   * User clicks a letter tile in the bank
   */
  selectBankLetter(bankId: number): void {
    if (this.isSolved() || this.isTimeUp()) return;

    const bank = [...this.letterBank()];
    const letter = bank.find(l => l.id === bankId);
    if (!letter || letter.isUsed || letter.isEliminated) return;

    // Find first empty slot
    const slots = [...this.answerSlots()];
    const emptySlot = slots.find(s => s.char === null);
    if (!emptySlot) return;

    letter.isUsed = true;
    emptySlot.char = letter.char;
    emptySlot.bankId = letter.id;

    this.soundService.playPop(1 + emptySlot.index * 0.08);
    this.letterBank.set(bank);
    this.answerSlots.set(slots);

    // Auto-check if completed
    if (this.isAllSlotsFilled()) {
      this.validateAnswer();
    }
  }

  /**
   * User clicks a filled slot to remove letter and return it to bank
   */
  removeSlotLetter(slotIndex: number): void {
    if (this.isSolved() || this.isTimeUp()) return;

    const slots = [...this.answerSlots()];
    const slot = slots[slotIndex];
    if (!slot || slot.char === null || slot.isRevealed) return;

    const bankId = slot.bankId;
    if (bankId !== null) {
      const bank = [...this.letterBank()];
      const letter = bank.find(l => l.id === bankId);
      if (letter) {
        letter.isUsed = false;
        this.letterBank.set(bank);
      }
    }

    slot.char = null;
    slot.bankId = null;
    this.isError.set(false);
    this.soundService.playRemove();
    this.answerSlots.set(slots);
  }

  /**
   * Clear all non-revealed slots
   */
  clearNonRevealedSlots(): void {
    if (this.isSolved() || this.isTimeUp()) return;
    this.soundService.playTap();

    const bank = [...this.letterBank()];
    const slots = [...this.answerSlots()];

    slots.forEach(slot => {
      if (!slot.isRevealed && slot.char !== null) {
        if (slot.bankId !== null) {
          const l = bank.find(b => b.id === slot.bankId);
          if (l) l.isUsed = false;
        }
        slot.char = null;
        slot.bankId = null;
      }
    });

    this.isError.set(false);
    this.letterBank.set(bank);
    this.answerSlots.set(slots);
  }

  /**
   * Validate completed answer
   */
  private validateAnswer(): void {
    const currentWord = this.currentEnteredWord().toUpperCase();
    const targetWord = this.currentPuzzle().answer.toUpperCase();

    if (currentWord === targetWord) {
      // Correct!
      this.stopTimer();
      this.soundService.playSuccess();
      this.confettiService.fire();
      this.isSolved.set(true);
      this.isError.set(false);

      // 🗣️ Native Web Speech: Pronounce the solved word!
      this.speechService.speakWord(targetWord);

      const puzzle = this.currentPuzzle();
      const hintsUsed = this.hintsUsedThisLevel();
      const basePoints = puzzle.points;
      
      // Calculate multiplier (Timer Speed Bonus vs Hint Penalty)
      let multiplier = hintsUsed === 0 ? 1.5 : 1.0;
      let bonusCoins = hintsUsed === 0 ? 35 : 20;

      if (this.isTimerMode()) {
        const timeRemaining = this.timerSeconds();
        if (timeRemaining >= 30) {
          multiplier = 3.0; // Lightning fast!
          bonusCoins += 50;
        } else if (timeRemaining >= 15) {
          multiplier = 2.0; // Fast!
          bonusCoins += 25;
        }
      }

      if (this.isDailyChallenge()) {
        bonusCoins += 100; // Daily bonus!
      }

      const earnedScore = Math.round(basePoints * multiplier);

      // Update streaks
      const nextStreak = this.streak() + 1;
      this.streak.set(nextStreak);
      if (nextStreak > this.maxStreak()) {
        this.maxStreak.set(nextStreak);
      }

      this.score.update(s => s + earnedScore);
      this.coins.update(c => c + bonusCoins);

      const completed = new Set(this.completedIds());
      completed.add(puzzle.id);
      this.completedIds.set(completed);

      // Unlock next level in current mode
      const diff = this.currentDifficulty();
      const currentIdx = this.currentLevelIndex();
      const maxMap = { ...this.maxUnlockedLevel() };
      if (currentIdx + 1 > (maxMap[diff] ?? 0)) {
        maxMap[diff] = currentIdx + 1;
        this.maxUnlockedLevel.set(maxMap);
      }

      this.saveToStorage();
    } else {
      // Wrong
      this.soundService.playError();
      this.isError.set(true);

      // Reset error shake after 700ms
      setTimeout(() => {
        this.isError.set(false);
      }, 700);
    }
  }

  // ==========================================
  // 💡 HINT SYSTEM
  // ==========================================
  revealOneLetter(): boolean {
    if (this.isSolved() || this.isTimeUp()) return false;
    const cost = 25;
    if (this.coins() < cost) return false;

    const puzzle = this.currentPuzzle();
    const targetChars = puzzle.answer.toUpperCase().split('');
    const slots = [...this.answerSlots()];
    const bank = [...this.letterBank()];

    const eligibleIndices: number[] = [];
    slots.forEach((s, idx) => {
      if (!s.isRevealed && s.char !== targetChars[idx]) {
        eligibleIndices.push(idx);
      }
    });

    if (eligibleIndices.length === 0) return false;

    const targetSlotIdx = eligibleIndices[0];
    const correctChar = targetChars[targetSlotIdx];

    if (slots[targetSlotIdx].char !== null && slots[targetSlotIdx].bankId !== null) {
      const prevBank = bank.find(b => b.id === slots[targetSlotIdx].bankId);
      if (prevBank) prevBank.isUsed = false;
    }

    let bankMatch = bank.find(b => b.char === correctChar && !b.isUsed && !b.isEliminated);
    if (!bankMatch) {
      const otherSlot = slots.find(s => s.char === correctChar && !s.isRevealed);
      if (otherSlot && otherSlot.bankId !== null) {
        bankMatch = bank.find(b => b.id === otherSlot.bankId);
        otherSlot.char = null;
        otherSlot.bankId = null;
      }
    }

    if (bankMatch) {
      bankMatch.isUsed = true;
      slots[targetSlotIdx] = {
        index: targetSlotIdx,
        char: correctChar,
        bankId: bankMatch.id,
        isRevealed: true
      };
    } else {
      slots[targetSlotIdx] = {
        index: targetSlotIdx,
        char: correctChar,
        bankId: null,
        isRevealed: true
      };
    }

    this.coins.update(c => Math.max(0, c - cost));
    this.hintsUsedThisLevel.update(h => h + 1);
    this.soundService.playHint();

    this.letterBank.set(bank);
    this.answerSlots.set(slots);

    if (this.isAllSlotsFilled()) {
      this.validateAnswer();
    }
    this.saveToStorage();
    return true;
  }

  bombUnusedLetters(): boolean {
    if (this.isSolved() || this.isTimeUp()) return false;
    const cost = 35;
    if (this.coins() < cost) return false;

    const puzzle = this.currentPuzzle();
    const answerChars = puzzle.answer.toUpperCase().split('');
    const bank = [...this.letterBank()];

    const answerCharCounts: Record<string, number> = {};
    answerChars.forEach(c => answerCharCounts[c] = (answerCharCounts[c] || 0) + 1);
    const neededBankCounts = { ...answerCharCounts };

    const eligibleToBomb: BankLetter[] = [];
    bank.forEach(letter => {
      if (letter.isEliminated || letter.isUsed) return;
      if (!neededBankCounts[letter.char] || neededBankCounts[letter.char] <= 0) {
        eligibleToBomb.push(letter);
      } else {
        neededBankCounts[letter.char]--;
      }
    });

    if (eligibleToBomb.length === 0) return false;

    const toEliminate = eligibleToBomb.slice(0, 3);
    toEliminate.forEach(b => {
      b.isEliminated = true;
    });

    this.coins.update(c => Math.max(0, c - cost));
    this.hintsUsedThisLevel.update(h => h + 1);
    this.soundService.playBomb();

    this.letterBank.set(bank);
    this.saveToStorage();
    return true;
  }

  showTextClue(): boolean {
    if (this.showClueDrawer()) {
      this.showClueDrawer.set(false);
      return true;
    }
    const cost = 15;
    if (this.coins() < cost) return false;

    this.coins.update(c => Math.max(0, c - cost));
    this.hintsUsedThisLevel.update(h => h + 1);
    this.soundService.playHint();
    this.showClueDrawer.set(true);
    // Read clue aloud
    this.speechService.speakClue(this.currentPuzzle().hintText);
    this.saveToStorage();
    return true;
  }

  skipLevel(): boolean {
    if (this.isSolved() || this.isTimeUp()) return false;
    const cost = 50;
    if (this.coins() < cost) return false;
    this.coins.update(c => Math.max(0, c - cost));
    this.soundService.playTap();

    // Mark current level as completed
    const completed = new Set(this.completedIds());
    completed.add(this.currentPuzzle().id);
    this.completedIds.set(completed);

    // Unlock next level
    const diff = this.currentDifficulty();
    const currentIdx = this.currentLevelIndex();
    const maxMap = { ...this.maxUnlockedLevel() };
    if (currentIdx + 1 > (maxMap[diff] ?? 0)) {
      maxMap[diff] = currentIdx + 1;
      this.maxUnlockedLevel.set(maxMap);
    }
    this.saveToStorage();

    if (this.currentLevelIndex() < this.totalLevelsInMode() - 1) {
      this.currentLevelIndex.update(idx => idx + 1);
      this.initPuzzle();
    }
    return true;
  }

  // ==========================================
  // 🔗 CHALLENGE A FRIEND & SHARING
  // ==========================================
  shareCurrentPuzzle(): void {
    this.soundService.playTap();
    const puzzle = this.currentPuzzle();
    const payload = {
      a: puzzle.answer,
      c: puzzle.category,
      h: puzzle.hintText,
      d: puzzle.difficulty,
      i: puzzle.images
    };
    const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    const url = `${window.location.origin}${window.location.pathname}?challenge=${b64}`;
    this.shareUrl.set(url);
    this.showShareModal.set(true);
  }

  private checkUrlForChallenge(): void {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const challengeParam = params.get('challenge');
    if (challengeParam) {
      try {
        const json = decodeURIComponent(escape(atob(challengeParam)));
        const data = JSON.parse(json);
        if (data.a && data.i) {
          const puzzle: Puzzle = {
            id: 'challenge_' + Date.now(),
            answer: data.a.toUpperCase(),
            category: data.c || "Friend's Challenge",
            hintText: data.h || 'Can you solve this challenge?',
            difficulty: data.d || 'hard',
            points: 400,
            explanation: `Puzzle from a friend: ${data.a}!`,
            images: data.i
          };
          this.challengePuzzle.set(puzzle);
          this.isFriendChallenge.set(true);
          this.currentDifficulty.set(puzzle.difficulty);
        }
      } catch (e) {
        console.warn('Invalid challenge URL parameter', e);
      }
    }
  }

  // ==========================================
  // 📅 DAILY MYSTERY PUZZLE
  // ==========================================
  startDailyChallenge(): void {
    this.soundService.playTap();
    this.isFriendChallenge.set(false);
    this.isDailyChallenge.set(true);
    
    // Pick daily puzzle based on Day of Year
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = (now.getTime() - start.getTime()) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    const pool = REBUS_PUZZLES;
    const dailyIdx = dayOfYear % pool.length;
    const puzzle = pool[dailyIdx];

    this.currentDifficulty.set(puzzle.difficulty);
    const modeList = this.currentModePuzzles();
    const targetIdx = modeList.findIndex(p => p.id === puzzle.id);
    this.currentLevelIndex.set(targetIdx >= 0 ? targetIdx : 0);
    this.initPuzzle();
  }

  // ==========================================
  // CUSTOM USER PUZZLES
  // ==========================================
  addCustomPuzzle(newPuzzle: Puzzle): void {
    const updated = [newPuzzle, ...this.customPuzzles()];
    this.customPuzzles.set(updated);
    this.currentDifficulty.set(newPuzzle.difficulty);
    this.currentLevelIndex.set(0);
    this.showBuilderModal.set(false);
    this.initPuzzle();
    this.saveToStorage();
    this.soundService.playSuccess();
  }

  // ==========================================
  // STORAGE & PERSISTENCE
  // ==========================================
  private loadFromStorage(): void {
    try {
      const dataStr = localStorage.getItem('rebus_puzzle_user_v2');
      if (dataStr) {
        const data = JSON.parse(dataStr);
        if (data.score !== undefined) this.score.set(data.score);
        if (data.coins !== undefined) this.coins.set(data.coins);
        if (data.streak !== undefined) this.streak.set(data.streak);
        if (data.maxStreak !== undefined) this.maxStreak.set(data.maxStreak);
        if (data.completedIds) this.completedIds.set(new Set(data.completedIds));
        if (data.maxUnlockedLevel) {
          this.maxUnlockedLevel.set({
            easy: data.maxUnlockedLevel.easy ?? 0,
            medium: data.maxUnlockedLevel.medium ?? 0,
            hard: data.maxUnlockedLevel.hard ?? 0
          });
        }
        if (data.currentDifficulty) this.currentDifficulty.set(data.currentDifficulty);
        if (data.customPuzzles && Array.isArray(data.customPuzzles)) {
          this.customPuzzles.set(data.customPuzzles);
        }
      }
    } catch (e) {
      console.warn('Could not read user state from storage', e);
    }
  }

  private saveToStorage(): void {
    try {
      const data = {
        score: this.score(),
        coins: this.coins(),
        streak: this.streak(),
        maxStreak: this.maxStreak(),
        completedIds: Array.from(this.completedIds()),
        maxUnlockedLevel: this.maxUnlockedLevel(),
        currentDifficulty: this.currentDifficulty(),
        customPuzzles: this.customPuzzles()
      };
      localStorage.setItem('rebus_puzzle_user_v2', JSON.stringify(data));
    } catch (e) {
      console.warn('Could not save user state to storage', e);
    }
  }
}

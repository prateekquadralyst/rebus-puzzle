export type Difficulty = 'easy' | 'medium' | 'hard';

export interface PuzzleImage {
  url?: string;
  alt: string;
  label?: string;
  svgIcon?: string; // Optional built-in SVG icon for zero-latency, crisp rendering
  emoji?: string;
  bgGradient?: string;
}

export interface Puzzle {
  id: string;
  difficulty: Difficulty;
  category: string;
  images: PuzzleImage[];
  answer: string;
  hintText: string;
  points: number;
  explanation: string;
  authorNote?: string;
}

export interface BankLetter {
  id: number;
  char: string;
  isUsed: boolean;
  isEliminated: boolean;
}

export interface UserStats {
  score: number;
  coins: number;
  streak: number;
  maxStreak: number;
  completedIds: string[];
  hintsUsedCount: number;
  levelsCompletedByDifficulty: {
    easy: number;
    medium: number;
    hard: number;
  };
}

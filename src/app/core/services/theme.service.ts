import { Injectable, signal } from '@angular/core';

export type GameTheme = 'midnight' | 'cyberpunk' | 'retro80s' | 'emerald';

export interface ThemeConfig {
  id: GameTheme;
  name: string;
  emoji: string;
  badge: string;
  primaryGlow: string;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  readonly currentTheme = signal<GameTheme>('midnight');

  readonly themes: ThemeConfig[] = [
    {
      id: 'midnight',
      name: 'Midnight Slate',
      emoji: '🌌',
      badge: 'Classic',
      primaryGlow: 'rgba(99, 102, 241, 0.4)'
    },
    {
      id: 'cyberpunk',
      name: 'Neon Cyberpunk',
      emoji: '⚡',
      badge: 'Vibrant',
      primaryGlow: 'rgba(236, 72, 153, 0.45)'
    },
    {
      id: 'retro80s',
      name: 'Retro Synthwave',
      emoji: '🕹️',
      badge: 'Arcade',
      primaryGlow: 'rgba(245, 158, 11, 0.45)'
    },
    {
      id: 'emerald',
      name: 'Emerald Oasis',
      emoji: '🌿',
      badge: 'Zen',
      primaryGlow: 'rgba(16, 185, 129, 0.45)'
    }
  ];

  constructor() {
    const saved = localStorage.getItem('rebus_theme') as GameTheme;
    if (saved && this.themes.some(t => t.id === saved)) {
      this.setTheme(saved);
    } else {
      this.setTheme('midnight');
    }
  }

  setTheme(theme: GameTheme): void {
    this.currentTheme.set(theme);
    localStorage.setItem('rebus_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }
}

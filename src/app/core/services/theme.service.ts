import { Injectable, signal } from '@angular/core';

export type GameTheme = 'midnight' | 'rainbow' | 'candy' | 'emerald' | 'ocean' | 'cyberpunk' | 'sunset' | 'retro80s';

export interface ThemeConfig {
  id: GameTheme;
  name: string;
  hindiName: string;
  emoji: string;
  badge: string;
  description: string;
  previewColors: string[];
  primaryGlow: string;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  readonly currentTheme = signal<GameTheme>('midnight');
  readonly isModalOpen = signal<boolean>(false);

  readonly themes: ThemeConfig[] = [
    {
      id: 'midnight',
      name: 'Midnight Galaxy',
      hindiName: 'रात का आकाश',
      emoji: '🌌',
      badge: 'Cosmic',
      description: 'गहरा अंतरिक्ष और चमकते सितारे',
      previewColors: ['#1e1b4b', '#6366f1', '#0f172a'],
      primaryGlow: 'rgba(99, 102, 241, 0.45)'
    },
    {
      id: 'rainbow',
      name: 'Rainbow Sunshine',
      hindiName: 'सतरंगी इंद्रधनुष',
      emoji: '🌈',
      badge: 'Daylight',
      description: 'खुशनुमा आसमानी नीला और सुनहरी धूप',
      previewColors: ['#0284c7', '#38bdf8', '#0c4a6e'],
      primaryGlow: 'rgba(56, 189, 248, 0.5)'
    },
    {
      id: 'candy',
      name: 'Candy Wonderland',
      hindiName: 'कैंडी वंडरलैंड',
      emoji: '🍬',
      badge: 'Sweet',
      description: 'मीठी स्ट्रॉबेरी और गुलाबी परियों की दुनिया',
      previewColors: ['#9d174d', '#f43f5e', '#4c0519'],
      primaryGlow: 'rgba(244, 63, 94, 0.5)'
    },
    {
      id: 'emerald',
      name: 'Jungle Safari',
      hindiName: 'हरा-भरा जंगल',
      emoji: '🌿',
      badge: 'Safari',
      description: 'हरा जंगल, प्यारे जानवर और पेड़-पौधे',
      previewColors: ['#064e3b', '#10b981', '#022c22'],
      primaryGlow: 'rgba(16, 185, 129, 0.45)'
    },
    {
      id: 'ocean',
      name: 'Ocean Magic',
      hindiName: 'जादुई समंदर',
      emoji: '🌊',
      badge: 'Deep Sea',
      description: 'गहरा नीला समंदर और चमकीले बुलबुले',
      previewColors: ['#0e7490', '#06b6d4', '#083344'],
      primaryGlow: 'rgba(6, 182, 212, 0.45)'
    },
    {
      id: 'cyberpunk',
      name: 'Neon Arcade',
      hindiName: 'नीयन आर्केड',
      emoji: '⚡',
      badge: 'Arcade',
      description: 'चमकती रंगीन बत्तियां और गेमिंग वाइब्स',
      previewColors: ['#581c87', '#ec4899', '#2e1065'],
      primaryGlow: 'rgba(236, 72, 153, 0.5)'
    },
    {
      id: 'sunset',
      name: 'Sunset Twilight',
      hindiName: 'शाम की लाली',
      emoji: '🌅',
      badge: 'Sunset',
      description: 'ढलता सूरज, गर्म पीला और संतरी उजाला',
      previewColors: ['#854d0e', '#f59e0b', '#451a03'],
      primaryGlow: 'rgba(245, 158, 11, 0.5)'
    }
  ];

  constructor() {
    let saved = localStorage.getItem('rebus_theme') as GameTheme;
    if (saved === 'retro80s') {
      saved = 'sunset';
    }
    if (saved && this.themes.some(t => t.id === saved)) {
      this.setTheme(saved);
    } else {
      this.setTheme('midnight');
    }
  }

  setTheme(theme: GameTheme): void {
    const targetTheme = (theme === 'retro80s' ? 'sunset' : theme);
    this.currentTheme.set(targetTheme);
    localStorage.setItem('rebus_theme', targetTheme);
    document.documentElement.setAttribute('data-theme', targetTheme);
  }

  open(): void {
    this.isModalOpen.set(true);
  }

  close(): void {
    this.isModalOpen.set(false);
  }

  toggle(): void {
    this.isModalOpen.update(v => !v);
  }
}

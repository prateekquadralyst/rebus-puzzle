import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SpeechService {
  private synth: SpeechSynthesis | null = null;
  readonly isSupported: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.isSupported = true;
    }
  }

  speakWord(word: string): void {
    this.speak(word);
  }

  speak(text: string, lang: 'en' | 'hi' = 'en'): void {
    if (!this.synth || !this.isSupported) return;
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = 1;

    const voices = this.synth.getVoices();

    if (lang === 'hi') {
      utterance.rate = 0.88;
      utterance.pitch = 1.05;
      utterance.lang = 'hi-IN';
      const hiVoice = voices.find(v => v.lang.startsWith('hi')) || null;
      if (hiVoice) utterance.voice = hiVoice;
    } else {
      utterance.rate = 0.92;
      utterance.pitch = 1.15;
      utterance.lang = 'en-US';
      const enVoice = voices.find(v => v.lang.startsWith('en')) || null;
      if (enVoice) utterance.voice = enVoice;
    }

    this.synth.speak(utterance);
  }

  speakHindi(text: string): void {
    this.speak(text, 'hi');
  }

  speakClue(clueText: string): void {
    this.speak(clueText);
  }

  stop(): void {
    if (this.synth) this.synth.cancel();
  }
}

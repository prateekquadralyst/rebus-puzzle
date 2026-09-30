import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SpeechService {
  private synth: SpeechSynthesis | null = null;
  readonly isSupported: boolean = false;
  private voices: SpeechSynthesisVoice[] = [];
  private isSpeaking = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.isSupported = true;
      this.initVoices();
    }
  }

  private initVoices(): void {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => {
        if (this.synth) {
          this.voices = this.synth.getVoices();
        }
      };
    }
  }

  speakWord(word: string): void {
    this.speak(word);
  }

  speak(text: string, lang: 'en' | 'hi' = 'en'): void {
    if (!this.synth || !this.isSupported) return;

    try {
      // Resume if suspended
      if (this.synth.paused) {
        this.synth.resume();
      }
      this.synth.cancel();

      // Refresh voices if empty
      if (this.voices.length === 0) {
        this.voices = this.synth.getVoices();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.volume = 1;

      if (lang === 'hi') {
        utterance.rate = 0.88;
        utterance.pitch = 1.05;
        utterance.lang = 'hi-IN';
        const hiVoice = this.voices.find(v => v.lang && (v.lang.startsWith('hi') || v.lang.includes('IN'))) || null;
        if (hiVoice) utterance.voice = hiVoice;
      } else {
        utterance.rate = 0.92;
        utterance.pitch = 1.15;
        utterance.lang = 'en-US';
        const enVoice = this.voices.find(v => v.lang && v.lang.startsWith('en')) || null;
        if (enVoice) utterance.voice = enVoice;
      }

      utterance.onend = () => {
        this.isSpeaking = false;
      };

      utterance.onerror = (e) => {
        this.isSpeaking = false;
        console.warn('SpeechSynthesis error:', e);
      };

      // Slight timeout to prevent Chromium cancel race bug
      setTimeout(() => {
        if (this.synth) {
          this.isSpeaking = true;
          this.synth.speak(utterance);
        }
      }, 25);
    } catch (err) {
      console.warn('Could not speak:', err);
    }
  }

  speakHindi(text: string): void {
    this.speak(text, 'hi');
  }

  speakClue(clueText: string): void {
    this.speak(clueText);
  }

  stop(): void {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
    }
  }
}

import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.toddlermind.app',
  appName: 'Toddler Mind World',
  webDir: 'dist/rebus-puzzle/browser',
  server: {
    androidScheme: 'https'
  }
};

export default config;

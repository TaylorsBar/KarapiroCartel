import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.karapirocartel.app',
  appName: 'Karapiro Cartel',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    Purchases: {
      apiKey: process.env.VITE_REVENUECAT_API_KEY || 'your_revenuecat_api_key_here'
    }
  }
};

export default config;
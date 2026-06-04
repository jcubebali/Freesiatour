// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pre-populate process.env with local firebase-applet-config.json if available
// so that Vite's built-in env loader exposes them via import.meta.env.VITE_...
try {
  const configPath = path.resolve(__dirname, 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    process.env.VITE_FIREBASE_PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || firebaseConfig.projectId || '';
    process.env.VITE_FIREBASE_APP_ID = process.env.VITE_FIREBASE_APP_ID || firebaseConfig.appId || '';
    process.env.VITE_FIREBASE_API_KEY = process.env.VITE_FIREBASE_API_KEY || firebaseConfig.apiKey || '';
    process.env.VITE_FIREBASE_AUTH_DOMAIN = process.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfig.authDomain || '';
    process.env.VITE_FIREBASE_STORAGE_BUCKET = process.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfig.storageBucket || '';
    process.env.VITE_FIREBASE_MESSAGING_SENDER_ID = process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfig.messagingSenderId || '';
    process.env.VITE_FIREBASE_MEASUREMENT_ID = process.env.VITE_FIREBASE_MEASUREMENT_ID || firebaseConfig.measurementId || '';
    process.env.VITE_FIREBASE_DATABASE_ID = process.env.VITE_FIREBASE_DATABASE_ID || firebaseConfig.firestoreDatabaseId || '';
  }
} catch (e) {
  console.log("No firebase-applet-config.json config found during build-time.");
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    'process.env.GOOGLE_MAPS_PLATFORM_KEY': JSON.stringify(process.env.GOOGLE_MAPS_PLATFORM_KEY || '')
  }
});





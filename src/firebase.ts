/// <reference types="vite/client" />

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'freesiatour-4a564',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:96331863560:web:da82fbd59e1d8c023363bd',
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCK38lP5Yf9HIlEu6fx1XBtLn8KtVHDvXs',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'freesiatour-4a564.firebaseapp.com',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'freesiatour-4a564.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '96331863560',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-CX2PJQYK23',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(
  app, 
  import.meta.env.VITE_FIREBASE_DATABASE_ID || '(default)'
);
export const auth = getAuth(app);

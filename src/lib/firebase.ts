'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  "projectId": "studio-9914620735-2da46",
  "appId": "1:372944066587:web:f59068e408ac7aabadc0be",
  "apiKey": "AIzaSyCdhIAA4cfbvZEM0--q5f_3lr5zJVFWONc",
  "authDomain": "studio-9914620735-2da46.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "372944066587"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };

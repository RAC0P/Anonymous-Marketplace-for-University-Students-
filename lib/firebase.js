import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAWPj5zyhAilge44FmIjWVKUj7MXw5vYVg",
  authDomain: "campusxchange-20e4c.firebaseapp.com",
  projectId: "campusxchange-20e4c",
  storageBucket: "campusxchange-20e4c.firebasestorage.app",
  messagingSenderId: "875437575162",
  appId: "1:875437575162:web:cdfbc55c0365f057fa7243"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);

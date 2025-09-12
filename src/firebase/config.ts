import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCoYAi5YwPRmKSBTLwl_9d0AOjUDOvtSLw",
  authDomain: "cafetes-26e28.firebaseapp.com",
  projectId: "cafetes-26e28",
  storageBucket: "cafetes-26e28.firebasestorage.app",
  messagingSenderId: "854334409891",
  appId: "1:854334409891:web:38e7e7d596435cb7088316",
  measurementId: "G-47FZZEJ4Z6",
  databaseURL: "https://cafetes-26e28-default-rtdb.asia-southeast1.firebasedatabase.app",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const database = getDatabase(app);

export default app;
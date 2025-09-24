import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDFcCafU2GOwyy723Lue4BTWAo_jkoH1B4",
  authDomain: "arundaya-9fb69.firebaseapp.com",
  databaseURL: "https://arundaya-9fb69-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "arundaya-9fb69",
  storageBucket: "arundaya-9fb69.appspot.com",
  messagingSenderId: "973011335469",
  appId: "1:973011335469:web:17a692aeda668afbf93ba4",
  measurementId: "G-MXV0KGYXNH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const database = getDatabase(app);

export default app;
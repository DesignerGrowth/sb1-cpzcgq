import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyABqrXOZmynEYPU3VdC6t5y3srvcxQZM1M",
  authDomain: "pomodoro-7e691.firebaseapp.com",
  projectId: "pomodoro-7e691",
  storageBucket: "pomodoro-7e691.appspot.com",
  messagingSenderId: "97329891875",
  appId: "1:97329891875:web:907519e6424702a70bff96"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Firebase Performance Monitoring.
if (process.env.NODE_ENV === 'production') {
  import('firebase/performance').then(({ getPerformance }) => {
    getPerformance(app);
  });
}
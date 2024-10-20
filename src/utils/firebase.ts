import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence, disableNetwork, enableNetwork } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { toast } from 'react-toastify';

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

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
  } else if (err.code === 'unimplemented') {
    console.warn('The current browser does not support all of the features required to enable persistence');
  }
});

// Initialize Firebase Performance Monitoring.
if (process.env.NODE_ENV === 'production') {
  import('firebase/performance').then(({ getPerformance }) => {
    getPerformance(app);
  });
}

let isCheckingConnection = false;

// Function to check Firestore connection
export const checkFirestoreConnection = async () => {
  if (isCheckingConnection) return;
  
  isCheckingConnection = true;
  try {
    await disableNetwork(db);
    await enableNetwork(db);
    console.log('Firestore connection restored');
    toast.success('Connection to the server restored');
  } catch (error) {
    console.error('Error reconnecting to Firestore:', error);
    toast.error('Unable to connect to the server. Some features may be limited.');
  } finally {
    isCheckingConnection = false;
  }
};
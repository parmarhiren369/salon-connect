import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCSQNETlZMQvhqMhTAWBsU_O1ZPzuUluq0",
  authDomain: "salon-connect-243e4.firebaseapp.com",
  projectId: "salon-connect-243e4",
  storageBucket: "salon-connect-243e4.firebasestorage.app",
  messagingSenderId: "363552350895",
  appId: "1:363552350895:web:b09eddb4bfdabd2fb0aa5a",
  measurementId: "G-SXGTVSWVHQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;

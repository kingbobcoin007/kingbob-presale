// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence, disableNetwork, enableNetwork } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Use the exact Firebase configuration from your Firebase console
const firebaseConfig = {
  apiKey: "AIzaSyCA54gUoSLB5yGJvDc18SyTwbZhYTeImhE",
  authDomain: "kingbob-presale.firebaseapp.com",
  projectId: "kingbob-presale",
  storageBucket: "kingbob-presale.appspot.com",
  messagingSenderId: "619526393437",
  appId: "1:619526393437:web:a3676355b559d82aff07b4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firestore with specific settings for cross-origin access
export const db = getFirestore(app);

// Disable offline persistence to avoid issues on local network or netlify preview domains
const isLocalNetwork = window.location.hostname.includes('192.168.') || 
                      window.location.hostname.includes('localhost') || 
                      window.location.hostname.includes('127.0.0.1') ||
                      window.location.hostname.includes('netlify.app');

// Function to initialize Firestore with appropriate settings
export const initializeFirestore = async () => {
  try {
    // For local development or when accessed via IP, disable persistence
    if (isLocalNetwork) {
      console.log('Running on local network, configuring Firestore for insecure context');
      // Disable and re-enable network to force a fresh connection
      await disableNetwork(db);
      await enableNetwork(db);
    } else {
      // For production (https), enable persistence
      try {
        await enableIndexedDbPersistence(db);
        console.log('Firestore persistence enabled');
      } catch (err: any) {
        if (err.code === 'failed-precondition') {
          console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
        } else if (err.code === 'unimplemented') {
          console.warn('The current browser does not support all of the features required to enable persistence');
        }
      }
    }
  } catch (error) {
    console.error('Error initializing Firestore:', error);
  }
};

export const auth = getAuth(app);

// Firestore collection references
export const usersCollection = 'users';
export const referralsCollection = 'referrals';
export const settingsCollection = 'settings';

// Export the app for other components
export default app;

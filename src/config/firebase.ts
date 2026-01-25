import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyCIlSY0PMoZ76LvY_LiSuGbPy0ZNkWcfrc",
    authDomain: "workhive-a9d15.firebaseapp.com",
    projectId: "workhive-a9d15",
    storageBucket: "workhive-a9d15.firebasestorage.app",
    messagingSenderId: "708259486885",
    appId: "1:708259486885:web:778981abfed9e9ce1c014c",
    measurementId: "G-10GX0XKM44"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize Auth with persistence
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// Initialize Firestore
const db = getFirestore(app);

// Initialize Storage
const storage = getStorage(app);

export { app, auth, db, storage };

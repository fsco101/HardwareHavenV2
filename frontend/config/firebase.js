import { initializeApp } from 'firebase/app';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    getAuth,
    GoogleAuthProvider,
    getReactNativePersistence,
    initializeAuth,
} from 'firebase/auth';

// ─── Firebase Configuration ───
// Replace these values with your actual Firebase project credentials.
// Get them from: Firebase Console → Project Settings → General → Your apps → Web app
const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_FIREBASE_APP_ID",
};

const app = initializeApp(firebaseConfig);

let auth;

try {
    auth = Platform.OS === 'web'
        ? getAuth(app)
        : initializeAuth(app, {
            persistence: getReactNativePersistence(AsyncStorage),
        });
} catch (error) {
    // initializeAuth can throw if auth was already initialized (e.g., fast refresh)
    auth = getAuth(app);
}

const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
export default app;

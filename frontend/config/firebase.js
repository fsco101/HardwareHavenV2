import { initializeApp } from 'firebase/app';

import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    getAuth,
    GoogleAuthProvider,
    getReactNativePersistence,
    initializeAuth,
} from 'firebase/auth';

const extra = Constants.expoConfig?.extra || {};

const firebaseConfig = {
    apiKey: extra.FIREBASE_API_KEY || process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: extra.FIREBASE_AUTH_DOMAIN || process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: extra.FIREBASE_PROJECT_ID || process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
    storageBucket: extra.FIREBASE_STORAGE_BUCKET || process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: extra.FIREBASE_MESSAGING_SENDER_ID || process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: extra.FIREBASE_APP_ID || process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '',
};

const googleAuthConfig = {
    expoClientId: extra.GOOGLE_EXPO_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID || '',
    androidClientId: extra.GOOGLE_ANDROID_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '',
    iosClientId: extra.GOOGLE_IOS_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '',
    webClientId: extra.GOOGLE_WEB_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',
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

export { auth, googleProvider, googleAuthConfig };
export default app;

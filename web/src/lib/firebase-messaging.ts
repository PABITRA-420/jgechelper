import { getMessaging, isSupported } from "firebase/messaging";
import { initializeApp, getApps, getApp } from "firebase/app";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if window is defined and messaging is supported in browser
export const getClientMessaging = async () => {
    if (typeof window !== "undefined") {
        const supported = await isSupported();
        if (supported) {
            const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
            return getMessaging(app);
        }
    }
    return null;
};

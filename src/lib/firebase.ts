import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let cachedApp: FirebaseApp | null = null;

function hasFirebaseConfig() {
    return Object.values(firebaseConfig).every(Boolean);
}

function getFirebaseApp() {
    if (!hasFirebaseConfig()) {
        return null;
    }

    if (cachedApp) {
        return cachedApp;
    }

    cachedApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
    return cachedApp;
}

export function getFirebaseAuth() {
    const app = getFirebaseApp();
    return app ? getAuth(app) : null;
}

export function getFirestoreDb() {
    const app = getFirebaseApp();
    return app ? getFirestore(app) : null;
}

export function getFirebaseStorage() {
    const app = getFirebaseApp();
    return app ? getStorage(app) : null;
}

export function hasFirebaseEnvironment() {
    return hasFirebaseConfig();
}

export function getAdminEmails() {
    const raw = process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "";
    return raw
        .split(",")
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean);
}

export function isAdminEmail(email?: string | null) {
    if (!email) return false;
    return getAdminEmails().includes(email.toLowerCase());
}

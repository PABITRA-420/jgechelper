import * as admin from 'firebase-admin';

// Initialize the Firebase Admin SDK
// This only executes safely on the server environment.

const initAdmin = () => {
    if (admin.apps.length > 0) {
        return admin.apps[0] as admin.app.App;
    }

    try {
        return admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                // Edge case: Sometimes Vercel env keys get literal '\n' string instead of actual newlines
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            })
        });
    } catch (error) {
        console.error('Firebase Admin Initialization Error', error);
        throw error;
    }
};

const app = initAdmin();

export const adminDb = admin.firestore(app);
export const adminAuth = admin.auth(app);

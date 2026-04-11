import * as admin from 'firebase-admin';

// Initialize the Firebase Admin SDK
// This only executes safely on the server environment.

export const getAdminApp = () => {
    if (admin.apps.length > 0) {
        return admin.apps[0] as admin.app.App;
    }

    try {
        let privateKey = process.env.FIREBASE_PRIVATE_KEY;
        if (privateKey) {
            privateKey = privateKey.replace(/\\n/g, '\n');
            if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
                privateKey = privateKey.substring(1, privateKey.length - 1);
            }
        }

        const options: admin.AppOptions = {
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        };

        if (process.env.FIREBASE_CLIENT_EMAIL && privateKey) {
            options.credential = admin.credential.cert({
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey,
            });
        }

        return admin.initializeApp(options);
    } catch (error) {
        console.error('Firebase Admin Initialization Error', error);
        throw error;
    }
};

export const getAdminDb = () => admin.firestore(getAdminApp());
export const getAdminAuth = () => admin.auth(getAdminApp());

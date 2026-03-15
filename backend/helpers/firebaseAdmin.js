const admin = require('firebase-admin');

let firebaseApp = null;

function getServiceAccountFromEnv() {
    const projectId = process.env.FIREBASE_PROJECT_ID || '';
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || '';
    const privateKey = String(process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
        return null;
    }

    return {
        projectId,
        clientEmail,
        privateKey,
    };
}

function getFirebaseAdminApp() {
    if (firebaseApp) {
        return firebaseApp;
    }

    const serviceAccount = getServiceAccountFromEnv();
    if (!serviceAccount) {
        return null;
    }

    firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });

    return firebaseApp;
}

async function verifyFirebaseIdToken(idToken) {
    const app = getFirebaseAdminApp();
    if (!app) {
        throw new Error('Firebase Admin is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in backend/config/.env.');
    }

    const auth = admin.auth(app);
    return auth.verifyIdToken(idToken);
}

module.exports = {
    verifyFirebaseIdToken,
};

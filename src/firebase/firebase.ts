import { initializeApp, getApps, FirebaseOptions } from "firebase/app";
import { getAuth, initializeAuth, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const FALLBACK_CONFIG: FirebaseOptions = {
	apiKey: 'AIzaSyDhoR2EA3uuWqWSkiiE5G1vRkeqoGHBdro',
	authDomain: 'elitecode-47058.firebaseapp.com',
	projectId: 'elitecode-47058',
	storageBucket: 'elitecode-47058.firebasestorage.app',
	messagingSenderId: '605884776680',
	appId: '1:605884776680:web:f89db0d49b021139dec95d'
};

const firebaseConfig: FirebaseOptions = {
	apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || FALLBACK_CONFIG.apiKey,
	authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || FALLBACK_CONFIG.authDomain,
	projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || FALLBACK_CONFIG.projectId,
	storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || FALLBACK_CONFIG.storageBucket,
	messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || FALLBACK_CONFIG.messagingSenderId,
	appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || FALLBACK_CONFIG.appId,
};

// Validate configuration
const validateConfig = (config: FirebaseOptions) => {
	const requiredKeys: (keyof FirebaseOptions)[] = [
		'apiKey', 'authDomain', 'projectId', 
		'storageBucket', 'messagingSenderId', 'appId'
	];

	const missingKeys = requiredKeys.filter(key => !config[key]);
	
	if (missingKeys.length > 0) {
		console.error('Missing Firebase configuration keys:', missingKeys);
		console.error('Current configuration:', config);
		throw new Error(`Firebase configuration is incomplete. Missing: ${missingKeys.join(', ')}`);
	}

	// Additional validation
	if (!config.apiKey || config.apiKey.trim() === '') {
		throw new Error('Firebase API Key is empty or invalid');
	}
};

try {
	validateConfig(firebaseConfig);
} catch (error) {
	throw error;
}

// Prevent multiple app initializations
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Initialize auth with explicit persistence
const auth = initializeAuth(app, {
	persistence: browserLocalPersistence
});

const firestore = getFirestore(app);

export { auth, firestore, app };

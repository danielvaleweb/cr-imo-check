import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, memoryLocalCache, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

console.log('Initializing Firebase with config:', { ...firebaseConfig, apiKey: '***' });

const app = initializeApp(firebaseConfig);
const databaseId = firebaseConfig.firestoreDatabaseId || '(default)';

// Using initializeFirestore with memoryLocalCache to completely bypass 
// IndexedDB cache corruption (ASSERTION FAILED / Unexpected State IDs)
const db = initializeFirestore(app, {
  localCache: memoryLocalCache()
}, databaseId !== '(default)' ? databaseId : undefined);

export { db };
export const auth = getAuth(app);

console.log('Firestore initialized for database:', databaseId, 'in project:', firebaseConfig.projectId);

// Test connection removed to save on quota calls. 
// It was used for initial setup verification but is no longer needed in production.

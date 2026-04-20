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

// Test connection
async function testConnection() {
  try {
    console.log('Testing Firestore connection to database:', databaseId);
    // Use 'properties' which is allowed for public read in our rules
    await getDocFromServer(doc(db, 'properties', 'connection_test'));
    console.log('Firestore connection test successful');
  } catch (error) {
    console.error('Firestore connection test failed:', error);
  }
}

testConnection();

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app); // Use default database

async function test() {
  try {
    console.log("Testing properties...");
    await getDocs(collection(db, 'properties'));
    console.log("Properties OK");
    
    console.log("Testing property_leads...");
    await getDocs(collection(db, 'property_leads'));
    console.log("Property leads OK");
  } catch (e) {
    console.error("Error:", e.message);
  }
}
test();

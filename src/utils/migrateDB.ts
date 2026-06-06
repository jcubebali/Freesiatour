import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc } from 'firebase/firestore';
import * as dotenv from 'dotenv';
dotenv.config();

// Custom production config provided by the user
const targetConfig = {
  apiKey: "AIzaSyCK38lP5Yf9HIlEu6fx1XBtLn8KtVHDvXs",
  authDomain: "freesiatour-4a564.firebaseapp.com",
  projectId: "freesiatour-4a564",
  storageBucket: "freesiatour-4a564.firebasestorage.app",
  messagingSenderId: "96331863560",
  appId: "1:96331863560:web:da82fbd59e1d8c023363bd",
  measurementId: "G-CX2PJQYK23"
};

// Original platform sandbox config (from environment variables)
const sourceConfig = {
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'gen-lang-client-0494196061',
  appId: process.env.VITE_FIREBASE_APP_ID,
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID,
};

async function migrate() {
  console.log('🔄 Starting full database migration...');
  console.log('Source Project:', sourceConfig.projectId);
  console.log('Target Project:', targetConfig.projectId);

  if (!sourceConfig.apiKey || !sourceConfig.projectId) {
    console.error('❌ Source Firebase credentials not found in environment variables.');
    console.log('Falling back to local seeding instead of copying.');
    return;
  }

  // Initialize Source App & Firestore
  const sourceApp = initializeApp(sourceConfig, 'sourceApp');
  const sourceDb = getFirestore(sourceApp);

  // Initialize Target App & Firestore
  const targetApp = initializeApp(targetConfig, 'targetApp');
  const targetDb = getFirestore(targetApp);

  const collectionsToMigrate = ['tours', 'activities', 'destinations', 'vehicles', 'settings', 'tour_slots'];

  for (const colName of collectionsToMigrate) {
    console.log(`\n📚 Migrating collection "${colName}"...`);
    try {
      const sourceCol = collection(sourceDb, colName);
      const snapshot = await getDocs(sourceCol);
      
      if (snapshot.empty) {
        console.log(`⚠️ Collection "${colName}" is empty in source database.`);
        continue;
      }

      console.log(`Copying ${snapshot.size} documents for "${colName}"...`);
      let migratedCount = 0;
      for (const srcDoc of snapshot.docs) {
        const docData = srcDoc.data();
        const targetDocRef = doc(targetDb, colName, srcDoc.id);
        await setDoc(targetDocRef, docData, { merge: true });
        migratedCount++;
      }
      console.log(`✅ Progress: Successfully migrated ${migratedCount} documents from "${colName}".`);
    } catch (err: any) {
      console.error(`❌ Error migrating collection "${colName}":`, err.message || err);
    }
  }

  console.log('\n🎉 Full database migration complete!');
}

migrate().catch(console.error);

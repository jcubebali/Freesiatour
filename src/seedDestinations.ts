import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

// read firebase config
const firebaseConfig = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf-8'));

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const destinations = JSON.parse(fs.readFileSync('src/destinationsData.json', 'utf-8'));

async function seed() {
  console.log(`Seeding ${destinations.length} destinations...`);
  for (const dest of destinations) {
    // Generate imageUrl if missing or map logic
    const category = dest.category;
    let imageUrl = 'https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?auto=format&fit=crop&q=80&w=800';
    if (category === 'Nature & Scenery') imageUrl = 'https://images.unsplash.com/photo-1554481923-a6918bd997bc?auto=format&fit=crop&q=80&w=800';
    else if (category === 'Waterfall') imageUrl = 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=800';
    else if (category === 'Beach') imageUrl = 'https://images.unsplash.com/photo-1537953391648-762d01df3c14?auto=format&fit=crop&q=80&w=800';
    else if (category === 'Animal & Wildlife') imageUrl = 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&q=80&w=800';
    else if (category === 'Temple & Sacred Site') imageUrl = 'https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?auto=format&fit=crop&q=80&w=800';
    else if (category === 'Shopping & Market') imageUrl = 'https://images.unsplash.com/photo-1512132411229-c30391241dd8?auto=format&fit=crop&q=80&w=800';
    else if (category === 'Cultural Village') imageUrl = 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=800';
    else if (category === 'Cafe & Lifestyle') imageUrl = 'https://images.unsplash.com/photo-1512132411229-c30391241dd8?auto=format&fit=crop&q=80&w=800';
    else if (category === 'Entertainment & Theme Park') imageUrl = 'https://images.unsplash.com/photo-1579208030886-b937fe0925dc?auto=format&fit=crop&q=80&w=800';
    else if (category === 'Museum') imageUrl = 'https://images.unsplash.com/photo-1552603305-b56d022d2218?auto=format&fit=crop&q=80&w=800';
    else if (category === 'Water Activity Area') imageUrl = 'https://images.unsplash.com/photo-1530263302096-7bb577ba6914?auto=format&fit=crop&q=80&w=800';

    const price = Math.ceil((dest.entrance_fee_idr || 0) / 15000);

    const data = {
      ...dest,
      price,
      imageUrl
    };
    
    await setDoc(doc(db, 'destinations', dest.id), data);
    console.log(`Uploaded ${dest.name} (${dest.id})`);
  }
  console.log('Seeding complete!');
  process.exit(0);
}

seed().catch(console.error);

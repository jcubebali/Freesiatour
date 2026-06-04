import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { DESTINATIONS } from '../constants';
import { ACTIVITIES, CALCULATOR_DESTINATIONS, VEHICLES_DATA } from '../calculatorData';

export async function seedFreesiaData() {
  console.log('Starting Freesiatour data seeding...');
  
  const summary = {
    tours: 0,
    activities: 0,
    destinations: 0,
    vehicles: 0,
  };

  // Seed tours
  for (const item of DESTINATIONS) {
    if (!item.id) continue;
    try {
      const docRef = doc(db, 'tours', item.id);
      await setDoc(docRef, item, { merge: true });
      summary.tours++;
    } catch (err) {
      console.error(`Error seeding tour ${item.id}:`, err);
    }
  }
  console.log(`Seeded tours progress: ${summary.tours}/${DESTINATIONS.length}`);

  // Seed activities
  for (const item of ACTIVITIES) {
    if (!item.id) continue;
    try {
      const docRef = doc(db, 'activities', item.id);
      await setDoc(docRef, item, { merge: true });
      summary.activities++;
    } catch (err) {
      console.error(`Error seeding activity ${item.id}:`, err);
    }
  }
  console.log(`Seeded activities progress: ${summary.activities}/${ACTIVITIES.length}`);

  // Seed destinations
  for (const item of CALCULATOR_DESTINATIONS) {
    if (!item.id) continue;
    try {
      const docRef = doc(db, 'destinations', item.id);
      await setDoc(docRef, item, { merge: true });
      summary.destinations++;
    } catch (err) {
      console.error(`Error seeding destination ${item.id}:`, err);
    }
  }
  console.log(`Seeded destinations progress: ${summary.destinations}/${CALCULATOR_DESTINATIONS.length}`);

  // Seed vehicles
  for (const item of VEHICLES_DATA) {
    if (!item.id) continue;
    try {
      const docRef = doc(db, 'vehicles', item.id);
      await setDoc(docRef, item, { merge: true });
      summary.vehicles++;
    } catch (err) {
      console.error(`Error seeding vehicle ${item.id}:`, err);
    }
  }
  console.log(`Seeded vehicles progress: ${summary.vehicles}/${VEHICLES_DATA.length}`);

  console.log('Freesiatour data seeding complete!', summary);

  return summary;
}

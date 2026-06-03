import { useState, useEffect } from 'react';
import { collection, query, where, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { TourSlot, getActiveSlot } from '../services/groupTourService';

export function useGroupTourSlot(tourId: string, date: string) {
  const [slot, setSlot] = useState<TourSlot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!tourId || !date) {
      setSlot(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    let isMounted = true;
    let unsubscribe: (() => void) | null = null;

    const setupRef = async () => {
      try {
        // Prepare active open slot if none currently exists
        const activeS = await getActiveSlot(tourId, date);
        if (!isMounted) return;

        // Populate with the virtual/real active slot initially
        setSlot(activeS);

        const q = query(
          collection(db, 'tour_slots'),
          where('tourId', '==', tourId),
          where('date', '==', date),
          where('status', '==', 'open'),
          limit(1)
        );

        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            if (!isMounted) return;
            if (!snapshot.empty) {
              const docSnap = snapshot.docs[0];
              const data = { id: docSnap.id, ...docSnap.data() } as TourSlot;
              setSlot(data);
            } else if (activeS) {
              setSlot(activeS);
            } else {
              setSlot(null);
            }
            setLoading(false);
          },
          (err) => {
            console.error('Error listening to slots:', err);
            if (isMounted) {
              setError(err);
              setLoading(false);
            }
          }
        );
      } catch (err) {
        console.error('Failed to init/listen active slot:', err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setLoading(false);
        }
      }
    };

    setupRef();

    return () => {
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [tourId, date]);

  const spotsLeft = slot ? 7 - slot.participants : 7;

  return { slot, spotsLeft, loading, error };
}

import { db } from '../firebase';
import { 
  collection, 
  doc, 
  query, 
  where, 
  getDocs, 
  setDoc, 
  limit, 
  orderBy, 
  runTransaction 
} from 'firebase/firestore';
import { DESTINATIONS } from '../constants';
import { auth } from '../firebase';

export interface TourSlot {
  id: string;
  tourId: string;
  date: string;
  groupNumber: number;
  participants: number;
  maxParticipants: number;
  status: 'open' | 'full';
  pricePerPerson: number;
  bookingIds: string[];
  createdAt: string;
  updatedAt: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function parseSlotId(slotId: string): { tourId: string; date: string; groupNumber: number } {
  if (slotId.includes('_g')) {
    const parts = slotId.split('_');
    const groupPart = parts[parts.length - 1]; // e.g. "g1"
    const groupNumber = parseInt(groupPart.slice(1)) || 1;
    const date = parts[parts.length - 2]; 
    const tourId = parts.slice(0, parts.length - 2).join('_');
    return { tourId, date, groupNumber };
  } else if (slotId.includes('-group-')) {
    const parts = slotId.split('-group-');
    const groupNumber = parseInt(parts[1]) || 1;
    const rest = parts[0];
    const date = rest.slice(-10);
    const tourId = rest.slice(0, -11);
    return { tourId, date, groupNumber };
  }
  return { tourId: '', date: '', groupNumber: 1 };
}

export async function getActiveSlot(tourId: string, date: string): Promise<TourSlot> {
  const tourSlotsRef = collection(db, 'tour_slots');
  const q = query(
    tourSlotsRef,
    where('tourId', '==', tourId),
    where('date', '==', date),
    where('status', '==', 'open'),
    limit(1)
  );

  try {
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      return { id: docSnap.id, ...docSnap.data() } as TourSlot;
    }

    // Find the latest groupNumber to increment
    const allSlotsQ = query(
      tourSlotsRef,
      where('tourId', '==', tourId),
      where('date', '==', date),
      orderBy('groupNumber', 'desc'),
      limit(1)
    );
    const allSlotsSnap = await getDocs(allSlotsQ);
    let nextGroupNumber = 1;
    if (!allSlotsSnap.empty) {
      nextGroupNumber = allSlotsSnap.docs[0].data().groupNumber + 1;
    }

    // Determine target pricing in IDR
    const tour = DESTINATIONS.find(t => t.id === tourId);
    let pricePerPerson = 720000; // default IDR
    if (tour && tour.price) {
      pricePerPerson = tour.price * 16000;
    }

    const newSlotId = `${tourId}_${date}_g${nextGroupNumber}`;
    const newSlot: TourSlot = {
      id: newSlotId,
      tourId,
      date,
      groupNumber: nextGroupNumber,
      participants: 0,
      maxParticipants: 7,
      status: 'open',
      pricePerPerson,
      bookingIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (auth.currentUser) {
      try {
        const slotDocRef = doc(db, 'tour_slots', newSlotId);
        await setDoc(slotDocRef, newSlot);
      } catch (writeErr) {
        console.warn('Silent warning setting new slot document:', writeErr);
      }
    }
    return newSlot;
  } catch (error) {
    return handleFirestoreError(error, OperationType.GET, 'tour_slots');
  }
}

export async function joinGroupTour(
  slotId: string, 
  bookingData: {
    userId: string;
    tourId: string;
    participants: number;
    pickupDate?: string;
    [key: string]: any;
  }
): Promise<{ success: boolean; bookingId: string; slot: TourSlot }> {
  const slotRef = doc(db, 'tour_slots', slotId);
  const bookingsCol = collection(db, 'bookings');
  const newBookingRef = doc(bookingsCol);

  try {
    const result = await runTransaction(db, async (transaction) => {
      const slotSnap = await transaction.get(slotRef);
      let slot: TourSlot;
      let isNew = false;

      if (!slotSnap.exists()) {
        const parsed = parseSlotId(slotId);
        if (!parsed.tourId) {
          throw new Error('Group tour slot does not exist and cannot be parsed.');
        }

        const tour = DESTINATIONS.find(t => t.id === parsed.tourId);
        let pricePerPerson = 720000; // default IDR
        if (tour && tour.price) {
          pricePerPerson = tour.price * 16000;
        }

        slot = {
          id: slotId,
          tourId: parsed.tourId,
          date: parsed.date,
          groupNumber: parsed.groupNumber,
          participants: 0,
          maxParticipants: 7,
          status: 'open',
          pricePerPerson,
          bookingIds: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        isNew = true;
      } else {
        slot = slotSnap.data() as TourSlot;
      }

      if (slot.status === 'full') {
        throw new Error('This group is already full.');
      }

      const nextParticipants = slot.participants + bookingData.participants;
      if (nextParticipants > 7) {
        throw new Error(`Only ${7 - slot.participants} spots left in this group.`);
      }

      const isFull = nextParticipants >= 7;
      const updatedStatus = (isFull ? 'full' : 'open') as 'open' | 'full';
      const updatedBookingIds = [...(slot.bookingIds || []), newBookingRef.id];

      const updatedSlotData = {
        participants: nextParticipants,
        status: updatedStatus,
        bookingIds: updatedBookingIds,
        updatedAt: new Date().toISOString()
      };

      if (isNew) {
        transaction.set(slotRef, {
          ...slot,
          ...updatedSlotData
        });
      } else {
        transaction.update(slotRef, updatedSlotData);
      }

      const updatedSlot: TourSlot = {
        ...slot,
        ...updatedSlotData
      };

      // Create next slot if full
      if (isFull) {
        const nextGroupNumber = slot.groupNumber + 1;
        const nextSlotId = `${slot.tourId}_${slot.date}_g${nextGroupNumber}`;
        const nextSlotRef = doc(db, 'tour_slots', nextSlotId);
        
        const nextSlot: TourSlot = {
          id: nextSlotId,
          tourId: slot.tourId,
          date: slot.date,
          groupNumber: nextGroupNumber,
          participants: 0,
          maxParticipants: 7,
          status: 'open',
          pricePerPerson: slot.pricePerPerson,
          bookingIds: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        transaction.set(nextSlotRef, nextSlot);
      }

      // Add actual booking data
      const finalBookingData = {
        ...bookingData,
        orderId: bookingData.orderId || `FREESIA-${Math.floor(100000 + Math.random() * 900000)}`,
        bookingType: 'group',
        slotId: slotId,
        createdAt: new Date().toISOString(),
        status: 'pending'
      };

      transaction.set(newBookingRef, finalBookingData);

      return { success: true, bookingId: newBookingRef.id, slot: updatedSlot };
    });

    return result;
  } catch (error) {
    return handleFirestoreError(error, OperationType.WRITE, `tour_slots/${slotId}`);
  }
}

export async function getSlotAvailability(
  tourId: string, 
  date: string
): Promise<{ groupNumber: number; spotsLeft: number; pricePerPerson: number; slotId: string }> {
  try {
    const slot = await getActiveSlot(tourId, date);
    return {
      groupNumber: slot.groupNumber,
      spotsLeft: 7 - slot.participants,
      pricePerPerson: slot.pricePerPerson,
      slotId: slot.id
    };
  } catch (error) {
    return handleFirestoreError(error, OperationType.GET, `tour_slots`);
  }
}

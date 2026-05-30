import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

export interface Tour {
  id: string;
  title: string;
  location: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  duration: string;
  description: string;
  itinerary: string[];
  included: string[];
  excluded: string[];
  lat: number;
  lng: number;
  category?: string;
  highlighted?: boolean;
}

export interface Vehicle {
  id: string;
  vehicle: string;
  type: string;
  seats: number;
  rate_with_driver_idr: number;
  rate_oneway_idr: number | null;
  vendor: string | null;
  contact_number: string | null;
  status: string;
  updated: string;
}

export interface Destination {
  id: string;
  name: string;
  category: string;
  entrance_fee_idr: number;
  is_free: boolean;
  areas: string[];
  status: string;
  updated: string;
}

export interface Activity {
  id: string;
  name: string;
  category: string;
  vendor: string | null;
  location: string | null;
  price_min_idr: number;
  price_max_idr: number;
  duration: string;
  includes: string[];
  contact_phone: string | null;
  contact_whatsapp: string | null;
  email: string | null;
  website: string | null;
  operating_hours: string;
  notes: string | null;
  status: string;
  updated: string;
  type?: 'activity' | 'addon';
  price?: number; 
  image?: string;
  description?: string;
}

export const fetchTours = async (): Promise<Tour[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'tours'));
    const tours: Tour[] = [];
    querySnapshot.forEach((doc) => {
      tours.push({ id: doc.id, ...doc.data() } as Tour);
    });
    return tours;
  } catch (error) {
    console.error("Error fetching tours: ", error);
    return [];
  }
};

export const fetchVehicles = async (): Promise<Vehicle[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'vehicles'));
    const items: Vehicle[] = [];
    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() } as Vehicle);
    });
    return items;
  } catch (error) {
    console.error("Error fetching vehicles: ", error);
    return [];
  }
};

export const fetchDestinations = async (): Promise<Destination[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'destinations'));
    const items: Destination[] = [];
    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() } as Destination);
    });
    return items;
  } catch (error) {
    console.error("Error fetching destinations: ", error);
    return [];
  }
};

export const fetchActivities = async (): Promise<Activity[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'activities'));
    const activities: Activity[] = [];
    querySnapshot.forEach((doc) => {
      activities.push({ id: doc.id, ...doc.data() } as Activity);
    });
    return activities;
  } catch (error) {
    console.error("Error fetching activities: ", error);
    return [];
  }
};

export interface Settings {
  id: string;
  markupPercentage: number;
  domesticDiscountPercentage: number;
  exchangeRate: number;
  mealPriceIdr: number;
  tourServiceFeeIdr: number;
}

export const fetchSettings = async (): Promise<Settings | null> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'settings'));
    if (querySnapshot.empty) return null;
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Settings;
  } catch (error) {
    console.error("Error fetching settings: ", error);
    return null;
  }
};

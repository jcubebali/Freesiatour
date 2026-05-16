import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { fetchActivities, fetchVehicles, fetchDestinations, fetchSettings, Activity, Vehicle, Destination } from '../services/firebaseService';
import { ACTIVITIES, CALCULATOR_DESTINATIONS, HOTEL_OPTIONS, VEHICLES_DATA } from '../calculatorData';

export interface DailyItinerary {
  day: number;
  destinations: string[]; // ids
  area: string | null;
}

export interface CustomAddon {
  id: string;
  name: string;
  price: number;
}

export interface QuotationState {
  // Step 1: Guest Info
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  origin: 'Domestic' | 'International';
  startDate: string;
  pax: number;
  duration: number; // in days

  // Step 2: Preferences
  hotelId: string | null;
  hotelNights: number;
  hotelRooms: number;
  mealType: 'None' | 'Breakfast' | 'Lunch' | 'Both';
  mealPackage: string | null;
  vehicleId: string | null;
  airportTransfer: boolean;
  packageType: 'Budget' | 'Standard' | 'Luxury';
  pace: 'Relaxed' | 'Active';

  // Step 3: Itinerary
  tourType: 'Full Day' | 'Half Day';
  itinerary: DailyItinerary[];

  // Step 4: Add-ons
  addons: string[];
  customAddons: CustomAddon[];
  notes?: string;
}

export interface Settings {
  markupPercentage: number;
  domesticDiscountPercentage: number;
}

export const INITIAL_QUOTATION: QuotationState = {
  guestName: '',
  guestEmail: '',
  guestPhone: '',
  origin: 'International',
  startDate: new Date().toISOString().split('T')[0],
  pax: 2,
  duration: 1,
  hotelId: null,
  hotelNights: 0,
  hotelRooms: 1,
  mealType: 'None',
  mealPackage: null,
  vehicleId: null,
  airportTransfer: false,
  packageType: 'Standard',
  pace: 'Relaxed',
  tourType: 'Full Day',
  itinerary: [
    { day: 1, destinations: [], area: null },
  ],
  addons: [],
  customAddons: [],
  notes: '',
};

interface CalculatorContextType {
  quotation: QuotationState;
  setQuotation: (q: QuotationState) => void;
  resetQuotation: () => void;
  activities: Activity[];
  vehicles: Vehicle[];
  destinations: Destination[];
  settings: Settings;
  loading: boolean;
}

const CalculatorContext = createContext<CalculatorContextType | undefined>(undefined);

export const CalculatorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [quotation, setQuotation] = useState<QuotationState>(INITIAL_QUOTATION);
  const [activities, setActivities] = useState<Activity[]>([...ACTIVITIES] as any[]);
  const [vehicles, setVehicles] = useState<Vehicle[]>(VEHICLES_DATA as any[]);
  const [destinations, setDestinations] = useState<Destination[]>(CALCULATOR_DESTINATIONS as any[]);
  const [settings, setSettings] = useState<Settings>({ markupPercentage: 20, domesticDiscountPercentage: 10 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [fetchedActivities, fetchedVehicles, fetchedDestinations, fetchedSettings] = await Promise.all([
          fetchActivities(),
          fetchVehicles(),
          fetchDestinations(),
          fetchSettings()
        ]);

        if (fetchedSettings) {
          setSettings(fetchedSettings);
        }

        if (fetchedActivities.length > 0) {
          setActivities(prev => {
            const combined = [...prev];
            fetchedActivities.forEach(f => {
              if (!combined.find(c => c.id === f.id)) {
                combined.push(f as any);
              }
            });
            return combined;
          });
        }

        if (fetchedVehicles.length > 0) {
          setVehicles(prev => {
            const combined = [...prev];
            fetchedVehicles.forEach(f => {
              if (!combined.find(c => c.id === f.id || c.vehicle.trim().toLowerCase() === f.vehicle.trim().toLowerCase())) {
                combined.push(f as any);
              }
            });
            return combined;
          });
        }

        if (fetchedDestinations && fetchedDestinations.length > 0) {
          setDestinations(prev => {
            const combined = [...prev];
            fetchedDestinations.forEach(f => {
              const existingIndex = combined.findIndex(c => c.id === f.id);
              if (existingIndex >= 0) {
                combined[existingIndex] = f;
              } else {
                combined.push(f);
              }
            });
            return combined;
          });
        }
      } catch (err) {
        console.error("Error loading calculator data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const resetQuotation = () => setQuotation(INITIAL_QUOTATION);

  return (
    <CalculatorContext.Provider value={{ quotation, setQuotation, resetQuotation, activities, vehicles, destinations, settings, loading }}>
      {children}
    </CalculatorContext.Provider>
  );
};

export const useCalculator = () => {
  const context = useContext(CalculatorContext);
  if (!context) {
    throw new Error('useCalculator must be used within a CalculatorProvider');
  }
  return context;
};

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  Lock, 
  Settings as SettingsIcon, 
  Coins, 
  Compass, 
  MapPin, 
  Activity as ActivityIcon, 
  Info, 
  LogOut, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  ChevronLeft, 
  Car,
  DollarSign,
  Briefcase,
  Star,
  Layers,
  Percent
} from 'lucide-react';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc 
} from 'firebase/firestore';
import { 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider, 
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { db, auth } from '../firebase';
import { Tour, Activity, Destination, Vehicle, Settings } from '../services/firebaseService';
import { seedFreesiaData, seedFirestore } from '../utils/seedData';

// Ensure our error helper matches the guidelines
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
    },
    operationType,
    path
  };
  console.error('Firestore Error Details: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface AdminDashboardProps {
  onBack: () => void;
  lang: 'en' | 'id';
  onSettingsUpdated?: (newExchangeRate: number) => void;
}

type TabType = 'tours' | 'activities' | 'destinations' | 'vehicles' | 'settings' | 'slots';

export default function AdminDashboard({ onBack, lang, onSettingsUpdated }: AdminDashboardProps) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<TabType>('tours');
  
  // Data lists
  const [toursList, setToursList] = useState<Tour[]>([]);
  const [activitiesList, setActivitiesList] = useState<Activity[]>([]);
  const [destinationsList, setDestinationsList] = useState<Destination[]>([]);
  const [vehiclesList, setVehiclesList] = useState<Vehicle[]>([]);
  const [slotsList, setSlotsList] = useState<any[]>([]);
  const [settingsData, setSettingsData] = useState<Settings | null>(null);
  const [dataLoading, setDataLoading] = useState<boolean>(false);

  // Seeding states
  const [seeding, setSeeding] = useState<boolean>(false);
  const [seeded, setSeeded] = useState<boolean>(false);
  const [seedStatus, setSeedStatus] = useState<
    'idle' | 'loading' | 'done' | 'error'
  >('idle');

  // Slots management states
  const [manifestBookings, setManifestBookings] = useState<any[]>([]);
  const [activeManifestSlot, setActiveManifestSlot] = useState<any | null>(null);
  const [loadingManifest, setLoadingManifest] = useState<boolean>(false);
  const [newSlotTourId, setNewSlotTourId] = useState<string>('');
  const [newSlotDate, setNewSlotDate] = useState<string>('');
  const [newSlotPrice, setNewSlotPrice] = useState<number>(750000);

  // Status message
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showTroubleshooting, setShowTroubleshooting] = useState<boolean>(false);

  // Modal / Form state
  const [currentEditItem, setCurrentEditItem] = useState<any | null>(null);
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);

  // Quick form helpers for arrays
  const [tempItinerary, setTempItinerary] = useState<string>('');
  const [tempIncluded, setTempIncluded] = useState<string>('');
  const [tempExcluded, setTempExcluded] = useState<string>('');
  const [tempAreas, setTempAreas] = useState<string>('');

  // Auto clear alerts
  useEffect(() => {
    if (statusMsg) {
      const timer = setTimeout(() => setStatusMsg(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [statusMsg]);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Bootstrap admin: email jcube.bali@gmail.com is absolute admin.
        const isUserAdmin = currentUser.email === 'jcube.bali@gmail.com' || currentUser.email === 'freesiatour.id@gmail.com';
        setIsAdmin(isUserAdmin);
        
        if (isUserAdmin) {
          showNotification('success', lang === 'id' ? 'Selamat datang Admin!' : 'Welcome back Admin!');
        } else {
          showNotification('error', lang === 'id' ? 'Akses ditolak: Anda bukan Admin!' : 'Access denied: You are not an Admin!');
        }
      } else {
        setIsAdmin(false);
      }
      setAuthLoading(false);
    });
    return unsubscribe;
  }, [lang]);

  // Handle redirect authentication result
  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          setUser(result.user);
          const isUserAdmin = result.user.email === 'jcube.bali@gmail.com' || result.user.email === 'freesiatour.id@gmail.com';
          setIsAdmin(isUserAdmin);
          if (isUserAdmin) {
            showNotification('success', lang === 'id' ? 'Selamat datang Admin!' : 'Welcome back Admin!');
          } else {
            showNotification('error', lang === 'id' ? 'Akses ditolak: Anda bukan Admin!' : 'Access denied: You are not an Admin!');
          }
        }
      })
      .catch((error) => {
        console.error("Redirect auth error: ", error);
        setAuthError(error.message);
        showNotification('error', 'Authentication failed: ' + error.message);
      });
  }, [lang]);

  // Load all data when Admin is confirmed
  useEffect(() => {
    if (user && isAdmin) {
      loadAllData();
    }
  }, [user, isAdmin]);

  const handleSeed = async () => {
    setSeedStatus('loading');
    try {
      const result = await seedFirestore();
      console.log('Seed result:', result);
      setSeedStatus('done');
      await loadAllData();
    } catch (error) {
      console.error('Seed error:', error);
      setSeedStatus('error');
    }
  };

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      const summary = await seedFreesiaData();
      setSeeded(true);
      showNotification('success', lang === 'id' 
        ? `Sukses mengisi data! Tours: ${summary.tours}, Activities: ${summary.activities}, Destinations: ${summary.destinations}, Vehicles: ${summary.vehicles}, Settings: ${summary.settings || 0}`
        : `Database seeded successfully! Tours: ${summary.tours}, Activities: ${summary.activities}, Destinations: ${summary.destinations}, Vehicles: ${summary.vehicles}, Settings: ${summary.settings || 0}`
      );
      await loadAllData();
    } catch (err) {
      console.error('Seeding error:', err);
      showNotification('error', lang === 'id' ? 'Gagal mengisi data dasar.' : 'Failed to seed basic directory data.');
    } finally {
      setSeeding(false);
    }
  };

  const loadAllData = async () => {
    setDataLoading(true);
    
    // Tours
    try {
      const toursSnap = await getDocs(collection(db, 'tours'));
      const fetchedTours: Tour[] = [];
      toursSnap.forEach(d => fetchedTours.push({ id: d.id, ...d.data() } as Tour));
      setToursList(fetchedTours);
    } catch (err) {
      console.error("Error loading tours: ", err);
    }

    // Activities
    try {
      const activitiesSnap = await getDocs(collection(db, 'activities'));
      const fetchedActivities: Activity[] = [];
      activitiesSnap.forEach(d => fetchedActivities.push({ id: d.id, ...d.data() } as Activity));
      setActivitiesList(fetchedActivities);
    } catch (err) {
      console.error("Error loading activities: ", err);
    }

    // Destinations
    try {
      const destinationsSnap = await getDocs(collection(db, 'destinations'));
      const fetchedDestinations: Destination[] = [];
      destinationsSnap.forEach(d => fetchedDestinations.push({ id: d.id, ...d.data() } as Destination));
      setDestinationsList(fetchedDestinations);
    } catch (err) {
      console.error("Error loading destinations: ", err);
    }

    // Vehicles
    try {
      const vehiclesSnap = await getDocs(collection(db, 'vehicles'));
      const fetchedVehicles: Vehicle[] = [];
      vehiclesSnap.forEach(d => fetchedVehicles.push({ id: d.id, ...d.data() } as Vehicle));
      setVehiclesList(fetchedVehicles);
    } catch (err) {
      console.error("Error loading vehicles: ", err);
    }

    // Tour Slots
    try {
      const slotsSnap = await getDocs(collection(db, 'tour_slots'));
      const fetchedSlots: any[] = [];
      slotsSnap.forEach(d => fetchedSlots.push({ id: d.id, ...d.data() }));
      fetchedSlots.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      setSlotsList(fetchedSlots);
    } catch (err) {
      console.error("Error loading tour slots: ", err);
    }

    // Settings
    try {
      const settingsSnap = await getDocs(collection(db, 'settings'));
      if (!settingsSnap.empty) {
        const sDoc = settingsSnap.docs[0];
        const sData = { id: sDoc.id, ...sDoc.data() } as Settings;
        setSettingsData(sData);
        if (onSettingsUpdated && sData.exchangeRate) {
          onSettingsUpdated(sData.exchangeRate);
        }
      } else {
        // Initialize default settings document in Firestore if not present
        const defaultSettings: Settings = {
          id: 'global',
          markupPercentage: 10,
          domesticDiscountPercentage: 15,
          exchangeRate: 16000,
          mealPriceIdr: 50000,
          tourServiceFeeIdr: 100000
        };
        try {
          await setDoc(doc(db, 'settings', 'global'), {
            markupPercentage: 10,
            domesticDiscountPercentage: 15,
            exchangeRate: 16000,
            mealPriceIdr: 50000,
            tourServiceFeeIdr: 100000
          });
          setSettingsData(defaultSettings);
        } catch (e) {
          handleFirestoreError(e, OperationType.WRITE, 'settings/global');
        }
      }
    } catch (err) {
      console.error("Error loading settings: ", err);
      // Double check if there's any backup settings offline
      if (!settingsData) {
        setSettingsData({
          id: 'global',
          markupPercentage: 10,
          domesticDiscountPercentage: 15,
          exchangeRate: 16000,
          mealPriceIdr: 50000,
          tourServiceFeeIdr: 100000
        });
      }
    }

    setDataLoading(false);
  };

  const handleToggleSlotStatus = async (slotId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'open' ? 'full' : 'open';
    try {
      await updateDoc(doc(db, 'tour_slots', slotId), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      showNotification('success', lang === 'id' ? `Status grup diubah menjadi ${newStatus}` : `Group status changed to ${newStatus}`);
      loadAllData();
    } catch (err) {
      console.error("Error updating slot status:", err);
      showNotification('error', 'Error updating slot status');
    }
  };

  const handleCreateSlotManually = async () => {
    if (!newSlotTourId || !newSlotDate) {
      alert(lang === 'id' ? 'Silakan pilih tour dan tanggal terlebih dahulu.' : 'Please select tour and date first.');
      return;
    }
    try {
      const selectedTour = toursList.find(t => t.id === newSlotTourId);
      if (!selectedTour) return;

      const { query, where } = await import('firebase/firestore');
      const slotsRef = collection(db, 'tour_slots');
      const q = query(slotsRef, where('tourId', '==', newSlotTourId), where('date', '==', newSlotDate));
      const snap = await getDocs(q);
      let maxGroupNum = 0;
      snap.forEach(d => {
        const data = d.data();
        if (data.groupNumber > maxGroupNum) {
          maxGroupNum = data.groupNumber;
        }
      });
      const nextGroupNum = maxGroupNum + 1;
      const slotId = `${newSlotTourId}-${newSlotDate}-group-${nextGroupNum}`;

      await setDoc(doc(db, 'tour_slots', slotId), {
        id: slotId,
        tourId: newSlotTourId,
        date: newSlotDate,
        groupNumber: nextGroupNum,
        participants: 0,
        maxParticipants: 7,
        status: 'open',
        pricePerPerson: Number(newSlotPrice) || 750000,
        bookingIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      showNotification('success', lang === 'id' ? `Slot Grup #${nextGroupNum} berhasil dibuat!` : `Group #${nextGroupNum} slot created successfully!`);
      setNewSlotTourId('');
      setNewSlotDate('');
      loadAllData();
    } catch (err) {
      console.error("Error creating manual slot:", err);
      showNotification('error', 'Error creating manual slot');
    }
  };

  const handleViewManifest = async (slotItem: any) => {
    setActiveManifestSlot(slotItem);
    setLoadingManifest(true);
    setManifestBookings([]);
    try {
      if (slotItem.bookingIds && slotItem.bookingIds.length > 0) {
        const bookingsList: any[] = [];
        const { query, where } = await import('firebase/firestore');
        const bookingsRef = collection(db, 'bookings');
        const q = query(bookingsRef, where('orderId', 'in', slotItem.bookingIds));
        const bookingSnap = await getDocs(q);
        bookingSnap.forEach(d => {
          bookingsList.push({ id: d.id, ...d.data() });
        });
        setManifestBookings(bookingsList);
      }
    } catch (err) {
      console.error("Error loading manifest bookings:", err);
    } finally {
      setLoadingManifest(false);
    }
  };

  const showNotification = (type: 'success' | 'error', text: string) => {
    setStatusMsg({ type, text });
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error("Popup Sign-in error: ", err);
      setAuthError(err.message || String(err));
      showNotification('error', 'Sign-in failed: ' + (err as Error).message);
    }
  };

  const handleGoogleSignInRedirect = async () => {
    setAuthError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithRedirect(auth, provider);
    } catch (err: any) {
      console.error("Redirect Sign-in error: ", err);
      setAuthError(err.message || String(err));
      showNotification('error', 'Redirect sign-in initialization failed: ' + (err as Error).message);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      showNotification('success', lang === 'id' ? 'Berhasil keluar.' : 'Signed out successfully.');
    } catch (err) {
      showNotification('error', 'Sign-out failed');
    }
  };

  // Delete Entity Handler
  const handleDeleteItem = async (collectionName: string, docId: string) => {
    if (!window.confirm(lang === 'id' ? `Hapus item ini (${docId})?` : `Are you sure you want to delete item (${docId})?`)) return;
    try {
      await deleteDoc(doc(db, collectionName, docId));
      showNotification('success', lang === 'id' ? 'Berhasil dihapus!' : 'Item deleted successfully!');
      loadAllData();
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.DELETE, `${collectionName}/${docId}`);
      } catch (formattedErr: any) {
        showNotification('error', 'Permission denied: ' + formattedErr.message);
      }
    }
  };

  // Edit / Add Form Trigger
  const handleOpenForm = (item: any | null, type: TabType) => {
    setIsAddingNew(!item);
    if (item) {
      setCurrentEditItem({ ...item });
      // Prep list inputs
      if (type === 'tours') {
        setTempItinerary(item.itinerary?.join('\n') || '');
        setTempIncluded(item.included?.join('\n') || '');
        setTempExcluded(item.excluded?.join('\n') || '');
      } else if (type === 'destinations') {
        setTempAreas(item.areas?.join('\n') || '');
      }
    } else {
      // Default initial maps for new objects
      if (type === 'tours') {
        setCurrentEditItem({
          id: '',
          title: '',
          location: 'Bali',
          price: 0,
          rating: 5.0,
          reviews: 1,
          image: '',
          duration: '1 Day',
          description: '',
          itinerary: [],
          included: [],
          excluded: [],
          lat: -8.4095,
          lng: 115.1889,
          category: 'Sightseeing',
          highlighted: false
        });
        setTempItinerary('');
        setTempIncluded('');
        setTempExcluded('');
      } else if (type === 'activities') {
        setCurrentEditItem({
          id: '',
          name: '',
          category: 'Adventure',
          vendor: '',
          location: 'Bali',
          price_min_idr: 0,
          price_max_idr: 0,
          duration: '1-2 Hours',
          includes: [],
          status: 'Active',
          operating_hours: '08:00 - 18:00',
          type: 'activity'
        });
      } else if (type === 'destinations') {
        setCurrentEditItem({
          id: '',
          name: '',
          category: 'Beach',
          entrance_fee_idr: 0,
          is_free: false,
          areas: [],
          status: 'Active',
          description: '',
          imageUrl: '',
          googleMapsUrl: ''
        });
        setTempAreas('');
      } else if (type === 'vehicles') {
        setCurrentEditItem({
          id: '',
          vehicle: '',
          type: 'Standard',
          seats: 4,
          rate_with_driver_idr: 0,
          rate_oneway_idr: 0,
          vendor: '',
          contact_number: '',
          status: 'Available',
          updated: new Date().toLocaleDateString()
        });
      }
    }
  };

  // Form Submit Handler
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEditItem || !currentEditItem.id) {
      showNotification('error', lang === 'id' ? 'ID dokumen harus diisi!' : 'Document ID is required!');
      return;
    }

    // RegEx block for security validation of document IDs
    const idRegex = /^[a-zA-Z0-9_\-]+$/;
    if (!idRegex.test(currentEditItem.id)) {
      showNotification('error', lang === 'id' ? 'ID hanya boleh huruf, angka, dash, atau underscore' : 'ID must match ^[a-zA-Z0-9_\\-]+$ to conform with safety gates');
      return;
    }

    let payload = { ...currentEditItem };

    // Format list values
    if (activeTab === 'tours') {
      payload.itinerary = tempItinerary.split('\n').map(x => x.trim()).filter(Boolean);
      payload.included = tempIncluded.split('\n').map(x => x.trim()).filter(Boolean);
      payload.excluded = tempExcluded.split('\n').map(x => x.trim()).filter(Boolean);
      payload.price = Number(payload.price) || 0;
      payload.rating = Number(payload.rating) || 5;
      payload.reviews = Number(payload.reviews) || 0;
      payload.lat = Number(payload.lat) || 0;
      payload.lng = Number(payload.lng) || 0;
    } else if (activeTab === 'activities') {
      payload.price_min_idr = Number(payload.price_min_idr) || 0;
      payload.price_max_idr = Number(payload.price_max_idr) || 0;
    } else if (activeTab === 'destinations') {
      payload.areas = tempAreas.split('\n').map(x => x.trim()).filter(Boolean);
      payload.entrance_fee_idr = Number(payload.entrance_fee_idr) || 0;
    } else if (activeTab === 'vehicles') {
      payload.seats = Number(payload.seats) || 4;
      payload.rate_with_driver_idr = Number(payload.rate_with_driver_idr) || 0;
      payload.rate_oneway_idr = Number(payload.rate_oneway_idr) || null;
      payload.updated = new Date().toLocaleDateString();
    }

    try {
      const docRef = doc(db, activeTab, payload.id);
      
      // Clean up fields just to be safe
      const cleanedData = { ...payload };
      delete cleanedData.id; // Keep Firestore document id in the reference only

      await setDoc(docRef, cleanedData);
      
      showNotification('success', lang === 'id' ? 'Data berhasil disimpan!' : 'Document saved successfully!');
      setCurrentEditItem(null);
      loadAllData();
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.WRITE, `${activeTab}/${payload.id}`);
      } catch (formattedErr: any) {
        showNotification('error', 'Failed: ' + formattedErr.message);
      }
    }
  };

  // Update Settings Handler
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsData) return;
    
    try {
      const settingsRef = doc(db, 'settings', settingsData.id || 'global');
      const cleanSettings = {
        exchangeRate: Number(settingsData.exchangeRate) || 16000,
        markupPercentage: Number(settingsData.markupPercentage) || 0,
        domesticDiscountPercentage: Number(settingsData.domesticDiscountPercentage) || 0,
        mealPriceIdr: Number(settingsData.mealPriceIdr) || 0,
        tourServiceFeeIdr: Number(settingsData.tourServiceFeeIdr) || 0
      };
      
      await setDoc(settingsRef, cleanSettings);
      showNotification('success', lang === 'id' ? 'Pengaturan global berhasil disimpan!' : 'Global settings updated successfully!');
      if (onSettingsUpdated) {
        onSettingsUpdated(cleanSettings.exchangeRate);
      }
      loadAllData();
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.WRITE, `settings/${settingsData?.id || 'global'}`);
      } catch (formattedErr: any) {
        showNotification('error', 'Error applying settings: ' + formattedErr.message);
      }
    }
  };

  if (authLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-900 text-white p-6">
        <RefreshCw size={40} className="text-[#E87230] animate-spin mb-4" />
        <span className="font-semibold text-lg">Authenticating...</span>
      </div>
    );
  }

  // Not logged in or not an Admin
  if (!user || !isAdmin) {
    return (
      <div className="flex-1 flex flex-col justify-between bg-slate-950 text-white relative overflow-hidden">
        {/* Header bar */}
        <header className="px-6 py-4 flex items-center border-b border-white/5 bg-slate-950/80 backdrop-blur-md z-10 w-full shrink-0">
          <button onClick={onBack} className="mr-4 text-white hover:text-[#E87230] transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h3 className="text-xl font-bold font-sans tracking-tight">Admin Gate</h3>
        </header>

        {/* Dynamic decorative background cards */}
        <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#E87230]/5 blur-[120px] rounded-full pointer-events-none" />

        {/* Content body */}
        <div className="flex-1 max-w-md mx-auto w-full flex flex-col justify-center px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative"
          >
            <div className="w-16 h-16 bg-[#E87230]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[#E87230]/20 text-[#E87230]">
              <Lock size={28} />
            </div>

            <h2 className="text-2xl font-black text-center mb-2 tracking-tight">
              {lang === 'id' ? 'Gerbang Administrator' : 'Administrator Control Panel'}
            </h2>
            <p className="text-slate-400 text-sm text-center mb-8">
              {lang === 'id' ? 'Silakan masuk menggunakan akun Google admin terdaftar Anda untuk mengelola konten dan sistem.' : 'Please authenticate with an authorized Google admin workspace account to modify database records directly.'}
            </p>

            {user && !isAdmin && (
              <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-start space-x-3 text-red-400">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold">{lang === 'id' ? 'Akses Ditolak' : 'Access Denied'}</p>
                  <p>{lang === 'id' ? 'Email Anda:' : 'Credential email:'} <span className="font-mono text-white">{user.email}</span> {lang === 'id' ? 'tidak terdaftar sebagai Administrator.' : 'is not an approved system administrator.'}</p>
                </div>
              </div>
            )}

            {!user ? (
              <div className="space-y-4">
                <button 
                  onClick={handleGoogleSignIn}
                  className="w-full py-4 px-6 bg-white hover:bg-slate-100 dark:hover:bg-slate-100 text-slate-950 rounded-2xl font-bold flex items-center justify-center space-x-4 transition-all shadow-xl hover:scale-[1.01]"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.62-.06-1.18-.35-1.67-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>{lang === 'id' ? 'Masuk dengan Google (Popup)' : 'Sign in with Google (Popup)'}</span>
                </button>

                <button 
                  onClick={handleGoogleSignInRedirect}
                  className="w-full py-4 px-6 bg-slate-800 hover:bg-slate-700 text-white border border-white/10 rounded-2xl font-bold flex items-center justify-center space-x-3 transition-all"
                >
                  <svg className="w-5 h-5 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                  <span>{lang === 'id' ? 'Masuk dengan Google (Redirect Mode)' : 'Sign in with Google (Redirect Mode)'}</span>
                </button>

                {/* Error message container */}
                {authError && (
                  <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-200 text-xs text-left leading-relaxed">
                    <p className="font-bold flex items-center space-x-1.5 mb-1 text-red-400">
                      <AlertCircle size={14} className="shrink-0" />
                      <span>{lang === 'id' ? 'Log Masalah Autentikasi' : 'Authentication Issue Log'}</span>
                    </p>
                    <p className="font-mono bg-black/30 p-2 rounded-lg border border-red-500/10 overflow-x-auto max-h-20 scrollbar-thin">
                      {authError}
                    </p>
                  </div>
                )}

                {/* Troubleshooting trigger button */}
                <div className="pt-2 text-center">
                  <button
                    onClick={() => setShowTroubleshooting(!showTroubleshooting)}
                    className="text-xs text-[#E87230] hover:underline inline-flex items-center space-x-1 font-medium transition-all"
                  >
                    <span>{showTroubleshooting ? (lang === 'id' ? 'Sembunyikan Solusi' : 'Hide Troubleshooting Solution') : (lang === 'id' ? 'Kenapa Tombol Google tidak berfungsi?' : 'Why is Google Login not working?')}</span>
                  </button>
                </div>

                {/* Step-by-Step Troubleshooting Section */}
                <AnimatePresence>
                  {(showTroubleshooting || authError) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-left mt-2 border-t border-white/5 pt-4 overflow-hidden"
                    >
                      <div className="bg-slate-950 p-4 rounded-2xl border border-white/5 text-[11px] leading-relaxed text-slate-300 space-y-3 max-h-72 overflow-y-auto scrollbar-thin">
                        <p className="font-bold text-[#E87230] text-xs">
                          {lang === 'id' ? '🛠️ Cara Mengatasi Tombol Google Blok (di Vercel / HP)' : '🛠️ Fix Google Auth on Deployed Apps (Vercel & Mobile)'}
                        </p>

                        <div className="space-y-2">
                          <p className="font-semibold text-white">
                            {lang === 'id' ? '1. Tambahkan Domain Vercel ke FIrebase (Halaman Resmi):' : '1. Whitelist Vercel Domain in Firebase Console:'}
                          </p>
                          <ul className="list-disc pl-4 space-y-1">
                            <li>{lang === 'id' ? 'Buka Firebase Console -> Pilih project Anda.' : 'Go to Firebase Console -> Select your project.'}</li>
                            <li>{lang === 'id' ? 'Klik Authentication -> Tab "Settings" (Pengaturan) -> Pilih "Authorized domains" (Domain terotorisasi).' : 'Go to Authentication -> "Settings" tab -> Choose "Authorized domains".'}</li>
                            <li>{lang === 'id' ? 'Klik "Add Domain", lalu tambahkan domain Vercel Anda (contoh: freasiatour.vercel.app atau domain custom Anda).' : 'Click "Add Domain" and input your exact Vercel URL (e.g., your-app.vercel.app or your custom domain).'}</li>
                          </ul>
                        </div>

                        <div className="space-y-2 border-t border-white/5 pt-2">
                          <p className="font-semibold text-white">
                            {lang === 'id' ? '2. Gunakan Redirect Mode di HP:' : '2. Mobile Safari / Pop-up Restrictions:'}
                          </p>
                          <p>
                            {lang === 'id' 
                              ? 'HP (terutama Safari & browser di dalam WhatsApp/Instagram) sering memblokir pop-up sign-in Google. Klik tombol "Redirect Mode" di atas untuk log-in via pengalihan halaman resmi.' 
                              : 'Mobile devices are designed to auto-block popups. Click the "Redirect Mode" button above so the page safely redirects to Google instead of launching a window.'}
                          </p>
                        </div>

                        <div className="space-y-2 border-t border-white/5 pt-2">
                          <p className="font-semibold text-white">
                            {lang === 'id' ? '3. Aktifkan Google Sign-in Provider:' : '3. Make sure Google provider is Enabled:'}
                          </p>
                          <p>
                            {lang === 'id' 
                              ? 'Pastikan di Firebase Console -> Authentication -> tab Sign-in Method, Google statusnya adalah "Enabled" (Aktif).' 
                              : 'Ensure that Google is toggled ON under Firebase Console -> Authentication -> Sign-in Method tab.'}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button 
                onClick={handleSignOut}
                className="w-full py-4 px-6 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold flex items-center justify-center space-x-2 transition-all shadow-lg"
              >
                <LogOut size={18} />
                <span>{lang === 'id' ? 'Keluar / Ganti Akun' : 'Log Out / Switch Account'}</span>
              </button>
            )}
          </motion.div>
        </div>

        {/* Footer info bar */}
        <footer className="py-6 px-6 text-center text-xs text-slate-500 border-t border-white/5">
          Freesiatour CMS Panel &bull; Live Zero-Trust ABAC Guarded Sandbox
        </footer>
      </div>
    );
  }

  // Admin Verified Dashboard
  return (
    <div className="flex-1 flex flex-col bg-slate-900 text-white overflow-hidden font-sans">
      
      {/* Header bar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-white/5 bg-slate-950/90 backdrop-blur-md z-10 shrink-0">
        <div className="flex items-center space-x-3">
          <button onClick={onBack} className="mr-2 text-white hover:text-[#E87230] transition-all">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h3 className="text-lg font-black tracking-tight flex items-center space-x-2">
              <span className="text-[#E87230]">FREESIA</span>
              <span className="text-white">CMS</span>
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">
              {lang === 'id' ? 'Pengendali Sistem Utama' : 'System Control Center'}
            </p>
          </div>
        </div>

        {/* User Badge / Actions */}
        <div className="flex items-center space-x-4">
          <button
            onClick={handleSeed}
            disabled={seedStatus === 'loading' || seedStatus === 'done'}
            className={`py-2 px-3 border rounded-xl font-bold font-sans text-xs transition-colors flex items-center space-x-1.5 ${
              seedStatus === 'done'
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/20 cursor-not-allowed'
                : seedStatus === 'loading'
                  ? 'bg-slate-800 text-slate-400 border-white/5 cursor-wait'
                  : 'bg-white/5 hover:bg-emerald-500/10 text-slate-200 border-white/10 hover:border-emerald-500/30'
            }`}
          >
            {seedStatus === 'idle' && <span>🌱 Seed Data</span>}
            {seedStatus === 'loading' && <span>⏳ Seeding...</span>}
            {seedStatus === 'done' && <span>✅ Seeded</span>}
            {seedStatus === 'error' && <span>❌ Error - Try Again</span>}
          </button>

          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs font-bold text-white">{user.displayName || 'Admin'}</span>
            <span className="text-[9px] font-mono text-[#E87230]">MASTER ADMIN</span>
          </div>
          <button 
            onClick={handleSignOut}
            className="p-2.5 bg-white/5 hover:bg-red-500/10 hover:text-red-400 border border-white/10 rounded-xl transition-colors"
            title={lang === 'id' ? 'Keluar' : 'Sign Out'}
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Main CMS Tabbed workspace */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navigation Tabs */}
        <div className="bg-slate-950 border-b border-white/5 px-6 py-2 overflow-x-auto w-full flex space-x-2 shrink-0 scrollbar-none">
          {[
            { id: 'tours', icon: Compass, label: lang === 'id' ? 'Tur' : 'Tours' },
            { id: 'activities', icon: ActivityIcon, label: lang === 'id' ? 'Aktivitas' : 'Activities' },
            { id: 'destinations', icon: MapPin, label: lang === 'id' ? 'Destinasi' : 'Destinations' },
            { id: 'vehicles', icon: Car, label: lang === 'id' ? 'Sewa Mobil' : 'Vehicles' },
            { id: 'settings', icon: SettingsIcon, label: lang === 'id' ? 'Setelan' : 'Settings' },
            { id: 'slots', icon: Layers, label: lang === 'id' ? 'Slot Grup' : 'Group Slots' }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as TabType);
                  setCurrentEditItem(null);
                }}
                className={`py-3 px-5 rounded-2xl flex items-center space-x-2 text-xs font-bold shrink-0 transition-all ${
                  isActive 
                    ? 'bg-[#E87230]/20 text-[#E87230] border border-[#E87230]/30' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <tab.icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Global Notifications Panel */}
        <AnimatePresence>
          {statusMsg && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className={`px-6 py-3 border-b text-xs flex items-center space-x-3 font-semibold shrink-0 ${
                statusMsg.type === 'success' 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                  : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}
            >
              {statusMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              <span className="flex-1">{statusMsg.text}</span>
              <button onClick={() => setStatusMsg(null)} className="opacity-60 hover:opacity-100">
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic CMS Body Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {!currentEditItem ? (
              /* TAB VIEW SCREEN */
              <motion.div 
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Header row of selected tab */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-xl font-black capitalize tracking-tight flex items-center gap-2">
                      <span>{activeTab}</span>
                      <span className="text-xs bg-slate-800 border border-white/5 px-2.5 py-0.5 rounded-full text-slate-400 font-mono">
                        {activeTab === 'tours' && toursList.length}
                        {activeTab === 'activities' && activitiesList.length}
                        {activeTab === 'destinations' && destinationsList.length}
                        {activeTab === 'vehicles' && vehiclesList.length}
                        {activeTab === 'settings' && '1'}
                        {activeTab === 'slots' && slotsList.length}
                      </span>
                    </h1>
                    <p className="text-xs text-slate-400">
                      {activeTab === 'tours' && (lang === 'id' ? 'Kelola paket liburan populer Bali & Lombok' : 'Manage travel itineraries and highlights')}
                      {activeTab === 'activities' && (lang === 'id' ? 'Aktifitas outdoor, petualangan air, & tiket atraksi' : 'Manage adventure packages & attraction tickets')}
                      {activeTab === 'destinations' && (lang === 'id' ? 'Katalog objek wisata & tiket masuk Bali' : 'Manage island destinations and admission prices')}
                      {activeTab === 'vehicles' && (lang === 'id' ? 'Pengaturan armada sewa mobil & tarif transfer' : 'Manage cars, seating capacity, and driver transport rates')}
                      {activeTab === 'settings' && (lang === 'id' ? 'Kurs mata uang global dan biaya servis' : 'Set core parameters, markup ratios, and conversion rates')}
                      {activeTab === 'slots' && (lang === 'id' ? 'Daftar slot rombongan tur, status keterisian, kuota, dan kontrol grup' : 'View group tour slots, manual override toggle, group quotas, and manifests')}
                    </p>
                  </div>
 
                  <div className="flex flex-wrap items-center gap-3 self-start">
                    {/* Seed Data Button */}
                    <button
                      onClick={handleSeedData}
                      disabled={seeding || seeded}
                      className={`py-3 px-5 rounded-2xl font-bold font-sans text-xs flex items-center justify-center space-x-2 transition-all border ${
                        seeded 
                          ? 'bg-slate-900 text-slate-400 border-white/5 opacity-80 cursor-not-allowed'
                          : seeding
                            ? 'bg-slate-800 text-slate-300 border-white/10 cursor-wait'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white border-transparent hover:shadow-lg hover:shadow-emerald-600/20'
                      }`}
                    >
                      <RefreshCw size={14} className={seeding ? 'animate-spin' : ''} />
                      <span>
                        {seeding 
                          ? (lang === 'id' ? 'Mengisi Data...' : 'Seeding...') 
                          : seeded 
                            ? (lang === 'id' ? '✅ Berhasil Diisi' : '✅ Seeded')
                            : (lang === 'id' ? 'Seed Data' : 'Seed Data')}
                      </span>
                    </button>

                    {activeTab !== 'settings' && activeTab !== 'slots' && (
                      <button 
                        onClick={() => handleOpenForm(null, activeTab)}
                        className="py-3 px-5 bg-[#E87230] hover:bg-[#ff8643] text-white rounded-2xl font-bold font-sans text-xs flex items-center justify-center space-x-2 transition-all hover:shadow-lg hover:shadow-[#E87230]/20"
                      >
                        <Plus size={16} />
                        <span>{lang === 'id' ? 'Tambah Baru' : 'Add New'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* DB Loader */}
                {dataLoading ? (
                  <div className="py-24 flex flex-col items-center justify-center">
                    <RefreshCw size={36} className="text-[#E87230] animate-spin mb-3" />
                    <span className="font-mono text-xs text-slate-400">Querying Firestore Database...</span>
                  </div>
                ) : (
                  <>
                    {/* TOURS TABLE / LIST */}
                    {activeTab === 'tours' && (
                      <div className="bg-slate-950 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-slate-900/60 border-b border-white/5 text-slate-400 font-bold">
                                <th className="p-4 w-20">ID</th>
                                <th className="p-4">{lang === 'id' ? 'Judul Tur' : 'Tour Title'}</th>
                                <th className="p-4">{lang === 'id' ? 'Kategori' : 'Category'}</th>
                                <th className="p-4">{lang === 'id' ? 'Harga (USD)' : 'Price (USD)'}</th>
                                <th className="p-4">{lang === 'id' ? 'Durasi' : 'Duration'}</th>
                                <th className="p-4 text-right w-24">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {toursList.map((tour) => (
                                <tr key={tour.id} className="hover:bg-white/[0.02]">
                                  <td className="p-4 font-mono font-bold text-[#E87230]">{tour.id}</td>
                                  <td className="p-4 font-bold max-w-xs truncate">{tour.title}</td>
                                  <td className="p-4">
                                    <span className="bg-slate-800 text-slate-300 font-sans px-2.5 py-0.5 rounded-full border border-white/5">
                                      {tour.category || 'Sightseeing'}
                                    </span>
                                  </td>
                                  <td className="p-4 font-mono font-black text-emerald-400">${tour.price}</td>
                                  <td className="p-4 text-slate-400">{tour.duration}</td>
                                  <td className="p-4 text-right">
                                    <div className="flex items-center justify-end space-x-2">
                                      <button 
                                        onClick={() => handleOpenForm(tour, 'tours')}
                                        className="p-2 hover:bg-white/10 rounded-lg text-slate-300 transition-colors"
                                      >
                                        <Edit size={14} />
                                      </button>
                                      <button 
                                        onClick={() => handleDeleteItem('tours', tour.id)}
                                        className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 transition-colors"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                              {toursList.length === 0 && (
                                <tr>
                                  <td colSpan={6} className="p-8 text-center text-slate-500 italic">No tours defined in Firestore database yet. Click "Add New" or seed data.</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* ACTIVITIES TABLE / LIST */}
                    {activeTab === 'activities' && (
                      <div className="bg-slate-950 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-slate-900/60 border-b border-white/5 text-slate-400 font-bold">
                                <th className="p-4 w-20">ID</th>
                                <th className="p-4">{lang === 'id' ? 'Nama Aktivitas' : 'Activity Name'}</th>
                                <th className="p-4">{lang === 'id' ? 'Kategori' : 'Category'}</th>
                                <th className="p-4">{lang === 'id' ? 'Tarif Min (IDR)' : 'Min Price (IDR)'}</th>
                                <th className="p-4">{lang === 'id' ? 'Tarif Max (IDR)' : 'Max Price (IDR)'}</th>
                                <th className="p-4">{lang === 'id' ? 'Vendor' : 'Vendor'}</th>
                                <th className="p-4 text-right w-24">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {activitiesList.map((act) => (
                                <tr key={act.id} className="hover:bg-white/[0.02]">
                                  <td className="p-4 font-mono font-bold text-[#E87230]">{act.id}</td>
                                  <td className="p-4 font-bold max-w-xs truncate">{act.name}</td>
                                  <td className="p-4">
                                    <span className="bg-[#E87230]/10 text-[#E87230] font-sans px-2.5 py-0.5 rounded-full border border-[#E87230]/20">
                                      {act.category || 'Adventure'}
                                    </span>
                                  </td>
                                  <td className="p-4 font-mono text-slate-300">IDR {act.price_min_idr?.toLocaleString()}</td>
                                  <td className="p-4 font-mono text-slate-300">IDR {act.price_max_idr?.toLocaleString()}</td>
                                  <td className="p-4 text-slate-400 truncate max-w-xs">{act.vendor || '-'}</td>
                                  <td className="p-4 text-right">
                                    <div className="flex items-center justify-end space-x-2">
                                      <button 
                                        onClick={() => handleOpenForm(act, 'activities')}
                                        className="p-2 hover:bg-white/10 rounded-lg text-slate-300 transition-colors"
                                      >
                                        <Edit size={14} />
                                      </button>
                                      <button 
                                        onClick={() => handleDeleteItem('activities', act.id)}
                                        className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 transition-colors"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                              {activitiesList.length === 0 && (
                                <tr>
                                  <td colSpan={7} className="p-8 text-center text-slate-500 italic">No activities in database.</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* DESTINATIONS TABLE / LIST */}
                    {activeTab === 'destinations' && (
                      <div className="bg-slate-950 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-slate-900/60 border-b border-white/5 text-slate-400 font-bold">
                                <th className="p-4 w-20">ID</th>
                                <th className="p-4">{lang === 'id' ? 'Nama Destinasi' : 'Destination'}</th>
                                <th className="p-4">{lang === 'id' ? 'Kategori' : 'Category'}</th>
                                <th className="p-4">{lang === 'id' ? 'Harga Tiket (IDR)' : 'Admission (IDR)'}</th>
                                <th className="p-4">{lang === 'id' ? 'Status' : 'Status'}</th>
                                <th className="p-4 text-right w-24">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {destinationsList.map((dest) => (
                                <tr key={dest.id} className="hover:bg-white/[0.02]">
                                  <td className="p-4 font-mono font-bold text-[#E87230]">{dest.id}</td>
                                  <td className="p-4 font-bold max-w-xs truncate">{dest.name}</td>
                                  <td className="p-4">
                                    <span className="bg-slate-800 text-slate-300 font-sans px-2.5 py-0.5 rounded-full border border-white/5">
                                      {dest.category}
                                    </span>
                                  </td>
                                  <td className="p-4 font-mono text-slate-300">
                                    {dest.is_free ? (
                                      <span className="text-emerald-400 font-bold">{lang === 'id' ? 'Gratis' : 'Free Entry'}</span>
                                    ) : (
                                      `IDR ${dest.entrance_fee_idr?.toLocaleString()}`
                                    )}
                                  </td>
                                  <td className="p-4">
                                    <span className={`text-[10px] font-bold px-2 rounded ${dest.status === 'Active' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 bg-slate-500/10'}`}>
                                      {dest.status}
                                    </span>
                                  </td>
                                  <td className="p-4 text-right">
                                    <div className="flex items-center justify-end space-x-2">
                                      <button 
                                        onClick={() => handleOpenForm(dest, 'destinations')}
                                        className="p-2 hover:bg-white/10 rounded-lg text-slate-300 transition-colors"
                                      >
                                        <Edit size={14} />
                                      </button>
                                      <button 
                                        onClick={() => handleDeleteItem('destinations', dest.id)}
                                        className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 transition-colors"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                              {destinationsList.length === 0 && (
                                <tr>
                                  <td colSpan={6} className="p-8 text-center text-slate-500 italic">No destinations in database.</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* VEHICLES TAB */}
                    {activeTab === 'vehicles' && (
                      <div className="bg-slate-950 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-slate-900/60 border-b border-white/5 text-slate-400 font-bold">
                                <th className="p-4 w-20">ID</th>
                                <th className="p-4">{lang === 'id' ? 'Kendaraan' : 'Vehicle'}</th>
                                <th className="p-4">{lang === 'id' ? 'Kelas' : 'Class'}</th>
                                <th className="p-4">{lang === 'id' ? 'Kapasitas (Seat)' : 'Seats'}</th>
                                <th className="p-4">{lang === 'id' ? 'Sewa dengan Sopir (IDR)' : 'Rate with Driver (IDR)'}</th>
                                <th className="p-4">{lang === 'id' ? 'Status' : 'Status'}</th>
                                <th className="p-4 text-right w-24">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {vehiclesList.map((carItem) => (
                                <tr key={carItem.id} className="hover:bg-white/[0.02]">
                                  <td className="p-4 font-mono font-bold text-[#E87230]">{carItem.id}</td>
                                  <td className="p-4 font-bold truncate max-w-xs">{carItem.vehicle}</td>
                                  <td className="p-4 text-slate-400">{carItem.type}</td>
                                  <td className="p-4 text-slate-300 font-semibold">{carItem.seats} Pax</td>
                                  <td className="p-4 font-mono text-slate-300">IDR {carItem.rate_with_driver_idr?.toLocaleString()}</td>
                                  <td className="p-4 text-slate-400">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${carItem.status === 'Available' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 bg-slate-500/10'}`}>
                                      {carItem.status}
                                    </span>
                                  </td>
                                  <td className="p-4 text-right">
                                    <div className="flex items-center justify-end space-x-2">
                                      <button 
                                        onClick={() => handleOpenForm(carItem, 'vehicles')}
                                        className="p-2 hover:bg-white/10 rounded-lg text-slate-300 transition-colors"
                                      >
                                        <Edit size={14} />
                                      </button>
                                      <button 
                                        onClick={() => handleDeleteItem('vehicles', carItem.id)}
                                        className="p-2 hover:bg-red-500/10 rounded-lg text-red-400 transition-colors"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                              {vehiclesList.length === 0 && (
                                <tr>
                                  <td colSpan={7} className="p-8 text-center text-slate-500 italic">No vehicles in database.</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* GLOBAL SETTINGS FORM */}
                    {activeTab === 'settings' && settingsData && (
                      <div className="bg-slate-950 border border-white/5 rounded-3xl p-6 sm:p-8 shadow-2xl max-w-2xl">
                        <form onSubmit={handleSaveSettings} className="space-y-6">
                          <h2 className="text-sm uppercase font-black text-slate-400 tracking-wider flex items-center space-x-2">
                            <Layers size={16} />
                            <span>{lang === 'id' ? 'Sistem Parameter Selisih Harga & Kurs' : 'Currency Rates & Margin Multipliers'}</span>
                          </h2>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            
                            {/* Exchange Rate */}
                            <div className="space-y-2">
                              <label className="text-xs text-slate-400 font-bold block flex items-center space-x-1.5">
                                <Coins size={14} className="text-[#E87230]" />
                                <span>{lang === 'id' ? 'Nilai Kurs USD ke IDR' : 'Exchange Rate (USD to IDR)'}</span>
                              </label>
                              <div className="relative">
                                <input 
                                  type="number"
                                  className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 font-mono font-bold text-white pl-12 focus:border-[#E87230]/40 outline-none"
                                  placeholder="16000"
                                  value={settingsData.exchangeRate || ''}
                                  onChange={(e) => setSettingsData({ ...settingsData, exchangeRate: Number(e.target.value) })}
                                  required
                                />
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-bold">1$ =</span>
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">IDR</span>
                              </div>
                            </div>

                            {/* Markup percentage */}
                            <div className="space-y-2">
                              <label className="text-xs text-slate-400 font-bold block flex items-center space-x-1.5">
                                <Percent size={14} className="text-[#E87230]" />
                                <span>{lang === 'id' ? 'Persentase Markup Sistem (%)' : 'Markup Margin System (%)'}</span>
                              </label>
                              <div className="relative">
                                <input 
                                  type="number"
                                  className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 font-mono font-bold text-white focus:border-[#E87230]/40 outline-none"
                                  placeholder="10"
                                  value={settingsData.markupPercentage || ''}
                                  onChange={(e) => setSettingsData({...settingsData, markupPercentage: Number(e.target.value)})}
                                  required
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-mono">%</span>
                              </div>
                            </div>

                            {/* Holiday domestic discount */}
                            <div className="space-y-2">
                              <label className="text-xs text-slate-400 font-bold block flex items-center space-x-1.5">
                                <Percent size={14} className="text-[#E87230]" />
                                <span>{lang === 'id' ? 'Diskon Domestik (%)' : 'Domestic Tour Discount (%)'}</span>
                              </label>
                              <div className="relative">
                                <input 
                                  type="number"
                                  className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 font-mono font-bold text-white focus:border-[#E87230]/40 outline-none"
                                  placeholder="15"
                                  value={settingsData.domesticDiscountPercentage || ''}
                                  onChange={(e) => setSettingsData({...settingsData, domesticDiscountPercentage: Number(e.target.value)})}
                                  required
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-mono">%</span>
                              </div>
                            </div>

                            {/* Meal Price Estimate IDR */}
                            <div className="space-y-2">
                              <label className="text-xs text-slate-400 font-bold block flex items-center space-x-1.5">
                                <DollarSign size={14} className="text-[#E87230]" />
                                <span>{lang === 'id' ? 'Estimasi Harga Makan (IDR)' : 'Default Meal Price Guest (IDR)'}</span>
                              </label>
                              <div className="relative">
                                <input 
                                  type="number"
                                  className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 font-mono font-bold text-white pl-12 focus:border-[#E87230]/40 outline-none"
                                  placeholder="50000"
                                  value={settingsData.mealPriceIdr || ''}
                                  onChange={(e) => setSettingsData({...settingsData, mealPriceIdr: Number(e.target.value)})}
                                  required
                                />
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-bold">Rp</span>
                              </div>
                            </div>

                            {/* Service Fee IDR */}
                            <div className="space-y-2">
                              <label className="text-xs text-slate-400 font-bold block flex items-center space-x-1.5">
                                <Briefcase size={14} className="text-[#E87230]" />
                                <span>{lang === 'id' ? 'Biaya Servis Pemandu Tur (IDR)' : 'Tour Guide Service Fee (IDR)'}</span>
                              </label>
                              <div className="relative">
                                <input 
                                  type="number"
                                  className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 font-mono font-bold text-white pl-12 focus:border-[#E87230]/40 outline-none"
                                  placeholder="100000"
                                  value={settingsData.tourServiceFeeIdr || ''}
                                  onChange={(e) => setSettingsData({...settingsData, tourServiceFeeIdr: Number(e.target.value)})}
                                  required
                                />
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-bold">Rp</span>
                              </div>
                            </div>

                          </div>

                          <div className="pt-4 border-t border-white/5 flex justify-end">
                            <button
                              type="submit"
                              className="py-3 px-6 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-xs flex items-center justify-center space-x-2 transition-all shadow-lg hover:shadow-emerald-500/20"
                            >
                              <Save size={16} />
                              <span>{lang === 'id' ? 'Simpan Setelan' : 'Save Settings'}</span>
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* GROUP TOUR SLOTS MANAGEMENT */}
                    {activeTab === 'slots' && (
                      <div className="space-y-6">
                        {/* Manual Creation Card */}
                        <div className="bg-slate-950 border border-white/5 rounded-3xl p-6 shadow-2xl">
                          <h2 className="text-sm uppercase font-black text-slate-400 tracking-wider flex items-center space-x-2 mb-4">
                            <Plus size={16} className="text-[#E87230]" />
                            <span>{lang === 'id' ? 'Sistem Pembuat Slot Grup Manual' : 'Create Group Tour Slot Manually'}</span>
                          </h2>
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div>
                              <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">{lang === 'id' ? 'Pilih Paket Tur' : 'Select Tour Package'}</label>
                              <select
                                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-3 text-xs text-white outline-none focus:border-[#E87230] cursor-pointer"
                                value={newSlotTourId}
                                onChange={(e) => setNewSlotTourId(e.target.value)}
                              >
                                <option value="">-- {lang === 'id' ? 'Pilih paket' : 'Choose tour'} --</option>
                                {toursList.map(t => (
                                  <option key={t.id} value={t.id}>{t.title}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">{lang === 'id' ? 'Tanggal Perjalanan' : 'Travel Date'}</label>
                              <input
                                type="date"
                                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-3 text-xs text-white outline-none focus:border-[#E87230]"
                                value={newSlotDate}
                                onChange={(e) => setNewSlotDate(e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1.5">{lang === 'id' ? 'Tarif per Rombongan (IDR)' : 'Price per Pax (IDR)'}</label>
                              <input
                                type="number"
                                className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-3 text-xs text-white outline-none focus:border-[#E87230] font-mono"
                                placeholder="720000"
                                value={newSlotPrice}
                                onChange={(e) => setNewSlotPrice(Number(e.target.value))}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={handleCreateSlotManually}
                              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-[#0f172a] font-black rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
                            >
                              ✨ {lang === 'id' ? 'Buka Grup Baru' : 'Open Group Slot'}
                            </button>
                          </div>
                        </div>

                        {/* Slots Database List */}
                        <div className="bg-slate-950 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="bg-slate-900/60 border-b border-white/5 text-slate-400 font-bold">
                                  <th className="p-4">{lang === 'id' ? 'Nama Tur' : 'Tour Package'}</th>
                                  <th className="p-4">{lang === 'id' ? 'Tanggal' : 'Date'}</th>
                                  <th className="p-4">{lang === 'id' ? 'Nomor Grup' : 'Group No.'}</th>
                                  <th className="p-4">{lang === 'id' ? 'Kapasitas' : 'Occupancy'}</th>
                                  <th className="p-4">{lang === 'id' ? 'Harga' : 'Price'}</th>
                                  <th className="p-4">{lang === 'id' ? 'Status' : 'Status'}</th>
                                  <th className="p-4 text-right w-44">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5">
                                {slotsList.map((slotItem) => {
                                  const matchingTour = toursList.find(t => t.id === slotItem.tourId);
                                  const tourTitle = matchingTour ? matchingTour.title : slotItem.tourId;
                                  const isFull = slotItem.status === 'full';
                                  return (
                                    <tr key={slotItem.id} className="hover:bg-white/[0.01] transition-all">
                                      <td className="p-4 font-bold max-w-xs truncate">{tourTitle}</td>
                                      <td className="p-4 font-mono font-medium">{slotItem.date}</td>
                                      <td className="p-4">
                                        <span className="bg-slate-800 text-slate-200 px-2 py-0.5 rounded-lg border border-white/5 font-mono text-[10px]">
                                          Grup #{slotItem.groupNumber}
                                        </span>
                                      </td>
                                      <td className="p-4">
                                        <div className="flex items-center space-x-2">
                                          <div className="w-16 bg-slate-800 h-2 rounded-full overflow-hidden">
                                            <div 
                                              className={`h-full ${isFull ? 'bg-red-500' : 'bg-emerald-500'}`}
                                              style={{ width: `${Math.min(100, (slotItem.participants / 7) * 100)}%` }}
                                            />
                                          </div>
                                          <span className="font-mono font-bold text-slate-300">
                                            {slotItem.participants}/7
                                          </span>
                                        </div>
                                      </td>
                                      <td className="p-4 font-mono text-emerald-400 font-bold">
                                        IDR {slotItem.pricePerPerson?.toLocaleString()}
                                      </td>
                                      <td className="p-4">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                          isFull 
                                            ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
                                            : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                        }`}>
                                          {slotItem.status}
                                        </span>
                                      </td>
                                      <td className="p-4 text-right">
                                        <div className="flex items-center justify-end space-x-2">
                                          <button
                                            onClick={() => handleToggleSlotStatus(slotItem.id, slotItem.status)}
                                            className={`px-2.5 py-1.5 text-[10px] font-black uppercase rounded-lg border cursor-pointer transition-all ${
                                              isFull 
                                                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20' 
                                                : 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20'
                                            }`}
                                          >
                                            {isFull ? (lang === 'id' ? 'Aktifkan' : 'Reopen') : (lang === 'id' ? 'Tutup' : 'Force Full')}
                                          </button>
                                          
                                          <button
                                            onClick={() => handleViewManifest(slotItem)}
                                            className="px-2.5 py-1.5 text-[10px] font-bold uppercase rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 cursor-pointer"
                                          >
                                            👥 Manifest ({slotItem.bookingIds?.length || 0})
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                                {slotsList.length === 0 && (
                                  <tr>
                                    <td colSpan={7} className="p-12 text-center text-slate-500 italic">
                                      {lang === 'id' ? 'Tidak ada slot rombongan tur aktif di database.' : 'No active group slots matching date rules.'}
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Interactive Manifest Floating/Section Card */}
                        {activeManifestSlot && (
                          <div className="bg-slate-950 border border-[#E87230]/40 rounded-3xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-start justify-between border-b border-white/5 pb-3.5 mb-4">
                              <div>
                                <h3 className="font-black text-base text-white tracking-tight flex items-center gap-2">
                                  <span>👥 {lang === 'id' ? 'Daftar Manifest Pelanggan' : 'Customer Roster Manifest'}</span>
                                  <span className="text-xs font-mono px-2 py-0.5 bg-[#E87230]/20 text-[#E87230] rounded-full">
                                    Grup #{activeManifestSlot.groupNumber}
                                  </span>
                                </h3>
                                <p className="text-xs text-slate-400 mt-1">
                                  {lang === 'id' ? 'Konfirmasi manifest pemesanan terikat grup ini dengan database' : 'Real-time verified traveler entries linked to current slot segment'}
                                </p>
                              </div>
                              <button 
                                onClick={() => setActiveManifestSlot(null)}
                                className="p-1.5 bg-white/5 hover:bg-white/10 text-slate-400 rounded-lg cursor-pointer"
                              >
                                <X size={16} />
                              </button>
                            </div>

                            {loadingManifest ? (
                              <div className="flex items-center justify-center py-8 space-x-2 text-xs text-slate-400">
                                <RefreshCw className="animate-spin text-[#E87230]" size={16} />
                                <span>{lang === 'id' ? 'Memverifikasi manifest grup...' : 'Validating database manifests...'}</span>
                              </div>
                            ) : manifestBookings.length === 0 ? (
                              <p className="text-xs text-center text-slate-500 italic py-6">
                                {lang === 'id' ? 'Belum ada transaksi pembayaran untuk grup ini' : 'No paid traveler transactions linked to this slot.'}
                              </p>
                            ) : (
                              <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs border-collapse">
                                  <thead>
                                    <tr className="bg-slate-900 border-b border-white/5 text-slate-400 font-bold font-mono">
                                      <th className="p-3">Order ID</th>
                                      <th className="p-3">{lang === 'id' ? 'Nama Pelanggan' : 'Full Name'}</th>
                                      <th className="p-3">{lang === 'id' ? 'Kontak' : 'Contact'}</th>
                                      <th className="p-3">Email</th>
                                      <th className="p-3">{lang === 'id' ? 'Jumlah Orang' : 'Travelers'}</th>
                                      <th className="p-3">{lang === 'id' ? 'Pembayaran' : 'Payment Status'}</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-white/5">
                                    {manifestBookings.map((bk) => (
                                      <tr key={bk.id} className="hover:bg-white/[0.01]">
                                        <td className="p-3 font-mono text-[#E87230] font-bold">{bk.orderId}</td>
                                        <td className="p-3 font-bold text-white">{bk.customerName}</td>
                                        <td className="p-3 text-slate-300 font-medium">{bk.customerPhone}</td>
                                        <td className="p-3 text-slate-400 font-mono font-semibold">{bk.customerEmail}</td>
                                        <td className="p-3 font-mono text-center font-black text-indigo-400">{bk.travelers} Pax</td>
                                        <td className="p-3">
                                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                                            bk.paymentStatus === 'settlement' || bk.paymentStatus === 'success'
                                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                                          }`}>
                                            {bk.paymentStatus}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            ) : (
              /* DETAILED VIEW / EDIT FORM PANEL */
              <motion.div 
                key="edit-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-slate-950 border border-white/5 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl max-w-4xl"
              >
                {/* Form header */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-mono px-3 py-1 bg-[#E87230]/10 border border-[#E87230]/20 rounded-full text-[#E87230]">
                      {activeTab} Collection
                    </span>
                    <h2 className="text-lg font-black tracking-tight mt-1">
                      {isAddingNew ? (lang === 'id' ? 'Tambah Item Baru' : 'Create New Document') : (lang === 'id' ? 'Ubah Informasi' : 'Update Document Properties')}
                    </h2>
                  </div>
                  <button 
                    onClick={() => setCurrentEditItem(null)}
                    className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-slate-400"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSaveItem} className="space-y-6">
                  
                  {/* Core Primary Keys */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs text-slate-400 font-bold block">{lang === 'id' ? 'ID Dokumen (Unik/Satu Kata)' : 'Document ID (Unique Token)'}</label>
                      <input 
                        type="text"
                        disabled={!isAddingNew}
                        className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 font-mono text-white focus:border-[#E87230]/40 outline-none disabled:opacity-50"
                        placeholder="e.g. nusa-penida-west"
                        value={currentEditItem.id || ''}
                        onChange={(e) => setCurrentEditItem({ ...currentEditItem, id: e.target.value.toLowerCase().trim() })}
                        required
                      />
                      <p className="text-[10px] text-slate-500 font-mono">
                        {lang === 'id' ? 'Format URL-friendly: huruf kecil, angka, dan strip saja. Contoh: mount-batur-trek' : 'Strict safe key check: alpha-numeric, matching url patterns, immutable once set.'}
                      </p>
                    </div>

                    {/* Name / Title */}
                    <div className="space-y-2">
                      <label className="text-xs text-slate-400 font-bold block">
                        {activeTab === 'tours' ? (lang === 'id' ? 'Judul Paket' : 'Tour Package Title') : (lang === 'id' ? 'Nama Item' : 'Display Name')}
                      </label>
                      <input 
                        type="text"
                        className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 font-bold text-white focus:border-[#E87230]/40 outline-none"
                        placeholder={activeTab === 'tours' ? 'e.g. Mount Batur Sunrise Trek' : 'e.g. Tanjung Benoa Water Sports'}
                        value={activeTab === 'tours' ? (currentEditItem.title || '') : (activeTab === 'vehicles' ? (currentEditItem.vehicle || '') : (currentEditItem.name || ''))}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (activeTab === 'tours') {
                            setCurrentEditItem({ ...currentEditItem, title: val });
                          } else if (activeTab === 'vehicles') {
                            setCurrentEditItem({ ...currentEditItem, vehicle: val });
                          } else {
                            setCurrentEditItem({ ...currentEditItem, name: val });
                          }
                        }}
                        required
                      />
                    </div>
                  </div>

                  {/* TOURS SPECIFIC FIELDS */}
                  {activeTab === 'tours' && (
                    <div className="space-y-6 pt-4 border-t border-white/5">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs text-slate-400 font-bold block">{lang === 'id' ? 'Lokasi' : 'Location'}</label>
                          <input 
                            type="text"
                            className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-white focus:border-[#E87230]/40 outline-none"
                            value={currentEditItem.location || ''}
                            onChange={(e) => setCurrentEditItem({ ...currentEditItem, location: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs text-slate-400 font-bold block">{lang === 'id' ? 'Harga (USD)' : 'Price (USD)'}</label>
                          <input 
                            type="number"
                            className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-white font-mono focus:border-[#E87230]/40 outline-none"
                            value={currentEditItem.price || ''}
                            onChange={(e) => setCurrentEditItem({ ...currentEditItem, price: Number(e.target.value) })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs text-slate-400 font-bold block">{lang === 'id' ? 'Durasi' : 'Duration'}</label>
                          <input 
                            type="text"
                            className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-white focus:border-[#E87230]/40 outline-none"
                            placeholder="e.g. 1 Day, 2 Days 1 Night"
                            value={currentEditItem.duration || ''}
                            onChange={(e) => setCurrentEditItem({ ...currentEditItem, duration: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs text-slate-400 font-bold block">Google Map Lat</label>
                          <input 
                            type="number"
                            step="0.000001"
                            className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-white font-mono focus:border-[#E87230]/40 outline-none"
                            value={currentEditItem.lat || ''}
                            onChange={(e) => setCurrentEditItem({ ...currentEditItem, lat: parseFloat(e.target.value) })}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs text-slate-400 font-bold block">Google Map Lng</label>
                          <input 
                            type="number"
                            step="0.000001"
                            className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-white font-mono focus:border-[#E87230]/40 outline-none"
                            value={currentEditItem.lng || ''}
                            onChange={(e) => setCurrentEditItem({ ...currentEditItem, lng: parseFloat(e.target.value) })}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs text-slate-400 font-bold block">{lang === 'id' ? 'Kategori Pajangan' : 'Grid Category Filter'}</label>
                          <select 
                            className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-white focus:border-[#E87230]/40 outline-none"
                            value={currentEditItem.category || ''}
                            onChange={(e) => setCurrentEditItem({ ...currentEditItem, category: e.target.value })}
                          >
                            <option value="Sightseeing">Sightseeing</option>
                            <option value="Adventure">Adventure</option>
                            <option value="Culture">Culture</option>
                            <option value="Water Sports">Water Sports</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs text-slate-400 font-bold block">Image Asset URL</label>
                          <input 
                            type="url"
                            className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-white focus:border-[#E87230]/40 outline-none font-mono text-xs"
                            placeholder="https://..."
                            value={currentEditItem.image || ''}
                            onChange={(e) => setCurrentEditItem({ ...currentEditItem, image: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs text-slate-400 font-bold block">{lang === 'id' ? 'Ulasan Bintang / Rating' : 'Tour Status Rating'}</label>
                          <div className="grid grid-cols-2 gap-4">
                            <input 
                              type="number"
                              step="0.1"
                              max="5"
                              min="1"
                              className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-white font-mono focus:border-[#E87230]/40 outline-none"
                              placeholder="Rating e.g. 4.9"
                              value={currentEditItem.rating || ''}
                              onChange={(e) => setCurrentEditItem({ ...currentEditItem, rating: Number(e.target.value) })}
                            />
                            <input 
                              type="number"
                              className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-white font-mono focus:border-[#E87230]/40 outline-none"
                              placeholder="Reviews count"
                              value={currentEditItem.reviews || ''}
                              onChange={(e) => setCurrentEditItem({ ...currentEditItem, reviews: Number(e.target.value) })}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs text-slate-400 font-bold block">{lang === 'id' ? 'Deskripsi Ringkas' : 'Brief Highlight Description'}</label>
                        <textarea 
                          className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-white focus:border-[#E87230]/40 outline-none h-28"
                          placeholder="Describe this tour package details..."
                          value={currentEditItem.description || ''}
                          onChange={(e) => setCurrentEditItem({ ...currentEditItem, description: e.target.value })}
                        />
                      </div>

                      {/* Itinerary, Excluded, Included Inputs */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs text-slate-400 block font-bold">
                            Itinerary <span className="text-[10px] text-slate-500 font-normal">(One detail per line)</span>
                          </label>
                          <textarea 
                            className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 font-mono text-xs text-white focus:border-[#E87230]/40 outline-none h-40"
                            placeholder="08:00 - Hotel Pick-up&#10;09:30 - Water Sports activity&#10;13:00 - Lunch"
                            value={tempItinerary}
                            onChange={(e) => setTempItinerary(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs text-slate-400 block font-bold">
                            {lang === 'id' ? 'Sudah Termasuk' : 'What is Included'} <span className="text-[10px] text-slate-500 font-normal">(One detail per line)</span>
                          </label>
                          <textarea 
                            className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 font-mono text-xs text-white focus:border-[#E87230]/40 outline-none h-40"
                            placeholder="High quality hotel return transport&#10;Safety equipment&#10;Friendly Driver"
                            value={tempIncluded}
                            onChange={(e) => setTempIncluded(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs text-slate-400 block font-bold">
                            {lang === 'id' ? 'Belum Termasuk' : 'What is Excluded'} <span className="text-[10px] text-slate-500 font-normal">(One detail per line)</span>
                          </label>
                          <textarea 
                            className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 font-mono text-xs text-white focus:border-[#E87230]/40 outline-none h-40"
                            placeholder="Personal expenses&#10;Photos and video footage&#10;Tips for guide"
                            value={tempExcluded}
                            onChange={(e) => setTempExcluded(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ACTIVITIES SPECIFIC FIELDS */}
                  {activeTab === 'activities' && (
                    <div className="space-y-6 pt-4 border-t border-white/5">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs text-slate-400 font-bold block">{lang === 'id' ? 'Kategori Aktivitas' : 'Activity Category'}</label>
                          <select 
                            className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-white focus:border-[#E87230]/40 outline-none"
                            value={currentEditItem.category || ''}
                            onChange={(e) => setCurrentEditItem({ ...currentEditItem, category: e.target.value })}
                          >
                            <option value="Adventure">Adventure</option>
                            <option value="Water Sports">Water Sports</option>
                            <option value="Leisure">Leisure</option>
                            <option value="Sightseeing">Sightseeing</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs text-slate-400 font-bold block">{lang === 'id' ? 'Harga Minimum (IDR)' : 'Min Price (IDR)'}</label>
                          <input 
                            type="number"
                            className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-white font-mono focus:border-[#E87230]/40 outline-none"
                            value={currentEditItem.price_min_idr || ''}
                            onChange={(e) => setCurrentEditItem({ ...currentEditItem, price_min_idr: Number(e.target.value) })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs text-slate-400 font-bold block">{lang === 'id' ? 'Harga Maksimum (IDR)' : 'Max Price (IDR)'}</label>
                          <input 
                            type="number"
                            className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-white font-mono focus:border-[#E87230]/40 outline-none"
                            value={currentEditItem.price_max_idr || ''}
                            onChange={(e) => setCurrentEditItem({ ...currentEditItem, price_max_idr: Number(e.target.value) })}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs text-slate-400 font-bold block">{lang === 'id' ? 'Durasi Paket' : 'Package Duration'}</label>
                          <input 
                            type="text"
                            className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-white focus:border-[#E87230]/40 outline-none"
                            placeholder="e.g. 2 Hours, 1 Hour"
                            value={currentEditItem.duration || ''}
                            onChange={(e) => setCurrentEditItem({ ...currentEditItem, duration: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs text-slate-400 font-bold block">{lang === 'id' ? 'Vendor Operator' : 'Operator Vendor'}</label>
                          <input 
                            type="text"
                            className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-white focus:border-[#E87230]/40 outline-none"
                            value={currentEditItem.vendor || ''}
                            onChange={(e) => setCurrentEditItem({ ...currentEditItem, vendor: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs text-slate-400 font-bold block">{lang === 'id' ? 'Status Aktivitas' : 'Operating Status'}</label>
                          <select 
                            className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-white focus:border-[#E87230]/40 outline-none"
                            value={currentEditItem.status || ''}
                            onChange={(e) => setCurrentEditItem({ ...currentEditItem, status: e.target.value })}
                          >
                            <option value="Active">Active</option>
                            <option value="Maintenance">Maintenance</option>
                            <option value="Inactive">Inactive</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs text-slate-400 font-bold block">Image Header URL</label>
                          <input 
                            type="url"
                            className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-white font-mono text-xs focus:border-[#E87230]/40 outline-none"
                            placeholder="https://..."
                            value={currentEditItem.image || ''}
                            onChange={(e) => setCurrentEditItem({ ...currentEditItem, image: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs text-slate-400 font-bold block">Operating Hours</label>
                          <input 
                            type="text"
                            className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-white focus:border-[#E87230]/40 outline-none"
                            placeholder="e.g. 08:30 - 17:00"
                            value={currentEditItem.operating_hours || ''}
                            onChange={(e) => setCurrentEditItem({ ...currentEditItem, operating_hours: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs text-slate-400 font-bold block">{lang === 'id' ? 'Deskripsi Ringkas' : 'Brief Activity Description'}</label>
                        <textarea 
                          className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-white focus:border-[#E87230]/40 outline-none h-24"
                          placeholder="Describe water sports, swings, or rafting details..."
                          value={currentEditItem.description || ''}
                          onChange={(e) => setCurrentEditItem({ ...currentEditItem, description: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {/* DESTINATIONS SPECIFIC FIELDS */}
                  {activeTab === 'destinations' && (
                    <div className="space-y-6 pt-4 border-t border-white/5">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs text-slate-400 font-bold block">{lang === 'id' ? 'Kategori Tempat' : 'Geography Category'}</label>
                          <select 
                            className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-white focus:border-[#E87230]/40 outline-none"
                            value={currentEditItem.category || ''}
                            onChange={(e) => setCurrentEditItem({ ...currentEditItem, category: e.target.value })}
                          >
                            <option value="Beach">Beach</option>
                            <option value="Waterfall">Waterfall</option>
                            <option value="Temple">Temple</option>
                            <option value="Club">Beach Club</option>
                            <option value="Activity">Activity Spot</option>
                            <option value="Sightseeing">Sightseeing</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs text-slate-400 font-bold block">{lang === 'id' ? 'Harga Tiket Masuk (IDR)' : 'Entrance Fee (IDR)'}</label>
                          <input 
                            type="number"
                            disabled={currentEditItem.is_free}
                            className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-white font-mono focus:border-[#E87230]/40 outline-none disabled:opacity-50"
                            value={currentEditItem.entrance_fee_idr || ''}
                            onChange={(e) => setCurrentEditItem({ ...currentEditItem, entrance_fee_idr: Number(e.target.value) })}
                          />
                        </div>
                        <div className="space-y-2 pt-8">
                          <label className="flex items-center space-x-3 cursor-pointer select-none">
                            <input 
                              type="checkbox"
                              className="w-5 h-5 rounded border-white/10 accent-[#E87230] bg-slate-900"
                              checked={currentEditItem.is_free || false}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setCurrentEditItem({ 
                                  ...currentEditItem, 
                                  is_free: checked,
                                  entrance_fee_idr: checked ? 0 : currentEditItem.entrance_fee_idr
                                });
                              }}
                            />
                            <span className="text-sm font-bold">{lang === 'id' ? 'Bebas Tiket Masuk (Gratis)' : 'Free Entrance/No Fee'}</span>
                          </label>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs text-slate-400 font-bold block">Image Showcase URL</label>
                          <input 
                            type="url"
                            className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-white font-mono text-xs focus:border-[#E87230]/40 outline-none"
                            placeholder="https://..."
                            value={currentEditItem.imageUrl || ''}
                            onChange={(e) => setCurrentEditItem({ ...currentEditItem, imageUrl: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs text-slate-400 font-bold block">Google Map URL</label>
                          <input 
                            type="url"
                            className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-white font-mono text-xs focus:border-[#E87230]/40 outline-none"
                            placeholder="https://maps.google.com/..."
                            value={currentEditItem.googleMapsUrl || ''}
                            onChange={(e) => setCurrentEditItem({ ...currentEditItem, googleMapsUrl: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs text-slate-400 font-bold block">{lang === 'id' ? 'Status Penanda' : 'Display Status'}</label>
                          <select 
                            className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-white focus:border-[#E87230]/40 outline-none"
                            value={currentEditItem.status || ''}
                            onChange={(e) => setCurrentEditItem({ ...currentEditItem, status: e.target.value })}
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs text-slate-400 block font-bold">
                            {lang === 'id' ? 'Area Geografis' : 'Geographical Areas'} <span className="text-[10px] text-slate-500 font-normal">(One per line)</span>
                          </label>
                          <textarea 
                            className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 font-mono text-xs text-white focus:border-[#E87230]/40 outline-none h-20"
                            placeholder="Uluwatu&#10;South Bali&#10;Beachfront"
                            value={tempAreas}
                            onChange={(e) => setTempAreas(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs text-slate-400 font-bold block">{lang === 'id' ? 'Deskripsi Ringkas' : 'Brief Historical Description'}</label>
                        <textarea 
                          className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-white focus:border-[#E87230]/40 outline-none h-24"
                          placeholder="Describe sunset view, temple rules, beach clubs..."
                          value={currentEditItem.description || ''}
                          onChange={(e) => setCurrentEditItem({ ...currentEditItem, description: e.target.value })}
                        />
                      </div>
                    </div>
                  )}

                  {/* VEHICLES SPECIFIC FIELDS */}
                  {activeTab === 'vehicles' && (
                    <div className="space-y-6 pt-4 border-t border-white/5">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs text-slate-400 font-bold block">{lang === 'id' ? 'Tipe Mobil' : 'Vehicle Type (Standard/VIP)'}</label>
                          <input 
                            type="text"
                            className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-white focus:border-[#E87230]/40 outline-none"
                            placeholder="Standard, luxury minibuses, etc"
                            value={currentEditItem.type || ''}
                            onChange={(e) => setCurrentEditItem({ ...currentEditItem, type: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs text-slate-400 font-bold block">{lang === 'id' ? 'Jumlah Seat' : 'Passenger Seats'}</label>
                          <input 
                            type="number"
                            className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-white font-mono focus:border-[#E87230]/40 outline-none"
                            value={currentEditItem.seats || ''}
                            onChange={(e) => setCurrentEditItem({ ...currentEditItem, seats: Number(e.target.value) })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs text-slate-400 font-bold block">{lang === 'id' ? 'Tarif Sewa Sopir/BBM (IDR)' : 'Rate Seated with Driver (IDR)'}</label>
                          <input 
                            type="number"
                            className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-white font-mono focus:border-[#E87230]/40 outline-none"
                            value={currentEditItem.rate_with_driver_idr || ''}
                            onChange={(e) => setCurrentEditItem({ ...currentEditItem, rate_with_driver_idr: Number(e.target.value) })}
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs text-slate-400 font-bold block">{lang === 'id' ? 'Tarif Transfer One-Way (IDR)' : 'Oneway Shuttle Rate (IDR)'}</label>
                          <input 
                            type="number"
                            className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-white font-mono focus:border-[#E87230]/40 outline-none"
                            value={currentEditItem.rate_oneway_idr || ''}
                            onChange={(e) => setCurrentEditItem({ ...currentEditItem, rate_oneway_idr: Number(e.target.value) })}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs text-slate-400 font-bold block">Service Provider / Driver Vendor</label>
                          <input 
                            type="text"
                            className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-white focus:border-[#E87230]/40 outline-none"
                            value={currentEditItem.vendor || ''}
                            onChange={(e) => setCurrentEditItem({ ...currentEditItem, vendor: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs text-slate-400 font-bold block">Vendor Phone Line</label>
                          <input 
                            type="text"
                            className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-white focus:border-[#E87230]/40 outline-none"
                            placeholder="+62 8..."
                            value={currentEditItem.contact_number || ''}
                            onChange={(e) => setCurrentEditItem({ ...currentEditItem, contact_number: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs text-slate-400 font-bold block">{lang === 'id' ? 'Status Armada' : 'Current Status'}</label>
                          <select 
                            className="w-full bg-slate-900 border border-white/10 rounded-2xl p-4 text-white focus:border-[#E87230]/40 outline-none"
                            value={currentEditItem.status || ''}
                            onChange={(e) => setCurrentEditItem({ ...currentEditItem, status: e.target.value })}
                          >
                            <option value="Available">Available</option>
                            <option value="Fully Booked">Fully Booked</option>
                            <option value="Service">Service / Inoperative</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-6 border-t border-white/5 flex items-center justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setCurrentEditItem(null)}
                      className="py-3 px-6 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold font-sans text-xs transition-colors"
                    >
                      {lang === 'id' ? 'Batal' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className="py-3 px-6 bg-[#E87230] hover:bg-[#ff8643] text-white font-black rounded-2xl text-xs flex items-center justify-center space-x-2 transition-all hover:shadow-lg hover:shadow-[#E87230]/10"
                    >
                      <Save size={16} />
                      <span>{lang === 'id' ? 'Simpan Perubahan' : 'Update Database'}</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

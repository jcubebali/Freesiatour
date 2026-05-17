/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  MapPin, 
  Star, 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  Bell, 
  User, 
  Home, 
  Compass, 
  Heart, 
  Settings,
  Phone,
  Info,
  ArrowRight,
  Clock,
  Sun,
  Moon,
  Loader2,
  Instagram,
  Facebook,
  QrCode,
  History,
  CheckCircle2,
  XCircle,
  Calculator,
  Users,
  ChevronDown,
  ShoppingBag,
  Menu,
  MessageCircle,
  Mail,
  LayoutGrid,
  Bus,
  Map as MapIcon,
  X,
  Navigation
} from 'lucide-react';
import { DESTINATIONS, Tour } from './constants';
import { APIProvider, Map, useMap, useMapsLibrary, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import BaliQuoteApp from './baliquotepro/App';
import { fetchTours, fetchActivities, Activity } from './services/firebaseService';
import { ACTIVITIES, VEHICLES_DATA } from './calculatorData';

const MAP_API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY ||
  '';
const hasValidMapKey = Boolean(MAP_API_KEY) && MAP_API_KEY !== 'YOUR_API_KEY';

const USD_TO_IDR = 16000;

type Currency = 'USD' | 'IDR';

function PriceDisplay({ priceUsd, priceIdr, currency }: { priceUsd?: number; priceIdr?: number; currency: Currency }) {
  if (currency === 'IDR') {
    const finalIdr = priceIdr || (priceUsd ? priceUsd * USD_TO_IDR : 0);
    return <span>IDR {Math.round(finalIdr).toLocaleString('id-ID')}</span>;
  }
  const finalUsd = priceUsd || (priceIdr ? priceIdr / USD_TO_IDR : 0);
  return <span>${Math.round(finalUsd).toLocaleString('en-US')}</span>;
}

type Screen = 'splash' | 'home' | 'details' | 'booking' | 'about' | 'map' | 'faq' | 'terms' | 'privacy' | 'qr' | 'history' | 'profile' | 'category' | 'calculator';
type SearchTab = 'shuttle' | 'tours' | 'activity';

function TourCard({ tour, onClick, lang, currency }: { tour: Tour; onClick: (t: Tour) => void; lang: 'en' | 'id'; currency: Currency; key?: React.Key }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onClick(tour)}
      className="bg-white dark:bg-slate-800 rounded-3xl p-3 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center space-x-4 cursor-pointer hover:shadow-md transition-shadow group overflow-hidden"
    >
      <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0">
        <img src={tour.image} alt={tour.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" referrerPolicy="no-referrer" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="font-bold text-hitam-pekat dark:text-white text-sm leading-tight">{tour.title}</h4>
          <div className="text-[#E87230] font-bold text-sm shrink-0">
            <PriceDisplay priceUsd={tour.price} currency={currency} />
          </div>
        </div>
        <div className="flex items-center text-abu-abu dark:text-slate-400 text-[10px] mb-2">
          <MapPin size={10} className="mr-1" />
          {tour.location}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-oren-prosess text-[10px] font-bold">
            <Star size={10} fill="currentColor" className="mr-1" />
            {tour.rating}
            <span className="text-abu-abu dark:text-slate-500 font-normal ml-1">({tour.reviews})</span>
          </div>
          <div className="text-[10px] text-abu-abu dark:text-slate-500 font-medium">
            {tour.duration}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ActivityCard({ activity, lang, onBook, currency }: { activity: Activity; lang: 'en' | 'id'; onBook: (activity: Activity) => void; currency: Currency; key?: React.Key }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative overflow-hidden rounded-[2rem] border border-slate-100 dark:border-slate-800 transition-all hover:shadow-xl h-48 cursor-pointer"
      onClick={() => onBook(activity)}
    >
      <div className="absolute inset-0 z-20 flex flex-col justify-end p-5">
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent z-10" />
        
        {/* Background Image */}
        {activity.image ? (
          <img 
            src={activity.image} 
            alt={activity.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="absolute inset-0 bg-ungu-muda/30 backdrop-blur-sm transition-transform duration-500 group-hover:scale-110 flex items-center justify-center">
            <Compass size={48} className="text-white/20" />
          </div>
        )}

        {/* Content */}
        <div className="relative z-20 text-white">
          <div className="flex justify-between items-start gap-2">
            <div className="min-w-0">
              <div className="text-[10px] bg-ungu-pekat/80 backdrop-blur-md text-white px-2 py-0.5 rounded-full inline-block mb-1 font-bold uppercase tracking-wider">
                {activity.category || (lang === 'en' ? 'Activity' : 'Aktivitas')}
              </div>
              <h4 className="font-black text-lg leading-tight drop-shadow-md">{activity.name}</h4>
              {activity.duration && (
                <div className="flex items-center text-[10px] font-medium mt-1 text-white/80">
                  <Clock size={10} className="mr-1" />
                  {activity.duration}
                </div>
              )}
            </div>
            <div className="text-right shrink-0">
              <div className="text-xl font-black text-white drop-shadow-md">
                <PriceDisplay 
                  priceUsd={activity.price} 
                  priceIdr={activity.price_max_idr} 
                  currency={currency} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const SHUTTLE_FARES = {
  baseFare: 10000,
  minFare: 10000,
  costPerMin: 1000,
  costPerKm: 10000,
};

const parseDistance = (distStr: string) => parseFloat(distStr.replace(/[^\d.]/g, '')) || 0;
const parseDuration = (durStr: string) => {
  let minutes = 0;
  const hourMatch = durStr.match(/(\d+)\s*hour/);
  const minMatch = durStr.match(/(\d+)\s*min/);
  if (hourMatch) minutes += parseInt(hourMatch[1]) * 60;
  if (minMatch) minutes += parseInt(minMatch[1]);
  return minutes || parseFloat(durStr) || 0;
};

const calculateShuttlePrice = (distanceStr: string, durationStr: string, multiplier: number = 1) => {
  const distance = parseDistance(distanceStr);
  const duration = parseDuration(durationStr);
  let totalIdr = SHUTTLE_FARES.baseFare + (duration * SHUTTLE_FARES.costPerMin) + (distance * SHUTTLE_FARES.costPerKm);
  return Math.max(totalIdr, SHUTTLE_FARES.minFare) * multiplier;
};

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [pickupQuery, setPickupQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [searchTab, setSearchTab] = useState<SearchTab>('shuttle');
  const [tours, setTours] = useState<Tour[]>(DESTINATIONS);
  const [activities, setActivities] = useState<Activity[]>(ACTIVITIES);
  const [activityFilter, setActivityFilter] = useState<string>('All');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });
  const [lang, setLang] = useState<'en' | 'id'>('en');
  const [currency, setCurrency] = useState<'USD' | 'IDR'>('USD');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [screen]);

  useEffect(() => {
    const loadData = async () => {
      const fetchedTours = await fetchTours();
      if (fetchedTours.length > 0) setTours(fetchedTours);
      
      const fetchedActivities = await fetchActivities();
      if (fetchedActivities.length > 0) {
        setActivities(prev => {
          const combined = [...prev];
          fetchedActivities.forEach(f => {
            if (!combined.find(c => c.id === f.id)) {
              combined.push(f);
            }
          });
          return combined;
        });
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const handleTourClick = (tour: Tour) => {
    setSelectedTour(tour);
    setScreen('details');
  };

  const filteredDestinations = tours.filter(d => {
    // Filter by category if not 'All'
    if (activityFilter !== 'All' && d.category !== activityFilter) return false;

    const q = searchQuery.toLowerCase();
    return d.title.toLowerCase().includes(q) ||
      d.location.toLowerCase().includes(q) ||
      d.description.toLowerCase().includes(q) ||
      d.itinerary.some(step => step.toLowerCase().includes(q));
  });

  const filteredActivities = activities.filter(a => {
    // Only show activities, exclude addons
    if (a.type === 'addon') return false;
    
    // Filter by category if not 'All'
    if (activityFilter !== 'All' && a.category !== activityFilter) return false;

    const q = searchQuery.toLowerCase();
    return a.name.toLowerCase().includes(q) ||
      (a.category && a.category.toLowerCase().includes(q));
  });

  const handleContinue = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setScreen('home');
    }, 1500);
  };

  if (screen === 'calculator') {
    return <BaliQuoteApp lang={lang} currency={currency} onClose={() => setScreen('home')} />;
  }

  const tourCategories = (tours || []).map(t => t.category).filter(Boolean) as string[];
  const activityCategories = (activities || []).filter(a => a.type !== 'addon').map(a => a.category).filter(Boolean) as string[];
  const categories = ['All', ...Array.from(new Set([...tourCategories, ...activityCategories]))];

  return (
    <APIProvider apiKey={MAP_API_KEY} version="weekly">
      <div className="min-h-screen bg-white dark:bg-slate-900 border-none relative overflow-x-hidden transition-colors duration-300 flex flex-col w-full">
        {!hasValidMapKey && screen === 'home' && (
          <div className="fixed inset-0 z-[200] bg-white dark:bg-slate-900 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md w-full group relative bg-[#0F172A] rounded-[3rem] overflow-hidden shadow-2xl border-2 border-pink-500/20"
            >
              {/* Background Glows */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-pink-500/10 via-transparent to-transparent opacity-40" />
              <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-pink-500/10 blur-[60px] rounded-full" />

              <div className="relative z-10 p-8 sm:p-10 flex flex-col min-h-[460px] justify-between">
                <div>
                   <div className="w-full flex justify-between items-start mb-8">
                      <div className="flex -space-x-1.5">
                         {[1,2,3].map(i => (
                           <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0F172A] bg-slate-800 overflow-hidden shadow-lg">
                              <img src={`https://i.pravatar.cc/100?img=${i+20}`} className="w-full h-full object-cover" alt="user" />
                           </div>
                         ))}
                         <div className="w-8 h-8 rounded-full border-2 border-[#0F172A] bg-pink-600 flex items-center justify-center text-[10px] font-bold text-white shadow-lg">+1k</div>
                      </div>
                      <div className="w-14 h-14 bg-white rounded-2xl shadow-xl flex items-center justify-center text-[#0F172A] rotate-3">
                         <MapPin size={28} strokeWidth={2.5} />
                      </div>
                   </div>

                   <div className="space-y-2">
                      <h3 className="font-display font-black text-3xl text-white leading-tight">
                         <span className="block text-white/40 text-xs font-bold uppercase tracking-[0.3em] mb-2">
                           {lang === 'en' ? 'Maps API Required' : 'API Map Diperlukan'}
                         </span>
                         <span className="text-pink-500">Google Maps</span><br />
                         Configuration
                      </h3>
                      <p className="text-xs text-slate-400 font-medium opacity-80 leading-relaxed max-w-[280px]">
                        {lang === 'en' 
                          ? 'To enable transport features and location search, please add your Google Maps API key as a secret named'
                          : 'Untuk mengaktifkan transportasi dan pencarian, tambahkan API key Anda sebagai secret'}
                        <span className="text-white font-black block mt-1 tracking-wider">GOOGLE_MAPS_PLATFORM_KEY</span>
                      </p>
                   </div>

                   <div className="mt-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                         <div className="w-1 h-3 bg-pink-500 rounded-full" />
                         {lang === 'en' ? 'Add these to "Selected APIs":' : 'Tambahkan ke "Selected APIs":'}
                      </p>
                      <div className="grid grid-cols-1 gap-2">
                        {['Maps JavaScript API', 'Places API', 'Routes API'].map(api => (
                          <div key={api} className="flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-pink-500" />
                            <span className="text-[11px] font-bold text-white tracking-tight">{api}</span>
                          </div>
                        ))}
                      </div>
                   </div>
                </div>

                <div className="space-y-4 pt-8 border-t border-white/5">
                  <a 
                    href="https://console.cloud.google.com/google/maps-apis/api-list" 
                    target="_blank" 
                    rel="noopener" 
                    className="flex h-14 bg-pink-600 hover:bg-pink-500 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-lg shadow-pink-600/20 active:scale-95 transition-all items-center justify-center gap-2"
                  >
                    <span>{lang === 'en' ? 'Open Console' : 'Buka Konsol'}</span>
                    <ArrowRight size={18} />
                  </a>
                  <button 
                    onClick={() => setScreen('home')} 
                    className="w-full text-white/40 hover:text-pink-500 font-bold text-[10px] uppercase tracking-[0.2em] transition-colors py-2"
                  >
                    {lang === 'en' ? 'Continue without map' : 'Lanjut tanpa peta'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
        <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div 
            key="loading-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm"
          >
            <LoadingSpinner size={48} className="text-pink-pekat" />
          </motion.div>
        )}

        {screen === 'splash' && (
          <SplashScreen onContinue={handleContinue} />
        )}

        {screen === 'home' && (
          <HomeScreen 
            onTourClick={handleTourClick}
            onActivityBook={(tour) => {
              setSelectedTour(tour);
              setScreen('booking');
            }}
            onCategoryClick={(cat) => {
              setSelectedCategory(cat);
              setScreen('category');
            }}
            onCalculatorClick={() => setScreen('calculator')}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            pickupQuery={pickupQuery}
            setPickupQuery={setPickupQuery}
            showResults={showResults}
            setShowResults={setShowResults}
            searchTab={searchTab}
            setSearchTab={setSearchTab}
            destinations={filteredDestinations}
            activities={filteredActivities}
            activityFilter={activityFilter}
            setActivityFilter={setActivityFilter}
            availableCategories={categories}
            isDarkMode={isDarkMode}
            toggleDarkMode={toggleDarkMode}
            onAboutClick={() => setScreen('about')}
            onFaqClick={() => setScreen('faq')}
            onTermsClick={() => setScreen('terms')}
            onPrivacyClick={() => setScreen('privacy')}
            lang={lang}
            toggleLang={() => setLang(lang === 'en' ? 'id' : 'en')}
            currency={currency}
            setCurrency={setCurrency}
            onShowSidebar={() => setShowSidebar(true)}
          />
        )}

        {screen === 'category' && (
          <CategoryScreen 
            category={selectedCategory}
            onBack={() => setScreen('home')}
            onTourClick={handleTourClick}
            lang={lang}
            currency={currency}
          />
        )}

        {screen === 'details' && selectedTour && (
          <DetailsScreen 
            tour={selectedTour} 
            onBack={() => setScreen('home')} 
            onBook={() => setScreen('booking')}
            currency={currency}
          />
        )}

        {screen === 'booking' && selectedTour && (
          <BookingScreen 
            tour={selectedTour} 
            onBack={() => {
              // If it's a shuttle, go back to home instead of details
              if (selectedTour.id.toString().startsWith('shuttle-')) {
                setScreen('home');
                setSearchTab('shuttle');
              } else if (selectedTour.id === 'calculator-quote') {
                setScreen('home');
              } else {
                setScreen('home'); // Default to home for activities too as requested
              }
            }} 
            onSuccess={() => setScreen('home')}
            onTermsClick={() => setScreen('terms')}
            currency={currency}
            lang={lang}
          />
        )}

        {screen === 'about' && (
          <AboutScreen 
            onBack={() => setScreen('home')} 
          />
        )}

        {screen === 'faq' && (
          <FaqScreen onBack={() => setScreen('home')} lang={lang} />
        )}

        {screen === 'terms' && (
          <TermsScreen onBack={() => setScreen('home')} lang={lang} />
        )}

        {screen === 'privacy' && (
          <PrivacyScreen onBack={() => setScreen('home')} lang={lang} />
        )}

        {screen === 'qr' && (
          <QrScreen onBack={() => setScreen('home')} />
        )}

        {screen === 'history' && (
          <HistoryScreen onBack={() => setScreen('home')} currency={currency} />
        )}

        {screen === 'profile' && (
          <ProfileScreen onBack={() => setScreen('home')} />
        )}

        {screen === 'map' && (
          <MapScreen 
            onTourClick={handleTourClick}
            currency={currency}
          />
        )}

      </AnimatePresence>

      <AnimatePresence>
        {showSidebar && (
          <>
            {/* Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSidebar(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] cursor-pointer"
            />
            {/* Sidebar Panel */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[80%] max-w-sm bg-white dark:bg-slate-900 z-[70] shadow-2xl flex flex-col"
            >
              <div className="p-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 md:w-9 md:h-9 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center shadow-lg overflow-hidden border border-slate-50 dark:border-slate-700">
                    <img 
                      src="https://res.cloudinary.com/dbckdslrw/image/upload/v1771789006/freesiatour_logo.png" 
                      alt="Freesiatour Logo" 
                      className="w-full h-full object-contain p-1"
                      referrerPolicy="no-referrer"
                    />
                  </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-sm text-slate-800 dark:text-white leading-none">Freesiatour</span>
            <span className="text-[6px] font-bold text-[#E87230]/80 tracking-[0.05em] uppercase mt-0.5">Holiday is friendly</span>
          </div>
                </div>
                <button 
                  onClick={() => setShowSidebar(false)}
                  className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-2">
                {[
                  { id: 'home', icon: Home, label: lang === 'id' ? 'Beranda' : 'Home' },
                  { id: 'map', icon: Compass, label: lang === 'id' ? 'Eksplor' : 'Explore' },
                  { id: 'qr', icon: QrCode, label: 'QR Code' },
                  { id: 'history', icon: History, label: lang === 'id' ? 'Riwayat' : 'History' },
                  { id: 'profile', icon: User, label: lang === 'id' ? 'Profil' : 'Profile' }
                ].map((item) => {
                  const isActive = screen === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setScreen(item.id as Screen);
                        setShowSidebar(false);
                      }}
                      className={`w-full flex items-center space-x-4 p-4 rounded-2xl transition-all ${
                        isActive 
                          ? 'bg-[#E87230]/10 text-[#E87230]' 
                          : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                      <span className="font-bold">{item.label}</span>
                      {isActive && <div className="ml-auto w-1.5 h-1.5 bg-[#E87230] rounded-full" />}
                    </button>
                  );
                })}
              </div>
              
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                 <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-500">{lang === 'id' ? 'Tema Gelap' : 'Dark Mode'}</span>
                    <button 
                      onClick={toggleDarkMode}
                      className={`w-12 h-6 rounded-full relative transition-colors ${isDarkMode ? 'bg-[#E87230]' : 'bg-slate-200'}`}
                    >
                      <motion.div 
                        animate={{ x: isDarkMode ? 24 : 4 }}
                        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
                      />
                    </button>
                 </div>
                 <button 
                  onClick={() => {
                    setLang(lang === 'id' ? 'en' : 'id');
                    setShowSidebar(false);
                  }}
                  className="w-full py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm"
                 >
                   {lang === 'id' ? 'Switch to English' : 'Ubah ke Bahasa Indonesia'}
                 </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
    </APIProvider>
  );
}

function LoadingSpinner({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <Loader2 
      size={size} 
      className={`animate-spin ${className}`} 
    />
  );
}

function SplashScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col p-8 bg-white dark:bg-slate-900"
    >
      <div className="flex justify-end">
        <button onClick={onContinue} className="text-slate-400 dark:text-slate-500 font-medium">Skip</button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
        <div className="relative w-48 h-48 mb-8">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="absolute inset-0 bg-ungu-muda rounded-full"
          />
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="relative z-10 flex flex-col items-center"
          >
             <div className="w-32 h-32 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-xl mb-4 overflow-hidden">
                <img 
                  src="https://res.cloudinary.com/dbckdslrw/image/upload/v1771789006/freesiatour_logo.png" 
                  alt="Freesiatour Logo" 
                  className="w-full h-full object-contain p-4"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                />
             </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <img 
              src="https://res.cloudinary.com/dbckdslrw/image/upload/v1771789006/freesiatour_logo.png" 
              alt="" 
              className="w-10 h-10 object-contain"
            />
            <div className="flex flex-col text-left">
              <h1 className="text-2xl font-display font-bold text-slate-900 dark:text-white leading-[0.8]">Freesiatour</h1>
              <p className="text-[8px] font-bold text-[#E87230] tracking-[0.22em] uppercase mt-0.5 ml-0.5">Holiday is friendly</p>
            </div>
          </div>
          <p className="text-hitam-pekat dark:text-slate-300 mt-4 text-body-2">
            Discover hidden gems and track every step of your journey with ease across Indonesia.
          </p>
        </motion.div>
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="space-y-4"
      >
        <button 
          onClick={onContinue}
          className="btn-primary w-full"
        >
          Login
        </button>
        <button 
          onClick={onContinue}
          className="btn-secondary w-full"
        >
          Sign up
        </button>
      </motion.div>
    </motion.div>
  );
}

function TypewriterText({ words }: { words: string[] }) {
  const [index, setIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(150);

  useEffect(() => {
    const handleTyping = () => {
      const currentWord = words[index];
      if (isDeleting) {
        setDisplayText(prev => prev.slice(0, -1));
        setTypingSpeed(100);
      } else {
        setDisplayText(currentWord.slice(0, displayText.length + 1));
        setTypingSpeed(150);
      }

      if (!isDeleting && displayText === currentWord) {
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && displayText === '') {
        setIsDeleting(false);
        setIndex((prev) => (prev + 1) % words.length);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [displayText, isDeleting, index, words, typingSpeed]);

  return (
    <span className="text-[#E87230] min-w-[20px]">
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  );
}

function RouteDisplay({ pickup, destination, onRouteData }: { pickup: string, destination: string, onRouteData?: (data: { distance: string, duration: string }) => void }) {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  useEffect(() => {
    if (!routesLib?.Route || !map || !pickup || !destination) return;

    // Clear previous route
    polylinesRef.current.forEach(p => p.setMap(null));
    polylinesRef.current = [];

    routesLib.Route.computeRoutes({
      origin: pickup,
      destination: destination,
      travelMode: 'DRIVING' as any,
      fields: ['path', 'distanceMeters', 'durationMillis', 'viewport']
    }).then(({ routes }) => {
      if (routes?.[0]) {
        const route = routes[0];
        const newPolylines = route.createPolylines();
        
        newPolylines.forEach(p => {
          p.setOptions({
            strokeColor: '#E87230',
            strokeWeight: 6,
            strokeOpacity: 0.8,
            map: map
          });
        });
        polylinesRef.current = newPolylines;

        if (route.viewport) {
          map.fitBounds(route.viewport);
        }

        if (onRouteData) {
          const distanceKm = (route.distanceMeters || 0) / 1000;
          const durationMin = Math.round((route.durationMillis || 0) / 60000);
          onRouteData({
            distance: `${distanceKm.toFixed(1)} km`,
            duration: `${durationMin} min`
          });
        }
      }
    }).catch(err => {
      console.error('Route calculation failed:', err);
    });

    return () => {
      polylinesRef.current.forEach(p => p.setMap(null));
    };
  }, [routesLib, map, pickup, destination, onRouteData]);

  return null;
}

function ShuttleMap({ pickup, destination, lang, onRouteData }: { pickup: string, destination: string, lang: 'en' | 'id', onRouteData?: (data: { distance: string, duration: string }) => void }) {
  // Default center (Bali)
  const center = { lat: -8.4095, lng: 115.1889 };

  if (!hasValidMapKey) return <div className="w-full h-48 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse flex items-center justify-center text-slate-400 text-xs font-bold uppercase tracking-widest">{lang === 'en' ? 'Map Key Required' : 'Butuh API Key Peta...'}</div>;

  return (
    <div className="w-full h-48 rounded-[2rem] overflow-hidden border-2 border-slate-100 dark:border-slate-800 shadow-inner relative">
      <Map
        defaultCenter={center}
        defaultZoom={11}
        disableDefaultUI={true}
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        styles={[
          {
            "featureType": "all",
            "elementType": "labels.text.fill",
            "stylers": [{ "color": "#7c93a3" }, { "lightness": "-10" }]
          },
          {
            "featureType": "administrative.country",
            "elementType": "geometry",
            "stylers": [{ "visibility": "on" }]
          },
          {
            "featureType": "administrative.country",
            "elementType": "geometry.stroke",
            "stylers": [{ "color": "#a0a4a5" }]
          },
          {
            "featureType": "landscape",
            "elementType": "geometry.fill",
            "stylers": [{ "color": "#f1efe8" }]
          },
          {
            "featureType": "landscape.man_made",
            "elementType": "geometry.fill",
            "stylers": [{ "visibility": "on" }, { "color": "#f1efe8" }]
          },
          {
            "featureType": "landscape.natural",
            "elementType": "geometry.fill",
            "stylers": [{ "visibility": "on" }, { "color": "#f1efe8" }]
          },
          {
            "featureType": "poi",
            "elementType": "all",
            "stylers": [{ "visibility": "simplified" }]
          },
          {
            "featureType": "poi",
            "elementType": "geometry.fill",
            "stylers": [{ "visibility": "on" }, { "color": "#f1efe8" }]
          },
          {
            "featureType": "poi.park",
            "elementType": "geometry.fill",
            "stylers": [{ "color": "#83cead" }, { "visibility": "on" }]
          },
          {
            "featureType": "road",
            "elementType": "geometry.stroke",
            "stylers": [{ "visibility": "off" }]
          },
          {
            "featureType": "road",
            "elementType": "labels",
            "stylers": [{ "visibility": "off" }]
          },
          {
            "featureType": "road.highway",
            "elementType": "geometry.fill",
            "stylers": [{ "color": "#ffffff" }]
          },
          {
            "featureType": "road.highway",
            "elementType": "labels",
            "stylers": [{ "visibility": "off" }]
          },
          {
            "featureType": "road.arterial",
            "elementType": "geometry.fill",
            "stylers": [{ "color": "#ffffff" }]
          },
          {
            "featureType": "road.local",
            "elementType": "geometry.fill",
            "stylers": [{ "color": "#ffffff" }]
          },
          {
            "featureType": "transit",
            "elementType": "all",
            "stylers": [{ "visibility": "off" }]
          },
          {
            "featureType": "water",
            "elementType": "all",
            "stylers": [{ "color": "#76c5ea" }, { "visibility": "on" }]
          },
          {
            "featureType": "water",
            "elementType": "geometry.fill",
            "stylers": [{ "color": "#76c5ea" }]
          },
          {
            "featureType": "water",
            "elementType": "labels.text.fill",
            "stylers": [{ "color": "#3d738d" }]
          },
          {
            "featureType": "water",
            "elementType": "labels.text.stroke",
            "stylers": [{ "visibility": "off" }]
          }
        ]}
      >
        <RouteDisplay pickup={pickup} destination={destination} onRouteData={onRouteData} />
      </Map>
    </div>
  );
}

function LocationAutocomplete({ 
  value, 
  onChange, 
  onSelect, 
  placeholder, 
  lang,
  icon: Icon
}: { 
  value: string; 
  onChange: (val: string) => void; 
  onSelect: (val: string) => void; 
  placeholder: string;
  lang: 'en' | 'id';
  icon: any;
}) {
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const placesLib = useMapsLibrary('places');
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);

  useEffect(() => {
    if (placesLib && !autocompleteService.current) {
      autocompleteService.current = new placesLib.AutocompleteService();
    }
  }, [placesLib]);

  useEffect(() => {
    if (!value || !autocompleteService.current) {
      setSuggestions([]);
      return;
    }

    const timeout = setTimeout(() => {
      autocompleteService.current?.getPlacePredictions(
        { input: value, componentRestrictions: { country: 'id' } },
        (predictions, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            setSuggestions(predictions);
          } else {
            setSuggestions([]);
          }
        }
      );
    }, 300);

    return () => clearTimeout(timeout);
  }, [value]);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative w-full transition-all duration-200 ${showSuggestions ? 'z-[100]' : 'z-50'}`} ref={containerRef}>
      <div className="relative flex items-center bg-slate-50 dark:bg-slate-800/50 rounded-[1.25rem] px-4 py-1.5 border-2 border-transparent focus-within:border-[#E87230]/40 transition-all shadow-sm">
        <Icon size={18} className="text-slate-500 shrink-0" />
        <input 
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          className="flex-1 bg-transparent border-none outline-none px-4 py-2.5 text-xs font-bold text-slate-800 dark:text-white placeholder:text-slate-400"
        />
        {value && (
          <button onClick={() => { onChange(''); setSuggestions([]); }} className="text-slate-400 p-1 hover:text-slate-600">
             <X size={14} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-[100]"
          >
            <div className="py-2 max-h-[300px] overflow-y-auto custom-scrollbar">
            {suggestions?.map((s, i) => (
                <div 
                  key={s.place_id}
                  onClick={() => {
                    onSelect(s.description);
                    onChange(s.description);
                    setShowSuggestions(false);
                  }}
                  className={`px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer flex items-center justify-between group transition-colors ${i !== suggestions.length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 shrink-0 group-hover:bg-[#E87230]/10 group-hover:text-[#E87230] transition-colors">
                          {s.types.includes('establishment') || s.types.includes('point_of_interest') ? <MapPin size={14} /> : <Clock size={14} />}
                        </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-slate-900 dark:text-white truncate tracking-tight">
                        {s.structured_formatting.main_text}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-medium">
                        {s.structured_formatting.secondary_text}
                      </div>
                    </div>
                  </div>
                  <div className="text-slate-300 dark:text-slate-600 group-hover:text-[#E87230] transition-colors pl-4 shrink-0">
                    <svg className="w-4 h-4 rotate-45" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <polyline points="19 12 12 5 5 12"></polyline>
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function HomeScreen({ 
  onTourClick, 
  onCategoryClick,
  onCalculatorClick,
  searchQuery, 
  setSearchQuery,
  destinations,
  isDarkMode,
  toggleDarkMode,
  onAboutClick,
  onFaqClick,
  onTermsClick,
  onPrivacyClick,
  onActivityBook,
  lang,
  toggleLang,
  currency,
  setCurrency,
  onShowSidebar,
  searchTab,
  setSearchTab,
  pickupQuery,
  setPickupQuery,
  showResults,
  setShowResults,
  activities,
  activityFilter,
  setActivityFilter,
  availableCategories
}: { 
  onTourClick: (tour: Tour) => void;
  onCategoryClick: (category: string) => void;
  onCalculatorClick: () => void;
  onActivityBook: (tour: Tour) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  pickupQuery: string;
  setPickupQuery: (q: string) => void;
  showResults: boolean;
  setShowResults: (show: boolean) => void;
  destinations: Tour[];
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onAboutClick: () => void;
  onFaqClick: () => void;
  onTermsClick: () => void;
  onPrivacyClick: () => void;
  lang: 'en' | 'id';
  toggleLang: () => void;
  currency: 'USD' | 'IDR';
  setCurrency: (c: 'USD' | 'IDR') => void;
  onShowSidebar: () => void;
  searchTab: SearchTab;
  setSearchTab: (tab: SearchTab) => void;
  activities: Activity[];
  activityFilter: string;
  setActivityFilter: (cat: string) => void;
  availableCategories: string[];
}) {
  const [selectedRide, setSelectedRide] = useState('economy');
  const [routeData, setRouteData] = useState<{ distance: string, duration: string } | null>(null);

  const RideOption = ({ id, name, desc, priceIdr, originalPriceIdr, image, seats }: any) => (
    <div 
      onClick={() => setSelectedRide(id)}
      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer group flex items-center justify-between ${selectedRide === id ? 'border-[#E87230] bg-[#E87230]/5' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-700'}`}
    >
       <div className="flex items-center gap-4">
          <div className="w-16 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl overflow-hidden grayscale group-hover:grayscale-0 transition-all border border-slate-100 dark:border-slate-700">
             <img src={image} alt={name} className="w-full h-full object-cover" />
          </div>
          <div>
             <div className="flex items-center gap-2">
                <h4 className="font-bold text-slate-900 dark:text-white leading-tight">{name}</h4>
             </div>
             <div className="flex items-center gap-2 mt-0.5">
               <p className="text-[10px] text-slate-500 font-medium">{desc}</p>
               <span className="text-[10px] text-slate-400">•</span>
               <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                 <Users size={10} />
                 <span>{seats} {lang === 'en' ? 'Seats' : 'Kursi'}</span>
               </div>
             </div>
          </div>
       </div>
       <div className="text-right">
          <div className="font-black text-slate-900 dark:text-white text-lg">
             <PriceDisplay priceIdr={priceIdr} currency={currency} />
          </div>
          {originalPriceIdr && (
             <div className="text-[10px] text-slate-400 line-through">
                <PriceDisplay priceIdr={originalPriceIdr} currency={currency} />
             </div>
          )}
       </div>
    </div>
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [tourMode, setTourMode] = useState<'selection' | 'packages' | 'custom'>('selection');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showAllActivities, setShowAllActivities] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Reset tour mode when switching tabs
  useEffect(() => {
    if (searchTab !== 'tours') {
      setTourMode('selection');
    }
  }, [searchTab]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const highlightedDestinations = destinations.filter(d => d.highlighted);

  useEffect(() => {
    setCurrentIndex(0);
    if (highlightedDestinations.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % highlightedDestinations.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [highlightedDestinations.length]);

  const currentTour = highlightedDestinations[currentIndex];

  const handleSearch = () => {
    setShowResults(true);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col overflow-y-auto relative"
    >
      <div className="relative pb-10 z-30">
        {/* Background Overlay */}
        <div className="absolute top-0 left-0 right-0 h-[70vh] overflow-hidden z-0">
          <img 
            src="https://res.cloudinary.com/dbckdslrw/image/upload/v1771815543/hero-bg_kratyi.webp" 
            alt="Background" 
            className="w-full h-full object-cover object-[45%_center]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white via-white/20 to-transparent dark:from-slate-950 dark:via-slate-950/20" />
        </div>

        {/* Top Mini Bar (Desktop Only) */}
        <div className="hidden md:flex relative z-50 bg-[#1E2E4B] text-white/80 py-2 px-6 items-center justify-between text-xs w-full">
            <div className="flex space-x-4">
                <Facebook size={14} className="hover:text-white cursor-pointer" />
                <Instagram size={14} className="hover:text-white cursor-pointer" />
            </div>
            <div className="flex space-x-4 items-center">
               <span className="hover:text-white cursor-pointer">{lang === 'en' ? 'Login' : 'Masuk'}</span>
               <span className="w-px h-3 bg-white/20"></span>
               <span className="hover:text-white cursor-pointer">{lang === 'en' ? 'Sign Up' : 'Daftar'}</span>
               <span className="w-px h-3 bg-white/20"></span>
               <button 
                 onClick={() => setCurrency(currency === 'USD' ? 'IDR' : 'USD')}
                 className="flex items-center hover:text-white cursor-pointer"
               >
                 {currency} <ChevronDown size={14} className="ml-1"/>
               </button>
            </div>
        </div>

        {/* Header (Transparent) */}
        <header className="relative z-40 px-6 py-4 flex items-center justify-between w-full">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 md:w-9 md:h-9 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center shadow-lg overflow-hidden border border-white/20">
              <img 
                src="https://res.cloudinary.com/dbckdslrw/image/upload/v1771789006/freesiatour_logo.png" 
                alt="Freesiatour Logo" 
                className="w-full h-full object-contain p-1"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col -space-y-0.5">
              <span className="font-display font-bold text-base md:text-lg text-white drop-shadow-md leading-none">Freesiatour</span>
              <span className="text-[7px] font-bold text-[#E87230] tracking-[0.05em] uppercase drop-shadow-sm">Holiday is friendly</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setCurrency(currency === 'USD' ? 'IDR' : 'USD')}
              className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-colors font-black text-[10px] uppercase border border-white/20 shadow-sm"
            >
              {currency}
            </button>
            <button 
              onClick={toggleLang}
              className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-colors font-bold text-[10px] uppercase border border-white/20 shadow-sm"
            >
              {lang}
            </button>
            <button 
              onClick={toggleDarkMode}
              className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-colors border border-white/20 shadow-sm"
            >
              {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <button 
              onClick={onShowSidebar}
              className="w-10 h-10 flex items-center justify-end text-white cursor-pointer ml-1"
            >
              <Menu size={24} />
            </button>
          </div>
        </header>

        {/* Hero Content */}
        <div className="relative z-10 px-6 pt-32 pb-2 md:pt-40 text-left">
          <h1 className="text-6xl md:text-[84px] font-serif regular text-white mb-0 leading-tight tracking-tight drop-shadow-2xl">
             {lang === 'en' ? 'Hi There!' : 'Halo Kawan!'}
          </h1>
          <p className="text-white text-xl md:text-2xl font-sans mt-3 font-semibold opacity-90 mb-4 md:mb-6">
            {lang === 'en' ? 'Where would you like to go?' : 'Mau liburan ke mana?'}
          </p>
        </div>

        {/* Quick Search Card */}
        <div className="relative z-20 px-6 mt-2 max-w-4xl mx-auto">
          {/* Tabs */}
          <div className="flex overflow-x-auto hide-scrollbar mb-0 space-x-0.5">
              <button 
                onClick={() => setSearchTab('shuttle')}
                className={`px-6 py-3 text-sm font-bold rounded-t-xl shrink-0 transition-all flex items-center space-x-2 ${
                  searchTab === 'shuttle' 
                  ? 'bg-[#E87230] text-white shadow-lg' 
                  : 'bg-black/20 dark:bg-slate-900/60 backdrop-blur-xl text-white font-semibold hover:bg-black/30 border-x border-t border-white/5'
                }`}
              >
                <Bus size={16} />
                <span>{lang === 'en' ? 'Shuttle' : 'Shuttle'}</span>
              </button>
              <button 
                onClick={() => setSearchTab('tours')}
                className={`px-6 py-3 text-sm font-bold rounded-t-xl shrink-0 transition-all flex items-center space-x-2 ${
                  searchTab === 'tours' 
                  ? 'bg-[#E87230] text-white shadow-lg' 
                  : 'bg-black/20 dark:bg-slate-900/60 backdrop-blur-xl text-white font-semibold hover:bg-black/30 border-x border-t border-white/5'
                }`}
              >
                <MapIcon size={16} />
                <span>{lang === 'en' ? 'Tours' : 'Tur'}</span>
              </button>
              <button 
                onClick={() => setSearchTab('activity')}
                className={`px-6 py-3 text-sm font-bold rounded-t-xl shrink-0 transition-all flex items-center space-x-2 ${
                  searchTab === 'activity' 
                  ? 'bg-[#E87230] text-white shadow-lg' 
                  : 'bg-black/20 dark:bg-slate-900/60 backdrop-blur-xl text-white font-semibold hover:bg-black/30 border-x border-t border-white/5'
                }`}
              >
                <Compass size={16} />
                <span>{lang === 'en' ? 'Activity' : 'Aktivitas'}</span>
              </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-b-3xl rounded-tr-none rounded-tl-none shadow-2xl shadow-black/20 border border-white/5 p-5 relative">
             <div className="space-y-4">
               {searchTab === 'shuttle' ? (
                  <div className="pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="mb-4">
                      <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight tracking-tighter">
                        {lang === 'en' ? 'Where are you going?' : 'Ke mana tujuan Anda?'}
                      </h2>
                    </div>

                    <div className="relative space-y-2 mb-6">
                       {/* Decorative Line */}
                       <div className="absolute left-[22px] top-[26px] bottom-[26px] w-[2px] bg-slate-200 dark:bg-slate-700 z-0" />
                       
                       {/* Location Input (Pickup) */}
                       <LocationAutocomplete 
                          value={pickupQuery}
                          onChange={setPickupQuery}
                          onSelect={setPickupQuery}
                          placeholder={lang === 'en' ? "From?" : "Dari mana?"}
                          lang={lang}
                          icon={MapPin}
                       />

                       {/* Destination Input */}
                       <LocationAutocomplete 
                          value={searchQuery}
                          onChange={setSearchQuery}
                          onSelect={setSearchQuery}
                          placeholder={lang === 'en' ? "To?" : "Mau ke mana?"}
                          lang={lang}
                          icon={Navigation}
                       />
                    </div>

                    <div className="flex gap-3 mt-4">
                       <button 
                         onClick={handleSearch}
                         className="w-full h-12 bg-[#E87230] font-bold text-white uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-[#E87230]/20 active:scale-95 transition-all text-center"
                       >
                         {lang === 'en' ? 'See prices' : 'Lihat harga'}
                       </button>
                    </div>
                  </div>
                ) : searchTab === 'tours' && tourMode === 'selection' ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      {/* Tour Packages */}
                      <motion.button
                        whileHover={{ scale: 1.01, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setTourMode('packages')}
                        className="group relative bg-[#0F172A] h-44 sm:h-52 rounded-[2.5rem] overflow-hidden shadow-xl transition-all border border-white/5"
                      >
                        <div className="absolute inset-0 opacity-40">
                           <img 
                             src="https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&q=80&w=600" 
                             alt="Packages" 
                             className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
                           />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/40 to-transparent" />
                        
                        <div className="absolute inset-0 p-8 flex flex-col justify-between items-start text-left">
                           <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
                              <LayoutGrid size={14} className="text-[#E87230]" />
                              <span className="text-[10px] font-black text-[#E87230] uppercase tracking-widest">{lang === 'en' ? 'Curated' : 'Pilihan'}</span>
                           </div>
                           
                           <div>
                              <h4 className="font-display font-black text-2xl text-white leading-tight">{lang === 'en' ? 'Tour Packages' : 'Paket Tur'}</h4>
                              <p className="text-[11px] text-slate-400 font-medium mt-1.5 opacity-90">
                                {lang === 'en' ? 'Ready-made luxury experiences' : 'Pengalaman mewah siap pakai'}
                              </p>
                           </div>
                        </div>
                      </motion.button>

                      {/* Package Estimator */}
                      <motion.button
                        whileHover={{ scale: 1.01, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onCalculatorClick}
                        className="group relative bg-[#0F172A] h-44 sm:h-52 rounded-[2.5rem] overflow-hidden shadow-xl transition-all border border-white/5"
                      >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-pink-500/5 via-transparent to-transparent opacity-40" />
                        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-pink-500/5 blur-[40px] rounded-full" />
                        
                        <div className="absolute inset-0 p-8 flex flex-col items-start justify-between text-left">
                           <div className="w-full flex justify-between items-start">
                              <div className="flex -space-x-1.5">
                                 {[1,2,3].map(i => (
                                   <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0F172A] bg-slate-800 overflow-hidden shadow-lg">
                                      <img src={`https://i.pravatar.cc/100?img=${i+14}`} className="w-full h-full object-cover" alt="user" />
                                   </div>
                                 ))}
                                 <div className="w-8 h-8 rounded-full border-2 border-[#0F172A] bg-pink-600 flex items-center justify-center text-[9px] font-bold text-white shadow-lg">+1k</div>
                              </div>
                              <div className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-[#0F172A] group-hover:rotate-3 transition-transform duration-500">
                                 <Calculator size={24} strokeWidth={2.5} />
                              </div>
                           </div>

                           <div className="w-full space-y-0.5">
                              <div className="text-slate-500 text-[11px] font-bold uppercase tracking-widest">
                                {lang === 'en' ? 'Bali Package' : 'Paket Tour'}
                              </div>
                              <h4 className="font-display font-black text-3xl text-pink-500 leading-none tracking-tight">
                                {lang === 'en' ? 'Estimator' : 'Estimasi'}
                              </h4>
                              <div className="flex items-center justify-between w-full mt-4">
                                 <p className="text-[10px] text-slate-400 font-medium opacity-80 leading-snug">
                                   {lang === 'en' ? 'Create a custom budget' : 'Buat anggaran kustom'}
                                 </p>
                                 <div className="flex items-center gap-1.5 text-white font-bold text-[11px] px-3 py-1.5 rounded-full bg-white/5 border border-white/5 group-hover:bg-pink-500 transition-colors">
                                   <span>{lang === 'en' ? 'Plan' : 'Mulai'}</span>
                                   <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                                 </div>
                              </div>
                           </div>
                        </div>
                      </motion.button>
                    </div>

                  </>
                ) : (
                 <>
                   {searchTab === 'tours' && (
                     <button 
                       onClick={() => setTourMode('selection')}
                       className="flex items-center space-x-1 text-xs font-bold text-ungu-muda hover:underline mb-2"
                     >
                       <ChevronLeft size={14} />
                       <span>{lang === 'en' ? 'Change Tour Type' : 'Ganti Tipe Tur'}</span>
                     </button>
                   )}
                   {/* Destination Input */}
                   <div className="space-y-4 mb-4">
                     <div className="space-y-1.5 w-full">
                       <label className="text-xs font-semibold text-slate-500">
                         {searchTab === 'activity' 
                           ? (lang === 'en' ? 'Activity Name' : 'Nama Aktivitas') 
                           : searchTab === 'tours' 
                             ? (lang === 'en' ? 'Destination Area' : 'Area Tujuan')
                             : (lang === 'en' ? 'Destination' : 'Tujuan')}
                       </label>
                       <input 
                         type="text" 
                         value={searchQuery}
                         onChange={(e) => {
                           setSearchQuery(e.target.value);
                           if (e.target.value.trim().length > 0) setShowResults(true);
                         }}
                         onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                         placeholder={
                           searchTab === 'activity' 
                           ? (lang === 'en' ? 'What do you want to do?' : 'Apa yang ingin Anda lakukan?')
                           : (lang === 'en' ? 'Where are you going?' : 'Ke mana Anda pergi?')
                         }
                         className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-[#E87230]/20 focus:border-[#E87230] outline-none transition-all placeholder:text-slate-400" 
                       />
                     </div>
                     
                     {/* Extra Search Fields (Optional based on tab) */}
                     <div className="space-y-1.5 relative w-full" ref={categoryDropdownRef}>
                        <label className="text-xs font-semibold text-slate-500">
                          {(searchTab === 'activity' || searchTab === 'tours') ? (lang === 'en' ? 'Category' : 'Kategori') : (lang === 'en' ? 'Check In - Out' : 'Check In - Out')}
                        </label>
                        <div 
                          className={`w-full bg-slate-50 dark:bg-slate-800/50 border ${showCategoryDropdown && (searchTab === 'activity' || searchTab === 'tours') ? 'border-[#E87230] ring-2 ring-[#E87230]/20' : 'border-slate-200 dark:border-slate-700'} rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white outline-none transition-all flex items-center justify-between cursor-pointer`}
                          onClick={() => (searchTab === 'activity' || searchTab === 'tours') && setShowCategoryDropdown(!showCategoryDropdown)}
                        >
                           <div className="line-clamp-1">
                             {(searchTab === 'activity' || searchTab === 'tours') ? (activityFilter === 'All' ? (lang === 'en' ? 'All Categories' : 'Semua Kategori') : activityFilter) : (
                               <span className="flex items-center text-[#E87230] font-semibold">
                                 {new Date().toLocaleDateString(lang === 'en' ? 'en-US' : 'id-ID', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                                 <span className="mx-2 text-slate-300">→</span>
                                 {new Date(Date.now() + 86400000).toLocaleDateString(lang === 'en' ? 'en-US' : 'id-ID', { month: '2-digit', day: '2-digit', year: 'numeric' })}
                               </span>
                             )}
                           </div>
                           <div className="flex items-center space-x-2 shrink-0">
                             {!(searchTab === 'activity' || searchTab === 'tours') && <Calendar className="text-slate-400" size={16} />}
                             {(searchTab === 'activity' || searchTab === 'tours') && <ChevronDown size={16} className={`text-slate-400 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />}
                           </div>
                        </div>
                        
                        <AnimatePresence>
                          {showCategoryDropdown && (searchTab === 'activity' || searchTab === 'tours') && (
                            <motion.div 
                              initial={{ opacity: 0, y: -5, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -5, scale: 0.95 }}
                              className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 z-[100] overflow-hidden max-h-60 overflow-y-auto"
                            >
                  {availableCategories?.map((cat) => (
                                <button
                                  key={cat}
                                  onClick={() => {
                                    setActivityFilter(cat);
                                    setShowCategoryDropdown(false);
                                  }}
                                  className={`w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between ${
                                    activityFilter === cat 
                                      ? 'bg-[#E87230] text-white font-medium' 
                                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                                  }`}
                                >
                                  {cat === 'All' ? (lang === 'en' ? 'All Categories' : 'Semua Kategori') : cat}
                                  {activityFilter === cat && <CheckCircle2 size={16} />}
                                </button>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                     </div>
                   </div>

                   {/* Search Button */}
                   <button 
                    onClick={handleSearch}
                    className="w-full h-12 mt-2 bg-[#E87230] font-bold text-white uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-[#E87230]/20 active:scale-95 transition-all text-center"
                   >
                     {lang === 'en' ? 'Search' : 'Cari'}
                   </button>
                 </>
               )}
             </div>
          </div>
        </div>
      </div>

      <div className="p-6 relative z-10 w-full">
      {/* Search Results */}
      {showResults && (
        <motion.div 
          ref={resultsRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 scroll-mt-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-xl dark:text-white">
              {lang === 'en' ? 'Search Results' : 'Hasil Pencarian'}
            </h3>
            <button onClick={() => setShowResults(false)} className="text-sm text-[#E87230] font-bold">
              {lang === 'en' ? 'Clear' : 'Hapus'}
            </button>
          </div>
          <div className="space-y-4">
            {searchTab === 'tours' ? (
              destinations.length > 0 ? (
                destinations.map(tour => (
                  <TourCard key={tour.id} tour={tour} onClick={onTourClick} lang={lang} currency={currency} />
                ))
              ) : (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                  <p className="text-abu-abu text-sm">{lang === 'en' ? 'No tours matching your search' : 'Tidak ada tour yang cocok'}</p>
                </div>
              )
            ) : searchTab === 'activity' ? (
              activities.length > 0 ? (
                <>
                  <div className="space-y-4">
            {(showAllActivities ? activities : activities?.slice(0, 6))?.map(activity => (
                      <ActivityCard 
                        key={activity.id} 
                        activity={activity} 
                        lang={lang} 
                        currency={currency}
                        onBook={(act) => {
                          const tour: Tour = {
                            id: act.id,
                            title: act.name,
                            location: 'Bali',
                            price: act.price || 0,
                            rating: 5.0,
                            reviews: 10,
                            image: act.image || 'https://picsum.photos/seed/activity/800/600',
                            duration: act.duration || 'Flexible',
                            description: act.description || act.name,
                            itinerary: [],
                            included: [],
                            excluded: [],
                            lat: -8.4095,
                            lng: 115.1889
                          };
                          onActivityBook(tour);
                        }} 
                      />
                    ))}
                  </div>
                  
                  {activities.length > 6 && (
                    <div className="flex justify-center pt-4">
                      <button 
                        onClick={() => setShowAllActivities(!showAllActivities)}
                        className="flex items-center space-x-2 text-ungu-pekat font-bold text-sm bg-ungu-muda/20 px-6 py-2.5 rounded-2xl hover:bg-ungu-muda/30 transition-colors shadow-sm"
                      >
                        <span>{showAllActivities ? (lang === 'en' ? 'Show Less' : 'Sembunyikan') : (lang === 'en' ? 'See All Activities' : 'Lihat Semua Aktivitas')}</span>
                        <ChevronDown size={14} className={`transition-transform duration-300 ${showAllActivities ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                  <p className="text-abu-abu text-sm">{lang === 'en' ? 'No activities matching your search' : 'Tidak ada aktivitas yang cocok'}</p>
                </div>
              )
            ) : searchTab === 'shuttle' ? (
              <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                 {/* Shuttle Map */}
                 <ShuttleMap 
                   pickup={pickupQuery || 'Bali'} 
                   destination={searchQuery || 'Denpasar'} 
                   lang={lang} 
                   onRouteData={setRouteData}
                 />
                 
                 {/* Trip Summary Header */}
                 <div className="bg-[#0F172A] px-4 py-3 rounded-[2rem] shadow-2xl border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                       <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-[#E87230] shrink-0">
                          <Bus size={18} />
                       </div>
                       <div className="min-w-0">
                          <div className="flex items-center gap-1.5 overflow-hidden">
                             <span className="text-[11px] font-black text-white truncate max-w-[120px]">
                                {pickupQuery?.split(',')[0] || (lang === 'en' ? 'Current' : 'Sekarang')}
                             </span>
                             <ChevronRight size={10} className="text-slate-600 shrink-0" />
                             <span className="text-[11px] font-black text-[#E87230] truncate max-w-[120px]">
                                {searchQuery?.split(',')[0] || (lang === 'en' ? 'Destination' : 'Destinasi')}
                             </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                             <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                                <Clock size={8} className="text-pink-500" />
                                {routeData ? routeData.duration : '--'}
                             </div>
                             <div className="w-1 h-1 rounded-full bg-slate-700" />
                             <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                                <MapPin size={8} className="text-[#E87230]" />
                                {routeData ? routeData.distance : '--'}
                             </div>
                          </div>
                       </div>
                    </div>
                    <button 
                       onClick={() => setShowResults(false)} 
                       className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-full text-slate-500 hover:bg-white/10 transition-all shrink-0"
                    >
                       <X size={14} />
                    </button>
                 </div>

                 <div className="space-y-1">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-2">{lang === 'en' ? 'Select your ride' : 'Pilih kendaraan'}</h5>
                     {/* Ride Options */}
                    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 pb-4 custom-scrollbar">
                       {(() => {
                          const vehicleTypes = ['City Car', 'MPV', 'Minibus Toyota Hiace'];
                          const images = {
                            'City Car': "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=200",
                            'MPV': "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=200",
                            'Minibus Toyota Hiace': "https://images.unsplash.com/photo-1469285994282-454ceb49e63c?auto=format&fit=crop&q=80&w=200"
                          };
                          const descriptions = {
                            'City Car': lang === 'en' ? "Affordable, everyday rides" : "Hemat, perjalanan harian",
                            'MPV': lang === 'en' ? "Spacious SUVs for groups" : "SUV luas untuk rombongan",
                            'Minibus Toyota Hiace': lang === 'en' ? "Luxury Hiace for big groups" : "Hiace mewah kapasitas besar"
                          };
                          const multipliers = {
                            'City Car': 1,
                            'MPV': 1.6,
                            'Minibus Toyota Hiace': 3.5
                          };

                          const sortedVehicles = VEHICLES_DATA
                            .filter(v => vehicleTypes.includes(v.vehicle))
                            .map(v => ({
                              ...v,
                              priceIdr: routeData ? calculateShuttlePrice(routeData.distance, routeData.duration, multipliers[v.vehicle as keyof typeof multipliers]) : 0
                            }))
                            .sort((a, b) => a.priceIdr - b.priceIdr);

                          return sortedVehicles.map((v) => (
                            <RideOption 
                               key={v.id}
                               id={v.id}
                               name={v.vehicle}
                               desc={descriptions[v.vehicle as keyof typeof descriptions]}
                               priceIdr={v.priceIdr}
                               image={images[v.vehicle as keyof typeof images]}
                               seats={v.seats}
                            />
                          ));
                       })()}
                    </div>
                 </div>

                 {/* Booking Action */}
                 <div className="sticky bottom-0 pt-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                    <button 
                      onClick={() => {
                          const vehicle = VEHICLES_DATA.find(v => v.id === selectedRide);
                          if (!vehicle) return;
                          
                          const multiplier = vehicle.vehicle === 'City Car' ? 1 : vehicle.vehicle === 'MPV' ? 1.6 : 3.5;
                          const priceIdr = routeData ? calculateShuttlePrice(routeData.distance, routeData.duration, multiplier) : 0;
                          
                          const shuttleTour: Tour = {
                            id: `shuttle-${vehicle.id}`,
                            title: `${vehicle.vehicle} Shuttle`,
                            location: `${pickupQuery || 'Bali'} to ${searchQuery || 'Destination'}`,
                            price: priceIdr / USD_TO_IDR, // Convert for PriceDisplay if it uses USD
                            rating: 5.0,
                            reviews: 0,
                            image: vehicle.vehicle === 'City Car' 
                              ? "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=200" 
                              : vehicle.vehicle === 'MPV' 
                                ? "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=200"
                                : "https://images.unsplash.com/photo-1469285994282-454ceb49e63c?auto=format&fit=crop&q=80&w=200",
                            duration: routeData?.duration || 'Flexible',
                            description: `Shuttle service from ${pickupQuery || 'your location'} to ${searchQuery || 'destination'} using ${vehicle.vehicle}. Distance: ${routeData?.distance || 'N/A'}.`,
                            itinerary: [],
                            included: ['Professional Driver', 'Fuel', 'Insurance'],
                            excluded: ['Tolls & Parking', 'Personal Expenses'],
                            lat: -8.4095,
                            lng: 115.1889
                          };
                          
                          onActivityBook(shuttleTour);
                      }}
                      className="w-full py-4 bg-[#E87230] text-white font-black uppercase tracking-widest text-sm rounded-[1.5rem] shadow-lg shadow-[#E87230]/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      {lang === 'en' ? 'Book Now' : 'Pesan Sekarang'}
                      <ChevronRight size={18} />
                    </button>
                    <p className="text-center text-[10px] text-slate-400 font-medium mt-3 px-6">
                       {lang === 'en' 
                         ? "*Prices are estimates and may vary based on traffic, demand, and precise distance." 
                         : "*Harga adalah perkiraan dan dapat berubah berdasarkan lalu lintas, permintaan, dan jarak tepat."}
                    </p>
                 </div>
              </div>
            ) : null}
          </div>
        </motion.div>
      )}

      {!showResults && (
        <>
          <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-hijau-muda rounded-3xl p-4 flex flex-col justify-between h-40 relative overflow-hidden">
          <div className="z-10">
            <div className="w-8 h-8 bg-hijau-pekat rounded-lg flex items-center justify-center text-white mb-2">
               <MapPin size={16} />
            </div>
            <div className="text-4xl font-bold text-hijau-pekat">23</div>
            <div className="text-hijau-medium text-sm">of 50</div>
          </div>
          <div className="z-10">
            <div className="text-hijau-medium text-xs uppercase tracking-wider font-bold">{lang === 'en' ? 'Destinations' : 'Destinasi'}</div>
            <div className="font-bold text-hijau-pekat">Indonesia</div>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-hijau-pekat/5 rounded-full" />
        </div>

        <div className="rounded-3xl h-40 relative overflow-hidden group cursor-pointer" onClick={() => onCategoryClick('Bali')}>
          <img 
            src="https://res.cloudinary.com/dbckdslrw/image/upload/v1771984511/78435678_3241741195900196_3087212850163220480_n_h7etps.jpg" 
            alt="Featured" 
            className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-110"
            referrerPolicy="no-referrer"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 text-white">
            <div className="font-bold">Bali</div>
            <div className="text-xs opacity-80">Indonesia • 12.3km</div>
          </div>
          <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2 rounded-lg text-white">
            <ArrowRight size={16} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xl dark:text-white">
            {lang === 'en' ? 'Best Destinations' : 'Destinasi Terbaik'}
          </h3>
          <div className="flex items-center space-x-2">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setCurrentIndex((prev) => (prev - 1 + highlightedDestinations.length) % highlightedDestinations.length)}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-pink-pekat hover:text-white dark:hover:bg-pink-pekat transition-colors"
            >
              <ChevronLeft size={16} />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setCurrentIndex((prev) => (prev + 1) % highlightedDestinations.length)}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-pink-pekat hover:text-white dark:hover:bg-pink-pekat transition-colors"
            >
              <ChevronRight size={16} />
            </motion.button>
          </div>
        </div>

        {highlightedDestinations.length > 0 ? (
          <div className="relative h-[400px] -mx-6 overflow-hidden bg-black group cursor-pointer" onClick={() => currentTour && onTourClick(currentTour)}>
            <AnimatePresence mode="wait">
              {currentTour && (
                <motion.div
                  key={currentTour.id}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute inset-0"
                >
                  <img 
                    src={currentTour.image} 
                    alt={currentTour.title} 
                    className="w-full h-full object-cover opacity-70"
                    referrerPolicy="no-referrer"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Large Background Text */}
            <div className="absolute inset-0 flex flex-col items-start justify-start p-8 pointer-events-none overflow-hidden">
              <AnimatePresence mode="wait">
                {currentTour && (
                  <motion.div
                    key={currentTour.title}
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 30, opacity: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-left"
                  >
                    <div className="text-white/80 text-[10px] uppercase tracking-[0.3em] font-bold mb-2">
                      {lang === 'en' ? 'Your Next Vacation In' : 'Liburan Anda Berikutnya Di'}
                    </div>
                    <h2 className="text-white text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">
                      {currentTour.title}
                    </h2>
                    <div className="mt-4 bg-white/20 backdrop-blur-md border border-white/40 rounded-2xl p-3 px-5 shadow-2xl flex items-center gap-3 w-fit pointer-events-auto">
                      <div className="flex flex-col">
                        <span className="text-white text-xs font-black uppercase tracking-wider drop-shadow-md">
                          {lang === 'en' ? '14 Days' : '14 Hari'}
                        </span>
                        <span className="text-white/90 text-[8px] font-bold uppercase tracking-widest drop-shadow-md">
                          {lang === 'en' ? 'All Inclusive' : 'Semua Termasuk'}
                        </span>
                      </div>
                      <div className="w-px h-8 bg-white/40"></div>
                      <div className="text-pink-pekat text-xl font-black drop-shadow-sm">
                        <PriceDisplay priceUsd={currentTour.price} currency={currency} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Traveler Image (Static) */}
            <div className="absolute inset-0 flex items-end justify-start pointer-events-none">
              <div className="relative h-[80%] w-full flex justify-start pl-4 md:pl-12 transform translate-y-4">
                <motion.img 
                  src="https://res.cloudinary.com/dbckdslrw/image/upload/v1771899527/grok-image-6586278a-e917-486c-b94c-26e4cf71da00_2-fotor-bg-remover-20260224101231_cv61nk.png" 
                  alt="Traveler" 
                  className="h-full object-contain object-bottom"
                  referrerPolicy="no-referrer"
                  animate={{ 
                    y: [0, -4, 0, -4, 0],
                    x: [0, -1, 0, 1, 0],
                    rotate: [0, -0.5, 0, 0.5, 0]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 1.2,
                    ease: "easeInOut"
                  }}
                />
              </div>
            </div>



            {/* Book Button */}
            <div className="absolute bottom-10 left-0 right-0 flex justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="h-12 bg-[#E87230] font-bold text-white uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-[#E87230]/20 transition-all text-center px-10 flex items-center justify-center"
              >
                {lang === 'en' ? 'Book an Adventure' : 'Pesan Petualangan'}
              </motion.button>
            </div>
          </div>
        ) : (
          <div className="h-[400px] flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-3xl -mx-6">
            <p className="text-abu-abu font-medium">{lang === 'en' ? 'No tours found' : 'Tour tidak ditemukan'}</p>
          </div>
        )}
      </div>
        </>
      )}

      {/* Premium Trip Estimator Design - Refined Style */}
      <motion.div 
        whileTap={{ scale: 0.98 }}
        onClick={onCalculatorClick}
        className="mt-10 mb-6 group cursor-pointer px-6"
      >
        <div className="relative overflow-hidden rounded-[3rem] bg-[#0F172A] shadow-2xl border border-white/5">
          {/* Subtle Accent Glows */}
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-pink-600/10 blur-[80px] rounded-full" />
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-purple-600/10 blur-[80px] rounded-full" />
          
          <div className="relative z-10 p-10 min-h-[280px] flex flex-col justify-between">
            {/* Top Section */}
            <div className="flex items-start justify-between">
              <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                  <div key={i} className="w-9 h-9 rounded-full border-2 border-[#0F172A] bg-slate-800 overflow-hidden shadow-lg">
                    <img src={`https://i.pravatar.cc/100?img=${i+10}`} className="w-full h-full object-cover" alt="user" />
                  </div>
                ))}
                <div className="w-9 h-9 rounded-full border-2 border-[#0F172A] bg-pink-600 flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
                  +1k
                </div>
              </div>
              
              <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center text-[#0F172A] transition-transform group-hover:scale-110 duration-500">
                <Calculator size={30} strokeWidth={2.5} />
              </div>
            </div>

            {/* Bottom Section */}
            <div className="flex items-end justify-between mt-8">
              <div className="space-y-1">
                <div className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">
                  {lang === 'en' ? 'Bali Package' : 'Paket Tour'}
                </div>
                <h3 className="text-4xl font-black text-pink-500 leading-none tracking-tight">
                  {lang === 'en' ? 'Estimator' : 'Estimasi'}
                </h3>
                <p className="text-slate-500 text-xs font-medium mt-4 max-w-[200px]">
                  {lang === 'en' ? 'Create a custom budget' : 'Buat anggaran khusus Anda'}
                </p>
              </div>

              <div className="flex items-center gap-2 text-white font-bold text-sm transition-all group-hover:gap-3">
                <span className="tracking-tight">{lang === 'en' ? 'Plan' : 'Mulai'}</span>
                <ArrowRight size={20} className="text-pink-500" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Top Activities Section - Moved to Home Page */}
      <div className="mt-10 space-y-4 px-6">
         <div className="flex items-center justify-between px-2">
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-[#E87230]" />
               {lang === 'en' ? 'Top Activities' : 'Aktivitas Terpopuler'}
            </h4>
            <button 
               onClick={() => {
                 setSearchTab('activity');
                 window.scrollTo({ top: 0, behavior: 'smooth' });
               }}
               className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-[#E87230] transition-colors"
            >
               {lang === 'en' ? 'View All' : 'Lihat Semua'}
            </button>
         </div>

         <div className="grid grid-cols-2 gap-3 h-[320px]">
            {activities?.slice(0, 3).map((activity, idx) => (
               <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.1, ease: [0.23, 1, 0.32, 1] }}
                  onClick={() => onActivityBook({ 
                    ...activity, 
                    title: activity.name, 
                    priceUsd: activity.price || (activity.price_min_idr / USD_TO_IDR),
                    itinerary: [],
                    included: [],
                    excluded: []
                  } as any)}
                  className={`group relative overflow-hidden rounded-[2rem] shadow-lg cursor-pointer ${
                     idx === 0 ? 'row-span-2 col-span-1' : 'col-span-1 row-span-1'
                  }`}
               >
                  {activity.image && (
                    <img 
                       src={activity.image} 
                       alt={activity.name} 
                       className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
                  <div className="absolute inset-0 p-4 flex flex-col justify-end">
                     <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-lg px-2 py-0.5 w-fit mb-2">
                        <span className="text-[8px] font-black text-white uppercase tracking-widest">
                           <PriceDisplay 
                              priceUsd={activity.price || (activity.price_min_idr / USD_TO_IDR)} 
                              priceIdr={activity.price ? activity.price * USD_TO_IDR : activity.price_min_idr} 
                              currency={currency} 
                           />
                        </span>
                     </div>
                     <h5 className={`font-display font-bold text-white leading-tight ${idx === 0 ? 'text-lg' : 'text-sm'}`}>
                        {activity.name}
                     </h5>
                     {idx === 0 && activity.description && (
                        <p className="text-[10px] text-white/60 font-medium mt-1 line-clamp-2">
                           {activity.description}
                        </p>
                     )}
                  </div>
               </motion.div>
            ))}
         </div>
      </div>
      </div>

      <div className="mt-8 p-4 bg-ungu-pekat rounded-3xl text-white flex items-center justify-between relative z-10 mx-6">
        <div>
          <div className="text-xs opacity-60 uppercase tracking-widest font-bold mb-1">{lang === 'en' ? 'Contact Us' : 'Hubungi Kami'}</div>
          <div className="font-bold">+62 896-6114-1114</div>
        </div>
        <button className="w-12 h-12 bg-[#E87230] rounded-2xl flex items-center justify-center shadow-lg shadow-[#E87230]/20">
          <Phone size={20} />
        </button>
      </div>

      <button 
        onClick={onAboutClick}
        className="mt-4 w-[calc(100%-3rem)] mx-6 p-4 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 flex items-center justify-between group relative z-10"
      >
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-pink-pekat/10 rounded-xl flex items-center justify-center text-pink-pekat">
            <Info size={20} />
          </div>
          <div className="text-left">
            <div className="font-bold text-hitam-pekat dark:text-white">{lang === 'en' ? 'About Freesiatour' : 'Tentang Freesiatour'}</div>
            <div className="text-xs text-abu-abu dark:text-slate-400">{lang === 'en' ? 'Our Story & Mission' : 'Cerita & Misi Kami'}</div>
          </div>
        </div>
        <ArrowRight size={18} className="text-abu-abu group-hover:text-pink-pekat transition-colors" />
      </button>

      <div className="mt-8 mb-6 mx-6 relative z-10">
        <div className="text-xs text-abu-abu dark:text-slate-400 font-medium uppercase tracking-widest text-center mb-4">
          {lang === 'en' ? 'Our Partners' : 'Mitra Kami'}
        </div>
        <div className="flex flex-wrap justify-center items-center gap-4">
          {[
            "https://res.cloudinary.com/dbckdslrw/image/upload/v1778984318/tripadvisor-logo-free-download-tripadvisor-logo-free-png_yzltq4.png",
            "https://res.cloudinary.com/dbckdslrw/image/upload/v1778984318/images_1_wr3ym1.png",
            "https://res.cloudinary.com/dbckdslrw/image/upload/v1778984318/images_17_gsxdef.jpg",
            "https://res.cloudinary.com/dbckdslrw/image/upload/v1778984318/gojek-logo-rounded-hd-free-png_yop6lc.png",
            "https://res.cloudinary.com/dbckdslrw/image/upload/v1778984319/images_18_q2flof.jpg"
          ].map((src, i) => (
             <div key={i} className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center p-3">
               <img src={src} alt="Partner" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
             </div>
          ))}
        </div>
      </div>

      <div className="mt-8 mb-8 mx-6 flex flex-col items-center justify-center relative z-10 border-t border-slate-100 dark:border-slate-800 pt-8">
        <div className="text-xs text-abu-abu dark:text-slate-400 mb-3 font-medium uppercase tracking-widest">
          {lang === 'en' ? 'Follow Us' : 'Ikuti Kami'}
        </div>
        <div className="flex items-center space-x-4 mb-6">
          <a href="https://instagram.com/freesiatour" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-[#E87230] shadow-sm border border-slate-100 dark:border-slate-700 hover:bg-[#E87230] hover:text-white transition-colors">
            <Instagram size={18} />
          </a>
          <a href="https://facebook.com/freesiatour" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-ungu-pekat shadow-sm border border-slate-100 dark:border-slate-700 hover:bg-ungu-pekat hover:text-white transition-colors">
            <Facebook size={18} />
          </a>
        </div>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-abu-abu dark:text-slate-400">
          <button onClick={onTermsClick} className="hover:text-[#E87230] transition-colors">Terms & Conditions</button>
          <button onClick={onPrivacyClick} className="hover:text-[#E87230] transition-colors">Privacy Policy</button>
          <button onClick={onFaqClick} className="hover:text-[#E87230] transition-colors">FAQ</button>
        </div>
        <div className="mt-6 text-center text-xs text-abu-abu dark:text-slate-400">
          &copy; 2026 Copyrights by Freesiatour. All Rights Reserved
        </div>
      </div>
    </motion.div>
  );
}

function CategoryScreen({ 
  category, 
  onBack, 
  onTourClick, 
  lang,
  currency 
}: { 
  category: string; 
  onBack: () => void; 
  onTourClick: (tour: Tour) => void;
  lang: 'en' | 'id';
  currency: Currency;
}) {
  const tours = DESTINATIONS.filter(d => 
    d.location.toLowerCase().includes(category.toLowerCase()) ||
    d.title.toLowerCase().includes(category.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col bg-white dark:bg-slate-900 overflow-y-auto"
    >
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-6 py-4 flex items-center border-b border-slate-50 dark:border-slate-800">
        <button onClick={onBack} className="mr-4 text-hitam-pekat dark:text-white">
          <ChevronLeft size={24} />
        </button>
        <h3 className="dark:text-white text-xl font-bold">
          {lang === 'en' ? `${category} Tours` : `Paket Tour ${category}`}
        </h3>
      </header>

      <div className="p-6 space-y-4">
        {tours.map((tour) => (
          <motion.div 
            key={tour.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => onTourClick(tour)}
            className="bg-white dark:bg-slate-800 rounded-3xl p-3 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center space-x-4 cursor-pointer hover:shadow-md transition-shadow group"
          >
            <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0">
              <img src={tour.image} alt={tour.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" referrerPolicy="no-referrer" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-hitam-pekat dark:text-white text-sm truncate">{tour.title}</h4>
                <div className="text-pink-pekat font-bold text-sm">
                  <PriceDisplay priceUsd={tour.price} currency={currency} />
                </div>
              </div>
              <div className="flex items-center text-abu-abu dark:text-slate-400 text-[10px] mb-2">
                <MapPin size={10} className="mr-1" />
                {tour.location}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-oren-prosess text-[10px] font-bold">
                  <Star size={10} fill="currentColor" className="mr-1" />
                  {tour.rating}
                  <span className="text-abu-abu dark:text-slate-500 font-normal ml-1">({tour.reviews})</span>
                </div>
                <div className="text-[10px] text-abu-abu dark:text-slate-500 font-medium">
                  {tour.duration}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function DetailsScreen({ tour, onBack, onBook, currency }: { tour: Tour; onBack: () => void; onBook: () => void; currency: Currency }) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    const container = document.querySelector('.overflow-y-auto');
    if (container) {
      container.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col overflow-y-auto dark:bg-slate-900"
    >
      <div className="relative h-80">
        <img 
          src={tour.image} 
          alt={tour.title} 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-white dark:to-slate-900" />
        
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
          <button 
            onClick={onBack}
            className="w-10 h-10 bg-white/20 dark:bg-slate-800/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex space-x-2">
            <button className="w-10 h-10 bg-white/20 dark:bg-slate-800/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30">
              <Heart size={20} />
            </button>
            <button className="w-10 h-10 bg-white/20 dark:bg-slate-800/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30">
              <Info size={20} />
            </button>
          </div>
        </div>

        <div className="absolute bottom-6 left-6 right-6">
          <div className="inline-block px-3 py-1 bg-pink-pekat text-white text-xs font-bold rounded-full mb-3">
            ROAD TRIP
          </div>
          <h2 className="text-hitam-pekat dark:text-white">{tour.title}</h2>
          <div className="flex items-center text-hitam-pekat dark:text-slate-300 mt-2">
            <Calendar size={16} className="mr-2 text-pink-pekat" />
            <span className="text-sm font-medium">Available: 23 - 30 May 2026</span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        <div className="flex items-center justify-between p-4 bg-ungu-muda/20 dark:bg-ungu-pekat/10 rounded-3xl border border-ungu-muda/30 dark:border-ungu-pekat/20">
          <div className="flex items-center space-x-4">
             <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm">
                <div className="w-8 h-8 rounded-full bg-ungu-muda dark:bg-ungu-medium/30 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-ungu-pekat" />
                </div>
             </div>
             <div>
                <div className="text-sm font-bold text-hitam-pekat dark:text-white">{tour.location}</div>
                <div className="text-xs text-abu-abu dark:text-slate-400">1200km • City</div>
             </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-[#E87230]">
              <PriceDisplay priceUsd={tour.price} currency={currency} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center space-x-3">
            <div className="w-10 h-10 bg-ungu-muda/20 dark:bg-ungu-pekat/10 rounded-xl flex items-center justify-center text-ungu-pekat dark:text-ungu-muda">
              <Clock size={20} />
            </div>
            <div>
              <div className="text-xs text-abu-abu dark:text-slate-400">Duration</div>
              <div className="text-sm font-bold text-hitam-pekat dark:text-white">{tour.duration}</div>
            </div>
          </div>
          <div className="p-4 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center space-x-3">
            <div className="w-10 h-10 bg-oren-prosess/10 rounded-xl flex items-center justify-center text-oren-prosess">
              <Star size={20} />
            </div>
            <div>
              <div className="text-xs text-abu-abu dark:text-slate-400">Rating</div>
              <div className="text-sm font-bold text-hitam-pekat dark:text-white">{tour.rating} ({tour.reviews})</div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-4 dark:text-white">Description</h3>
          <p className="text-hitam-pekat dark:text-slate-300 text-body-2 leading-relaxed">
            {tour.description}
          </p>
        </div>

        <div>
          <h3 className="mb-4 dark:text-white">Itinerary</h3>
          <div className="space-y-4 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
            {tour.itinerary?.map((item, idx) => (
              <div key={idx} className="flex items-start space-x-4 relative z-10">
                <div className="mt-1.5 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-pink-pekat flex-shrink-0" />
                <p className="text-hitam-pekat dark:text-slate-300 text-body-2 font-medium">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="p-6 bg-hijau-muda/20 dark:bg-hijau-pekat/5 rounded-3xl border border-hijau-muda/30 dark:border-hijau-pekat/10">
            <h4 className="text-hijau-pekat dark:text-hijau-muda font-bold mb-4 flex items-center">
              <CheckCircle2 size={18} className="mr-2" />
              What's Included
            </h4>
            <ul className="space-y-2">
              {tour.included?.map((item, idx) => (
                <li key={idx} className="text-xs text-hijau-pekat/80 dark:text-hijau-muda/70 flex items-start">
                  <span className="mr-2">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-6 bg-red-50 dark:bg-red-900/5 rounded-3xl border border-red-100 dark:border-red-900/10">
            <h4 className="text-red-600 dark:text-red-400 font-bold mb-4 flex items-center">
              <XCircle size={18} className="mr-2" />
              What's Excluded
            </h4>
            <ul className="space-y-2">
              {tour.excluded?.map((item, idx) => (
                <li key={idx} className="text-xs text-red-600/80 dark:text-red-400/70 flex items-start">
                  <span className="mr-2">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="dark:text-white">Customer Reviews</h3>
            <div className="flex items-center text-oren-prosess font-bold">
              <Star size={18} fill="currentColor" className="mr-1" />
              {tour.rating}
              <span className="text-abu-abu dark:text-slate-400 font-normal text-sm ml-1">({tour.reviews} reviews)</span>
            </div>
          </div>
          
          <div className="space-y-4">
            {[
              { name: "Sarah Johnson", rating: 5, date: "2 days ago", comment: "Absolutely incredible experience! The guide was so knowledgeable and the views were breathtaking." },
              { name: "Michael Chen", rating: 4, date: "1 week ago", comment: "Great tour, well organized. Bali is beautiful. Highly recommended for first timers." }
            ].map((review, idx) => (
              <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold text-sm dark:text-white">{review.name}</div>
                  <div className="text-[10px] text-abu-abu dark:text-slate-500 uppercase font-bold tracking-wider">{review.date}</div>
                </div>
                <div className="flex mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={12} 
                      fill={i < review.rating ? "currentColor" : "none"} 
                      className={i < review.rating ? "text-oren-prosess" : "text-slate-300 dark:text-slate-700"} 
                    />
                  ))}
                </div>
                <p className="text-xs text-hitam-pekat dark:text-slate-400 leading-relaxed">
                  {review.comment}
                </p>
              </div>
            ))}
            <button className="w-full py-3 text-sm font-bold text-ungu-pekat dark:text-ungu-muda border border-ungu-pekat/20 dark:border-ungu-muda/20 rounded-2xl hover:bg-ungu-pekat/5 transition-colors">
              Read All Reviews
            </button>
          </div>
        </div>

        <div className="pt-4">
          <button 
            onClick={onBook}
            className="btn-primary w-full"
          >
            Book This Tour
          </button>
          
          <div className="mt-8 p-6 bg-ungu-muda/10 dark:bg-ungu-pekat/5 rounded-3xl text-center">
            <h4 className="font-display font-bold text-ungu-pekat dark:text-ungu-muda mb-2">Freesiatour Office</h4>
            <p className="text-small text-hitam-pekat dark:text-slate-400 mb-4">
              Padangsambian, Denpasar, Bali Indonesia 80117
            </p>
            <div className="flex items-center justify-center space-x-4">
              <a href="tel:+6289661141114" className="flex items-center space-x-2 text-[#E87230] font-bold">
                <Phone size={18} />
                <span>Call Us</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function BookingScreen({ tour, onBack, onSuccess, onTermsClick, currency, lang }: { tour: Tour; onBack: () => void; onSuccess: () => void; onTermsClick: () => void; currency: Currency; lang: 'en' | 'id' }) {
  const isRideBooking = tour.id.startsWith('shuttle-');
  
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Also scroll the container if it's overflow-y-auto
    const container = document.querySelector('.overflow-y-auto');
    if (container) {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date: '',
    travelers: '' as any,
    pickupAddress: isRideBooking ? tour.location.split(' to ')[0] : '',
    note: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Create WhatsApp message for fallback or just simulate
    const message = `Hi Freesiatour, I'd like to book ${tour.title}.\n\n` +
      `*Booking Details:*\n` +
      `- Name: ${formData.name}\n` +
      `- Phone: ${formData.phone}\n` +
      `- Date: ${formData.date}\n` +
      `- Travelers: ${formData.travelers}\n` +
      `- Pickup: ${formData.pickupAddress}\n` +
      `- Notes: ${formData.note || '-'}\n\n` +
      `Total: ${currency} ${Math.round(isRideBooking ? tour.price : tour.price * (parseInt(formData.travelers as any) || 0)).toLocaleString()}`;

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      
      // Auto-open WhatsApp
      window.open(`https://wa.me/6289661141114?text=${encodeURIComponent(message)}`, '_blank');
    }, 1500);
  };

  if (isSuccess) {
    const message = `Hi Freesiatour, I'd like to book ${tour.title}.\n\n` +
      `*Booking Details:*\n` +
      `- Name: ${formData.name}\n` +
      `- Phone: ${formData.phone}\n` +
      `- Date: ${formData.date}\n` +
      `- Travelers: ${formData.travelers}\n` +
      `- Pickup: ${formData.pickupAddress}\n` +
      `- Notes: ${formData.note || '-'}\n\n` +
      `Total: ${currency} ${Math.round(isRideBooking ? tour.price : tour.price * (parseInt(formData.travelers as any) || 0)).toLocaleString()}`;

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-slate-900"
      >
        <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white mb-6 shadow-lg shadow-emerald-500/20">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="dark:text-white mb-2 text-3xl font-bold">
          {isRideBooking ? (lang === 'en' ? 'Ride Booked!' : 'Ride Berhasil Dipesan!') : (lang === 'en' ? 'Booking Successful!' : 'Pemesanan Berhasil!')}
        </h2>
        <p className="text-hitam-pekat dark:text-slate-300 text-body-2 mb-8">
          {isRideBooking 
            ? (lang === 'en' ? `Your ${tour.title} from ${formData.pickupAddress} has been booked. Please click the button below to send the details to our WhatsApp.` : `Layanan ${tour.title} Anda dari ${formData.pickupAddress} telah dipesan. Silakan klik tombol di bawah untuk mengirim detail ke WhatsApp kami.`)
            : (lang === 'en' ? `Your adventure to ${tour.title} has been booked! Please click the button below to send the details to our WhatsApp.` : `Petualangan Anda ke ${tour.title} telah dipesan! Silakan klik tombol di bawah untuk mengirim detail ke WhatsApp kami.`)}
        </p>

        <div className="w-full space-y-3">
          <button 
            onClick={() => window.open(`https://wa.me/6289661141114?text=${encodeURIComponent(message)}`, '_blank')}
            className="w-full py-4 bg-[#25D366] text-white font-black uppercase tracking-widest text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20 transition-all active:scale-[0.98]"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.067 2.875 1.215 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            {lang === 'en' ? 'Send via WhatsApp' : 'Kirim via WhatsApp'}
          </button>
          
          <button 
            onClick={onSuccess} 
            className="w-full py-4 text-slate-500 font-bold text-sm hover:text-slate-700 transition-all"
          >
            {lang === 'en' ? 'Back to Home' : 'Kembali ke Home'}
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col overflow-y-auto bg-white dark:bg-slate-900"
    >
      <header className="px-6 py-4 flex items-center border-b border-slate-50 dark:border-slate-800 sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md z-10">
        <button onClick={onBack} className="mr-4 text-hitam-pekat dark:text-white">
          <ChevronLeft size={24} />
        </button>
        <h3 className="dark:text-white text-xl font-bold">
          {isRideBooking ? (lang === 'en' ? 'Book Your Ride' : 'Pesan Perjalanan') : (lang === 'en' ? 'Book Your Tour' : 'Pesan Paket Tour')}
        </h3>
      </header>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="bg-ungu-muda/10 dark:bg-ungu-pekat/5 p-4 rounded-2xl flex items-center space-x-4 mb-2">
          <img src={tour.image} alt={tour.title} className="w-16 h-16 rounded-xl object-cover" referrerPolicy="no-referrer" loading="lazy" />
          <div>
            <div className="font-bold text-hitam-pekat dark:text-white">{tour.title}</div>
            <div className="text-xs text-pink-pekat font-bold">
              <PriceDisplay priceUsd={tour.price} currency={currency} /> / {isRideBooking ? (lang === 'en' ? 'vehicle' : 'kendaraan') : (lang === 'en' ? 'person' : 'orang')}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500">Full Name</label>
            <input 
              required
              type="text" 
              placeholder="Enter your name"
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-[#E87230]/20 focus:border-[#E87230] outline-none transition-all"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500">Phone / WhatsApp</label>
            <input 
              required
              type="tel" 
              placeholder="Phone number"
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-[#E87230]/20 focus:border-[#E87230] outline-none transition-all"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500">Pickup Address</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                required
                type="text" 
                placeholder="Enter pickup hotel or address"
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 pl-11 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-[#E87230]/20 focus:border-[#E87230] outline-none transition-all"
                value={formData.pickupAddress}
                onChange={(e) => setFormData({...formData, pickupAddress: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">Travel Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  required
                  type="date" 
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 pl-11 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-[#E87230]/20 focus:border-[#E87230] outline-none transition-all appearance-none"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500">Travelers</label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  required
                  type="number" 
                  min="1"
                  placeholder="Count"
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 pl-11 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-[#E87230]/20 focus:border-[#E87230] outline-none transition-all"
                  value={formData.travelers}
                  onChange={(e) => setFormData({...formData, travelers: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500">Special Notes</label>
            <textarea 
              rows={3}
              placeholder="Any special requests or notes?"
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-[#E87230]/20 focus:border-[#E87230] outline-none transition-all resize-none"
              value={formData.note}
              onChange={(e) => setFormData({...formData, note: e.target.value})}
            />
          </div>
        </div>

        <div className="pt-4">
          <button 
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Processing...</span>
              </>
            ) : (
              <span>{lang === 'en' ? 'Confirm Booking' : 'Konfirmasi Pesanan'} • <PriceDisplay priceUsd={isRideBooking ? tour.price : tour.price * (parseInt(formData.travelers as any) || 0)} currency={currency} /></span>
            )}
          </button>
          <p className="text-center text-xs text-abu-abu mt-4">
            By clicking confirm, you agree to our <button type="button" onClick={onTermsClick} className="text-[#E87230] font-bold hover:underline cursor-pointer">terms and conditions</button>.
          </p>
        </div>
      </form>
    </motion.div>
  );
}

function AboutScreen({ onBack }: { onBack: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col overflow-y-auto bg-white dark:bg-slate-900"
    >
      <header className="px-6 py-4 flex items-center border-b border-slate-50 dark:border-slate-800 sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md z-10">
        <button onClick={onBack} className="mr-4 text-hitam-pekat dark:text-white">
          <ChevronLeft size={24} />
        </button>
        <h3 className="dark:text-white text-xl font-bold">About Us</h3>
      </header>

      <div className="p-8 flex flex-col items-center text-center">
        <div className="w-32 h-32 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-xl mb-8 overflow-hidden">
          <img 
            src="https://res.cloudinary.com/dbckdslrw/image/upload/v1771866888/owner_dbakm3.jpg" 
            alt="Freesiatour Owner" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        </div>

        <h2 className="text-ungu-pekat dark:text-ungu-muda mb-4 text-3xl font-bold">Our Story</h2>
        <p className="text-hitam-pekat dark:text-slate-300 text-body-2 leading-relaxed mb-8">
          Founded in the heart of Bali, Freesiatour began with a simple dream: to share the breathtaking beauty and rich cultural heritage of Indonesia with the world. What started as a small group of passionate travelers has grown into a premier tour provider, dedicated to creating unforgettable journeys across the archipelago.
        </p>

        <div className="w-full grid grid-cols-1 gap-6 text-left">
          <div className="p-6 bg-ungu-muda/10 dark:bg-ungu-pekat/5 rounded-3xl border border-ungu-muda/20">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-pink-pekat rounded-lg flex items-center justify-center text-white">
                <Compass size={18} />
              </div>
              <h4 className="font-bold text-hitam-pekat dark:text-white">Our Mission</h4>
            </div>
            <p className="text-sm text-hitam-pekat dark:text-slate-400">
              To provide authentic, sustainable, and high-quality travel experiences that connect people with the soul of Indonesia while preserving its natural beauty and traditions.
            </p>
          </div>

          <div className="p-6 bg-hijau-muda/20 dark:bg-hijau-pekat/5 rounded-3xl border border-hijau-muda/30">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-hijau-pekat rounded-lg flex items-center justify-center text-white">
                <Star size={18} />
              </div>
              <h4 className="font-bold text-hitam-pekat dark:text-white">Our Values</h4>
            </div>
            <ul className="space-y-2 text-sm text-hitam-pekat dark:text-slate-400">
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 rounded-full bg-hijau-pekat" />
                <span><strong>Authenticity:</strong> Real experiences, real people.</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 rounded-full bg-hijau-pekat" />
                <span><strong>Sustainability:</strong> Protecting our paradise.</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 rounded-full bg-hijau-pekat" />
                <span><strong>Excellence:</strong> Quality in every detail.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 w-full">
          <div className="rounded-3xl overflow-hidden shadow-lg border border-slate-100 dark:border-slate-800 mb-6">
            <img 
              src="https://res.cloudinary.com/dbckdslrw/image/upload/v1771987515/freesiatour_onduty_fobrw2.jpg" 
              alt="Freesiatour on Duty" 
              className="w-full h-auto object-cover"
              referrerPolicy="no-referrer"
              loading="lazy"
            />
          </div>
          <p className="text-xs text-abu-abu dark:text-slate-500 italic">
            "Travel is the only thing you buy that makes you richer."
          </p>
          <div className="mt-4 font-display font-bold text-ungu-pekat dark:text-ungu-muda">
            — The Freesiatour Team
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function FaqScreen({ onBack, lang }: { onBack: () => void; lang: 'en' | 'id' }) {
  const faqs = [
    {
      category: "COMMON QUESTIONS",
      items: [
        {
          q: "What is a Freesiatour Shared Experience?",
          a: "• Unique itineraries crafted local guides\n• Solo travellers don't pay more - flat rates per person\n\nHoliday is friendly."
        },
        {
          q: "What should I do if the driver has not shown up on time?",
          a: "No worries, please contact the number found in booking confirmation email under the 'contact tour operator/guide' section for updates."
        },
        {
          q: "Who should I contact if I need to change my booking information?",
          a: "For changes to your pick-up address, phone number or email, please let your local tour operator know. Their information can be found in booking confirmation email under 'contact tour operator/guide'."
        },
        {
          q: "What should I do if I want to change dates?",
          a: "Contact Freesiatour. Our email: booking@freesiatour.com, Hotline: +62 896 6114 1114, WhatsApp(chat only): +62 896 6114 1114, or talk to us through the online chat. Please note that last minute changes may not be accepted due to late notice."
        }
      ]
    },
    {
      category: "BOOKING PROCESS",
      items: [
        {
          q: "How can I book a tour?",
          a: "Find your preferred tour, click 'see dates' button, select your tour date then number of people, leave your contact information, continue to the payment page, and get your booking confirmation email. Start the adventure!"
        },
        {
          q: "What does 'Instant Confirmation' mean when booking a tour?",
          a: "Some of our tours are marked 'Instant Confirmation', which means you will be able to receive an instant confirmation of your booking via the email address you registered with Freesiatour. You'll also be able to see your confirmed booking, with all the necessary details, on your personal booking dashboard."
        },
        {
          q: "What is the longest that a tour would take to be confirmed?",
          a: "Some of our tours are marked '24 Hour Confirmation', which means that the Tour Operator providing your activity has a period of 24 hours within which accept or reject your booking, depending on their availability. If the Tour Operator accepts your booking, only then will your credit card be processed. If the Tour Operator rejects it, your credit card will not be processed at all."
        },
        {
          q: "What currencies does Freesiatour support?",
          a: "At the moment we only support transactions in U.S. dollars and IDR. If you're from another area, your credit card should automatically convert the amount into your local currency."
        },
        {
          q: "How do I pay for an Activity?",
          a: "You can pay for a Freesiatour activity by most major credit cards."
        },
        {
          q: "Is it possible to pay for an activity in cash or in person?",
          a: "Unfortunately, Freesiatour does not support payments in cash at the moment and our physical offices do not handle ticketing and booking."
        }
      ]
    },
    {
      category: "MODIFY BOOKING",
      items: [
        {
          q: "OK, I've got my confirmation email. What should I do if I need to change booking details?",
          a: "For changes to your pick-up address, phone number or email, please inform local tour operator know. Their information can be found under 'contact tour operator/guide'. If you want to change your tour date, contact Freesiatour through email: booking@freesiatour.com Hotline : +62 896 6114 1114, WhatsApp(chat only): +62 896 6114 1114 talk to us through the online chat. Please note that last minute changes may not be accepted due to late notice."
        }
      ]
    },
    {
      category: "CANCELLATION",
      items: [
        {
          q: "Can I cancel my tour?",
          a: "Yes, please contact Freesiatour and we will offer you final confirmation about the cancellation. Our email: booking@freesiatour.com. Please note that last minute changes may not be accepted due to late notice."
        },
        {
          q: "Can I get a refund for the cancellation?",
          a: "Please contact our support team directly if you need to cancel your tour. Check on the tour page since different cancellation policies apply to different tours. Our team will reply you with the final cancellation confirmation."
        },
        {
          q: "How long it takes to get my refund?",
          a: "Once you get confirmation of cancellation from our team, we will proceed refund within 2 business days, the refund will go back to the platform you originally used to pay to us. You can expect to see the refund reflect on bank statement in approximately 10 business days. For some banks, this process may take up to 30 days. Should you still not have received your refund in your account within these timeframes, please contact our support team directly."
        }
      ]
    },
    {
      category: "REVIEW",
      items: [
        {
          q: "How can I leave a review?",
          a: "One day after your tour, you will receive our email for leaving a review, you can just click on it and write your review. Or you can login to your Freesiatour account, go to my tours, and click 'review my trip' to leave a review."
        }
      ]
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col overflow-y-auto bg-white dark:bg-slate-900"
    >
      <header className="px-6 py-4 flex items-center border-b border-slate-50 dark:border-slate-800 sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md z-10">
        <button onClick={onBack} className="mr-4 text-hitam-pekat dark:text-white">
          <ChevronLeft size={24} />
        </button>
        <h3 className="dark:text-white text-xl font-bold">FAQs</h3>
      </header>

      <div className="p-6 space-y-8 pb-24">
            {faqs?.map((section, idx) => (
          <div key={idx}>
            <h4 className="text-ungu-pekat dark:text-ungu-muda font-bold text-sm uppercase tracking-widest mb-4">
              {section.category}
            </h4>
            <div className="space-y-4">
              {section.items?.map((item, i) => (
                <div key={i} className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                  <h5 className="font-bold text-hitam-pekat dark:text-white mb-2">{item.q}</h5>
                  <p className="text-sm text-abu-abu dark:text-slate-400 whitespace-pre-line leading-relaxed">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-8 p-6 bg-pink-pekat/10 dark:bg-pink-pekat/5 rounded-3xl text-center border border-pink-pekat/20">
          <h4 className="font-bold text-pink-pekat mb-4">Still have questions?</h4>
          <div className="flex justify-center gap-4">
            <a href="https://wa.me/6289661141114" target="_blank" rel="noopener noreferrer" className="w-12 h-12 flex items-center justify-center bg-[#25D366] text-white rounded-2xl shadow-lg shadow-emerald-500/20 hover:scale-110 transition-transform" title="WhatsApp Us">
              <MessageCircle size={24} fill="currentColor" />
            </a>
            <a href="mailto:booking@freesiatour.com" className="w-12 h-12 flex items-center justify-center bg-slate-900 text-white rounded-2xl shadow-lg shadow-slate-900/20 hover:scale-110 transition-transform" title="E-mail Us">
              <Mail size={24} />
            </a>
            <a href="tel:+6289661141114" className="w-12 h-12 flex items-center justify-center bg-[#E87230] text-white rounded-2xl shadow-lg shadow-[#E87230]/20 hover:scale-110 transition-transform" title="Call Us">
              <Phone size={24} />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function TermsScreen({ onBack, lang }: { onBack: () => void; lang: 'en' | 'id' }) {
  const sections = [
    {
      title: "1. AGREEMENT TO TERMS",
      content: "These Terms of Use constitute a legally binding agreement made between you, whether personally or on behalf of an entity (\"you\") and Freesiatour (\"Company,\" \"we,\" \"us,\" or \"our\"), concerning your access to and use of the http://www.freesiatour.com website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the \"Site\"). We are registered in Indonesia and have our registered office at Jalan Gunung Talang VI Perumahan Citra Gunung Talang No 4 Padangsambian, Denpasar, Bali 80117. You agree that by accessing the Site, you have read, understood, and agreed to be bound by all of these Terms of Use."
    },
    {
      title: "2. INTELLECTUAL PROPERTY RIGHTS",
      content: "Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the \"Content\") and the trademarks, service marks, and logos contained therein (the \"Marks\") are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws and various other intellectual property rights and unfair competition laws."
    },
    {
      title: "3. USER REPRESENTATIONS",
      content: "By using the Site, you represent and warrant that: (1) you have the legal capacity and you agree to comply with these Terms of Use; (2) you are not a minor in the jurisdiction in which you reside, or if a minor, you have received parental permission to use the Site; (3) you will not access the Site through automated or non-human means, whether through a bot, script, or otherwise; (4) you will not use the Site for any illegal or unauthorized purpose; and (5) your use of the Site will not violate any applicable law or regulation."
    },
    {
      title: "4. PROHIBITED ACTIVITIES",
      content: "You may not access or use the Site for any purpose other than that for which we make the Site available. The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us. As a user of the Site, you agree not to systematically retrieve data or other content from the Site to create or compile, directly or indirectly, a collection, compilation, database, or directory without written permission from us."
    },
    {
      title: "23. CONTACT US",
      content: "In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us at:\n\nFreesiatour\nJalan Gunung Talang VI Perumahan Citra Gunung Talang No 4 Padangsambian\nDenpasar, Bali 80117\nIndonesia\nPhone: +62 896 6114 1114\nfreesiatour@hotmail.com"
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col overflow-y-auto bg-white dark:bg-slate-900"
    >
      <header className="px-6 py-4 flex items-center border-b border-slate-50 dark:border-slate-800 sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md z-10">
        <button onClick={onBack} className="mr-4 text-hitam-pekat dark:text-white">
          <ChevronLeft size={24} />
        </button>
        <h3 className="dark:text-white text-xl font-bold">Terms & Conditions</h3>
      </header>

      <div className="p-6 space-y-8 pb-24">
        <div className="text-xs text-abu-abu dark:text-slate-400 font-bold uppercase tracking-widest">
          Last updated November 10, 2022
        </div>
        
        <div className="space-y-6">
          {sections.map((section, idx) => (
            <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-100 dark:border-slate-800">
              <h4 className="font-bold text-ungu-pekat dark:text-ungu-muda mb-3 text-lg">{section.title}</h4>
              <p className="text-sm text-hitam-pekat dark:text-slate-300 whitespace-pre-line leading-relaxed">
                {section.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function PrivacyScreen({ onBack, lang }: { onBack: () => void; lang: 'en' | 'id' }) {
  const sections = [
    {
      title: "SUMMARY OF KEY POINTS",
      content: "What personal information do we process? When you visit, use, or navigate our Services, we may process personal information depending on how you interact with Freesiatour and the Services, the choices you make, and the products and features you use.\n\nDo we process any sensitive personal information? We do not process sensitive personal information.\n\nDo we receive any information from third parties? We do not receive any information from third parties.\n\nHow do we process your information? We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law. We may also process your information for other purposes with your consent. We process your information only when we have a valid legal reason to do so.\n\nIn what situations and with which parties do we share personal information? We may share information in specific situations and with specific third parties.\n\nHow do we keep your information safe? We have organizational and technical processes and procedures in place to protect your personal information. However, no electronic transmission over the internet or information storage technology can be guaranteed to be 100% secure, so we cannot promise or guarantee that hackers, cybercriminals, or other unauthorized third parties will not be able to defeat our security and improperly collect, access, steal, or modify your information.\n\nWhat are your rights? Depending on where you are located geographically, the applicable privacy law may mean you have certain rights regarding your personal information.\n\nHow do you exercise your rights? The easiest way to exercise your rights is by filling out our data subject request form or by contacting us. We will consider and act upon any request in accordance with applicable data protection laws."
    },
    {
      title: "1. WHAT INFORMATION DO WE COLLECT?",
      content: "Personal information you disclose to us\n\nIn Short: We collect personal information that you provide to us.\n\nWe collect personal information that you voluntarily provide to us when you express an interest in obtaining information about us or our products and Services, when you participate in activities on the Services, or otherwise when you contact us.\n\nThe personal information that we collect depends on the context of your interactions with us and the Services, the choices you make, and the products and features you use. The personal information we collect may include the following:\n• names\n• phone numbers\n• email addresses\n• debit/credit card numbers\n\nSensitive Information. We do not process sensitive information.\n\nPayment Data. We may collect data necessary to process your payment if you make purchases, such as your payment instrument number, and the security code associated with your payment instrument.\n\nSocial Media Login Data. We may provide you with the option to register with us using your existing social media account details, like your Facebook, Twitter, or other social media account. If you choose to register in this way, we will collect the information described in the section called \"HOW DO WE HANDLE YOUR SOCIAL LOGINS?\" below.\n\nAll personal information that you provide to us must be true, complete, and accurate, and you must notify us of any changes to such personal information.\n\nInformation automatically collected\n\nIn Short: Some information — such as your Internet Protocol (IP) address and/or browser and device characteristics — is collected automatically when you visit our Services.\n\nWe automatically collect certain information when you visit, use, or navigate the Services. This information does not reveal your specific identity (like your name or contact information) but may include device and usage information, such as your IP address, browser and device characteristics, operating system, language preferences, referring URLs, device name, country, location, information about how and when you use our Services, and other technical information. This information is primarily needed to maintain the security and operation of our Services, and for our internal analytics and reporting purposes.\n\nLike many businesses, we also collect information through cookies and similar technologies.\n\nThe information we collect includes:\n• Device Data. We collect device data such as information about your computer, phone, tablet, or other device you use to access the Services. Depending on the device used, this device data may include information such as your IP address (or proxy server), device and application identification numbers, location, browser type, hardware model, Internet service provider and/or mobile carrier, operating system, and system configuration information.\n• Location Data. We collect location data such as information about your device's location, which can be either precise or imprecise. How much information we collect depends on the type and settings of the device you use to access the Services. For example, we may use GPS and other technologies to collect geolocation data that tells us your current location (based on your IP address). You can opt out of allowing us to collect this information either by refusing access to the information or by disabling your Location setting on your device. However, if you choose to opt out, you may not be able to use certain aspects of the Services."
    },
    {
      title: "2. HOW DO WE PROCESS YOUR INFORMATION?",
      content: "In Short: We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law. We may also process your information for other purposes with your consent.\n\nWe process your personal information for a variety of reasons, depending on how you interact with our Services, including:\n• To deliver and facilitate delivery of services to the user. We may process your information to provide you with the requested service.\n• To respond to user inquiries/offer support to users. We may process your information to respond to your inquiries and solve any potential issues you might have with the requested service.\n• To fulfill and manage your orders. We may process your information to fulfill and manage your orders, payments, returns, and exchanges made through the Services.\n• To enable user-to-user communications. We may process your information if you choose to use any of our offerings that allow for communication with another user.\n• To save or protect an individual's vital interest. We may process your information when necessary to save or protect an individual's vital interest, such as to prevent harm."
    },
    {
      title: "3. WHAT LEGAL BASES DO WE RELY ON TO PROCESS YOUR INFORMATION?",
      content: "In Short: We only process your personal information when we believe it is necessary and we have a valid legal reason (i.e., legal basis) to do so under applicable law, like with your consent, to comply with laws, to provide you with services to enter into or fulfill our contractual obligations, to protect your rights, or to fulfill our legitimate business interests.\n\nIf you are located in the EU or UK, this section applies to you.\nThe General Data Protection Regulation (GDPR) and UK GDPR require us to explain the valid legal bases we rely on in order to process your personal information. As such, we may rely on the following legal bases to process your personal information:\n• Consent. We may process your information if you have given us permission (i.e., consent) to use your personal information for a specific purpose. You can withdraw your consent at any time.\n• Performance of a Contract. We may process your personal information when we believe it is necessary to fulfill our contractual obligations to you, including providing our Services or at your request prior to entering into a contract with you.\n• Legal Obligations. We may process your information where we believe it is necessary for compliance with our legal obligations, such as to cooperate with a law enforcement body or regulatory agency, exercise or defend our legal rights, or disclose your information as evidence in litigation in which we are involved.\n• Vital Interests. We may process your information where we believe it is necessary to protect your vital interests or the vital interests of a third party, such as situations involving potential threats to the safety of any person.\n\nIf you are located in Canada, this section applies to you.\nWe may process your information if you have given us specific permission (i.e., express consent) to use your personal information for a specific purpose, or in situations where your permission can be inferred (i.e., implied consent). You can withdraw your consent at any time.\n\nIn some exceptional cases, we may be legally permitted under applicable law to process your information without your consent, including, for example:\n• If collection is clearly in the interests of an individual and consent cannot be obtained in a timely way\n• For investigations and fraud detection and prevention\n• For business transactions provided certain conditions are met\n• If it is contained in a witness statement and the collection is necessary to assess, process, or settle an insurance claim\n• For identifying injured, ill, or deceased persons and communicating with next of kin\n• If we have reasonable grounds to believe an individual has been, is, or may be victim of financial abuse\n• If it is reasonable to expect collection and use with consent would compromise the availability or the accuracy of the information and the collection is reasonable for purposes related to investigating a breach of an agreement or a contravention of the laws of Canada or a province\n• If disclosure is required to comply with a subpoena, warrant, court order, or rules of the court relating to the production of records\n• If it was produced by an individual in the course of their employment, business, or profession and the collection is consistent with the purposes for which the information was produced\n• If the collection is solely for journalistic, artistic, or literary purposes\n• If the information is publicly available and is specified by the regulations"
    },
    {
      title: "4. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?",
      content: "In Short: We may share information in specific situations described in this section and/or with the following third parties.\n\nWe may need to share your personal information in the following situations:\n• Business Transfers. We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.\n• When we use Google Maps Platform APIs. We may share your information with certain Google Maps Platform APIs (e.g., Google Maps API, Places API). To find out more about Google's Privacy Policy, please refer to this link.\n• Business Partners. We may share your information with our business partners to offer you certain products, services, or promotions."
    },
    {
      title: "5. DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?",
      content: "In Short: We may use cookies and other tracking technologies to collect and store your information.\n\nWe may use cookies and similar tracking technologies (like web beacons and pixels) to access or store information. Specific information about how we use such technologies and how you can refuse certain cookies is set out in our Cookie Notice."
    },
    {
      title: "6. HOW DO WE HANDLE YOUR SOCIAL LOGINS?",
      content: "In Short: If you choose to register or log in to our Services using a social media account, we may have access to certain information about you.\n\nOur Services offer you the ability to register and log in using your third-party social media account details (like your Facebook or Twitter logins). Where you choose to do this, we will receive certain profile information about you from your social media provider. The profile information we receive may vary depending on the social media provider concerned, but will often include your name, email address, friends list, and profile picture, as well as other information you choose to make public on such a social media platform.\n\nWe will use the information we receive only for the purposes that are described in this privacy notice or that are otherwise made clear to you on the relevant Services. Please note that we do not control, and are not responsible for, other uses of your personal information by your third-party social media provider. We recommend that you review their privacy notice to understand how they collect, use, and share your personal information, and how you can set your privacy preferences on their sites and apps."
    },
    {
      title: "7. HOW LONG DO WE KEEP YOUR INFORMATION?",
      content: "In Short: We keep your information for as long as necessary to fulfill the purposes outlined in this privacy notice unless otherwise required by law.\n\nWe will only keep your personal information for as long as it is necessary for the purposes set out in this privacy notice, unless a longer retention period is required or permitted by law (such as tax, accounting, or other legal requirements). No purpose in this notice will require us keeping your personal information for longer than 90 days.\n\nWhen we have no ongoing legitimate business need to process your personal information, we will either delete or anonymize such information, or, if this is not possible (for example, because your personal information has been stored in backup archives), then we will securely store your personal information and isolate it from any further processing until deletion is possible."
    },
    {
      title: "8. HOW DO WE KEEP YOUR INFORMATION SAFE?",
      content: "In Short: We aim to protect your personal information through a system of organizational and technical security measures.\n\nWe have implemented appropriate and reasonable technical and organizational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure, so we cannot promise or guarantee that hackers, cybercriminals, or other unauthorized third parties will not be able to defeat our security and improperly collect, access, steal, or modify your information. Although we will do our best to protect your personal information, transmission of personal information to and from our Services is at your own risk. You should only access the Services within a secure environment."
    },
    {
      title: "9. WHAT ARE YOUR PRIVACY RIGHTS?",
      content: "In Short: In some regions, such as the European Economic Area (EEA), United Kingdom (UK), and Canada, you have rights that allow you greater access to and control over your personal information. You may review, change, or terminate your account at any time.\n\nIn some regions (like the EEA, UK, and Canada), you have certain rights under applicable data protection laws. These may include the right (i) to request access and obtain a copy of your personal information, (ii) to request rectification or erasure; (iii) to restrict the processing of your personal information; and (iv) if applicable, to data portability. In certain circumstances, you may also have the right to object to the processing of your personal information. You can make such a request by contacting us by using the contact details provided in the section \"HOW CAN YOU CONTACT US ABOUT THIS NOTICE?\" below.\n\nWe will consider and act upon any request in accordance with applicable data protection laws.\n\nIf you are located in the EEA or UK and you believe we are unlawfully processing your personal information, you also have the right to complain to your local data protection supervisory authority. You can find their contact details here: https://ec.europa.eu/justice/data-protection/bodies/authorities/index_en.htm.\n\nIf you are located in Switzerland, the contact details for the data protection authorities are available here: https://www.edoeb.admin.ch/edoeb/en/home.html.\n\nWithdrawing your consent: If we are relying on your consent to process your personal information, which may be express and/or implied consent depending on the applicable law, you have the right to withdraw your consent at any time. You can withdraw your consent at any time by contacting us by using the contact details provided in the section \"HOW CAN YOU CONTACT US ABOUT THIS NOTICE?\" below.\n\nHowever, please note that this will not affect the lawfulness of the processing before its withdrawal nor, when applicable law allows, will it affect the processing of your personal information conducted in reliance on lawful processing grounds other than consent.\n\nOpting out of marketing and promotional communications: You can unsubscribe from our marketing and promotional communications at any time by clicking on the unsubscribe link in the emails that we send, or by contacting us using the details provided in the section \"HOW CAN YOU CONTACT US ABOUT THIS NOTICE?\" below. You will then be removed from the marketing lists. However, we may still communicate with you — for example, to send you service-related messages that are necessary for the administration and use of your account, to respond to service requests, or for other non-marketing purposes.\n\nIf you have questions or comments about your privacy rights, you may email us at info@freesiatour.com"
    },
    {
      title: "10. CONTROLS FOR DO-NOT-TRACK FEATURES",
      content: "Most web browsers and some mobile operating systems and mobile applications include a Do-Not-Track (\"DNT\") feature or setting you can activate to signal your privacy preference not to have data about your online browsing activities monitored and collected. At this stage no uniform technology standard for recognizing and implementing DNT signals has been finalized. As such, we do not currently respond to DNT browser signals or any other mechanism that automatically communicates your choice not to be tracked online. If a standard for online tracking is adopted that we must follow in the future, we will inform you about that practice in a revised version of this privacy notice."
    },
    {
      title: "11. DO CALIFORNIA RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?",
      content: "In Short: Yes, if you are a resident of California, you are granted specific rights regarding access to your personal information.\n\nCalifornia Civil Code Section 1798.83, also known as the \"Shine The Light\" law, permits our users who are California residents to request and obtain from us, once a year and free of charge, information about categories of personal information (if any) we disclosed to third parties for direct marketing purposes and the names and addresses of all third parties with which we shared personal information in the immediately preceding calendar year. If you are a California resident and would like to make such a request, please submit your request in writing to us using the contact information provided below.\n\nIf you are under 18 years of age, reside in California, and have a registered account with Services, you have the right to request removal of unwanted data that you publicly post on the Services. To request removal of such data, please contact us using the contact information provided below and include the email address associated with your account and a statement that you reside in California. We will make sure the data is not publicly displayed on the Services, but please be aware that the data may not be completely or comprehensively removed from all our systems (e.g., backups, etc.).\n\nCCPA Privacy Notice\n\nThe California Code of Regulations defines a \"resident\" as:\n(1) every individual who is in the State of California for other than a temporary or transitory purpose and\n(2) every individual who is domiciled in the State of California who is outside the State of California for a temporary or transitory purpose\n\nAll other individuals are defined as \"non-residents.\"\n\nIf this definition of \"resident\" applies to you, we must adhere to certain rights and obligations regarding your personal information.\n\nWhat categories of personal information do we collect?\nWe have collected the following categories of personal information in the past twelve (12) months:\n• Identifiers (NO)\n• Personal information categories listed in the California Customer Records statute (NO)\n• Protected classification characteristics under California or federal law (NO)\n• Commercial information (YES)\n• Biometric information (NO)\n• Internet or other similar network activity (NO)\n• Geolocation data (NO)\n• Audio, electronic, visual, thermal, olfactory, or similar information (NO)\n• Professional or employment-related information (NO)\n• Education Information (NO)\n• Inferences drawn from other personal information (NO)\n\nWe may also collect other personal information outside of these categories through instances where you interact with us in person, online, or by phone or mail in the context of:\n• Receiving help through our customer support channels;\n• Participation in customer surveys or contests; and\n• Facilitation in the delivery of our Services and to respond to your inquiries.\n\nHow do we use and share your personal information?\nMore information about our data collection and sharing practices can be found in this privacy notice.\n\nYou may contact us by email at info@freesiatour.com, or by referring to the contact details at the bottom of this document.\n\nIf you are using an authorized agent to exercise your right to opt out we may deny a request if the authorized agent does not submit proof that they have been validly authorized to act on your behalf.\n\nWill your information be shared with anyone else?\nWe may disclose your personal information with our service providers pursuant to a written contract between us and each service provider. Each service provider is a for-profit entity that processes the information on our behalf.\n\nWe may use your personal information for our own business purposes, such as for undertaking internal research for technological development and demonstration. This is not considered to be \"selling\" of your personal information.\n\nFreesiatour has not disclosed or sold any personal information to third parties for a business or commercial purpose in the preceding twelve (12) months. Freesiatour will not sell personal information in the future belonging to website visitors, users, and other consumers.\n\nYour rights with respect to your personal data\n\nRight to request deletion of the data — Request to delete\nYou can ask for the deletion of your personal information. If you ask us to delete your personal information, we will respect your request and delete your personal information, subject to certain exceptions provided by law, such as (but not limited to) the exercise by another consumer of his or her right to free speech, our compliance requirements resulting from a legal obligation, or any processing that may be required to protect against illegal activities.\n\nRight to be informed — Request to know\nDepending on the circumstances, you have a right to know:\n• whether we collect and use your personal information;\n• the categories of personal information that we collect;\n• the purposes for which the collected personal information is used;\n• whether we sell your personal information to third parties;\n• the categories of personal information that we sold or disclosed for a business purpose;\n• the categories of third parties to whom the personal information was sold or disclosed for a business purpose; and\n• the business or commercial purpose for collecting or selling personal information.\n\nIn accordance with applicable law, we are not obligated to provide or delete consumer information that is de-identified in response to a consumer request or to re-identify individual data to verify a consumer request.\n\nRight to Non-Discrimination for the Exercise of a Consumer's Privacy Rights\nWe will not discriminate against you if you exercise your privacy rights.\n\nVerification process\nUpon receiving your request, we will need to verify your identity to determine you are the same person about whom we have the information in our system. These verification efforts require us to ask you to provide information so that we can match it with information you have previously provided us. For instance, depending on the type of request you submit, we may ask you to provide certain information so that we can match the information you provide with the information we already have on file, or we may contact you through a communication method (e.g., phone or email) that you have previously provided to us. We may also use other verification methods as the circumstances dictate.\n\nWe will only use personal information provided in your request to verify your identity or authority to make the request. To the extent possible, we will avoid requesting additional information from you for the purposes of verification. However, if we cannot verify your identity from the information already maintained by us, we may request that you provide additional information for the purposes of verifying your identity and for security or fraud-prevention purposes. We will delete such additionally provided information as soon as we finish verifying you.\n\nOther privacy rights\n• You may object to the processing of your personal information.\n• You may request correction of your personal data if it is incorrect or no longer relevant, or ask to restrict the processing of the information.\n• You can designate an authorized agent to make a request under the CCPA on your behalf. We may deny a request from an authorized agent that does not submit proof that they have been validly authorized to act on your behalf in accordance with the CCPA.\n• You may request to opt out from future selling of your personal information to third parties. Upon receiving an opt-out request, we will act upon the request as soon as feasibly possible, but no later than fifteen (15) days from the date of the request submission.\n\nTo exercise these rights, you can contact us by email at info@freesiatour.com, or by referring to the contact details at the bottom of this document. If you have a complaint about how we handle your data, we would like to hear from you."
    },
    {
      title: "12. DO WE MAKE UPDATES TO THIS NOTICE?",
      content: "In Short: Yes, we will update this notice as necessary to stay compliant with relevant laws.\n\nWe may update this privacy notice from time to time. The updated version will be indicated by an updated \"Revised\" date and the updated version will be effective as soon as it is accessible. If we make material changes to this privacy notice, we may notify you either by prominently posting a notice of such changes or by directly sending you a notification. We encourage you to review this privacy notice frequently to be informed of how we are protecting your information."
    },
    {
      title: "13. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?",
      content: "If you have questions or comments about this notice, you may email us at info@freesiatour.com or by post to:\n\nFreesiatour\nJalan Gunung Talang No 4 Padangsambian\nDenpasar, Bali 80117\nIndonesia"
    },
    {
      title: "14. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?",
      content: "You have the right to request access to the personal information we collect from you, change that information, or delete it. To request to review, update, or delete your personal information, please submit a request form by clicking here."
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col overflow-y-auto bg-white dark:bg-slate-900"
    >
      <header className="px-6 py-4 flex items-center border-b border-slate-50 dark:border-slate-800 sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md z-10">
        <button onClick={onBack} className="mr-4 text-hitam-pekat dark:text-white">
          <ChevronLeft size={24} />
        </button>
        <h3 className="dark:text-white text-xl font-bold">Privacy Notice</h3>
      </header>

      <div className="p-6 space-y-8 pb-24">
        <div className="text-xs text-abu-abu dark:text-slate-400 font-bold uppercase tracking-widest">
          Last updated November 10, 2022
        </div>
        
        <div className="bg-pink-pekat/10 dark:bg-pink-pekat/5 rounded-3xl p-6 border border-pink-pekat/20">
          <p className="text-sm text-hitam-pekat dark:text-slate-300 leading-relaxed">
            This privacy notice for Freesiatour ("Company," "we," "us," or "our"), describes how and why we might collect, store, use, and/or share ("process") your information when you use our services ("Services"), such as when you visit our website at https://www.freesiatour.com, or engage with us in other related ways.
          </p>
        </div>

        <div className="space-y-6">
          {sections.map((section, idx) => (
            <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-6 border border-slate-100 dark:border-slate-800">
              <h4 className="font-bold text-ungu-pekat dark:text-ungu-muda mb-3 text-lg">{section.title}</h4>
              <p className="text-sm text-hitam-pekat dark:text-slate-300 whitespace-pre-line leading-relaxed">
                {section.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function MapScreen({ onTourClick, currency }: { onTourClick: (tour: Tour) => void, currency: Currency }) {
  const [activeTour, setActiveTour] = useState<Tour | null>(null);

  const center = {
    lat: -8.4095, // Bali center
    lng: 115.1889
  };

  const mapOptions = {
    disableDefaultUI: true,
    zoomControl: false,
    styles: [
      {
        "featureType": "all",
        "elementType": "labels.text.fill",
        "stylers": [{ "color": "#7c93a3" }, { "lightness": "-10" }]
      },
      {
        "featureType": "administrative.country",
        "elementType": "geometry",
        "stylers": [{ "visibility": "on" }]
      },
      {
        "featureType": "landscape",
        "elementType": "geometry",
        "stylers": [{ "color": "#f5f5f5" }, { "lightness": "20" }]
      },
      {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [{ "color": "#f5f5f5" }, { "lightness": "21" }]
      },
      {
        "featureType": "road.highway",
        "elementType": "geometry.fill",
        "stylers": [{ "color": "#ffffff" }, { "lightness": "17" }]
      },
      {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [{ "color": "#e9e9e9" }, { "lightness": "17" }]
      }
    ]
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden"
    >
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md z-10">
        <h3 className="dark:text-white text-xl font-bold">Explore Map</h3>
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-pink-pekat/10 flex items-center justify-center text-pink-pekat">
            <MapPin size={16} />
          </div>
          <span className="text-xs font-bold text-hitam-pekat dark:text-white uppercase tracking-wider">Bali, Indonesia</span>
        </div>
      </header>

      <div className="flex-1 relative bg-ungu-muda/5 dark:bg-ungu-pekat/5 overflow-hidden">
        {!hasValidMapKey ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center text-red-500 mb-4">
              <MapPin size={32} />
            </div>
            <h4 className="font-bold text-hitam-pekat dark:text-white mb-2">API Key Missing</h4>
            <p className="text-sm text-abu-abu dark:text-slate-400 max-w-xs">
              Please set your <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">GOOGLE_MAPS_PLATFORM_KEY</code> in the environment variables to enable the map.
            </p>
          </div>
        ) : (
          <Map
            defaultCenter={center}
            defaultZoom={10}
            disableDefaultUI={true}
            mapId="DEMO_MAP_ID"
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            styles={mapOptions.styles}
          >
            {DESTINATIONS.map((marker) => (
              <AdvancedMarker
                key={marker.id}
                position={{ lat: marker.lat, lng: marker.lng }}
                onClick={() => setActiveTour(marker)}
              >
                <Pin 
                  background={activeTour?.id === marker.id ? "#E91E63" : "#9C27B0"}
                  borderColor="#FFFFFF"
                  glyphColor="#FFFFFF"
                  scale={activeTour?.id === marker.id ? 1.2 : 1}
                />
              </AdvancedMarker>
            ))}
          </Map>
        )}

        {/* Tour Preview Card */}
        <AnimatePresence>
          {activeTour && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="absolute bottom-32 left-6 right-6 z-30"
            >
              <div 
                onClick={() => onTourClick(activeTour)}
                className="bg-white dark:bg-slate-800 rounded-3xl p-3 shadow-2xl border border-slate-100 dark:border-slate-700 flex items-center space-x-4 cursor-pointer hover:shadow-pink-pekat/10 transition-shadow"
              >
                <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0">
                  <img src={activeTour.image} alt={activeTour.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-hitam-pekat dark:text-white truncate">{activeTour.title}</h4>
                    <div className="text-pink-pekat font-bold text-sm">
                      <PriceDisplay priceUsd={activeTour.price} currency={currency} />
                    </div>
                  </div>
                  <div className="flex items-center text-abu-abu dark:text-slate-400 text-xs mb-2">
                    <MapPin size={12} className="mr-1" />
                    {activeTour.location}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-oren-prosess text-[10px] font-bold">
                      <Star size={10} fill="currentColor" className="mr-1" />
                      {activeTour.rating}
                    </div>
                    <div className="text-[10px] font-bold text-ungu-pekat dark:text-ungu-muda uppercase tracking-widest">
                      View Details
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Legend/Hint */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-full border border-white/20 dark:border-slate-700/20 text-[10px] font-bold text-abu-abu dark:text-slate-400 uppercase tracking-widest z-10">
          Tap a marker to explore
        </div>
      </div>
    </motion.div>
  );
}

function QrScreen({ onBack }: { onBack: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden"
    >
      <header className="px-6 py-4 flex items-center border-b border-slate-100 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md z-10">
        <h3 className="dark:text-white text-xl font-bold">Scan QR Code</h3>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
        {/* Background Glows */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-pink-pekat/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-ungu-pekat/10 rounded-full blur-3xl animate-pulse delay-700" />

        <div className="relative z-10 w-full max-w-xs aspect-square bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 p-8 flex flex-col items-center justify-center">
          {/* Scanner Frame */}
          <div className="absolute inset-4 border-2 border-dashed border-pink-pekat/30 rounded-[2rem]" />
          
          {/* Corner Accents */}
          <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-pink-pekat rounded-tl-[2.5rem]" />
          <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-pink-pekat rounded-tr-[2.5rem]" />
          <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-pink-pekat rounded-bl-[2.5rem]" />
          <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-pink-pekat rounded-br-[2.5rem]" />

          <QrCode size={120} className="text-hitam-pekat dark:text-white opacity-10 mb-4" />
          <p className="text-xs font-bold text-abu-abu dark:text-slate-400 uppercase tracking-widest text-center">
            Align QR code within frame to scan
          </p>

          {/* Scanning Line Animation */}
          <motion.div 
            animate={{ top: ['10%', '90%', '10%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute left-8 right-8 h-0.5 bg-gradient-to-r from-transparent via-pink-pekat to-transparent shadow-[0_0_15px_rgba(233,30,99,0.8)] z-20"
          />
        </div>

        <div className="mt-12 text-center">
          <h4 className="text-lg font-bold text-hitam-pekat dark:text-white mb-2">My Ticket QR</h4>
          <p className="text-sm text-abu-abu dark:text-slate-400 max-w-[200px]">
            Show this QR code to the tour guide at the meeting point.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function HistoryScreen({ onBack, currency }: { onBack: () => void, currency: Currency }) {
  const historyItems = [
    { id: 1, title: 'Nusa Penida Day Tour', date: '12 Oct 2023', status: 'Completed', price: 45, image: 'https://picsum.photos/seed/nusa/200/200' },
    { id: 2, title: 'Mount Batur Sunrise', date: '05 Sep 2023', status: 'Completed', price: 35, image: 'https://picsum.photos/seed/batur/200/200' },
    { id: 3, title: 'Uluwatu Temple Visit', date: '20 Aug 2023', status: 'Cancelled', price: 25, image: 'https://picsum.photos/seed/uluwatu/200/200' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden"
    >
      <header className="px-6 py-4 flex items-center border-b border-slate-100 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md z-10">
        <h3 className="dark:text-white text-xl font-bold">Booking History</h3>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-32">
        {historyItems.map((item) => (
          <div key={item.id} className="bg-white dark:bg-slate-900 rounded-3xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-hitam-pekat dark:text-white truncate text-sm mb-1">{item.title}</h4>
              <div className="flex items-center text-abu-abu dark:text-slate-400 text-[10px] mb-2">
                <Calendar size={10} className="mr-1" />
                {item.date}
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  item.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                }`}>
                  {item.status}
                </span>
                <span className="text-xs font-bold text-pink-pekat">
                  <PriceDisplay priceUsd={item.price} currency={currency} />
                </span>
              </div>
            </div>
            <ChevronRight size={16} className="text-slate-300" />
          </div>
        ))}

        {historyItems.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-4">
              <History size={32} />
            </div>
            <p className="text-abu-abu dark:text-slate-400 font-medium">No history yet</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ProfileScreen({ onBack }: { onBack: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden"
    >
      <header className="px-6 py-4 flex items-center border-b border-slate-100 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md z-10">
        <h3 className="dark:text-white text-xl font-bold">My Profile</h3>
      </header>

      <div className="flex-1 overflow-y-auto pb-32">
        {/* Profile Header */}
        <div className="p-8 flex flex-col items-center text-center relative">
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-pink-pekat/10 to-transparent" />
          
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-4 border-white dark:border-slate-900 shadow-xl">
              <img src="https://picsum.photos/seed/user/200/200" alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-pink-pekat rounded-xl flex items-center justify-center text-white shadow-lg border-2 border-white dark:border-slate-900">
              <Settings size={14} />
            </div>
          </div>

          <h4 className="text-xl font-bold text-hitam-pekat dark:text-white">John Doe</h4>
          <p className="text-sm text-abu-abu dark:text-slate-400">john.doe@example.com</p>

          <div className="grid grid-cols-3 gap-4 w-full mt-8">
            <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="text-pink-pekat font-bold text-lg">12</div>
              <div className="text-[10px] text-abu-abu dark:text-slate-500 uppercase font-bold tracking-wider">Trips</div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="text-ungu-pekat font-bold text-lg">4.8</div>
              <div className="text-[10px] text-abu-abu dark:text-slate-500 uppercase font-bold tracking-wider">Rating</div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="text-oren-prosess font-bold text-lg">2.4k</div>
              <div className="text-[10px] text-abu-abu dark:text-slate-500 uppercase font-bold tracking-wider">Points</div>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="px-6 space-y-3">
          {[
            { icon: Heart, label: 'My Favorites', color: 'text-pink-pekat', bg: 'bg-pink-pekat/10' },
            { icon: Bell, label: 'Notifications', color: 'text-ungu-pekat', bg: 'bg-ungu-pekat/10' },
            { icon: MapPin, label: 'Saved Locations', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { icon: Settings, label: 'Account Settings', color: 'text-slate-500', bg: 'bg-slate-500/10' },
          ].map((item, idx) => (
            <button key={idx} className="w-full bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:border-pink-pekat/30 transition-colors">
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 ${item.bg} ${item.color} rounded-xl flex items-center justify-center`}>
                  <item.icon size={20} />
                </div>
                <span className="font-bold text-hitam-pekat dark:text-white text-sm">{item.label}</span>
              </div>
              <ChevronRight size={18} className="text-slate-300 group-hover:text-pink-pekat transition-colors" />
            </button>
          ))}
        </div>

        <div className="px-6 mt-8">
          <button className="w-full py-4 bg-slate-100 dark:bg-slate-800 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-500 hover:text-white transition-all">
            Log Out
          </button>
        </div>
      </div>
    </motion.div>
  );
}

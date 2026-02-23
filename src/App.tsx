/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  MapPin, 
  Star, 
  Calendar, 
  ChevronLeft, 
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
  Loader2
} from 'lucide-react';
import { DESTINATIONS, Tour } from './constants';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';

type Screen = 'splash' | 'home' | 'details' | 'booking' | 'about' | 'map';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });
  const [lang, setLang] = useState<'en' | 'id'>('en');

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

  const filteredDestinations = DESTINATIONS.filter(d => 
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContinue = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setScreen('home');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-0 sm:p-4 transition-colors duration-300">
      <div className="mobile-container relative dark:bg-slate-900">
        <AnimatePresence mode="wait">
          {isLoading && (
            <motion.div 
              key="loading-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[100] flex items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm"
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
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              destinations={filteredDestinations}
              isDarkMode={isDarkMode}
              toggleDarkMode={toggleDarkMode}
              onAboutClick={() => setScreen('about')}
              lang={lang}
              toggleLang={() => setLang(lang === 'en' ? 'id' : 'en')}
            />
          )}

          {screen === 'details' && selectedTour && (
            <DetailsScreen 
              tour={selectedTour} 
              onBack={() => setScreen('home')} 
              onBook={() => setScreen('booking')}
            />
          )}

          {screen === 'booking' && selectedTour && (
            <BookingScreen 
              tour={selectedTour} 
              onBack={() => setScreen('details')} 
              onSuccess={() => setScreen('home')}
            />
          )}

          {screen === 'about' && (
            <AboutScreen 
              onBack={() => setScreen('home')} 
            />
          )}

          {screen === 'map' && (
            <MapScreen 
              onTourClick={handleTourClick}
            />
          )}
        </AnimatePresence>

        {/* Navigation Bar (only on home and map) */}
        {(screen === 'home' || screen === 'map') && (
          <nav className="h-16 bg-ungu-pekat text-white flex items-center justify-around px-6 rounded-t-3xl absolute bottom-0 left-0 right-0 z-50 w-full">
            <button 
              onClick={() => setScreen('home')}
              className={`p-2 ${screen === 'home' ? 'text-pink-muda' : 'text-ungu-muda'}`}
            >
              <Home size={20} />
            </button>
            <button className="p-2 text-ungu-muda"><Calendar size={20} /></button>
            <button 
              onClick={() => setScreen('map')}
              className={`bg-pink-pekat p-2.5 rounded-full -mt-8 border-4 border-white dark:border-slate-900 shadow-lg transition-transform active:scale-90 ${screen === 'map' ? 'scale-110' : ''}`}
            >
              <Compass size={20} className="text-white" />
            </button>
            <button className="p-2 text-ungu-muda"><Heart size={20} /></button>
            <button className="p-2 text-ungu-muda"><User size={20} /></button>
          </nav>
        )}
      </div>
    </div>
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
          <h1 className="dark:text-white">
            Welcome to <br />
            <span className="text-pink-pekat">Freesiatour</span>
          </h1>
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

function HomeScreen({ 
  onTourClick, 
  searchQuery, 
  setSearchQuery,
  destinations,
  isDarkMode,
  toggleDarkMode,
  onAboutClick,
  lang,
  toggleLang
}: { 
  onTourClick: (tour: Tour) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  destinations: Tour[];
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onAboutClick: () => void;
  lang: 'en' | 'id';
  toggleLang: () => void;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex-1 flex flex-col overflow-y-auto relative"
      style={{ 
        backgroundImage: `${isDarkMode ? 'linear-gradient(rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.7))' : 'linear-gradient(rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.4))'}, url(https://res.cloudinary.com/dbckdslrw/image/upload/v1771815543/hero-bg_kratyi.webp)`,
        backgroundSize: 'cover',
        backgroundPosition: '45% center',
        backgroundAttachment: 'fixed'
      }}
    >
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-slate-50 dark:border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
            <img 
              src="https://res.cloudinary.com/dbckdslrw/image/upload/v1771789006/freesiatour_logo.png" 
              alt="Freesiatour Logo" 
              className="w-full h-full object-contain p-1"
              referrerPolicy="no-referrer"
              loading="lazy"
              decoding="async"
            />
          </div>
          <span className="font-display font-bold text-xl text-ungu-pekat dark:text-ungu-muda">Freesiatour</span>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={toggleLang}
            className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors font-bold text-xs uppercase"
          >
            {lang}
          </button>
          <button 
            onClick={toggleDarkMode}
            className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      <div className="p-6 pb-20">
        <div className="mb-8">
          <h2 className="dark:text-white">{lang === 'en' ? <>Where do you <br />want to go?</> : <>Ke mana Anda <br />ingin pergi?</>}</h2>
          <div className="mt-6 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-abu-abu" size={20} />
            <input 
              type="text" 
              placeholder={lang === 'en' ? "Search destination..." : "Cari tujuan..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-ungu-muda dark:text-white transition-all"
            />
          </div>
        </div>

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

        <div className="rounded-3xl h-40 relative overflow-hidden group cursor-pointer" onClick={() => onTourClick(DESTINATIONS[0])}>
          <img 
            src={DESTINATIONS[0].image} 
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
          <h3 className="font-bold text-xl dark:text-white">{lang === 'en' ? 'Best Destinations' : 'Destinasi Terbaik'}</h3>
          <button className="text-pink-pekat font-bold text-sm">{lang === 'en' ? 'See All' : 'Lihat Semua'}</button>
        </div>

        {destinations.map((tour) => (
          <motion.div 
            key={tour.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => onTourClick(tour)}
            className="flex items-center p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="w-16 h-16 rounded-xl overflow-hidden mr-4">
              <img src={tour.image} alt={tour.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" loading="lazy" decoding="async" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-hitam-pekat dark:text-white">{tour.title}</h4>
              <div className="flex items-center text-abu-abu dark:text-slate-400 text-xs mt-1">
                <MapPin size={12} className="mr-1" />
                {tour.location}
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-pink-pekat">${tour.price}</div>
              <div className="flex items-center justify-end text-xs text-oren-prosess mt-1">
                <Star size={12} fill="currentColor" className="mr-1" />
                {tour.rating}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      </div>

      <div className="mt-8 p-4 bg-ungu-pekat rounded-3xl text-white flex items-center justify-between">
        <div>
          <div className="text-xs opacity-60 uppercase tracking-widest font-bold mb-1">{lang === 'en' ? 'Contact Us' : 'Hubungi Kami'}</div>
          <div className="font-bold">+62 896-6114-1114</div>
        </div>
        <button className="w-12 h-12 bg-pink-pekat rounded-2xl flex items-center justify-center shadow-lg shadow-pink-pekat/40">
          <Phone size={20} />
        </button>
      </div>

      <button 
        onClick={onAboutClick}
        className="mt-4 w-full p-4 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 flex items-center justify-between group"
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
    </motion.div>
  );
}

function DetailsScreen({ tour, onBack, onBook }: { tour: Tour; onBack: () => void; onBook: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
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
            <div className="text-2xl font-bold text-pink-pekat">${tour.price}</div>
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
          <div className="space-y-4">
            {tour.itinerary.map((item, idx) => (
              <div key={idx} className="flex items-start space-x-4">
                <div className="mt-1 w-2 h-2 rounded-full bg-pink-pekat flex-shrink-0" />
                <p className="text-hitam-pekat dark:text-slate-300 text-body-2 font-medium">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="dark:text-white">Reviews</h3>
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
            className="btn-primary w-full shadow-xl shadow-pink-pekat/30"
          >
            Book This Tour
          </button>
          
          <div className="mt-8 p-6 bg-ungu-muda/10 dark:bg-ungu-pekat/5 rounded-3xl text-center">
            <h4 className="font-display font-bold text-ungu-pekat dark:text-ungu-muda mb-2">Freesiatour Office</h4>
            <p className="text-small text-hitam-pekat dark:text-slate-400 mb-4">
              Padangsambian, Denpasar, Bali Indonesia 80117
            </p>
            <div className="flex items-center justify-center space-x-4">
              <a href="tel:+6289661141114" className="flex items-center space-x-2 text-pink-pekat font-bold">
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

function BookingScreen({ tour, onBack, onSuccess }: { tour: Tour; onBack: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    travelers: '1'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  if (isSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-slate-900"
      >
        <div className="w-20 h-20 bg-hijau-pekat rounded-full flex items-center justify-center text-white mb-6 shadow-lg shadow-hijau-pekat/20">
          <Compass size={40} />
        </div>
        <h2 className="dark:text-white mb-2 text-3xl font-bold">Booking Successful!</h2>
        <p className="text-hitam-pekat dark:text-slate-300 text-body-2 mb-8">
          Your adventure to {tour.title} has been booked. We'll contact you shortly with the details.
        </p>
        <button onClick={onSuccess} className="btn-primary w-full">
          Back to Home
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex-1 flex flex-col overflow-y-auto bg-white dark:bg-slate-900"
    >
      <header className="px-6 py-4 flex items-center border-b border-slate-50 dark:border-slate-800 sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md z-10">
        <button onClick={onBack} className="mr-4 text-hitam-pekat dark:text-white">
          <ChevronLeft size={24} />
        </button>
        <h3 className="dark:text-white text-xl font-bold">Book Your Tour</h3>
      </header>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="bg-ungu-muda/10 dark:bg-ungu-pekat/5 p-4 rounded-2xl flex items-center space-x-4 mb-2">
          <img src={tour.image} alt={tour.title} className="w-16 h-16 rounded-xl object-cover" referrerPolicy="no-referrer" loading="lazy" />
          <div>
            <div className="font-bold text-hitam-pekat dark:text-white">{tour.title}</div>
            <div className="text-xs text-pink-pekat font-bold">${tour.price} / person</div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-abu-abu uppercase tracking-wider mb-2">Full Name</label>
            <input 
              required
              type="text" 
              placeholder="Enter your name"
              className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-4 focus:ring-2 focus:ring-ungu-muda dark:text-white transition-all"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-abu-abu uppercase tracking-wider mb-2">Email</label>
              <input 
                required
                type="email" 
                placeholder="Email address"
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-4 focus:ring-2 focus:ring-ungu-muda dark:text-white transition-all"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-abu-abu uppercase tracking-wider mb-2">Phone</label>
              <input 
                required
                type="tel" 
                placeholder="Phone number"
                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 px-4 focus:ring-2 focus:ring-ungu-muda dark:text-white transition-all"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-abu-abu uppercase tracking-wider mb-2">Travel Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-abu-abu" size={18} />
                <input 
                  required
                  type="date" 
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-ungu-muda dark:text-white transition-all"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-abu-abu uppercase tracking-wider mb-2">Travelers</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-abu-abu" size={18} />
                <select 
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-ungu-muda dark:text-white transition-all appearance-none"
                  value={formData.travelers}
                  onChange={(e) => setFormData({...formData, travelers: e.target.value})}
                >
                  {[1,2,3,4,5,6,7,8,9,10].map(n => (
                    <option key={n} value={n}>{n} {n === 1 ? 'Person' : 'People'}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button 
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full shadow-xl shadow-pink-pekat/30 disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size={20} />
                <span>Processing...</span>
              </>
            ) : (
              <span>Confirm Booking • ${tour.price * parseInt(formData.travelers)}</span>
            )}
          </button>
          <p className="text-center text-xs text-abu-abu mt-4">
            By clicking confirm, you agree to our terms and conditions.
          </p>
        </div>
      </form>
    </motion.div>
  );
}

function AboutScreen({ onBack }: { onBack: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
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
            src="https://res.cloudinary.com/dbckdslrw/image/upload/v1771789006/freesiatour_logo.png" 
            alt="Freesiatour Logo" 
            className="w-full h-full object-contain p-4"
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

function MapScreen({ onTourClick }: { onTourClick: (tour: Tour) => void }) {
  const [activeTour, setActiveTour] = useState<Tour | null>(null);
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: (import.meta as any).env.VITE_GOOGLE_MAPS_API_KEY || ""
  });

  const mapContainerStyle = {
    width: '100%',
    height: '100%'
  };

  const center = {
    lat: -2.5489, // Center of Indonesia
    lng: 118.0149
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
          <span className="text-xs font-bold text-hitam-pekat dark:text-white uppercase tracking-wider">Indonesia</span>
        </div>
      </header>

      <div className="flex-1 relative bg-ungu-muda/5 dark:bg-ungu-pekat/5 overflow-hidden">
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={5}
            options={mapOptions}
          >
            {DESTINATIONS.map((marker) => (
              <MarkerF
                key={marker.id}
                position={{ lat: marker.lat, lng: marker.lng }}
                onClick={() => setActiveTour(marker)}
                icon={{
                  path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
                  fillColor: activeTour?.id === marker.id ? "#E91E63" : "#9C27B0",
                  fillOpacity: 1,
                  strokeWeight: 2,
                  strokeColor: "#FFFFFF",
                  scale: 1.5,
                  anchor: new google.maps.Point(12, 22)
                }}
              />
            ))}
          </GoogleMap>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <LoadingSpinner size={40} className="text-pink-pekat" />
          </div>
        )}

        {/* Tour Preview Card */}
        <AnimatePresence>
          {activeTour && (
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="absolute bottom-20 left-6 right-6 z-30"
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
                    <div className="text-pink-pekat font-bold text-sm">${activeTour.price}</div>
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

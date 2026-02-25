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
  XCircle
} from 'lucide-react';
import { DESTINATIONS, Tour } from './constants';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';

type Screen = 'splash' | 'home' | 'details' | 'booking' | 'about' | 'map' | 'faq' | 'terms' | 'privacy' | 'qr' | 'history' | 'profile' | 'category';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
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
              onCategoryClick={(cat) => {
                setSelectedCategory(cat);
                setScreen('category');
              }}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              destinations={filteredDestinations}
              isDarkMode={isDarkMode}
              toggleDarkMode={toggleDarkMode}
              onAboutClick={() => setScreen('about')}
              onFaqClick={() => setScreen('faq')}
              onTermsClick={() => setScreen('terms')}
              onPrivacyClick={() => setScreen('privacy')}
              lang={lang}
              toggleLang={() => setLang(lang === 'en' ? 'id' : 'en')}
            />
          )}

          {screen === 'category' && (
            <CategoryScreen 
              category={selectedCategory}
              onBack={() => setScreen('home')}
              onTourClick={handleTourClick}
              lang={lang}
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
            <HistoryScreen onBack={() => setScreen('home')} />
          )}

          {screen === 'profile' && (
            <ProfileScreen onBack={() => setScreen('home')} />
          )}

          {screen === 'map' && (
            <MapScreen 
              onTourClick={handleTourClick}
            />
          )}
        </AnimatePresence>

        {/* Navigation Bar (only on main screens) */}
        {(screen === 'home' || screen === 'map' || screen === 'qr' || screen === 'history' || screen === 'profile') && (
          <div className="absolute bottom-4 left-0 right-0 px-4 z-50 pointer-events-none">
            <div className="max-w-md mx-auto relative pointer-events-auto">
              <nav className="h-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl flex items-center justify-around rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/20 dark:border-slate-800/50 relative overflow-visible">
                
                {/* Simple Sliding Indicator */}
                <motion.div 
                  className="absolute bottom-2 left-0 h-1 w-[20%] flex justify-center pointer-events-none"
                  initial={false}
                  animate={{ 
                    x: `${
                      screen === 'home' ? 0 : 
                      screen === 'map' ? 100 : 
                      screen === 'qr' ? 200 :
                      screen === 'history' ? 300 :
                      screen === 'profile' ? 400 :
                      0
                    }%`
                  }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                >
                  <div className="w-1.5 h-1.5 bg-pink-pekat rounded-full shadow-[0_0_10px_rgba(230,0,126,0.5)]" />
                </motion.div>

                {/* Nav Items */}
                {[
                  { id: 'home', icon: Home, label: 'Home' },
                  { id: 'map', icon: Search, label: 'Search' },
                  { id: 'qr', icon: QrCode, label: 'QR Code' },
                  { id: 'history', icon: History, label: 'History' },
                  { id: 'profile', icon: User, label: 'Profile' }
                ].map((item) => {
                  const isActive = screen === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setScreen(item.id as Screen);
                      }}
                      className="relative flex flex-col items-center justify-center w-full h-full z-10"
                    >
                      <motion.div
                        animate={{ 
                          y: isActive ? -2 : 0,
                          scale: isActive ? 1.1 : 1,
                          color: isActive ? '#E6007E' : '#94a3b8'
                        }}
                        className={`p-2 rounded-xl transition-colors ${isActive ? 'text-pink-pekat' : 'text-slate-400 dark:text-slate-500'}`}
                      >
                        <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                      </motion.div>
                      
                      <motion.span
                        initial={false}
                        animate={{ 
                          opacity: isActive ? 1 : 0,
                          y: isActive ? -10 : 10,
                          scale: isActive ? 1 : 0.8
                        }}
                        className="text-[10px] font-bold text-pink-pekat absolute bottom-2"
                      >
                        {item.label}
                      </motion.span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
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
  onCategoryClick,
  searchQuery, 
  setSearchQuery,
  destinations,
  isDarkMode,
  toggleDarkMode,
  onAboutClick,
  onFaqClick,
  onTermsClick,
  onPrivacyClick,
  lang,
  toggleLang
}: { 
  onTourClick: (tour: Tour) => void;
  onCategoryClick: (category: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  destinations: Tour[];
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onAboutClick: () => void;
  onFaqClick: () => void;
  onTermsClick: () => void;
  onPrivacyClick: () => void;
  lang: 'en' | 'id';
  toggleLang: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const highlightedDestinations = DESTINATIONS.filter(d => d.highlighted);

  useEffect(() => {
    setCurrentIndex(0);
    if (highlightedDestinations.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % highlightedDestinations.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [highlightedDestinations.length]);

  const currentTour = highlightedDestinations[currentIndex];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex-1 flex flex-col overflow-y-auto relative"
    >
      <div className="absolute top-0 left-0 right-0 h-[100vh] pointer-events-none z-0">
        <img 
          src="https://res.cloudinary.com/dbckdslrw/image/upload/v1771815543/hero-bg_kratyi.webp" 
          alt="Background" 
          className="w-full h-full object-cover object-[45%_center]"
          referrerPolicy="no-referrer"
        />
        <div className={`absolute inset-0 ${isDarkMode ? 'bg-slate-900/70' : 'bg-white/40'}`} />
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-white to-transparent dark:from-slate-900" />
      </div>
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
          <span className="font-display font-bold text-xl text-[#E87230]">Freesiatour</span>
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

      <div className="p-6 pt-64 pb-20 relative z-10">
        <div className="mb-8">
          <h2 className="text-ungu-pekat dark:text-ungu-muda">{lang === 'en' ? <>Where do you <br />want to go?</> : <>Ke mana Anda <br />ingin pergi?</>}</h2>
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
                        ${currentTour.price}
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
                className="bg-[#E87230] text-white px-8 py-3 rounded-full font-bold text-sm shadow-xl shadow-[#E87230]/40 uppercase tracking-wider"
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

      </div>

      <div className="mt-8 p-4 bg-ungu-pekat rounded-3xl text-white flex items-center justify-between relative z-10 mx-6">
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

      <div className="mt-6 mb-32 mx-6 flex flex-col items-center justify-center relative z-10">
        <div className="text-xs text-abu-abu dark:text-slate-400 mb-3 font-medium uppercase tracking-widest">
          {lang === 'en' ? 'Follow Us' : 'Ikuti Kami'}
        </div>
        <div className="flex items-center space-x-4 mb-6">
          <a href="https://instagram.com/freesiatour" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-pink-pekat shadow-sm border border-slate-100 dark:border-slate-700 hover:bg-pink-pekat hover:text-white transition-colors">
            <Instagram size={18} />
          </a>
          <a href="https://facebook.com/freesiatour" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-ungu-pekat shadow-sm border border-slate-100 dark:border-slate-700 hover:bg-ungu-pekat hover:text-white transition-colors">
            <Facebook size={18} />
          </a>
        </div>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-abu-abu dark:text-slate-400">
          <button onClick={onTermsClick} className="hover:text-pink-pekat transition-colors">Terms & Conditions</button>
          <button onClick={onPrivacyClick} className="hover:text-pink-pekat transition-colors">Privacy Policy</button>
          <button onClick={onFaqClick} className="hover:text-pink-pekat transition-colors">FAQ</button>
        </div>
      </div>
    </motion.div>
  );
}

function CategoryScreen({ 
  category, 
  onBack, 
  onTourClick, 
  lang 
}: { 
  category: string; 
  onBack: () => void; 
  onTourClick: (tour: Tour) => void;
  lang: 'en' | 'id';
}) {
  const tours = DESTINATIONS.filter(d => 
    d.location.toLowerCase().includes(category.toLowerCase()) ||
    d.title.toLowerCase().includes(category.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
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
                <div className="text-pink-pekat font-bold text-sm">${tour.price}</div>
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
          <div className="space-y-4 relative before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
            {tour.itinerary.map((item, idx) => (
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
              {tour.included.map((item, idx) => (
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
              {tour.excluded.map((item, idx) => (
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
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex-1 flex flex-col overflow-y-auto bg-white dark:bg-slate-900"
    >
      <header className="px-6 py-4 flex items-center border-b border-slate-50 dark:border-slate-800 sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md z-10">
        <button onClick={onBack} className="mr-4 text-hitam-pekat dark:text-white">
          <ChevronLeft size={24} />
        </button>
        <h3 className="dark:text-white text-xl font-bold">FAQs</h3>
      </header>

      <div className="p-6 space-y-8 pb-24">
        {faqs.map((section, idx) => (
          <div key={idx}>
            <h4 className="text-ungu-pekat dark:text-ungu-muda font-bold text-sm uppercase tracking-widest mb-4">
              {section.category}
            </h4>
            <div className="space-y-4">
              {section.items.map((item, i) => (
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
          <div className="grid grid-cols-2 gap-3">
            <a href="https://wa.me/6289661141114" target="_blank" rel="noopener noreferrer" className="py-2 px-4 bg-white dark:bg-slate-800 rounded-xl text-xs font-bold text-hitam-pekat dark:text-white shadow-sm border border-slate-100 dark:border-slate-700">
              WhatsApp Us
            </a>
            <a href="mailto:booking@freesiatour.com" className="py-2 px-4 bg-white dark:bg-slate-800 rounded-xl text-xs font-bold text-hitam-pekat dark:text-white shadow-sm border border-slate-100 dark:border-slate-700">
              E-mail Us
            </a>
            <button className="py-2 px-4 bg-white dark:bg-slate-800 rounded-xl text-xs font-bold text-hitam-pekat dark:text-white shadow-sm border border-slate-100 dark:border-slate-700">
              Chat with Us
            </button>
            <a href="tel:+6289661141114" className="py-2 px-4 bg-white dark:bg-slate-800 rounded-xl text-xs font-bold text-hitam-pekat dark:text-white shadow-sm border border-slate-100 dark:border-slate-700">
              Call Us
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
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
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
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
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

function MapScreen({ onTourClick }: { onTourClick: (tour: Tour) => void }) {
  const [activeTour, setActiveTour] = useState<Tour | null>(null);
  const apiKey = (import.meta as any).env.VITE_GOOGLE_MAPS_API_KEY;
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey || ""
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
        {!apiKey ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center text-red-500 mb-4">
              <MapPin size={32} />
            </div>
            <h4 className="font-bold text-hitam-pekat dark:text-white mb-2">API Key Missing</h4>
            <p className="text-sm text-abu-abu dark:text-slate-400 max-w-xs">
              Please set your <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">VITE_GOOGLE_MAPS_API_KEY</code> in the environment variables to enable the map.
            </p>
          </div>
        ) : loadError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center text-red-500 mb-4">
              <Info size={32} />
            </div>
            <h4 className="font-bold text-hitam-pekat dark:text-white mb-2">Map Load Error</h4>
            <p className="text-sm text-abu-abu dark:text-slate-400 max-w-xs mb-4">
              There was an error loading the Google Maps API. This usually means the API key is invalid or the "Maps JavaScript API" is not enabled in your Google Cloud Console.
            </p>
            <a 
              href="https://console.cloud.google.com/google/maps-apis/api/maps-backend.googleapis.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs font-bold text-pink-pekat underline"
            >
              Enable Maps JavaScript API
            </a>
          </div>
        ) : isLoaded ? (
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

function HistoryScreen({ onBack }: { onBack: () => void }) {
  const historyItems = [
    { id: 1, title: 'Nusa Penida Day Tour', date: '12 Oct 2023', status: 'Completed', price: 45, image: 'https://picsum.photos/seed/nusa/200/200' },
    { id: 2, title: 'Mount Batur Sunrise', date: '05 Sep 2023', status: 'Completed', price: 35, image: 'https://picsum.photos/seed/batur/200/200' },
    { id: 3, title: 'Uluwatu Temple Visit', date: '20 Aug 2023', status: 'Cancelled', price: 25, image: 'https://picsum.photos/seed/uluwatu/200/200' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
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
                <span className="text-xs font-bold text-pink-pekat">${item.price}</span>
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
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

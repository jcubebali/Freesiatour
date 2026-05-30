
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas'; // html2canvas doesn't support oklch colors yet
import { 
  Users, 
  Map as MapIcon, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Calendar,
  Clock,
  Briefcase,
  Star,
  Camera,
  User,
  Zap,
  Check,
  X,
  XCircle,
  PlusCircle,
  ArrowRight,
  Share2,
  CreditCard,
  Download,
  RotateCcw,
  Info,
  Car,
  Utensils,
  Lock,
  MessageCircle,
  Search
} from 'lucide-react';
import { useCalculator, QuotationState, Settings } from '../../context/CalculatorContext';
import { CALCULATOR_DESTINATIONS, HOTEL_OPTIONS, Destination } from '../../calculatorData';

interface StepProps {
  onNext: () => void;
  onPrev: () => void;
  lang: 'en' | 'id';
  currency: 'USD' | 'IDR';
}

const formatCurrency = (amountIdr: number, currency: 'USD' | 'IDR', exchangeRate: number = 16000) => {
  if (currency === 'IDR') {
    return `IDR ${amountIdr.toLocaleString('id-ID', { maximumFractionDigits: 0 })}`;
  }
  return `USD ${Math.round(amountIdr / exchangeRate).toLocaleString('en-US')}`;
};

export const getQuotationTotalParts = (quotation: QuotationState, activities: any[], vehicles: any[], destinations: any[], settings: Settings) => {
  const hotel = HOTEL_OPTIONS.find(h => h.id === quotation.hotelId);
  const vehicle = vehicles.find(v => v.id === quotation.vehicleId);
  
  // Check if any selections are made
  const hasSelections = !!(
    quotation.hotelId || 
    quotation.vehicleId || 
    quotation.mealType !== 'None' ||
    quotation.itinerary.some(day => day.destinations.length > 0) ||
    quotation.addons.length > 0 ||
    quotation.customAddons.length > 0
  );

  // 1. Accommodation (Hotel)
  // Assume hotel.price is currently in USD based on values (35, 75, 180)
  // Logic from prompt: Harga Per Malam * Jumlah Malam * Jumlah Kamar
  const hotelPriceIdr = (hotel?.price || 0) * (hotel?.price < 1000 ? settings.exchangeRate : 1);
  const hotelCostIdr = hotelPriceIdr * quotation.hotelNights * quotation.hotelRooms;
  
  // 2. Consumption (Meals)
  // Rumus: Harga Per Makan * Jumlah Pax * Jumlah Hari * Multiplier
  // Multiplier: Lunch only = 1, Both = 2
  let mealMultiplier = 0;
  if (quotation.mealType === 'Lunch') mealMultiplier = 1;
  if (quotation.mealType === 'Both') mealMultiplier = 2;
  const mealCostIdr = settings.mealPriceIdr * quotation.pax * quotation.duration * mealMultiplier;
  
  // 3. Transportation (Vehicle)
  // Rumus: Harga Sewa Per Hari * Jumlah Hari
  const vehicleCostIdr = vehicle ? (vehicle.rate_with_driver_idr || 0) * quotation.duration : 0;
  
  // 4. Jenis Tur (Tour Type)
  // Rumus: Harga Layanan Per Hari * Jumlah Hari
  // Only apply if any selection is made or it's implicitly part of the package
  const tourServiceCostIdr = hasSelections ? settings.tourServiceFeeIdr * quotation.duration : 0;

  // 5. Destinasi (Entrance Fees)
  // Rumus: Total (Harga Tiket Masuk Per Objek * Jumlah Pax)
  let destinationCostIdr = 0;
  quotation.itinerary.forEach((day: any) => {
    day.destinations.forEach((destId: string) => {
      const dest = destinations.find(d => d.id === destId);
      if (dest) {
        destinationCostIdr += (dest.entrance_fee_idr || (dest.price * 15000)) * quotation.pax;
      }
    });
  });
  
  // 6. Aktivitas Tambahan (Addons)
  // Rumus: Total (Harga Aktivitas * Jumlah Pax)
  let addonsCostIdr = 0;
  quotation.addons.forEach((addonId: string) => {
    const activity = activities.find(a => a.id === addonId);
    if (activity) {
      addonsCostIdr += (activity.price_min_idr || (activity.price * 16000)) * quotation.pax;
    }
  });

  quotation.customAddons.forEach(ca => {
    addonsCostIdr += ca.price;
  });

  // Total Nett
  const totalNettIdr = hotelCostIdr + mealCostIdr + vehicleCostIdr + tourServiceCostIdr + destinationCostIdr + addonsCostIdr;
  
  // 2. Markup & Diskon
  // Total Harga = Total Nett * (1 + Markup% - Diskon%)
  const markupRate = settings.markupPercentage / 100;
  const discountRate = quotation.origin === 'Domestic' ? (settings.domesticDiscountPercentage / 100) : 0;
  
  const markupAmountIdr = totalNettIdr * markupRate;
  const discountAmountIdr = totalNettIdr * discountRate;
  
  const finalMultiplier = 1 + markupRate - discountRate;
  const totalIdr = totalNettIdr * finalMultiplier;

  return { 
    hotelCost: hotelCostIdr,
    mealCost: mealCostIdr,
    vehicleCost: vehicleCostIdr,
    tourServiceCost: tourServiceCostIdr,
    destinationCost: destinationCostIdr,
    addonsCost: addonsCostIdr,
    nett: totalNettIdr, 
    markup: markupAmountIdr,
    domesticDiscount: discountAmountIdr,
    total: totalIdr 
  };
};

export const Step1Guest: React.FC<StepProps> = ({ onNext, lang, currency }) => {
  const { quotation, setQuotation, settings } = useCalculator();

  const handleInputChange = (field: string, value: any) => {
    setQuotation({ ...quotation, [field]: value });
  };

  const handleDurationChange = (val: number) => {
    const newDuration = Math.max(1, Math.min(14, quotation.duration + val));
    const newItinerary = [...quotation.itinerary];
    
    if (newDuration > quotation.duration) {
      for (let i = quotation.duration + 1; i <= newDuration; i++) {
        newItinerary.push({ day: i, destinations: [], area: null });
      }
    } else {
      newItinerary.splice(newDuration);
    }
    
    setQuotation({ 
      ...quotation, 
      duration: newDuration, 
      itinerary: newItinerary,
      hotelNights: Math.max(0, newDuration - 1)
    });
  };

  const handlePaxChange = (val: number) => {
    const newPax = Math.max(1, quotation.pax + val);
    setQuotation({
      ...quotation,
      pax: newPax,
      hotelRooms: Math.ceil(newPax / 2)
    });
  };

  const isFormValid = quotation.guestName && quotation.guestPhone && quotation.guestEmail;

  return (
    <>
      <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500 pb-[120px]">
      <div className="text-left mb-4">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="text-[#E87230]">01</span>
          {lang === 'id' ? 'Informasi Tamu' : 'Guest Information'}
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          {lang === 'id' 
            ? 'Berikan detail untuk penawaran harga pribadi Anda.' 
            : 'Provide details for your personalized quotation.'}
        </p>
      </div>

      <div className="space-y-4">
        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-4 flex flex-col">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'id' ? 'Nama Lengkap' : 'Full Name'}</label>
              <input 
                type="text"
                placeholder="John Doe"
                value={quotation.guestName}
                onChange={(e) => handleInputChange('guestName', e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-bali-orange/20 focus:border-bali-orange outline-none transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'id' ? 'Email' : 'Email Address'}</label>
              <input 
                type="email"
                placeholder="john@example.com"
                value={quotation.guestEmail}
                onChange={(e) => handleInputChange('guestEmail', e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-bali-orange/20 focus:border-bali-orange outline-none transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'id' ? 'WhatsApp / No. HP' : 'Contact Number'}</label>
              <input 
                type="tel"
                placeholder="+62..."
                value={quotation.guestPhone}
                onChange={(e) => handleInputChange('guestPhone', e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-bali-orange/20 focus:border-bali-orange outline-none transition-all"
              />
            </div>
            <div className="space-y-1 flex flex-col justify-end">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'id' ? 'Asal' : 'Origin'}</label>
              <div className="flex bg-slate-50 dark:bg-slate-800/50 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                {['Domestic', 'International'].map((o) => (
                  <button
                    key={o}
                    onClick={() => handleInputChange('origin', o)}
                    className={`flex-1 py-1.5 rounded-lg font-medium text-xs transition-all ${
                      quotation.origin === o 
                        ? 'bg-bali-orange text-white shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                  >
                    {o === 'Domestic' ? (lang === 'id' ? 'Domestik' : 'Domestic') : 'International'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Travel Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
           {/* Pax */}
           <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500">
                  <Users size={16} />
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'id' ? 'Tamu' : 'Pax'}</div>
              </div>
              <div className="flex items-center space-x-3">
                <button onClick={() => handlePaxChange(-1)} className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 hover:border-bali-orange hover:text-bali-orange flex items-center justify-center transition-colors">-</button>
                <span className="font-bold text-lg dark:text-white w-4 text-center">{quotation.pax}</span>
                <button onClick={() => handlePaxChange(1)} className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 hover:border-bali-orange hover:text-bali-orange flex items-center justify-center transition-colors">+</button>
              </div>
           </div>

           {/* Date */}
           <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-3 w-full">
              <div className="w-8 h-8 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500 shrink-0">
                <Calendar size={16} />
              </div>
              <div className="flex-1 w-full flex flex-col justify-center">
                <div className="text-[10px] font-bold text-slate-400 mb-0.5 tracking-wider uppercase">{lang === 'id' ? 'Tanggal' : 'Start Date'}</div>
                <input 
                  type="date"
                  value={quotation.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  className="w-full bg-transparent border-0 appearance-none shadow-none outline-none focus:outline-none focus:ring-0 p-0 font-bold text-sm dark:text-white text-slate-800 h-6"
                />
              </div>
           </div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 inset-x-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-40 p-4 sm:p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div className="text-left">
            <div className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest mb-0.5">
              {lang === 'id' ? 'TOTAL BIAYA' : 'TOTAL COST'}
            </div>
            <div className="text-xl sm:text-2xl font-black text-bali-orange tracking-tight">
              {formatCurrency(getQuotationTotalParts(quotation, [], [], [], settings).total, currency, settings.exchangeRate)}
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={onNext}
              disabled={!isFormValid}
              className={`h-11 px-6 sm:px-8 rounded-xl font-bold text-sm transition-all flex items-center justify-center ${
                isFormValid 
                  ? 'bg-black dark:bg-white text-white dark:text-black hover:opacity-80 active:scale-95' 
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              }`}
            >
               <span>{lang === 'id' ? 'Lanjut' : 'Continue'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </>
);
};

export const Step2Preferences: React.FC<StepProps> = ({ onNext, onPrev, lang, currency }) => {
  const { quotation, setQuotation, vehicles, settings } = useCalculator();

  const handleUpdate = (field: string, value: any) => {
    setQuotation({ ...quotation, [field]: value });
  };

  return (
    <>
      <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500 pb-[120px]">
      <div className="text-left mb-4">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="text-[#E87230]">02</span>
          {lang === 'id' ? 'Preferensi Liburan' : 'Holiday Preferences'}
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          {lang === 'id' 
            ? 'Sesuaikan masa menginap dan transportasi Anda.' 
            : 'Customize your stay and transportation.'}
        </p>
      </div>

      <div className="space-y-6">
        {/* Hotel Selection */}
        <div className="space-y-2">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{lang === 'id' ? 'Pilihan Akomodasi' : 'Accommodation Choice'}</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {HOTEL_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleUpdate('hotelId', opt.id)}
                className={`p-5 rounded-2xl border text-left transition-all ${
                  quotation.hotelId === opt.id 
                    ? 'border-bali-orange bg-bali-orange/5 shadow-sm' 
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="font-semibold text-base text-slate-800 dark:text-white">{opt.name}</div>
                <div className="text-xs text-slate-500 mt-1 line-clamp-2">{opt.description}</div>
            <div className="mt-3 text-bali-orange font-bold text-sm">
                  {formatCurrency(opt.price * settings.exchangeRate, currency, settings.exchangeRate)} <span className="text-xs font-normal text-slate-500">/ {lang === 'id' ? 'Malam' : 'Night'}</span>
                </div>
              </button>
            ))}
          </div>
          
          {quotation.hotelId && (
            <div className="grid grid-cols-2 gap-3 pt-2">
               <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="text-xs font-semibold text-slate-500">{lang === 'id' ? 'Malam Menginap' : 'Nights'}</div>
                  <div className="flex items-center space-x-3">
                    <button onClick={() => handleUpdate('hotelNights', Math.max(0, quotation.hotelNights - 1))} className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 flex items-center justify-center hover:text-bali-orange transition-colors">-</button>
                    <span className="font-bold text-slate-800 dark:text-white w-4 text-center">{quotation.hotelNights}</span>
                    <button onClick={() => handleUpdate('hotelNights', quotation.hotelNights + 1)} className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 flex items-center justify-center hover:text-bali-orange transition-colors">+</button>
                  </div>
               </div>
               <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div className="text-xs font-semibold text-slate-500">{lang === 'id' ? 'Jumlah Kamar' : 'Rooms'}</div>
                  <div className="flex items-center space-x-3">
                    <button onClick={() => handleUpdate('hotelRooms', Math.max(1, quotation.hotelRooms - 1))} className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 flex items-center justify-center hover:text-bali-orange transition-colors">-</button>
                    <span className="font-bold text-slate-800 dark:text-white w-4 text-center">{quotation.hotelRooms}</span>
                    <button onClick={() => handleUpdate('hotelRooms', quotation.hotelRooms + 1)} className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 flex items-center justify-center hover:text-bali-orange transition-colors">+</button>
                  </div>
               </div>
            </div>
          )}
        </div>

        {/* Meal Type */}
        <div className="space-y-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl">
          <div>
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">{lang === 'id' ? 'Layanan Makan' : 'Meal Service'}</div>
            <div className="text-[10px] font-bold text-slate-400 mt-0.5">{lang === 'id' ? 'Pilih salah satu atau keduanya' : 'Choose one or both'}</div>
          </div>
          
          <div className="flex items-center gap-6">
            {[
              { id: 'None', label: lang === 'id' ? 'Tanpa Makan' : 'No Meals' },
              { id: 'Lunch', label: 'Lunch' },
              { id: 'Both', label: 'Both' }
            ].map((m) => (
              <label key={m.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="mealType"
                  value={m.id}
                  checked={quotation.mealType === m.id}
                  onChange={() => {
                    handleUpdate('mealType', m.id);
                    if (m.id === 'None') handleUpdate('mealPackage', null);
                  }}
                  className="w-4 h-4 accent-[#E87230] border-slate-300 focus:ring-bali-orange dark:border-slate-600 dark:bg-slate-800"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{m.label}</span>
              </label>
            ))}
          </div>

          <div className={`relative group transition-opacity ${quotation.mealType === 'None' ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            <select
              value={quotation.mealPackage || ''}
              onChange={(e) => handleUpdate('mealPackage', e.target.value)}
              disabled={quotation.mealType === 'None'}
              className="w-full h-12 bg-transparent border border-slate-300 dark:border-slate-700 rounded-xl px-4 text-sm font-medium text-slate-800 dark:text-white appearance-none focus:border-bali-orange focus:ring-1 focus:ring-bali-orange outline-none transition-all cursor-pointer"
            >
              <option value="" disabled>{lang === 'id' ? 'Pilih Paket Makan...' : 'Select Meal Package...'}</option>
              {quotation.mealType !== 'None' && (
                <>
                  <option value="Box Lunch">Box Lunch</option>
                  <option value="Restaurant (Indonesian/Asian)">Restaurant (Indonesian/Asian)</option>
                  <option value="Jimbaran Seafood Dinner">Jimbaran Seafood Dinner</option>
                </>
              )}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <ChevronRight size={16} className="rotate-90" />
            </div>
          </div>
        </div>

        {/* Airport Transfer */}
        <div className="space-y-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl">
          <div>
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">{lang === 'id' ? 'Transfer Bandara' : 'Airport Transfer'}</div>
            <div className="text-[10px] font-bold text-slate-400 mt-0.5">{lang === 'id' ? 'Centang jika butuh penjemputan bandara' : 'Check if airport pickup is needed'}</div>
          </div>
          <label className="flex items-center gap-3 cursor-pointer mt-2">
            <input
              type="checkbox"
              checked={quotation.airportTransfer}
              onChange={(e) => handleUpdate('airportTransfer', e.target.checked)}
              className="w-5 h-5 accent-[#E87230] border-slate-300 rounded focus:ring-bali-orange dark:border-slate-600 dark:bg-slate-800"
            />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{lang === 'id' ? 'Ya, penjemputan bandara' : 'Yes, airport pickup'}</span>
          </label>
        </div>

        {/* Vehicle Selection */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-slate-500">{lang === 'id' ? 'Transportasi' : 'Transportation'}</div>
          <div className="relative group">
            <select
              value={quotation.vehicleId || ''}
              onChange={(e) => handleUpdate('vehicleId', e.target.value)}
              className="w-full h-12 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 text-sm font-medium text-slate-800 dark:text-white appearance-none focus:border-bali-orange focus:ring-1 focus:ring-bali-orange outline-none transition-all cursor-pointer"
            >
              <option value="" disabled>{lang === 'id' ? 'Pilih Kendaraan' : 'Select Vehicle'}</option>
              {[...vehicles].sort((a, b) => (a.seats || 0) - (b.seats || 0)).map((v) => (
                <option key={v.id} value={v.id} className="text-slate-800 dark:text-slate-200">
                  {v.vehicle} ({v.seats} {lang === 'id' ? 'Kursi' : 'Seats'})
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <ChevronRight size={16} className="rotate-90" />
            </div>
          </div>
          
          {quotation.vehicleId && (
            <div className="px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center space-x-3 animate-in fade-in zoom-in-95 duration-300 shadow-sm">
              <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-700">
                <Car size={20} />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm text-slate-800 dark:text-white">
                  {vehicles.find(v => v.id === quotation.vehicleId)?.vehicle}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {vehicles.find(v => v.id === quotation.vehicleId)?.seats} {lang === 'id' ? 'Kursi' : 'Seats'}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 inset-x-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-40 p-4 sm:p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div className="text-left">
            <div className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest mb-0.5">
              {lang === 'id' ? 'TOTAL BIAYA' : 'TOTAL COST'}
            </div>
            <div className="text-xl sm:text-2xl font-black text-bali-orange tracking-tight">
              {formatCurrency(getQuotationTotalParts(quotation, [], vehicles, [], settings).total, currency, settings.exchangeRate)}
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={onPrev} 
              className="px-4 sm:px-6 h-12 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {lang === 'id' ? 'Kembali' : 'Back'}
            </button>
            <button 
              onClick={onNext} 
              className="px-6 sm:px-8 h-12 bg-black dark:bg-white text-white dark:text-black font-bold rounded-xl hover:opacity-80 transition-all mt-0"
            >
              {lang === 'id' ? 'Lanjut' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  </>
);
};

export const Step3Itinerary: React.FC<StepProps> = ({ onNext, onPrev, lang, currency }) => {
  const { quotation, setQuotation, activities, vehicles, destinations, settings } = useCalculator();
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [filterArea, setFilterArea] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(6);
  const [showFullModal, setShowFullModal] = useState(false);

  useEffect(() => {
    setVisibleCount(6);
  }, [selectedDayIndex, searchQuery]);

  const handleDurationSelect = (days: number) => {
    const newItinerary = [...quotation.itinerary];
    if (days > quotation.duration) {
      for (let i = quotation.duration + 1; i <= days; i++) {
        newItinerary.push({ day: i, destinations: [], area: null });
      }
    } else if (days < quotation.duration) {
      newItinerary.splice(days);
      if (selectedDayIndex >= days) {
        setSelectedDayIndex(Math.max(0, days - 1));
      }
    }
    
    setQuotation({ 
      ...quotation, 
      duration: days, 
      itinerary: newItinerary,
      hotelNights: Math.max(0, days - 1)
    });
  };

  const durationOptions = Array.from({ length: 14 }, (_, i) => {
    const d = i + 1;
    const n = Math.max(0, d - 1);
    const label = d === 1 ? '1 Day (No Hotel)' : `${d}D${n}N (${d} Days ${n} Night${n > 1 ? 's' : ''})`;
    return { value: d, label };
  });
  
  const parts = getQuotationTotalParts(quotation, activities, vehicles, destinations, settings);
  const total = parts.total;
  const currentDay = quotation.itinerary[selectedDayIndex] || { day: selectedDayIndex + 1, destinations: [], area: null };

  const toggleDest = (dest: Destination) => {
    const newItinerary = [...quotation.itinerary];
    
    // Ensure all previous days exist if we are adding to a specific day
    for (let i = 0; i <= selectedDayIndex; i++) {
        if (!newItinerary[i]) {
            newItinerary[i] = { day: i + 1, destinations: [], area: null };
        }
    }
    
    const day = newItinerary[selectedDayIndex];
    
    const isSelected = day.destinations.includes(dest.id);
    
    const maxDestinations = quotation.tourType === 'Full Day' ? 3 : 2;
    const isFull = currentDay.destinations.length >= maxDestinations && !isSelected;
    
    if (isFull) return;

    if (isSelected) {
      day.destinations = day.destinations.filter(id => id !== dest.id);
      if (day.destinations.length === 0) day.area = null;
    } else {
      // Logic Check: Max 3 per day
      if (day.destinations.length >= maxDestinations) return;
      
      // Logic Check: Same Area
      if (day.area && day.area !== dest.area) return;
      
      day.destinations.push(dest.id);
      day.area = dest.area;

      if (day.destinations.length === maxDestinations) {
        setShowFullModal(true);
      }
    }
    
    setQuotation({ ...quotation, itinerary: newItinerary });
  };

  const maxDestinations = quotation.tourType === 'Full Day' ? 3 : 2;
  const isDayFull = currentDay.destinations.length >= maxDestinations;

  const filteredDestinations = destinations.filter(d => {
    // Hide destinations from different area if an area is already selected
    if (currentDay.area && d.area !== currentDay.area) return false;
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (d.name || '').toLowerCase().includes(q) || (d.area || '').toLowerCase().includes(q);
    }
    return true;
  });

  const displayedDestinations = filteredDestinations.slice(0, visibleCount);
  const hasMore = visibleCount < filteredDestinations.length;

  return (
    <>
      <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500 pb-[120px]">
      <div className="text-left mb-4">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="text-[#E87230]">03</span>
          {lang === 'id' ? 'Jadwal Tur' : 'Tour Schedule'}
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          {lang === 'id' 
            ? 'Rencanakan petualangan harian Anda di Bali.' 
            : 'Plan your daily adventures in Bali.'}
        </p>
      </div>

      {/* Tour Preferences Card */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-3xl space-y-3">
        <div>
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
            {lang === 'id' ? 'DURASI PAKET' : 'PACKAGE DURATION'}
          </label>
          <div className="relative">
            <select
              value={quotation.duration}
              onChange={(e) => handleDurationSelect(parseInt(e.target.value))}
              className="w-full h-12 bg-transparent border border-slate-200 dark:border-slate-700 rounded-xl px-4 text-sm font-medium text-slate-800 dark:text-white appearance-none focus:border-[#E87230] focus:ring-1 focus:ring-[#E87230] outline-none transition-all cursor-pointer"
            >
              <option disabled value="">{lang === 'id' ? 'Pilih Durasi...' : 'Select Duration...'}</option>
              {durationOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <ChevronRight size={16} className="rotate-90" />
            </div>
          </div>
        </div>

        <div>
           <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
             {lang === 'id' ? 'TIPE TUR' : 'TOUR TYPE'}
           </label>
           <div className="relative">
            <select
              value={quotation.tourType}
              onChange={(e) => setQuotation({...quotation, tourType: e.target.value as 'Full Day' | 'Half Day'})}
              className="w-full h-12 bg-transparent border border-slate-200 dark:border-slate-700 rounded-xl px-4 text-sm font-medium text-slate-800 dark:text-white appearance-none focus:border-[#E87230] focus:ring-1 focus:ring-[#E87230] outline-none transition-all cursor-pointer"
            >
              <option disabled value="">{lang === 'id' ? 'Pilih Tipe Tur...' : 'Select Tour Type...'}</option>
              <option value="Full Day">{lang === 'id' ? 'Tur Sehari Penuh (8-10 Jam)' : 'Full Day Tour (8-10 Hours)'}</option>
              <option value="Half Day">{lang === 'id' ? 'Tur Setengah Hari (4-6 Jam)' : 'Half Day Tour (4-6 Hours)'}</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <ChevronRight size={16} className="rotate-90" />
            </div>
          </div>
        </div>
      </div>

      {/* Day Switcher */}
      <div className="flex gap-2 overflow-x-auto hide-scrollbar snap-x px-1">
        {quotation.itinerary.map((day, idx) => (
          <button
            key={day.day}
            onClick={() => setSelectedDayIndex(idx)}
            className={`px-5 py-3 rounded-xl font-bold text-sm transition-all duration-300 shrink-0 snap-start border ${
              selectedDayIndex === idx 
              ? 'bg-[#E87230] text-white border-[#E87230] shadow-sm' 
              : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800 hover:border-slate-300'
            }`}
          >
            {lang === 'id' ? 'Tur Hari' : 'Tour Day'} {day.day}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        <div className="bg-[#E87230]/5 dark:bg-[#E87230]/10 text-[#E87230] px-4 py-4 rounded-lg font-bold text-[11px] uppercase tracking-wide border-l-4 border-[#E87230]">
          {lang === 'id' 
            ? `PILIH MAKSIMAL ${quotation.tourType === 'Full Day' ? '3' : '2'} DESTINASI UNTUK TUR ${quotation.tourType === 'Full Day' ? '1 HARI' : 'SETENGAH HARI'} DI AREA YANG SAMA.` 
            : `SELECT MAXIMUM ${quotation.tourType === 'Full Day' ? '3' : '2'} DESTINATIONS FOR ${quotation.tourType === 'Full Day' ? '1 DAY' : 'HALF DAY'} TOUR IN THE SAME AREA.`}
        </div>

        {/* Selected List */}
        <div className="flex flex-wrap gap-2 px-2">
          {currentDay.destinations.map(id => {
            const dest = destinations.find(d => d.id === id);
            return (
              <motion.div 
                layoutId={id}
                key={id} 
                className="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full flex items-center space-x-2 border border-slate-200 dark:border-slate-700"
              >
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">{dest?.name}</span>
                <button onClick={() => dest && toggleDest(dest)} className="text-slate-400 hover:text-red-500 transition-colors flex items-center">
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder={lang === 'id' ? "Cari destinasi atau area..." : "Search destination or area..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-4 pl-12 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-[#E87230]/20 focus:border-[#E87230] outline-none transition-all shadow-sm"
          />
        </div>

        {/* Destination Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {displayedDestinations.map((dest) => {
            const isSelected = currentDay.destinations.includes(dest.id);
            const isDifferentArea = currentDay.area && currentDay.area !== dest.area;
            const isFull = currentDay.destinations.length >= maxDestinations && !isSelected;
            const isDisabled = isDifferentArea || isFull;

            return (
              <motion.div
                key={dest.id}
                whileHover={!isDisabled ? { y: -4 } : {}}
                className={`relative cursor-pointer rounded-2xl overflow-hidden group border transition-all aspect-[2/1] shadow-sm ${
                  isSelected ? 'border-bali-orange ring-2 ring-bali-orange/20' : 'border-slate-200 dark:border-slate-800'
                } ${isDisabled ? 'opacity-80' : ''}`}
                onClick={() => !isDisabled && toggleDest(dest)}
              >
                <img src={dest.imageUrl} alt={dest.name} className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${!isSelected ? 'brightness-75' : 'brightness-100'} group-hover:scale-105`} />
                <div className={`absolute inset-0 transition-colors duration-300 ${
                  isSelected ? 'bg-bali-orange/10' : 'bg-gradient-to-t from-slate-900/95 via-slate-900/10 to-transparent'
                }`} />
                
                <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col justify-end text-white">
                  <h4 className="font-bold text-lg sm:text-xl leading-tight drop-shadow-md">{dest.name}</h4>
                  <div className="flex items-center space-x-1.5 opacity-90 mt-1">
                     <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-bali-orange">{dest.area}</span>
                  </div>
                </div>

                {isDisabled && (
                  <div className="absolute inset-0 bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6">
                     <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-2 shadow-sm border border-slate-200 dark:border-slate-700">
                      {isDifferentArea ? <Lock size={16} className="text-slate-400" /> : <X size={16} className="text-slate-400" />}
                     </div>
                     <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                       {isDifferentArea ? (lang === 'id' ? 'Area Berbeda' : 'Area Locked') : (lang === 'id' ? 'Slot Penuh' : 'Day Full')}
                     </span>
                  </div>
                )}

                {isSelected && (
                  <div className="absolute top-4 right-4 w-8 h-8 bg-bali-orange rounded-full flex items-center justify-center shadow-md animate-in zoom-in-50 duration-200">
                    <Check size={16} className="text-white" strokeWidth={3} />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {hasMore && !isDayFull && (
          <div className="flex justify-center mt-2">
            <button
              onClick={() => setVisibleCount(v => v + 6)}
              className="w-full py-4 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-bold text-sm rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {lang === 'id' ? 'Tampilkan Lebih Banyak' : 'Show More Destinations'}
            </button>
          </div>
        )}

        {showFullModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 max-w-md w-full text-center shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 relative">
              <button 
                onClick={() => setShowFullModal(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="w-16 h-16 bg-bali-orange/10 dark:bg-bali-orange/20 rounded-full flex items-center justify-center mx-auto mb-5 text-bali-orange">
                <Check size={32} strokeWidth={3} />
              </div>
              <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
                {lang === 'id' ? 'Slot Hari Ini Penuh!' : 'Today\'s Slot is Full!'}
              </h4>
              <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                {lang === 'id' 
                  ? `Anda telah memilih maksimal ${maxDestinations} destinasi untuk Tur ${quotation.tourType}. Mari lanjut memilih destinasi untuk hari berikutnya atau lanjutkan ke langkah selanjutnya.` 
                  : `You've selected the maximum ${maxDestinations} destinations for a ${quotation.tourType} Tour. Let's pick destinations for the next day or continue to the next step.`}
              </p>
              <div className="flex flex-col gap-3">
                {selectedDayIndex < quotation.itinerary.length - 1 && (
                  <button 
                    onClick={() => {
                      setShowFullModal(false);
                      setSelectedDayIndex(selectedDayIndex + 1);
                      window.scrollTo({ top: 0, behavior: 'instant' });
                    }}
                    className="w-full px-6 py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors shadow-sm"
                  >
                    {lang === 'id' ? 'Lanjut ke Hari ' + (quotation.itinerary[selectedDayIndex + 1].day) : 'Continue to Day ' + (quotation.itinerary[selectedDayIndex + 1].day)}
                  </button>
                )}
                <button 
                  onClick={() => {
                    setShowFullModal(false);
                    onNext();
                  }}
                  className="w-full px-6 py-4 bg-bali-orange text-white font-bold text-sm rounded-xl hover:bg-[#d06225] transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <span>{lang === 'id' ? 'Selesai & Lanjut' : 'Done & Continue'}</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 inset-x-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-40 p-4 sm:p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div className="text-left">
            <div className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest mb-0.5">
              {lang === 'id' ? 'TOTAL BIAYA' : 'TOTAL COST'}
            </div>
            <div className="text-xl sm:text-2xl font-black text-bali-orange tracking-tight">
              {formatCurrency(total, currency, settings.exchangeRate)}
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={onPrev} 
              className="px-4 sm:px-6 h-12 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {lang === 'id' ? 'Kembali' : 'Back'}
            </button>
            <button 
              onClick={onNext} 
              className="px-6 sm:px-8 h-12 bg-black dark:bg-white text-white dark:text-black font-bold rounded-xl hover:opacity-80 transition-all mt-0"
            >
              {lang === 'id' ? 'Lanjut' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  </>
);
};

export const Step4Addons: React.FC<StepProps> = ({ onNext, onPrev, lang, currency }) => {
  const { quotation, setQuotation, activities, vehicles, destinations, settings } = useCalculator();
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(12);
  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState('');

  const toggleAddon = (id: string) => {
    const next = quotation.addons.includes(id)
      ? quotation.addons.filter(a => a !== id)
      : [...quotation.addons, id];
    setQuotation({ ...quotation, addons: next });
  };

  const addCustomAddon = () => {
    if (customName && customPrice && !isNaN(Number(customPrice))) {
      setQuotation({
        ...quotation,
        customAddons: [...quotation.customAddons, { id: Date.now().toString(), name: customName, price: Number(customPrice) }]
      });
      setCustomName('');
      setCustomPrice('');
    }
  };

  const removeCustomAddon = (id: string) => {
    setQuotation({
      ...quotation,
      customAddons: quotation.customAddons.filter(ca => ca.id !== id)
    });
  };

  const filteredActivities = activities.filter(a => {
    if (searchQuery) {
      return a.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const displayedActivities = filteredActivities.slice(0, visibleCount);
  const hasMore = visibleCount < filteredActivities.length;

  const getActivityImage = (activity: any) => {
    if (activity.image) return activity.image;
    if (activity.imageUrl) return activity.imageUrl;
    // placeholder images
    const images = [
      'https://images.unsplash.com/photo-1579208030886-b937fe0925dc?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1530263302096-7bb577ba6914?auto=format&fit=crop&q=80&w=800'
    ];
    return images[activity.name.length % images.length];
  };

  // Calculate the running total
  const parts = getQuotationTotalParts(quotation, activities, vehicles, destinations, settings);
  const currentTotal = parts.total;

  return (
    <>
      <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500 pb-[120px]">
      <div className="text-left mb-4">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="text-[#E87230]">04</span>
          {lang === 'id' ? 'Aktivitas & Ekstra' : 'Activities & Extras'}
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          {lang === 'id' 
            ? 'Sesuaikan paket dengan layanan tambahan favorit Anda.' 
            : 'Customize the package with your favorite add-on services.'}
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-6 rounded-3xl space-y-4 shadow-sm">
        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
          {lang === 'id' ? 'AKTIVITAS TAMBAHAN' : 'ADDITIONAL ACTIVITIES'}
        </label>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            className="w-full h-14 pl-12 pr-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:border-[#E87230] focus:ring-1 focus:ring-[#E87230] transition-colors outline-none dark:text-white"
            placeholder={lang === 'id' ? 'Cari aktivitas...' : 'Search activities...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {displayedActivities.map((activity) => {
            const isSelected = quotation.addons.includes(activity.id);
            return (
              <motion.div
                key={activity.id}
                whileHover={{ y: -4 }}
                className={`relative cursor-pointer rounded-2xl overflow-hidden group border transition-all aspect-[2/1] shadow-sm ${
                  isSelected ? 'border-bali-orange ring-2 ring-bali-orange/20' : 'border-slate-200 dark:border-slate-800'
                }`}
                onClick={() => toggleAddon(activity.id)}
              >
                <img src={getActivityImage(activity)} alt={activity.name} className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${!isSelected ? 'brightness-75' : 'brightness-100'} group-hover:scale-105`} />
                <div className={`absolute inset-0 transition-colors duration-300 ${
                  isSelected ? 'bg-bali-orange/20' : 'bg-gradient-to-t from-slate-900/95 via-slate-900/10 to-transparent'
                }`} />
                
                <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-4 flex flex-col justify-end text-white">
                  <h4 className="font-bold text-[10px] sm:text-xs md:text-sm leading-tight drop-shadow-md uppercase tracking-wide">{activity.name}</h4>
                </div>

                {isSelected && (
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3 w-5 h-5 sm:w-6 sm:h-6 bg-bali-orange rounded-full flex items-center justify-center shadow-md animate-in zoom-in-50 duration-200">
                    <Check size={12} className="text-white sm:w-[14px] sm:h-[14px]" strokeWidth={3} />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {hasMore && (
          <div className="flex justify-center mt-2">
            <button
              onClick={() => setVisibleCount(v => v + 12)}
              className="w-full py-4 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-bold text-sm rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {lang === 'id' ? 'Tampilkan Lebih Banyak' : 'Show More'}
            </button>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-6 shadow-sm text-left">
        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
          {lang === 'id' ? 'BIAYA KUSTOM LAINNYA' : 'OTHER EXTRA COSTS'}
        </label>
        
        <div className="bg-transparent border-2 border-dashed border-slate-200 dark:border-slate-800 p-5 rounded-3xl space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {lang === 'id' ? 'DESKRIPSI BIAYA' : 'COST DESCRIPTION'}
            </label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder={lang === 'id' ? 'Contoh: Bayar Tol' : 'Example: Toll Fee'}
              className="w-full h-12 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-colors outline-none dark:text-white"
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {lang === 'id' ? 'JUMLAH BIAYA (IDR)' : 'COST AMOUNT (IDR)'}
            </label>
            <input
              type="number"
              value={customPrice}
              onChange={(e) => setCustomPrice(e.target.value)}
              placeholder="15000"
              className="w-full h-12 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-colors outline-none dark:text-white"
            />
          </div>

          <button
            onClick={addCustomAddon}
            disabled={!customName || !customPrice}
            className="w-full h-12 bg-slate-100 dark:bg-slate-800 disabled:opacity-50 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 mt-2"
          >
            <span>{lang === 'id' ? 'Tambah Biaya' : 'Add Cost'}</span>
          </button>
        </div>
        
        {quotation.customAddons.length > 0 && (
          <div className="space-y-3 pt-2">
            {quotation.customAddons.map((ca) => (
              <div key={ca.id} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-4 rounded-2xl flex items-center justify-between shadow-sm">
                <div>
                  <div className="font-bold text-sm text-slate-800 dark:text-white mb-0.5">{ca.name}</div>
                  <div className="text-xs font-semibold text-bali-orange">{formatCurrency(ca.price, currency, settings.exchangeRate)}</div>
                </div>
                <button onClick={() => removeCustomAddon(ca.id)} className="w-8 h-8 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 flex items-center justify-center transition-colors">
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-4 shadow-sm text-left">
        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
          {lang === 'id' ? 'CATATAN KHUSUS / PERMINTAAN TAMU' : 'SPECIAL NOTES / GUEST REQUESTS'}
        </label>
        <textarea
          value={quotation.notes || ''}
          onChange={(e) => setQuotation({ ...quotation, notes: e.target.value })}
          placeholder={lang === 'id' ? 'Contoh: Alergi makanan, butuh baby seat, atau permintaan khusus lainnya...' : 'Example: Food allergies, baby seat needed, or other special requests...'}
          className="w-full p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-colors outline-none dark:text-white min-h-[120px] resize-y"
        />
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 inset-x-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-40 p-4 sm:p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div className="text-left">
            <div className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest mb-0.5">
              {lang === 'id' ? 'TOTAL BIAYA' : 'TOTAL COST'}
            </div>
            <div className="text-xl sm:text-2xl font-black text-bali-orange tracking-tight">
              {formatCurrency(currentTotal, currency, settings.exchangeRate)}
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={onPrev} 
              className="px-4 sm:px-6 h-12 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {lang === 'id' ? 'Kembali' : 'Back'}
            </button>
            <button 
              onClick={onNext} 
              className="px-6 sm:px-8 h-12 bg-[#E87230] text-white font-bold rounded-xl hover:opacity-90 transition-all mt-0 shadow-lg shadow-orange-500/20"
            >
              {lang === 'id' ? 'Selesaikan Perhitungan' : 'Complete Calculation'}
            </button>
          </div>
        </div>
      </div>
    </div>
  </>
);
};

export const QuotationSummary: React.FC<{ onReset: () => void, lang: 'en' | 'id', currency: 'USD' | 'IDR' }> = ({ onReset, lang, currency }) => {
  const { quotation, activities, vehicles, destinations, settings } = useCalculator();
  const parts = getQuotationTotalParts(quotation, activities, vehicles, destinations, settings);

  const today = new Date();
  const formattedDate = today.toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const quoteNo = `QTN-${Math.floor(1000 + Math.random() * 9000)}-${today.getFullYear()}`;

  const handleWhatsApp = () => {
    const itinerarySummary = quotation.itinerary
      .map(day => `*Day ${day.day}:* ${day.destinations.map(did => destinations.find(d => d.id === did)?.name).filter(Boolean).join(', ') || 'Free Program'}`)
      .join('\n');

    const addonsList = quotation.addons.map(id => activities.find(a => a.id === id)?.name).filter(Boolean);
    const customAddonsList = quotation.customAddons.map(ca => ca.name);
    const allAddons = [...addonsList, ...customAddonsList].join(', ') || '-';

    const message = `Halo Freesiatour!\n\n` +
      `Saya ingin menanyakan tentang penawaran tour kustom berikut:\n\n` +
      `📌 *Ringkasan Detail*\n` +
      `- No. Quote: ${quoteNo}\n` +
      `- Nama Tamu: ${quotation.guestName || '-'}\n` +
      `- Jumlah Peserta: ${quotation.pax} Pax\n` +
      `- Durasi: ${quotation.duration} Hari\n` +
      `- Urutan Paket: ${quotation.packageType}\n` +
      `- Tanggal Mulai: ${quotation.startDate}\n` +
      `- Tipe Tour: ${quotation.tourType}\n` +
      `- Hotel: ${HOTEL_OPTIONS.find(h => h.id === quotation.hotelId)?.name || 'Tanpa Hotel'}\n` +
      `- Kamar: ${quotation.hotelRooms} | Malam: ${quotation.hotelNights}\n` +
      `- Kendaraan: ${vehicles.find(v => v.id === quotation.vehicleId)?.vehicle || 'Tanpa Kendaraan'}\n` +
      `- Layanan Makan: ${quotation.mealType} (${quotation.mealPackage || 'N/A'})\n` +
      `- Transfer Bandara: ${quotation.airportTransfer ? 'Ya' : 'Tidak'}\n` +
      `- Biaya Tambahan: ${allAddons}\n` +
      `- Total Biaya: *${formatCurrency(parts.total, currency, settings.exchangeRate)}*\n\n` +
      `🗺️ *Rencana Perjalanan*\n` +
      `${itinerarySummary}\n\n` +
      (quotation.notes ? `📝 *Catatan:* ${quotation.notes}\n\n` : ``) +
      `Mohon informasinya lebih lanjut. Terima kasih!`;
    
    const waNumber = "6289661141114";
    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');
  };

  const [isExporting, setIsExporting] = useState(false);

  const handleDownloadPDF = async () => {
    const element = document.getElementById('quotation-document');
    if (!element) return;
    
    setIsExporting(true);
    
    // Total A4 dimensions @ 96 DPI
    const A4_WIDTH_PX = 794; 
    const A4_HEIGHT_PX = 1123;
    
    const originalStyle = {
      width: element.style.width,
      maxWidth: element.style.maxWidth,
      minHeight: element.style.minHeight,
      height: element.style.height,
      padding: element.style.padding,
      borderRadius: element.style.borderRadius,
      boxShadow: element.style.boxShadow,
      border: element.style.border,
      margin: element.style.margin,
      position: element.style.position,
      top: element.style.top,
      left: element.style.left,
      transition: element.style.transition
    };

    try {
      // Remove transitions and shadows for capture
      Object.assign(element.style, {
        transition: 'none',
        boxShadow: 'none',
        borderRadius: '0',
        border: 'none',
        margin: '0',
        width: `${A4_WIDTH_PX}px`,
        maxWidth: `${A4_WIDTH_PX}px`,
        minHeight: `${A4_HEIGHT_PX}px`,
        height: 'auto',
        padding: '0' 
      });

      // Wait for layout shift
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Use toJpeg from html-to-image (supports oklch better)
      const imgData = await toJpeg(element, {
        quality: 1,
        backgroundColor: '#ffffff',
        pixelRatio: 3, // Higher quality
        width: A4_WIDTH_PX,
        cacheBust: true,
        style: {
          margin: '0',
          padding: '0',
          transform: 'none',
          transition: 'none'
        }
      });
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate sizing
      const img = new Image();
      img.src = imgData;
      await new Promise(resolve => img.onload = resolve);
      
      // img.width is A4_WIDTH_PX * 3 (pixelRatio)
      const imgW = img.width / 3;
      const imgH = img.height / 3;
      
      const ratio = pdfWidth / imgW;
      const finalHeight = imgH * ratio;

      // Add to PDF
      // If content is very long, it will be scaled to fit width.
      // We can also handle multi-page if needed, but usually one page is desired for a summary.
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, finalHeight, undefined, 'FAST');
      
      const guestName = quotation.guestName ? `_${quotation.guestName.replace(/\s+/g, '_')}` : '';
      pdf.save(`Freesiatour_Quotation${guestName}.pdf`);
    } catch (error) {
      console.error("PDF Export failed:", error);
      window.print();
    } finally {
      if (element) {
        Object.assign(element.style, originalStyle);
      }
      setIsExporting(false);
    }
  };

  return (
    <>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-32 max-w-4xl mx-auto w-full relative">
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            background: white !important;
          }
          body * { visibility: hidden; }
          #quotation-document, #quotation-document * { 
            visibility: visible; 
          }
          #quotation-document { 
            position: relative; 
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            padding: 10mm;
            background: white !important;
            border: none !important;
            box-shadow: none !important;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
            display: flex;
            flex-direction: column;
          }
          .no-print { display: none !important; }
        }
      `}</style>
      
      {/* Paper Container */}
      <div 
        id="quotation-document" 
        className={`bg-white text-slate-900 shadow-2xl rounded-xl border border-slate-200 overflow-hidden print:shadow-none print:border-none print:m-0 relative ${!isExporting ? 'transition-all duration-300 w-full' : 'w-[794px]'}`}
        style={{ minHeight: isExporting ? '1123px' : 'auto' }}
      >
        {/* Full Page Watermark */}
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-around items-center opacity-[0.04] select-none z-0 overflow-hidden py-10">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="flex gap-24 whitespace-nowrap -rotate-12 items-center">
              {[1,2,3,4].map(j => (
                <div key={j} className="flex items-center gap-4">
                  <img 
                    src="https://res.cloudinary.com/dbckdslrw/image/upload/v1771789006/freesiatour_logo.png" 
                    alt="" 
                    className="w-12 h-12 object-contain"
                  />
                  <span className="text-5xl font-black uppercase tracking-widest">FREESIATOUR</span>
                </div>
              ))}
            </div>
          ))}
        </div>
        
        {/* Content Wrapper */}
        <div className="p-4 sm:p-6 space-y-6 relative z-10">
          {/* Document Header */}
          <div className="flex justify-between items-start gap-4">
            <div className="flex gap-3 items-center">
              <div className="w-12 h-12 bg-white shadow-xl shadow-orange-500/5 flex items-center justify-center rounded-xl shrink-0 border border-slate-100">
                <img 
                  src="https://res.cloudinary.com/dbckdslrw/image/upload/v1771789006/freesiatour_logo.png" 
                  alt="Freesiatour Logo" 
                  className="w-full h-full object-contain p-2"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex flex-col -space-y-0.5">
                <h1 className="font-display text-lg font-black tracking-tighter text-slate-900 leading-none">Freesiatour</h1>
                <p className="font-display text-[8px] font-black text-[#E87230] tracking-[0.05em] uppercase">Holiday is friendly</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="bg-[#E87230] px-4 py-1.5 rounded-lg border-b-2 border-orange-700">
                <span className="text-sm font-black text-white uppercase tracking-tight leading-none block">
                  {lang === 'id' ? 'Penawaran Harga' : 'Quotation'}
                </span>
              </div>
            </div>
          </div>

          {/* Guest/Trip Info - Redesigned Compact Layout */}
          <div className="border border-slate-200 rounded-2xl p-6 space-y-6 bg-white relative shadow-sm">
             {/* Reference Info */}
             <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
                <div>{quoteNo}</div>
                <div>{formattedDate}</div>
             </div>

             {/* Guest Info */}
             <div className="space-y-1">
                <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  {lang === 'id' ? 'Nama Tamu' : 'Guest'}
                </h3>
                <div className="text-2xl font-black text-slate-900 tracking-tight">
                   {quotation.guestName || (lang === 'id' ? 'Nama Tamu' : 'Guest Name')}
                </div>
             </div>

             {/* Trip Summary Grid */}
             <div className="grid grid-cols-4 gap-4 border-t border-slate-100 pt-4">
                <div className="space-y-0.5">
                   <div className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">
                     {lang === 'id' ? 'Tamu' : 'Pax'}
                   </div>
                   <div className="text-sm font-black text-slate-900">{quotation.pax}</div>
                </div>
                <div className="space-y-0.5">
                   <div className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">
                     {lang === 'id' ? 'Hari' : 'Days'}
                   </div>
                   <div className="text-sm font-black text-slate-900">{quotation.duration}</div>
                </div>
                <div className="space-y-0.5">
                   <div className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">
                     {lang === 'id' ? 'Mulai' : 'Start'}
                   </div>
                   <div className="text-sm font-black text-slate-900">{formattedDate}</div>
                </div>
                <div className="space-y-0.5">
                   <div className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">
                     {lang === 'id' ? 'Tipe' : 'Type'}
                   </div>
                   <div className="text-sm font-black text-slate-900">{quotation.tourType}</div>
                </div>
             </div>
                 {/* Itinerary Table */}
          <div className="space-y-1">
             <div className="grid grid-cols-[40px_1fr_60px] pb-1 text-[7px] font-black text-slate-400 uppercase tracking-[0.2em] border-b-2 border-slate-900">
                <div>{lang === 'id' ? 'HARI' : 'DAY'}</div>
                <div>{lang === 'id' ? 'DESKRIPSI PERJALANAN' : 'ITINERARY DESCRIPTION'}</div>
                <div className="text-right">{lang === 'id' ? 'AREA' : 'AREA'}</div>
             </div>
             <div className="divide-y divide-slate-100">
               {quotation.itinerary.length > 0 ? (
                 quotation.itinerary.map((day, idx) => (
                   <div key={idx} className="grid grid-cols-[40px_1fr_60px] py-1.5 items-start hover:bg-slate-50/50 transition-colors px-1 -mx-1 rounded-lg">
                     <div className="text-[10px] font-black text-slate-900 whitespace-nowrap pt-0.5">
                       {lang === 'id' ? 'Hari' : 'Day'} {day.day}
                     </div>
                     <div className="text-[10px] text-slate-600 font-bold leading-tight pr-4">
                       {day.destinations.map(did => destinations.find(d => d.id === did)?.name).filter(Boolean).join(' • ') || (lang === 'id' ? 'Program Bebas / Aktivitas Kustom' : 'Free Program / Custom Activity')}
                     </div>
                     <div className="text-[7px] font-black text-slate-400 text-right uppercase tracking-[0.1em] pt-0.5">{day.area || '-'}</div>
                   </div>
                 ))
               ) : (
                 <div className="py-2 text-center text-[10px] font-bold text-slate-400 italic">
                   {lang === 'id' ? 'Belum ada jadwal yang direncanakan.' : 'No itinerary planned yet.'}
                 </div>
               )}
             </div>
          </div>

          <div className="h-px bg-slate-100 w-full" />

          {/* Details & Inclusions */}
          <div className={`grid grid-cols-1 ${isExporting ? 'grid-cols-[1fr_260px]' : 'lg:grid-cols-[1fr_260px]'} gap-4`}>
            <div className="space-y-4">
              {/* Accommodation & Transport */}
              <div className="flex flex-wrap gap-2">
                 <div className="flex-1 min-w-[140px] p-2 bg-slate-50/50 rounded-lg border border-slate-100 space-y-0">
                    <div className="text-[6px] font-bold text-slate-400 uppercase tracking-widest">
                      {lang === 'id' ? 'AKOMODASI' : 'ACCOMMODATION'}
                    </div>
                    <div className="text-[10px] font-black text-slate-900">
                      {HOTEL_OPTIONS.find(h => h.id === quotation.hotelId)?.name || (lang === 'id' ? 'Tanpa Akomodasi' : 'No Accommodation')}
                    </div>
                 </div>
                 <div className="flex-1 min-w-[140px] p-2 bg-slate-50/50 rounded-lg border border-slate-100 space-y-0">
                    <div className="text-[6px] font-bold text-slate-400 uppercase tracking-widest">
                      {lang === 'id' ? 'TRANSPORTASI' : 'TRANSPORT'}
                    </div>
                    <div className="text-[10px] font-black text-slate-900">
                      {vehicles.find(v => v.id === quotation.vehicleId)?.vehicle || (lang === 'id' ? 'Tanpa Kendaraan' : 'No Vehicle')}
                    </div>
                 </div>
              </div>

              {/* Inclusions / Exclusions */}
              <div className="grid grid-cols-2 gap-2">
                 <div className="space-y-1">
                   <div className="flex items-center gap-1 text-emerald-600">
                      <CheckCircle2 size={10} className="bg-emerald-50 rounded-full" />
                      <span className="text-[8px] font-black uppercase tracking-[0.2em]">
                        {lang === 'id' ? 'TERMASUK' : 'INCLUSIONS'}
                      </span>
                   </div>
                   <ul className="space-y-0.5">
                     {[
                       'Private AC Transportation',
                       'Fuel & Parking Fees',
                       'Driver as Tour Guide',
                       'Entrance Tickets',
                       'Daily Mineral Water'
                     ].map((item, i) => (
                       <li key={i} className="text-[8px] text-slate-500 font-bold flex items-start gap-1.5">
                         <span className="w-1 h-1 bg-emerald-500 rounded-full mt-1 shrink-0" />
                         <span>{item}</span>
                       </li>
                     ))}
                   </ul>
                 </div>
                 <div className="space-y-1">
                   <div className="flex items-center gap-1 text-rose-500">
                      <XCircle size={10} className="bg-rose-50 rounded-full" />
                      <span className="text-[8px] font-black uppercase tracking-[0.2em]">
                        {lang === 'id' ? 'TIDAK TERMASUK' : 'EXCLUSIONS'}
                      </span>
                   </div>
                   <ul className="space-y-0.5">
                     {[
                       'Airfare Tickets',
                       'Personal Expenses',
                       'Tipping (Optional)',
                       'Travel Insurance'
                     ].map((item, i) => (
                       <li key={i} className="text-[8px] text-slate-500 font-bold flex items-start gap-1.5">
                          <span className="w-1 h-1 bg-rose-400 rounded-full mt-1 shrink-0" />
                          <span>{item}</span>
                       </li>
                     ))}
                   </ul>
                 </div>
              </div>
            </div>

            {/* Pricing Section */}
            <div className="space-y-2">
               <div className="bg-white rounded-2xl p-4 border-2 border-slate-900 space-y-2 relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#E87230]/5 rounded-full blur-2xl" />
                  
                  <div className="space-y-2 z-10 relative">
                     {/* Cost Breakdown */}
                     <div className="space-y-1 pb-2 border-b border-slate-100">
                        <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{lang === 'id' ? 'RINCIAN BIAYA' : 'COST BREAKDOWN'}</div>
                        
                        {parts.hotelCost > 0 && (
                          <div className="flex justify-between items-center text-[9px]">
                            <span className="text-slate-500 font-medium">Hotel ({quotation.hotelRooms} {lang === 'id' ? 'Kamar' : 'Room'}, {quotation.hotelNights} {lang === 'id' ? 'Malam' : 'Night'})</span>
                            <span className="font-bold text-slate-900">{formatCurrency(parts.hotelCost, currency, settings.exchangeRate)}</span>
                          </div>
                        )}
                        {parts.vehicleCost > 0 && (
                          <div className="flex justify-between items-center text-[9px]">
                            <span className="text-slate-500 font-medium">Transport ({quotation.duration} {lang === 'id' ? 'Hari' : 'Days'})</span>
                            <span className="font-bold text-slate-900">{formatCurrency(parts.vehicleCost, currency, settings.exchangeRate)}</span>
                          </div>
                        )}
                        {parts.destinationCost > 0 && (
                          <div className="flex justify-between items-center text-[9px]">
                            <span className="text-slate-500 font-medium">{lang === 'id' ? 'Destinasi & Tiket' : 'Destinations & Tickets'}</span>
                            <span className="font-bold text-slate-900">{formatCurrency(parts.destinationCost, currency, settings.exchangeRate)}</span>
                          </div>
                        )}
                        {parts.addonsCost > 0 && (
                          <div className="flex justify-between items-center text-[9px]">
                            <span className="text-slate-500 font-medium">{lang === 'id' ? 'Aktivitas & Ekstra' : 'Activities & Extras'}</span>
                            <span className="font-bold text-slate-900">{formatCurrency(parts.addonsCost, currency, settings.exchangeRate)}</span>
                          </div>
                        )}
                        {parts.mealCost > 0 && (
                          <div className="flex justify-between items-center text-[9px]">
                            <span className="text-slate-500 font-medium">{lang === 'id' ? 'Makan' : 'Meals'} ({quotation.mealType})</span>
                            <span className="font-bold text-slate-900">{formatCurrency(parts.mealCost, currency, settings.exchangeRate)}</span>
                          </div>
                        )}
                        {parts.tourServiceCost > 0 && (
                          <div className="flex justify-between items-center text-[9px]">
                            <span className="text-slate-500 font-medium">{lang === 'id' ? 'Biaya Layanan Tiket & Operasional' : 'Tour Service & Operational Fee'}</span>
                            <span className="font-bold text-slate-900">{formatCurrency(parts.tourServiceCost, currency, settings.exchangeRate)}</span>
                          </div>
                        )}
                        {parts.markup > 0 && (
                          <div className="flex justify-between items-center text-[9px]">
                            <span className="text-slate-500 font-medium">{lang === 'id' ? 'Layanan & Margin' : 'Platform / Margin'} ({settings.markupPercentage}%)</span>
                            <span className="font-bold text-slate-900">{formatCurrency(parts.markup, currency, settings.exchangeRate)}</span>
                          </div>
                        )}
                        {parts.domesticDiscount > 0 && (
                          <div className="flex justify-between items-center text-[9px] text-emerald-600">
                            <span className="font-medium">{lang === 'id' ? 'Diskon Domestik' : 'Domestic Discount'} ({settings.domesticDiscountPercentage}%)</span>
                            <span className="font-bold">-{formatCurrency(parts.domesticDiscount, currency, settings.exchangeRate)}</span>
                          </div>
                        )}
                     </div>
                     
                     <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                       <div className="space-y-0">
                         <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                           {lang === 'id' ? 'HARGA PER TAMU' : 'PRICE PER PAX'}
                         </div>
                         <div className="text-[8px] font-bold text-slate-500 uppercase">{lang === 'id' ? 'Per Orang' : 'Per Person'}</div>
                       </div>
                       <div className="text-right">
                         <div className="text-sm font-black text-slate-900">
                           {formatCurrency(parts.total / quotation.pax, currency, settings.exchangeRate)}
                         </div>
                       </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-0.5">
                       <div className="space-y-0">
                         <div className="text-[9px] font-black text-[#E87230] uppercase tracking-widest">
                           {lang === 'id' ? 'TOTAL AKHIR' : 'GRAND TOTAL'}
                         </div>
                         <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                           {lang === 'id' ? 'SUDAH TERMASUK SEMUANYA' : 'ALL INCLUSIVE'}
                         </div>
                       </div>
                       <div className="text-right">
                         <div className="text-xl font-black text-[#E87230] tabular-nums tracking-tighter">
                            {formatCurrency(parts.total, currency, settings.exchangeRate)}
                         </div>
                       </div>
                    </div>
                    
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <p className="text-[7px] text-slate-500 leading-tight font-bold italic text-center">
                         *{lang === 'id' 
                           ? 'Estimasi total biaya. Harga dapat berubah sewaktu-waktu berdasarkan ketersediaan sebenarnya.' 
                           : 'Estimated total cost. Prices subject to change based on actual availability.'}
                      </p>
                    </div>
                  </div>
               </div>
            </div>

               {/* Signatures */}
               <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-6">
                     <div className="text-[7px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">
                       {lang === 'id' ? 'DIBUAT OLEH' : 'PREPARED BY'}
                     </div>
                     <div className="text-center space-y-1">
                        <div className="h-px bg-slate-200 w-full mb-1" />
                        <div className="text-[8px] font-black text-slate-900 uppercase leading-none text-center">Freesiatour</div>
                     </div>
                  </div>
                  <div className="space-y-6">
                     <div className="text-[7px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">
                       {lang === 'id' ? 'DISETUJUI OLEH' : 'APPROVED BY'}
                     </div>
                     <div className="text-center space-y-1">
                        <div className="h-px bg-slate-200 w-full mb-1" />
                        <div className="text-[8px] font-black text-slate-900 uppercase leading-none text-center">
                          {quotation.guestName || (lang === 'id' ? 'NAMA TAMU' : 'GUEST NAME')}
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
          
          <div className="text-center pt-4 border-t border-slate-50">
             <p className="text-[9px] font-black text-slate-400 italic tracking-wide">
               {lang === 'id' 
                 ? '"Terima kasih telah memilih Freesiatour. Kami menantikan kehadiran Anda di Pulau Dewata."' 
                 : '"Thank you for choosing Freesiatour. We look forward to welcoming you to the Island of Gods."'}
             </p>
          </div>
        </div>
      </div>

      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-5 px-8 py-5 bg-white/80 backdrop-blur-2xl dark:bg-slate-900/80 border border-white dark:border-slate-800 shadow-[0_20px_60px_rgba(0,0,0,0.2)] rounded-[2.5rem] z-50 animate-in fade-in slide-in-from-bottom-4 duration-700 no-print">
         <button 
           onClick={handleDownloadPDF}
           disabled={isExporting}
           className="h-16 px-10 bg-[#E87230] text-white rounded-3xl font-black text-sm uppercase tracking-[0.15em] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 shadow-2xl shadow-orange-500/40 disabled:opacity-50"
         >
           {isExporting ? (
             <>
               <RotateCcw className="animate-spin" size={20} />
               {lang === 'id' ? 'MEMPROSES...' : 'GENERATING...'}
             </>
           ) : (
             <>
               <Download size={22} strokeWidth={2.5} />
               {lang === 'id' ? 'SIMPAN PDF' : 'DOWNLOAD PDF'}
             </>
           )}
         </button>
         
         <div className="h-10 w-px bg-slate-200 dark:bg-slate-800 mx-1" />
         
         <button 
           onClick={handleWhatsApp}
           className="w-16 h-16 bg-[#25D366] text-white rounded-3xl flex items-center justify-center hover:bg-[#22c35e] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-emerald-500/30 group"
           title="Send to WhatsApp"
         >
           <MessageCircle size={32} fill="white" className="transition-transform group-hover:scale-110" />
         </button>
         
         <button 
           onClick={onReset}
           className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-3xl flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 hover:rotate-180 transition-all duration-700 shadow-lg"
           title="Start New Calculation"
         >
           <RotateCcw size={24} strokeWidth={2.5} />
         </button>
      </div>
    </div>
  </>
);
};


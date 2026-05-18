import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { CalculatorProvider } from '../../context/CalculatorContext';
import { 
  Step1Guest, 
  Step2Preferences, 
  Step3Itinerary, 
  Step4Addons, 
  QuotationSummary 
} from './CalculatorComponents';

interface BaliQuoteAppProps {
  lang: 'en' | 'id';
  currency: 'USD' | 'IDR';
  onClose: () => void;
}

const AppContent: React.FC<BaliQuoteAppProps> = ({ lang, currency, onClose }) => {
  const [step, setStep] = useState(1);

  const resetCalculator = () => {
    setStep(1);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 absolute inset-0 z-50">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-40 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
               <span className="font-display font-black text-[#E87230] dark:text-white uppercase leading-none tracking-tight">FREESIATOUR</span>
               <span className="text-sm font-medium text-slate-500 dark:text-slate-400">| Trip Planner</span>
            </h1>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 lg:p-8">
        <div className="mb-8">
          {/* Progress Bar */}
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
               <motion.div 
                 className="h-full bg-pink-500 rounded-full"
                 initial={{ width: `${((step - 1) / 4) * 100}%` }}
                 animate={{ width: `${((step - 1) / 4) * 100}%` }}
                 transition={{ duration: 0.3 }}
               />
            </div>
            {[1, 2, 3, 4, 5].map((s) => (
              <div 
                key={s} 
                className={`relative z-10 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm transition-colors duration-300 ${
                  s === step ? 'bg-pink-500 text-white border-2 border-pink-200 dark:border-pink-800' :
                  s < step ? 'bg-pink-600 text-white' : 
                  'bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-400'
                }`}
              >
                {s < step ? <span className="text-white relative top-[1px]">✓</span> : s}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 p-6 md:p-8 min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {step === 1 && <Step1Guest onNext={() => setStep(2)} lang={lang} currency={currency} />}
              {step === 2 && <Step2Preferences onNext={() => setStep(3)} onPrev={() => setStep(1)} lang={lang} currency={currency} />}
              {step === 3 && <Step3Itinerary onNext={() => setStep(4)} onPrev={() => setStep(2)} lang={lang} currency={currency} />}
              {step === 4 && <Step4Addons onNext={() => setStep(5)} onPrev={() => setStep(3)} lang={lang} currency={currency} />}
              {step === 5 && <QuotationSummary onReset={resetCalculator} lang={lang} currency={currency} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default function BaliQuoteApp(props: BaliQuoteAppProps) {
  return (
    <CalculatorProvider>
      <AppContent {...props} />
    </CalculatorProvider>
  );
}

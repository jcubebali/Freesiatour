import React, { useState, useRef, useEffect } from 'react';
import { CalculatorProvider, useCalculator, INITIAL_QUOTATION as getDefaultQuotation } from '../context/CalculatorContext';
import { 
  Step1Guest, 
  Step2Preferences, 
  Step3Itinerary, 
  Step4Addons, 
  QuotationSummary 
} from '../components/calculator/CalculatorComponents';
import { Settings, ChevronLeft, X } from 'lucide-react';
import { QuotationState } from '../context/CalculatorContext';
import { motion } from 'motion/react';

const Layout: React.FC<{ 
  children: React.ReactNode, 
  currentStep: number, 
  onNext: () => void, 
  onPrev: () => void, 
  onOpenAdmin: () => void,
  isSummary?: boolean 
}> = ({ children, currentStep, onPrev, onOpenAdmin, isSummary }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentStep, isSummary]);

  return (
    <div ref={scrollRef} className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900 overflow-y-auto">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/50">
        <button onClick={onPrev} className="text-slate-600 dark:text-slate-300 w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm transition-transform hover:scale-105">
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1 text-center">
          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-wide uppercase">Freesiatour</h3>
          {!isSummary && (
            <div className="flex justify-center mt-1.5 space-x-1.5">
              {[1, 2, 3, 4].map((s) => (
                <div 
                  key={s} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    s === currentStep ? 'w-6 bg-bali-orange' : 
                    s < currentStep ? 'w-2 bg-bali-orange/40' : 'w-2 bg-slate-200 dark:bg-slate-700'
                  }`} 
                />
              ))}
            </div>
          )}
        </div>
        <button onClick={onOpenAdmin} className="text-slate-400 w-10 h-10 flex items-center justify-center hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
          <Settings size={20} />
        </button>
      </header>
      <div className="p-4 sm:p-6 pb-24 max-w-3xl mx-auto w-full">
        {children}
      </div>
    </div>
  );
};

const AdminPanel: React.FC<{ onClose: () => void, onSelectQuotation: (q: QuotationState) => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-900 flex flex-col p-6">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold dark:text-white">Admin Panel</h2>
        <button onClick={onClose} className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
          <X size={24} />
        </button>
      </div>
      <div className="flex-1 flex items-center justify-center text-slate-400 text-sm italic">
        History and Admin features are currently under development.
      </div>
    </div>
  );
};

const CalculatorApp: React.FC<{ lang: 'en' | 'id', currency: 'USD' | 'IDR', onClose?: () => void }> = ({ lang, currency, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showSummary, setShowSummary] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const { setQuotation } = useCalculator();

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    } else {
      setShowSummary(true);
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else if (onClose) {
      onClose();
    }
  };

  const handleReset = () => {
    setQuotation(getDefaultQuotation);
    setCurrentStep(1);
    setShowSummary(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  if (showAdmin) {
    return <AdminPanel onClose={() => setShowAdmin(false)} onSelectQuotation={() => {}} />;
  }

  if (showSummary) {
    return (
      <Layout currentStep={4} onNext={() => {}} onPrev={() => setShowSummary(false)} onOpenAdmin={() => setShowAdmin(true)} isSummary={true}>
        <QuotationSummary onReset={handleReset} lang={lang} currency={currency} />
      </Layout>
    );
  }

  return (
    <Layout currentStep={currentStep} onNext={handleNext} onPrev={handlePrev} onOpenAdmin={() => setShowAdmin(true)}>
      {currentStep === 1 && <Step1Guest onNext={handleNext} onPrev={handlePrev} lang={lang} currency={currency} />}
      {currentStep === 2 && <Step2Preferences onNext={handleNext} onPrev={handlePrev} lang={lang} currency={currency} />}
      {currentStep === 3 && <Step3Itinerary onNext={handleNext} onPrev={handlePrev} lang={lang} currency={currency} />}
      {currentStep === 4 && <Step4Addons onNext={handleNext} onPrev={handlePrev} lang={lang} currency={currency} />}
    </Layout>
  );
};

export default function BaliQuoteApp({ onClose, lang = 'id', currency = 'USD' }: { onClose?: () => void, lang?: 'en' | 'id', currency?: 'USD' | 'IDR' }) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <CalculatorProvider>
      <div className="relative min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
        <CalculatorApp lang={lang} currency={currency} onClose={onClose} />
      </div>
    </CalculatorProvider>
  );
}

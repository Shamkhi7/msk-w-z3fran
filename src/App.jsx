import React, { useState, useEffect } from 'react';
import { ShieldCheck, X, CheckCircle2 } from 'lucide-react';
import { POSProvider, usePOS } from './context/POSContext';
import { Header } from './components/layout/Header';
import { CategoryTabs } from './components/pos/CategoryTabs';
import { ProductGrid } from './components/pos/ProductGrid';
import { CartDrawer } from './components/pos/CartDrawer';
import { AddCategoryModal } from './components/pos/AddCategoryModal';
import { AddProductModal } from './components/pos/AddProductModal';
import { ReservationsModule } from './components/reservations/ReservationsModule';
import { ExpensesModule } from './components/expenses/ExpensesModule';
import { TreasuryModule } from './components/treasury/TreasuryModule';
import { ProductReportsModule } from './components/reports/ProductReportsModule';
import { StoreSettingsModal } from './components/settings/StoreSettingsModal';
import { PrintPreviewModal } from './components/print/PrintPreviewModal';
import { SplashScreen } from './components/common/SplashScreen';

function POSApp() {
  const {
    activeCategory,
    isManager,
    sessionRestoredNotice,
    setSessionRestoredNotice,
    toast,
    setToast,
  } = usePOS();
  const [activeTab, setActiveTab] = useState('pos'); // 'pos' | 'reservations' | 'expenses' | 'reports' | 'treasury'
  const [isWelcomeDismissed, setIsWelcomeDismissed] = useState(false);

  // Modals
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Safeguard: Cashiers cannot remain on manager-only tabs
  useEffect(() => {
    if (!isManager && activeTab === 'reports') {
      setActiveTab('pos');
    }
  }, [isManager, activeTab]);

  // Keyboard Shortcuts for Cashier Speed
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'F1') {
        e.preventDefault();
        setActiveTab('pos');
      } else if (e.key === 'F2') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="text"]');
        if (searchInput) searchInput.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div id="app-screen-root" className="h-screen max-h-screen flex flex-col bg-[#FAF8F5] text-stone-800 font-arabic select-none overflow-hidden">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenWelcome={() => setIsWelcomeDismissed(false)}
      />

      {/* Welcome / Splash Screen on initial launch */}
      {!isWelcomeDismissed && (
        <SplashScreen
          onStart={() => {
            setIsWelcomeDismissed(true);
            setActiveTab('pos');
          }}
        />
      )}

      {/* Main Workspace Area */}
      <main className="flex-1 flex overflow-hidden">
        {activeTab === 'pos' && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden h-full w-full">
            {/* Products & Categories Section */}
            <section className="flex-1 flex flex-col overflow-hidden h-full">
              <CategoryTabs
                onOpenAddCategory={() => setIsAddCategoryOpen(true)}
              />
              <div className="flex-1 overflow-hidden">
                <ProductGrid
                  onOpenAddProduct={() => setIsAddProductOpen(true)}
                />
              </div>
            </section>

            {/* Interactive Cart Drawer */}
            <CartDrawer />
          </div>
        )}

        {activeTab === 'reservations' && (
          <div className="flex-1 overflow-hidden">
            <ReservationsModule />
          </div>
        )}

        {activeTab === 'expenses' && (
          <div className="flex-1 overflow-hidden">
            <ExpensesModule />
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="flex-1 overflow-hidden">
            <ProductReportsModule />
          </div>
        )}

        {activeTab === 'treasury' && (
          <div className="flex-1 overflow-hidden">
            <TreasuryModule />
          </div>
        )}
      </main>

      {/* Modals & Dialogs */}
      <AddCategoryModal
        isOpen={isAddCategoryOpen}
        onClose={() => setIsAddCategoryOpen(false)}
      />

      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        defaultCategoryId={activeCategory}
      />

      <StoreSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Dedicated Thermal Print Preview Modal & Print Mount Point */}
      <PrintPreviewModal />

      {/* Subtle Crash Recovery & Prior Session Restoration Toast */}
      {sessionRestoredNotice && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 select-none animate-fade-in">
          <div className="bg-stone-900/95 text-white border-2 border-gold-500/80 rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-3 backdrop-blur-md">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0 border border-emerald-500/40">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-right">
              <div className="text-xs sm:text-sm font-black text-gold-300 flex items-center gap-1.5">
                <span>تمت استعادة جلسة العمل السابقة بنجاح</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
              </div>
              <div className="text-[11px] text-stone-300 mt-0.5 font-mono">
                الشفت: <span className="font-bold text-white">{sessionRestoredNotice.shift}</span> • الكاشير: <span className="font-bold text-white">{sessionRestoredNotice.cashier}</span>
                {sessionRestoredNotice.heldItemsCount > 0 && (
                  <span className="text-gold-400 mr-2 font-sans font-bold">
                    (استرجاع {sessionRestoredNotice.heldItemsCount} مادة في السلة)
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => setSessionRestoredNotice(null)}
              className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors mr-2 cursor-pointer"
              title="إغلاق التنبيه"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Floating System Notification Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in pointer-events-auto select-none">
          <div
            className={`px-5 py-3.5 rounded-2xl shadow-2xl border flex items-center gap-3 backdrop-blur-md font-bold text-sm ${
              toast.type === 'error'
                ? 'bg-rose-950/95 text-rose-100 border-rose-500/80 shadow-rose-950/50'
                : toast.type === 'warning'
                ? 'bg-amber-950/95 text-amber-200 border-amber-500/80 shadow-amber-950/50'
                : 'bg-stone-900/95 text-emerald-300 border-emerald-500/80 shadow-stone-950/50'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                toast.type === 'error'
                  ? 'bg-rose-500/20 text-rose-400'
                  : toast.type === 'warning'
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-emerald-500/20 text-emerald-400'
              }`}
            >
              {toast.type === 'error' ? (
                <X className="w-4 h-4" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
            </div>
            <span className="text-white text-xs sm:text-sm font-semibold">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors mr-2 cursor-pointer"
              title="إغلاق التنبيه"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <POSProvider>
      <POSApp />
    </POSProvider>
  );
}

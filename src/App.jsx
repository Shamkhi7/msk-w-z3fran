import React, { useState, useEffect } from 'react';
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
import { StoreSettingsModal } from './components/settings/StoreSettingsModal';
import { PrintPreviewModal } from './components/print/PrintPreviewModal';

function POSApp() {
  const { activeCategory } = usePOS();
  const [activeTab, setActiveTab] = useState('pos'); // 'pos' | 'reservations' | 'expenses' | 'treasury'

  // Modals
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
    <div id="app-screen-root" className="min-h-screen flex flex-col bg-[#FAF8F5] text-stone-800 font-arabic select-none overflow-hidden">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 flex overflow-hidden">
        {activeTab === 'pos' && (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Products & Categories Section */}
            <section className="flex-1 flex flex-col overflow-hidden">
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

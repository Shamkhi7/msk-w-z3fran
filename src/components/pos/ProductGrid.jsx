import React, { useState, useRef } from 'react';
import { Search, Plus, Sparkles, DollarSign, Wallet, MoreVertical, Layers } from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { ProductEditModal } from './ProductEditModal';
import { ServiceItemModal } from './ServiceItemModal';

export function ProductGrid({ onOpenAddProduct }) {
  const {
    products,
    activeCategory,
    searchQuery,
    setSearchQuery,
    addToCart,
    storeSettings,
  } = usePOS();

  const [editingProduct, setEditingProduct] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [serviceModalType, setServiceModalType] = useState(null); // 'deposit' | 'remaining' | null

  // Long press timer ref for touch screens
  const longPressTimerRef = useRef(null);

  // Filter products by category, availability, and search
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      activeCategory === 'cat-all' || p.categoryId === activeCategory;

    const matchesSearch =
      !searchQuery.trim() ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.barcode && p.barcode.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const handleProductClick = (product) => {
    if (!product.isAvailable) return;
    if (product.id === 'service-deposit') {
      setServiceModalType('deposit');
      return;
    }
    if (product.id === 'service-remaining') {
      setServiceModalType('remaining');
      return;
    }
    addToCart(product);
  };

  const handleContextMenu = (e, product) => {
    e.preventDefault(); // Prevent standard browser menu
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };

  // Touch long press handlers for POS touch screens
  const handleTouchStart = (product) => {
    longPressTimerRef.current = setTimeout(() => {
      setEditingProduct(product);
      setIsEditModalOpen(true);
    }, 600);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-warm-50/50 select-none">
      {/* Search & Service Quick Bar */}
      <div className="p-3 border-b border-warm-200 bg-white flex flex-wrap items-center gap-2">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[180px]">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث بالاسم أو الباركود... (F2)"
            className="w-full pl-3 pr-9 py-2 bg-warm-50/70 border border-warm-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-800 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600 cursor-pointer"
            >
              ×
            </button>
          )}
        </div>

        {/* Pre-configured Service Quick Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setServiceModalType('deposit')}
            title="تسجيل عربون حجز كيك في الفاتورة"
            className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <span className="text-sm">💵</span>
            <span className="font-extrabold">+ عربون حجز</span>
          </button>

          <button
            onClick={() => setServiceModalType('remaining')}
            title="تسجيل متبقي حجز كيك في الفاتورة"
            className="px-3 py-2 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <span className="text-sm">💰</span>
            <span className="font-extrabold">+ متبقي حجز</span>
          </button>
        </div>
      </div>

      {/* Grid Content */}
      <div className="flex-1 p-3 sm:p-4 overflow-y-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-2.5 sm:gap-3">
          {/* Add Product Inline Card */}
          <button
            onClick={onOpenAddProduct}
            className="group min-h-[110px] p-3 rounded-2xl border-2 border-dashed border-brand-800/30 hover:border-brand-800 bg-white/60 hover:bg-brand-50/50 flex flex-col items-center justify-center gap-1.5 text-brand-900 transition-all cursor-pointer shadow-xs active:scale-98"
          >
            <div className="w-10 h-10 rounded-full bg-brand-100 group-hover:bg-brand-800 group-hover:text-white text-brand-800 flex items-center justify-center transition-colors">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-xs font-black">+ إضافة منتج</span>
            <span className="text-[10px] text-stone-500">لهذا القسم</span>
          </button>

          {/* Product Items */}
          {filteredProducts.map((product) => {
            const isService = product.isService;
            const isAvailable = product.isAvailable;

            return (
              <div
                key={product.id}
                onClick={() => handleProductClick(product)}
                onContextMenu={(e) => handleContextMenu(e, product)}
                onTouchStart={() => handleTouchStart(product)}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
                className={`relative group p-3 rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between text-right ${
                  !isAvailable
                    ? 'opacity-50 bg-stone-100 border-stone-300'
                    : isService
                    ? 'bg-gradient-to-b from-emerald-50 to-white border-emerald-300 hover:shadow-md hover:border-emerald-500 active:scale-98'
                    : 'bg-white hover:bg-[#FFFDF9] border-warm-200/90 hover:border-brand-700/60 hover:shadow-md active:scale-98'
                }`}
              >
                {/* Top Row: Emoji & Edit trigger button */}
                <div className="flex items-start justify-between gap-1 mb-1.5">
                  <div className="w-10 h-10 rounded-xl bg-warm-50 border border-warm-100 flex items-center justify-center text-2xl shadow-xs group-hover:scale-105 transition-transform">
                    {product.emoji || '🍰'}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingProduct(product);
                      setIsEditModalOpen(true);
                    }}
                    title="تعديل سريع (أو انقر بالزر الأيمن)"
                    className="p-1 rounded-lg text-stone-300 hover:text-brand-800 hover:bg-stone-100 transition-colors"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Name */}
                <div className="mb-2">
                  <h4 className="font-bold text-xs sm:text-sm text-stone-800 leading-snug line-clamp-2">
                    {product.name}
                  </h4>
                  {product.description && (
                    <p className="text-[10px] text-stone-500 line-clamp-1 mt-0.5">
                      {product.description}
                    </p>
                  )}
                </div>

                {/* Bottom Row: Price & Status */}
                <div className="pt-2 border-t border-dashed border-stone-200 flex items-center justify-between">
                  <div className="font-mono font-black text-xs sm:text-sm text-brand-900">
                    {product.price.toLocaleString()}{' '}
                    <span className="text-[10px] font-sans font-normal text-stone-500">
                      {storeSettings.currency}
                    </span>
                  </div>

                  {!isAvailable && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 font-bold">
                      غير متاح
                    </span>
                  )}
                  {isService && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">
                      خدمة
                    </span>
                  )}
                </div>

                {/* Right click tip indicator on hover */}
                <div className="hidden group-hover:block absolute bottom-1 left-2 text-[8px] text-stone-400">
                  زر أيمن للتعديل
                </div>
              </div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="p-8 text-center text-stone-500">
            <p className="font-bold text-sm">لا توجد منتجات مطابقة لهذا البحث أو القسم</p>
            <button
              onClick={onOpenAddProduct}
              className="mt-3 px-4 py-2 bg-brand-800 text-white rounded-xl text-xs font-bold hover:bg-brand-900 cursor-pointer"
            >
              + إضافة منتج جديد هنا
            </button>
          </div>
        )}
      </div>

      {/* Inline Product Editor Modal */}
      <ProductEditModal
        product={editingProduct}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingProduct(null);
        }}
      />

      {/* Service Item Quick Modal */}
      <ServiceItemModal
        serviceType={serviceModalType}
        isOpen={!!serviceModalType}
        onClose={() => setServiceModalType(null)}
      />
    </div>
  );
}

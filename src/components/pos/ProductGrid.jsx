import React, { useState, useRef } from 'react';
import { Search, Plus, MoreVertical, Layers, RotateCcw, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { ProductEditModal } from './ProductEditModal';
import { ServiceItemModal } from './ServiceItemModal';
import { SalesReturnModal } from './SalesReturnModal';

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
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

  const longPressTimerRef = useRef(null);

  // Always display products of the dedicated selected category strictly
  const filteredProducts = products.filter((p) => {
    const matchesCategory = p.categoryId === activeCategory;

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
    e.preventDefault();
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };

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
    <div className="flex flex-col h-full overflow-hidden bg-[#FAF8F5] select-none">
      {/* Search & Service Quick Bar */}
      <div className="p-3 border-b border-warm-200 bg-white flex flex-wrap items-center gap-2.5">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث بالاسم أو الباركود في هذا القسم... (F2)"
            className="w-full pl-3 pr-9 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-800 transition-all"
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

        {/* Quick Action Buttons: Deposit, Remaining, and Sales Return */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setServiceModalType('deposit')}
            title="تسجيل عربون حجز كيك في الفاتورة"
            className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <ArrowDownLeft className="w-4 h-4 text-emerald-700" />
            <span className="font-black">+ عربون حجز</span>
          </button>

          <button
            onClick={() => setServiceModalType('remaining')}
            title="تسجيل متبقي حجز كيك في الفاتورة"
            className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <ArrowUpRight className="w-4 h-4 text-amber-700" />
            <span className="font-black">+ متبقي حجز</span>
          </button>

          <button
            onClick={() => setIsReturnModalOpen(true)}
            title="تسجيل مردود ومسترجع مبيعات نقدي"
            className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-300 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-4 h-4 text-rose-700" />
            <span className="font-black">+ مردود مبيعات</span>
          </button>
        </div>
      </div>

      {/* Grid Content */}
      <div className="flex-1 p-3 sm:p-4 overflow-y-auto">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-3 sm:gap-4">
          {/* Add Product Inline Card (enlarged) */}
          <button
            onClick={onOpenAddProduct}
            className="group min-h-[140px] p-4 rounded-2xl border-2 border-dashed border-brand-800/40 hover:border-brand-800 bg-white hover:bg-brand-50/40 flex flex-col items-center justify-center gap-2 text-brand-900 transition-all cursor-pointer shadow-xs active:scale-98"
          >
            <div className="w-12 h-12 rounded-full bg-brand-100 group-hover:bg-brand-800 group-hover:text-white text-brand-800 flex items-center justify-center transition-colors shadow-xs">
              <Plus className="w-6 h-6" />
            </div>
            <span className="text-sm font-black">+ إضافة منتج</span>
            <span className="text-xs text-stone-500">لهذا القسم</span>
          </button>

          {/* Product Items (Enlarged & Clean Classic Look) */}
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
                className={`relative group min-h-[140px] p-4 rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between text-right ${
                  !isAvailable
                    ? 'opacity-50 bg-stone-100 border-stone-300'
                    : isService
                    ? 'bg-emerald-50/40 border-emerald-300 hover:shadow-md hover:border-emerald-600 active:scale-98'
                    : 'bg-white hover:bg-warm-50/60 border-warm-200/90 hover:border-brand-700 hover:shadow-md active:scale-98'
                }`}
              >
                {/* Top Row: Code & Edit button */}
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="font-mono text-[10px] text-stone-400 font-bold">
                    {product.barcode}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingProduct(product);
                      setIsEditModalOpen(true);
                    }}
                    title="تعديل سريع"
                    className="p-1.5 rounded-lg text-stone-400 hover:text-brand-800 hover:bg-stone-100 transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                {/* Name & Description */}
                <div className="my-auto py-1">
                  <h4 className="font-black text-sm sm:text-base text-stone-800 leading-snug line-clamp-2">
                    {product.name}
                  </h4>
                  {product.description && (
                    <p className="text-xs text-stone-500 line-clamp-1 mt-1">
                      {product.description}
                    </p>
                  )}
                </div>

                {/* Bottom Row: Price & Status */}
                <div className="pt-2.5 border-t border-stone-200 flex items-center justify-between">
                  <div className="font-mono font-black text-base text-brand-900">
                    {product.price.toLocaleString()}{' '}
                    <span className="text-xs font-sans font-normal text-stone-500">
                      {storeSettings.currency}
                    </span>
                  </div>

                  {!isAvailable && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-bold">
                      غير متاح
                    </span>
                  )}
                  {isService && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                      خدمة
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="p-12 text-center text-stone-500">
            <p className="font-bold text-sm">لا توجد منتجات مضافة في هذا القسم حتى الآن</p>
            <button
              onClick={onOpenAddProduct}
              className="mt-3 px-5 py-2.5 bg-brand-800 text-white rounded-xl text-xs font-bold hover:bg-brand-900 cursor-pointer"
            >
              + إضافة أول منتج في هذا القسم
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

      {/* Sales Return Modal */}
      <SalesReturnModal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
      />
    </div>
  );
}

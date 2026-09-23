import React, { useState, useRef, useMemo } from 'react';
import { Search, Plus, MoreVertical, Layers, RotateCcw, ArrowDownLeft, ArrowUpRight, ZoomIn } from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { ProductEditModal } from './ProductEditModal';
import { ServiceItemModal } from './ServiceItemModal';
import { SalesReturnModal } from './SalesReturnModal';
import { ManagerPinModal } from '../treasury/ManagerPinModal';

export function ProductGrid({ onOpenAddProduct }) {
  const {
    products,
    activeCategory,
    searchQuery,
    setSearchQuery,
    addToCart,
    storeSettings,
    isManager,
    productsScale,
    setProductsScale,
    gridScale,
    setGridScale,
  } = usePOS();

  const [editingProduct, setEditingProduct] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [serviceModalType, setServiceModalType] = useState(null); // 'deposit' | 'remaining' | null
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const longPressTimerRef = useRef(null);

  const productScaleRatio = (productsScale || 100) / 100;

  // Dynamic Scale Configuration for Product Cards & Grid
  const gridConfig = useMemo(() => {
    switch (productsScale) {
      case 50:
        return {
          cardMinWidth: '110px',
          cardMinHeight: '85px',
          padding: 'p-1.5 sm:p-2',
          gap: 'gap-1.5 sm:gap-2',
          titleSize: 'text-[11px] leading-tight',
          priceSize: 'text-xs font-mono font-bold',
          barcodeSize: 'text-[8px]',
          currencySize: 'text-[9px]',
          badgeSize: 'text-[8px] px-1 py-0.2',
          moreIconSize: 'w-3 h-3',
          addCardIconSize: 'w-7 h-7 sm:w-8 sm:h-8',
          addCardIcon: 'w-3.5 h-3.5 sm:w-4 sm:h-4',
          addCardTitle: 'text-[11px] font-bold',
          addCardSub: 'text-[9px]',
        };
      case 75:
        return {
          cardMinWidth: '135px',
          cardMinHeight: '105px',
          padding: 'p-2 sm:p-2.5',
          gap: 'gap-2 sm:gap-2.5',
          titleSize: 'text-xs sm:text-[13px] leading-snug',
          priceSize: 'text-sm font-mono font-black',
          barcodeSize: 'text-[9px]',
          currencySize: 'text-[10px]',
          badgeSize: 'text-[9px] px-1.5 py-0.2',
          moreIconSize: 'w-3.5 h-3.5',
          addCardIconSize: 'w-8 h-8 sm:w-10 sm:h-10',
          addCardIcon: 'w-4 h-4 sm:w-5 sm:h-5',
          addCardTitle: 'text-xs font-black',
          addCardSub: 'text-[10px]',
        };
      case 125:
        return {
          cardMinWidth: '200px',
          cardMinHeight: '155px',
          padding: 'p-3.5 sm:p-4.5',
          gap: 'gap-3 sm:gap-4',
          titleSize: 'text-base sm:text-lg leading-snug',
          priceSize: 'text-lg sm:text-xl font-mono font-black',
          barcodeSize: 'text-xs',
          currencySize: 'text-xs',
          badgeSize: 'text-xs px-2.5 py-0.5',
          moreIconSize: 'w-5 h-5',
          addCardIconSize: 'w-12 h-12 sm:w-14 sm:h-14',
          addCardIcon: 'w-6 h-6 sm:w-7 sm:h-7',
          addCardTitle: 'text-base font-black',
          addCardSub: 'text-xs',
        };
      case 150:
        return {
          cardMinWidth: '240px',
          cardMinHeight: '185px',
          padding: 'p-4 sm:p-5',
          gap: 'gap-3.5 sm:gap-4.5',
          titleSize: 'text-lg sm:text-xl font-black leading-normal',
          priceSize: 'text-xl sm:text-2xl font-mono font-black',
          barcodeSize: 'text-xs',
          currencySize: 'text-sm',
          badgeSize: 'text-xs sm:text-sm px-3 py-1',
          moreIconSize: 'w-6 h-6',
          addCardIconSize: 'w-14 h-14 sm:w-16 sm:h-16',
          addCardIcon: 'w-7 h-7 sm:w-8 sm:h-8',
          addCardTitle: 'text-lg font-black',
          addCardSub: 'text-sm',
        };
      case 100:
      default:
        return {
          cardMinWidth: '160px',
          cardMinHeight: '125px',
          padding: 'p-3 sm:p-4',
          gap: 'gap-2.5 sm:gap-3.5',
          titleSize: 'text-sm sm:text-base leading-snug',
          priceSize: 'text-base font-mono font-black',
          barcodeSize: 'text-[10px]',
          currencySize: 'text-xs',
          badgeSize: 'text-[10px] px-2 py-0.5',
          moreIconSize: 'w-4 h-4',
          addCardIconSize: 'w-10 h-10 sm:w-12 sm:h-12',
          addCardIcon: 'w-5 h-5 sm:w-6 sm:h-6',
          addCardTitle: 'text-xs sm:text-sm font-black',
          addCardSub: 'text-[10px] sm:text-xs',
        };
    }
  }, [productsScale]);

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

  const handleAddProductClick = () => {
    if (isManager) {
      onOpenAddProduct();
    } else {
      setPendingAction({ type: 'add' });
      setIsPinModalOpen(true);
    }
  };

  const handleEditProductClick = (product) => {
    if (isManager) {
      setEditingProduct(product);
      setIsEditModalOpen(true);
    } else {
      setPendingAction({ type: 'edit', product });
      setIsPinModalOpen(true);
    }
  };

  const handleContextMenu = (e, product) => {
    e.preventDefault();
    if (!isManager) return;
    handleEditProductClick(product);
  };

  const handleTouchStart = (product) => {
    if (!isManager) return;
    longPressTimerRef.current = setTimeout(() => {
      handleEditProductClick(product);
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
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <button
            onClick={() => setServiceModalType('deposit')}
            title="تسجيل عربون حجز كيك في الفاتورة"
            className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-700" />
            <span className="font-black">+ عربون حجز</span>
          </button>

          <button
            onClick={() => setServiceModalType('remaining')}
            title="تسجيل متبقي حجز كيك في الفاتورة"
            className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-amber-700" />
            <span className="font-black">+ متبقي حجز</span>
          </button>

          <button
            onClick={() => setIsReturnModalOpen(true)}
            title="تسجيل مردود ومسترجع مبيعات نقدي"
            className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-300 flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-700" />
            <span className="font-black">+ مردود مبيعات</span>
          </button>

          {/* Dynamic Zoom / Scale Selector for Products */}
          <div className="flex items-center gap-1.5 bg-warm-100 hover:bg-warm-200/80 border border-warm-300/80 rounded-xl px-2.5 py-1.5 transition-colors shadow-2xs">
            <ZoomIn className="w-3.5 h-3.5 text-brand-800 shrink-0" />
            <label htmlFor="product-grid-scale-select" className="text-xs font-bold text-stone-700 shrink-0 cursor-pointer hidden sm:inline">
              حجم المنتجات:
            </label>
            <select
              id="product-grid-scale-select"
              value={productsScale}
              onChange={(e) => setProductsScale(Number(e.target.value))}
              className="bg-transparent font-black text-brand-900 text-xs focus:outline-none cursor-pointer pr-1"
              title="تغيير حجم كروت وشبكة عرض المنتجات (Products Scale)"
            >
              <option value={50}>50% (أصغر جداً)</option>
              <option value={75}>75% (صغير)</option>
              <option value={100}>100% (الافتراضي)</option>
              <option value={125}>125% (كبير)</option>
              <option value={150}>150% (أكبر جداً)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid Content with Dynamic CSS Grid Template & Scale */}
      <div className="flex-1 p-2 sm:p-3 overflow-y-auto">
        <div
          className={`grid ${gridConfig.gap}`}
          style={{
            '--product-grid-scale': productScaleRatio,
            '--pos-scale': productScaleRatio,
            gridTemplateColumns: `repeat(auto-fill, minmax(${gridConfig.cardMinWidth}, 1fr))`,
          }}
        >
          {/* Add Product Inline Card - Only visible to Manager */}
          {isManager && (
            <button
              onClick={handleAddProductClick}
              title="إضافة منتج جديد لهذا القسم (صلاحية المدير)"
              style={{ minHeight: gridConfig.cardMinHeight }}
              className={`group ${gridConfig.padding} rounded-2xl border-2 border-dashed border-brand-800/40 hover:border-brand-800 bg-white hover:bg-brand-50/40 flex flex-col items-center justify-center gap-1.5 text-brand-900 transition-all cursor-pointer shadow-xs active:scale-98`}
            >
              <div className={`${gridConfig.addCardIconSize} rounded-full bg-brand-100 group-hover:bg-brand-800 group-hover:text-white text-brand-800 flex items-center justify-center transition-colors shadow-xs`}>
                <Plus className={gridConfig.addCardIcon} />
              </div>
              <span className={`${gridConfig.addCardTitle} text-brand-950`}>+ إضافة منتج</span>
              <span className={`${gridConfig.addCardSub} text-stone-500`}>لهذا القسم</span>
            </button>
          )}

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
                style={{
                  minHeight: gridConfig.cardMinHeight,
                  ...(product.color
                    ? {
                        borderTopWidth: '4px',
                        borderTopColor: product.color,
                      }
                    : {}),
                }}
                className={`relative group ${gridConfig.padding} rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between text-right ${
                  !isAvailable
                    ? 'opacity-50 bg-stone-100 border-stone-300'
                    : isService
                    ? 'bg-emerald-50/40 border-emerald-300 hover:shadow-md hover:border-emerald-600 active:scale-98'
                    : 'bg-white hover:bg-warm-50/60 border-warm-200/90 hover:border-brand-700 hover:shadow-md active:scale-98'
                }`}
              >
                {/* Top Row: Code, Color Badge & Manager Edit button */}
                <div className="flex items-center justify-between gap-1 mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {product.color && (
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: product.color }}
                        title="لون الصنف المميز"
                      />
                    )}
                    <span className={`font-mono ${gridConfig.barcodeSize} text-stone-400 font-bold truncate`}>
                      {product.barcode}
                    </span>
                  </div>

                  {isManager && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditProductClick(product);
                      }}
                      title="تعديل الصنف (صلاحية المدير)"
                      className="p-1 rounded-lg text-stone-400 hover:text-brand-800 hover:bg-stone-100 transition-colors"
                    >
                      <MoreVertical className={gridConfig.moreIconSize} />
                    </button>
                  )}
                </div>

                {/* Name & Description */}
                <div className="my-auto py-0.5">
                  <h4 className={`font-black ${gridConfig.titleSize} text-stone-800 leading-snug line-clamp-2`}>
                    {product.name}
                  </h4>
                  {product.description && productsScale > 50 && (
                    <p className="text-[11px] text-stone-500 line-clamp-2 mt-1 leading-snug font-medium">
                      {product.description}
                    </p>
                  )}
                </div>

                {/* Bottom Row: Price & Status */}
                <div className="pt-2 border-t border-stone-200/80 flex items-center justify-between gap-1">
                  <div className={`font-mono font-black ${gridConfig.priceSize} text-brand-900`}>
                    {product.price.toLocaleString()}{' '}
                    <span className={`${gridConfig.currencySize} font-sans font-normal text-stone-500`}>
                      {storeSettings.currency}
                    </span>
                  </div>

                  {!isAvailable && (
                    <span className={`${gridConfig.badgeSize} rounded bg-rose-100 text-rose-700 font-bold`}>
                      غير متاح
                    </span>
                  )}
                  {isService && (
                    <span className={`${gridConfig.badgeSize} rounded bg-emerald-100 text-emerald-800 font-bold`}>
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
            {isManager && (
              <button
                onClick={handleAddProductClick}
                className="mt-3 px-5 py-2.5 bg-brand-800 text-white rounded-xl text-xs font-bold hover:bg-brand-900 cursor-pointer"
              >
                + إضافة أول منتج في هذا القسم
              </button>
            )}
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

      {/* Manager PIN Protection Modal */}
      <ManagerPinModal
        isOpen={isPinModalOpen}
        onClose={() => {
          setIsPinModalOpen(false);
          setPendingAction(null);
        }}
        onSuccess={() => {
          setIsPinModalOpen(false);
          if (pendingAction?.type === 'add') {
            onOpenAddProduct();
          } else if (pendingAction?.type === 'edit') {
            setEditingProduct(pendingAction.product);
            setIsEditModalOpen(true);
          }
          setPendingAction(null);
        }}
        title="صلاحيات المدير - إدارة المنتجات"
        promptMessage="أدخل رمز تأكيد المدير للتمكن من إضافة أو تعديل المنتجات والأسعار"
      />
    </div>
  );
}

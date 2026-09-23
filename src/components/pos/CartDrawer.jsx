import React, { useState, useEffect } from 'react';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Tag,
  Receipt,
  X,
  Calculator,
  Printer,
  Zap,
  CheckCircle,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { PaymentModal } from './PaymentModal';
import { QuantityNumpadModal } from './QuantityNumpadModal';

export function CartDrawer() {
  const {
    cart,
    updateItemQuantity,
    removeFromCart,
    clearCart,
    overrideCartItemPrice,
    applyCartItemDiscount,
    cartSummary,
    storeSettings,
    isManager,
    carts,
    activeCartId,
    activeCart,
    switchCart,
    addNewCart,
    removeCart,
    completeSale,
  } = usePOS();

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [activeOverrideItemId, setActiveOverrideItemId] = useState(null);
  const [customPriceInput, setCustomPriceInput] = useState('');
  const [customDiscountInput, setCustomDiscountInput] = useState('');
  const [cartToDelete, setCartToDelete] = useState(null);
  const [numpadItem, setNumpadItem] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 2500);
  };

  // Fast Checkout Without Printing
  const handleFastCheckoutNoPrint = () => {
    if (cart.length === 0) return;
    completeSale(
      {
        amountReceived: cartSummary.netTotal,
        changeDue: 0,
        paymentMethod: 'نقداً',
        customerName: 'زبون عام',
        notes: '',
        printReceipt: false,
      },
      false
    );
    triggerToast('تم تسجيل البيع بنجاح');
  };

  // Cashier Keyboard Shortcuts (F4 for Print Checkout, Shift+Enter for No-Print Fast Checkout)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // F4: Open Payment & Print Modal
      if (e.key === 'F4') {
        e.preventDefault();
        if (cart.length > 0 && !isPaymentModalOpen) {
          setIsPaymentModalOpen(true);
        }
      }

      // Shift + Enter: Fast Checkout Without Printing
      if (e.shiftKey && e.key === 'Enter') {
        e.preventDefault();
        if (cart.length > 0 && !isPaymentModalOpen) {
          handleFastCheckoutNoPrint();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, isPaymentModalOpen, cartSummary.netTotal]);

  const handleDeleteCartClick = (cartItem) => {
    if (cartItem.items && cartItem.items.length > 0) {
      setCartToDelete(cartItem);
    } else {
      removeCart(cartItem.id);
    }
  };

  const openOverrideDialog = (item) => {
    setActiveOverrideItemId(item.cartItemId);
    setCustomPriceInput(String(item.unitPrice));
    setCustomDiscountInput(item.discount > 0 ? String(item.discount) : '');
  };

  const saveOverride = (cartItemId) => {
    if (customPriceInput !== '') {
      overrideCartItemPrice(cartItemId, customPriceInput);
    }
    if (customDiscountInput !== '') {
      applyCartItemDiscount(cartItemId, customDiscountInput);
    } else {
      applyCartItemDiscount(cartItemId, 0);
    }
    setActiveOverrideItemId(null);
  };

  return (
    <aside className="w-full md:w-[320px] lg:w-[340px] xl:w-[380px] 2xl:w-[420px] bg-white border-r border-warm-200 flex flex-col h-full shadow-lg select-none z-10 relative shrink-0">
      {/* Non-intrusive Success Notification Toast */}
      {toastMessage && (
        <div className="absolute top-16 left-3 right-3 z-40 bg-emerald-800 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center justify-center gap-2 font-black text-xs sm:text-sm animate-fade-in border border-emerald-500">
          <CheckCircle className="w-5 h-5 text-emerald-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Multi-Cart Tabs Header Bar */}
      <div className="bg-[#5c0017] text-white px-2 py-1.5 border-b border-brand-950 flex items-center gap-1.5 overflow-x-auto select-none no-scrollbar">
        {carts.map((c) => {
          const isActive = c.id === activeCartId;
          const itemCount = c.items ? c.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
          return (
            <div
              key={c.id}
              onClick={() => switchCart(c.id)}
              className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-brand-800 text-white shadow-sm ring-2 ring-gold-400/80 border border-brand-700 font-black'
                  : 'bg-brand-950/70 text-warm-200 hover:bg-brand-950 hover:text-white border border-transparent opacity-85 hover:opacity-100'
              }`}
            >
              <span>{c.name}</span>
              {itemCount > 0 && (
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                    isActive
                      ? 'bg-gold-500 text-brand-950 font-black'
                      : 'bg-warm-100/25 text-warm-100'
                  }`}
                >
                  {itemCount} {itemCount === 1 ? 'مادة' : itemCount === 2 ? 'مادتين' : 'مواد'}
                </span>
              )}
              {/* Delete / Clear specific suspended cart button */}
              {(carts.length > 1 || (c.items && c.items.length > 0)) && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCartClick(c);
                  }}
                  title={carts.length > 1 ? `حذف ${c.name}` : `تفريغ ${c.name}`}
                  className="text-warm-300 hover:text-rose-300 p-0.5 rounded hover:bg-white/10 transition-colors ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}

        {/* Inline '+ فاتورة جديدة' Button (Up to 5 concurrent active orders) */}
        {carts.length < 5 && (
          <button
            type="button"
            onClick={addNewCart}
            title="فتح فاتورة جديدة معلقة (حتى 5 فواتير)"
            className="flex items-center gap-1 py-1 px-2.5 rounded-lg text-xs font-bold bg-gold-600/25 hover:bg-gold-600/40 text-gold-300 border border-gold-500/50 hover:border-gold-400 transition-all cursor-pointer whitespace-nowrap shrink-0 shadow-xs active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ فاتورة جديدة</span>
          </button>
        )}
      </div>

      {/* Current Active Cart Title Header */}
      <div className="p-3 bg-brand-800 text-white flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-gold-400" />
          <h2 className="font-bold text-sm sm:text-base">{activeCart?.name || 'سلة الطلب'}</h2>
          {cartSummary.itemCount > 0 && (
            <span className="bg-brand-950 text-gold-300 text-xs font-mono font-bold px-2 py-0.5 rounded-full">
              {cartSummary.itemCount} {cartSummary.itemCount === 1 ? 'صنف' : 'أصناف'}
            </span>
          )}
        </div>

        {cart.length > 0 && (
          <button
            onClick={clearCart}
            title="تفريغ هذه السلة بالكامل"
            className="text-warm-200 hover:text-white text-xs font-semibold hover:bg-brand-900/60 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>تفريغ</span>
          </button>
        )}
      </div>

      {/* Cart Line Items List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-warm-50/40">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-stone-400 p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-warm-100 flex items-center justify-center mb-3">
              <ShoppingBag className="w-8 h-8 text-stone-300" />
            </div>
            <p className="font-bold text-sm text-stone-600">السلة فارغة حالياً</p>
            <p className="text-xs text-stone-400 mt-1">
              اختر المنتجات من القائمة أو أضف عربون حجز لبدء الفاتورة
            </p>
          </div>
        ) : (
          cart.map((item) => {
            const isEditing = activeOverrideItemId === item.cartItemId;
            const lineTotal = Math.max(
              0,
              item.unitPrice * item.quantity - (item.discount || 0)
            );

            return (
              <div
                key={item.cartItemId}
                className="bg-white rounded-xl p-3 border border-warm-200/90 shadow-xs hover:border-brand-700/40 transition-all text-right"
              >
                {/* Top: Item Title & Delete */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-sm text-stone-800 truncate leading-snug">
                      {item.product.name}
                    </div>
                    {/* Price indicator & Override Badge */}
                    <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                      <span className="font-mono text-xs text-stone-500 font-semibold">
                        {item.unitPrice.toLocaleString()} {storeSettings.currency}
                      </span>

                      {item.isOverridden && (
                        <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-semibold">
                          سعر خاص
                        </span>
                      )}

                      {item.discount > 0 && (
                        <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded font-semibold font-mono">
                          خصم: -{item.discount.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.cartItemId)}
                    className="p-1.5 text-stone-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Inline Single-order Price Override & Discount Form */}
                {isEditing ? (
                  <div className="mt-2.5 p-2.5 bg-amber-50/70 border border-amber-300 rounded-xl space-y-2 animate-fade-in">
                    <div className="text-[11px] font-bold text-amber-950 flex items-center justify-between">
                      <span>تعديل سعر / خصم خاص لهذا الطلب:</span>
                      <span className="text-[10px] text-stone-500">
                        (السعر الأصلي: {item.originalPrice.toLocaleString()})
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-stone-600 mb-0.5">
                          سعر القطعة المباشر:
                        </label>
                        <input
                          type="number"
                          value={customPriceInput}
                          onChange={(e) => setCustomPriceInput(e.target.value)}
                          placeholder="السعر الجديد..."
                          className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-brand-800"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-stone-600 mb-0.5">
                          أو خصم استقطاع (-):
                        </label>
                        <input
                          type="number"
                          value={customDiscountInput}
                          onChange={(e) => setCustomDiscountInput(e.target.value)}
                          placeholder="مبلغ الخصم..."
                          className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-brand-800 text-rose-700"
                        />
                      </div>
                    </div>

                    {/* Quick Percentage Discounts */}
                    <div className="flex items-center gap-1 flex-wrap pt-0.5">
                      <span className="text-[10px] font-bold text-stone-500">خصم سريع:</span>
                      {[5, 10, 15, 20, 50].map((pct) => {
                        const calculatedDisc = Math.round(
                          ((Number(customPriceInput || item.unitPrice) || 0) * item.quantity * pct) / 100
                        );
                        return (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => setCustomDiscountInput(String(calculatedDisc))}
                            className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer"
                          >
                            %{pct}
                          </button>
                        );
                      })}
                      {customDiscountInput !== '' && (
                        <button
                          type="button"
                          onClick={() => setCustomDiscountInput('')}
                          className="px-1.5 py-0.5 rounded text-[10px] font-medium text-stone-400 hover:text-stone-600 cursor-pointer"
                        >
                          مسح الخصم
                        </button>
                      )}
                    </div>

                    {/* Live Line Total Calculation Preview */}
                    <div className="text-[11px] font-bold text-brand-900 bg-white/90 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center justify-between">
                      <span>إجمالي السطر بعد التعديل:</span>
                      <span className="font-mono text-xs font-black text-brand-800">
                        {Math.max(
                          0,
                          Math.round(
                            ((Number(customPriceInput || item.unitPrice) || 0) * item.quantity) -
                              (Number(customDiscountInput) || 0)
                          )
                        ).toLocaleString()}{' '}
                        {storeSettings.currency}
                      </span>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => saveOverride(item.cartItemId)}
                        className="flex-1 bg-brand-800 text-white text-xs font-bold py-1.5 rounded-lg hover:bg-brand-900 cursor-pointer"
                      >
                        تطبيق على الطلب
                      </button>
                      <button
                        onClick={() => setActiveOverrideItemId(null)}
                        className="px-3 bg-stone-200 text-stone-700 text-xs font-medium rounded-lg hover:bg-stone-300 cursor-pointer"
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Bottom: Quantity Controls & Subtotal */
                  <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between gap-1.5 flex-wrap sm:flex-nowrap">
                    {/* Quantity Selector & Numpad Quick Entry */}
                    <div className="flex items-center gap-1 bg-stone-100 rounded-lg p-0.5 border border-stone-200 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          const step = item.quantity <= 1 && item.quantity > 0.25 ? 0.25 : 1;
                          const next = Math.max(0, Math.round((item.quantity - step) * 1000) / 1000);
                          updateItemQuantity(item.cartItemId, next);
                        }}
                        className="w-7 h-7 rounded bg-white hover:bg-stone-200 flex items-center justify-center text-stone-700 transition-colors cursor-pointer"
                        title="تقليل الكمية"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>

                      {/* Editable Direct Quantity Input */}
                      <input
                        type="number"
                        step="any"
                        min="0.01"
                        value={item.quantity}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '') return;
                          const num = parseFloat(val);
                          if (!isNaN(num) && num > 0) {
                            updateItemQuantity(item.cartItemId, num);
                          }
                        }}
                        onFocus={(e) => e.target.select()}
                        className="w-14 text-center font-mono font-black text-xs text-stone-900 bg-white border border-stone-300 rounded py-1 px-0.5 focus:outline-none focus:ring-1 focus:ring-brand-800"
                        title="اكتب الكمية مباشرة (يدعم الكسور مثل 0.5 و 0.25 والأعداد الكبيرة)"
                      />

                      <button
                        type="button"
                        onClick={() => {
                          const step = item.quantity < 1 ? 0.25 : 1;
                          const next = Math.round((item.quantity + step) * 1000) / 1000;
                          updateItemQuantity(item.cartItemId, next);
                        }}
                        className="w-7 h-7 rounded bg-white hover:bg-stone-200 flex items-center justify-center text-stone-700 transition-colors cursor-pointer"
                        title="زيادة الكمية"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>

                      {/* Touch Numpad / Preset Trigger */}
                      <button
                        type="button"
                        onClick={() => setNumpadItem(item)}
                        className="w-7 h-7 rounded bg-brand-50 hover:bg-brand-100 flex items-center justify-center text-brand-800 border border-brand-200/80 transition-colors cursor-pointer"
                        title="لوحة الأرقام السريعة واختصارات الأوزان (كغم)"
                      >
                        <Calculator className="w-3.5 h-3.5 text-brand-700" />
                      </button>
                    </div>

                    {/* Single-order Override Trigger Button */}
                    <button
                      type="button"
                      onClick={() => openOverrideDialog(item)}
                      title="تعديل السعر أو إضافة خصم لهذا الصنف فقط"
                      className="px-2 py-1 rounded text-xs font-bold text-brand-800 hover:bg-brand-50 border border-brand-800/20 flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                    >
                      <Tag className="w-3 h-3 text-gold-500" />
                      <span className="hidden sm:inline">سعر/خصم</span>
                    </button>

                    {/* Line Total */}
                    <div className="text-left font-mono font-bold text-xs sm:text-sm text-stone-900 shrink-0">
                      {lineTotal.toLocaleString()}{' '}
                      <span className="text-[10px] font-sans font-normal text-stone-500">
                        {storeSettings.currency}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Cart Summary & Checkout Bar */}
      <div className="p-4 bg-white border-t-2 border-warm-200 shadow-md space-y-2.5">
        {/* Financial Breakdown */}
        <div className="space-y-1.5 text-xs text-stone-700">
          <div className="flex justify-between">
            <span>المجموع الإجمالي:</span>
            <span className="font-mono font-semibold">
              {cartSummary.subtotal.toLocaleString()} {storeSettings.currency}
            </span>
          </div>

          {cartSummary.totalDiscount > 0 && (
            <div className="flex justify-between text-rose-600 font-semibold">
              <span>إجمالي الخصومات:</span>
              <span className="font-mono">
                -{cartSummary.totalDiscount.toLocaleString()} {storeSettings.currency}
              </span>
            </div>
          )}

          {cartSummary.depositItemsTotal > 0 && (
            <div className="flex justify-between text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
              <span>منها عربون حجز:</span>
              <span className="font-mono">
                {cartSummary.depositItemsTotal.toLocaleString()} {storeSettings.currency}
              </span>
            </div>
          )}

          <div className="flex justify-between items-baseline pt-2 border-t border-stone-200 text-sm sm:text-base font-black text-brand-900">
            <span>المبلغ الصافي للدفع:</span>
            <div className="text-left font-mono text-xl sm:text-2xl text-brand-800">
              {cartSummary.netTotal.toLocaleString()}{' '}
              <span className="text-xs font-sans font-normal text-stone-600">
                {storeSettings.currency}
              </span>
            </div>
          </div>
        </div>

        {/* Checkout Action Buttons: Side-by-Side */}
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 pt-1">
          {/* 1. Primary Button: Pay & Print Receipt (F4) */}
          <button
            type="button"
            disabled={cart.length === 0}
            onClick={() => setIsPaymentModalOpen(true)}
            title="إتمام الدفع وطباعة إيصال الفاتورة على الطابعة الحرارية (اختصار: F4)"
            className={`py-3 px-2 rounded-xl font-black text-xs flex flex-col sm:flex-row items-center justify-center gap-1 shadow-md transition-all active:scale-[0.98] ${
              cart.length === 0
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                : 'bg-brand-800 hover:bg-brand-900 text-white shadow-brand-900/30 hover:shadow-lg cursor-pointer border border-gold-500/30'
            }`}
          >
            <div className="flex items-center gap-1">
              <Printer className="w-3.5 h-3.5 text-gold-400 shrink-0" />
              <span>إتمام وطباعة</span>
            </div>
            <span className="text-[10px] font-mono text-gold-300 font-bold">(F4)</span>
          </button>

          {/* 2. Secondary / Fast Button: Pay Without Printing (Shift+Enter) */}
          <button
            type="button"
            disabled={cart.length === 0}
            onClick={handleFastCheckoutNoPrint}
            title="تسجيل البيع فوراً في اليومية والشفت بدون طباعة وصل حراري (اختصار: Shift+Enter)"
            className={`py-3 px-2 rounded-xl font-black text-xs flex flex-col sm:flex-row items-center justify-center gap-1 shadow-md transition-all active:scale-[0.98] ${
              cart.length === 0
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-900/30 hover:shadow-lg cursor-pointer border border-emerald-600/50'
            }`}
          >
            <div className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
              <span>دفع سريع</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-200 font-bold">(Shift+↵)</span>
          </button>
        </div>
      </div>

      {/* Payment Calculator Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onFastSuccess={(msg) => triggerToast(msg)}
      />


      {/* Delete / Clear Suspended Cart Confirmation Modal */}
      {cartToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5 text-right border border-warm-200 animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-stone-900 text-center mb-1">
              إلغاء الفاتورة المعلقة
            </h3>
            <p className="text-xs text-stone-600 text-center mb-4 leading-relaxed">
              هل أنت متأكد من إلغاء وحذف <span className="font-bold text-stone-900">{cartToDelete.name}</span> وتفريغ محتوياتها ({cartToDelete.items?.reduce((s, i) => s + i.quantity, 0) || 0} مواد)؟
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  removeCart(cartToDelete.id);
                  setCartToDelete(null);
                }}
                className="flex-1 py-2.5 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                نعم، حذف الفاتورة
              </button>
              <button
                type="button"
                onClick={() => setCartToDelete(null)}
                className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                تراجع
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick-Entry Quantity Numpad / Preset Modal */}
      <QuantityNumpadModal
        isOpen={Boolean(numpadItem)}
        item={numpadItem}
        currency={storeSettings.currency}
        onClose={() => setNumpadItem(null)}
        onSave={(cartItemId, qty) => {
          updateItemQuantity(cartItemId, qty);
          setNumpadItem(null);
        }}
      />
    </aside>
  );
}

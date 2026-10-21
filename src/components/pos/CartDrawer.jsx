import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Truck,
  Scale,
  Coins,
  FileEdit,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { PaymentModal } from './PaymentModal';
import { QuantityNumpadModal } from './QuantityNumpadModal';
import {
  isWeightedProduct,
  roundIQD,
  getCartItemLineTotal,
  calculateAmountFromWeight,
} from '../../utils/productAnalyticsHelper';

// Isolated Memoized Cart Line Item to prevent full cart & app re-renders on keystrokes
const CartItemRow = React.memo(function CartItemRow({
  item,
  currency,
  isEditing,
  onOpenOverride,
  onCloseOverride,
  onSaveOverride,
  onRemove,
  onUpdateQuantity,
  onSetTotalAmount,
  onOpenNumpad,
}) {
  const isWeighted = isWeightedProduct(item.product);
  const lineTotal = getCartItemLineTotal(item);

  // Local buffered states for instantaneous keystroke typing with zero frame drops
  const [localWeight, setLocalWeight] = useState(item.quantity);
  const [localAmount, setLocalAmount] = useState(
    item.manualTotalAmount !== undefined && item.manualTotalAmount !== null
      ? item.manualTotalAmount
      : lineTotal
  );
  const [localQty, setLocalQty] = useState(item.quantity);

  // Single-order price override / discount form states
  const [customPriceInput, setCustomPriceInput] = useState(String(item.unitPrice));
  const [customDiscountInput, setCustomDiscountInput] = useState(
    item.discount > 0 ? String(item.discount) : ''
  );

  const debounceWeightRef = useRef(null);
  const debounceAmountRef = useRef(null);
  const debounceQtyRef = useRef(null);

  // Sync state when props update externally (e.g. from numpad or other actions)
  useEffect(() => {
    setLocalWeight(item.quantity);
  }, [item.quantity]);

  useEffect(() => {
    setLocalQty(item.quantity);
  }, [item.quantity]);

  useEffect(() => {
    setLocalAmount(
      item.manualTotalAmount !== undefined && item.manualTotalAmount !== null
        ? item.manualTotalAmount
        : lineTotal
    );
  }, [item.manualTotalAmount, lineTotal]);

  useEffect(() => {
    if (isEditing) {
      setCustomPriceInput(String(item.unitPrice));
      setCustomDiscountInput(item.discount > 0 ? String(item.discount) : '');
    }
  }, [isEditing, item.unitPrice, item.discount]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (debounceWeightRef.current) clearTimeout(debounceWeightRef.current);
      if (debounceAmountRef.current) clearTimeout(debounceAmountRef.current);
      if (debounceQtyRef.current) clearTimeout(debounceQtyRef.current);
    };
  }, []);

  const handleWeightChange = (e) => {
    const val = e.target.value;
    setLocalWeight(val);
    if (debounceWeightRef.current) clearTimeout(debounceWeightRef.current);
    if (val === '') return;
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      debounceWeightRef.current = setTimeout(() => {
        onUpdateQuantity(num);
      }, 150);
    }
  };

  const handleWeightBlur = () => {
    if (debounceWeightRef.current) clearTimeout(debounceWeightRef.current);
    const num = parseFloat(localWeight);
    if (!isNaN(num) && num > 0) {
      onUpdateQuantity(num);
    } else {
      setLocalWeight(item.quantity);
    }
  };

  // Weight Stepper (- / + 0.25 kg)
  const handleDecrementWeight = () => {
    if (debounceWeightRef.current) clearTimeout(debounceWeightRef.current);
    if (debounceAmountRef.current) clearTimeout(debounceAmountRef.current);

    if (item.quantity <= 0.25) {
      onRemove();
      return;
    }
    let next = Math.round((item.quantity - 0.25) * 1000) / 1000;
    if (next < 0.25) {
      next = 0.25;
    }
    setLocalWeight(next);
    const newTotal = calculateAmountFromWeight(next, item.unitPrice);
    setLocalAmount(newTotal);
    onUpdateQuantity(next);
  };

  const handleIncrementWeight = () => {
    if (debounceWeightRef.current) clearTimeout(debounceWeightRef.current);
    if (debounceAmountRef.current) clearTimeout(debounceAmountRef.current);

    const next = Math.round((item.quantity + 0.25) * 1000) / 1000;
    setLocalWeight(next);
    const newTotal = calculateAmountFromWeight(next, item.unitPrice);
    setLocalAmount(newTotal);
    onUpdateQuantity(next);
  };

  const handleAmountChange = (e) => {
    const val = e.target.value;
    setLocalAmount(val);
    if (debounceAmountRef.current) clearTimeout(debounceAmountRef.current);
    if (val === '') return;
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      debounceAmountRef.current = setTimeout(() => {
        onSetTotalAmount(num);
      }, 150);
    }
  };

  const handleAmountBlur = () => {
    if (debounceAmountRef.current) clearTimeout(debounceAmountRef.current);
    const num = parseFloat(localAmount);
    if (!isNaN(num) && num >= 0) {
      onSetTotalAmount(num);
    } else {
      setLocalAmount(
        item.manualTotalAmount !== undefined && item.manualTotalAmount !== null
          ? item.manualTotalAmount
          : lineTotal
      );
    }
  };

  const handleQtyChange = (e) => {
    const val = e.target.value;
    setLocalQty(val);
    if (debounceQtyRef.current) clearTimeout(debounceQtyRef.current);
    if (val === '') return;
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      debounceQtyRef.current = setTimeout(() => {
        onUpdateQuantity(num);
      }, 150);
    }
  };

  const handleQtyBlur = () => {
    if (debounceQtyRef.current) clearTimeout(debounceQtyRef.current);
    const num = parseFloat(localQty);
    if (!isNaN(num) && num > 0) {
      onUpdateQuantity(num);
    } else {
      setLocalQty(item.quantity);
    }
  };

  return (
    <div className="bg-white rounded-xl p-3 border border-warm-200/90 shadow-xs hover:border-brand-700/40 transition-all text-right">
      {/* Top: Item Title & Delete */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="font-bold text-sm text-stone-800 truncate leading-snug">
            {item.product.name}
          </div>
          {/* Price indicator & Override Badge */}
          <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
            <span className="font-mono text-xs text-stone-500 font-semibold">
              {item.unitPrice.toLocaleString()} {currency}
              {isWeighted ? ' / كغم' : ''}
            </span>

            {isWeighted && (
              <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.2 rounded font-black">
                ⚖️ بالوزن
              </span>
            )}

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
          onClick={onRemove}
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
              {currency}
            </span>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => onSaveOverride(customPriceInput, customDiscountInput)}
              className="flex-1 bg-brand-800 text-white text-xs font-bold py-1.5 rounded-lg hover:bg-brand-900 cursor-pointer"
            >
              تطبيق على الطلب
            </button>
            <button
              onClick={onCloseOverride}
              className="px-3 bg-stone-200 text-stone-700 text-xs font-medium rounded-lg hover:bg-stone-300 cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </div>
      ) : isWeighted ? (
        /* Bi-directional Weight & Total Amount Controls for Weighted Products */
        <div className="mt-2.5 pt-2 border-t border-amber-200/60 bg-amber-50/50 -mx-3 -mb-3 px-3 py-2 rounded-b-xl space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {/* 1. Weight Direct Control */}
            <div className="bg-white rounded-lg p-1 border border-amber-300/80 shadow-2xs">
              <div className="flex items-center justify-between text-[10px] font-bold text-amber-900 px-1 mb-1">
                <span className="flex items-center gap-1">
                  <Scale className="w-3 h-3 text-amber-700" />
                  <span>الوزن (كغم):</span>
                </span>
                <button
                  type="button"
                  onClick={() => onOpenNumpad('weight')}
                  className="p-0.5 rounded hover:bg-amber-100 text-amber-800 transition-colors cursor-pointer"
                  title="لوحة أوزان سريعة"
                >
                  <Calculator className="w-3 h-3" />
                </button>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleDecrementWeight}
                  className="w-6 h-6 rounded bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700 transition-colors cursor-pointer shrink-0 active:scale-95"
                  title="تقليل 250 غرام (-0.25 كغم)"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <input
                  type="number"
                  step="0.25"
                  min="0.01"
                  value={localWeight}
                  onChange={handleWeightChange}
                  onBlur={handleWeightBlur}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleWeightBlur();
                  }}
                  onFocus={(e) => e.target.select()}
                  className="w-full text-center font-mono font-black text-xs text-stone-900 bg-amber-50/30 border border-amber-200 rounded py-0.5 px-0.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  title="اكتب الوزن المطلوب بالكيلوغرام (مثال: 0.5 أو 0.75 أو 1) وسيتم احتساب المبلغ فورياً"
                />
                <button
                  type="button"
                  onClick={handleIncrementWeight}
                  className="w-6 h-6 rounded bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700 transition-colors cursor-pointer shrink-0 active:scale-95"
                  title="زيادة 250 غرام (+0.25 كغم)"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* 2. Amount Direct Control (Strict Manual Price Lock & Real-time Live Binding) */}
            <div className="bg-white rounded-lg p-1 border border-emerald-300/80 shadow-2xs">
              <div className="flex items-center justify-between text-[10px] font-bold text-emerald-900 px-1 mb-1">
                <span className="flex items-center gap-1">
                  <Coins className="w-3 h-3 text-emerald-700" />
                  <span>المبلغ ({currency}):</span>
                </span>
                <button
                  type="button"
                  onClick={() => onOpenNumpad('amount')}
                  className="p-0.5 rounded hover:bg-emerald-100 text-emerald-800 transition-colors cursor-pointer"
                  title="لوحة مبالغ سريعة (بالآلاف)"
                >
                  <Coins className="w-3 h-3" />
                </button>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  step="250"
                  min="0"
                  value={localAmount}
                  onChange={handleAmountChange}
                  onBlur={handleAmountBlur}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAmountBlur();
                  }}
                  onFocus={(e) => e.target.select()}
                  className="w-full text-center font-mono font-black text-xs text-stone-900 bg-emerald-50/30 border border-emerald-200 rounded py-0.5 px-0.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  title="اكتب المبلغ المطلوب (مثال: 20000) وسيتم احتساب الوزن وتثبيت المبلغ فورياً"
                />
              </div>
            </div>
          </div>

          {/* Bottom row: Override button & line total */}
          <div className="flex items-center justify-between pt-0.5">
            <button
              type="button"
              onClick={onOpenOverride}
              title="تعديل سعر الكيلو أو إضافة خصم لهذا الطلب فقط"
              className="px-2 py-0.5 rounded text-[10px] font-bold text-amber-900 hover:bg-amber-100 border border-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Tag className="w-2.5 h-2.5 text-gold-600" />
              <span>سعر الكيلو/خصم</span>
            </button>

            <div className="text-left font-mono font-black text-xs sm:text-sm text-stone-900">
              {lineTotal.toLocaleString()}{' '}
              <span className="text-[10px] font-sans font-normal text-stone-500">
                {currency}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Bottom: Quantity Controls & Subtotal for Standard Items */
        <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between gap-1.5 flex-wrap sm:flex-nowrap">
          {/* Quantity Selector & Numpad Quick Entry */}
          <div className="flex items-center gap-1 bg-stone-100 rounded-lg p-0.5 border border-stone-200 shrink-0">
            <button
              type="button"
              onClick={() => {
                const step = item.quantity <= 1 && item.quantity > 0.25 ? 0.25 : 1;
                const next = Math.max(0, Math.round((item.quantity - step) * 1000) / 1000);
                setLocalQty(next);
                onUpdateQuantity(next);
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
              value={localQty}
              onChange={handleQtyChange}
              onBlur={handleQtyBlur}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleQtyBlur();
              }}
              onFocus={(e) => e.target.select()}
              className="w-14 text-center font-mono font-black text-xs text-stone-900 bg-white border border-stone-300 rounded py-1 px-0.5 focus:outline-none focus:ring-1 focus:ring-brand-800"
              title="اكتب الكمية مباشرة"
            />

            <button
              type="button"
              onClick={() => {
                const step = item.quantity < 1 ? 0.25 : 1;
                const next = Math.round((item.quantity + step) * 1000) / 1000;
                setLocalQty(next);
                onUpdateQuantity(next);
              }}
              className="w-7 h-7 rounded bg-white hover:bg-stone-200 flex items-center justify-center text-stone-700 transition-colors cursor-pointer"
              title="زيادة الكمية"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>

            {/* Touch Numpad / Preset Trigger */}
            <button
              type="button"
              onClick={() => onOpenNumpad('weight')}
              className="w-7 h-7 rounded bg-brand-50 hover:bg-brand-100 flex items-center justify-center text-brand-800 border border-brand-200/80 transition-colors cursor-pointer"
              title="لوحة الأرقام السريعة"
            >
              <Calculator className="w-3.5 h-3.5 text-brand-700" />
            </button>
          </div>

          {/* Single-order Override Trigger Button */}
          <button
            type="button"
            onClick={onOpenOverride}
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
              {currency}
            </span>
          </div>
        </div>
      )}
    </div>
  );
});

export function CartDrawer() {
  const {
    cart,
    updateItemQuantity,
    setCartItemTotalAmount,
    removeFromCart,
    clearCart,
    overrideCartItemPrice,
    applyCartItemDiscount,
    cartSummary,
    storeSettings,
    carts,
    activeCartId,
    activeCart,
    switchCart,
    addNewCart,
    removeCart,
    completeSale,
    directPrintReceipt,
  } = usePOS();

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [activeOverrideItemId, setActiveOverrideItemId] = useState(null);
  const [cartToDelete, setCartToDelete] = useState(null);
  const [numpadItem, setNumpadItem] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 2500);
  };

  // 1. Button 1 Action: Quick Cash Pay (Shift+Enter) - Green
  // Instantly finalizes order as Cash, clears the cart immediately WITHOUT printing any receipt
  const handleQuickCashPay = () => {
    if (cart.length === 0) return;
    const finalNet = cartSummary.itemsNet + (Number(activeCart?.deliveryFee) || 0);
    const sale = completeSale(
      {
        amountReceived: finalNet,
        changeDue: 0,
        paymentMethod: 'نقداً',
        customerName: 'زبون عام',
        notes: '',
        printReceipt: false,
      },
      false
    );
    if (sale) {
      triggerToast('تم تسجيل الدفع نقداً بنجاح (بدون طباعة)');
    }
  };

  // 2. Button 2 Action: Direct Print (F4) - Dark Red / Primary
  // Finalizes the transaction, sends direct print job to the thermal printer, and clears the cart
  const handleDirectPrint = () => {
    if (cart.length === 0) return;
    const finalNet = cartSummary.itemsNet + (Number(activeCart?.deliveryFee) || 0);
    const sale = completeSale(
      {
        amountReceived: finalNet,
        changeDue: 0,
        paymentMethod: 'نقداً',
        customerName: 'زبون عام',
        notes: '',
        printReceipt: false,
      },
      false
    );
    if (sale) {
      directPrintReceipt(sale);
      triggerToast('تم إتمام الطلب وطباعة الوصل');
    }
  };

  // Cashier Keyboard Shortcuts:
  // - Shift + Enter: Quick Cash Pay (Without Printing)
  // - F4: Direct Print
  useEffect(() => {
    const handleKeyDown = (e) => {
      // F4: Direct Print (Button 2)
      if (e.key === 'F4') {
        e.preventDefault();
        if (cart.length > 0 && !isPaymentModalOpen) {
          handleDirectPrint();
        }
      }

      // Shift + Enter: Quick Cash Pay & Print (Button 1)
      if (e.shiftKey && e.key === 'Enter') {
        e.preventDefault();
        if (cart.length > 0 && !isPaymentModalOpen) {
          handleQuickCashPay();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, isPaymentModalOpen, cartSummary.itemsNet, activeCart?.deliveryFee]);

  const handleDeleteCartClick = (cartItem) => {
    if (cartItem.items && cartItem.items.length > 0) {
      setCartToDelete(cartItem);
    } else {
      removeCart(cartItem.id);
    }
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
          cart.map((item) => (
            <CartItemRow
              key={item.cartItemId}
              item={item}
              currency={storeSettings.currency}
              isEditing={activeOverrideItemId === item.cartItemId}
              onOpenOverride={() => setActiveOverrideItemId(item.cartItemId)}
              onCloseOverride={() => setActiveOverrideItemId(null)}
              onSaveOverride={(price, discount) => {
                if (price !== '') overrideCartItemPrice(item.cartItemId, price);
                if (discount !== '') applyCartItemDiscount(item.cartItemId, discount);
                else applyCartItemDiscount(item.cartItemId, 0);
                setActiveOverrideItemId(null);
              }}
              onRemove={() => removeFromCart(item.cartItemId)}
              onUpdateQuantity={(qty) => updateItemQuantity(item.cartItemId, qty)}
              onSetTotalAmount={(amt) => setCartItemTotalAmount(item.cartItemId, amt)}
              onOpenNumpad={(mode) => setNumpadItem({ ...item, initialMode: mode })}
            />
          ))
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
              {cartSummary.itemsNet.toLocaleString()}{' '}
              <span className="text-xs font-sans font-normal text-stone-600">
                {storeSettings.currency}
              </span>
            </div>
          </div>
        </div>

        {/* Checkout Action Buttons: 3 Equal-Width Buttons */}
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          {/* 1. Button 1: Quick Cash Pay (Shift+Enter) - Green */}
          <button
            type="button"
            disabled={cart.length === 0}
            onClick={handleQuickCashPay}
            title="دفع سريع نقداً وتسجيل الفاتورة فوراً وتفريغ السلة بدون طباعة (اختصار: Shift+Enter)"
            className={`py-2.5 px-1 rounded-xl font-black text-xs flex flex-col items-center justify-center gap-1 shadow-md transition-all active:scale-[0.98] ${
              cart.length === 0
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-900/30 hover:shadow-lg cursor-pointer border border-emerald-600/50'
            }`}
          >
            <div className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
              <span className="truncate">دفع سريع</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-200 font-bold">(Shift+↵)</span>
          </button>

          {/* 2. Button 2: Direct Print (F4) - Dark Red / Primary */}
          <button
            type="button"
            disabled={cart.length === 0}
            onClick={handleDirectPrint}
            title="إتمام الطلب وإرسال أمر الطباعة المباشرة على الطابعة الحرارية وتفريغ السلة (اختصار: F4)"
            className={`py-2.5 px-1 rounded-xl font-black text-xs flex flex-col items-center justify-center gap-1 shadow-md transition-all active:scale-[0.98] ${
              cart.length === 0
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                : 'bg-brand-800 hover:bg-brand-900 text-white shadow-brand-900/30 hover:shadow-lg cursor-pointer border border-gold-500/30'
            }`}
          >
            <div className="flex items-center gap-1">
              <Printer className="w-3.5 h-3.5 text-gold-400 shrink-0" />
              <span className="truncate">طباعة</span>
            </div>
            <span className="text-[10px] font-mono text-gold-300 font-bold">(F4)</span>
          </button>

          {/* 3. Button 3: Preview, Edit & Print - Blue / Secondary */}
          <button
            type="button"
            disabled={cart.length === 0}
            onClick={() => setIsPaymentModalOpen(true)}
            title="معاينة الوصل المباشرة، تعديل طريقة الدفع والخصم والملاحظات ثم الطباعة"
            className={`py-2.5 px-1 rounded-xl font-black text-xs flex flex-col items-center justify-center gap-1 shadow-md transition-all active:scale-[0.98] ${
              cart.length === 0
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-900/30 hover:shadow-lg cursor-pointer border border-blue-500/50'
            }`}
          >
            <div className="flex items-center gap-1">
              <FileEdit className="w-3.5 h-3.5 text-blue-200 shrink-0" />
              <span className="truncate">تعديل وطباعة</span>
            </div>
            <span className="text-[10px] text-blue-200 font-bold">معاينة 👁️</span>
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
        onSave={(cartItemId, qty, lockedAmount) => {
          if (lockedAmount !== null && lockedAmount !== undefined) {
            setCartItemTotalAmount(cartItemId, lockedAmount);
          } else {
            updateItemQuantity(cartItemId, qty);
          }
          setNumpadItem(null);
        }}
      />
    </aside>
  );
}

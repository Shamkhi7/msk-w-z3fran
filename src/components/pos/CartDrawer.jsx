import React, { useState } from 'react';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Tag,
  Receipt,
  X,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { PaymentModal } from './PaymentModal';

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
  } = usePOS();

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [activeOverrideItemId, setActiveOverrideItemId] = useState(null);
  const [customPriceInput, setCustomPriceInput] = useState('');
  const [customDiscountInput, setCustomDiscountInput] = useState('');

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
    <aside className="w-full lg:w-[380px] xl:w-[420px] bg-white border-r border-warm-200 flex flex-col h-full shadow-lg select-none z-10">
      {/* Drawer Header */}
      <div className="p-3.5 bg-brand-800 text-white flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-gold-400" />
          <h2 className="font-bold text-sm sm:text-base">سلة الطلب الحالي</h2>
          {cartSummary.itemCount > 0 && (
            <span className="bg-brand-950 text-gold-300 text-xs font-mono font-bold px-2 py-0.5 rounded-full">
              {cartSummary.itemCount} صنف
            </span>
          )}
        </div>

        {cart.length > 0 && (
          <button
            onClick={clearCart}
            title="تفريغ السلة بالكامل"
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
                      <span>تعديل سعر / خصم خاص لهذا الطلب فقط:</span>
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
                  <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between">
                    {/* Quantity Selector */}
                    <div className="flex items-center gap-1 bg-stone-100 rounded-lg p-0.5 border border-stone-200">
                      <button
                        onClick={() => updateItemQuantity(item.cartItemId, item.quantity - 1)}
                        className="w-7 h-7 rounded bg-white hover:bg-stone-200 flex items-center justify-center text-stone-700 transition-colors cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center font-mono font-bold text-xs text-stone-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateItemQuantity(item.cartItemId, item.quantity + 1)}
                        className="w-7 h-7 rounded bg-white hover:bg-stone-200 flex items-center justify-center text-stone-700 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Single-order Override Trigger Button */}
                    <button
                      onClick={() => openOverrideDialog(item)}
                      title="تعديل السعر أو إضافة خصم لهذا الصنف فقط"
                      className="px-2.5 py-1.5 rounded text-xs font-bold text-brand-800 hover:bg-brand-50 border border-brand-800/20 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Tag className="w-3.5 h-3.5 text-gold-500" />
                      <span>تعديل السعر / خصم</span>
                    </button>

                    {/* Line Total */}
                    <div className="text-left font-mono font-bold text-sm text-stone-900">
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

        {/* Primary Checkout Button */}
        <button
          disabled={cart.length === 0}
          onClick={() => setIsPaymentModalOpen(true)}
          className={`w-full py-4 px-4 rounded-xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] ${
            cart.length === 0
              ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
              : 'bg-brand-800 hover:bg-brand-900 text-white shadow-brand-900/30 hover:shadow-lg cursor-pointer'
          }`}
        >
          <Receipt className="w-5 h-5 text-gold-400" />
          <span>إتمام الدفع وطباعة الوصل (F4)</span>
        </button>
      </div>

      {/* Payment Calculator Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
      />
    </aside>
  );
}

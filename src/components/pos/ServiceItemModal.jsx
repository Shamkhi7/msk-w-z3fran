import React, { useState } from 'react';
import { X, Check, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { usePOS } from '../../context/POSContext';

export function ServiceItemModal({ serviceType, isOpen, onClose }) {
  const { addToCart, products, storeSettings } = usePOS();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  if (!isOpen || !serviceType) return null;

  const isDeposit = serviceType === 'deposit';
  const title = isDeposit ? 'تسجيل عربون حجز (Advance Deposit)' : 'تسجيل متبقي حجز (Remaining Balance)';
  const defaultBaseAmount = isDeposit ? 10000 : 15000;

  const quickAmounts = [5000, 10000, 15000, 20000, 25000, 50000];

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalAmount = Number(amount) || defaultBaseAmount;
    if (finalAmount <= 0) return;

    const baseProduct = products.find((p) =>
      isDeposit ? p.id === 'service-deposit' : p.id === 'service-remaining'
    ) || {
      id: isDeposit ? 'service-deposit' : 'service-remaining',
      name: isDeposit ? 'عربون حجز' : 'متبقي حجز',
      isService: true,
      isDeposit,
      price: finalAmount,
    };

    const customizedProduct = {
      ...baseProduct,
      name: note.trim()
        ? `${baseProduct.name} - ${note.trim()}`
        : baseProduct.name,
    };

    addToCart(customizedProduct, finalAmount);
    setAmount('');
    setNote('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in select-none">
      <div className="bg-[#FAF8F5] border border-brand-900/20 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
        {/* Header */}
        <div className={`px-4 py-3 flex items-center justify-between text-white ${
          isDeposit ? 'bg-emerald-800' : 'bg-brand-800'
        }`}>
          <div className="flex items-center gap-2">
            {isDeposit ? <ArrowDownLeft className="w-5 h-5 text-gold-400" /> : <ArrowUpRight className="w-5 h-5 text-gold-400" />}
            <h3 className="font-bold text-sm">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-black/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              المبلغ المراد إضافته للفاتورة ({storeSettings.currency}):
            </label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={defaultBaseAmount.toLocaleString()}
                step="500"
                min="500"
                autoFocus
                className="w-full bg-white border-2 border-stone-300 focus:border-brand-800 rounded-xl px-3 py-2.5 text-xl font-mono font-bold text-center focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Quick Amount Chips */}
          <div className="grid grid-cols-3 gap-1.5">
            {quickAmounts.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setAmount(String(amt))}
                className="py-1.5 px-2 bg-white hover:bg-warm-100 border border-warm-200 rounded-lg text-xs font-mono font-bold text-stone-700 transition-colors cursor-pointer"
              >
                +{amt.toLocaleString()}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              اسم الزبون أو ملاحظة الحجز (اختياري):
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="مثال: حجز كيك أم يوسف"
              className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-800"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2 pt-2 border-t border-stone-200">
            <button
              type="submit"
              className={`flex-1 text-white text-sm font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer ${
                isDeposit
                  ? 'bg-emerald-700 hover:bg-emerald-800'
                  : 'bg-brand-800 hover:bg-brand-900'
              }`}
            >
              <Check className="w-4 h-4 text-gold-400" />
              <span>إدراج في الفاتورة السريعة</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 text-sm font-medium rounded-xl transition-colors cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

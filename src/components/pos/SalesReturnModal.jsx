import React, { useState } from 'react';
import { X, Check, RotateCcw, User, FileText, DollarSign, PackageMinus } from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { numberToArabicWords } from '../../utils/arabicNumberToWords';

export function SalesReturnModal({ isOpen, onClose }) {
  const { products, addSalesReturn, storeSettings } = usePOS();

  const [selectedProductId, setSelectedProductId] = useState('');
  const [returnQty, setReturnQty] = useState('1');
  const [returnAmount, setReturnAmount] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [originalReceiptNo, setOriginalReceiptNo] = useState('');
  const [reason, setReason] = useState('إرجاع صنف ومسترجع نقدي');

  if (!isOpen) return null;

  const handleProductSelect = (e) => {
    const prodId = e.target.value;
    setSelectedProductId(prodId);
    setReturnQty('1');
    if (prodId) {
      const prod = products.find((p) => p.id === prodId);
      if (prod) {
        setReturnAmount(String(prod.price));
      }
    }
  };

  const numAmount = Number(returnAmount) || 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (numAmount <= 0) {
      alert('يرجى إدخال مبلغ المردود المسترجع بشكل صحيح');
      return;
    }

    const selectedProduct = products.find((p) => p.id === selectedProductId);
    const qty = selectedProduct ? (parseFloat(returnQty) || 1) : 1;
    const returnItems = selectedProduct
      ? [
          {
            id: selectedProduct.id,
            name: selectedProduct.name,
            category: selectedProduct.category,
            quantity: qty,
            unitPrice: selectedProduct.price,
            price: numAmount,
          },
        ]
      : [];

    addSalesReturn({
      amount: numAmount,
      customerName: customerName.trim() || 'زبون عام',
      originalReceiptNo: originalReceiptNo.trim(),
      reason: reason.trim() || 'إرجاع صنف ومسترجع نقدي',
      items: returnItems,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-fade-in select-none">
      <div className="bg-[#FAF8F5] border border-stone-300 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="bg-brand-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-gold-500/30">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-gold-400" />
            <h3 className="font-bold text-base">تسجيل مردود مبيعات / إرجاع صنف</h3>
          </div>
          <button
            onClick={onClose}
            className="text-warm-200 hover:text-white p-1 rounded-lg hover:bg-brand-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-3.5">
          {/* Product Selector (Optional) */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              اختر الصنف المراد إرجاعه (أو أدخل المبلغ يدوياً أدناه):
            </label>
            <select
              value={selectedProductId}
              onChange={handleProductSelect}
              className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-brand-800 cursor-pointer"
            >
              <option value="">-- إرجاع مخصص بمبلغ يدوي --</option>
              {products
                .filter((p) => !p.isService)
                .map((prod) => (
                  <option key={prod.id} value={prod.id}>
                    {prod.name} ({prod.price.toLocaleString()} {storeSettings.currency})
                  </option>
                ))}
            </select>
          </div>

          {/* Return Quantity & Price per Unit when a Product is selected */}
          {selectedProductId && (
            <div className="grid grid-cols-2 gap-2.5 bg-stone-100/80 p-2.5 rounded-xl border border-stone-200 animate-fade-in">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  الكمية المرتجعة (كغم أو عدد):
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  value={returnQty}
                  onChange={(e) => {
                    const newQty = e.target.value;
                    setReturnQty(newQty);
                    const prod = products.find((p) => p.id === selectedProductId);
                    if (prod && newQty && !isNaN(parseFloat(newQty))) {
                      const calculated = Math.round(prod.price * parseFloat(newQty));
                      setReturnAmount(String(calculated));
                    }
                  }}
                  className="w-full bg-white border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold focus:outline-none focus:ring-1 focus:ring-rose-600 text-center"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">
                  سعر الوحدة الأصلي:
                </label>
                <div className="w-full bg-stone-200/70 border border-stone-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-stone-700 text-center">
                  {products.find((p) => p.id === selectedProductId)?.price.toLocaleString()} {storeSettings.currency}
                </div>
              </div>
            </div>
          )}

          {/* Refund Amount */}
          <div className="bg-white p-3.5 rounded-2xl border-2 border-rose-300 space-y-1 text-center">
            <label className="block text-xs font-bold text-rose-900">
              المبلغ المسترجع للزبون نقداً ({storeSettings.currency}):
            </label>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-black text-rose-700 font-mono">-</span>
              <input
                type="number"
                value={returnAmount}
                onChange={(e) => setReturnAmount(e.target.value)}
                placeholder="0"
                step="250"
                min="0"
                autoFocus
                className="w-48 bg-stone-50 border-2 border-stone-300 focus:border-rose-600 rounded-xl px-3 py-2 text-2xl font-mono font-black text-center text-rose-700 focus:outline-none"
                required
              />
            </div>
            {numAmount > 0 && (
              <div className="text-[11px] text-stone-600 italic pt-1">
                {numberToArabicWords(
                  numAmount,
                  storeSettings.currency === 'د.ع' ? 'دينار عراقي' : storeSettings.currency
                )}
              </div>
            )}
          </div>

          {/* Customer & Original Invoice Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                اسم الزبون:
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="اسم الزبون (اختياري)"
                  className="w-full bg-white border border-stone-300 rounded-xl pr-9 pl-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                رقم الفاتورة الأصلية (إن وجد):
              </label>
              <input
                type="text"
                value={originalReceiptNo}
                onChange={(e) => setOriginalReceiptNo(e.target.value)}
                placeholder="INV-2026-xxxx"
                className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-brand-800"
              />
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              سبب الإرجاع والملاحظات:
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              placeholder="مثال: تبديل طلب، خطأ في الحجم، إلخ..."
              className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-800"
              required
            />
          </div>

          <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-[11px] text-rose-900 leading-snug">
            سيتم خصم هذا المبلغ فورياً من إجمالي إيراد اليومية الحالية ومن صافي النقد بالدرج، وسيصدر وصل حراري رسمي بعنوان "وصل مردود مبيعات".
          </div>

          {/* Actions */}
          <div className="flex gap-2.5 pt-2 border-t border-stone-200">
            <button
              type="submit"
              className="flex-1 bg-rose-700 hover:bg-rose-800 text-white font-black py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>تأكيد المردود وطباعة الوصل الحراري (72.1mm)</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl transition-colors text-sm cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

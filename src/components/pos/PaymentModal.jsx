import React, { useState, useEffect } from 'react';
import {
  X,
  Check,
  CreditCard,
  Banknote,
  Clock,
  Printer,
  Calculator,
  User,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { numberToArabicWords } from '../../utils/arabicNumberToWords';

export function PaymentModal({ isOpen, onClose }) {
  const { cartSummary, completeSale, storeSettings } = usePOS();

  const [amountReceived, setAmountReceived] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('نقداً');
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');

  const netTotal = cartSummary.netTotal;

  useEffect(() => {
    if (isOpen) {
      setAmountReceived(String(netTotal));
      setPaymentMethod('نقداً');
      setCustomerName('');
      setNotes('');
    }
  }, [isOpen, netTotal]);

  if (!isOpen) return null;

  const numReceived = Number(amountReceived) || 0;
  const changeDue = Math.max(0, numReceived - netTotal);
  const isShortage = numReceived < netTotal && paymentMethod === 'نقداً';

  const quickCashOptions = [
    { label: 'المبلغ بالضبط', val: netTotal },
    { label: '5,000', val: 5000 },
    { label: '10,000', val: 10000 },
    { label: '25,000', val: 25000 },
    { label: '50,000', val: 50000 },
    { label: '100,000', val: 100000 },
  ];

  const handleQuickCash = (val) => {
    setAmountReceived(String(val));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isShortage) {
      alert('المبلغ المستلم أقل من المبلغ المطلوب للطلب!');
      return;
    }

    completeSale({
      amountReceived: numReceived,
      changeDue,
      paymentMethod,
      customerName: customerName.trim() || 'زبون عام',
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in select-none">
      <div className="bg-[#FAF8F5] border border-brand-900/20 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="bg-brand-800 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-gold-400" />
            <h3 className="font-bold text-base">حاسبة الدفع وإصدار الفاتورة</h3>
          </div>
          <button
            onClick={onClose}
            className="text-warm-200 hover:text-white p-1 rounded-lg hover:bg-brand-900/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Net Amount Banner */}
          <div className="bg-white p-3.5 rounded-2xl border-2 border-brand-800/30 text-center space-y-1 shadow-xs">
            <div className="text-xs font-bold text-stone-500">المبلغ الإجمالي المطلوب للدفع:</div>
            <div className="text-3xl sm:text-4xl font-mono font-black text-brand-900">
              {netTotal.toLocaleString()}{' '}
              <span className="text-sm font-sans font-normal text-stone-600">
                {storeSettings.currency}
              </span>
            </div>
            <div className="text-[11px] text-stone-600 italic">
              {numberToArabicWords(netTotal, storeSettings.currency === 'د.ع' ? 'دينار عراقي' : storeSettings.currency)}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              طريقة استلام المبلغ:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'نقداً', label: 'نقداً (كاش)', icon: Banknote },
                { id: 'بطاقة إلكترونية', label: 'بطاقة / شبكة', icon: CreditCard },
                { id: 'آجل / ذمم', label: 'حساب آجل', icon: Clock },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setPaymentMethod(m.id);
                      if (m.id !== 'نقداً') {
                        setAmountReceived(String(netTotal));
                      }
                    }}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-brand-800 text-white border-brand-900 shadow-sm'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-warm-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-gold-400' : 'text-stone-500'}`} />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cash Received & Change Due Box */}
          {paymentMethod === 'نقداً' && (
            <div className="space-y-3 bg-warm-100/50 p-3.5 rounded-2xl border border-warm-200">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  المبلغ المستلم من الزبون ({storeSettings.currency}):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(e.target.value)}
                    step="250"
                    min="0"
                    autoFocus
                    className={`w-full bg-white border-2 rounded-xl px-4 py-2.5 text-2xl font-mono font-black text-center focus:outline-none transition-colors ${
                      isShortage
                        ? 'border-rose-500 text-rose-700'
                        : 'border-stone-300 focus:border-brand-800 text-stone-900'
                    }`}
                  />
                </div>
              </div>

              {/* Quick Cash Chips */}
              <div>
                <div className="text-[10px] font-bold text-stone-500 mb-1">فئات نقدية سريعة:</div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {quickCashOptions.map((opt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleQuickCash(opt.val)}
                      className="py-1.5 px-1 bg-white hover:bg-brand-50 border border-stone-300 hover:border-brand-700 rounded-lg text-[11px] font-mono font-bold text-stone-800 transition-colors text-center cursor-pointer"
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Change Due (الباقي) Display */}
              <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
                <span className="font-bold text-sm text-stone-800">الباقي للزبون (Change Due):</span>
                <div className="text-right">
                  <div
                    className={`text-xl sm:text-2xl font-mono font-black ${
                      isShortage
                        ? 'text-rose-600'
                        : changeDue > 0
                        ? 'text-emerald-700'
                        : 'text-stone-800'
                    }`}
                  >
                    {isShortage
                      ? `نقص: ${(netTotal - numReceived).toLocaleString()} ${storeSettings.currency}`
                      : `${changeDue.toLocaleString()} ${storeSettings.currency}`}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Customer Name & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                اسم الزبون (اختياري):
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="زبون عام / اسم الشخص"
                  className="w-full bg-white border border-stone-300 rounded-xl pr-9 pl-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                ملاحظات الفاتورة:
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="ملاحظات التسليم أو الطلب..."
                className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-800"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2.5 pt-2 border-t border-stone-200">
            <button
              type="submit"
              disabled={isShortage}
              className={`flex-1 font-black py-3.5 px-4 rounded-xl text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] ${
                isShortage
                  ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                  : 'bg-brand-800 hover:bg-brand-900 text-white shadow-brand-900/30 hover:shadow-lg cursor-pointer'
              }`}
            >
              <Printer className="w-5 h-5 text-gold-400" />
              <span>إتمام الدفع وطباعة الوصل (72.1mm)</span>
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

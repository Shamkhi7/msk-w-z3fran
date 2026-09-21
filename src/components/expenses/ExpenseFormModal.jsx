import React, { useState, useEffect } from 'react';
import { X, Check, Receipt, DollarSign, User, FileText, Calendar } from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { numberToArabicWords } from '../../utils/arabicNumberToWords';

export function ExpenseFormModal({ isOpen, onClose, initialData = null }) {
  const { addExpense, updateExpense, storeSettings } = usePOS();

  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('مواد أولية');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const categories = [
    'مواد أولية',
    'نسريات ومصاريف يومية',
    'رواتب وأجور',
    'صيانة ومعدات',
    'فواتير وكهرباء وماء',
    'أخرى',
  ];

  useEffect(() => {
    if (initialData) {
      setAmount(String(initialData.amount || ''));
      setRecipient(initialData.recipient || '');
      setDescription(initialData.description || '');
      setCategory(initialData.category || 'مواد أولية');
      setDate(
        initialData.date
          ? new Date(initialData.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
      );
    } else {
      setAmount('');
      setRecipient('');
      setDescription('');
      setCategory('مواد أولية');
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const numAmount = Number(amount) || 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (numAmount <= 0 || !description.trim()) {
      alert('يرجى تحديد المبلغ وبيان الصرف');
      return;
    }

    if (initialData) {
      updateExpense(initialData.id, {
        amount: numAmount,
        recipient: recipient.trim(),
        description: description.trim(),
        category,
        date: new Date(date).toISOString(),
      });
    } else {
      addExpense({
        amount: numAmount,
        recipient: recipient.trim(),
        description: description.trim(),
        category,
        date: new Date(date).toISOString(),
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-fade-in select-none">
      <div className="bg-[#FAF8F5] border border-brand-900/20 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="bg-brand-800 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-gold-400" />
            <h3 className="font-bold text-base">
              {initialData ? 'تعديل سند الصرف' : 'تسجيل سند صرف نقدي جديد (خزينة)'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-warm-200 hover:text-white p-1 rounded-lg hover:bg-brand-900/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Amount Box */}
          <div className="bg-white p-3.5 rounded-2xl border-2 border-stone-300 space-y-1">
            <label className="block text-xs font-bold text-stone-700">
              المبلغ المطلوب صرفه ({storeSettings.currency}):
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              step="250"
              min="0"
              autoFocus
              className="w-full bg-stone-50 border-2 border-stone-200 focus:border-brand-800 rounded-xl px-3 py-2 text-2xl font-mono font-black text-center focus:outline-none"
              required
            />
            {numAmount > 0 && (
              <div className="text-[11px] text-stone-600 italic text-center pt-1">
                {numberToArabicWords(
                  numAmount,
                  storeSettings.currency === 'د.ع' ? 'دينار عراقي' : storeSettings.currency
                )}
              </div>
            )}
          </div>

          {/* Paid To: "يصرف إلى السيد" */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              يصرف إلى السيد (Recipient):
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="اسم الشخص، الشركة، المورد، أو العامل..."
                className="w-full bg-white border border-stone-300 rounded-xl pr-9 pl-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-800"
                required
              />
            </div>
          </div>

          {/* Category & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                تصنيف الصرفية:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-800 cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                تاريخ الصرف:
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-800"
                required
              />
            </div>
          </div>

          {/* Reason / Description */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              بيان الصرف / السبب والتفاصيل (Description):
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="مثال: شراء كاكاو بودرة فاخر، سكر، وأكياس تغليف للمعجنات..."
              className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-800"
              required
            />
          </div>

          {/* Note on drawer deduction */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 leading-snug">
            💡 سيتم خصم هذا المبلغ فورياً من صافي نقدية الصندوق لليومية الحالية، ويحفظ السند بشكل دائم في الأرشيف دون حذفه عند تصفير اليومية.
          </div>

          {/* Actions */}
          <div className="flex gap-2.5 pt-2 border-t border-stone-200">
            <button
              type="submit"
              className="flex-1 bg-brand-800 hover:bg-brand-900 text-white font-black py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Check className="w-4 h-4 text-gold-400" />
              <span>
                {initialData ? 'حفظ التعديلات' : 'تسجيل السند وطباعة الإيصال (72.1mm)'}
              </span>
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

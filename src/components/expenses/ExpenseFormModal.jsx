import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Check,
  Receipt,
  DollarSign,
  User,
  FileText,
  Calendar,
  Zap,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { numberToArabicWords } from '../../utils/arabicNumberToWords';
import { ManagePresetExpensesModal } from './ManagePresetExpensesModal';
import { ManagerPinModal } from '../treasury/ManagerPinModal';

export function ExpenseFormModal({ isOpen, onClose, initialData = null }) {
  const {
    addExpense,
    updateExpense,
    storeSettings,
    presetExpenses,
    expenseCategories,
    isManager,
  } = usePOS();

  const safeCategories = expenseCategories && expenseCategories.length > 0
    ? expenseCategories
    : ['مواد أولية', 'نسريات ومصاريف يومية', 'رواتب وأجور', 'صيانة ومعدات', 'فواتير وكهرباء وماء', 'أخرى'];

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(safeCategories[0] || 'نسريات ومصاريف يومية');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedPresetId, setSelectedPresetId] = useState(null);

  // Manager configuration & PIN modals
  const [isManagePresetsOpen, setIsManagePresetsOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  const amountInputRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      setAmount(String(initialData.amount || ''));
      setDescription(initialData.description || '');
      setCategory(initialData.category || safeCategories[0] || 'مواد أولية');
      setDate(
        initialData.date
          ? new Date(initialData.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
      );
      setSelectedPresetId(null);
    } else {
      setAmount('');
      setDescription('');
      setCategory(safeCategories[0] || 'نسريات ومصاريف يومية');
      setDate(new Date().toISOString().split('T')[0]);
      setSelectedPresetId(null);
    }
  }, [initialData, isOpen, safeCategories]);

  if (!isOpen) return null;

  const numAmount = Number(amount) || 0;

  const handleSelectPreset = (preset) => {
    setSelectedPresetId(preset.id);
    setDescription(preset.title);
    if (preset.category) {
      setCategory(preset.category);
    }
    if (preset.defaultAmount && Number(preset.defaultAmount) > 0) {
      setAmount(String(preset.defaultAmount));
    } else {
      // Flexible amount: clear and immediately focus input
      setAmount('');
      setTimeout(() => {
        amountInputRef.current?.focus();
      }, 50);
    }
  };

  const handleQuickAddAmount = (addVal) => {
    const current = Number(amount) || 0;
    setAmount(String(current + addVal));
  };

  const handleOpenManagerConfig = () => {
    if (isManager) {
      setIsManagePresetsOpen(true);
    } else {
      setIsPinModalOpen(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (numAmount <= 0 || !description.trim()) {
      alert('يرجى تحديد المبلغ وبيان الصرف');
      return;
    }

    if (initialData) {
      updateExpense(initialData.id, {
        amount: numAmount,
        description: description.trim(),
        category,
        date: new Date(date).toISOString(),
      });
    } else {
      addExpense({
        amount: numAmount,
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
          {/* Quick Preset Expenses Section */}
          <div className="bg-white p-3.5 rounded-2xl border-2 border-brand-800/20 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-black text-brand-900">
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>الصرفيات المعتادة (اختيار سريع بنقرة واحدة):</span>
              </div>
              <button
                type="button"
                onClick={handleOpenManagerConfig}
                title="تخصيص وإدارة قوالب الصرفيات المعتادة (للمدير)"
                className="text-[11px] text-brand-800 hover:text-brand-950 font-bold flex items-center gap-1 hover:underline cursor-pointer bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200/60"
              >
                <Sliders className="w-3 h-3 text-gold-600" />
                <span>إدارة القوالب</span>
              </button>
            </div>

            {/* Quick-tap Pills */}
            <div className="flex flex-wrap gap-1.5 pt-0.5 max-h-28 overflow-y-auto pr-0.5">
              {presetExpenses && presetExpenses.length > 0 ? (
                presetExpenses.map((preset) => {
                  const isSelected = selectedPresetId === preset.id;
                  const hasAmount = preset.defaultAmount && Number(preset.defaultAmount) > 0;

                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0 ${
                        isSelected
                          ? 'bg-brand-800 text-white shadow-md ring-2 ring-gold-400'
                          : 'bg-stone-100 hover:bg-warm-100 text-stone-800 border border-stone-200 hover:border-brand-800/40'
                      }`}
                    >
                      <span>{preset.title}</span>
                      {hasAmount ? (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono font-black ${
                            isSelected
                              ? 'bg-gold-400 text-brand-950'
                              : 'bg-emerald-100 text-emerald-900'
                          }`}
                        >
                          {Number(preset.defaultAmount).toLocaleString()}
                        </span>
                      ) : (
                        <span
                          className={`text-[9px] px-1 py-0.2 rounded-md font-semibold ${
                            isSelected
                              ? 'bg-brand-900 text-gold-300'
                              : 'bg-stone-200 text-stone-600'
                          }`}
                        >
                          مرن
                        </span>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="text-[11px] text-stone-400 italic py-1">
                  لا توجد قوالب معتادة مسجلة. اضغط على "إدارة القوالب" لإضافة بنود.
                </div>
              )}
            </div>
          </div>

          {/* Amount Box */}
          <div className="bg-white p-3.5 rounded-2xl border-2 border-stone-300 space-y-1.5">
            <label className="block text-xs font-bold text-stone-700">
              المبلغ المطلوب صرفه ({storeSettings.currency}):
            </label>
            <input
              ref={amountInputRef}
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
              }}
              placeholder="0"
              step="250"
              min="0"
              autoFocus
              className="w-full bg-stone-50 border-2 border-stone-200 focus:border-brand-800 rounded-xl px-3 py-2 text-2xl font-mono font-black text-center focus:outline-none"
              required
            />

            {/* Quick Amount Increase Buttons */}
            <div className="flex items-center justify-center gap-1.5 pt-1">
              {[1000, 5000, 10000, 25000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAddAmount(val)}
                  className="px-2.5 py-1 bg-stone-100 hover:bg-warm-100 text-stone-700 hover:text-brand-900 border border-stone-200 text-[11px] font-mono font-bold rounded-lg transition-colors cursor-pointer active:scale-95"
                >
                  +{val.toLocaleString()}
                </button>
              ))}
              {numAmount > 0 && (
                <button
                  type="button"
                  onClick={() => setAmount('')}
                  className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                >
                  مسح
                </button>
              )}
            </div>

            {numAmount > 0 && (
              <div className="text-[11px] text-stone-600 italic text-center pt-0.5">
                {numberToArabicWords(
                  numAmount,
                  storeSettings.currency === 'د.ع' ? 'دينار عراقي' : storeSettings.currency
                )}
              </div>
            )}
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
                {safeCategories.map((c) => (
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
              بيان الصرف / السبب والتفاصيل (يمكن التعديل بحرية):
            </label>
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setSelectedPresetId(null);
              }}
              rows={2}
              placeholder="مثال: شراء ثلج، بنزين مولدة، مستلزمات نظافة وتغليف..."
              className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-800"
              required
            />
          </div>

          {/* Note on drawer deduction */}
          <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 leading-snug">
            💡 سيتم خصم هذا المبلغ فورياً من صافي نقدية الصندوق للوردية الحالية، مع إمكانية التراجع عن السند وإعادة المبلغ قبل إغلاق الوردية.
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

      {/* Manager Preset Expenses Configuration Modal */}
      <ManagePresetExpensesModal
        isOpen={isManagePresetsOpen}
        onClose={() => setIsManagePresetsOpen(false)}
      />

      {/* PIN Verification Modal for Cashier attempting to manage presets */}
      <ManagerPinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={() => setIsManagePresetsOpen(true)}
        title="التحقق من صلاحية المدير"
        promptMessage="يرجى إدخال رمز المدير لإدارة وتعديل الصرفيات المعتادة"
      />
    </div>
  );
}

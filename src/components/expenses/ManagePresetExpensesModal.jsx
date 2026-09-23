import React, { useState } from 'react';
import {
  X,
  Check,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  Sliders,
  Tag,
  Receipt,
  Sparkles,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';

export function ManagePresetExpensesModal({ isOpen, onClose }) {
  const {
    presetExpenses,
    addPresetExpense,
    updatePresetExpense,
    deletePresetExpense,
    resetPresetExpenses,
    expenseCategories,
    storeSettings,
  } = usePOS();

  const safeCategories = expenseCategories && expenseCategories.length > 0
    ? expenseCategories
    : ['مواد أولية', 'نسريات ومصاريف يومية', 'رواتب وأجور', 'صيانة ومعدات', 'فواتير وكهرباء وماء', 'أخرى'];

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(safeCategories[0] || 'نسريات ومصاريف يومية');
  const [defaultAmount, setDefaultAmount] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  if (!isOpen) return null;

  const handleStartEdit = (item) => {
    setEditingId(item.id);
    setTitle(item.title || '');
    setCategory(item.category || 'نسريات ومصاريف يومية');
    setDefaultAmount(item.defaultAmount > 0 ? String(item.defaultAmount) : '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setCategory('نسريات ومصاريف يومية');
    setDefaultAmount('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      alert('يرجى كتابة عنوان أو بيان الصرفية المعتادة');
      return;
    }

    const numAmount = Number(defaultAmount) || 0;

    if (editingId) {
      updatePresetExpense(editingId, {
        title: cleanTitle,
        category,
        defaultAmount: numAmount,
      });
      handleCancelEdit();
    } else {
      addPresetExpense({
        title: cleanTitle,
        category,
        defaultAmount: numAmount,
      });
      setTitle('');
      setDefaultAmount('');
      setCategory('نسريات ومصاريف يومية');
    }
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      deletePresetExpense(itemToDelete.id);
      if (editingId === itemToDelete.id) {
        handleCancelEdit();
      }
      setItemToDelete(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-fade-in select-none">
      <div className="bg-[#FAF8F5] border border-brand-900/20 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-brand-800 text-white px-5 py-3.5 flex items-center justify-between border-b border-brand-900 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-950 flex items-center justify-center text-gold-400 border border-gold-500/30">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                إدارة الصرفيات المعتادة (قوالب المدير)
              </h3>
              <p className="text-[11px] text-warm-200">
                تخصيص بنود المصاريف المتكررة للاختيار السريع بنقرة واحدة من قِبل الكاشير
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-warm-200 hover:text-white p-1.5 rounded-lg hover:bg-brand-900/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Add / Edit Form Card */}
          <div className="bg-white p-4 rounded-2xl border-2 border-warm-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-warm-100 pb-2">
              <div className="flex items-center gap-2 text-xs font-black text-brand-900">
                {editingId ? (
                  <>
                    <Edit2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>تعديل الصرفية المعتادة المحددة</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5 text-emerald-600" />
                    <span>إضافة بند صرفية معتادة جديد</span>
                  </>
                )}
              </div>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-[11px] text-stone-500 hover:text-stone-800 font-bold underline cursor-pointer"
                >
                  إلغاء التعديل
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                {/* Title */}
                <div className="sm:col-span-5">
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    عنوان / بيان الصرفية: <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="مثال: شراء ثلج، بنزين مولدة..."
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-800 focus:bg-white"
                    required
                  />
                </div>

                {/* Category */}
                <div className="sm:col-span-4">
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    التصنيف:
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-800 focus:bg-white cursor-pointer"
                  >
                    {safeCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Default Amount */}
                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    المبلغ الافتراضي ({storeSettings.currency}):
                  </label>
                  <input
                    type="number"
                    value={defaultAmount}
                    onChange={(e) => setDefaultAmount(e.target.value)}
                    placeholder="0 (مرن)"
                    step="250"
                    min="0"
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-brand-800 focus:bg-white text-center"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1">
                <p className="text-[11px] text-stone-500 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span>اترك المبلغ 0 أو فارغاً إذا كان المبلغ متغيراً في كل مرة ويحدده الكاشير.</span>
                </p>

                <div className="flex items-center gap-2">
                  {editingId && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      إلغاء
                    </button>
                  )}
                  <button
                    type="submit"
                    className={`px-4 py-2 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer ${
                      editingId
                        ? 'bg-amber-600 hover:bg-amber-700'
                        : 'bg-brand-800 hover:bg-brand-900'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 text-gold-400" />
                    <span>{editingId ? 'حفظ التعديلات' : '+ إضافة القالب'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Preset Expenses List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="text-xs font-black text-brand-900 flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-brand-800" />
                <span>قائمة الصرفيات المعتادة الحالية ({presetExpenses?.length || 0})</span>
              </div>
              <span className="text-[11px] text-stone-500">
                مرتبة حسب الأولوية في الظهور للكاشير
              </span>
            </div>

            {(!presetExpenses || presetExpenses.length === 0) ? (
              <div className="text-center py-8 bg-white rounded-2xl border border-warm-200 text-stone-400 text-xs">
                لا توجد صرفيات معتادة مسجلة حالياً. يمكنك إضافة بنود جديدة أعلاه أو استعادة الإعدادات الافتراضية.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {presetExpenses.map((item, idx) => {
                  const hasAmount = item.defaultAmount && Number(item.defaultAmount) > 0;
                  const isBeingEdited = editingId === item.id;

                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-2.5 ${
                        isBeingEdited
                          ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-300'
                          : 'bg-white hover:bg-stone-50/80 border-warm-200 shadow-2xs'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-5 h-5 rounded-md bg-stone-100 text-stone-600 text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-xs text-stone-900 truncate" title={item.title}>
                            {item.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                          <span className="px-2 py-0.5 rounded-md bg-warm-100 text-stone-700 font-semibold">
                            {item.category}
                          </span>

                          {hasAmount ? (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono font-black">
                              {Number(item.defaultAmount).toLocaleString()} {storeSettings.currency}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 font-semibold italic">
                              مبلغ مرن
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Item Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(item)}
                          title="تعديل هذا البند"
                          className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-amber-100 hover:text-amber-800 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setItemToDelete(item)}
                          title="حذف هذا البند"
                          className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-rose-100 hover:text-rose-800 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Delete Confirmation Banner */}
          {itemToDelete && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl flex items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-900">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>
                  هل أنت متأكد من حذف الصرفية المعتادة <strong>"{itemToDelete.title}"</strong>؟
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  نعم، احذف
                </button>
                <button
                  type="button"
                  onClick={() => setItemToDelete(null)}
                  className="px-3 py-1 bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}

          {/* Reset to Defaults Option */}
          <div className="pt-2 border-t border-warm-200">
            {showResetConfirm ? (
              <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl space-y-2">
                <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>
                    هل تريد استعادة قائمة الصرفيات المعتادة الافتراضية التجريبية؟
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      resetPresetExpenses();
                      setShowResetConfirm(false);
                    }}
                    className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-1.5 px-3 rounded-lg transition-colors cursor-pointer"
                  >
                    نعم، استعد الافتراضيات
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(false)}
                    className="px-3 bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-bold py-1.5 rounded-lg cursor-pointer"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="text-xs text-stone-600 hover:text-stone-900 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
                <span>استعادة قائمة الصرفيات المعتادة الافتراضية (Default Presets)</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 bg-white border-t border-warm-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-brand-800 hover:bg-brand-900 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-xs"
          >
            إغلاق النافذة
          </button>
        </div>
      </div>
    </div>
  );
}

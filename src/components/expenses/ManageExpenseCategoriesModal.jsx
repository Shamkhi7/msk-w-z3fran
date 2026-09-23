import React, { useState } from 'react';
import {
  X,
  Check,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  FolderPlus,
  Folder,
  AlertCircle,
  HelpCircle,
  FileText,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';

export function ManageExpenseCategoriesModal({ isOpen, onClose }) {
  const {
    expenseCategories,
    addExpenseCategory,
    updateExpenseCategory,
    deleteExpenseCategory,
    resetExpenseCategories,
    expenses,
    presetExpenses,
  } = usePOS();

  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState(null); // original name
  const [editedName, setEditedName] = useState('');
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isOpen) return null;

  const handleAddCategory = (e) => {
    e.preventDefault();
    const success = addExpenseCategory(newCategoryName);
    if (success) {
      setNewCategoryName('');
    }
  };

  const handleStartEdit = (category) => {
    setEditingCategory(category);
    setEditedName(category);
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditedName('');
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingCategory) return;
    const success = updateExpenseCategory(editingCategory, editedName);
    if (success) {
      handleCancelEdit();
    }
  };

  const handleConfirmDelete = () => {
    if (categoryToDelete) {
      deleteExpenseCategory(categoryToDelete);
      if (editingCategory === categoryToDelete) {
        handleCancelEdit();
      }
      setCategoryToDelete(null);
    }
  };

  // Helper to count how many expenses use a given category
  const getCategoryExpenseCount = (catName) => {
    return (expenses || []).filter((e) => e.category === catName).length;
  };

  // Helper to count how many presets use a given category
  const getCategoryPresetCount = (catName) => {
    return (presetExpenses || []).filter((p) => p.category === catName).length;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-fade-in select-none">
      <div className="bg-[#FAF8F5] border border-brand-900/20 rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-brand-800 text-white px-5 py-3.5 flex items-center justify-between border-b border-brand-900 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-950 flex items-center justify-center text-gold-400 border border-gold-500/30">
              <Folder className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                إدارة تصنيفات الصرفيات (صلاحية المدير العام)
              </h3>
              <p className="text-[11px] text-warm-200">
                إضافة وتعديل وحذف تصنيفات سندات الصرف في النظام والمحفظة
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
          {/* Add Category Form Card */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border-2 border-warm-200 shadow-xs space-y-2">
            <label className="block text-xs font-black text-brand-900">
              إضافة تصنيف صرفيات جديد:
            </label>
            <form onSubmit={handleAddCategory} className="flex gap-2">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="مثال: دعاية وإعلان، مستلزمات ضيافة، وقود سيارات..."
                className="flex-1 bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-800 focus:bg-white"
                required
              />
              <button
                type="submit"
                className="bg-brand-800 hover:bg-brand-900 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4 text-gold-400" />
                <span>+ إضافة التصنيف</span>
              </button>
            </form>
          </div>

          {/* Categories List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="text-xs font-black text-brand-900 flex items-center gap-1.5">
                <FolderPlus className="w-3.5 h-3.5 text-brand-800" />
                <span>التصنيفات المعتمدة حالياً ({expenseCategories?.length || 0})</span>
              </div>
              <span className="text-[11px] text-stone-500">
                تظهر تلقائياً في قائمة الاختيار للكاشير
              </span>
            </div>

            {(!expenseCategories || expenseCategories.length === 0) ? (
              <div className="text-center py-8 bg-white rounded-2xl border border-warm-200 text-stone-400 text-xs">
                لا توجد تصنيفات مسجلة. أضف تصنيفاً جديداً أعلاه.
              </div>
            ) : (
              <div className="space-y-2">
                {expenseCategories.map((category, idx) => {
                  const expenseCount = getCategoryExpenseCount(category);
                  const presetCount = getCategoryPresetCount(category);
                  const isEditingThis = editingCategory === category;

                  return (
                    <div
                      key={category}
                      className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                        isEditingThis
                          ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-300'
                          : 'bg-white hover:bg-stone-50/80 border-warm-200 shadow-2xs'
                      }`}
                    >
                      {isEditingThis ? (
                        <form
                          onSubmit={handleSaveEdit}
                          className="flex items-center gap-2 flex-1 w-full"
                        >
                          <input
                            type="text"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            autoFocus
                            className="flex-1 bg-white border-2 border-brand-800 rounded-lg px-2.5 py-1.5 text-xs font-bold focus:outline-none"
                            required
                          />
                          <button
                            type="submit"
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>حفظ</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                          >
                            إلغاء
                          </button>
                        </form>
                      ) : (
                        <>
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-6 h-6 rounded-lg bg-stone-100 text-stone-600 text-[11px] font-mono font-bold flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <div>
                              <span className="font-bold text-xs text-stone-900 block">
                                {category}
                              </span>
                              <div className="flex items-center gap-2 text-[10.5px] text-stone-500 mt-0.5">
                                <span>{expenseCount} سند صرف مسجل</span>
                                {presetCount > 0 && (
                                  <>
                                    <span>•</span>
                                    <span>{presetCount} قالب معتاد</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 self-end sm:self-auto shrink-0">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(category)}
                              title="تعديل اسم التصنيف"
                              className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-amber-100 hover:text-amber-800 text-stone-600 flex items-center gap-1 text-xs font-bold transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>تعديل</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setCategoryToDelete(category)}
                              title="حذف هذا التصنيف"
                              className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-rose-100 hover:text-rose-800 text-stone-600 flex items-center gap-1 text-xs font-bold transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>حذف</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Delete Safety Confirmation Banner */}
          {categoryToDelete && (
            <div className="p-3.5 bg-rose-50 border-2 border-rose-300 rounded-xl space-y-2 animate-fade-in">
              <div className="flex items-start gap-2 text-xs font-bold text-rose-900">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span>
                    هل أنت متأكد من حذف التصنيف <strong>"{categoryToDelete}"</strong>؟
                  </span>
                  {getCategoryExpenseCount(categoryToDelete) > 0 && (
                    <p className="text-[11px] text-rose-700 font-semibold mt-1">
                      ⚠️ تنبيه: يوجد {getCategoryExpenseCount(categoryToDelete)} سند صرف مسجل بهذا التصنيف في الأرشيف. السندات السابقة ستحتفظ ببياناتها دون حذف.
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  نعم، احذف التصنيف
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryToDelete(null)}
                  className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
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
                    هل تريد استعادة قائمة تصنيفات الصرفيات الافتراضية التجريبية؟
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      resetExpenseCategories();
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
                <span>استعادة قائمة تصنيفات الصرفيات الافتراضية (Default Categories)</span>
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

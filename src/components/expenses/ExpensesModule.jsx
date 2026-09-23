import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Calendar,
  Filter,
  Printer,
  Edit,
  Trash2,
  FileSpreadsheet,
  Lock,
  RotateCcw,
  Sliders,
  FolderPlus,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { ExpenseFormModal } from './ExpenseFormModal';
import { UndoExpenseModal } from './UndoExpenseModal';
import { ManagerPinModal } from '../treasury/ManagerPinModal';
import { ManagePresetExpensesModal } from './ManagePresetExpensesModal';
import { ManageExpenseCategoriesModal } from './ManageExpenseCategoriesModal';

export function ExpensesModule() {
  const {
    expenses,
    deleteExpense,
    undoExpense,
    triggerPrint,
    printCombinedExpenses,
    storeSettings,
    currentSession,
    isManager,
    expenseCategories,
  } = usePOS();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [expenseToUndo, setExpenseToUndo] = useState(null);
  const [isManagePresetsOpen, setIsManagePresetsOpen] = useState(false);
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinPromptTarget, setPinPromptTarget] = useState('presets'); // 'presets' | 'categories'

  const handleOpenManagePresets = () => {
    if (isManager) {
      setIsManagePresetsOpen(true);
    } else {
      setPinPromptTarget('presets');
      setIsPinModalOpen(true);
    }
  };

  const handleOpenManageCategories = () => {
    if (isManager) {
      setIsManageCategoriesOpen(true);
    } else {
      setPinPromptTarget('categories');
      setIsPinModalOpen(true);
    }
  };

  const handlePinSuccess = () => {
    if (pinPromptTarget === 'categories') {
      setIsManageCategoriesOpen(true);
    } else {
      setIsManagePresetsOpen(true);
    }
  };

  // View Scope & Filters
  const [viewScope, setViewScope] = useState('today'); // 'today' | 'all'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [shiftFilter, setShiftFilter] = useState('ALL'); // 'ALL' | 'صباحي' | 'مسائي'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const safeCategories =
    expenseCategories && expenseCategories.length > 0
      ? expenseCategories
      : [
          'مواد أولية',
          'نسريات ومصاريف يومية',
          'رواتب وأجور',
          'صيانة ومعدات',
          'فواتير وكهرباء وماء',
          'أخرى',
        ];

  // Filtering Logic
  const filteredExpenses = expenses.filter((item) => {
    const itemDate = new Date(item.date).toISOString().split('T')[0];
    const isCurrentSessionOrToday =
      item.sessionId === currentSession.sessionId || itemDate === todayStr;

    if (viewScope === 'today' && !isCurrentSessionOrToday) {
      return false;
    }

    const query = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !query ||
      (item.description && item.description.toLowerCase().includes(query)) ||
      (item.voucherNo && item.voucherNo.toLowerCase().includes(query)) ||
      (item.category && item.category.toLowerCase().includes(query));

    const matchesCategory =
      selectedCategory === 'ALL' || item.category === selectedCategory;

    const matchesShift =
      shiftFilter === 'ALL' || (item.shiftType || 'صباحي') === shiftFilter;

    const matchesStart = !startDate || itemDate >= startDate;
    const matchesEnd = !endDate || itemDate <= endDate;

    return matchesQuery && matchesCategory && matchesShift && matchesStart && matchesEnd;
  });

  const totalFilteredAmount = filteredExpenses.reduce(
    (sum, e) => sum + Number(e.amount),
    0
  );

  // Session expenses count
  const todaySessionExpensesCount = expenses.filter(
    (e) => e.sessionId === currentSession.sessionId || new Date(e.date).toISOString().split('T')[0] === todayStr
  ).length;

  const handleEdit = (exp) => {
    if (!isManager) {
      alert('عذراً، تعديل وتصحيح سندات الصرف محصور بصلاحية حساب المدير العام فقط.');
      return;
    }
    setEditingExpense(exp);
    setIsFormOpen(true);
  };

  const handleConfirmUndo = () => {
    if (!expenseToUndo) return;
    undoExpense(expenseToUndo.id);
    setExpenseToUndo(null);
  };

  const handleDelete = (exp) => {
    if (!isManager) {
      alert('عذراً، حذف سندات الصرف محصور بصلاحية حساب المدير العام فقط.');
      return;
    }
    setExpenseToUndo(exp);
  };

  return (
    <div className="flex flex-col h-full bg-[#FAF8F5] overflow-hidden select-none">
      {/* Top Bar */}
      <div className="p-3 sm:p-4 bg-white border-b border-warm-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-brand-900 leading-tight">
              أرشيف ومسجل الصرفيات العام
            </h2>
            <p className="text-[11px] text-stone-500">
              سجل دائم لا يحذف عند تصفير الصندوق اليومي • إجمالي السندات: {expenses.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Combined Expenses Print Button */}
          <button
            onClick={printCombinedExpenses}
            title="طباعة جميع صرفيات اليوم في وصل حراري واحد مجمع"
            className="bg-stone-800 hover:bg-stone-900 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-98"
          >
            <Printer className="w-4 h-4 text-gold-400" />
            <span>طباعة جميع صرفيات اليوم في وصل واحد ({todaySessionExpensesCount})</span>
          </button>

          {/* Manage Preset Expenses Button */}
          <button
            onClick={handleOpenManagePresets}
            title="إدارة الصرفيات المعتادة وتخصيص البنود والمبالغ (صلاحية المدير)"
            className="bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 font-bold px-3.5 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer active:scale-98"
          >
            <Sliders className="w-4 h-4 text-brand-800" />
            <span>الصرفيات المعتادة</span>
          </button>

          {/* Manage Categories Button */}
          <button
            onClick={handleOpenManageCategories}
            title="إدارة وتعديل تصنيفات الصرفيات (صلاحية المدير)"
            className="bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 font-bold px-3.5 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer active:scale-98"
          >
            <FolderPlus className="w-4 h-4 text-brand-800" />
            <span>تصنيفات الصرف</span>
          </button>

          <button
            onClick={() => {
              setEditingExpense(null);
              setIsFormOpen(true);
            }}
            className="bg-brand-800 hover:bg-brand-900 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4 text-gold-400" />
            <span>+ تسجيل سند صرف جديد</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-warm-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-stone-500 font-semibold">إجمالي الصرفيات المعروضة:</div>
            <div className="text-xl font-mono font-black text-rose-700 mt-0.5">
              {totalFilteredAmount.toLocaleString()} {storeSettings.currency}
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold text-xs">
            {filteredExpenses.length}
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-warm-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-stone-500 font-semibold">صرفيات الوردية النشطة:</div>
            <div className="text-xl font-mono font-black text-stone-800 mt-0.5">
              {todaySessionExpensesCount} سند صرف
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center font-bold">
            <Receipt className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-warm-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-stone-500 font-semibold">حالة الأرشيف:</div>
            <div className="text-xs font-bold text-emerald-700 mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              محفوظ دائمًا دون تأثر بتصفير اليومية
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
            دائم
          </div>
        </div>
      </div>

      {/* Scope Navigation Tabs: Today's Expenses vs All Archive */}
      <div className="px-3 sm:px-4 bg-white border-b border-warm-200/80 flex items-center gap-2">
        <button
          onClick={() => setViewScope('today')}
          className={`py-2.5 px-3 rounded-t-xl text-xs font-bold transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 ${
            viewScope === 'today'
              ? 'border-brand-800 text-brand-900 bg-warm-50 font-extrabold'
              : 'border-transparent text-stone-600 hover:text-brand-800'
          }`}
        >
          <Receipt className="w-3.5 h-3.5 text-brand-800" />
          <span>صرفيات اليوم والوردية ({todaySessionExpensesCount})</span>
        </button>
        <button
          onClick={() => setViewScope('all')}
          className={`py-2.5 px-3 rounded-t-xl text-xs font-bold transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 ${
            viewScope === 'all'
              ? 'border-brand-800 text-brand-900 bg-warm-50 font-extrabold'
              : 'border-transparent text-stone-600 hover:text-brand-800'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-stone-500" />
          <span>أرشيف كافة الصرفيات ({expenses.length})</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="px-3 sm:px-4 py-2.5 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث بالبيان، التصنيف، أو رقم السند..."
            className="w-full pl-3 pr-9 py-2 bg-white border border-warm-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-800"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-white border border-warm-200 rounded-xl px-3 py-2 text-xs font-bold text-stone-700 focus:outline-none focus:ring-2 focus:ring-brand-800 cursor-pointer"
        >
          <option value="ALL">جميع التصنيفات</option>
          {safeCategories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* Shift Filter Toggle */}
        <div className="flex items-center bg-white p-1 rounded-xl border border-warm-200 shadow-xs">
          {[
            { id: 'ALL', label: 'كافة الشفتات' },
            { id: 'صباحي', label: 'الصباحي ☀️' },
            { id: 'مسائي', label: 'المسائي 🌙' },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setShiftFilter(s.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                shiftFilter === s.id
                  ? 'bg-brand-800 text-white shadow-xs font-black'
                  : 'text-stone-600 hover:text-brand-900 hover:bg-warm-50'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 bg-white border border-warm-200 rounded-xl px-2 py-1">
          <span className="text-[10px] font-bold text-stone-500">من:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="text-xs border-0 focus:outline-none font-sans"
          />
          <span className="text-[10px] font-bold text-stone-500">إلى:</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="text-xs border-0 focus:outline-none font-sans"
          />
        </div>

        {(searchQuery || selectedCategory !== 'ALL' || shiftFilter !== 'ALL' || startDate || endDate) && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('ALL');
              setShiftFilter('ALL');
              setStartDate('');
              setEndDate('');
            }}
            className="text-xs text-brand-800 font-bold hover:underline px-2 cursor-pointer"
          >
            مسح الفلاتر
          </button>
        )}
      </div>

      {/* Expenses Table */}
      <div className="flex-1 px-3 sm:px-4 pb-4 overflow-y-auto">
        <div className="bg-white border border-warm-200 rounded-2xl shadow-xs overflow-hidden">
          <table className="w-full text-right text-xs">
            <thead className="bg-warm-100 text-stone-700 font-bold border-b border-warm-200">
              <tr>
                <th className="py-3 px-3">رقم السند</th>
                <th className="py-3 px-3">التاريخ والوقت</th>
                <th className="py-3 px-3">الشفت</th>
                <th className="py-3 px-3">المبلغ</th>
                <th className="py-3 px-3">التصنيف</th>
                <th className="py-3 px-3">بيان الصرف / التفاصيل</th>
                <th className="py-3 px-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-stone-400 font-bold">
                    {viewScope === 'today'
                      ? 'لا توجد صرفيات مسجلة في الوردية النشطة حتى الآن'
                      : 'لا توجد سندات صرف مطابقة للفلاتر'}
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => {
                  const dateObj = new Date(exp.date);

                  return (
                    <tr key={exp.id} className="hover:bg-warm-50/60 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-brand-900 whitespace-nowrap">
                        {exp.voucherNo}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap text-stone-600 font-mono">
                        {dateObj.toLocaleDateString('ar-IQ')}{' '}
                        <span className="text-[10px] text-stone-400">
                          {dateObj.toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black inline-flex items-center gap-1 ${
                          exp.shiftType === 'مسائي'
                            ? 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                            : 'bg-amber-100 text-amber-900 border border-amber-200'
                        }`}>
                          {exp.shiftType === 'مسائي' ? '🌙 مسائي' : '☀️ صباحي'}
                        </span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap font-mono font-black text-rose-700 text-sm">
                        {Number(exp.amount).toLocaleString()} {storeSettings.currency}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700 border border-stone-200">
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-stone-700 max-w-xs truncate font-medium" title={exp.description}>
                        {exp.description}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Both Cashiers & Managers can print vouchers */}
                          <button
                            onClick={() => triggerPrint('expense', exp)}
                            title="طباعة سند صرف حراري (72.1mm)"
                            className="p-1.5 text-stone-600 hover:text-brand-800 hover:bg-brand-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* Action Controls: Manager or Cashier */}
                          {isManager ? (
                            <>
                              <button
                                onClick={() => handleEdit(exp)}
                                title="تعديل وتصحيح السند (صلاحية المدير)"
                                className="p-1.5 text-stone-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Edit className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleDelete(exp)}
                                title="إلغاء وحذف السند وإعادة المبلغ للصندوق (صلاحية المدير)"
                                className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            /* Regular Cashier: Can Undo ONLY within CURRENT ACTIVE SHIFT */
                            exp.sessionId === currentSession.sessionId ? (
                              <button
                                onClick={() => setExpenseToUndo(exp)}
                                title="تراجع عن سند الصرف وإعادة المبلغ تلقائياً للصندوق"
                                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 hover:border-amber-400 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-xs"
                              >
                                <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                                <span>تراجع</span>
                              </button>
                            ) : (
                              <span
                                className="text-[10px] text-stone-400 font-semibold px-2 py-0.5 bg-stone-100 rounded-md flex items-center gap-1 border border-stone-200"
                                title="هذا السند يتبع وردية سابقة مغلقة، لا يمكن التراجع عنه أو حذفه إلا من قبل المدير العام"
                              >
                                <Lock className="w-3 h-3 text-stone-400" />
                                <span>محمي</span>
                              </span>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ExpenseFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingExpense(null);
        }}
        initialData={editingExpense}
      />

      <UndoExpenseModal
        isOpen={!!expenseToUndo}
        onClose={() => setExpenseToUndo(null)}
        expense={expenseToUndo}
        onConfirm={handleConfirmUndo}
        currency={storeSettings.currency || 'د.ع'}
      />

      {/* Manager Preset Expenses Configuration Modal */}
      <ManagePresetExpensesModal
        isOpen={isManagePresetsOpen}
        onClose={() => setIsManagePresetsOpen(false)}
      />

      {/* Manager Expense Categories Modal */}
      <ManageExpenseCategoriesModal
        isOpen={isManageCategoriesOpen}
        onClose={() => setIsManageCategoriesOpen(false)}
      />

      {/* PIN Verification Modal for Cashier */}
      <ManagerPinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={handlePinSuccess}
        title="صلاحية المدير العام"
        promptMessage={
          pinPromptTarget === 'categories'
            ? 'يرجى إدخال رمز المدير للوصول إلى إدارة تصنيفات الصرفيات'
            : 'يرجى إدخال رمز المدير للوصول إلى إدارة وتخصيص الصرفيات المعتادة'
        }
      />
    </div>
  );
}

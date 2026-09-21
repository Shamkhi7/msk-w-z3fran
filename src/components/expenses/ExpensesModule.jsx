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
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { ExpenseFormModal } from './ExpenseFormModal';

export function ExpensesModule() {
  const {
    expenses,
    deleteExpense,
    triggerPrint,
    printCombinedExpenses,
    storeSettings,
    currentSession,
  } = usePOS();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const categories = [
    'مواد أولية',
    'نسريات ومصاريف يومية',
    'رواتب وأجور',
    'صيانة ومعدات',
    'فواتير وكهرباء وماء',
    'أخرى',
  ];

  // Filtering Logic
  const filteredExpenses = expenses.filter((item) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !query ||
      (item.recipient && item.recipient.toLowerCase().includes(query)) ||
      (item.description && item.description.toLowerCase().includes(query)) ||
      (item.voucherNo && item.voucherNo.toLowerCase().includes(query));

    const matchesCategory =
      selectedCategory === 'ALL' || item.category === selectedCategory;

    const itemDate = new Date(item.date).toISOString().split('T')[0];
    const matchesStart = !startDate || itemDate >= startDate;
    const matchesEnd = !endDate || itemDate <= endDate;

    return matchesQuery && matchesCategory && matchesStart && matchesEnd;
  });

  const totalFilteredAmount = filteredExpenses.reduce(
    (sum, e) => sum + Number(e.amount),
    0
  );

  // Session expenses count
  const todaySessionExpensesCount = expenses.filter(
    (e) => e.sessionId === currentSession.sessionId
  ).length;

  const handleEdit = (exp) => {
    setEditingExpense(exp);
    setIsFormOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا السند من الأرشيف؟')) {
      deleteExpense(id);
    }
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

      {/* Filters Bar */}
      <div className="px-3 sm:px-4 pb-3 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث بالسيد المستلم، البيان، أو رقم السند..."
            className="w-full pl-3 pr-9 py-2 bg-white border border-warm-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-800"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-white border border-warm-200 rounded-xl px-3 py-2 text-xs font-bold text-stone-700 focus:outline-none focus:ring-2 focus:ring-brand-800 cursor-pointer"
        >
          <option value="ALL">جميع التصنيفات</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

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

        {(searchQuery || selectedCategory !== 'ALL' || startDate || endDate) && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('ALL');
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
                <th className="py-3 px-3">المبلغ</th>
                <th className="py-3 px-3">يصرف إلى السيد</th>
                <th className="py-3 px-3">التصنيف</th>
                <th className="py-3 px-3">بيان الصرف / السبب</th>
                <th className="py-3 px-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-stone-400 font-bold">
                    لا توجد سندات صرف مطابقة للفلاتر
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
                      <td className="py-3 px-3 whitespace-nowrap font-mono font-black text-rose-700 text-sm">
                        {Number(exp.amount).toLocaleString()} {storeSettings.currency}
                      </td>
                      <td className="py-3 px-3 font-bold text-stone-800 whitespace-nowrap">
                        {exp.recipient || '-'}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700 border border-stone-200">
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-stone-600 max-w-xs truncate" title={exp.description}>
                        {exp.description}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => triggerPrint('expense', exp)}
                            title="طباعة سند صرف حراري (72.1mm)"
                            className="p-1.5 text-stone-600 hover:text-brand-800 hover:bg-brand-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleEdit(exp)}
                            title="تعديل السند"
                            className="p-1.5 text-stone-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(exp.id)}
                            title="حذف السند"
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
    </div>
  );
}

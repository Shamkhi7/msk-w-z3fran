import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Calendar,
  Filter,
  Search,
  Printer,
  ShieldCheck,
  CheckCircle,
  Clock,
  User,
  ArrowUpDown,
  Lock,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { numberToArabicWords } from '../../utils/arabicNumberToWords';

export function ElectronicPaymentsReport() {
  const {
    salesHistory,
    storeSettings,
    triggerPrint,
    isManager,
  } = usePOS();

  // Filters
  const [periodPreset, setPeriodPreset] = useState('today'); // 'today' | 'week' | 'month' | 'all' | 'custom'
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [shiftFilter, setShiftFilter] = useState('ALL'); // 'ALL' | 'صباحي' | 'مسائي'
  const [cashierFilter, setCashierFilter] = useState('ALL'); // 'ALL' | cashierName
  const [searchQuery, setSearchQuery] = useState('');

  const isElectronicMethod = (m) => {
    if (!m) return false;
    const s = String(m).toLowerCase();
    return (
      s.includes('بطاقة') ||
      s.includes('إلكتروني') ||
      s.includes('card') ||
      s.includes('qi') ||
      s.includes('master') ||
      s.includes('شبكة')
    );
  };

  // Base list of all electronic transactions
  const allElectronicSales = useMemo(() => {
    return (salesHistory || []).filter((s) => isElectronicMethod(s.paymentMethod));
  }, [salesHistory]);

  // Unique Cashiers who performed electronic transactions
  const uniqueCashiers = useMemo(() => {
    const set = new Set();
    allElectronicSales.forEach((s) => {
      if (s.cashierName) set.add(s.cashierName.trim());
    });
    return Array.from(set);
  }, [allElectronicSales]);

  // Period Label
  const periodLabel = useMemo(() => {
    const todayStr = new Date().toLocaleDateString('ar-IQ');
    switch (periodPreset) {
      case 'today':
        return `اليوم (${todayStr})`;
      case 'week':
        return 'آخر 7 أيام';
      case 'month':
        return 'هذا الشهر الحالي';
      case 'all':
        return 'كافة الفترات السابقة';
      case 'custom':
        if (customStartDate && customEndDate) {
          return `من ${customStartDate} إلى ${customEndDate}`;
        }
        return 'فترة مخصصة';
      default:
        return 'الفترة المحددة';
    }
  }, [periodPreset, customStartDate, customEndDate]);

  // Filtered Electronic Transactions
  const filteredSales = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return allElectronicSales.filter((sale) => {
      const saleDate = new Date(sale.date);
      const saleDateZero = new Date(sale.date);
      saleDateZero.setHours(0, 0, 0, 0);

      // Date preset
      if (periodPreset === 'today') {
        if (saleDateZero.getTime() !== today.getTime()) return false;
      } else if (periodPreset === 'week') {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        if (saleDateZero < weekAgo) return false;
      } else if (periodPreset === 'month') {
        if (
          saleDate.getMonth() !== today.getMonth() ||
          saleDate.getFullYear() !== today.getFullYear()
        ) {
          return false;
        }
      } else if (periodPreset === 'custom') {
        const saleISO = sale.date.split('T')[0];
        if (customStartDate && saleISO < customStartDate) return false;
        if (customEndDate && saleISO > customEndDate) return false;
      }

      // Shift Filter
      if (shiftFilter !== 'ALL' && sale.shiftType !== shiftFilter) {
        return false;
      }

      // Cashier Filter
      if (cashierFilter !== 'ALL' && sale.cashierName !== cashierFilter) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesReceipt = sale.receiptNo && sale.receiptNo.toLowerCase().includes(q);
        const matchesCustomer = sale.customerName && sale.customerName.toLowerCase().includes(q);
        const matchesItems =
          Array.isArray(sale.items) &&
          sale.items.some(
            (it) =>
              it.product?.name?.toLowerCase().includes(q) ||
              it.name?.toLowerCase().includes(q)
          );
        if (!matchesReceipt && !matchesCustomer && !matchesItems) {
          return false;
        }
      }

      return true;
    });
  }, [
    allElectronicSales,
    periodPreset,
    customStartDate,
    customEndDate,
    shiftFilter,
    cashierFilter,
    searchQuery,
  ]);

  // Aggregated Financial Totals
  const totalAmount = useMemo(() => {
    return filteredSales.reduce((sum, s) => sum + (Number(s.netTotal) || 0), 0);
  }, [filteredSales]);

  const directSalesTotal = useMemo(() => {
    return filteredSales
      .filter((s) => !s.depositAmount || s.depositAmount === 0)
      .reduce((sum, s) => sum + (Number(s.netTotal) || 0), 0);
  }, [filteredSales]);

  const depositsTotal = useMemo(() => {
    return filteredSales
      .filter((s) => Number(s.depositAmount) > 0)
      .reduce((sum, s) => sum + (Number(s.depositAmount) || 0), 0);
  }, [filteredSales]);

  const averageTicket = useMemo(() => {
    return filteredSales.length > 0
      ? Math.round(totalAmount / filteredSales.length)
      : 0;
  }, [totalAmount, filteredSales.length]);

  // Print Thermal Report Handler
  const handlePrint = () => {
    triggerPrint('electronic_sales', {
      transactions: filteredSales,
      periodLabel,
      totalAmount,
      totalCount: filteredSales.length,
      directSalesTotal,
      depositsTotal,
      printedAt: new Date().toISOString(),
      shiftFilter,
      cashierFilter,
    });
  };

  if (!isManager) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-warm-200 space-y-3 m-4">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h3 className="font-black text-stone-900 text-base">تقرير مقيد لصلاحية المدير العام</h3>
        <p className="text-xs text-stone-500 max-w-sm mx-auto">
          بيانات مبيعات الدفع الإلكتروني والبطاقات معزولة بالكامل ومحجوبة عن الكاشيرات. يرجى التحويل إلى حساب المدير لعرض التقرير.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 max-w-7xl mx-auto animate-fade-in select-none w-full">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Total Electronic Revenue */}
        <div className="bg-white p-4 rounded-2xl border-2 border-blue-400/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-stone-500">
            <span>إجمالي مقبوضات الدفع الإلكتروني:</span>
            <CreditCard className="w-4 h-4 text-blue-700" />
          </div>
          <div className="text-2xl font-mono font-black text-blue-950">
            {totalAmount.toLocaleString()} {storeSettings?.currency || 'د.ع'}
          </div>
          <div className="text-[10px] text-blue-900 font-bold truncate">
            {numberToArabicWords(
              totalAmount,
              (storeSettings?.currency === 'د.ع' ? 'دينار عراقي' : storeSettings?.currency) || 'دينار عراقي'
            )}
          </div>
        </div>

        {/* Card 2: Operations Count & Average Ticket */}
        <div className="bg-white p-4 rounded-2xl border border-warm-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-stone-500">
            <span>عدد العمليات المنفذة:</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-mono font-black text-stone-900">
            {filteredSales.length}{' '}
            <span className="text-xs font-normal text-stone-500">عملية</span>
          </div>
          <div className="text-[10.5px] text-stone-500 font-semibold">
            متوسط قيمة الفاتورة: {averageTicket.toLocaleString()} {storeSettings?.currency || 'د.ع'}
          </div>
        </div>

        {/* Card 3: Direct Sales vs Deposits */}
        <div className="bg-white p-4 rounded-2xl border border-warm-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-stone-500">
            <span>تفصيل نوع المقبوضات:</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xs font-bold text-stone-800 space-y-0.5 pt-1">
            <div className="flex justify-between">
              <span>مبيعات مباشرة:</span>
              <span className="font-mono font-black text-brand-900">
                {directSalesTotal.toLocaleString()} {storeSettings?.currency || 'د.ع'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>عربين حجوزات:</span>
              <span className="font-mono font-black text-amber-800">
                {depositsTotal.toLocaleString()} {storeSettings?.currency || 'د.ع'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Treasury Isolation Status */}
        <div className="bg-white p-4 rounded-2xl border border-warm-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-stone-500">
            <span>حالة الصندوق والدرج:</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xs font-black text-emerald-800 pt-1 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
            معزولة 100% عن نقدية الصندوق
          </div>
          <div className="text-[10.5px] text-stone-500 leading-tight">
            لا تضاف هذه المبالغ لصافي نقد الدرج وتظل في حساب التسوية الإلكترونية.
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-warm-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Period Presets */}
          <div className="flex flex-wrap items-center gap-1 bg-warm-100 p-1 rounded-xl border border-warm-200">
            {[
              { id: 'today', label: 'اليوم' },
              { id: 'week', label: 'هذا الأسبوع' },
              { id: 'month', label: 'هذا الشهر' },
              { id: 'all', label: 'كافة الفترات' },
              { id: 'custom', label: 'فترة مخصصة' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriodPreset(p.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  periodPreset === p.id
                    ? 'bg-brand-800 text-white shadow-xs'
                    : 'text-stone-700 hover:bg-white/60'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Action: Print Thermal Report */}
          <button
            type="button"
            onClick={handlePrint}
            title="طباعة تقرير مبيعات الدفع الإلكتروني والبطاقات على الطابعة الحرارية (72.1mm)"
            className="bg-brand-800 hover:bg-brand-900 text-white font-black px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-sm hover:shadow transition-all cursor-pointer active:scale-98"
          >
            <Printer className="w-4 h-4 text-gold-400" />
            <span>طباعة تقرير البطاقات (وصل حراري)</span>
          </button>
        </div>

        {/* Secondary Filter Row: Shifts, Cashier, Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-1 border-t border-warm-100">
          {/* Shift Filter */}
          <div>
            <label className="block text-[11px] font-bold text-stone-600 mb-1">
              تصفية الوردية / الشفت:
            </label>
            <select
              value={shiftFilter}
              onChange={(e) => setShiftFilter(e.target.value)}
              className="w-full bg-warm-50 border border-stone-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-brand-800 cursor-pointer"
            >
              <option value="ALL">كافة الورديات (الصباحي والمسائي)</option>
              <option value="صباحي">الوردية الصباحية فقط</option>
              <option value="مسائي">الوردية المسائية فقط</option>
            </select>
          </div>

          {/* Cashier Filter */}
          <div>
            <label className="block text-[11px] font-bold text-stone-600 mb-1">
              تصفية الكاشير / الموظف:
            </label>
            <select
              value={cashierFilter}
              onChange={(e) => setCashierFilter(e.target.value)}
              className="w-full bg-warm-50 border border-stone-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-brand-800 cursor-pointer"
            >
              <option value="ALL">كافة الكاشيرات والموظفين</option>
              {uniqueCashiers.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Search Query */}
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-stone-600 mb-1">
              بحث برقم الوصل، اسم الزبون، أو الصنف:
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالرقم أو بالاسم..."
                className="w-full bg-warm-50 border border-stone-300 rounded-xl pr-8 pl-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-800"
              />
              <Search className="w-3.5 h-3.5 text-stone-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Custom Date Inputs (if custom period selected) */}
        {periodPreset === 'custom' && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-warm-100 text-xs">
            <span className="font-bold text-stone-600">من تاريخ:</span>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="bg-warm-50 border border-stone-300 rounded-xl px-3 py-1 text-xs font-bold text-stone-800"
            />
            <span className="font-bold text-stone-600">إلى تاريخ:</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="bg-warm-50 border border-stone-300 rounded-xl px-3 py-1 text-xs font-bold text-stone-800"
            />
          </div>
        )}
      </div>

      {/* Itemized Transactions Table */}
      <div className="bg-white rounded-2xl border border-warm-200 shadow-xs">
        <div className="p-3 bg-warm-50 border-b border-warm-200 flex items-center justify-between rounded-t-2xl">
          <div className="font-black text-stone-800 text-sm flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-blue-700" />
            <span>سجل العمليات والفواتير المدفوعة بالبطاقة ({filteredSales.length})</span>
          </div>
          <span className="text-xs text-stone-500 font-bold">
            الفترة: {periodLabel}
          </span>
        </div>

        <div>
          <table className="w-full text-right text-xs">
            <thead className="bg-warm-100 font-bold text-stone-700 border-b border-warm-200 sticky top-0 z-10 shadow-xs">
              <tr>
                <th className="py-2.5 px-3 sticky top-0 bg-warm-100 z-10 first:rounded-tr-2xl">رقم الفاتورة</th>
                <th className="py-2.5 px-3 sticky top-0 bg-warm-100 z-10">التاريخ والوقت</th>
                <th className="py-2.5 px-3 sticky top-0 bg-warm-100 z-10">الوردية</th>
                <th className="py-2.5 px-3 sticky top-0 bg-warm-100 z-10">الكاشير</th>
                <th className="py-2.5 px-3 sticky top-0 bg-warm-100 z-10">الزبون</th>
                <th className="py-2.5 px-3 sticky top-0 bg-warm-100 z-10">الأصناف والبنود المباعة</th>
                <th className="py-2.5 px-3 sticky top-0 bg-warm-100 z-10">المبلغ الإلكتروني</th>
                <th className="py-2.5 px-3 text-center sticky top-0 bg-warm-100 z-10 last:rounded-tl-2xl">طباعة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-100">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-10 text-center text-stone-400 font-bold">
                    لا توجد فواتير أو حركات دفع إلكتروني مسجلة تطابق الفلاتر المحددة.
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-warm-50/70 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-brand-900">
                      {sale.receiptNo}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-stone-600 whitespace-nowrap">
                      {new Date(sale.date).toLocaleDateString('ar-IQ')} -{' '}
                      {new Date(sale.date).toLocaleTimeString('ar-IQ', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-black inline-block ${
                          sale.shiftType === 'مسائي'
                            ? 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                            : 'bg-amber-100 text-amber-900 border border-amber-200'
                        }`}
                      >
                        {sale.shiftType === 'مسائي' ? 'مسائي' : 'صباحي'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-stone-700">
                      {sale.cashierName || 'كاشير'}
                    </td>
                    <td className="py-2.5 px-3 text-stone-800">
                      {sale.customerName || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-stone-600 text-[11px] max-w-xs">
                      {Array.isArray(sale.items) && sale.items.length > 0 ? (
                        sale.items
                          .map((i) => `${i.product?.name || i.name} (×${i.quantity})`)
                          .join('، ')
                      ) : (
                        sale.notes || 'دفع إلكتروني'
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-black text-blue-900 text-sm whitespace-nowrap">
                      {Number(sale.netTotal || sale.amount || 0).toLocaleString()}{' '}
                      <span className="text-[10px] font-normal text-stone-500">
                        {storeSettings?.currency || 'د.ع'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => triggerPrint('sale', sale)}
                        title="إعادة طباعة وصل البيع"
                        className="p-1.5 hover:bg-brand-50 text-stone-600 hover:text-brand-800 rounded-lg transition-colors cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {filteredSales.length > 0 && (
              <tfoot className="bg-warm-100/80 font-black border-t-2 border-warm-300">
                <tr>
                  <td colSpan="6" className="py-3 px-3 text-stone-800">
                    مجموع المقبوضات الإلكترونية للفترة المحددة ({filteredSales.length} عملية):
                  </td>
                  <td className="py-3 px-3 font-mono text-blue-950 text-base">
                    {totalAmount.toLocaleString()} {storeSettings?.currency || 'د.ع'}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}

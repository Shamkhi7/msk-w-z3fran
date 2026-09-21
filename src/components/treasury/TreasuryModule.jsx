import React, { useState, useMemo } from 'react';
import {
  Wallet,
  Receipt,
  RotateCcw,
  Printer,
  History,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle,
  Lock,
  Calendar,
  ChevronDown,
  ChevronUp,
  FileText,
  Filter,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { ManagerPinModal } from './ManagerPinModal';
import { ZReportConfirmationModal } from './ZReportConfirmationModal';

export function TreasuryModule() {
  const {
    dailyTreasury,
    currentSession,
    zReportsHistory,
    shiftHistory,
    reprintShiftZReport,
    triggerPrint,
    storeSettings,
  } = usePOS();

  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isZModalOpen, setIsZModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('summary'); // summary, today_sales, today_expenses, today_returns, past_zreports
  const [successNotice, setSuccessNotice] = useState('');

  // Shift Archive Filters
  const [archiveFilter, setArchiveFilter] = useState('all'); // 'all' | 'today' | 'week' | 'month' | 'custom'
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [expandedShiftId, setExpandedShiftId] = useState(null);

  const {
    directSales,
    salesReturnsTotal,
    netDirectSales,
    collectedDeposits,
    dailyExpenses,
    netCash,
    sessionSales,
    sessionExpenses,
    sessionReturns,
    salesCount,
    expensesCount,
    returnsCount,
  } = dailyTreasury;

  // Unify shift records from shiftHistory or zReportsHistory
  const combinedShifts = useMemo(() => {
    if (shiftHistory && shiftHistory.length > 0) {
      return shiftHistory;
    }
    return (zReportsHistory || []).map((rep) => ({
      id: rep.id,
      shiftNo: rep.reportNo,
      sessionId: rep.sessionId,
      openedAt: rep.openedAt,
      closedAt: rep.closedAt,
      closedBy: rep.closedBy,
      directSales: rep.directSales,
      salesReturns: rep.salesReturns,
      netDirectSales: (rep.directSales || 0) - (rep.salesReturns || 0),
      collectedDeposits: rep.collectedDeposits,
      dailyExpenses: rep.dailyExpenses,
      netCash: rep.netCash,
      salesCount: rep.salesCount,
      expensesCount: rep.expensesCount,
      returnsCount: rep.returnsCount,
      notes: rep.notes,
      itemizedItems: [],
    }));
  }, [shiftHistory, zReportsHistory]);

  // Filtered shifts based on date selector
  const filteredShifts = useMemo(() => {
    const now = new Date();
    return combinedShifts.filter((shift) => {
      const dateStr = shift.closedAt || shift.openedAt;
      if (!dateStr) return true;
      const shiftDate = new Date(dateStr);
      if (isNaN(shiftDate.getTime())) return true;

      if (archiveFilter === 'today') {
        const todayStr = now.toISOString().split('T')[0];
        const shiftStr = shiftDate.toISOString().split('T')[0];
        return todayStr === shiftStr;
      }
      if (archiveFilter === 'week') {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return shiftDate >= sevenDaysAgo;
      }
      if (archiveFilter === 'month') {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return shiftDate >= thirtyDaysAgo;
      }
      if (archiveFilter === 'custom') {
        if (customStartDate) {
          const start = new Date(customStartDate + 'T00:00:00');
          if (shiftDate < start) return false;
        }
        if (customEndDate) {
          const end = new Date(customEndDate + 'T23:59:59');
          if (shiftDate > end) return false;
        }
        return true;
      }
      return true;
    });
  }, [combinedShifts, archiveFilter, customStartDate, customEndDate]);

  // Aggregated totals for the selected period
  const aggregatedPeriodTotals = useMemo(() => {
    return filteredShifts.reduce(
      (acc, s) => {
        acc.totalSales += Number(s.directSales) || 0;
        acc.totalReturns += Number(s.salesReturns) || 0;
        acc.totalDeposits += Number(s.collectedDeposits) || 0;
        acc.totalExpenses += Number(s.dailyExpenses) || 0;
        acc.netCash += Number(s.netCash) || 0;
        acc.salesCount += Number(s.salesCount) || 0;
        acc.expensesCount += Number(s.expensesCount) || 0;
        return acc;
      },
      {
        totalSales: 0,
        totalReturns: 0,
        totalDeposits: 0,
        totalExpenses: 0,
        netCash: 0,
        salesCount: 0,
        expensesCount: 0,
      }
    );
  }, [filteredShifts]);

  const handlePinSuccess = () => {
    // Open the Z report confirmation summary
    setIsZModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full bg-[#FAF8F5] overflow-hidden select-none">
      {/* Top Header */}
      <div className="p-3 sm:p-4 bg-white border-b border-warm-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-brand-800 text-gold-400 flex items-center justify-center font-bold">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-brand-900 leading-tight">
              خزينة الصندوق والإغلاق اليومي (Z-Report)
            </h2>
            <p className="text-[11px] text-stone-500 font-mono">
              الجلسة الحالية: {currentSession.sessionId} • فُتحت في:{' '}
              {new Date(currentSession.openedAt).toLocaleTimeString('ar-IQ', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>

        {/* Manager PIN Protected "إغلاق اليومية وتصفير الصندوق" Button */}
        <button
          onClick={() => setIsPinModalOpen(true)}
          className="bg-brand-800 hover:bg-brand-900 text-white font-black px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-brand-900/20 hover:shadow-xl transition-all cursor-pointer active:scale-98 border border-gold-500/30"
        >
          <Lock className="w-4 h-4 text-gold-400" />
          <span>إغلاق اليومية وتصفير الصندوق (محمي بالرمز)</span>
        </button>
      </div>

      {/* Dynamic Financial KPI Cards */}
      <div className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* 1. Total Direct Sales Revenue */}
        <div className="bg-white p-3.5 rounded-2xl border border-warm-200 shadow-xs hover:border-brand-700/30 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500">1. المبيعات المباشرة:</span>
            <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-800 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-mono font-black text-brand-900">
              {directSales.toLocaleString()}{' '}
              <span className="text-xs font-sans font-normal text-stone-500">
                {storeSettings.currency}
              </span>
            </div>
            <div className="text-[10px] text-stone-400 mt-0.5">
              من {salesCount} عملية بيع
            </div>
          </div>
        </div>

        {/* 2. Sales Returns / Refunds */}
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 bg-stone-50/50 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-600">2. مردود المبيعات (-):</span>
            <div className="w-7 h-7 rounded-lg bg-stone-200 text-stone-800 flex items-center justify-center">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-mono font-black text-rose-700">
              -{salesReturnsTotal.toLocaleString()}{' '}
              <span className="text-xs font-sans font-normal text-stone-600">
                {storeSettings.currency}
              </span>
            </div>
            <div className="text-[10px] text-stone-500 mt-0.5">
              من {returnsCount} سند مردود مبيعات
            </div>
          </div>
        </div>

        {/* 3. Total Collected Deposits */}
        <div className="bg-white p-3.5 rounded-2xl border border-emerald-200 bg-gradient-to-b from-emerald-50/30 to-white shadow-xs hover:border-emerald-400 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800">3. مقبوضات العربون:</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-mono font-black text-emerald-700">
              +{collectedDeposits.toLocaleString()}{' '}
              <span className="text-xs font-sans font-normal text-emerald-900">
                {storeSettings.currency}
              </span>
            </div>
            <div className="text-[10px] text-emerald-700 mt-0.5">
              مفصلة من عربون وحجوزات الكيك
            </div>
          </div>
        </div>

        {/* 4. Total Daily Expenses */}
        <div className="bg-white p-3.5 rounded-2xl border border-rose-200 bg-gradient-to-b from-rose-50/30 to-white shadow-xs hover:border-rose-400 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800">4. صرفيات اليومية:</span>
            <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-mono font-black text-rose-700">
              -{dailyExpenses.toLocaleString()}{' '}
              <span className="text-xs font-sans font-normal text-rose-900">
                {storeSettings.currency}
              </span>
            </div>
            <div className="text-[10px] text-rose-700 mt-0.5">
              من {expensesCount} سند صرف مسجل
            </div>
          </div>
        </div>

        {/* 5. Net Cash in Drawer */}
        <div className="bg-brand-900 text-white p-3.5 rounded-2xl shadow-md border-2 border-gold-500/50 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gold-300">5. صافي النقد بالصندوق:</span>
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-mono font-black text-white">
              {netCash.toLocaleString()}{' '}
              <span className="text-xs font-sans font-normal text-gold-300">
                {storeSettings.currency}
              </span>
            </div>
            <div className="text-[10px] text-warm-200 mt-0.5 font-mono">
              = (المبيعات - المردود + العربون) - الصرفيات
            </div>
          </div>
        </div>
      </div>

      {/* Internal Navigation Subtabs */}
      <div className="px-3 sm:px-4 bg-white border-b border-warm-200/80 flex items-center gap-2 overflow-x-auto">
        {[
          { id: 'summary', label: 'معادلة الميزانية والخلاصة' },
          { id: 'today_sales', label: `فواتير المبيعات (${salesCount})` },
          { id: 'today_returns', label: `مردودات المبيعات (${returnsCount})` },
          { id: 'today_expenses', label: `سندات الصرف (${expensesCount})` },
          { id: 'past_zreports', label: `أرشيف اليوميات والتقارير (${combinedShifts.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-2.5 px-3 rounded-t-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer border-b-2 ${
              activeTab === tab.id
                ? 'border-brand-800 text-brand-900 bg-warm-50 font-extrabold'
                : 'border-transparent text-stone-600 hover:text-brand-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Subtab Content Area */}
      <div className="flex-1 p-3 sm:p-4 overflow-y-auto">
        {/* TAB 1: Summary & Formula breakdown */}
        {activeTab === 'summary' && (
          <div className="space-y-4 max-w-4xl mx-auto">
            {/* Cash Equation Card */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-warm-300 shadow-xs space-y-4 text-center">
              <h3 className="font-black text-stone-800 text-sm sm:text-base">
                معادلة احتساب النقد الفعلي في درج الكاشير
              </h3>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-xs sm:text-sm font-bold">
                <div className="bg-brand-50 border border-brand-200 p-3 rounded-xl flex-1 w-full text-brand-950">
                  <div className="text-[11px] text-stone-500">المبيعات المباشرة</div>
                  <div className="text-base font-mono font-black mt-0.5">
                    {directSales.toLocaleString()} {storeSettings.currency}
                  </div>
                </div>

                <div className="text-lg font-black text-stone-400">-</div>

                <div className="bg-stone-100 border border-stone-300 p-3 rounded-xl flex-1 w-full text-stone-900">
                  <div className="text-[11px] text-stone-600">مردود المبيعات</div>
                  <div className="text-base font-mono font-black mt-0.5 text-rose-700">
                    {salesReturnsTotal.toLocaleString()} {storeSettings.currency}
                  </div>
                </div>

                <div className="text-lg font-black text-stone-400">+</div>

                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex-1 w-full text-emerald-950">
                  <div className="text-[11px] text-emerald-700">مقبوضات العربون</div>
                  <div className="text-base font-mono font-black mt-0.5">
                    {collectedDeposits.toLocaleString()} {storeSettings.currency}
                  </div>
                </div>

                <div className="text-lg font-black text-stone-400">-</div>

                <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl flex-1 w-full text-rose-950">
                  <div className="text-[11px] text-rose-700">صرفيات اليومية</div>
                  <div className="text-base font-mono font-black mt-0.5">
                    {dailyExpenses.toLocaleString()} {storeSettings.currency}
                  </div>
                </div>

                <div className="text-lg font-black text-stone-400">=</div>

                <div className="bg-brand-800 border border-brand-950 p-3 rounded-xl flex-1 w-full text-white shadow-md">
                  <div className="text-[11px] text-gold-300">صافي النقد الفعلي</div>
                  <div className="text-base font-mono font-black mt-0.5">
                    {netCash.toLocaleString()} {storeSettings.currency}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-warm-100 rounded-xl text-xs text-stone-700 leading-relaxed text-right">
                <strong>حماية أمنية:</strong> تصفير الصندوق وإغلاق اليومية محمي برمز تأكيد المدير (الافتراضي 1234). عند التصفير، يُطبع تقرير Z اليومي وتُعاد العدادات النشطة للصفر دون حذف أي فواتير تاريخية.
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Today's Sales Invoices */}
        {activeTab === 'today_sales' && (
          <div className="bg-white rounded-2xl border border-warm-200 overflow-hidden shadow-xs">
            <table className="w-full text-right text-xs">
              <thead className="bg-warm-100 font-bold text-stone-700 border-b border-warm-200">
                <tr>
                  <th className="py-2.5 px-3">رقم الفاتورة</th>
                  <th className="py-2.5 px-3">الوقت</th>
                  <th className="py-2.5 px-3">الزبون</th>
                  <th className="py-2.5 px-3">طريقة الدفع</th>
                  <th className="py-2.5 px-3">الأصناف</th>
                  <th className="py-2.5 px-3">الصافي</th>
                  <th className="py-2.5 px-3 text-center">طباعة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100">
                {sessionSales.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-stone-400 font-bold">
                      لا توجد مبيعات مسجلة في اليومية النشطة حتى الآن
                    </td>
                  </tr>
                ) : (
                  sessionSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-warm-50/60">
                      <td className="py-2.5 px-3 font-mono font-bold text-brand-900">
                        {sale.receiptNo}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-stone-500">
                        {new Date(sale.date).toLocaleTimeString('ar-IQ', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-stone-800">
                        {sale.customerName}
                      </td>
                      <td className="py-2.5 px-3 text-stone-600">{sale.paymentMethod}</td>
                      <td className="py-2.5 px-3 text-stone-500 text-[11px]">
                        {sale.items.map((i) => `${i.product.name} (×${i.quantity})`).join('، ')}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-black text-brand-900 text-sm">
                        {sale.netTotal.toLocaleString()} {storeSettings.currency}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => triggerPrint('sale', sale)}
                          title="إعادة طباعة الفاتورة"
                          className="p-1.5 hover:bg-brand-50 text-stone-600 hover:text-brand-800 rounded-lg transition-colors cursor-pointer"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: Today's Returns */}
        {activeTab === 'today_returns' && (
          <div className="bg-white rounded-2xl border border-warm-200 overflow-hidden shadow-xs">
            <table className="w-full text-right text-xs">
              <thead className="bg-warm-100 font-bold text-stone-700 border-b border-warm-200">
                <tr>
                  <th className="py-2.5 px-3">رقم سند المردود</th>
                  <th className="py-2.5 px-3">الوقت</th>
                  <th className="py-2.5 px-3">المبلغ المسترجع</th>
                  <th className="py-2.5 px-3">الزبون</th>
                  <th className="py-2.5 px-3">السبب</th>
                  <th className="py-2.5 px-3 text-center">طباعة الوصل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100">
                {sessionReturns.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-stone-400 font-bold">
                      لا توجد مردودات مبيعات مسجلة في الوردية الحالية
                    </td>
                  </tr>
                ) : (
                  sessionReturns.map((ret) => (
                    <tr key={ret.id} className="hover:bg-warm-50/60">
                      <td className="py-2.5 px-3 font-mono font-bold text-rose-800">
                        {ret.returnNo}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-stone-500">
                        {new Date(ret.date).toLocaleTimeString('ar-IQ', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-black text-rose-700 text-sm">
                        -{Number(ret.amount).toLocaleString()} {storeSettings.currency}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-stone-800">
                        {ret.customerName}
                      </td>
                      <td className="py-2.5 px-3 text-stone-600">{ret.reason}</td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => triggerPrint('sales_return', ret)}
                          title="طباعة وصل المردود"
                          className="p-1.5 hover:bg-brand-50 text-stone-600 hover:text-brand-800 rounded-lg transition-colors cursor-pointer"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 4: Today's Expenses */}
        {activeTab === 'today_expenses' && (
          <div className="bg-white rounded-2xl border border-warm-200 overflow-hidden shadow-xs">
            <table className="w-full text-right text-xs">
              <thead className="bg-warm-100 font-bold text-stone-700 border-b border-warm-200">
                <tr>
                  <th className="py-2.5 px-3">رقم السند</th>
                  <th className="py-2.5 px-3">الوقت</th>
                  <th className="py-2.5 px-3">المبلغ</th>
                  <th className="py-2.5 px-3">يصرف إلى السيد</th>
                  <th className="py-2.5 px-3">التصنيف</th>
                  <th className="py-2.5 px-3">البيان</th>
                  <th className="py-2.5 px-3 text-center">طباعة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100">
                {sessionExpenses.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-stone-400 font-bold">
                      لا توجد صرفيات مسجلة في اليومية الحالية
                    </td>
                  </tr>
                ) : (
                  sessionExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-warm-50/60">
                      <td className="py-2.5 px-3 font-mono font-bold text-brand-900">
                        {exp.voucherNo}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-stone-500">
                        {new Date(exp.date).toLocaleTimeString('ar-IQ', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-black text-rose-700 text-sm">
                        {Number(exp.amount).toLocaleString()} {storeSettings.currency}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-stone-800">{exp.recipient}</td>
                      <td className="py-2.5 px-3">{exp.category}</td>
                      <td className="py-2.5 px-3 text-stone-600 max-w-xs truncate">{exp.description}</td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => triggerPrint('expense', exp)}
                          title="إعادة طباعة سند الصرف"
                          className="p-1.5 hover:bg-brand-50 text-stone-600 hover:text-brand-800 rounded-lg transition-colors cursor-pointer"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 5: Comprehensive Shift History & Aggregated Reports */}
        {activeTab === 'past_zreports' && (
          <div className="space-y-4">
            {/* Filter Toolbar */}
            <div className="bg-white p-3 sm:p-4 rounded-2xl border border-warm-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-stone-600 flex items-center gap-1.5 ml-1">
                  <Filter className="w-3.5 h-3.5 text-brand-800" />
                  <span>تصفية الفترة:</span>
                </span>
                {[
                  { id: 'all', label: 'الكل' },
                  { id: 'today', label: 'اليوم' },
                  { id: 'week', label: 'هذا الأسبوع' },
                  { id: 'month', label: 'هذا الشهر' },
                  { id: 'custom', label: 'فترة مخصصة' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setArchiveFilter(f.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      archiveFilter === f.id
                        ? 'bg-brand-800 text-white shadow-xs'
                        : 'bg-warm-50 text-stone-700 hover:bg-warm-100 border border-warm-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Custom Date Inputs if 'custom' is active */}
              {archiveFilter === 'custom' && (
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <span className="text-stone-500 font-bold">من:</span>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="bg-warm-50 border border-stone-300 rounded-lg px-2 py-1 text-xs font-mono font-bold"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-stone-500 font-bold">إلى:</span>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="bg-warm-50 border border-stone-300 rounded-lg px-2 py-1 text-xs font-mono font-bold"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Aggregated Period KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
              <div className="bg-white p-3 rounded-xl border border-warm-200 shadow-xs text-right">
                <span className="text-[11px] font-bold text-stone-500 block">إجمالي مبيعات الفترة:</span>
                <span className="text-base sm:text-lg font-mono font-black text-brand-900">
                  {aggregatedPeriodTotals.totalSales.toLocaleString()} {storeSettings.currency}
                </span>
                <span className="block text-[10px] text-stone-400 mt-0.5 font-mono">
                  {aggregatedPeriodTotals.salesCount} فاتورة
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-warm-200 shadow-xs text-right">
                <span className="text-[11px] font-bold text-stone-500 block">إجمالي المردودات:</span>
                <span className="text-base sm:text-lg font-mono font-black text-rose-700">
                  -{aggregatedPeriodTotals.totalReturns.toLocaleString()} {storeSettings.currency}
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-warm-200 shadow-xs text-right">
                <span className="text-[11px] font-bold text-stone-500 block">إجمالي العربونات:</span>
                <span className="text-base sm:text-lg font-mono font-black text-emerald-700">
                  +{aggregatedPeriodTotals.totalDeposits.toLocaleString()} {storeSettings.currency}
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-warm-200 shadow-xs text-right">
                <span className="text-[11px] font-bold text-stone-500 block">إجمالي الصرفيات:</span>
                <span className="text-base sm:text-lg font-mono font-black text-rose-700">
                  -{aggregatedPeriodTotals.totalExpenses.toLocaleString()} {storeSettings.currency}
                </span>
                <span className="block text-[10px] text-stone-400 mt-0.5 font-mono">
                  {aggregatedPeriodTotals.expensesCount} سند
                </span>
              </div>

              <div className="bg-brand-900 text-white p-3 rounded-xl border border-gold-500/40 shadow-xs text-right col-span-2 sm:col-span-1">
                <span className="text-[11px] font-bold text-gold-300 block">صافي النقد التراكمي:</span>
                <span className="text-base sm:text-lg font-mono font-black text-white">
                  {aggregatedPeriodTotals.netCash.toLocaleString()} {storeSettings.currency}
                </span>
                <span className="block text-[10px] text-warm-200 mt-0.5">
                  ({filteredShifts.length} وردية مغلقة)
                </span>
              </div>
            </div>

            {/* Shifts Archive Table */}
            <div className="bg-white rounded-2xl border border-warm-200 overflow-hidden shadow-xs">
              <table className="w-full text-right text-xs">
                <thead className="bg-warm-100 font-bold text-stone-700 border-b border-warm-200">
                  <tr>
                    <th className="py-2.5 px-3">رقم الوردية / Z</th>
                    <th className="py-2.5 px-3">وقت الإغلاق</th>
                    <th className="py-2.5 px-3">المبيعات</th>
                    <th className="py-2.5 px-3">المردود</th>
                    <th className="py-2.5 px-3">العربون</th>
                    <th className="py-2.5 px-3">الصرفيات</th>
                    <th className="py-2.5 px-3">صافي الصندوق</th>
                    <th className="py-2.5 px-3">المسؤول</th>
                    <th className="py-2.5 px-3 text-center">التفاصيل / طباعة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-warm-100">
                  {filteredShifts.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="py-8 text-center text-stone-400 font-bold">
                        لا توجد إغلاقات ورديات تطابق الفترة المحددة
                      </td>
                    </tr>
                  ) : (
                    filteredShifts.map((rep) => {
                      const isExpanded = expandedShiftId === rep.id;
                      const hasItems = rep.itemizedItems && rep.itemizedItems.length > 0;

                      return (
                        <React.Fragment key={rep.id}>
                          <tr className="hover:bg-warm-50/60">
                            <td className="py-2.5 px-3 font-mono font-bold text-brand-900">
                              {rep.shiftNo || rep.reportNo}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-stone-600">
                              {new Date(rep.closedAt).toLocaleDateString('ar-IQ')}{' '}
                              {new Date(rep.closedAt).toLocaleTimeString('ar-IQ', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold">
                              {(rep.directSales || 0).toLocaleString()} {storeSettings.currency}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-rose-700 font-bold">
                              {(rep.salesReturns || 0) > 0
                                ? `-${(rep.salesReturns || 0).toLocaleString()} ${storeSettings.currency}`
                                : '-'}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-emerald-700 font-bold">
                              +{(rep.collectedDeposits || 0).toLocaleString()} {storeSettings.currency}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-rose-700 font-bold">
                              -{(rep.dailyExpenses || 0).toLocaleString()} {storeSettings.currency}
                            </td>
                            <td className="py-2.5 px-3 font-mono font-black text-brand-900 text-sm">
                              {(rep.netCash || 0).toLocaleString()} {storeSettings.currency}
                            </td>
                            <td className="py-2.5 px-3 text-stone-700">{rep.closedBy}</td>
                            <td className="py-2.5 px-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                {hasItems && (
                                  <button
                                    onClick={() => setExpandedShiftId(isExpanded ? null : rep.id)}
                                    title="عرض الأصناف المباعة في هذه الوردية"
                                    className="p-1.5 hover:bg-stone-100 text-stone-600 rounded-lg transition-colors cursor-pointer"
                                  >
                                    {isExpanded ? (
                                      <ChevronUp className="w-4 h-4 text-brand-800" />
                                    ) : (
                                      <ChevronDown className="w-4 h-4 text-stone-500" />
                                    )}
                                  </button>
                                )}
                                <button
                                  onClick={() => reprintShiftZReport(rep)}
                                  title="إعادة طباعة تقرير Z"
                                  className="p-1.5 hover:bg-brand-50 text-stone-600 hover:text-brand-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                                >
                                  <Printer className="w-4 h-4 text-brand-800" />
                                  <span className="hidden xl:inline text-[10px] font-bold">طباعة Z</span>
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* Expandable itemized sold items breakdown */}
                          {isExpanded && hasItems && (
                            <tr className="bg-amber-50/40">
                              <td colSpan="9" className="p-3">
                                <div className="border border-amber-200 rounded-xl p-3 bg-white">
                                  <div className="text-xs font-bold text-stone-800 mb-2 flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5 text-brand-800" />
                                    <span>الأصناف المباعة في هذه الوردية ({rep.itemizedItems.length} صنف):</span>
                                  </div>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-[11px]">
                                    {rep.itemizedItems.map((it, idx) => (
                                      <div
                                        key={idx}
                                        className="p-2 bg-stone-50 rounded-lg border border-stone-200 flex justify-between"
                                      >
                                        <span className="font-bold text-stone-800 truncate pr-1">{it.name}</span>
                                        <span className="font-mono text-brand-900 font-bold shrink-0">
                                          ×{it.quantity} ({Number(it.total).toLocaleString()})
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* 1. Manager PIN Authentication Modal */}
      <ManagerPinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={handlePinSuccess}
      />

      {/* 2. Z-Report Execution & Confirmation Dialog */}
      <ZReportConfirmationModal
        isOpen={isZModalOpen}
        onClose={() => setIsZModalOpen(false)}
      />
    </div>
  );
}

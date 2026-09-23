import React, { useState, useMemo, useEffect } from 'react';
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
  Sun,
  Moon,
  Trash2,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { ManagerPinModal } from './ManagerPinModal';
import { ZReportConfirmationModal } from './ZReportConfirmationModal';
import { DeleteShiftRecordModal } from './DeleteShiftRecordModal';
import { UndoExpenseModal } from '../expenses/UndoExpenseModal';

export function TreasuryModule() {
  const {
    dailyTreasury,
    currentSession,
    zReportsHistory,
    shiftHistory,
    reprintShiftZReport,
    deleteShiftRecord,
    undoExpense,
    triggerPrint,
    printXReport,
    printShiftHandover,
    activeShiftType,
    closeDayAndResetDrawer,
    storeSettings,
    isManager,
    userRole,
  } = usePOS();

  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isZModalOpen, setIsZModalOpen] = useState(false);
  const [shiftToDelete, setShiftToDelete] = useState(null);
  const [expenseToUndo, setExpenseToUndo] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [activeTab, setActiveTab] = useState('summary'); // summary, today_sales, today_expenses, today_returns, past_zreports
  const [successNotice, setSuccessNotice] = useState('');

  // Shift Archive Security & Access Guard
  const [isArchiveUnlocked, setIsArchiveUnlocked] = useState(false);
  const [isArchivePinModalOpen, setIsArchivePinModalOpen] = useState(false);

  // Automatically reset archive access if role changes away from manager
  useEffect(() => {
    if (!isManager) {
      setIsArchiveUnlocked(false);
      if (activeTab === 'past_zreports') {
        setActiveTab('summary');
      }
    }
  }, [isManager, userRole]);

  const isArchiveAccessible = isManager || isArchiveUnlocked;

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

  const handleConfirmDeleteShift = (shift) => {
    deleteShiftRecord(shift.id, shift.shiftNo || shift.reportNo, shift.sessionId);
    setToastMessage('تم حذف سجل اليومية بنجاح');
    setTimeout(() => {
      setToastMessage('');
    }, 3500);
  };

  const handleConfirmUndoExpense = () => {
    if (!expenseToUndo) return;
    undoExpense(expenseToUndo.id);
    setExpenseToUndo(null);
  };

  const handleResetPinSuccess = () => {
    setIsPinModalOpen(false);
    const zReport = closeDayAndResetDrawer('تم إغلاق الوردية وتصفير الصندوق بنجاح برمز تصفير اليومية');
    setSuccessNotice(
      `تم إغلاق اليومية وتصفير الصندوق بنجاح! تم إصدار وطباعة تقرير Z رقم (${zReport.reportNo}) وأرشفة الحسابات للوردية الجديدة.`
    );
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

        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Action: "طباعة مبيعات اليوم (معاينة)" (Shift X-Report) */}
          <button
            onClick={() => printXReport()}
            title="طباعة تقرير مبيعات اليوم الفوري دون تصفير الصندوق (معاينة مبيعات 72.1mm)"
            className="bg-gold-500 hover:bg-gold-400 text-stone-950 font-black px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-98 border border-gold-400"
          >
            <Printer className="w-4 h-4 text-stone-950" />
            <span>طباعة مبيعات اليوم (معاينة)</span>
          </button>

          {/* Dedicated Shift Reset Button (Protected by Reset PIN) */}
          <button
            onClick={() => setIsPinModalOpen(true)}
            className="bg-brand-800 hover:bg-brand-900 text-white font-black px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-brand-900/20 hover:shadow-xl transition-all cursor-pointer active:scale-98 border border-gold-500/30"
          >
            <Lock className="w-4 h-4 text-gold-400" />
            <span>إغلاق اليومية وتصفير الصندوق (برمز التصفير)</span>
          </button>
        </div>
      </div>

      {/* Success Notification Notice */}
      {successNotice && (
        <div className="mx-3 sm:mx-4 mt-3 p-3.5 bg-emerald-50 border-2 border-emerald-400 text-emerald-950 rounded-2xl flex items-center justify-between gap-3 text-xs font-bold animate-fade-in shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-5 h-5 text-emerald-700 shrink-0" />
            <span>{successNotice}</span>
          </div>
          <button
            onClick={() => setSuccessNotice('')}
            className="text-emerald-800 hover:text-emerald-950 px-2 py-1 bg-emerald-100 rounded-lg text-xs font-bold cursor-pointer"
          >
            إغلاق الإشعار
          </button>
        </div>
      )}

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
          {
            id: 'past_zreports',
            label: isArchiveAccessible
              ? `أرشيف اليوميات والتقارير (${combinedShifts.length})`
              : 'أرشيف اليوميات والتقارير',
            isProtected: !isArchiveAccessible,
          },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'past_zreports' && !isArchiveAccessible) {
                  setIsArchivePinModalOpen(true);
                  return;
                }
                setActiveTab(tab.id);
              }}
              title={tab.isProtected ? 'أرشيف اليوميات والتقارير (محمي برمز المدير العام)' : tab.label}
              className={`py-2.5 px-3 rounded-t-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer border-b-2 flex items-center gap-1.5 ${
                isActive
                  ? 'border-brand-800 text-brand-900 bg-warm-50 font-extrabold'
                  : tab.isProtected
                  ? 'border-transparent text-amber-800/90 hover:text-amber-950 bg-amber-50/50 hover:bg-amber-100/70'
                  : 'border-transparent text-stone-600 hover:text-brand-800'
              }`}
            >
              {tab.isProtected && <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
              <span>{tab.label}</span>
              {tab.isProtected && (
                <span className="text-[10px] bg-amber-200/80 text-amber-950 px-1.5 py-0.5 rounded font-bold font-sans">
                  رمز المدير
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Subtab Content Area */}
      <div className="flex-1 p-3 sm:p-4 overflow-y-auto">
        {/* TAB 1: Summary & Formula breakdown */}
        {activeTab === 'summary' && (
          <div className="space-y-4 max-w-4xl mx-auto">
            {/* Dual Shift Comparison Breakdown */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-warm-300 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between border-b border-warm-200 pb-3 gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-800 text-gold-400 flex items-center justify-center font-bold">
                    <History className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-stone-900 text-sm sm:text-base">
                      تفصيل أداء الورديات (الشفت الصباحي والمسائي)
                    </h3>
                    <p className="text-[11px] text-stone-500">
                      يومية مالية واحدة متصلة مع تفصيل عهدة ومبيعات كل شفت على حدة
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-stone-600">
                  <span className="hidden sm:inline">الشفت النشط الآن:</span>
                  <span className={`px-2.5 py-1 rounded-lg font-black text-xs ${
                    activeShiftType === 'صباحي' ? 'bg-amber-100 text-amber-950 border border-amber-300' : 'bg-indigo-100 text-indigo-950 border border-indigo-300'
                  }`}>
                    {activeShiftType === 'صباحي' ? '☀️ الشفت الصباحي' : '🌙 الشفت المسائي'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Morning Shift Card */}
                <div className="p-4 rounded-2xl border-2 border-amber-300 bg-amber-50/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-200 text-amber-900 flex items-center justify-center font-bold">
                        <Sun className="w-4 h-4 text-amber-800" />
                      </div>
                      <div>
                        <div className="font-black text-stone-900 text-sm">الشفت الصباحي ☀️</div>
                        <div className="text-[10px] text-stone-500 font-bold">
                          المسؤول: {dailyTreasury.morningMetrics?.cashierName || 'كاشير الصباح'}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => printShiftHandover('صباحي')}
                      title="طباعة وصل تسليم الشفت الصباحي (72.1mm)"
                      className="bg-amber-400 hover:bg-amber-500 text-stone-950 px-2.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 shadow-xs cursor-pointer transition-all active:scale-95"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>ملخص الصباحي</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-amber-200">
                    <div className="bg-white/90 p-2 rounded-xl border border-amber-200/80">
                      <div className="text-[10px] font-bold text-stone-500">المبيعات</div>
                      <div className="text-xs font-mono font-black text-stone-900 mt-0.5">
                        {dailyTreasury.morningMetrics?.directSales.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-white/90 p-2 rounded-xl border border-amber-200/80">
                      <div className="text-[10px] font-bold text-stone-500">الصرفيات (-)</div>
                      <div className="text-xs font-mono font-black text-rose-700 mt-0.5">
                        -{dailyTreasury.morningMetrics?.dailyExpenses.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-amber-200/60 p-2 rounded-xl border border-amber-300">
                      <div className="text-[10px] font-black text-amber-950">صافي العهدة</div>
                      <div className="text-xs font-mono font-black text-stone-950 mt-0.5">
                        {dailyTreasury.morningMetrics?.netCash.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="text-[10.5px] text-stone-600 flex justify-between px-1">
                    <span>عدد الفواتير: {dailyTreasury.morningMetrics?.salesCount || 0}</span>
                    <span>سندات الصرف: {dailyTreasury.morningMetrics?.expensesCount || 0}</span>
                  </div>
                </div>

                {/* Evening Shift Card */}
                <div className="p-4 rounded-2xl border-2 border-indigo-300 bg-indigo-50/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-200 text-indigo-900 flex items-center justify-center font-bold">
                        <Moon className="w-4 h-4 text-indigo-800" />
                      </div>
                      <div>
                        <div className="font-black text-stone-900 text-sm">الشفت المسائي 🌙</div>
                        <div className="text-[10px] text-stone-500 font-bold">
                          المسؤول: {dailyTreasury.eveningMetrics?.cashierName || 'كاشير المساء'}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => printShiftHandover('مسائي')}
                      title="طباعة وصل تسليم الشفت المسائي (72.1mm)"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 shadow-xs cursor-pointer transition-all active:scale-95"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>ملخص المسائي</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-indigo-200">
                    <div className="bg-white/90 p-2 rounded-xl border border-indigo-200/80">
                      <div className="text-[10px] font-bold text-stone-500">المبيعات</div>
                      <div className="text-xs font-mono font-black text-stone-900 mt-0.5">
                        {dailyTreasury.eveningMetrics?.directSales.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-white/90 p-2 rounded-xl border border-indigo-200/80">
                      <div className="text-[10px] font-bold text-stone-500">الصرفيات (-)</div>
                      <div className="text-xs font-mono font-black text-rose-700 mt-0.5">
                        -{dailyTreasury.eveningMetrics?.dailyExpenses.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-indigo-200/60 p-2 rounded-xl border border-indigo-300">
                      <div className="text-[10px] font-black text-indigo-950">صافي العهدة</div>
                      <div className="text-xs font-mono font-black text-stone-950 mt-0.5">
                        {dailyTreasury.eveningMetrics?.netCash.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="text-[10.5px] text-stone-600 flex justify-between px-1">
                    <span>عدد الفواتير: {dailyTreasury.eveningMetrics?.salesCount || 0}</span>
                    <span>سندات الصرف: {dailyTreasury.eveningMetrics?.expensesCount || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cash Equation Card (Overall Day) */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-warm-300 shadow-xs space-y-4 text-center">
              <h3 className="font-black text-stone-800 text-sm sm:text-base">
                معادلة احتساب النقد الفعلي لليومية كاملة (الصندوق النهائي)
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
                <strong>حماية أمنية:</strong> تصفير الصندوق وإغلاق اليومية محمي برمز تصفير اليومية المعتمد. عند التصفير، يُطبع تقرير Z اليومي وتُعاد العدادات النشطة للصفر دون حذف أي فواتير تاريخية.
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
                  <th className="py-2.5 px-3">الشفت</th>
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
                    <td colSpan="8" className="py-8 text-center text-stone-400 font-bold">
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
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black inline-flex items-center gap-1 ${
                          sale.shiftType === 'مسائي'
                            ? 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                            : 'bg-amber-100 text-amber-900 border border-amber-200'
                        }`}>
                          {sale.shiftType === 'مسائي' ? '🌙 مسائي' : '☀️ صباحي'}
                        </span>
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
                  <th className="py-2.5 px-3">الشفت</th>
                  <th className="py-2.5 px-3">المبلغ المسترجع</th>
                  <th className="py-2.5 px-3">الزبون</th>
                  <th className="py-2.5 px-3">السبب</th>
                  <th className="py-2.5 px-3 text-center">طباعة الوصل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100">
                {sessionReturns.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-stone-400 font-bold">
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
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black inline-flex items-center gap-1 ${
                          ret.shiftType === 'مسائي'
                            ? 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                            : 'bg-amber-100 text-amber-900 border border-amber-200'
                        }`}>
                          {ret.shiftType === 'مسائي' ? '🌙 مسائي' : '☀️ صباحي'}
                        </span>
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
                  <th className="py-2.5 px-3">الشفت</th>
                  <th className="py-2.5 px-3">المبلغ</th>
                  <th className="py-2.5 px-3">التصنيف</th>
                  <th className="py-2.5 px-3">البيان</th>
                  <th className="py-2.5 px-3 text-center">الإجراءات</th>
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
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black inline-flex items-center gap-1 ${
                          exp.shiftType === 'مسائي'
                            ? 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                            : 'bg-amber-100 text-amber-900 border border-amber-200'
                        }`}>
                          {exp.shiftType === 'مسائي' ? '🌙 مسائي' : '☀️ صباحي'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-black text-rose-700 text-sm">
                        {Number(exp.amount).toLocaleString()} {storeSettings.currency}
                      </td>
                      <td className="py-2.5 px-3">{exp.category}</td>
                      <td className="py-2.5 px-3 text-stone-600 max-w-xs truncate">{exp.description}</td>
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => triggerPrint('expense', exp)}
                            title="إعادة طباعة سند الصرف"
                            className="p-1.5 hover:bg-brand-50 text-stone-600 hover:text-brand-800 rounded-lg transition-colors cursor-pointer"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setExpenseToUndo(exp)}
                            title="تراجع عن سند الصرف وإعادة المبلغ للصندوق"
                            className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 hover:border-amber-400 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer active:scale-95 shadow-xs"
                          >
                            <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                            <span>تراجع</span>
                          </button>
                        </div>
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
          !isArchiveAccessible ? (
            <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-2xl border-2 border-amber-200/80 shadow-xs space-y-4 my-6 max-w-lg mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-xs">
                <Lock className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base sm:text-lg font-black text-stone-900">
                  أرشيف اليوميات والتقارير محمي بصلاحية المدير العام
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed">
                  هذا القسم يحتوي على السجلات المالية والتقارير التراكمية، ويتطلب إدخال رمز المدير العام للمتابعة.
                </p>
              </div>
              <button
                onClick={() => setIsArchivePinModalOpen(true)}
                className="px-5 py-2.5 bg-brand-800 hover:bg-brand-900 text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
              >
                <Lock className="w-4 h-4 text-gold-400" />
                <span>إدخال رمز المدير للوصول إلى الأرشيف</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Unlocked banner if session is cashier */}
              {!isManager && isArchiveUnlocked && (
                <div className="bg-amber-50 border border-amber-300 text-amber-950 px-3.5 py-2.5 rounded-xl text-xs flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2 font-bold">
                    <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>تم فتح أرشيف اليوميات برمز المدير العام (صلاحية مؤقتة لهذه الجلسة)</span>
                  </div>
                  <button
                    onClick={() => {
                      setIsArchiveUnlocked(false);
                      setActiveTab('summary');
                      setToastMessage('تم قفل أرشيف اليوميات بنجاح');
                      setTimeout(() => setToastMessage(''), 3500);
                    }}
                    className="bg-amber-200/80 hover:bg-amber-300 text-amber-950 font-bold px-2.5 py-1 rounded-lg text-[11px] flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                  >
                    <Lock className="w-3 h-3" />
                    <span>إعادة القفل الآن</span>
                  </button>
                </div>
              )}
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
                    <th className="py-2.5 px-3 text-center">الإجراءات / طباعة</th>
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

                                {/* Delete Shift Action: Manager Only */}
                                {isManager && (
                                  <button
                                    onClick={() => setShiftToDelete(rep)}
                                    title="حذف سجل اليومية بالكامل (المدير العام فقط)"
                                    className="p-1.5 hover:bg-rose-50 text-rose-600 hover:text-rose-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    <span className="hidden xl:inline text-[10px] font-bold">حذف</span>
                                  </button>
                                )}
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
        )
      )}
    </div>

      {/* 1. Dedicated Shift Reset PIN Modal (Independent from Manager PIN) */}
      <ManagerPinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        onSuccess={handleResetPinSuccess}
        title="رمز تصفير اليومية (Shift Reset PIN)"
        promptMessage="أدخل رمز تصفير اليومية المعتمد لإغلاق الوردية وتصفير الصندوق وطباعة تقرير Z"
        expectedPin={storeSettings.resetPin || '9999'}
      />

      {/* 2. Z-Report Execution & Confirmation Dialog */}
      <ZReportConfirmationModal
        isOpen={isZModalOpen}
        onClose={() => setIsZModalOpen(false)}
      />

      {/* 3. Delete Shift Record Confirmation & PIN Modal (Manager Only) */}
      <DeleteShiftRecordModal
        isOpen={Boolean(shiftToDelete)}
        onClose={() => setShiftToDelete(null)}
        shiftRecord={shiftToDelete}
        onConfirmDelete={handleConfirmDeleteShift}
      />

      {/* 4. Archive Access Manager PIN Modal */}
      <ManagerPinModal
        isOpen={isArchivePinModalOpen}
        onClose={() => setIsArchivePinModalOpen(false)}
        onSuccess={() => {
          setIsArchiveUnlocked(true);
          setActiveTab('past_zreports');
          setToastMessage('تم التحقق بنجاح - تم فتح أرشيف اليوميات والتقارير');
          setTimeout(() => setToastMessage(''), 3500);
        }}
        title="أرشيف اليوميات والتقارير"
        promptMessage="يرجى إدخال رمز المدير للوصول إلى أرشيف اليوميات والتقارير"
        expectedPin={storeSettings.managerPin || '1234'}
      />

      {/* 5. Undo/Cancel Expense Modal */}
      <UndoExpenseModal
        isOpen={!!expenseToUndo}
        onClose={() => setExpenseToUndo(null)}
        expense={expenseToUndo}
        onConfirm={handleConfirmUndoExpense}
        currency={storeSettings.currency || 'د.ع'}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-500/50 flex items-center gap-2.5 text-xs sm:text-sm font-bold animate-fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

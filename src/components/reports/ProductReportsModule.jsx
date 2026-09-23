import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Calendar,
  Search,
  Filter,
  Printer,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  TrendingUp,
  Package,
  Sparkles,
  Coins,
  FileSpreadsheet,
  RotateCcw,
  ShieldAlert,
  Lock,
  CheckCircle,
  AlertTriangle,
  X,
  Clock,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';

export function ProductReportsModule() {
  const {
    salesHistory,
    salesReturns,
    cleanCategories,
    categories,
    storeSettings,
    triggerPrint,
    productMovementResetAt,
    resetProductMovement,
    verifyManagerPin,
    isManager,
  } = usePOS();

  // Filter States
  const [periodPreset, setPeriodPreset] = useState('today'); // 'today' | 'week' | 'month' | 'all' | 'custom'
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [shiftFilter, setShiftFilter] = useState('ALL'); // 'ALL' | 'صباحي' | 'مسائي'

  // Reset Cycle Modal States
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetPin, setResetPin] = useState('');
  const [resetPinError, setResetPinError] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  // Sorting State
  const [sortField, setSortField] = useState('quantity'); // 'quantity' | 'totalRevenue' | 'name' | 'category'
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' | 'desc'

  const categoriesList = cleanCategories || categories || [];

  // Category ID to Name mapping
  const categoryMap = useMemo(() => {
    const map = {};
    categoriesList.forEach((c) => {
      map[c.id] = c.name;
    });
    return map;
  }, [categoriesList]);

  // Human-readable Period Label
  const periodLabel = useMemo(() => {
    const todayStr = new Date().toLocaleDateString('ar-IQ');
    const shiftSuffix =
      shiftFilter === 'ALL'
        ? ''
        : shiftFilter === 'صباحي'
        ? ' • الشفت الصباحي ☀️'
        : ' • الشفت المسائي 🌙';

    let base = '';
    switch (periodPreset) {
      case 'today':
        base = `اليوم (${todayStr})`;
        break;
      case 'week':
        base = 'هذا الأسبوع (آخر 7 أيام)';
        break;
      case 'month':
        base = 'هذا الشهر (آخر 30 يوماً)';
        break;
      case 'all':
        base = 'من البداية حتى الآن (كافة المبيعات)';
        break;
      case 'custom':
        if (customStartDate && customEndDate) {
          base = `من ${customStartDate} إلى ${customEndDate}`;
        } else if (customStartDate) {
          base = `من ${customStartDate}`;
        } else if (customEndDate) {
          base = `حتى ${customEndDate}`;
        } else {
          base = 'فترة مخصصة';
        }
        break;
      default:
        base = 'كافة الفترات';
    }
    return `${base}${shiftSuffix}`;
  }, [periodPreset, customStartDate, customEndDate, shiftFilter]);

  // 1. Filter Sales by Date / Timeframe & Shift (respecting productMovementResetAt cycle)
  const filteredSalesByDate = useMemo(() => {
    const now = new Date();
    const todayDateStr = now.toISOString().split('T')[0];

    return (salesHistory || []).filter((sale) => {
      // Shift filter check
      if (shiftFilter !== 'ALL') {
        const itemShift = sale.shiftType || 'صباحي';
        if (itemShift !== shiftFilter) return false;
      }

      if (!sale.date) return true;
      const saleDate = new Date(sale.date);
      if (isNaN(saleDate.getTime())) return true;

      // Filter out sales before the reset cycle timestamp
      if (productMovementResetAt) {
        const resetDate = new Date(productMovementResetAt);
        if (!isNaN(resetDate.getTime()) && saleDate < resetDate) {
          return false;
        }
      }

      if (periodPreset === 'today') {
        const saleDateStr = saleDate.toISOString().split('T')[0];
        return saleDateStr === todayDateStr;
      }
      if (periodPreset === 'week') {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return saleDate >= sevenDaysAgo;
      }
      if (periodPreset === 'month') {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return saleDate >= thirtyDaysAgo;
      }
      if (periodPreset === 'custom') {
        if (customStartDate) {
          const start = new Date(customStartDate + 'T00:00:00');
          if (saleDate < start) return false;
        }
        if (customEndDate) {
          const end = new Date(customEndDate + 'T23:59:59');
          if (saleDate > end) return false;
        }
        return true;
      }
      return true; // 'all'
    });
  }, [salesHistory, periodPreset, customStartDate, customEndDate, shiftFilter, productMovementResetAt]);

  // 1.1 Filter Sales Returns by Date / Timeframe & Shift (respecting productMovementResetAt cycle)
  const filteredReturnsByDate = useMemo(() => {
    const now = new Date();
    const todayDateStr = now.toISOString().split('T')[0];

    return (salesReturns || []).filter((ret) => {
      // Shift filter check
      if (shiftFilter !== 'ALL') {
        const itemShift = ret.shiftType || 'صباحي';
        if (itemShift !== shiftFilter) return false;
      }

      if (!ret.date) return true;
      const retDate = new Date(ret.date);
      if (isNaN(retDate.getTime())) return true;

      // Filter out returns before the reset cycle timestamp
      if (productMovementResetAt) {
        const resetDate = new Date(productMovementResetAt);
        if (!isNaN(resetDate.getTime()) && retDate < resetDate) {
          return false;
        }
      }

      if (periodPreset === 'today') {
        const retDateStr = retDate.toISOString().split('T')[0];
        return retDateStr === todayDateStr;
      }
      if (periodPreset === 'week') {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return retDate >= sevenDaysAgo;
      }
      if (periodPreset === 'month') {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return retDate >= thirtyDaysAgo;
      }
      if (periodPreset === 'custom') {
        if (customStartDate) {
          const start = new Date(customStartDate + 'T00:00:00');
          if (retDate < start) return false;
        }
        if (customEndDate) {
          const end = new Date(customEndDate + 'T23:59:59');
          if (retDate > end) return false;
        }
        return true;
      }
      return true; // 'all'
    });
  }, [salesReturns, periodPreset, customStartDate, customEndDate, shiftFilter, productMovementResetAt]);

  // 2. Aggregate Sales Item by Item & Deduct Sales Returns
  const aggregatedItems = useMemo(() => {
    const map = {};

    // 2.1 Add active sales
    filteredSalesByDate.forEach((sale) => {
      (sale.items || []).forEach((item) => {
        // Skip reservation service deposits if not a physical product
        const isDeposit = item.product?.isDeposit || item.product?.id === 'service-deposit';
        const key = item.product?.id || item.product?.name || item.name || 'item';
        const name = item.product?.name || item.name || 'صنف';
        const rawCat = item.product?.category || item.category || 'cat-cakes';
        const categoryName = isDeposit ? 'عربون حجز' : (categoryMap[rawCat] || rawCat || 'عام');
        const qty = Number(item.quantity) || 1;
        const unitPrice = Number(item.unitPrice) || Number(item.price) || 0;
        const discount = Number(item.discount) || 0;
        const lineTotal = Math.max(0, unitPrice * qty - discount);

        if (!map[key]) {
          map[key] = {
            id: key,
            name,
            categoryId: rawCat,
            categoryName,
            quantity: 0,
            totalRevenue: 0,
            ordersCount: 0,
            returnedQuantity: 0,
            returnedRevenue: 0,
          };
        }

        map[key].quantity += qty;
        map[key].totalRevenue += lineTotal;
        map[key].ordersCount += 1;
      });
    });

    // 2.2 Deduct Sales Returns automatically
    filteredReturnsByDate.forEach((ret) => {
      if (Array.isArray(ret.items) && ret.items.length > 0) {
        ret.items.forEach((item) => {
          const key = item.id || item.name;
          const retQty = Number(item.quantity) || 1;
          const retAmount = Number(item.price) || (Number(item.unitPrice) || 0) * retQty;

          // Find matching key in map (by id or exact name)
          let target = map[key];
          if (!target) {
            const foundKey = Object.keys(map).find(
              (k) => map[k].name === item.name || map[k].id === item.id
            );
            if (foundKey) target = map[foundKey];
          }

          if (target) {
            target.returnedQuantity = Math.round(((target.returnedQuantity || 0) + retQty) * 1000) / 1000;
            target.returnedRevenue = (target.returnedRevenue || 0) + retAmount;
            target.quantity = Math.max(0, Math.round((target.quantity - retQty) * 1000) / 1000);
            target.totalRevenue = Math.max(0, Math.round(target.totalRevenue - retAmount));
          }
        });
      }
    });

    return Object.values(map);
  }, [filteredSalesByDate, filteredReturnsByDate, categoryMap]);

  // 3. Search & Category Filtering
  const displayedItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return aggregatedItems
      .filter((item) => {
        const matchesQuery =
          !query ||
          item.name.toLowerCase().includes(query) ||
          item.categoryName.toLowerCase().includes(query);

        const matchesCategory =
          selectedCategory === 'ALL' ||
          item.categoryId === selectedCategory ||
          item.categoryName === selectedCategory;

        return matchesQuery && matchesCategory;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (typeof valA === 'string') {
          return sortDirection === 'asc'
            ? valA.localeCompare(valB, 'ar')
            : valB.localeCompare(valA, 'ar');
        }

        return sortDirection === 'asc' ? valA - valB : valB - valA;
      });
  }, [aggregatedItems, searchQuery, selectedCategory, sortField, sortDirection]);

  // Grand Totals for displayed items
  const totals = useMemo(() => {
    return displayedItems.reduce(
      (acc, it) => {
        acc.totalQuantity = Math.round((acc.totalQuantity + it.quantity) * 1000) / 1000;
        acc.totalRevenue += it.totalRevenue;
        acc.totalReturnedQty = Math.round(((acc.totalReturnedQty || 0) + (it.returnedQuantity || 0)) * 1000) / 1000;
        acc.totalReturnedRev = (acc.totalReturnedRev || 0) + (it.returnedRevenue || 0);
        return acc;
      },
      { totalQuantity: 0, totalRevenue: 0, totalReturnedQty: 0, totalReturnedRev: 0 }
    );
  }, [displayedItems]);

  // Top selling item
  const topSellingProduct = useMemo(() => {
    if (displayedItems.length === 0) return null;
    return [...displayedItems].sort((a, b) => b.quantity - a.quantity)[0];
  }, [displayedItems]);

  // Handle Sort Toggle
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Handle Opening Reset Modal
  const handleOpenResetModal = () => {
    setResetPin('');
    setResetPinError('');
    setIsResetModalOpen(true);
  };

  // Handle Confirming Reset of Product Movement Cycle
  const handleConfirmReset = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!resetPin) {
      setResetPinError('يرجى إدخال رمز مرور المدير لتأكيد التصفير');
      return;
    }
    if (!verifyManagerPin(resetPin)) {
      setResetPinError('رمز مرور المدير غير صحيح');
      return;
    }

    const resetTimestamp = resetProductMovement();
    setIsResetModalOpen(false);
    setResetPin('');
    setResetPinError('');
    const resetDateObj = new Date(resetTimestamp);
    setSuccessNotice(
      `تم تصفير عدادات حركة الأصناف بنجاح وبدء دورة إحصائية جديدة (${resetDateObj.toLocaleDateString('ar-IQ')} - ${resetDateObj.toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' })}). كافة الفواتير وسجلات اليوميات والتقارير المالية محفوظة بالكامل.`
    );
  };

  // Trigger Thermal Receipt Printing
  const handlePrintReport = () => {
    const reportData = {
      items: displayedItems,
      periodLabel,
      totalQuantity: totals.totalQuantity,
      totalRevenue: totals.totalRevenue,
      filteredCategory: selectedCategory !== 'ALL' ? (categoryMap[selectedCategory] || selectedCategory) : null,
      shiftFilter: shiftFilter !== 'ALL' ? shiftFilter : null,
      cycleStartDate: productMovementResetAt,
      printedAt: new Date().toISOString(),
    };
    triggerPrint('product_movement', reportData);
  };

  return (
    <div className="flex flex-col h-full bg-[#FAF8F5] overflow-hidden select-none">
      {/* Top Header */}
      <div className="p-3 sm:p-4 bg-white border-b border-warm-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-brand-800 text-gold-400 flex items-center justify-center font-bold">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-brand-900 leading-tight">
              تقرير مبيعات وحركة الأصناف (Product Movement Analytics)
            </h2>
            <p className="text-[11px] text-stone-500">
              تحليل حركة بيع المنتجات والكميات والعائد المالي حسب الفترة المحددة مع خصم المردودات تلقائياً
            </p>
          </div>
        </div>

        {/* Action Buttons Group */}
        <div className="flex items-center gap-2">
          {/* Action Button: Reset Product Movement (Manager Only) */}
          <button
            type="button"
            onClick={handleOpenResetModal}
            title="تصفير عدادات كميات ومبيعات الأصناف لبدء دورة إحصائية جديدة (محمي برمز المدير)"
            className="bg-rose-700 hover:bg-rose-800 text-white font-bold px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-98 border border-rose-600/40"
          >
            <RotateCcw className="w-4 h-4 text-rose-200" />
            <span>تصفير إحصائيات حركة الأصناف</span>
          </button>

          {/* Action Button: Print 72.1mm Thermal Report */}
          <button
            type="button"
            onClick={handlePrintReport}
            title="طباعة تقرير حركة ومبيعات الأصناف على رول الفواتير الحراري (72.1mm)"
            className="bg-brand-800 hover:bg-brand-900 text-white font-black px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-98 border border-gold-500/30"
          >
            <Printer className="w-4 h-4 text-gold-400" />
            <span>طباعة تقرير حركة المنتجات (وصل حراري)</span>
          </button>
        </div>
      </div>

      {/* Active Statistical Cycle Badge & Alerts */}
      <div className="px-3 sm:px-4 pt-3 space-y-2">
        {productMovementResetAt && (
          <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-bold">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                الدورة الإحصائية الحالية: بدأت بتاريخ{' '}
                <span className="font-mono font-black text-amber-950">
                  {new Date(productMovementResetAt).toLocaleDateString('ar-IQ')} (الساعة {new Date(productMovementResetAt).toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' })})
                </span>
              </span>
            </div>
            <span className="text-[10px] text-amber-700 font-normal hidden sm:inline">
              * يتم احتساب الكميات والمبيعات والمردودات انطلاقاً من بداية هذه الدورة
            </span>
          </div>
        )}

        {successNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center justify-between shadow-xs animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successNotice}</span>
            </div>
            <button
              type="button"
              onClick={() => setSuccessNotice('')}
              className="text-emerald-700 hover:text-emerald-950 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* KPI Overview Cards */}
      <div className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. Total Units Sold */}
        <div className="bg-white p-3.5 rounded-2xl border border-warm-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-stone-500">إجمالي القطع الصافية المباعة:</span>
            <div className="text-2xl font-mono font-black text-brand-900 mt-1">
              {totals.totalQuantity.toLocaleString('ar-IQ', { maximumFractionDigits: 3 })}{' '}
              <span className="text-xs font-sans font-normal text-stone-500">قطعة</span>
            </div>
            <div className="text-[10px] text-stone-400 mt-0.5 flex items-center gap-1.5">
              <span>{periodLabel}</span>
              {totals.totalReturnedQty > 0 && (
                <span className="text-rose-600 font-bold font-sans">
                  (خصم {totals.totalReturnedQty} مسترجع)
                </span>
              )}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-800 flex items-center justify-center font-bold">
            <Package className="w-5 h-5" />
          </div>
        </div>

        {/* 2. Total Sales Revenue */}
        <div className="bg-white p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-800">إجمالي القيمة المالية الصافية:</span>
            <div className="text-2xl font-mono font-black text-emerald-700 mt-1">
              {totals.totalRevenue.toLocaleString()}{' '}
              <span className="text-xs font-sans font-normal text-emerald-900">
                {storeSettings.currency}
              </span>
            </div>
            <div className="text-[10px] text-emerald-700 mt-0.5 flex items-center gap-1.5">
              <span>عائد مبيعات الأصناف المعروضة</span>
              {totals.totalReturnedRev > 0 && (
                <span className="text-rose-600 font-bold font-sans">
                  (مردود: -{totals.totalReturnedRev.toLocaleString()})
                </span>
              )}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <Coins className="w-5 h-5" />
          </div>
        </div>

        {/* 3. Best Selling Product */}
        <div className="bg-white p-3.5 rounded-2xl border border-gold-300 bg-gold-50/20 shadow-xs flex items-center justify-between">
          <div className="min-w-0 pr-1">
            <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-gold-500" />
              الأعلى مبيعاً (Best Seller):
            </span>
            <div className="text-sm sm:text-base font-black text-stone-900 mt-1 truncate" title={topSellingProduct?.name || '—'}>
              {topSellingProduct ? topSellingProduct.name : '—'}
            </div>
            <div className="text-[10px] text-amber-800 font-mono mt-0.5">
              {topSellingProduct
                ? `${topSellingProduct.quantity} قطعة (${topSellingProduct.totalRevenue.toLocaleString()} ${storeSettings.currency})`
                : 'لا توجد مبيعات'}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gold-100 text-amber-900 flex items-center justify-center font-bold shrink-0">
            <TrendingUp className="w-5 h-5 text-amber-800" />
          </div>
        </div>

        {/* 4. Distinct Products Count */}
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-stone-500">عدد الأصناف النشطة:</span>
            <div className="text-2xl font-mono font-black text-stone-800 mt-1">
              {displayedItems.length}{' '}
              <span className="text-xs font-sans font-normal text-stone-500">صنفاً مباعاً</span>
            </div>
            <div className="text-[10px] text-stone-400 mt-0.5">من {filteredSalesByDate.length} طلبية وفاتورة</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center font-bold">
            <BarChart3 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="px-3 sm:px-4 pb-3 space-y-2.5">
        {/* Row 1: Quick Period Presets */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-2.5 rounded-2xl border border-warm-200 shadow-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 flex-1">
            <span className="text-xs font-bold text-stone-600 ml-1 flex items-center gap-1 shrink-0">
              <Calendar className="w-3.5 h-3.5 text-brand-800" />
              <span>الفترة:</span>
            </span>

            {[
              { id: 'today', label: 'اليوم' },
              { id: 'week', label: 'هذا الأسبوع' },
              { id: 'month', label: 'هذا الشهر' },
              { id: 'all', label: 'من البداية حتى الآن' },
              { id: 'custom', label: 'فترة مخصصة' },
            ].map((preset) => (
              <button
                key={preset.id}
                onClick={() => setPeriodPreset(preset.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  periodPreset === preset.id
                    ? 'bg-brand-800 text-white shadow-xs'
                    : 'bg-warm-100 text-stone-700 hover:bg-warm-200'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Custom Date Inputs (if preset is 'custom') */}
          {periodPreset === 'custom' && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-700 bg-warm-50 px-2 py-1 rounded-xl border border-warm-200">
              <span className="text-[10px] text-stone-500">من:</span>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="bg-white border border-stone-300 rounded-lg px-2 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-brand-800"
              />
              <span className="text-[10px] text-stone-500">إلى:</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="bg-white border border-stone-300 rounded-lg px-2 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-brand-800"
              />
            </div>
          )}
        </div>

        {/* Row 2: Search & Category Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم المنتج (مثال: كيك، بقلاوة، لوتس)..."
              className="w-full pl-3 pr-9 py-2 bg-white border border-warm-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-800 shadow-xs"
            />
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-stone-400 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white border border-warm-200 rounded-xl px-3 py-2 text-xs font-bold text-stone-700 focus:outline-none focus:ring-2 focus:ring-brand-800 cursor-pointer shadow-xs"
            >
              <option value="ALL">كافة الأقسام</option>
              {categoriesList.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

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

          {/* Clear Filters Button */}
          {(searchQuery || selectedCategory !== 'ALL' || shiftFilter !== 'ALL' || periodPreset !== 'today') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
                setShiftFilter('ALL');
                setPeriodPreset('today');
                setCustomStartDate('');
                setCustomEndDate('');
              }}
              className="text-xs text-brand-800 font-bold hover:underline px-2 cursor-pointer"
            >
              استعادة الافتراضي
            </button>
          )}
        </div>
      </div>

      {/* Main Aggregation Table */}
      <div className="flex-1 px-3 sm:px-4 pb-4 overflow-y-auto">
        <div className="bg-white border border-warm-200 rounded-2xl shadow-xs overflow-hidden flex flex-col h-full">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-right text-xs">
              <thead className="bg-warm-100 text-stone-700 font-bold border-b border-warm-200 sticky top-0 z-10">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">#</th>

                  {/* Column 1: Product Name */}
                  <th
                    onClick={() => handleSort('name')}
                    className="py-3 px-3 cursor-pointer hover:bg-warm-200/70 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>اسم المنتج (Product Name)</span>
                      {sortField === 'name' ? (
                        sortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-stone-400" />
                      )}
                    </div>
                  </th>

                  {/* Column 2: Category */}
                  <th
                    onClick={() => handleSort('categoryName')}
                    className="py-3 px-3 cursor-pointer hover:bg-warm-200/70 transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      <span>القسم (Category)</span>
                      {sortField === 'categoryName' ? (
                        sortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-stone-400" />
                      )}
                    </div>
                  </th>

                  {/* Column 3: Quantity Sold */}
                  <th
                    onClick={() => handleSort('quantity')}
                    className="py-3 px-3 cursor-pointer hover:bg-warm-200/70 transition-colors text-center"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>الكمية المباعة (Total Quantity)</span>
                      {sortField === 'quantity' ? (
                        sortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-stone-400" />
                      )}
                    </div>
                  </th>

                  {/* Column 4: Total Revenue */}
                  <th
                    onClick={() => handleSort('totalRevenue')}
                    className="py-3 px-3 cursor-pointer hover:bg-warm-200/70 transition-colors text-left"
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>إجمالي القيمة (Total Revenue)</span>
                      {sortField === 'totalRevenue' ? (
                        sortDirection === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-stone-400" />
                      )}
                    </div>
                  </th>

                  {/* Column 5: Share % */}
                  <th className="py-3 px-3 text-center w-24">النسبة %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100">
                {displayedItems.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-stone-400 font-bold">
                      <Package className="w-8 h-8 mx-auto mb-2 text-stone-300" />
                      <span>لا توجد مبيعات أصناف مسجلة تطابق محددات البحث والفترة المحددة ({periodLabel})</span>
                    </td>
                  </tr>
                ) : (
                  displayedItems.map((item, idx) => {
                    const percentage = totals.totalRevenue > 0
                      ? ((item.totalRevenue / totals.totalRevenue) * 100).toFixed(1)
                      : '0.0';

                    return (
                      <tr key={item.id || idx} className="hover:bg-warm-50/60 transition-colors">
                        <td className="py-3 px-3 text-center font-mono text-stone-400 font-bold">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-3 font-bold text-stone-900">
                          {item.name}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-warm-100 text-brand-900 border border-warm-200">
                            {item.categoryName}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-black text-brand-900 text-sm">
                          <div>
                            {item.quantity.toLocaleString('ar-IQ', { maximumFractionDigits: 3 })}{' '}
                            <span className="text-[10px] font-sans font-normal text-stone-500">
                              {item.quantity % 1 !== 0 ? 'كغم' : 'قطعة'}
                            </span>
                          </div>
                          {item.returnedQuantity > 0 && (
                            <div className="text-[10px] text-rose-700 font-bold font-sans mt-0.5 flex items-center justify-center gap-0.5">
                              <RotateCcw className="w-2.5 h-2.5" />
                              <span>خصم {item.returnedQuantity} {item.returnedQuantity % 1 !== 0 ? 'كغم' : 'قطعة'} مردود</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 text-left font-mono font-black text-emerald-700 text-sm whitespace-nowrap">
                          <div>
                            {item.totalRevenue.toLocaleString()}{' '}
                            <span className="text-[10px] font-sans font-normal text-emerald-900">
                              {storeSettings.currency}
                            </span>
                          </div>
                          {item.returnedRevenue > 0 && (
                            <div className="text-[9.5px] text-rose-700/80 font-normal mt-0.5">
                              (مردود: -{item.returnedRevenue.toLocaleString()})
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="font-mono font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md text-[11px]">
                            {percentage}%
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Bottom Fixed Summary Row */}
          {displayedItems.length > 0 && (
            <div className="bg-brand-950 text-white p-3.5 border-t-2 border-gold-500/40 flex flex-wrap items-center justify-between gap-3 sticky bottom-0 z-10 shadow-lg">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black text-gold-300">
                  الإجمالي العام للفترة المحددة ({periodLabel}):
                </span>
                <span className="text-xs text-warm-200 hidden sm:inline">
                  ({displayedItems.length} صنف مسجل)
                </span>
              </div>

              <div className="flex items-center gap-6 font-mono font-black">
                <div>
                  <span className="text-[10px] font-sans text-warm-300 ml-1">إجمالي المبيعات الصافية:</span>
                  <span className="text-base sm:text-lg text-white">
                    {totals.totalQuantity.toLocaleString('ar-IQ', { maximumFractionDigits: 3 })}
                  </span>
                  {totals.totalReturnedQty > 0 && (
                    <span className="text-[10px] text-rose-300 font-sans mr-2 font-normal">
                      (بعد خصم {totals.totalReturnedQty} مردود)
                    </span>
                  )}
                </div>

                <div className="border-r border-brand-700 pr-4">
                  <span className="text-[10px] font-sans text-gold-300 ml-1">الإيراد الصافي:</span>
                  <span className="text-lg sm:text-xl text-gold-400">
                    {totals.totalRevenue.toLocaleString()} {storeSettings.currency}
                  </span>
                  {totals.totalReturnedRev > 0 && (
                    <span className="text-[10px] text-rose-300 font-sans mr-2 font-normal">
                      (خصم {totals.totalReturnedRev.toLocaleString()} {storeSettings.currency} مردودات)
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Manager-Protected Product Movement Reset Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-fade-in select-none">
          <div className="bg-[#FAF8F5] border-2 border-rose-300 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col animate-scale-up">
            {/* Modal Header */}
            <div className="bg-rose-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-rose-700">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-gold-400" />
                <h3 className="font-black text-sm sm:text-base">تصفير إحصائيات حركة الأصناف</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsResetModalOpen(false);
                  setResetPin('');
                  setResetPinError('');
                }}
                className="text-warm-200 hover:text-white p-1 rounded-lg hover:bg-rose-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 space-y-4">
              {/* Warning Notice Box */}
              <div className="bg-rose-50 border-2 border-rose-200 p-3.5 rounded-xl flex items-start gap-2.5 text-rose-950">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed space-y-1.5">
                  <p className="font-black text-rose-900 text-sm">
                    تأكيد تصفير حركة الأصناف: هل أنت متأكد من تصفير عدادات وكميات مبيعات جميع المنتجات؟ هذا الإجراء سيبدأ دورة إحصائية جديدة ولا يمكن التراجع عنه.
                  </p>
                  <p className="text-[11px] text-stone-600 font-normal">
                    * ملاحظة أمان: هذا الإجراء لا يحذف أي فواتير أو سجلات مالية أو أرشيف اليوميات، بل يصفّر فقط عدادات كميات الأصناف المباعة في هذا التقرير لبدء دورة جرد جديدة.
                  </p>
                </div>
              </div>

              {/* PIN Form */}
              <form onSubmit={handleConfirmReset} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1.5 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-stone-600" />
                    <span>أدخل رمز مرور المدير لتأكيد بدء الدورة الجديدة:</span>
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    autoFocus
                    value={resetPin}
                    onChange={(e) => {
                      setResetPin(e.target.value);
                      setResetPinError('');
                    }}
                    placeholder="رمز مرور المدير..."
                    className="w-full bg-white border-2 border-stone-300 focus:border-rose-700 rounded-xl px-3 py-2.5 text-center font-mono font-black text-xl text-stone-900 focus:outline-none tracking-widest"
                  />
                  {resetPinError && (
                    <p className="text-rose-700 text-xs font-bold mt-1.5 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{resetPinError}</span>
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetModalOpen(false);
                      setResetPin('');
                      setResetPinError('');
                    }}
                    className="flex-1 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold py-2.5 rounded-xl text-xs sm:text-sm transition-colors cursor-pointer"
                  >
                    إلغاء التراجع
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-rose-700 hover:bg-rose-800 text-white font-black py-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>تأكيد وبدء دورة جديدة</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

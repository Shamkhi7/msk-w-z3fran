import React, { useState, useMemo } from 'react';
import {
  Clock,
  TrendingUp,
  Flame,
  Sun,
  Moon,
  Calendar,
  Filter,
  DollarSign,
  ShoppingBag,
  Zap,
  Sparkles,
  Info,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';

export function PeakHoursReport() {
  const { salesHistory, storeSettings } = usePOS();

  const [periodPreset, setPeriodPreset] = useState('all'); // 'today' | 'week' | 'month' | 'all'
  const [shiftFilter, setShiftFilter] = useState('ALL'); // 'ALL' | 'صباحي' | 'مسائي'

  // Filter sales by period and shift
  const filteredSales = useMemo(() => {
    const list = Array.isArray(salesHistory) ? salesHistory : [];
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    return list.filter((sale) => {
      if (!sale.date) return false;
      const saleDate = new Date(sale.date);
      const saleDateStr = sale.date.split('T')[0];

      // Period filter
      if (periodPreset === 'today') {
        if (saleDateStr !== todayStr) return false;
      } else if (periodPreset === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (saleDate < weekAgo) return false;
      } else if (periodPreset === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (saleDate < monthAgo) return false;
      }

      // Shift filter
      if (shiftFilter !== 'ALL') {
        if (sale.shiftType !== shiftFilter) return false;
      }

      return true;
    });
  }, [salesHistory, periodPreset, shiftFilter]);

  // Hourly Aggregation (08:00 AM to 02:00 AM)
  const hourlyData = useMemo(() => {
    // Hours sequence for a typical bakery: 8 AM to 2 AM next day (19 slots)
    const hoursOrder = [
      8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 0, 1, 2,
    ];

    const buckets = {};
    hoursOrder.forEach((h) => {
      buckets[h] = {
        hour: h,
        count: 0,
        totalRevenue: 0,
      };
    });

    filteredSales.forEach((sale) => {
      try {
        const d = new Date(sale.date);
        const h = d.getHours();
        if (buckets[h] !== undefined) {
          buckets[h].count += 1;
          buckets[h].totalRevenue += Number(sale.netTotal || sale.total || 0);
        }
      } catch (e) {}
    });

    const formatHourLabel = (h) => {
      const period = h >= 12 && h < 24 ? 'م' : 'ص';
      const formatted = h % 12 || 12;
      return `${String(formatted).padStart(2, '0')}:00 ${period}`;
    };

    const maxRevenue = Math.max(...hoursOrder.map((h) => buckets[h].totalRevenue), 1);
    const maxCount = Math.max(...hoursOrder.map((h) => buckets[h].count), 1);

    return hoursOrder.map((h) => {
      const b = buckets[h];
      const rev = b.totalRevenue;
      const cnt = b.count;
      const avg = cnt > 0 ? Math.round(rev / cnt) : 0;
      const pctOfMax = Math.round((rev / maxRevenue) * 100);

      let heatLevel = 'quiet'; // quiet | active | peak
      if (pctOfMax >= 70 && cnt > 0) heatLevel = 'peak';
      else if (pctOfMax >= 30 && cnt > 0) heatLevel = 'active';

      return {
        hour: h,
        label: formatHourLabel(h),
        count: cnt,
        totalRevenue: rev,
        averageTicket: avg,
        pctOfMax,
        heatLevel,
      };
    });
  }, [filteredSales]);

  // Overall Metrics & Peak Detection
  const metrics = useMemo(() => {
    let totalRevenue = 0;
    let totalOrders = filteredSales.length;
    let morningRev = 0;
    let morningOrders = 0;
    let eveningRev = 0;
    let eveningOrders = 0;

    filteredSales.forEach((s) => {
      const net = Number(s.netTotal || s.total || 0);
      totalRevenue += net;
      if (s.shiftType === 'صباحي') {
        morningRev += net;
        morningOrders += 1;
      } else {
        eveningRev += net;
        eveningOrders += 1;
      }
    });

    const peakSlot = [...hourlyData].sort((a, b) => b.totalRevenue - a.totalRevenue)[0];
    const peakOrdersSlot = [...hourlyData].sort((a, b) => b.count - a.count)[0];
    const avgTicket = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    const morningShare = totalRevenue > 0 ? Math.round((morningRev / totalRevenue) * 100) : 0;
    const eveningShare = totalRevenue > 0 ? Math.round((eveningRev / totalRevenue) * 100) : 0;

    return {
      totalRevenue,
      totalOrders,
      avgTicket,
      peakSlot,
      peakOrdersSlot,
      morningRev,
      morningOrders,
      morningShare,
      eveningRev,
      eveningOrders,
      eveningShare,
    };
  }, [filteredSales, hourlyData]);

  return (
    <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-4 select-none">
      {/* Filters Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-warm-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Period Presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          <span className="text-xs font-bold text-stone-500 ml-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-stone-400" />
            <span>الفترة:</span>
          </span>
          {[
            { id: 'today', label: 'اليوم' },
            { id: 'week', label: 'آخر 7 أيام' },
            { id: 'month', label: 'هذا الشهر' },
            { id: 'all', label: 'كافة المبيعات' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPeriodPreset(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                periodPreset === tab.id
                  ? 'bg-brand-800 text-white shadow-xs'
                  : 'bg-warm-50 text-stone-600 hover:bg-warm-100 border border-warm-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Shift Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-stone-500 ml-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-stone-400" />
            <span>الشفت:</span>
          </span>
          {[
            { id: 'ALL', label: 'الكل' },
            { id: 'صباحي', label: 'الصباحي ☀️' },
            { id: 'مسائي', label: 'المسائي 🌙' },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => setShiftFilter(s.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                shiftFilter === s.id
                  ? 'bg-gold-500 text-stone-950 font-black shadow-xs'
                  : 'bg-warm-50 text-stone-600 hover:bg-warm-100 border border-warm-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top Highlight Cards: Peak Hour & Shift Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Card 1: Peak Hour Alert */}
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-stone-950 p-4 rounded-2xl shadow-md space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black bg-stone-950/20 px-2 py-0.5 rounded-full text-stone-950">
              🔥 ساعة الذروة القصوى
            </span>
            <Flame className="w-6 h-6 text-stone-950/60" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono pt-1">
            {metrics.peakSlot?.count > 0 ? metrics.peakSlot.label : 'لا توجد مبيعات'}
          </div>
          <p className="text-xs font-bold text-stone-900">
            {metrics.peakSlot?.count > 0 ? (
              <>
                إجمالي إيراد الساعة: {metrics.peakSlot.totalRevenue.toLocaleString()} {storeSettings.currency} ({metrics.peakSlot.count} طلبات)
              </>
            ) : (
              'سجل المبيعات فارغ في هذه الفترة'
            )}
          </p>
        </div>

        {/* Card 2: Shift Comparison (Morning vs Evening) */}
        <div className="bg-white p-4 rounded-2xl border border-warm-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-stone-600 pb-1 border-b border-warm-100">
            <span>مقارنة أداء الشفتات:</span>
            <span>الصباحي مقابل المسائي</span>
          </div>

          <div className="space-y-1.5">
            {/* Morning Bar */}
            <div>
              <div className="flex justify-between text-xs font-bold text-stone-800">
                <span className="flex items-center gap-1 text-amber-700">
                  <Sun className="w-3.5 h-3.5" /> الصباحي ({metrics.morningOrders} فاتورة):
                </span>
                <span className="font-mono">{metrics.morningRev.toLocaleString()} {storeSettings.currency} ({metrics.morningShare}%)</span>
              </div>
              <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${metrics.morningShare}%` }}
                />
              </div>
            </div>

            {/* Evening Bar */}
            <div>
              <div className="flex justify-between text-xs font-bold text-stone-800">
                <span className="flex items-center gap-1 text-indigo-700">
                  <Moon className="w-3.5 h-3.5" /> المسائي ({metrics.eveningOrders} فاتورة):
                </span>
                <span className="font-mono">{metrics.eveningRev.toLocaleString()} {storeSettings.currency} ({metrics.eveningShare}%)</span>
              </div>
              <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${metrics.eveningShare}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Period Volume Summary */}
        <div className="bg-white p-4 rounded-2xl border border-warm-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-stone-600 pb-1 border-b border-warm-100">
            <span>إجمالي مبيعات الفترة:</span>
            <ShoppingBag className="w-4 h-4 text-brand-800" />
          </div>

          <div className="space-y-1 py-1">
            <div className="text-2xl font-mono font-black text-brand-900">
              {metrics.totalRevenue.toLocaleString()}{' '}
              <span className="text-xs font-normal text-stone-500">{storeSettings.currency}</span>
            </div>
            <div className="text-xs text-stone-600 font-semibold flex justify-between">
              <span>عدد الفواتير: <strong className="text-stone-900 font-mono">{metrics.totalOrders}</strong></span>
              <span>متوسط الفاتورة: <strong className="text-emerald-800 font-mono">{metrics.avgTicket.toLocaleString()} {storeSettings.currency}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Hourly Heatmap & Distribution Bars */}
      <div className="bg-white p-4 rounded-2xl border border-warm-200 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-warm-100">
          <div>
            <h3 className="font-black text-brand-900 text-sm sm:text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-800" />
              <span>مخطط النشاط الساعي وتوزيع المبيعات (08:00 صباحاً - 02:00 بعد منتصف الليل)</span>
            </h3>
            <p className="text-[11px] text-stone-500">
              حجم الإيراد وعدد الطلبات لكل ساعة على مدار اليوم مع تمييز ساعات الذروة
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 text-[11px] font-bold">
            <span className="flex items-center gap-1 text-rose-700">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
              <span>ذروة قصوى (🔥)</span>
            </span>
            <span className="flex items-center gap-1 text-amber-800">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>نشاط مرتفع (⚡)</span>
            </span>
            <span className="flex items-center gap-1 text-stone-500">
              <span className="w-2.5 h-2.5 rounded-full bg-stone-300" />
              <span>هدوء نسبي</span>
            </span>
          </div>
        </div>

        {/* Hourly Rows */}
        <div className="space-y-2 pt-1">
          {hourlyData.map((slot) => {
            const isPeak = slot.heatLevel === 'peak';
            const isActive = slot.heatLevel === 'active';

            return (
              <div
                key={slot.hour}
                className={`p-2.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                  isPeak
                    ? 'bg-rose-50/70 border-rose-300 shadow-2xs'
                    : isActive
                    ? 'bg-amber-50/50 border-amber-200'
                    : 'bg-warm-50/50 border-warm-200/60'
                }`}
              >
                {/* Hour Label & Heat Tag */}
                <div className="flex items-center gap-2 min-w-[140px]">
                  <span className="font-mono font-black text-xs text-stone-800 bg-white px-2 py-1 rounded-lg border border-warm-200 shadow-2xs">
                    {slot.label}
                  </span>
                  {isPeak && (
                    <span className="text-[10px] bg-rose-600 text-white px-2 py-0.2 rounded-full font-black flex items-center gap-0.5 animate-pulse">
                      <Flame className="w-3 h-3" />
                      <span>ذروة</span>
                    </span>
                  )}
                  {isActive && (
                    <span className="text-[10px] bg-amber-500 text-stone-950 px-1.5 py-0.2 rounded-full font-bold">
                      نشط ⚡
                    </span>
                  )}
                </div>

                {/* Relative Bar */}
                <div className="flex-1 mx-0 sm:mx-3">
                  <div className="w-full h-3.5 bg-stone-100 rounded-full overflow-hidden border border-stone-200/60 p-0.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isPeak
                          ? 'bg-gradient-to-r from-rose-500 to-rose-600'
                          : isActive
                          ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                          : 'bg-stone-300'
                      }`}
                      style={{ width: `${Math.max(slot.pctOfMax, slot.count > 0 ? 5 : 0)}%` }}
                    />
                  </div>
                </div>

                {/* Stats Numbers */}
                <div className="flex items-center gap-4 text-xs shrink-0 justify-between sm:justify-end">
                  <div className="text-right">
                    <span className="text-stone-500 text-[10px] ml-1">الطلبات:</span>
                    <span className="font-mono font-bold text-stone-900">{slot.count}</span>
                  </div>

                  <div className="text-right min-w-[110px]">
                    <span className="text-stone-500 text-[10px] ml-1">الإيراد:</span>
                    <span
                      className={`font-mono font-black ${
                        isPeak
                          ? 'text-rose-700'
                          : isActive
                          ? 'text-amber-900'
                          : 'text-stone-700'
                      }`}
                    >
                      {slot.totalRevenue.toLocaleString()} {storeSettings.currency}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Operational Smart Insights for Bakery Management */}
      <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-brand-900 text-white p-4 rounded-2xl shadow-md flex items-start gap-3">
        <Sparkles className="w-6 h-6 text-gold-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs leading-relaxed">
          <h4 className="font-black text-sm text-gold-300">
            توصيات تشغيلية ذكية لإدارة محل ومخبوزات مسك وزعفران:
          </h4>
          <p className="text-warm-100">
            • <strong>تجهيز الفترينة والكيك:</strong> تتركز حركة الذروة والطلبيات العائلية عادةً بين الساعة <strong>06:00 مساءً حتى 10:30 مساءً</strong>. يُنصح بأن تكون كافة قوالب الكيك المحجوزة جاهزة في الثلاجات قبل الساعة 05:00 عصراً لتفادي أي ارتباك في المعمل.
          </p>
          <p className="text-warm-100">
            • <strong>توزيع كادر العمل:</strong> نظراً لأن الشفت المسائي يحقق نسبة{' '}
            <span className="text-gold-300 font-bold font-mono">%{metrics.eveningShare}</span> من المبيعات، يُوصى بوجود كادرين في قسم التزيين وتسليم الحجوزات خلال ساعات المساء.
          </p>
        </div>
      </div>
    </div>
  );
}

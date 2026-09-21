import React, { useState } from 'react';
import {
  Wallet,
  TrendingUp,
  Receipt,
  RotateCcw,
  Printer,
  History,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { ZReportConfirmationModal } from './ZReportConfirmationModal';

export function TreasuryModule() {
  const {
    dailyTreasury,
    currentSession,
    zReportsHistory,
    triggerPrint,
    storeSettings,
  } = usePOS();

  const [isZModalOpen, setIsZModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('summary'); // summary, today_sales, today_expenses, past_zreports

  const {
    directSales,
    collectedDeposits,
    dailyExpenses,
    netCash,
    sessionSales,
    sessionExpenses,
    salesCount,
    expensesCount,
  } = dailyTreasury;

  const totalInflows = directSales + collectedDeposits;

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

        {/* Prominent "إغلاق اليومية وتصفير الصندوق" Button */}
        <button
          onClick={() => setIsZModalOpen(true)}
          className="bg-brand-800 hover:bg-brand-900 text-white font-black px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-brand-900/20 hover:shadow-xl transition-all cursor-pointer active:scale-98 border border-gold-500/30"
        >
          <RotateCcw className="w-4 h-4 text-gold-400" />
          <span>إغلاق اليومية وتصفير الصندوق</span>
        </button>
      </div>

      {/* Dynamic Financial KPI Cards */}
      <div className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
              من {salesCount} عملية بيع نشطة اليوم
            </div>
          </div>
        </div>

        {/* 2. Total Collected Deposits (itemized from عربون حجز) */}
        <div className="bg-white p-3.5 rounded-2xl border border-emerald-200 bg-gradient-to-b from-emerald-50/30 to-white shadow-xs hover:border-emerald-400 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800">2. مقبوضات العربون:</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <span className="text-xs font-bold">💵</span>
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
              مفصلة من حجوزات وعرابين الكيك
            </div>
          </div>
        </div>

        {/* 3. Total Daily Expenses */}
        <div className="bg-white p-3.5 rounded-2xl border border-rose-200 bg-gradient-to-b from-rose-50/30 to-white shadow-xs hover:border-rose-400 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800">3. صرفيات اليومية:</span>
            <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
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
              من {expensesCount} سند صرف مسجل اليوم
            </div>
          </div>
        </div>

        {/* 4. Net Cash in Drawer = (Direct Sales + Deposits) - Daily Expenses */}
        <div className="bg-brand-900 text-white p-3.5 rounded-2xl shadow-md border-2 border-gold-500/50 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gold-300">4. صافي النقد في الصندوق:</span>
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
              = (المبيعات + العربون) - الصرفيات
            </div>
          </div>
        </div>
      </div>

      {/* Internal Navigation Subtabs */}
      <div className="px-3 sm:px-4 bg-white border-b border-warm-200/80 flex items-center gap-2 overflow-x-auto">
        {[
          { id: 'summary', label: 'معادلة الميزانية والخلاصة 🧮' },
          { id: 'today_sales', label: `فواتير مبيعات اليومية (${salesCount}) 🧾` },
          { id: 'today_expenses', label: `سندات صرف اليومية (${expensesCount}) 💸` },
          { id: 'past_zreports', label: `أرشيف إغلاقات Z السابقة (${zReportsHistory.length}) 🗄️` },
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
                📌 <strong>ملاحظة هامة:</strong> زر "إغلاق اليومية وتصفير الصندوق" يقوم تلقائياً بإنشاء تقرير Z شامل، وإرساله للطباعة الحرارية 72.1mm، ثم يعيد تعيين عداد المبيعات والصرفيات للصفر لبداية وردية جديدة، مع حفظ كل المبيعات في سجل تاريخي آمن.
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

        {/* TAB 3: Today's Expenses */}
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

        {/* TAB 4: Past Z-Reports History */}
        {activeTab === 'past_zreports' && (
          <div className="bg-white rounded-2xl border border-warm-200 overflow-hidden shadow-xs">
            <table className="w-full text-right text-xs">
              <thead className="bg-warm-100 font-bold text-stone-700 border-b border-warm-200">
                <tr>
                  <th className="py-2.5 px-3">رقم تقرير Z</th>
                  <th className="py-2.5 px-3">وقت الإغلاق</th>
                  <th className="py-2.5 px-3">المبيعات</th>
                  <th className="py-2.5 px-3">العربون</th>
                  <th className="py-2.5 px-3">الصرفيات</th>
                  <th className="py-2.5 px-3">صافي الصندوق</th>
                  <th className="py-2.5 px-3">المسؤول</th>
                  <th className="py-2.5 px-3 text-center">إعادة طباعة Z</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-warm-100">
                {zReportsHistory.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-8 text-center text-stone-400 font-bold">
                      لا توجد إغلاقات Z مؤرشفة بعد. سيتم أرشفة أول تقرير عند تصفير الصندوق.
                    </td>
                  </tr>
                ) : (
                  zReportsHistory.map((rep) => (
                    <tr key={rep.id} className="hover:bg-warm-50/60">
                      <td className="py-2.5 px-3 font-mono font-bold text-brand-900">
                        {rep.reportNo}
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
                        <button
                          onClick={() => triggerPrint('zreport', rep)}
                          title="إعادة طباعة تقرير Z"
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
      </div>

      {/* Confirmation Dialog */}
      <ZReportConfirmationModal
        isOpen={isZModalOpen}
        onClose={() => setIsZModalOpen(false)}
      />
    </div>
  );
}

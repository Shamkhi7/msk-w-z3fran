import React, { useState } from 'react';
import {
  X,
  Check,
  AlertTriangle,
  Printer,
  RotateCcw,
  ShieldCheck,
  HardDrive,
  Download,
  CheckCircle2,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import { numberToArabicWords } from '../../utils/arabicNumberToWords';

export function ZReportConfirmationModal({ isOpen, onClose }) {
  const {
    dailyTreasury,
    closeDayAndResetDrawer,
    storeSettings,
    printXReport,
    exportSystemData,
    lastBackupAt,
  } = usePOS();

  const {
    directSales = 0,
    salesReturnsTotal = 0,
    collectedDeposits = 0,
    dailyExpenses = 0,
    netCash = 0,
  } = dailyTreasury || {};

  const [closingNotes, setClosingNotes] = useState('');
  const [backupDownloaded, setBackupDownloaded] = useState(false);

  if (!isOpen) return null;

  const handleDownloadBackup = async () => {
    await exportSystemData();
    setBackupDownloaded(true);
  };

  const handleConfirmClose = () => {
    closeDayAndResetDrawer(closingNotes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-fade-in select-none">
      <div className="bg-[#FAF8F5] border-2 border-brand-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="bg-brand-900 text-white px-5 py-4 flex items-center justify-between border-b border-gold-500/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gold-500 text-brand-950 flex items-center justify-center font-bold">
              Z
            </div>
            <div>
              <h3 className="font-black text-base">إغلاق الوردية وتصفير الصندوق اليومي</h3>
              <p className="text-[10px] text-warm-200">Daily Z-Report & Drawer Reset</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-warm-200 hover:text-white p-1 rounded-lg hover:bg-brand-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Warning Banner */}
          <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-2.5 text-amber-900">
            <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <strong>تأكيد العملية:</strong> تم التحقق من رمز تأكيد المدير بنجاح. عند المتابعة، سيتم تصفير عدادات المبيعات، المردودات، والصرفيات النشطة للوردية الحالية لبدء يوم جديد، مع <strong>طباعة تقرير Z تلقائياً</strong> وأرشفة الأرقام دون حذف الفواتير التاريخية.
            </div>
          </div>

          {/* Financial Summary Box */}
          <div className="bg-white p-4 rounded-2xl border border-warm-300 space-y-2.5 shadow-xs">
            <div className="text-xs font-bold text-stone-500 text-center pb-1 border-b border-stone-200">
              ملخص الحسابات النهائية للإغلاق
            </div>

            <div className="space-y-1.5 text-xs text-stone-700">
              <div className="flex justify-between">
                <span>المبيعات المباشرة:</span>
                <span className="font-mono font-bold text-stone-900">
                  {directSales.toLocaleString()} {storeSettings.currency}
                </span>
              </div>

              {salesReturnsTotal > 0 && (
                <div className="flex justify-between text-rose-700 font-bold">
                  <span>مردود ومسترجع مبيعات (-):</span>
                  <span className="font-mono">
                    -{salesReturnsTotal.toLocaleString()} {storeSettings.currency}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-emerald-800">
                <span>مقبوضات العربون (مفصلة):</span>
                <span className="font-mono font-bold">
                  +{collectedDeposits.toLocaleString()} {storeSettings.currency}
                </span>
              </div>

              <div className="flex justify-between text-rose-800">
                <span>إجمالي الصرفيات اليومية:</span>
                <span className="font-mono font-bold">
                  -{dailyExpenses.toLocaleString()} {storeSettings.currency}
                </span>
              </div>

              {/* Net Cash Box */}
              <div className="pt-2 border-t-2 border-stone-800 flex items-center justify-between text-sm sm:text-base font-black">
                <span className="text-brand-900">صافي النقد الفعلي بالصندوق:</span>
                <div className="font-mono text-xl sm:text-2xl text-emerald-800">
                  {netCash.toLocaleString()}{' '}
                  <span className="text-xs font-sans font-normal text-stone-600">
                    {storeSettings.currency}
                  </span>
                </div>
              </div>

              <div className="text-[10px] text-stone-600 italic text-center pt-1">
                {numberToArabicWords(netCash, storeSettings.currency === 'د.ع' ? 'دينار عراقي' : storeSettings.currency)}
              </div>
            </div>
          </div>

          {/* Backup Reminder Banner */}
          <div
            className={`p-3.5 rounded-2xl border transition-all ${
              backupDownloaded
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : 'bg-amber-50 border-amber-300 text-amber-950'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <HardDrive
                  className={`w-5 h-5 mt-0.5 shrink-0 ${
                    backupDownloaded ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                />
                <div>
                  <div className="font-black text-xs sm:text-sm">
                    {backupDownloaded
                      ? 'تم حفظ النسخة الاحتياطية بنجاح ✓'
                      : 'تنبيه الحفظ الاحتياطي للبيانات (موصى به)'}
                  </div>
                  <div className="text-[11px] text-stone-600 font-medium mt-0.5">
                    {backupDownloaded
                      ? 'تم تنزيل ملف قاعدة البيانات كاملاً على هذا الجهاز لحماية سجلاتك المالية'
                      : lastBackupAt
                      ? `آخر حفظ احتياطي: ${new Date(lastBackupAt).toLocaleDateString('ar-IQ')} (${new Date(lastBackupAt).toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' })})`
                      : 'يُنصح بشدة بتحميل نسخة احتياطية من البيانات عند إغلاق اليومية لحماية الحسابات من أي عطل'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDownloadBackup}
                className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-xs shrink-0 active:scale-95 ${
                  backupDownloaded
                    ? 'bg-emerald-700 text-white'
                    : 'bg-amber-500 hover:bg-amber-600 text-stone-950 border border-amber-600'
                }`}
              >
                {backupDownloaded ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>تم الحفظ ✓</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>تنزيل نسخة</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Closing Notes */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              ملاحظات الإغلاق أو الاستلام والتسليم:
            </label>
            <input
              type="text"
              value={closingNotes}
              onChange={(e) => setClosingNotes(e.target.value)}
              placeholder="مثال: تم مطابقة النقدية مع الكاشير الصباحي بدون أي نقص..."
              className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-800"
            />
          </div>

          <div className="flex items-center gap-2 text-[11px] text-stone-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>السجلات السابقة وسندات الصرف تظل محفوظة دائمًا في الأرشيف الدائم.</span>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-2 border-t border-stone-200">
            <button
              type="button"
              onClick={() => printXReport()}
              title="معاينة مبيعات اليوم على طابعة الإيصالات دون تصفير الصندوق"
              className="bg-gold-500 hover:bg-gold-400 text-stone-950 font-black py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-98 border border-gold-400"
            >
              <Printer className="w-4 h-4 text-stone-950" />
              <span>طباعة مبيعات اليوم (معاينة)</span>
            </button>
            <button
              onClick={handleConfirmClose}
              className="flex-1 bg-brand-800 hover:bg-brand-900 text-white font-black py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-900/30 transition-all cursor-pointer active:scale-98"
            >
              <Check className="w-4 h-4 text-gold-400" />
              <span>تأكيد الإغلاق وتصفير الصندوق (Z)</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl transition-colors text-xs sm:text-sm cursor-pointer"
            >
              تراجع
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

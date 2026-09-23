import React, { useEffect } from 'react';
import { X, RotateCcw, AlertTriangle, ArrowRightLeft, DollarSign, Calendar, Tag, User } from 'lucide-react';
import { formatArabicDateWithDay } from '../../utils/dateFormatter';

export function UndoExpenseModal({
  isOpen,
  onClose,
  expense,
  onConfirm,
  currency = 'د.ع',
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !expense) return null;

  const formattedAmount = Number(expense.amount || 0).toLocaleString();
  const expenseReason = expense.description || expense.category || 'صرفية متنوعة';

  return (
    <div
      className="fixed inset-0 bg-stone-900/65 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in select-none"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-warm-200 overflow-hidden transform transition-all animate-scale-up"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-transparent border-b border-warm-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-300 shadow-xs">
              <RotateCcw className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-brand-900">
                تأكيد إلغاء سند الصرف
              </h3>
              <p className="text-[11px] text-stone-500">
                سند رقم: <span className="font-mono font-bold text-brand-800">{expense.voucherNo}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            title="إغلاق النافذة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {/* Main User Confirmation Prompt */}
          <div className="bg-amber-50/80 border border-amber-200/90 rounded-xl p-4 text-center">
            <p className="text-stone-800 text-sm leading-relaxed font-semibold">
              هل أنت متأكد من إلغاء سند الصرف لمبلغ (
              <span className="text-rose-700 font-bold font-mono px-1">
                {formattedAmount} {currency}
              </span>
              ) بسبب (
              <span className="text-brand-900 font-bold px-1">
                {expenseReason}
              </span>
              )؟ سيتم إعادة المبلغ تلقائياً إلى الصندوق.
            </p>
          </div>

          {/* Detailed Summary Card */}
          <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200 text-xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-stone-200/80 pb-2">
              <span className="text-stone-500 flex items-center gap-1.5 font-medium">
                <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-600" />
                <span>المبلغ المسترجع للصندوق:</span>
              </span>
              <span className="font-mono font-black text-sm text-emerald-700">
                + {formattedAmount} {currency}
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-stone-200/80 pb-2">
              <span className="text-stone-500 flex items-center gap-1.5 font-medium">
                <Tag className="w-3.5 h-3.5 text-stone-400" />
                <span>التصنيف:</span>
              </span>
              <span className="font-bold text-stone-800 bg-stone-200/70 px-2 py-0.5 rounded-md">
                {expense.category}
              </span>
            </div>

            {expense.description && (
              <div className="flex items-start justify-between border-b border-stone-200/80 pb-2">
                <span className="text-stone-500 flex items-center gap-1.5 font-medium shrink-0">
                  <span>البيان:</span>
                </span>
                <span className="font-medium text-stone-800 text-left max-w-[240px] truncate" title={expense.description}>
                  {expense.description}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between border-b border-stone-200/80 pb-2">
              <span className="text-stone-500 flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                <span>تاريخ ووقت السند:</span>
              </span>
              <span className="font-mono text-stone-700">
                {formatArabicDateWithDay(expense.date)} • {new Date(expense.date).toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-stone-500 flex items-center gap-1.5 font-medium">
                <User className="w-3.5 h-3.5 text-stone-400" />
                <span>المسجل والشفت:</span>
              </span>
              <span className="font-semibold text-stone-700">
                {expense.recordedBy || 'كاشير'} ({expense.shiftType || 'صباحي'})
              </span>
            </div>
          </div>

          {/* Safety Notice */}
          <div className="flex items-center gap-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-800 font-bold">
            <span className="text-base">✓</span>
            <span>
              إلغاء السند سيزيد "صافي النقد بالصندوق" ويخفض "إجمالي صرفيات الوردية" فوراً دون الحاجة لإعادة تحميل الصفحة.
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-stone-50 border-t border-warm-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 bg-stone-200 hover:bg-stone-300 active:scale-98 text-stone-700 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer text-center"
          >
            إلغاء
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 active:scale-98 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
          >
            <RotateCcw className="w-4 h-4" />
            <span>تأكيد الإلغاء</span>
          </button>
        </div>
      </div>
    </div>
  );
}

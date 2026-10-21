import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Banknote,
  CreditCard,
  ArrowLeftRight,
  Clock,
  User,
  Calendar,
  AlertCircle,
  CheckCircle2,
  History,
  Info,
  Check,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';

export function EditSalePaymentModal() {
  const {
    saleToEdit,
    closeEditSaleModal,
    updateSalePaymentMethod,
    storeSettings,
    isManager,
  } = usePOS();

  const [selectedMethod, setSelectedMethod] = useState('نقداً');
  const [note, setNote] = useState('');
  const [showAuditHistory, setShowAuditHistory] = useState(false);

  // Sync state whenever saleToEdit changes
  useEffect(() => {
    if (saleToEdit) {
      const currentMethod = saleToEdit.paymentMethod || 'نقداً';
      const isCard =
        String(currentMethod).includes('بطاقة') ||
        String(currentMethod).includes('إلكتروني') ||
        String(currentMethod).includes('card') ||
        String(currentMethod).includes('qi');
      setSelectedMethod(isCard ? 'بطاقة إلكترونية' : 'نقداً');
      setNote(saleToEdit.editNote || '');
      setShowAuditHistory(false);
    }
  }, [saleToEdit]);

  if (!isManager || !saleToEdit) return null;

  const currentMethod = saleToEdit.paymentMethod || 'نقداً';
  const isCurrentCard =
    String(currentMethod).includes('بطاقة') ||
    String(currentMethod).includes('إلكتروني') ||
    String(currentMethod).includes('card') ||
    String(currentMethod).includes('qi');
  const normalizedCurrent = isCurrentCard ? 'بطاقة إلكترونية' : 'نقداً';

  const isMethodChanged = selectedMethod !== normalizedCurrent;

  const handleSave = () => {
    updateSalePaymentMethod(
      saleToEdit.id,
      selectedMethod,
      note.trim() || (isMethodChanged ? 'تصحيح خطأ إدخال كاشير' : 'تحديث ملاحظة الفاتورة')
    );
  };

  const formattedDate = saleToEdit.date
    ? new Date(saleToEdit.date).toLocaleDateString('ar-IQ', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';

  const formattedTime = saleToEdit.date
    ? new Date(saleToEdit.date).toLocaleTimeString('ar-IQ', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs select-none animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeEditSaleModal();
      }}
    >
      <div className="bg-[#FAF8F5] border border-stone-300 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[92vh] animate-scale-up">
        {/* Header */}
        <div className="bg-brand-900 text-warm-50 px-5 py-3.5 flex items-center justify-between border-b border-gold-500/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gold-500/20 text-gold-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-wide text-white flex items-center gap-2">
                <span>تعديل الفاتورة / طريقة الدفع</span>
                <span className="bg-gold-500/25 text-gold-300 border border-gold-500/40 text-[10px] px-2 py-0.5 rounded-full font-bold">
                  صلاحية المدير العام
                </span>
              </h3>
              <p className="text-[11px] text-warm-200">
                تصحيح القيود المالية وإعادة ضبط ميزانية الخزينة والكاش
              </p>
            </div>
          </div>
          <button
            onClick={closeEditSaleModal}
            className="text-warm-300 hover:text-white p-1 rounded-lg hover:bg-brand-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-3.5 flex-1 text-right text-xs">
          {/* 1. Sale Information Card */}
          <div className="bg-white border border-warm-200 rounded-xl p-3.5 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between border-b border-warm-100 pb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-brand-900 text-sm">
                  {saleToEdit.receiptNo}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    saleToEdit.shiftType === 'مسائي'
                      ? 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                      : 'bg-amber-100 text-amber-900 border border-amber-200'
                  }`}
                >
                  {saleToEdit.shiftType === 'مسائي' ? 'وردية مسائية 🌙' : 'وردية صباحية ☀️'}
                </span>
                {saleToEdit.editedBy && (
                  <span className="bg-blue-100 text-blue-800 border border-blue-200 text-[10px] px-1.5 py-0.2 rounded font-bold">
                    مُعدّلة سابقاً
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-stone-500 text-[11px] font-mono">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                <span>{formattedTime}</span>
                <span>•</span>
                <span>{formattedDate}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center gap-1.5 text-stone-600">
                <User className="w-3.5 h-3.5 text-stone-400" />
                <span>الزبون:</span>
                <strong className="text-stone-800">{saleToEdit.customerName || 'زبون عام'}</strong>
              </div>
              <div className="flex items-center gap-1.5 text-stone-600">
                <span>الكاشير:</span>
                <strong className="text-stone-800">{saleToEdit.cashierName || 'كاشير'}</strong>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-warm-100">
              <div className="flex items-center gap-1.5">
                <span className="text-stone-600 font-bold">طريقة الدفع الحالية:</span>
                <span
                  className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                    isCurrentCard
                      ? 'bg-blue-100 text-blue-900 border border-blue-200'
                      : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                  }`}
                >
                  {isCurrentCard ? 'بطاقة / دفع إلكتروني 💳' : 'نقداً / كاش 💵'}
                </span>
              </div>
              <div className="text-left">
                <span className="text-stone-500 text-[10px] block">المبلغ الصافي:</span>
                <span className="font-mono font-black text-brand-900 text-base">
                  {Number(saleToEdit.netTotal || 0).toLocaleString()} {storeSettings.currency}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Payment Method Switcher */}
          <div className="space-y-2">
            <label className="block font-bold text-stone-800 text-xs">
              اختر طريقة الدفع الصحيحة للفاتورة:
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {/* Cash Button */}
              <button
                type="button"
                onClick={() => setSelectedMethod('نقداً')}
                className={`p-3 rounded-xl border-2 text-right transition-all flex flex-col justify-between cursor-pointer ${
                  selectedMethod === 'نقداً'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-xs ring-2 ring-emerald-500/20'
                    : 'border-stone-200 bg-white text-stone-700 hover:border-emerald-300 hover:bg-emerald-50/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        selectedMethod === 'نقداً'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      <Banknote className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-xs">نقدي / كاش 💵</span>
                  </div>
                  {selectedMethod === 'نقداً' && (
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-stone-500 leading-tight">
                  يُحتسب مباشرة ضمن نقدية القاصة (صافي كاش الصندوق)
                </p>
              </button>

              {/* Card Button */}
              <button
                type="button"
                onClick={() => setSelectedMethod('بطاقة إلكترونية')}
                className={`p-3 rounded-xl border-2 text-right transition-all flex flex-col justify-between cursor-pointer ${
                  selectedMethod === 'بطاقة إلكترونية'
                    ? 'border-blue-600 bg-blue-50 text-blue-950 shadow-xs ring-2 ring-blue-500/20'
                    : 'border-stone-200 bg-white text-stone-700 hover:border-blue-300 hover:bg-blue-50/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        selectedMethod === 'بطاقة إلكترونية'
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-xs">بطاقة / دفع إلكتروني 💳</span>
                  </div>
                  {selectedMethod === 'بطاقة إلكترونية' && (
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-stone-500 leading-tight">
                  Mastercard / Qi - معزول تماماً عن كاش الصندوق
                </p>
              </button>
            </div>
          </div>

          {/* 3. Real-Time Financial Ledger Adjustment Alert Box */}
          {isMethodChanged ? (
            selectedMethod === 'بطاقة إلكترونية' ? (
              <div className="p-3 bg-blue-50/90 border-2 border-blue-300 rounded-xl text-blue-950 text-xs space-y-1 animate-fade-in shadow-2xs">
                <div className="flex items-center gap-2 font-bold text-blue-900">
                  <ArrowLeftRight className="w-4 h-4 text-blue-700 shrink-0" />
                  <span>تأثير التحويل المحاسبي الفوري (نقدي ⬅️ بطاقة إلكترونية):</span>
                </div>
                <p className="text-[11px] leading-relaxed text-blue-900 pr-6">
                  سيتم <strong>خصم {Number(saleToEdit.netTotal || 0).toLocaleString()} {storeSettings.currency}</strong> فوراً من <u>صافي النقد بالصندوق (الكاش الفعلي)</u> وترحيلها إلى <u>مقبوضات الدفع الإلكتروني</u>.
                  هذا يضمن استبعاد المبلغ من جرد القاصة الفعلي ومنع حدوث أي نقص أو عجز وهمي عند مطابقة الكاش بنهاية الوردية.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50/90 border-2 border-emerald-300 rounded-xl text-emerald-950 text-xs space-y-1 animate-fade-in shadow-2xs">
                <div className="flex items-center gap-2 font-bold text-emerald-900">
                  <ArrowLeftRight className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>تأثير التحويل المحاسبي الفوري (بطاقة ⬅️ نقدي / كاش):</span>
                </div>
                <p className="text-[11px] leading-relaxed text-emerald-900 pr-6">
                  سيتم <strong>إعادة إضافة {Number(saleToEdit.netTotal || 0).toLocaleString()} {storeSettings.currency}</strong> فوراً إلى <u>صافي النقد بالصندوق (الكاش الفعلي)</u> وخصمها من <u>المقبوضات الإلكترونية</u> لمطابقة الجرد الفعلي اليدوي للقاصة.
                </p>
              </div>
            )
          ) : (
            <div className="p-2.5 bg-stone-100 border border-stone-200 rounded-xl text-stone-600 text-[11px] flex items-center gap-2">
              <Info className="w-4 h-4 text-stone-500 shrink-0" />
              <span>طريقة الدفع المختارة مطابقة لطريقة الدفع الحالية للفاتورة. لن يتم تعديل أرصدة الخزينة ما لم تقم بتغيير طريقة الدفع.</span>
            </div>
          )}

          {/* 4. Manager Note Input */}
          <div className="space-y-1.5">
            <label className="block font-bold text-stone-700 text-xs">
              سبب التعديل وملاحظة التدقيق (اختياري):
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="مثال: تصحيح خطأ إدخال كاشير - الزبون دفع بالبطاقة"
              className="w-full bg-white border border-stone-300 rounded-xl px-3 py-2 text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-brand-800/40 focus:border-brand-800"
            />
          </div>

          {/* 5. Audit Trail History (if any edits were performed) */}
          {saleToEdit.auditLog && saleToEdit.auditLog.length > 0 && (
            <div className="border border-warm-200 rounded-xl p-2.5 bg-warm-50/50 space-y-2">
              <button
                type="button"
                onClick={() => setShowAuditHistory(!showAuditHistory)}
                className="w-full flex items-center justify-between text-[11px] font-bold text-stone-700 cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-stone-500" />
                  <span>سجل التدقيق والتعديلات السابقة ({saleToEdit.auditLog.length})</span>
                </div>
                <span className="text-[10px] text-brand-800">
                  {showAuditHistory ? 'إخفاء' : 'عرض'}
                </span>
              </button>

              {showAuditHistory && (
                <div className="space-y-1.5 pt-1 border-t border-warm-200">
                  {saleToEdit.auditLog.map((log, index) => (
                    <div
                      key={log.id || index}
                      className="text-[10px] bg-white p-2 rounded-lg border border-stone-200 space-y-0.5 text-stone-600"
                    >
                      <div className="flex items-center justify-between font-bold text-stone-800">
                        <span>
                          تحويل من ({log.from}) إلى ({log.to})
                        </span>
                        <span className="font-mono text-stone-400">
                          {log.timestamp
                            ? new Date(log.timestamp).toLocaleTimeString('ar-IQ', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : ''}
                        </span>
                      </div>
                      {log.note && <div className="text-stone-500">الملاحظة: {log.note}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-stone-200 flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 bg-brand-800 hover:bg-brand-900 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-gold-400" />
            <span>حفظ التعديل وتحديث الخزينة فوراً</span>
          </button>
          <button
            type="button"
            onClick={closeEditSaleModal}
            className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium py-2.5 px-4 rounded-xl transition-colors text-xs cursor-pointer"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}

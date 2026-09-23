import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, Trash2, Lock, Delete, RotateCcw } from 'lucide-react';
import { usePOS } from '../../context/POSContext';

export function DeleteShiftRecordModal({
  isOpen,
  onClose,
  shiftRecord,
  onConfirmDelete,
}) {
  const { storeSettings } = usePOS();
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const expectedManagerPin = String(storeSettings.managerPin || '1234').trim();

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setErrorMsg('');
    }
  }, [isOpen]);

  // Physical keyboard listener for PIN entry
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key >= '0' && e.key <= '9') {
        if (pin.length < 8) {
          setPin((prev) => prev + e.key);
          setErrorMsg('');
        }
      } else if (e.key === 'Backspace') {
        setPin((prev) => prev.slice(0, -1));
        setErrorMsg('');
      } else if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleVerifyAndConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, pin, expectedManagerPin]);

  if (!isOpen || !shiftRecord) return null;

  const handleKeyPress = (num) => {
    if (pin.length < 8) {
      setPin((prev) => prev + num);
      setErrorMsg('');
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleClear = () => {
    setPin('');
    setErrorMsg('');
  };

  const handleVerifyAndConfirm = (e) => {
    if (e) e.preventDefault();

    if (String(pin).trim() === expectedManagerPin) {
      onConfirmDelete(shiftRecord);
      onClose();
    } else {
      setErrorMsg('رمز المدير غير صحيح');
      setPin('');
    }
  };

  const recordNo = shiftRecord.shiftNo || shiftRecord.reportNo || shiftRecord.id;
  const recordDate = shiftRecord.closedAt
    ? `${new Date(shiftRecord.closedAt).toLocaleDateString('ar-IQ')} - ${new Date(shiftRecord.closedAt).toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' })}`
    : 'تاريخ غير محدد';
  const recordCash = Number(shiftRecord.netCash || 0).toLocaleString();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-fade-in select-none"
      dir="rtl"
    >
      <div className="bg-[#FAF8F5] border-2 border-rose-800 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col animate-scale-up">
        {/* Danger Header */}
        <div className="bg-rose-800 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-900 flex items-center justify-center text-amber-300">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base">تأكيد حذف سجل اليومية (المدير فقط)</h3>
              <p className="text-[10px] text-rose-200">إجراء أمني حساس لا يمكن التراجع عنه</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-rose-200 hover:text-white p-1.5 rounded-lg hover:bg-rose-900/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto max-h-[85vh]">
          {/* Target Record Info Box */}
          <div className="bg-white p-3 rounded-2xl border border-warm-300 text-xs space-y-1 shadow-2xs">
            <div className="flex justify-between font-bold">
              <span className="text-stone-500">رقم الوردية / Z:</span>
              <span className="font-mono text-brand-900 font-black">{recordNo}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span className="text-stone-500">وقت الإغلاق:</span>
              <span className="font-mono text-stone-700">{recordDate}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span className="text-stone-500">صافي الصندوق المسجل:</span>
              <span className="font-mono text-rose-700 font-black">
                {recordCash} {storeSettings.currency}
              </span>
            </div>
          </div>

          {/* Prominent Warning Text */}
          <div className="p-3.5 bg-rose-50 border-2 border-rose-300 rounded-2xl text-rose-950 text-xs leading-relaxed font-bold">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-rose-900 font-black block mb-1">
                  تأكيد حذف اليومية:
                </span>
                هل أنت متأكد من حذف سجل هذه اليومية بالكامل؟ هذا الإجراء سيحذف كافة بيانات المبيعات والصندوق المرتبطة بهذا التاريخ ولا يمكن التراجع عنه.
              </div>
            </div>
          </div>

          {/* Manager PIN Authentication */}
          <div className="space-y-2 bg-stone-100 p-3.5 rounded-2xl border border-stone-300 text-center">
            <div className="text-xs font-bold text-stone-700 flex items-center justify-center gap-1.5">
              <Lock className="w-4 h-4 text-brand-800" />
              <span>أدخل رمز المدير العام (Manager PIN) للتفويض:</span>
            </div>

            {/* PIN Dots display */}
            <div className="flex justify-center items-center gap-2 py-1.5">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                    pin.length > idx
                      ? 'bg-rose-800 border-rose-800 scale-110'
                      : 'bg-white border-stone-400'
                  }`}
                />
              ))}
            </div>

            {/* Hidden password input for keyboard typists */}
            <form onSubmit={handleVerifyAndConfirm}>
              <input
                type="password"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setErrorMsg('');
                }}
                autoFocus
                className="w-full text-center text-lg font-mono tracking-widest bg-white border border-stone-300 rounded-xl py-1.5 focus:outline-none focus:ring-2 focus:ring-rose-800"
                placeholder="••••"
              />
            </form>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-2 bg-rose-100 border border-rose-300 rounded-xl text-rose-800 text-xs font-bold animate-shake">
                {errorMsg}
              </div>
            )}

            {/* Numeric Touch Keypad */}
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleKeyPress(num)}
                  className="py-2.5 bg-white hover:bg-stone-50 active:bg-rose-100 text-stone-800 font-mono font-bold text-base rounded-xl border border-stone-300 shadow-2xs transition-colors cursor-pointer"
                >
                  {num}
                </button>
              ))}

              <button
                type="button"
                onClick={handleClear}
                className="py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                مسح
              </button>

              <button
                type="button"
                onClick={() => handleKeyPress('0')}
                className="py-2.5 bg-white hover:bg-stone-50 active:bg-rose-100 text-stone-800 font-mono font-bold text-base rounded-xl border border-stone-300 shadow-2xs transition-colors cursor-pointer"
              >
                0
              </button>

              <button
                type="button"
                onClick={handleBackspace}
                className="py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-700 flex items-center justify-center rounded-xl transition-colors cursor-pointer"
              >
                <Delete className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleVerifyAndConfirm}
              className="flex-1 bg-rose-700 hover:bg-rose-800 active:scale-98 text-white font-black py-3 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-rose-200" />
              <span>تأكيد الحذف النهائي</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl transition-colors text-xs sm:text-sm cursor-pointer border border-stone-300"
            >
              إلغاء الأمر
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

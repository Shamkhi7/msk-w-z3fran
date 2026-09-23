import React, { useState } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Lock,
  Unlock,
  X,
  Sun,
  Moon,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';

export function RoleSwitchModal({ isOpen, onClose }) {
  const {
    userRole,
    activeCashier,
    setActiveCashier,
    cashierProfiles,
    switchRole,
    isManager,
    activeShiftType,
    switchShift,
    printShiftHandover,
  } = usePOS();

  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [pendingShiftSwitch, setPendingShiftSwitch] = useState(null); // 'صباحي' | 'مسائي' | null

  if (!isOpen) return null;

  const handleCashierSelect = (name) => {
    setActiveCashier(name);
  };

  const handleShiftClick = (targetShift) => {
    if (targetShift === activeShiftType) return;
    setPendingShiftSwitch(targetShift);
  };

  const handleConfirmShiftSwitch = () => {
    if (pendingShiftSwitch) {
      switchShift(pendingShiftSwitch);
      setPendingShiftSwitch(null);
    }
  };

  const handleManagerLogin = (e) => {
    e.preventDefault();
    setErrorMsg('');
    const res = switchRole('manager', pin);
    if (res.success) {
      setPin('');
      onClose();
    } else {
      setErrorMsg(res.message || 'رمز المرور غير صحيح');
      setPin('');
    }
  };

  const handleLockToCashier = () => {
    switchRole('cashier');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none">
      <div className="bg-[#FAF8F5] border border-stone-300 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col relative">
        {/* Header */}
        <div className="bg-brand-800 text-warm-50 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {isManager ? (
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            ) : (
              <Shield className="w-5 h-5 text-gold-400" />
            )}
            <h3 className="font-bold text-sm tracking-wide">
              {isManager ? 'إدارة الورديات والصلاحيات (وضع المدير)' : 'تبديل الشفت والمستخدم والصلاحيات'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-warm-200 hover:text-white p-1 rounded-lg hover:bg-brand-900/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Shift Selection Section */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-stone-800 flex items-center gap-1.5">
                <span>وردية العمل النشطة (الشفت):</span>
              </label>
              <button
                type="button"
                onClick={() => printShiftHandover(activeShiftType)}
                title="طباعة وصل ملخص تسليم عهدة الشفت الحالي (72.1mm)"
                className="text-[11px] font-bold text-brand-800 hover:text-brand-950 flex items-center gap-1 bg-brand-100/70 hover:bg-brand-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-brand-700" />
                <span>طباعة ملخص الشفت</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleShiftClick('صباحي')}
                className={`p-3 rounded-xl border-2 flex items-center justify-between text-xs sm:text-sm font-black transition-all cursor-pointer ${
                  activeShiftType === 'صباحي'
                    ? 'border-amber-500 bg-amber-400 text-stone-950 shadow-xs scale-[1.01]'
                    : 'border-stone-200 bg-white text-stone-600 hover:border-amber-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sun className={`w-4 h-4 ${activeShiftType === 'صباحي' ? 'text-stone-950' : 'text-amber-500'}`} />
                  <span>الشفت الصباحي</span>
                </div>
                {activeShiftType === 'صباحي' && (
                  <span className="text-[10px] bg-stone-950 text-amber-400 px-1.5 py-0.5 rounded font-mono font-bold">
                    نشط
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleShiftClick('مسائي')}
                className={`p-3 rounded-xl border-2 flex items-center justify-between text-xs sm:text-sm font-black transition-all cursor-pointer ${
                  activeShiftType === 'مسائي'
                    ? 'border-indigo-700 bg-indigo-600 text-white shadow-xs scale-[1.01]'
                    : 'border-stone-200 bg-white text-stone-600 hover:border-indigo-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Moon className={`w-4 h-4 ${activeShiftType === 'مسائي' ? 'text-indigo-200' : 'text-indigo-600'}`} />
                  <span>الشفت المسائي</span>
                </div>
                {activeShiftType === 'مسائي' && (
                  <span className="text-[10px] bg-white text-indigo-900 px-1.5 py-0.5 rounded font-mono font-bold">
                    نشط
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Active Cashier Selection */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-2">
              حساب الكاشير النشط للوردية:
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {cashierProfiles.map((cashier) => (
                <button
                  key={cashier}
                  type="button"
                  onClick={() => handleCashierSelect(cashier)}
                  className={`p-3 rounded-xl border flex items-center justify-between text-sm font-bold transition-all cursor-pointer ${
                    activeCashier === cashier
                      ? 'border-brand-700 bg-brand-50 text-brand-900 shadow-xs'
                      : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <UserCheck className={`w-4 h-4 ${activeCashier === cashier ? 'text-brand-700' : 'text-stone-400'}`} />
                    <span>{cashier}</span>
                  </div>
                  {activeCashier === cashier && (
                    <span className="w-2 h-2 rounded-full bg-brand-700"></span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-stone-200 pt-3">
            {isManager ? (
              /* Already Manager */
              <div className="space-y-3">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div className="text-xs text-emerald-900">
                    <span className="font-bold block text-sm">وضع المدير مفعل حالياً</span>
                    يمكنك تعديل الأسعار، الخصومات، إدارة الأقسام والمنتجات، وتصفير الصندوق.
                  </div>
                </div>

                <button
                  onClick={handleLockToCashier}
                  type="button"
                  className="w-full bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                >
                  <Lock className="w-4 h-4 text-stone-600" />
                  <span>قفل والرجوع لوضع الكاشير المقيد</span>
                </button>
              </div>
            ) : (
              /* Currently Cashier -> Prompt PIN to unlock Manager */
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-700">
                    الترقية إلى وضع المدير الكامل:
                  </span>
                  <span className="text-[11px] text-stone-500 font-mono">الافتراضي: 1234</span>
                </div>

                <form onSubmit={handleManagerLogin} className="space-y-2.5">
                  <div>
                    <input
                      type="password"
                      inputMode="numeric"
                      maxLength={8}
                      placeholder="أدخل رمز مرور المدير (PIN)..."
                      value={pin}
                      onChange={(e) => {
                        setPin(e.target.value);
                        if (errorMsg) setErrorMsg('');
                      }}
                      className="w-full text-center tracking-widest text-lg font-mono font-bold bg-white border border-stone-300 rounded-xl px-4 py-2 focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700"
                    />
                  </div>

                  {errorMsg && (
                    <div className="text-xs text-red-600 font-bold flex items-center justify-center gap-1">
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={!pin}
                      className="flex-1 bg-brand-800 hover:bg-brand-900 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                    >
                      <Unlock className="w-4 h-4 text-gold-400" />
                      <span>تأكيد ودخول وضع المدير</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-stone-100 px-5 py-3 border-t border-stone-200 text-left">
          <button
            onClick={onClose}
            className="text-xs font-bold text-stone-600 hover:text-stone-900 px-3 py-1.5 rounded-lg hover:bg-stone-200 transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>

        {/* Shift Switch Confirmation Dialog */}
        {pendingShiftSwitch && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
            <div className="bg-white border-2 border-brand-800 rounded-2xl shadow-2xl max-w-sm w-full p-5 text-center space-y-4 animate-scale-up">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-black text-base text-stone-900">تأكيد تغيير الشفت</h4>
                <p className="text-sm text-stone-700 mt-2 font-bold leading-relaxed">
                  تأكيد تغيير الشفت: هل أنت متأكد من التحويل إلى ({pendingShiftSwitch === 'مسائي' ? 'الشفت المسائي' : 'الشفت الصباحي'})؟
                </p>
                <p className="text-[11px] text-stone-500 mt-1">
                  سيتم ربط المبيعات والمردودات والصرفيات القادمة بهذا الشفت دون تصفير اليومية.
                </p>
              </div>
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleConfirmShiftSwitch}
                  className="flex-1 bg-brand-800 hover:bg-brand-900 text-white font-black py-2.5 px-4 rounded-xl text-sm transition-all cursor-pointer shadow-sm active:scale-98"
                >
                  تأكيد
                </button>
                <button
                  type="button"
                  onClick={() => setPendingShiftSwitch(null)}
                  className="px-5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-sm transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Shield, ShieldAlert, ShieldCheck, UserCheck, Lock, Unlock, X } from 'lucide-react';
import { usePOS } from '../../context/POSContext';

export function RoleSwitchModal({ isOpen, onClose }) {
  const {
    userRole,
    activeCashier,
    setActiveCashier,
    cashierProfiles,
    switchRole,
    isManager,
  } = usePOS();

  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleCashierSelect = (name) => {
    setActiveCashier(name);
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
      <div className="bg-[#FAF8F5] border border-stone-300 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-brand-800 text-warm-50 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {isManager ? (
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            ) : (
              <Shield className="w-5 h-5 text-gold-400" />
            )}
            <h3 className="font-bold text-sm tracking-wide">
              {isManager ? 'إدارة الصلاحيات (وضع المدير)' : 'تبديل المستخدم والصلاحيات'}
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
        <div className="p-5 space-y-5">
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

          <div className="border-t border-stone-200 pt-4">
            {isManager ? (
              /* Already Manager */
              <div className="space-y-4">
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  <div className="text-xs text-emerald-900">
                    <span className="font-bold block text-sm">وضع المدير مفعل حالياً</span>
                    يمكنك تعديل الأسعار، الخصومات، إدارة الأقسام والمنتجات، وتصفير الصندوق.
                  </div>
                </div>

                <button
                  onClick={handleLockToCashier}
                  type="button"
                  className="w-full bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                >
                  <Lock className="w-4 h-4 text-stone-600" />
                  <span>قفل والرجوع لوضع الكاشير المقيد</span>
                </button>
              </div>
            ) : (
              /* Currently Cashier -> Prompt PIN to unlock Manager */
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-700">
                    الترقية إلى وضع المدير الكامل:
                  </span>
                  <span className="text-[11px] text-stone-500 font-mono">الافتراضي: 1234</span>
                </div>

                <form onSubmit={handleManagerLogin} className="space-y-3">
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
                      autoFocus
                      className="w-full text-center tracking-widest text-lg font-mono font-bold bg-white border border-stone-300 rounded-xl px-4 py-2.5 focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700"
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
                      className="flex-1 bg-brand-800 hover:bg-brand-900 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
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
      </div>
    </div>
  );
}

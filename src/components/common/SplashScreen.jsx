import React, { useState, useEffect, useRef } from 'react';
import {
  Store,
  ArrowLeft,
  Sun,
  Moon,
  User,
  ShieldCheck,
  Check,
  Lock,
  Delete,
  Printer,
  CheckCircle2,
  AlertCircle,
  KeyRound,
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';

export function SplashScreen({ onStart }) {
  const {
    activeCashier,
    setActiveCashier,
    activeShiftType,
    setActiveShiftType,
    switchRole,
    storeSettings,
    playSound,
    showToast,
    printShiftHandover,
  } = usePOS();

  // Step 1: User / Role Selection ('كاشير 1' | 'كاشير 2' | 'المدير العام')
  const [selectedUser, setSelectedUser] = useState(null);

  // Manager PIN State
  const [pin, setPin] = useState('');
  const [isPinVerified, setIsPinVerified] = useState(false);
  const [pinError, setPinError] = useState('');

  // Step 2: Active Shift Selection ('صباحي' | 'مسائي')
  const [selectedShift, setSelectedShift] = useState(null);

  // Hidden password input ref for physical typing
  const pinInputRef = useRef(null);

  const managerPin = String(storeSettings.managerPin || '1234').trim();

  // Reset PIN when user changes
  const handleSelectUser = (userName) => {
    setSelectedUser(userName);
    setPin('');
    setPinError('');
    if (userName === 'المدير العام') {
      setIsPinVerified(false);
      setTimeout(() => {
        if (pinInputRef.current) pinInputRef.current.focus();
      }, 100);
    } else {
      setIsPinVerified(true);
    }
  };

  const handleSelectShift = (shift) => {
    setSelectedShift(shift);
  };

  // Numpad key handlers
  const handleNumpadPress = (num) => {
    if (isPinVerified || pin.length >= 6) return;
    const nextPin = pin + num;
    setPin(nextPin);
    setPinError('');
    validatePin(nextPin);
  };

  const handleBackspace = () => {
    if (isPinVerified) return;
    const nextPin = pin.slice(0, -1);
    setPin(nextPin);
    setPinError('');
    setIsPinVerified(false);
  };

  const handleClearPin = () => {
    setPin('');
    setPinError('');
    setIsPinVerified(false);
  };

  const validatePin = (inputPin) => {
    if (inputPin.length === managerPin.length) {
      if (inputPin === managerPin) {
        setIsPinVerified(true);
        setPinError('');
        playSound('success');
      } else {
        setIsPinVerified(false);
        setPinError('رمز المدير غير صحيح، يرجى المحاولة مجدداً');
        playSound('warning');
      }
    }
  };

  // Keyboard typing support for PIN
  const handlePinInputChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    if (val.length <= 6) {
      setPin(val);
      setPinError('');
      validatePin(val);
    }
  };

  // Validation: Button enabled only when both user & shift are selected, and PIN validated if manager
  const isFormComplete = Boolean(
    selectedUser &&
    selectedShift &&
    (selectedUser !== 'المدير العام' || isPinVerified)
  );

  // Submit / Open Shift Action
  const handleConfirmAndStart = () => {
    if (!isFormComplete) return;

    // 1. Bind active Cashier and Role
    if (selectedUser === 'المدير العام') {
      switchRole('manager', pin);
      setActiveCashier('المدير العام');
    } else {
      switchRole('cashier');
      setActiveCashier(selectedUser);
    }

    // 2. Bind active Shift
    setActiveShiftType(selectedShift);

    // 3. Audio & Notification feedback
    playSound('success');
    showToast(
      `تم فتح الوردية بنجاح: ${selectedUser} • ${
        selectedShift === 'صباحي' ? 'الوردية الصباحية ☀️' : 'الوردية المسائية 🌙'
      }`
    );

    // 4. Start POS
    onStart();
  };

  // Keyboard shortcut: Press Enter to submit if complete
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        if (isFormComplete) {
          e.preventDefault();
          handleConfirmAndStart();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFormComplete, selectedUser, selectedShift, pin]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-between p-3 sm:p-5 md:p-6 bg-gradient-to-b from-[#320107] via-[#1f0004] to-[#120002] text-white select-none overflow-y-auto font-arabic"
      dir="rtl"
    >
      {/* Decorative Radial Golden Glow Background */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] sm:w-[650px] h-[450px] sm:h-[650px] bg-gradient-to-tr from-brand-800/30 via-gold-500/15 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Status Bar */}
      <header className="w-full flex items-center justify-between z-10 max-w-2xl px-1">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-gold-500/25 text-xs font-bold text-warm-200 backdrop-blur-md shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>بوابة تسجيل الدخول وفتح الوردية</span>
        </div>

        {activeCashier && activeShiftType && (
          <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-warm-300 bg-white/5 border border-white/10 px-3 py-1 rounded-full backdrop-blur-md">
            <span className="text-stone-400 font-sans">الجلسة السابقة:</span>
            <span className="font-bold text-gold-300">{activeCashier}</span>
            <span className="text-white/20">•</span>
            <span className="text-amber-300">{activeShiftType === 'صباحي' ? 'صباحي ☀️' : 'مسائي 🌙'}</span>
          </div>
        )}
      </header>

      {/* Main Interactive Gateway Card */}
      <main className="w-full max-w-2xl bg-stone-950/85 border border-gold-500/30 rounded-3xl p-4 sm:p-6 md:p-7 shadow-2xl backdrop-blur-md z-10 my-auto space-y-5 animate-scale-up">
        {/* Brand Identity Branding Header */}
        <div className="flex items-center justify-center gap-3.5 pb-3 border-b border-white/10">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-brand-950 border-2 border-gold-500/60 p-1 flex items-center justify-center shadow-lg shrink-0">
            <img
              src="./logo.png"
              alt="مسك وزعفران"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gold-100 via-white to-gold-300">
              {storeSettings.storeNameAr || 'مسك وزعفران'}
            </h1>
            <p className="text-[11px] sm:text-xs text-warm-300 font-medium">
              يرجى تحديد المستخدم ووردية العمل لبدء تسجيل المبيعات
            </p>
          </div>
        </div>

        {/* STEP 1: Select User / Role */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-gold-500 text-brand-950 text-xs font-black flex items-center justify-center shadow-xs">
                1
              </span>
              <h2 className="text-xs sm:text-sm font-black text-warm-100">
                الخطوة الأولى: تحديد الكاشير أو المدير
              </h2>
            </div>
            {selectedUser && (
              <span className="text-[11px] font-bold text-gold-400 bg-gold-500/10 px-2 py-0.5 rounded-full border border-gold-500/30">
                تم الاختيار: {selectedUser}
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
            {/* Option 1: كاشير 1 */}
            <button
              type="button"
              onClick={() => handleSelectUser('كاشير 1')}
              className={`p-2.5 sm:p-3 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center relative ${
                selectedUser === 'كاشير 1'
                  ? 'bg-gradient-to-b from-brand-900 to-brand-950 border-gold-400 shadow-lg shadow-gold-500/15 scale-102'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20 text-stone-300'
              }`}
            >
              {selectedUser === 'كاشير 1' && (
                <div className="absolute top-1.5 left-1.5 w-4 h-4 rounded-full bg-gold-400 text-brand-950 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                selectedUser === 'كاشير 1' ? 'bg-gold-500 text-brand-950' : 'bg-white/10 text-stone-300'
              }`}>
                <User className="w-4 h-4" />
              </div>
              <div>
                <div className={`text-xs sm:text-sm font-black ${selectedUser === 'كاشير 1' ? 'text-white' : 'text-stone-200'}`}>
                  كاشير 1
                </div>
                <div className="text-[9.5px] text-stone-400">نقطة بيع رئيسية</div>
              </div>
            </button>

            {/* Option 2: كاشير 2 */}
            <button
              type="button"
              onClick={() => handleSelectUser('كاشير 2')}
              className={`p-2.5 sm:p-3 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center relative ${
                selectedUser === 'كاشير 2'
                  ? 'bg-gradient-to-b from-brand-900 to-brand-950 border-gold-400 shadow-lg shadow-gold-500/15 scale-102'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20 text-stone-300'
              }`}
            >
              {selectedUser === 'كاشير 2' && (
                <div className="absolute top-1.5 left-1.5 w-4 h-4 rounded-full bg-gold-400 text-brand-950 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                selectedUser === 'كاشير 2' ? 'bg-gold-500 text-brand-950' : 'bg-white/10 text-stone-300'
              }`}>
                <User className="w-4 h-4" />
              </div>
              <div>
                <div className={`text-xs sm:text-sm font-black ${selectedUser === 'كاشير 2' ? 'text-white' : 'text-stone-200'}`}>
                  كاشير 2
                </div>
                <div className="text-[9.5px] text-stone-400">نقطة بيع ثانوية</div>
              </div>
            </button>

            {/* Option 3: المدير العام */}
            <button
              type="button"
              onClick={() => handleSelectUser('المدير العام')}
              className={`p-2.5 sm:p-3 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center relative ${
                selectedUser === 'المدير العام'
                  ? 'bg-gradient-to-b from-emerald-950 to-stone-950 border-emerald-400 shadow-lg shadow-emerald-500/20 scale-102'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20 text-stone-300'
              }`}
            >
              {selectedUser === 'المدير العام' && isPinVerified && (
                <div className="absolute top-1.5 left-1.5 w-4 h-4 rounded-full bg-emerald-400 text-stone-950 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                selectedUser === 'المدير العام' ? 'bg-emerald-500 text-stone-950' : 'bg-white/10 text-stone-300'
              }`}>
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className={`text-xs sm:text-sm font-black ${selectedUser === 'المدير العام' ? 'text-white' : 'text-stone-200'}`}>
                  المدير العام
                </div>
                <div className="text-[9.5px] text-emerald-400">صلاحيات كاملة 🔒</div>
              </div>
            </button>
          </div>

          {/* Manager PIN Validation Box & Virtual Numpad */}
          {selectedUser === 'المدير العام' && (
            <div className="p-3.5 bg-stone-900/90 border border-emerald-500/40 rounded-2xl space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
                  <span>أدخل رمز المرور السري للمدير (PIN):</span>
                </span>
                {isPinVerified ? (
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>تم التحقق بنجاح</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-stone-400 font-mono">
                    الافتراضي: 1234
                  </span>
                )}
              </div>

              {/* Masked PIN Dots & Hidden Input */}
              <div className="flex items-center justify-center gap-2 py-1">
                {[0, 1, 2, 3].map((idx) => {
                  const isFilled = pin.length > idx;
                  return (
                    <div
                      key={idx}
                      className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                        isPinVerified
                          ? 'bg-emerald-400 border-emerald-400 shadow-sm shadow-emerald-400/50'
                          : isFilled
                          ? 'bg-gold-400 border-gold-400 shadow-sm shadow-gold-400/40'
                          : 'bg-white/10 border-white/20'
                      }`}
                    />
                  );
                })}

                {/* Hidden input for physical keyboard typists */}
                <input
                  ref={pinInputRef}
                  type="password"
                  value={pin}
                  onChange={handlePinInputChange}
                  maxLength={6}
                  className="absolute opacity-0 pointer-events-none"
                  autoFocus
                />
              </div>

              {/* Pin Error Message */}
              {pinError && (
                <div className="text-center text-xs font-bold text-rose-400 flex items-center justify-center gap-1.5 animate-shake">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{pinError}</span>
                </div>
              )}

              {/* Virtual Numpad */}
              {!isPinVerified && (
                <div className="grid grid-cols-3 gap-1.5 max-w-[240px] mx-auto pt-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleNumpadPress(String(num))}
                      className="py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:bg-gold-500 active:text-brand-950 text-white font-mono font-bold text-sm transition-colors cursor-pointer border border-white/10 shadow-xs"
                    >
                      {num}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={handleClearPin}
                    className="py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-xs transition-colors cursor-pointer border border-rose-500/30"
                  >
                    مسح
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNumpadPress('0')}
                    className="py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:bg-gold-500 active:text-brand-950 text-white font-mono font-bold text-sm transition-colors cursor-pointer border border-white/10 shadow-xs"
                  >
                    0
                  </button>

                  <button
                    type="button"
                    onClick={handleBackspace}
                    className="py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-stone-300 font-bold text-xs transition-colors cursor-pointer border border-white/10 flex items-center justify-center"
                    title="حذف آخر رقم"
                  >
                    <Delete className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* STEP 2: Select Active Shift */}
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-gold-500 text-brand-950 text-xs font-black flex items-center justify-center shadow-xs">
                2
              </span>
              <h2 className="text-xs sm:text-sm font-black text-warm-100">
                الخطوة الثانية: تحديد وردية العمل (الشفت)
              </h2>
            </div>
            {selectedShift && (
              <span className="text-[11px] font-bold text-gold-400 bg-gold-500/10 px-2 py-0.5 rounded-full border border-gold-500/30">
                تم الاختيار: {selectedShift === 'صباحي' ? 'الوردية الصباحية ☀️' : 'الوردية المسائية 🌙'}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {/* Shift Option 1: الوردية الصباحية */}
            <button
              type="button"
              onClick={() => handleSelectShift('صباحي')}
              className={`p-3 rounded-2xl border-2 transition-all flex items-center gap-3 cursor-pointer text-right relative ${
                selectedShift === 'صباحي'
                  ? 'bg-gradient-to-r from-amber-500/25 via-amber-600/15 to-transparent border-amber-400 shadow-lg shadow-amber-500/20'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20 text-stone-300'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                selectedShift === 'صباحي'
                  ? 'bg-amber-400 text-stone-950 shadow-md'
                  : 'bg-white/10 text-amber-300'
              }`}>
                <Sun className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-xs sm:text-sm font-black ${selectedShift === 'صباحي' ? 'text-amber-200' : 'text-stone-200'}`}>
                  الوردية الصباحية
                </div>
                <div className="text-[10px] text-stone-400">الفترة الصباحية والظهر</div>
              </div>
              {selectedShift === 'صباحي' && (
                <div className="w-5 h-5 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
            </button>

            {/* Shift Option 2: الوردية المسائية */}
            <button
              type="button"
              onClick={() => handleSelectShift('مسائي')}
              className={`p-3 rounded-2xl border-2 transition-all flex items-center gap-3 cursor-pointer text-right relative ${
                selectedShift === 'مسائي'
                  ? 'bg-gradient-to-r from-indigo-500/25 via-indigo-600/15 to-transparent border-indigo-400 shadow-lg shadow-indigo-500/20'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20 text-stone-300'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                selectedShift === 'مسائي'
                  ? 'bg-indigo-400 text-stone-950 shadow-md'
                  : 'bg-white/10 text-indigo-300'
              }`}>
                <Moon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-xs sm:text-sm font-black ${selectedShift === 'مسائي' ? 'text-indigo-200' : 'text-stone-200'}`}>
                  الوردية المسائية
                </div>
                <div className="text-[10px] text-stone-400">فترة المساء والإغلاق</div>
              </div>
              {selectedShift === 'مسائي' && (
                <div className="w-5 h-5 rounded-full bg-indigo-400 text-stone-950 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Handover Print Helper & Primary Submit Button */}
        <div className="pt-2 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => printShiftHandover()}
              className="text-[11px] font-bold text-stone-400 hover:text-gold-300 flex items-center gap-1 transition-colors cursor-pointer"
              title="طباعة وصل استلام وتسليم الوردية السابقة حرارياً"
            >
              <Printer className="w-3.5 h-3.5 text-gold-400" />
              <span>طباعة وصل تسليم الوردية السابقة (Handover)</span>
            </button>

            {!isFormComplete && (
              <span className="text-[10px] text-amber-300/80 font-bold">
                * يلزم تحديد المستخدم والوردية
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleConfirmAndStart}
            disabled={!isFormComplete}
            className={`w-full py-3.5 sm:py-4 px-6 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all duration-200 shadow-xl ${
              isFormComplete
                ? 'bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 hover:from-gold-400 hover:to-gold-300 text-brand-950 border-2 border-gold-300 shadow-gold-500/20 active:scale-98 cursor-pointer'
                : 'bg-white/10 text-stone-500 border border-white/10 cursor-not-allowed opacity-60'
            }`}
          >
            <Store className={`w-5 h-5 ${isFormComplete ? 'text-brand-950' : 'text-stone-500'}`} />
            <span>
              {isFormComplete
                ? `بدء العمل / فتح الوردية (${selectedUser} • ${
                    selectedShift === 'صباحي' ? 'الصباحية ☀️' : 'المسائية 🌙'
                  })`
                : 'بدء العمل / فتح الوردية'}
            </span>
            <ArrowLeft className={`w-4 h-4 ${isFormComplete ? 'text-brand-950' : 'text-stone-500'}`} />
          </button>
        </div>
      </main>

      {/* Footer Branding Signature */}
      <footer className="w-full text-center py-2 z-10">
        <div className="text-[11px] text-stone-500 font-medium tracking-wide">
          المهندس محمد أحمد • نظام نقاط البيع المحاسبي المتقدم
        </div>
      </footer>
    </div>
  );
}

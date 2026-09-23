import React, { useState, useEffect } from 'react';
import { X, Lock, KeyRound, AlertCircle, Check, Delete } from 'lucide-react';
import { usePOS } from '../../context/POSContext';

export function ManagerPinModal({
  isOpen,
  onClose,
  onSuccess,
  title = 'رمز تأكيد المدير',
  promptMessage = 'أدخل رمز تأكيد المدير للمتابعة',
  expectedPin = null,
}) {
  const { storeSettings } = usePOS();
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const targetPin =
    expectedPin !== null && expectedPin !== undefined
      ? String(expectedPin).trim()
      : String(storeSettings.managerPin || '1234').trim();

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setErrorMsg('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

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

  const handleVerify = (e) => {
    if (e) e.preventDefault();
    if (pin === targetPin) {
      onSuccess();
      onClose();
    } else {
      setErrorMsg('رمز الأمان غير صحيح، يرجى المحاولة مجدداً');
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in select-none">
      <div className="bg-[#FAF8F5] border-2 border-brand-900 rounded-2xl shadow-2xl max-w-xs w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-brand-900 text-white px-4 py-3 flex items-center justify-between border-b border-gold-500/30">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-gold-400" />
            <h3 className="font-bold text-sm">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-warm-200 hover:text-white p-1 rounded-lg hover:bg-brand-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 text-center space-y-3">
          <div className="text-xs font-bold text-stone-700">
            {promptMessage}
          </div>

          {/* PIN Dots display */}
          <div className="flex justify-center items-center gap-2 py-2">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`w-3.5 h-3.5 rounded-full border-2 transition-all ${
                  pin.length > idx
                    ? 'bg-brand-900 border-brand-900 scale-110'
                    : 'bg-white border-stone-300'
                }`}
              />
            ))}
          </div>

          {/* Hidden password input for keyboard typists */}
          <form onSubmit={handleVerify}>
            <input
              type="password"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setErrorMsg('');
              }}
              autoFocus
              className="w-full text-center text-lg font-mono tracking-widest bg-white border border-stone-300 rounded-xl py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-800"
              placeholder="••••"
            />
          </form>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold flex items-center justify-center gap-1.5 animate-shake">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Numeric Touch Keypad */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeyPress(num)}
                className="py-3 bg-white hover:bg-stone-100 active:bg-brand-100 text-stone-800 font-mono font-bold text-base rounded-xl border border-stone-200 shadow-xs transition-colors cursor-pointer"
              >
                {num}
              </button>
            ))}

            <button
              type="button"
              onClick={handleClear}
              className="py-3 bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              مسح
            </button>

            <button
              type="button"
              onClick={() => handleKeyPress('0')}
              className="py-3 bg-white hover:bg-stone-100 active:bg-brand-100 text-stone-800 font-mono font-bold text-base rounded-xl border border-stone-200 shadow-xs transition-colors cursor-pointer"
            >
              0
            </button>

            <button
              type="button"
              onClick={handleBackspace}
              className="py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center rounded-xl transition-colors cursor-pointer"
            >
              <Delete className="w-4 h-4" />
            </button>
          </div>

          {/* Confirm Button */}
          <button
            type="button"
            onClick={handleVerify}
            className="w-full bg-brand-800 hover:bg-brand-900 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer mt-2"
          >
            <Check className="w-4 h-4 text-gold-400" />
            <span>تأكيد الرمز والمتابعة</span>
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { X, Check, Delete, RotateCcw, Calculator } from 'lucide-react';

/**
 * Universal Virtual Numpad Modal
 * Touch-friendly on-screen numeric keypad supporting mouse, touch, and physical keyboard simultaneously.
 */
export function VirtualNumpadModal({
  isOpen,
  onClose,
  title = 'إدخال رقمي',
  initialValue = 0,
  unit = '',
  mode = 'integer', // 'integer' | 'currency' | 'decimal'
  quickPresets = [], // e.g. [10, 25, 50, 100] or [5000, 10000, 25000, 50000]
  onConfirm,
}) {
  const [currentValue, setCurrentValue] = useState(String(initialValue ?? '0'));

  useEffect(() => {
    if (isOpen) {
      setCurrentValue(String(initialValue ?? '0'));
    }
  }, [isOpen, initialValue]);

  // Physical keyboard support when numpad is open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === '.' || e.key === ',') {
        if (mode === 'decimal') {
          e.preventDefault();
          handleDot();
        }
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Delete' || e.key === 'Escape') {
        e.preventDefault();
        if (e.key === 'Escape') {
          onClose();
        } else {
          handleClear();
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentValue, mode]);

  if (!isOpen) return null;

  const handleDigit = (digit) => {
    setCurrentValue((prev) => {
      if (prev === '0' || prev === '') return String(digit);
      // Limit to 9 digits to prevent overflow
      if (prev.length >= 9) return prev;
      return prev + digit;
    });
  };

  const handleDoubleZero = () => {
    setCurrentValue((prev) => {
      if (prev === '0' || prev === '') return '0';
      if (prev.length >= 8) return prev;
      return prev + '00';
    });
  };

  const handleDot = () => {
    setCurrentValue((prev) => {
      if (prev.includes('.')) return prev;
      if (prev === '') return '0.';
      return prev + '.';
    });
  };

  const handleBackspace = () => {
    setCurrentValue((prev) => {
      if (prev.length <= 1) return '0';
      return prev.slice(0, -1);
    });
  };

  const handleClear = () => {
    setCurrentValue('0');
  };

  const handlePresetAdd = (amount) => {
    setCurrentValue((prev) => {
      const num = Number(prev) || 0;
      return String(Math.max(0, num + amount));
    });
  };

  const handleConfirm = () => {
    const parsed = Number(currentValue) || 0;
    if (onConfirm) onConfirm(parsed);
    onClose();
  };

  const formattedDisplay = () => {
    const num = Number(currentValue);
    if (isNaN(num)) return currentValue;
    return num.toLocaleString();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-fade-in select-none"
      dir="rtl"
    >
      <div className="bg-[#FAF8F5] border-2 border-brand-900/30 rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden flex flex-col animate-scale-up">
        {/* Header */}
        <div className="bg-brand-800 text-white px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-gold-400" />
            <h3 className="font-bold text-sm sm:text-base">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-warm-200 hover:text-white p-1 rounded-lg hover:bg-brand-900/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Display Screen */}
        <div className="p-4 bg-stone-900 text-white text-left font-mono border-b border-stone-800">
          <div className="text-[10px] text-stone-400 text-right font-sans font-semibold mb-1">
            القيمة المدخلة:
          </div>
          <div className="flex items-baseline justify-between gap-2 dir-ltr">
            <span className="text-2xl sm:text-3xl font-black text-gold-400 tracking-wider truncate">
              {formattedDisplay()}
            </span>
            {unit && (
              <span className="text-xs font-sans font-bold text-warm-200 bg-white/10 px-2 py-0.5 rounded-md shrink-0">
                {unit}
              </span>
            )}
          </div>
        </div>

        {/* Quick Presets (if provided) */}
        {quickPresets.length > 0 && (
          <div className="px-3 pt-3 flex items-center gap-1.5 overflow-x-auto">
            {quickPresets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handlePresetAdd(preset)}
                className="flex-1 min-w-[55px] py-1.5 px-2 rounded-xl bg-warm-100 hover:bg-warm-200 text-brand-900 border border-warm-300 text-xs font-mono font-bold transition-all active:scale-95 cursor-pointer text-center"
              >
                +{preset.toLocaleString()}
              </button>
            ))}
          </div>
        )}

        {/* Keypad Grid */}
        <div className="p-3.5 sm:p-4 grid grid-cols-3 gap-2">
          {['7', '8', '9', '4', '5', '6', '1', '2', '3'].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => handleDigit(d)}
              className="h-13 sm:h-14 rounded-2xl bg-white hover:bg-warm-100 text-stone-900 border border-stone-300 shadow-xs active:bg-brand-100 font-mono font-black text-xl sm:text-2xl flex items-center justify-center transition-all active:scale-95 cursor-pointer"
            >
              {d}
            </button>
          ))}

          {/* Bottom Row */}
          <button
            type="button"
            onClick={handleClear}
            className="h-13 sm:h-14 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 shadow-xs font-bold text-sm sm:text-base flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer"
            title="مسح الكل (Delete)"
          >
            <RotateCcw className="w-4 h-4" />
            <span>مسح</span>
          </button>

          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="h-13 sm:h-14 rounded-2xl bg-white hover:bg-warm-100 text-stone-900 border border-stone-300 shadow-xs active:bg-brand-100 font-mono font-black text-xl sm:text-2xl flex items-center justify-center transition-all active:scale-95 cursor-pointer"
          >
            0
          </button>

          <button
            type="button"
            onClick={handleBackspace}
            className="h-13 sm:h-14 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 shadow-xs font-bold text-sm sm:text-base flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer"
            title="حذف خانة (Backspace)"
          >
            <Delete className="w-4 h-4" />
            <span>حذف</span>
          </button>

          {/* Extra utility row for currency/decimal */}
          {mode === 'decimal' ? (
            <button
              type="button"
              onClick={handleDot}
              className="col-span-3 h-10 rounded-xl bg-warm-100 hover:bg-warm-200 text-stone-800 border border-stone-300 font-mono font-black text-lg flex items-center justify-center cursor-pointer"
            >
              .
            </button>
          ) : (
            <button
              type="button"
              onClick={handleDoubleZero}
              className="col-span-3 h-10 rounded-xl bg-warm-100 hover:bg-warm-200 text-stone-800 border border-stone-300 font-mono font-bold text-sm flex items-center justify-center cursor-pointer"
            >
              +00 (مائة)
            </button>
          )}
        </div>

        {/* Action Controls */}
        <div className="p-3 bg-stone-100 border-t border-stone-200 flex gap-2">
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-3 px-4 rounded-xl bg-brand-800 hover:bg-brand-900 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer"
          >
            <Check className="w-5 h-5 text-gold-400" />
            <span>تأكيد الإدخال (Enter ↵)</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="py-3 px-4 rounded-xl bg-white hover:bg-stone-200 text-stone-700 font-bold text-xs border border-stone-300 transition-colors cursor-pointer"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}

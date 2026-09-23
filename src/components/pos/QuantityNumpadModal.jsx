import React, { useState, useEffect } from 'react';
import { X, Check, Calculator, Delete } from 'lucide-react';

export function QuantityNumpadModal({ isOpen, item, onClose, onSave, currency = 'د.ع' }) {
  if (!isOpen || !item) return null;

  const [inputValue, setInputValue] = useState(String(item.quantity || '1'));
  const [isFresh, setIsFresh] = useState(true);

  useEffect(() => {
    setInputValue(String(item.quantity || '1'));
    setIsFresh(true);
  }, [item]);

  const handleKeyPress = (char) => {
    if (isFresh) {
      if (char === '.') {
        setInputValue('0.');
      } else {
        setInputValue(char);
      }
      setIsFresh(false);
      return;
    }

    if (char === '.') {
      if (!inputValue.includes('.')) {
        setInputValue(inputValue + '.');
      }
      return;
    }

    // Append digit (limit max 3 decimal places)
    if (inputValue.includes('.')) {
      const parts = inputValue.split('.');
      if (parts[1].length >= 3) return;
    }

    // Avoid multiple leading zeros
    if (inputValue === '0') {
      setInputValue(char);
    } else {
      setInputValue(inputValue + char);
    }
  };

  const handleBackspace = () => {
    setIsFresh(false);
    if (inputValue.length <= 1) {
      setInputValue('0');
      setIsFresh(true);
    } else {
      setInputValue(inputValue.slice(0, -1));
    }
  };

  const handleClear = () => {
    setInputValue('0');
    setIsFresh(true);
  };

  const handlePreset = (presetVal) => {
    setInputValue(String(presetVal));
    setIsFresh(false);
  };

  const handleAddStep = (step) => {
    const current = parseFloat(inputValue) || 0;
    const next = Math.max(0.01, Math.round((current + step) * 1000) / 1000);
    setInputValue(String(next));
    setIsFresh(false);
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const parsed = parseFloat(inputValue);
    if (!isNaN(parsed) && parsed > 0) {
      onSave(item.cartItemId, parsed);
    } else {
      onClose();
    }
  };

  const parsedQty = parseFloat(inputValue) || 0;
  const unitPrice = item.unitPrice || item.originalPrice || 0;
  const calculatedTotal = Math.max(0, Math.round(parsedQty * unitPrice - (item.discount || 0)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs select-none animate-fade-in">
      <div className="bg-[#FAF8F5] border-2 border-brand-800 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden flex flex-col animate-scale-up">
        {/* Header */}
        <div className="bg-brand-900 text-warm-50 px-4 py-3 flex items-center justify-between border-b border-gold-500/30">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-gold-400" />
            <div>
              <h3 className="font-bold text-sm leading-tight text-white">{item.product.name}</h3>
              <p className="text-[10px] text-warm-200 font-mono">
                سعر الوحدة: {unitPrice.toLocaleString()} {currency}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-warm-200 hover:text-white p-1 rounded-lg hover:bg-brand-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {/* Display Screen */}
          <div className="bg-white border-2 border-brand-700/60 rounded-xl p-3 shadow-inner text-center">
            <span className="text-[10px] font-bold text-stone-500 block mb-1">
              الكمية المطلوبة (كغم أو عدد):
            </span>
            <div className="flex items-center justify-center gap-1.5">
              <input
                type="text"
                inputMode="decimal"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setIsFresh(false);
                }}
                onFocus={(e) => e.target.select()}
                autoFocus
                className="w-full text-center font-mono font-black text-3xl text-brand-950 focus:outline-none bg-transparent"
              />
              <span className="text-sm font-bold text-stone-500 font-sans">
                {parsedQty % 1 !== 0 ? 'كغم' : 'وحدة'}
              </span>
            </div>

            {/* Live Calculation Preview */}
            <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-stone-700 px-1">
              <span>المجموع الفرعي:</span>
              <span className="font-mono text-brand-900 font-black text-sm">
                {calculatedTotal.toLocaleString()} {currency}
              </span>
            </div>
          </div>

          {/* Quick Weight & Bulk Shortcuts */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-stone-500">أوزان شائعة (كغم):</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handlePreset(0.25)}
                className="py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-950 font-black text-xs rounded-lg border border-amber-300/80 transition-colors cursor-pointer shadow-2xs"
              >
                0.25 كغم (ربع)
              </button>
              <button
                type="button"
                onClick={() => handlePreset(0.5)}
                className="py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-950 font-black text-xs rounded-lg border border-amber-300/80 transition-colors cursor-pointer shadow-2xs"
              >
                0.5 كغم (نص)
              </button>
              <button
                type="button"
                onClick={() => handlePreset(0.75)}
                className="py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-950 font-black text-xs rounded-lg border border-amber-300/80 transition-colors cursor-pointer shadow-2xs"
              >
                0.75 كغم
              </button>
              <button
                type="button"
                onClick={() => handlePreset(1)}
                className="py-1.5 px-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-black text-xs rounded-lg border border-stone-300 transition-colors cursor-pointer shadow-2xs"
              >
                1 كغم
              </button>
              <button
                type="button"
                onClick={() => handlePreset(1.5)}
                className="py-1.5 px-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-black text-xs rounded-lg border border-stone-300 transition-colors cursor-pointer shadow-2xs"
              >
                1.5 كغم
              </button>
              <button
                type="button"
                onClick={() => handlePreset(2)}
                className="py-1.5 px-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-black text-xs rounded-lg border border-stone-300 transition-colors cursor-pointer shadow-2xs"
              >
                2 كغم
              </button>
            </div>
          </div>

          {/* Quick Increment Shortcuts */}
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => handleAddStep(1)}
              className="flex-1 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-lg border border-stone-200 transition-colors cursor-pointer"
            >
              +1
            </button>
            <button
              type="button"
              onClick={() => handleAddStep(5)}
              className="flex-1 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-lg border border-stone-200 transition-colors cursor-pointer"
            >
              +5
            </button>
            <button
              type="button"
              onClick={() => handleAddStep(10)}
              className="flex-1 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-lg border border-stone-200 transition-colors cursor-pointer"
            >
              +10
            </button>
            <button
              type="button"
              onClick={() => handlePreset(100)}
              className="flex-1 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-lg border border-stone-200 transition-colors cursor-pointer"
            >
              100
            </button>
          </div>

          {/* Numeric Touch Keypad Grid */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            {['7', '8', '9', '4', '5', '6', '1', '2', '3'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleKeyPress(digit)}
                className="py-3 bg-white hover:bg-brand-50 border border-stone-200 rounded-xl font-mono text-xl font-black text-stone-800 active:scale-95 transition-all cursor-pointer shadow-xs"
              >
                {digit}
              </button>
            ))}

            {/* Clear Button */}
            <button
              type="button"
              onClick={handleClear}
              className="py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold text-sm active:scale-95 transition-all cursor-pointer shadow-xs"
            >
              مسح C
            </button>

            {/* Zero */}
            <button
              type="button"
              onClick={() => handleKeyPress('0')}
              className="py-3 bg-white hover:bg-brand-50 border border-stone-200 rounded-xl font-mono text-xl font-black text-stone-800 active:scale-95 transition-all cursor-pointer shadow-xs"
            >
              0
            </button>

            {/* Decimal Point */}
            <button
              type="button"
              onClick={() => handleKeyPress('.')}
              className="py-3 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-xl font-mono text-2xl font-black text-stone-800 active:scale-95 transition-all cursor-pointer shadow-xs"
            >
              .
            </button>
          </div>

          {/* Backspace & Confirm Row */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleBackspace}
              title="حذف آخر رقم"
              className="w-14 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
            >
              <Delete className="w-5 h-5" />
            </button>

            <button
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 active:scale-98 transition-all cursor-pointer"
            >
              <Check className="w-5 h-5" />
              <span>تأكيد الكمية</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

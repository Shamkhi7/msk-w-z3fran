import React, { useState, useEffect } from 'react';
import { X, Check, Calculator, Delete, Scale, Coins, ArrowLeftRight } from 'lucide-react';
import { isWeightedProduct, roundIQD } from '../../utils/productAnalyticsHelper';

export function QuantityNumpadModal({ isOpen, item, onClose, onSave, currency = 'د.ع' }) {
  if (!isOpen || !item) return null;

  const isWeighted = isWeightedProduct(item.product);
  const baseUnitPrice = item.unitPrice || item.originalPrice || item.product?.price || 1;

  // Mode: 'weight' | 'amount'
  const [activeMode, setActiveMode] = useState(
    item.initialMode === 'amount' ? 'amount' : 'weight'
  );

  const initialQty = Number(item.quantity) || 1;
  const initialAmount =
    item.manualTotalAmount !== undefined && item.manualTotalAmount !== null
      ? item.manualTotalAmount
      : Math.max(0, roundIQD(initialQty * baseUnitPrice));

  const [weightInput, setWeightInput] = useState(String(initialQty));
  const [amountInput, setAmountInput] = useState(String(initialAmount));
  const [isFresh, setIsFresh] = useState(true);

  useEffect(() => {
    const q = Number(item.quantity) || 1;
    const a =
      item.manualTotalAmount !== undefined && item.manualTotalAmount !== null
        ? item.manualTotalAmount
        : Math.max(0, roundIQD(q * baseUnitPrice));
    setWeightInput(String(q));
    setAmountInput(String(a));
    setActiveMode(item.initialMode === 'amount' ? 'amount' : 'weight');
    setIsFresh(true);
  }, [item, baseUnitPrice]);

  // Handle switching active editing mode
  const handleSwitchMode = (mode) => {
    setActiveMode(mode);
    setIsFresh(true);
  };

  // Keyboard input handler
  const handleKeyPress = (char) => {
    if (activeMode === 'weight') {
      let nextStr = weightInput;
      if (isFresh) {
        nextStr = char === '.' ? '0.' : char;
        setIsFresh(false);
      } else {
        if (char === '.') {
          if (!nextStr.includes('.')) nextStr += '.';
        } else {
          // Limit max 3 decimal places for weight
          if (nextStr.includes('.')) {
            const parts = nextStr.split('.');
            if (parts[1] && parts[1].length >= 3) return;
          }
          nextStr = nextStr === '0' ? char : nextStr + char;
        }
      }
      setWeightInput(nextStr);
      // Synchronize amount in real time: Amount = Weight * Base Price (rounded to nearest 250 IQD)
      const parsedW = parseFloat(nextStr) || 0;
      const syncAmount = roundIQD(parsedW * baseUnitPrice);
      setAmountInput(String(syncAmount));
    } else {
      // Amount mode (IQD)
      let nextStr = amountInput;
      if (isFresh) {
        if (char === '.' || char === '00' || char === '000') {
          nextStr = '0';
        } else {
          nextStr = char;
        }
        setIsFresh(false);
      } else {
        if (char === '.') {
          return; // Amounts in IQD are integers
        }
        if (char === '00' || char === '000') {
          if (nextStr === '0') return;
          nextStr += char;
        } else {
          nextStr = nextStr === '0' ? char : nextStr + char;
        }
      }
      setAmountInput(nextStr);
      // Synchronize weight in real time: Weight = Amount / Base Price (rounded to 3 decimals)
      const parsedA = parseFloat(nextStr) || 0;
      const syncWeight = baseUnitPrice > 0 ? Math.round((parsedA / baseUnitPrice) * 1000) / 1000 : 0;
      setWeightInput(String(syncWeight));
    }
  };

  const handleBackspace = () => {
    setIsFresh(false);
    if (activeMode === 'weight') {
      const nextStr = weightInput.length <= 1 ? '0' : weightInput.slice(0, -1);
      setWeightInput(nextStr);
      const parsedW = parseFloat(nextStr) || 0;
      setAmountInput(String(roundIQD(parsedW * baseUnitPrice)));
    } else {
      const nextStr = amountInput.length <= 1 ? '0' : amountInput.slice(0, -1);
      setAmountInput(nextStr);
      const parsedA = parseFloat(nextStr) || 0;
      const syncW = baseUnitPrice > 0 ? Math.round((parsedA / baseUnitPrice) * 1000) / 1000 : 0;
      setWeightInput(String(syncW));
    }
  };

  const handleClear = () => {
    setWeightInput('0');
    setAmountInput('0');
    setIsFresh(true);
  };

  // Preset Shortcuts
  const handleWeightPreset = (presetW) => {
    setWeightInput(String(presetW));
    setAmountInput(String(roundIQD(presetW * baseUnitPrice)));
    setIsFresh(false);
  };

  const handleWeightStep = (step) => {
    const currentW = parseFloat(weightInput) || 0;
    const nextW = Math.max(0.01, Math.round((currentW + step) * 1000) / 1000);
    setWeightInput(String(nextW));
    setAmountInput(String(roundIQD(nextW * baseUnitPrice)));
    setIsFresh(false);
  };

  const handleAmountPreset = (presetA) => {
    setAmountInput(String(presetA));
    const syncW = baseUnitPrice > 0 ? Math.round((presetA / baseUnitPrice) * 1000) / 1000 : 0;
    setWeightInput(String(syncW));
    setIsFresh(false);
  };

  const handleAmountStep = (step) => {
    const currentA = parseFloat(amountInput) || 0;
    const nextA = Math.max(0, Math.round(currentA + step));
    setAmountInput(String(nextA));
    const syncW = baseUnitPrice > 0 ? Math.round((nextA / baseUnitPrice) * 1000) / 1000 : 0;
    setWeightInput(String(syncW));
    setIsFresh(false);
  };

  // Form Submission: Returns deduced weight & optional locked amount
  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    let finalWeight = 0;
    let lockedAmount = null;

    if (activeMode === 'weight') {
      finalWeight = parseFloat(weightInput) || 0;
      lockedAmount = null;
    } else {
      const parsedA = parseFloat(amountInput) || 0;
      lockedAmount = Math.round(parsedA);
      finalWeight = baseUnitPrice > 0 ? Math.round((lockedAmount / baseUnitPrice) * 1000) / 1000 : 0;
    }

    if (finalWeight > 0) {
      onSave(item.cartItemId, finalWeight, lockedAmount);
    } else {
      onClose();
    }
  };

  const parsedWeight = parseFloat(weightInput) || 0;
  const parsedAmount = parseFloat(amountInput) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs select-none animate-fade-in">
      <div className="bg-[#FAF8F5] border-2 border-brand-800 rounded-2xl shadow-2xl max-w-sm sm:max-w-md w-full overflow-hidden flex flex-col animate-scale-up">
        {/* Header */}
        <div className="bg-brand-900 text-warm-50 px-4 py-3 flex items-center justify-between border-b border-gold-500/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gold-500/20 text-gold-400 flex items-center justify-center font-bold">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight text-white flex items-center gap-1.5">
                <span>{item.product.name}</span>
                {isWeighted && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-500/30 text-gold-300 border border-gold-500/40 font-bold">
                    بالوزن ⚖️
                  </span>
                )}
              </h3>
              <p className="text-[10px] text-warm-200 font-mono mt-0.5">
                سعر الكيلو الأصلي: <strong className="text-gold-300 font-bold">{baseUnitPrice.toLocaleString()} {currency}</strong>
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

        {/* Bi-directional Mode Switcher Tabs */}
        <div className="bg-stone-100 p-1.5 border-b border-stone-200 grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => handleSwitchMode('weight')}
            className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeMode === 'weight'
                ? 'bg-brand-800 text-white shadow-sm ring-2 ring-brand-700/50'
                : 'bg-white text-stone-700 hover:bg-stone-50 border border-stone-200'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>تحديد بالوزن (كغم)</span>
          </button>

          <button
            type="button"
            onClick={() => handleSwitchMode('amount')}
            className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeMode === 'amount'
                ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-500/50'
                : 'bg-white text-stone-700 hover:bg-stone-50 border border-stone-200'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            <span>تحديد بالمبلغ (د.ع)</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-3 sm:p-4 space-y-3">
          {/* Dual Interactive Display Cards */}
          <div className="grid grid-cols-2 gap-2">
            {/* Card 1: Weight (الوزن / الكمية) */}
            <div
              onClick={() => handleSwitchMode('weight')}
              className={`p-2.5 rounded-xl border-2 transition-all cursor-pointer text-center ${
                activeMode === 'weight'
                  ? 'bg-white border-brand-800 ring-2 ring-brand-800/20 shadow-sm'
                  : 'bg-stone-50/70 border-stone-200 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-stone-500 mb-0.5">
                <Scale className="w-3 h-3 text-brand-800" />
                <span>الوزن / الكمية:</span>
              </div>
              <div className="flex items-baseline justify-center gap-1">
                <span className="font-mono font-black text-2xl text-brand-950">
                  {parsedWeight > 0 ? parsedWeight : '0'}
                </span>
                <span className="text-xs font-bold text-stone-500">كغم</span>
              </div>
              {activeMode === 'weight' && (
                <span className="text-[9px] font-bold text-brand-800 block mt-0.5">
                  ● جاري إدخال الوزن
                </span>
              )}
            </div>

            {/* Card 2: Target Total Amount (المبلغ الإجمالي) */}
            <div
              onClick={() => handleSwitchMode('amount')}
              className={`p-2.5 rounded-xl border-2 transition-all cursor-pointer text-center ${
                activeMode === 'amount'
                  ? 'bg-white border-amber-600 ring-2 ring-amber-600/20 shadow-sm'
                  : 'bg-stone-50/70 border-stone-200 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-amber-900 mb-0.5">
                <Coins className="w-3 h-3 text-amber-700" />
                <span>المبلغ المطلوب:</span>
              </div>
              <div className="flex items-baseline justify-center gap-1">
                <span className="font-mono font-black text-2xl text-amber-950">
                  {parsedAmount.toLocaleString()}
                </span>
                <span className="text-xs font-bold text-stone-500">{currency}</span>
              </div>
              {activeMode === 'amount' && (
                <span className="text-[9px] font-bold text-amber-700 block mt-0.5">
                  ● جاري إدخال المبلغ (عكسي)
                </span>
              )}
            </div>
          </div>

          {/* Real-time Reverse Formula Info Note */}
          <div className="bg-amber-50/70 border border-amber-200 text-amber-950 px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ArrowLeftRight className="w-3.5 h-3.5 text-amber-800 shrink-0" />
              <span>
                {activeMode === 'amount'
                  ? `المعادلة: ${parsedAmount.toLocaleString()} د.ع ÷ ${baseUnitPrice.toLocaleString()} د.ع/كغم = ${parsedWeight} كغم`
                  : `المعادلة: ${parsedWeight} كغم × ${baseUnitPrice.toLocaleString()} د.ع = ${parsedAmount.toLocaleString()} د.ع`}
              </span>
            </div>
            <span className="text-[10px] text-stone-400 font-normal hidden sm:inline">
              (السعر بالقائمة ثابت)
            </span>
          </div>

          {/* Mode-specific Quick Shortcuts */}
          {activeMode === 'weight' ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-stone-500">أوزان شائعة سريعة (كغم):</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { w: 0.25, label: '0.25 كغم (ربع)' },
                  { w: 0.5, label: '0.5 كغم (نصف)' },
                  { w: 0.75, label: '0.75 كغم' },
                  { w: 1.0, label: '1 كغم' },
                  { w: 1.5, label: '1.5 كغم' },
                  { w: 2.0, label: '2 كغم' },
                ].map((p) => (
                  <button
                    key={p.w}
                    type="button"
                    onClick={() => handleWeightPreset(p.w)}
                    className="py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-950 font-black text-xs rounded-lg border border-amber-300/80 transition-colors cursor-pointer shadow-2xs"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-1.5">
                {[0.1, 0.25, 0.5, 1].map((step) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => handleWeightStep(step)}
                    className="flex-1 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-lg border border-stone-200 transition-colors cursor-pointer"
                  >
                    +{step}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-900">مبالغ شائعة سريعة (د.ع):</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[2000, 3000, 5000, 7000, 10000, 15000, 20000, 25000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleAmountPreset(amt)}
                    className="py-1.5 px-1 bg-amber-50 hover:bg-amber-100 text-amber-950 font-black text-[11px] rounded-lg border border-amber-300/80 transition-colors cursor-pointer shadow-2xs font-mono"
                  >
                    {amt.toLocaleString()}
                  </button>
                ))}
              </div>
              <div className="flex gap-1.5 font-mono">
                {[500, 1000, 2500, 5000].map((step) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => handleAmountStep(step)}
                    className="flex-1 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-lg border border-stone-200 transition-colors cursor-pointer"
                  >
                    +{step.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Touch Numpad Grid */}
          <div className="grid grid-cols-3 gap-1.5 pt-0.5">
            {['7', '8', '9', '4', '5', '6', '1', '2', '3'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleKeyPress(digit)}
                className="py-2.5 sm:py-3 bg-white hover:bg-brand-50 border border-stone-200 rounded-xl font-mono text-xl font-black text-stone-800 active:scale-95 transition-all cursor-pointer shadow-xs"
              >
                {digit}
              </button>
            ))}

            {/* Clear Button */}
            <button
              type="button"
              onClick={handleClear}
              className="py-2.5 sm:py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold text-xs active:scale-95 transition-all cursor-pointer shadow-xs"
            >
              مسح C
            </button>

            {/* Zero */}
            <button
              type="button"
              onClick={() => handleKeyPress('0')}
              className="py-2.5 sm:py-3 bg-white hover:bg-brand-50 border border-stone-200 rounded-xl font-mono text-xl font-black text-stone-800 active:scale-95 transition-all cursor-pointer shadow-xs"
            >
              0
            </button>

            {/* In Weight mode: decimal point / In Amount mode: 000 */}
            {activeMode === 'weight' ? (
              <button
                type="button"
                onClick={() => handleKeyPress('.')}
                className="py-2.5 sm:py-3 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-xl font-mono text-2xl font-black text-stone-800 active:scale-95 transition-all cursor-pointer shadow-xs"
              >
                .
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleKeyPress('000')}
                className="py-2.5 sm:py-3 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-xl font-mono text-sm font-black text-amber-900 active:scale-95 transition-all cursor-pointer shadow-xs"
              >
                000
              </button>
            )}
          </div>

          {/* Action Row */}
          <div className="flex gap-2 pt-1">
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
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 px-3 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 active:scale-98 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>
                {activeMode === 'amount'
                  ? `تأكيد: ${parsedAmount.toLocaleString()} ${currency} (${parsedWeight} كغم)`
                  : `تأكيد الوزن: ${parsedWeight} كغم (${parsedAmount.toLocaleString()} ${currency})`}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React from 'react';
import { numberToArabicWords } from '../../utils/arabicNumberToWords';

export function ExpenseVoucherReceipt({ expense, storeSettings }) {
  if (!expense) return null;

  const dateObj = new Date(expense.date);
  const formattedDate = dateObj.toLocaleDateString('ar-IQ', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
  const formattedTime = dateObj.toLocaleTimeString('ar-IQ', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="receipt-container text-black bg-white select-none font-bold" style={{ color: '#000' }}>
      {/* Header */}
      <div className="text-center pb-2 border-b-2 border-black">
        <div className="text-base font-black tracking-wide text-black">{storeSettings.storeNameAr}</div>
        <div className="text-[11px] font-bold text-black">{storeSettings.storeNameEn}</div>
        <div className="text-xs font-black border-2 border-black px-3 py-0.5 mt-1.5 inline-block">
          سند صرف نقدي (خزينة)
        </div>
      </div>

      {/* Meta */}
      <div className="py-2 border-b-2 border-black space-y-1 text-[10.5px] text-black">
        <div className="flex justify-between">
          <span className="font-black">رقم السند:</span>
          <span className="font-mono font-black">{expense.voucherNo}</span>
        </div>
        <div className="flex justify-between text-[10px]">
          <span>التاريخ: {formattedDate}</span>
          <span>الوقت: {formattedTime}</span>
        </div>
        <div className="flex justify-between text-[10px]">
          <span className="font-bold">التصنيف:</span>
          <span className="font-black border border-black px-1.5">
            {expense.category}
          </span>
        </div>
      </div>

      {/* Amount Box */}
      <div className="py-2.5 border-b-2 border-black text-center space-y-1 text-black">
        <div className="text-[10px] font-black">المبلغ المصروف:</div>
        <div className="text-xl font-mono font-black border-2 border-black py-1 px-4 inline-block">
          {Number(expense.amount).toLocaleString()} {storeSettings.currency}
        </div>
        <div className="text-[10px] font-bold italic leading-snug">
          {numberToArabicWords(Number(expense.amount), storeSettings.currency === 'د.ع' ? 'دينار عراقي' : storeSettings.currency)}
        </div>
      </div>

      {/* Details */}
      <div className="py-2 border-b-2 border-black space-y-2 text-[10.5px] text-black">
        <div>
          <span className="font-black block">يصرف إلى السيد:</span>
          <div className="font-black text-xs pr-1 mt-0.5 border border-black p-1">
            {expense.recipient || 'غير محدد'}
          </div>
        </div>

        <div>
          <span className="font-black block">البيان / السبب:</span>
          <div className="font-bold text-[10px] pr-1 mt-0.5 leading-relaxed">
            {expense.description}
          </div>
        </div>
      </div>

      {/* Footer without signatures */}
      <div className="pt-2 text-center text-[9px] font-bold text-black font-mono">
        سند صرف رسمي مسجل بالنظام • مسك وزعفران
      </div>
    </div>
  );
}

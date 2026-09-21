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
    <div className="receipt-container text-black bg-white select-none">
      {/* Header */}
      <div className="text-center pb-2 border-b border-dashed border-black">
        <div className="text-sm font-black tracking-wide">{storeSettings.storeNameAr}</div>
        <div className="text-[10px] font-semibold text-gray-700">{storeSettings.storeNameEn}</div>
        <div className="text-xs font-black border border-black rounded px-3 py-0.5 mt-1.5 inline-block bg-gray-100">
          سند صرف نقدي (خزينة)
        </div>
      </div>

      {/* Meta */}
      <div className="py-2 border-b border-dashed border-black space-y-1 text-[10px]">
        <div className="flex justify-between">
          <span className="font-bold">رقم السند:</span>
          <span className="font-mono font-bold">{expense.voucherNo}</span>
        </div>
        <div className="flex justify-between text-[9px]">
          <span>التاريخ: {formattedDate}</span>
          <span>الوقت: {formattedTime}</span>
        </div>
        <div className="flex justify-between text-[9.5px]">
          <span className="font-bold">التصنيف:</span>
          <span className="font-semibold bg-gray-100 px-1 rounded border border-gray-300">
            {expense.category}
          </span>
        </div>
      </div>

      {/* Amount Box */}
      <div className="py-2.5 border-b border-dashed border-black text-center">
        <div className="text-[9px] text-gray-600 font-bold mb-0.5">المبلغ المصروف:</div>
        <div className="text-base font-mono font-black border-2 border-black py-1 rounded inline-block px-4 bg-gray-50">
          {Number(expense.amount).toLocaleString()} {storeSettings.currency}
        </div>
        <div className="text-[9px] text-gray-800 italic mt-1 leading-snug">
          {numberToArabicWords(Number(expense.amount), storeSettings.currency === 'د.ع' ? 'دينار عراقي' : storeSettings.currency)}
        </div>
      </div>

      {/* Details */}
      <div className="py-2 border-b border-dashed border-black space-y-1.5 text-[10px]">
        <div>
          <span className="font-bold text-gray-700 block">يصرف إلى السيد:</span>
          <div className="font-black text-[11px] pr-1 mt-0.5 bg-gray-50 p-1 border border-dashed border-gray-300 rounded">
            {expense.recipient || 'غير محدد'}
          </div>
        </div>

        <div>
          <span className="font-bold text-gray-700 block">وذلك لقاء (البيان / السبب):</span>
          <div className="font-medium text-[9.5px] pr-1 mt-0.5 leading-relaxed">
            {expense.description}
          </div>
        </div>
      </div>

      {/* Signatures */}
      <div className="pt-3 space-y-4">
        <div className="flex justify-between text-[9px]">
          <div className="text-center">
            <div>أمين الصندوق:</div>
            <div className="font-bold mt-1">{expense.recordedBy || storeSettings.cashierName}</div>
            <div className="mt-4">....................</div>
          </div>
          <div className="text-center">
            <div>توقيع المستلم:</div>
            <div className="font-bold mt-1">{expense.recipient || 'المستلم'}</div>
            <div className="mt-4">....................</div>
          </div>
        </div>
        <div className="text-[7.5px] text-center text-gray-500 font-mono border-t border-dotted border-gray-300 pt-1">
          سند صرف رسمي مسجل في الأرشيف الدائم
        </div>
      </div>
    </div>
  );
}

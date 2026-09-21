import React from 'react';
import { numberToArabicWords } from '../../utils/arabicNumberToWords';

export function CombinedExpensesReceipt({ expenses, sessionMeta, storeSettings }) {
  if (!expenses || expenses.length === 0) {
    return (
      <div className="receipt-container text-black bg-white text-center py-4">
        لا توجد صرفيات مسجلة لهذا اليوم.
      </div>
    );
  }

  const now = new Date();
  const formattedDate = now.toLocaleDateString('ar-IQ', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
  const formattedTime = now.toLocaleTimeString('ar-IQ', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const totalAmount = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div className="receipt-container text-black bg-white select-none">
      {/* Header */}
      <div className="text-center pb-2 border-b-2 border-black">
        <div className="text-sm font-black tracking-wide">{storeSettings.storeNameAr}</div>
        <div className="text-[10px] font-semibold text-gray-700">{storeSettings.storeNameEn}</div>
        <div className="text-xs font-black bg-black text-white px-3 py-0.5 mt-1.5 inline-block">
          سند صرفيات اليوم المجمع
        </div>
        <div className="text-[9px] mt-1 font-mono text-gray-700">{storeSettings.phone}</div>
      </div>

      {/* Meta Information */}
      <div className="py-2 border-b border-dashed border-black text-[9.5px] space-y-0.5">
        <div className="flex justify-between">
          <span className="font-bold">التاريخ:</span>
          <span className="font-mono">{formattedDate} ({formattedTime})</span>
        </div>
        <div className="flex justify-between">
          <span>الكاشير / المسؤول:</span>
          <span className="font-bold">{storeSettings.cashierName}</span>
        </div>
        <div className="flex justify-between">
          <span>عدد السندات المجمعة:</span>
          <span className="font-mono font-bold">{expenses.length} سند صرف</span>
        </div>
      </div>

      {/* Itemized Expenses Table */}
      <div className="py-2 border-b-2 border-black">
        <table className="w-full text-right text-[9.5px]">
          <thead>
            <tr className="border-b border-black font-bold">
              <th className="py-1 w-10">الرقم</th>
              <th className="py-1">يصرف إلى / البيان</th>
              <th className="py-1 text-left">المبلغ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {expenses.map((item, idx) => (
              <tr key={item.id || idx} className="align-top">
                <td className="py-1 font-mono text-[9px]">{item.voucherNo || `#${idx + 1}`}</td>
                <td className="py-1 pr-1">
                  <div className="font-bold text-gray-900 leading-tight">
                    {item.recipient || 'غير محدد'}
                  </div>
                  <div className="text-[8.5px] text-gray-600 leading-tight mt-0.5">
                    {item.description}
                  </div>
                  <div className="text-[8px] text-gray-500 font-mono">
                    [{item.category}]
                  </div>
                </td>
                <td className="py-1 text-left font-mono font-bold whitespace-nowrap">
                  {Number(item.amount).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Total */}
      <div className="py-2 border-b-2 border-black text-[10.5px] space-y-1">
        <div className="flex justify-between text-xs font-black">
          <span>إجمالي الصرفيات:</span>
          <span className="font-mono text-sm">
            {totalAmount.toLocaleString()} {storeSettings.currency}
          </span>
        </div>
        <div className="text-[9px] text-gray-800 italic leading-snug">
          {numberToArabicWords(
            totalAmount,
            storeSettings.currency === 'د.ع' ? 'دينار عراقي' : storeSettings.currency
          )}
        </div>
      </div>

      {/* Signatures */}
      <div className="pt-3 space-y-4 text-[9px]">
        <div className="flex justify-between">
          <div className="text-center">
            <div>أمين الصندوق:</div>
            <div className="font-bold mt-1">{storeSettings.cashierName}</div>
            <div className="mt-3">....................</div>
          </div>
          <div className="text-center">
            <div>المصادقة الإدارية:</div>
            <div className="font-bold mt-1">الإدارة العامة</div>
            <div className="mt-3">....................</div>
          </div>
        </div>
        <div className="text-[7.5px] text-center text-gray-500 font-mono border-t border-dotted border-gray-300 pt-1">
          طبع بواسطة نظام مسك وزعفران POS • وصل مجمع معتمد
        </div>
      </div>
    </div>
  );
}

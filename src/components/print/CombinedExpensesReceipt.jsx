import React from 'react';
import { numberToArabicWords } from '../../utils/arabicNumberToWords';
import { ReceiptBrandingFooter } from './ReceiptBrandingFooter';

export function CombinedExpensesReceipt({ expenses, sessionMeta, storeSettings }) {
  if (!expenses || expenses.length === 0) {
    return (
      <div className="receipt-container text-black bg-white text-center py-4 font-bold">
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
    <div className="receipt-container text-black bg-white select-none font-bold" style={{ color: '#000' }}>
      {/* Header */}
      <div className="text-center pb-2 border-b-2 border-black">
        <div className="text-base font-black tracking-wide text-black">{storeSettings.storeNameAr}</div>
        <div className="text-[11px] font-bold text-black">{storeSettings.storeNameEn}</div>
        <div className="text-xs font-black bg-white text-black border-2 border-black px-3 py-1 mt-1.5 inline-block">
          سند صرفيات اليوم المجمع
        </div>
        <div className="text-[10px] mt-1 font-mono font-bold text-black">{storeSettings.phone}</div>
      </div>

      {/* Meta Information */}
      <div className="py-2 border-b-2 border-black text-[10px] space-y-0.5 text-black">
        <div className="flex justify-between">
          <span className="font-black">التاريخ والوقت:</span>
          <span className="font-mono font-bold">{formattedDate} ({formattedTime})</span>
        </div>
        <div className="flex justify-between">
          <span>الكاشير:</span>
          <span className="font-black">{storeSettings.cashierName}</span>
        </div>
        <div className="flex justify-between">
          <span>عدد السندات المجمعة:</span>
          <span className="font-mono font-black">{expenses.length} سند صرف</span>
        </div>
      </div>

      {/* Itemized Expenses Table */}
      <div className="py-2 border-b-2 border-black text-black">
        <table className="w-full text-right text-[10px]">
          <thead>
            <tr className="border-b-2 border-black font-black">
              <th className="py-1 w-12">السند</th>
              <th className="py-1">بيان الصرف / التصنيف</th>
              <th className="py-1 text-left">المبلغ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black">
            {expenses.map((item, idx) => (
              <tr key={item.id || idx} className="align-top">
                <td className="py-1.5 font-mono text-[9.5px] font-bold">{item.voucherNo || `#${idx + 1}`}</td>
                <td className="py-1.5 pr-1">
                  <div className="font-black text-black leading-tight">
                    {item.description}
                  </div>
                  <div className="text-[8.5px] text-black font-mono font-bold mt-0.5">
                    [{item.category}]
                  </div>
                </td>
                <td className="py-1.5 text-left font-mono font-black whitespace-nowrap">
                  {Number(item.amount).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Total */}
      <div className="py-2.5 border-b-2 border-black text-[11px] space-y-1 text-black">
        <div className="flex justify-between text-xs font-black">
          <span>إجمالي الصرفيات المجمعة:</span>
          <span className="font-mono text-sm font-black">
            {totalAmount.toLocaleString()} {storeSettings.currency}
          </span>
        </div>
        <div className="text-[9.5px] text-black font-bold italic leading-snug">
          {numberToArabicWords(
            totalAmount,
            storeSettings.currency === 'د.ع' ? 'دينار عراقي' : storeSettings.currency
          )}
        </div>
      </div>

      {/* Footer without signatures */}
      <div className="pt-2 text-center text-[9px] font-bold font-mono text-black">
        نظام مسك وزعفران POS • وصل مجمع معتمد
      </div>

      {/* Universal Footer Branding */}
      <ReceiptBrandingFooter />
    </div>
  );
}

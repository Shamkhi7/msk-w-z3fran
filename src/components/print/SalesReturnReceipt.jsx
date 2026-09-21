import React from 'react';
import { numberToArabicWords } from '../../utils/arabicNumberToWords';

export function SalesReturnReceipt({ returnData, storeSettings }) {
  if (!returnData) return null;

  const dateObj = new Date(returnData.date);
  const formattedDate = dateObj.toLocaleDateString('ar-IQ', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
  const formattedTime = dateObj.toLocaleTimeString('ar-IQ', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const amount = Number(returnData.amount) || 0;

  return (
    <div className="receipt-container text-black bg-white select-none">
      {/* Header */}
      <div className="text-center pb-2 border-b-2 border-black">
        <div className="text-sm font-black tracking-wide">{storeSettings.storeNameAr}</div>
        <div className="text-[10px] font-semibold text-gray-700">{storeSettings.storeNameEn}</div>
        <div className="text-xs font-black bg-black text-white px-3 py-0.5 mt-1.5 inline-block">
          وصل مردود مبيعات (إرجاع نقدي)
        </div>
        <div className="text-[9px] mt-1 font-mono text-gray-700">{storeSettings.phone}</div>
      </div>

      {/* Return Meta */}
      <div className="py-2 border-b border-dashed border-black text-[9.5px] space-y-0.5">
        <div className="flex justify-between">
          <span className="font-bold">رقم سند المردود:</span>
          <span className="font-mono font-bold">{returnData.returnNo}</span>
        </div>
        <div className="flex justify-between">
          <span>التاريخ والوقت:</span>
          <span className="font-mono">{formattedDate} {formattedTime}</span>
        </div>
        <div className="flex justify-between">
          <span>الكاشير:</span>
          <span>{returnData.cashierName || storeSettings.cashierName}</span>
        </div>
        <div className="flex justify-between">
          <span>الزبون:</span>
          <span className="font-bold">{returnData.customerName || 'زبون عام'}</span>
        </div>
        {returnData.originalReceiptNo && (
          <div className="flex justify-between text-gray-700">
            <span>رقم الفاتورة الأصلية:</span>
            <span className="font-mono">{returnData.originalReceiptNo}</span>
          </div>
        )}
      </div>

      {/* Reason / Details */}
      <div className="py-2 border-b border-dashed border-black text-[10px] space-y-1">
        <div>
          <span className="font-bold text-gray-700 block">سبب الإرجاع:</span>
          <div className="font-semibold text-gray-900 pr-1 mt-0.5">
            {returnData.reason || 'إرجاع صنف / طلب زبون'}
          </div>
        </div>

        {returnData.items && returnData.items.length > 0 && (
          <div className="pt-1">
            <span className="font-bold text-gray-700 block text-[9px]">الأصناف المسترجعة:</span>
            <table className="w-full text-right text-[9px] mt-1">
              <thead>
                <tr className="border-b border-gray-400">
                  <th className="py-0.5">الصنف</th>
                  <th className="py-0.5 text-center">الكمية</th>
                  <th className="py-0.5 text-left">المبلغ</th>
                </tr>
              </thead>
              <tbody>
                {returnData.items.map((item, i) => (
                  <tr key={i}>
                    <td className="py-0.5">{item.name}</td>
                    <td className="py-0.5 text-center font-mono">{item.quantity}</td>
                    <td className="py-0.5 text-left font-mono font-bold">
                      -{Number(item.price * item.quantity).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Amount Box */}
      <div className="py-2.5 border-b-2 border-black text-center space-y-1">
        <div className="text-[10px] font-bold text-gray-700">إجمالي المبلغ المعاد نقداً للزبون:</div>
        <div className="text-xl font-mono font-black border-2 border-black py-1 px-3 bg-gray-50 inline-block">
          -{amount.toLocaleString()} {storeSettings.currency}
        </div>
        <div className="text-[9px] text-gray-800 italic leading-snug">
          {numberToArabicWords(
            amount,
            storeSettings.currency === 'د.ع' ? 'دينار عراقي' : storeSettings.currency
          )}
        </div>
      </div>

      {/* Signatures */}
      <div className="pt-3 space-y-4 text-[9px]">
        <div className="flex justify-between">
          <div className="text-center">
            <div>توقيع الكاشير:</div>
            <div className="font-bold mt-1">{storeSettings.cashierName}</div>
            <div className="mt-3">....................</div>
          </div>
          <div className="text-center">
            <div>توقيع المستلم (الزبون):</div>
            <div className="font-bold mt-1">{returnData.customerName || 'الزبون'}</div>
            <div className="mt-3">....................</div>
          </div>
        </div>
        <div className="text-[7.5px] text-center text-gray-500 font-mono border-t border-dotted border-gray-300 pt-1">
          تم خصم المبلغ من إجمالي الإيراد اليومي ونقدية الصندوق
        </div>
      </div>
    </div>
  );
}

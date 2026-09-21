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
    <div className="receipt-container text-black bg-white select-none font-bold" style={{ color: '#000' }}>
      {/* Header */}
      <div className="text-center pb-2 border-b-2 border-black">
        <div className="text-base font-black tracking-wide text-black">{storeSettings.storeNameAr}</div>
        <div className="text-[11px] font-bold tracking-wider text-black">{storeSettings.storeNameEn}</div>
        <div className="text-xs font-black bg-black text-white px-3 py-0.5 mt-1.5 inline-block">
          وصل مردود مبيعات (إرجاع نقدي)
        </div>
        <div className="text-[10px] mt-1 font-mono font-bold text-black">{storeSettings.phone}</div>
      </div>

      {/* Return Meta */}
      <div className="py-2 border-b-2 border-black text-[10px] space-y-0.5 text-black">
        <div className="flex justify-between">
          <span className="font-black">رقم سند المردود:</span>
          <span className="font-mono font-black">{returnData.returnNo}</span>
        </div>
        <div className="flex justify-between">
          <span>التاريخ والوقت:</span>
          <span className="font-mono font-bold">{formattedDate} {formattedTime}</span>
        </div>
        <div className="flex justify-between">
          <span>الكاشير:</span>
          <span className="font-bold">{returnData.cashierName || storeSettings.cashierName}</span>
        </div>
        <div className="flex justify-between">
          <span>الزبون:</span>
          <span className="font-black">{returnData.customerName || 'زبون عام'}</span>
        </div>
        {returnData.originalReceiptNo && (
          <div className="flex justify-between">
            <span>رقم الفاتورة الأصلية:</span>
            <span className="font-mono font-bold">{returnData.originalReceiptNo}</span>
          </div>
        )}
      </div>

      {/* Reason / Details */}
      <div className="py-2 border-b-2 border-black text-[10px] space-y-1 text-black">
        <div>
          <span className="font-black block">سبب الإرجاع:</span>
          <div className="font-bold pr-1 mt-0.5 text-black">
            {returnData.reason || 'إرجاع صنف / طلب زبون'}
          </div>
        </div>

        {returnData.items && returnData.items.length > 0 && (
          <div className="pt-1">
            <span className="font-black block text-[9.5px]">الأصناف المسترجعة:</span>
            <table className="w-full text-right text-[10px] mt-1">
              <thead>
                <tr className="border-b-2 border-black font-black">
                  <th className="py-0.5">الصنف</th>
                  <th className="py-0.5 text-center">الكمية</th>
                  <th className="py-0.5 text-left">المبلغ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black">
                {returnData.items.map((item, i) => (
                  <tr key={i}>
                    <td className="py-1 font-bold">{item.name}</td>
                    <td className="py-1 text-center font-mono font-black">{item.quantity}</td>
                    <td className="py-1 text-left font-mono font-black">
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
      <div className="py-2.5 border-b-2 border-black text-center space-y-1 text-black">
        <div className="text-[10px] font-black">إجمالي المبلغ المعاد نقداً للزبون:</div>
        <div className="text-xl font-mono font-black border-2 border-black py-1 px-3 bg-white text-black inline-block">
          -{amount.toLocaleString()} {storeSettings.currency}
        </div>
        <div className="text-[9.5px] font-bold italic leading-snug text-black">
          {numberToArabicWords(
            amount,
            storeSettings.currency === 'د.ع' ? 'دينار عراقي' : storeSettings.currency
          )}
        </div>
      </div>

      {/* Concise Footer - No Signatures */}
      <div className="pt-2 text-center space-y-1 text-black">
        <div className="text-[9.5px] font-black">
          تم صرف المبلغ نقداً من الصندوق وخصمه من الحساب
        </div>
        <div className="text-[8.5px] font-bold">
          {storeSettings.receiptFooterNote}
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { numberToArabicWords } from '../../utils/arabicNumberToWords';

export function SalesReceipt({ sale, storeSettings }) {
  if (!sale) return null;

  const dateObj = new Date(sale.date);
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
        <div className="text-[11px] font-bold tracking-wider text-black">
          {storeSettings.storeNameEn}
        </div>
        <div className="text-[10px] text-black font-semibold mt-0.5">{storeSettings.tagline}</div>
        <div className="text-[10px] mt-1 font-mono font-bold text-black">{storeSettings.phone} {storeSettings.phone2 && `| ${storeSettings.phone2}`}</div>
        <div className="text-[9.5px] text-black font-medium">{storeSettings.address}</div>
      </div>

      {/* Invoice Meta */}
      <div className="py-2 border-b-2 border-black text-[10.5px] space-y-0.5 text-black">
        <div className="flex justify-between">
          <span className="font-black">رقم الفاتورة:</span>
          <span className="font-mono font-black">{sale.receiptNo}</span>
        </div>
        <div className="flex justify-between text-[10px]">
          <span>التاريخ: {formattedDate}</span>
          <span>الوقت: {formattedTime}</span>
        </div>
        <div className="flex justify-between text-[10px]">
          <span>الكاشير: {sale.cashierName || storeSettings.cashierName}</span>
          <span>الزبون: {sale.customerName || 'زبون عام'}</span>
        </div>
        <div className="flex justify-between text-[10px]">
          <span>طريقة الدفع: {sale.paymentMethod || 'نقداً'}</span>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="py-2 border-b-2 border-black text-black">
        <table className="w-full text-right text-[10px]">
          <thead>
            <tr className="border-b-2 border-black font-black">
              <th className="py-1 w-7 text-center">العدد</th>
              <th className="py-1">الصنف</th>
              <th className="py-1 text-center">السعر</th>
              <th className="py-1 text-left">الإجمالي</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black">
            {sale.items.map((item, idx) => {
              const lineTotal = Math.max(0, item.unitPrice * item.quantity - (item.discount || 0));
              return (
                <tr key={idx} className="align-top">
                  <td className="py-1.5 text-center font-black font-mono">{item.quantity}</td>
                  <td className="py-1.5 pr-1">
                    <div className="font-black leading-tight text-black">{item.product.name}</div>
                    {item.isOverridden && (
                      <div className="text-[9px] text-black font-bold">
                        (سعر خاص - الأصلي: {item.originalPrice.toLocaleString()})
                      </div>
                    )}
                    {item.discount > 0 && (
                      <div className="text-[9px] text-black font-bold font-mono">
                        خصم: -{item.discount.toLocaleString()} {storeSettings.currency}
                      </div>
                    )}
                  </td>
                  <td className="py-1.5 text-center font-mono font-bold">
                    {item.unitPrice.toLocaleString()}
                  </td>
                  <td className="py-1.5 text-left font-mono font-black">
                    {lineTotal.toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Totals Breakdown */}
      <div className="py-2 border-b-2 border-black space-y-1 text-[10.5px] text-black">
        {sale.totalDiscount > 0 && (
          <>
            <div className="flex justify-between">
              <span>المجموع قبل الخصم:</span>
              <span className="font-mono font-bold">{sale.subtotal.toLocaleString()} {storeSettings.currency}</span>
            </div>
            <div className="flex justify-between">
              <span>إجمالي الخصم:</span>
              <span className="font-mono font-black">-{sale.totalDiscount.toLocaleString()} {storeSettings.currency}</span>
            </div>
          </>
        )}

        <div className="flex justify-between text-xs font-black pt-1 border-t-2 border-black">
          <span>المبلغ المطلوب (الصافي):</span>
          <span className="font-mono text-sm font-black">{sale.netTotal.toLocaleString()} {storeSettings.currency}</span>
        </div>

        <div className="text-[9.5px] text-black font-bold italic pt-0.5 leading-snug">
          {numberToArabicWords(sale.netTotal, storeSettings.currency === 'د.ع' ? 'دينار عراقي' : storeSettings.currency)}
        </div>

        <div className="flex justify-between text-[10px] pt-1">
          <span>المبلغ المستلم:</span>
          <span className="font-mono font-black">{(sale.amountReceived || sale.netTotal).toLocaleString()} {storeSettings.currency}</span>
        </div>

        {(sale.changeDue > 0) && (
          <div className="flex justify-between text-[10px] font-black">
            <span>الباقي للزبون:</span>
            <span className="font-mono">{sale.changeDue.toLocaleString()} {storeSettings.currency}</span>
          </div>
        )}
      </div>

      {/* Barcode & Footer (Concise, no signatures) */}
      <div className="pt-2 text-center space-y-1 text-black">
        <div className="inline-block border-2 border-black px-3 py-1 font-mono text-xs font-black tracking-widest">
          *{sale.receiptNo}*
        </div>
        <div className="text-[9.5px] font-bold text-black leading-snug">
          {storeSettings.receiptFooterNote}
        </div>
      </div>
    </div>
  );
}

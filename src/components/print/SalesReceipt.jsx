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
    <div className="receipt-container text-black bg-white select-none">
      {/* Header */}
      <div className="text-center pb-2 border-b border-dashed border-black">
        <div className="text-sm font-black tracking-wide">{storeSettings.storeNameAr}</div>
        <div className="text-[10px] font-semibold tracking-wider text-gray-700">
          {storeSettings.storeNameEn}
        </div>
        <div className="text-[9px] text-gray-600 mt-0.5">{storeSettings.tagline}</div>
        <div className="text-[9px] mt-1 font-mono">{storeSettings.phone} {storeSettings.phone2 && `| ${storeSettings.phone2}`}</div>
        <div className="text-[8.5px] text-gray-600">{storeSettings.address}</div>
      </div>

      {/* Invoice Meta */}
      <div className="py-1.5 border-b border-dashed border-black text-[10px]">
        <div className="flex justify-between">
          <span className="font-bold">رقم الفاتورة:</span>
          <span className="font-mono font-bold">{sale.receiptNo}</span>
        </div>
        <div className="flex justify-between text-[9px] text-gray-700">
          <span>التاريخ: {formattedDate}</span>
          <span>الوقت: {formattedTime}</span>
        </div>
        <div className="flex justify-between text-[9px] text-gray-700">
          <span>الكاشير: {sale.cashierName || storeSettings.cashierName}</span>
          <span>الزبون: {sale.customerName || 'زبون عام'}</span>
        </div>
        <div className="flex justify-between text-[9px] text-gray-700">
          <span>طريقة الدفع: {sale.paymentMethod || 'نقداً'}</span>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="py-1.5 border-b border-dashed border-black">
        <table className="w-full text-right text-[9.5px]">
          <thead>
            <tr className="border-b border-black font-bold">
              <th className="py-0.5 w-6 text-center">الكمية</th>
              <th className="py-0.5">الصنف</th>
              <th className="py-0.5 text-center">السعر</th>
              <th className="py-0.5 text-left">الإجمالي</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sale.items.map((item, idx) => {
              const lineTotal = Math.max(0, item.unitPrice * item.quantity - (item.discount || 0));
              return (
                <tr key={idx} className="align-top">
                  <td className="py-1 text-center font-bold font-mono">{item.quantity}</td>
                  <td className="py-1 pr-1">
                    <div className="font-semibold leading-tight">{item.product.name}</div>
                    {item.isOverridden && (
                      <div className="text-[8px] text-gray-600">
                        سعر معدل (الأصلي: {item.originalPrice.toLocaleString()} {storeSettings.currency})
                      </div>
                    )}
                    {item.discount > 0 && (
                      <div className="text-[8px] text-red-600">
                        خصم: -{item.discount.toLocaleString()} {storeSettings.currency}
                      </div>
                    )}
                  </td>
                  <td className="py-1 text-center font-mono">
                    {item.unitPrice.toLocaleString()}
                  </td>
                  <td className="py-1 text-left font-mono font-bold">
                    {lineTotal.toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Totals Breakdown */}
      <div className="py-1.5 border-b border-dashed border-black space-y-0.5 text-[10px]">
        {sale.totalDiscount > 0 && (
          <>
            <div className="flex justify-between">
              <span>المجموع قبل الخصم:</span>
              <span className="font-mono">{sale.subtotal.toLocaleString()} {storeSettings.currency}</span>
            </div>
            <div className="flex justify-between text-red-600">
              <span>إجمالي الخصم:</span>
              <span className="font-mono">-{sale.totalDiscount.toLocaleString()} {storeSettings.currency}</span>
            </div>
          </>
        )}

        <div className="flex justify-between text-xs font-black pt-1 border-t border-black">
          <span>المبلغ المطلوب (الصافي):</span>
          <span className="font-mono">{sale.netTotal.toLocaleString()} {storeSettings.currency}</span>
        </div>

        <div className="text-[8.5px] text-gray-700 italic pt-0.5">
          {numberToArabicWords(sale.netTotal, storeSettings.currency === 'د.ع' ? 'دينار عراقي' : storeSettings.currency)}
        </div>

        <div className="flex justify-between text-[9.5px] pt-1">
          <span>المبلغ المستلم:</span>
          <span className="font-mono font-bold">{(sale.amountReceived || sale.netTotal).toLocaleString()} {storeSettings.currency}</span>
        </div>

        {(sale.changeDue > 0) && (
          <div className="flex justify-between text-[9.5px] font-bold">
            <span>الباقي للزبون:</span>
            <span className="font-mono">{sale.changeDue.toLocaleString()} {storeSettings.currency}</span>
          </div>
        )}
      </div>

      {/* Barcode & Footer */}
      <div className="pt-2 text-center space-y-1">
        <div className="inline-block border border-black px-3 py-1 font-mono text-xs font-bold tracking-widest">
          *{sale.receiptNo}*
        </div>
        <div className="text-[8.5px] font-medium text-gray-700 leading-snug">
          {storeSettings.receiptFooterNote}
        </div>
        <div className="text-[8px] text-gray-500 font-mono">
          طبع بواسطة نظام مسك وزعفران POS
        </div>
      </div>
    </div>
  );
}

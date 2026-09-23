import React from 'react';
import { numberToArabicWords } from '../../utils/arabicNumberToWords';
import { ReceiptBrandingFooter } from './ReceiptBrandingFooter';

export function ProductMovementReceipt({ reportData, storeSettings }) {
  if (!reportData || !reportData.items || reportData.items.length === 0) {
    return (
      <div className="receipt-container text-black bg-white text-center py-4 font-bold select-none">
        لا توجد مبيعات أصناف مسجلة للفترة المحددة.
      </div>
    );
  }

  const { items, periodLabel, totalQuantity, totalRevenue, printedAt, filteredCategory, shiftFilter, cycleStartDate } = reportData;

  const dateObj = printedAt ? new Date(printedAt) : new Date();
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
      <div className="text-center pb-2 border-b-2 border-black space-y-0.5">
        <div className="text-base font-black tracking-wide text-black">{storeSettings.storeNameAr}</div>
        <div className="text-[11px] font-bold text-black">{storeSettings.storeNameEn}</div>
        <div className="text-xs font-black bg-white text-black border-2 border-black px-3 py-1 mt-1.5 inline-block">
          تقرير مبيعات وحركة الأصناف
        </div>
        <div className="text-[10px] mt-1 font-mono font-bold text-black">{storeSettings.phone}</div>
      </div>

      {/* Meta Information */}
      <div className="py-2 border-b-2 border-black text-[10px] space-y-0.5 text-black">
        <div className="flex justify-between">
          <span className="font-black">الفترة المحددة:</span>
          <span className="font-bold border border-black px-1.5 bg-stone-100">{periodLabel || 'كافة الفترات'}</span>
        </div>
        {filteredCategory && filteredCategory !== 'ALL' && (
          <div className="flex justify-between">
            <span className="font-black">القسم المفلتر:</span>
            <span className="font-bold">{filteredCategory}</span>
          </div>
        )}
        {shiftFilter && (
          <div className="flex justify-between">
            <span className="font-black">الشفت:</span>
            <span className="font-bold">{shiftFilter}</span>
          </div>
        )}
        {cycleStartDate && (
          <div className="flex justify-between text-[9px]">
            <span className="font-black">بداية الدورة الإحصائية:</span>
            <span className="font-mono font-bold">
              {new Date(cycleStartDate).toLocaleDateString('ar-IQ')} ({new Date(cycleStartDate).toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' })})
            </span>
          </div>
        )}
        <div className="flex justify-between text-[9.5px]">
          <span>تاريخ الطباعة:</span>
          <span className="font-mono font-bold">{formattedDate} ({formattedTime})</span>
        </div>
        <div className="flex justify-between text-[9.5px]">
          <span>عدد الأصناف المشمولة:</span>
          <span className="font-mono font-black">{items.length} صنف</span>
        </div>
      </div>

      {/* Items Table */}
      <div className="py-2 border-b-2 border-black text-black">
        <table className="w-full text-right text-[10px]">
          <thead>
            <tr className="border-b-2 border-black font-black">
              <th className="py-1">اسم الصنف / القسم</th>
              <th className="py-1 text-center w-12">الكمية</th>
              <th className="py-1 text-left w-20">الإجمالي</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black">
            {items.map((item, idx) => (
              <tr key={item.id || idx} className="align-top">
                <td className="py-1.5 pr-0.5">
                  <div className="font-black text-black leading-tight text-[10px]">
                    {item.name}
                  </div>
                  <div className="text-[8.5px] text-black font-mono font-bold mt-0.5">
                    [{item.categoryName || item.category || 'عام'}]
                    {item.returnedQuantity > 0 && (
                      <span className="mr-1 font-bold">
                        (خصم {item.returnedQuantity % 1 !== 0 ? `${item.returnedQuantity} كغم` : `${item.returnedQuantity} ق`} مردود)
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-1.5 text-center font-mono font-black whitespace-nowrap text-[10.5px]">
                  {item.quantity % 1 !== 0 ? `${item.quantity} كغم` : item.quantity}
                </td>
                <td className="py-1.5 text-left font-mono font-black whitespace-nowrap text-[10.5px]">
                  {Number(item.totalRevenue).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Grand Totals */}
      <div className="py-2.5 border-b-2 border-black text-[11px] space-y-1.5 text-black">
        <div className="flex justify-between text-xs font-black">
          <span>إجمالي الكميات المباعة:</span>
          <span className="font-mono text-sm font-black border border-black px-2 py-0.5">
            {totalQuantity % 1 !== 0 ? totalQuantity.toFixed(2) : totalQuantity.toLocaleString()} {totalQuantity % 1 !== 0 ? 'كغم' : 'قطعة'}
          </span>
        </div>
        <div className="flex justify-between text-xs font-black pt-1 border-t border-dashed border-black">
          <span>إجمالي القيمة الكلية:</span>
          <span className="font-mono text-base font-black">
            {totalRevenue.toLocaleString()} {storeSettings.currency}
          </span>
        </div>
        <div className="text-[9.5px] text-black font-bold italic leading-snug">
          {numberToArabicWords(
            totalRevenue,
            storeSettings.currency === 'د.ع' ? 'دينار عراقي' : storeSettings.currency
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 text-center text-[9px] font-bold text-black font-mono">
        تقرير إحصائي صادر من نظام مسك وزعفران • حراري 72.1mm
      </div>

      {/* Universal Footer Branding */}
      <ReceiptBrandingFooter />
    </div>
  );
}

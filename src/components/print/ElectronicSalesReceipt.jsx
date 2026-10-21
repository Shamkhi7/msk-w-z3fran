import React from 'react';
import { numberToArabicWords } from '../../utils/arabicNumberToWords';
import { ReceiptBrandingFooter } from './ReceiptBrandingFooter';
import { getReceiptTypography } from '../../utils/receiptTypographyHelper';

export function ElectronicSalesReceipt({ reportData, storeSettings }) {
  const typo = getReceiptTypography(storeSettings);

  if (!reportData || !reportData.transactions || reportData.transactions.length === 0) {
    return (
      <div className="receipt-container text-black bg-white text-center py-4 font-bold select-none" style={typo.containerStyle}>
        لا توجد حركات دفع إلكتروني مسجلة للفترة المحددة.
      </div>
    );
  }

  const {
    transactions,
    periodLabel,
    totalAmount,
    totalCount,
    directSalesTotal,
    depositsTotal,
    printedAt,
    shiftFilter,
    cashierFilter,
  } = reportData;

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
    <div
      className="receipt-container text-black bg-white select-none font-bold"
      style={typo.containerStyle}
    >
      {/* Header */}
      <div className="text-center pb-2 border-b-2 border-black">
        <div className="text-base font-black tracking-wide text-black">
          {storeSettings?.storeNameAr || 'مسك وزعفران'}
        </div>
        <div className="text-[10px] font-bold tracking-wider text-black">
          {storeSettings?.storeNameEn || 'Meska & Zafran'}
        </div>
        <div className="text-xs font-black bg-white text-black border-2 border-black px-2.5 py-1 mt-1.5 inline-block tracking-wider">
          تقرير مبيعات الدفع الإلكتروني (البطاقات)
        </div>
      </div>

      {/* Meta Information */}
      <div className="py-2 border-b-2 border-black space-y-1 text-[10px] text-black">
        <div className="flex justify-between">
          <span className="font-bold">فترة التقرير:</span>
          <span className="font-bold">{periodLabel || 'كافة الفترات'}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-bold">تاريخ وساعة الطباعة:</span>
          <span className="font-mono font-black">{formattedDate} {formattedTime}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-bold">تصفية الوردية / الشفت:</span>
          <span className="font-bold">
            {shiftFilter === 'ALL' || !shiftFilter
              ? 'كافة الورديات'
              : shiftFilter === 'صباحي'
              ? 'الوردية الصباحية'
              : 'الوردية المسائية'}
          </span>
        </div>
        {cashierFilter && cashierFilter !== 'ALL' && (
          <div className="flex justify-between">
            <span className="font-bold">الكاشير / الموظف:</span>
            <span className="font-bold">{cashierFilter}</span>
          </div>
        )}
      </div>

      {/* Grand Summary Box */}
      <div className="py-2 border-b-2 border-black space-y-1 text-black">
        <div className="p-2 border-2 border-black text-center space-y-1 bg-white">
          <div className="text-[10px] font-black">إجمالي مقبوضات الدفع الإلكتروني</div>
          <div className="text-lg font-mono font-black tracking-tight">
            {Number(totalAmount || 0).toLocaleString()} {storeSettings?.currency || 'د.ع'}
          </div>
          <div className="text-[9px] font-bold italic leading-tight">
            {numberToArabicWords(
              totalAmount || 0,
              (storeSettings?.currency === 'د.ع' ? 'دينار عراقي' : storeSettings?.currency) || 'دينار عراقي'
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-1 text-[9.5px] pt-1">
          <div className="p-1 border border-black text-center">
            <span className="block text-[8.5px] font-bold">عدد العمليات</span>
            <span className="font-mono font-black">{totalCount || transactions.length}</span>
          </div>
          <div className="p-1 border border-black text-center">
            <span className="block text-[8.5px] font-bold">مبيعات مباشرة بالبطاقة</span>
            <span className="font-mono font-black">{Number(directSalesTotal || 0).toLocaleString()}</span>
          </div>
        </div>

        {Number(depositsTotal || 0) > 0 && (
          <div className="p-1 border border-black text-center text-[9.5px]">
            <span className="text-[8.5px] font-bold">عربين حجوزات بالبطاقة: </span>
            <span className="font-mono font-black">{Number(depositsTotal).toLocaleString()} {storeSettings?.currency || 'د.ع'}</span>
          </div>
        )}
      </div>

      {/* Itemized Transactions Table */}
      <div className="py-2 border-b-2 border-black text-black">
        <div className="font-black text-center text-[10.5px] pb-1 mb-1 border-b border-black">
          سجل الحركات والفواتير الإلكترونية ({transactions.length})
        </div>

        <table className="w-full text-right text-[9.5px]">
          <thead>
            <tr className="border-b border-black font-black text-[9px]">
              <th className="py-0.5 pr-0.5">الوصل / الوقت</th>
              <th className="py-0.5">البيان والأصناف</th>
              <th className="py-0.5 text-left pl-0.5 w-18">المبلغ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dashed divide-black">
            {transactions.map((t, idx) => {
              const tTime = t.date
                ? new Date(t.date).toLocaleTimeString('ar-IQ', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '-';

              const itemsDesc = Array.isArray(t.items) && t.items.length > 0
                ? t.items.map((i) => `${i.product?.name || i.name} (×${i.quantity})`).join('، ')
                : (t.notes || 'دفع إلكتروني');

              return (
                <tr key={t.id || idx} className="align-top">
                  <td className="py-1 pr-0.5 font-mono text-[9px]">
                    <div className="font-black">{t.receiptNo}</div>
                    <div className="text-[8px] text-stone-700">{tTime}</div>
                  </td>
                  <td className="py-1 px-1 leading-snug">
                    <div className="font-bold text-[9px] line-clamp-2">{itemsDesc}</div>
                    <div className="text-[8px] text-stone-600">
                      {t.cashierName || 'كاشير'} • {t.shiftType || 'صباحي'}
                    </div>
                  </td>
                  <td className="py-1 pl-0.5 text-left font-mono font-black whitespace-nowrap">
                    {Number(t.netTotal || t.amount || 0).toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Manager Isolation Notice */}
      <div className="pt-1.5 text-center text-[8.5px] font-bold text-black leading-snug">
        * تقرير إداري خاص: مبالغ الدفع الإلكتروني معزولة عن كاش الصندوق النقدي الفعلي.
      </div>

      {/* Universal Footer Branding */}
      <ReceiptBrandingFooter />
    </div>
  );
}

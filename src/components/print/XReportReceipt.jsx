import React from 'react';
import { numberToArabicWords } from '../../utils/arabicNumberToWords';

export function XReportReceipt({ reportData, storeSettings }) {
  if (!reportData) return null;

  const formatDate = (isoString) => {
    if (!isoString) return '-';
    const d = new Date(isoString);
    return `${d.toLocaleDateString('ar-IQ')} ${d.toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const directSales = Number(reportData.directSales) || 0;
  const salesReturns = Number(reportData.salesReturns) || 0;
  const collectedDeposits = Number(reportData.collectedDeposits) || 0;
  const dailyExpenses = Number(reportData.dailyExpenses) || 0;
  const netInflows = (directSales - salesReturns) + collectedDeposits;
  const netCash = Number(reportData.netCash) || 0;
  const itemizedItems = reportData.itemizedItems || [];

  return (
    <div className="receipt-container text-black bg-white select-none font-bold" style={{ color: '#000' }}>
      {/* Header */}
      <div className="text-center pb-2 border-b-2 border-black">
        <div className="text-base font-black tracking-wide text-black">{storeSettings.storeNameAr}</div>
        <div className="text-[11px] font-bold tracking-wider text-black">{storeSettings.storeNameEn}</div>
        <div className="text-xs font-black bg-black text-white px-3 py-1 mt-1.5 inline-block tracking-wider">
          معاينة مبيعات اليوم (X-REPORT)
        </div>
        <div className="text-[10px] mt-1 font-mono font-bold text-black">{storeSettings.phone}</div>
      </div>

      {/* Notice Banner */}
      <div className="py-1.5 px-2 my-1 border-2 border-dashed border-black text-center text-[10px] font-black">
        معاينة مؤقتة للوردية الحالية - لم يتم تصفير الصندوق
      </div>

      {/* Shift Meta */}
      <div className="py-2 border-b-2 border-black space-y-1 text-[10px] text-black">
        <div className="flex justify-between">
          <span className="font-black">الكاشير الحالي:</span>
          <span className="font-black">{reportData.cashierName || storeSettings.cashierName}</span>
        </div>
        <div className="flex justify-between">
          <span>وقت المعاينة:</span>
          <span className="font-mono font-bold">{formatDate(reportData.currentTime || new Date().toISOString())}</span>
        </div>
        <div className="flex justify-between">
          <span>بداية الوردية:</span>
          <span className="font-mono font-bold">{formatDate(reportData.openedAt)}</span>
        </div>
        <div className="flex justify-between text-[9px]">
          <span>معرّف الجلسة:</span>
          <span className="font-mono font-bold">{reportData.sessionId}</span>
        </div>
      </div>

      {/* Itemized Sold Products Section */}
      <div className="py-2 border-b-2 border-black text-black">
        <div className="font-black text-center text-xs pb-1 mb-1 border-b-2 border-black">
          تفاصيل الأصناف المباعة خلال الوردية
        </div>

        {itemizedItems.length === 0 ? (
          <div className="text-center py-2 text-[10px] font-bold">
            لا توجد مبيعات مسجلة حتى الآن في هذه الوردية
          </div>
        ) : (
          <table className="w-full text-right text-[10px]">
            <thead>
              <tr className="border-b-2 border-black font-black">
                <th className="py-1 text-center w-8">العدد</th>
                <th className="py-1">اسم الصنف</th>
                <th className="py-1 text-left">المجموع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black">
              {itemizedItems.map((item, idx) => (
                <tr key={idx} className="align-top">
                  <td className="py-1 text-center font-mono font-black">{item.quantity}</td>
                  <td className="py-1 pr-1 font-bold leading-tight">{item.name}</td>
                  <td className="py-1 text-left font-mono font-black">
                    {Number(item.total).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-black font-black text-[10.5px]">
                <td className="py-1 text-center font-mono">
                  {itemizedItems.reduce((acc, it) => acc + it.quantity, 0)}
                </td>
                <td className="py-1 pr-1">إجمالي عدد القطع المباعة</td>
                <td className="py-1 text-left font-mono">
                  {itemizedItems.reduce((acc, it) => acc + it.total, 0).toLocaleString()} {storeSettings.currency}
                </td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      {/* Financial Matrix */}
      <div className="py-2 border-b-2 border-black space-y-1.5 text-[10px] text-black">
        <div className="font-black border-b-2 border-black pb-1 text-center text-xs">
          ملخص حركة النقدية الحالية
        </div>

        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="font-bold">1. إجمالي المبيعات المباشرة:</span>
            <span className="font-mono font-black">{directSales.toLocaleString()} {storeSettings.currency}</span>
          </div>

          {salesReturns > 0 && (
            <div className="flex justify-between">
              <span className="font-bold">مردود ومسترجع مبيعات (-):</span>
              <span className="font-mono font-black">-{salesReturns.toLocaleString()} {storeSettings.currency}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="font-bold">2. مقبوضات العربون (مفصلة):</span>
            <span className="font-mono font-black">+{collectedDeposits.toLocaleString()} {storeSettings.currency}</span>
          </div>

          <div className="flex justify-between font-black text-[10.5px] border-t-2 border-black pt-1">
            <span>إجمالي المقبوضات الصافية:</span>
            <span className="font-mono font-black">{netInflows.toLocaleString()} {storeSettings.currency}</span>
          </div>
        </div>

        {/* Outflows */}
        <div className="space-y-1 pt-1 border-t-2 border-dashed border-black">
          <div className="flex justify-between font-bold">
            <span>3. إجمالي الصرفيات المسجلة (-):</span>
            <span className="font-mono font-black">-{dailyExpenses.toLocaleString()} {storeSettings.currency}</span>
          </div>
        </div>

        {/* Net Cash In Drawer */}
        <div className="pt-2 border-t-2 border-black">
          <div className="p-2 border-2 border-black text-center space-y-1 bg-white text-black">
            <div className="text-[10.5px] font-black">الصافي النقدي المتوقع بالصندوق الآن</div>
            <div className="text-xl font-mono font-black tracking-tight">
              {netCash.toLocaleString()} {storeSettings.currency}
            </div>
            <div className="text-[9.5px] font-bold italic leading-snug">
              {numberToArabicWords(netCash, storeSettings.currency === 'د.ع' ? 'دينار عراقي' : storeSettings.currency)}
            </div>
          </div>
        </div>
      </div>

      {/* Counts & Statistics */}
      <div className="py-2 border-b-2 border-black grid grid-cols-2 gap-2 text-center text-[10px] text-black">
        <div className="p-1.5 border-2 border-black">
          <span className="block text-[9px] font-bold">فواتير البيع</span>
          <span className="font-mono font-black text-sm">{reportData.salesCount || 0}</span>
        </div>
        <div className="p-1.5 border-2 border-black">
          <span className="block text-[9px] font-bold">سندات الصرف</span>
          <span className="font-mono font-black text-sm">{reportData.expensesCount || 0}</span>
        </div>
      </div>

      {/* Concise Footer - Zero Signatures */}
      <div className="pt-2 text-center space-y-1 text-black">
        <div className="text-[10px] font-black">
          تقرير معاينة لحظي للوردية الحالية
        </div>
        <div className="text-[8.5px] font-bold">
          مسك وزعفران للمخبوزات والحلويات الملكية
        </div>
      </div>
    </div>
  );
}

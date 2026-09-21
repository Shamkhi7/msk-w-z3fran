import React from 'react';
import { numberToArabicWords } from '../../utils/arabicNumberToWords';

export function ZReportReceipt({ report, storeSettings }) {
  if (!report) return null;

  const formatDate = (isoString) => {
    if (!isoString) return '-';
    const d = new Date(isoString);
    return `${d.toLocaleDateString('ar-IQ')} ${d.toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const directSales = report.directSales || 0;
  const salesReturns = report.salesReturns || 0;
  const collectedDeposits = report.collectedDeposits || 0;
  const dailyExpenses = report.dailyExpenses || 0;
  const netInflows = (directSales - salesReturns) + collectedDeposits;

  return (
    <div className="receipt-container text-black bg-white select-none font-bold" style={{ color: '#000' }}>
      {/* Header */}
      <div className="text-center pb-2 border-b-2 border-black">
        <div className="text-base font-black tracking-wide text-black">{storeSettings.storeNameAr}</div>
        <div className="text-[11px] font-bold tracking-wider text-black">{storeSettings.storeNameEn}</div>
        <div className="text-xs font-black bg-black text-white px-3 py-1 mt-1.5 inline-block tracking-wider">
          تقرير الإغلاق وتصفير الصندوق (Z-REPORT)
        </div>
        <div className="text-[10px] mt-1 font-mono font-black text-black">رقم التقرير: {report.reportNo}</div>
      </div>

      {/* Shift Meta */}
      <div className="py-2 border-b-2 border-black space-y-1 text-[10px] text-black">
        <div className="flex justify-between">
          <span className="font-black">رقم الجلسة:</span>
          <span className="font-mono font-bold text-[9.5px]">{report.sessionId}</span>
        </div>
        <div className="flex justify-between">
          <span>وقت فتح الصندوق:</span>
          <span className="font-mono font-bold">{formatDate(report.openedAt)}</span>
        </div>
        <div className="flex justify-between">
          <span>وقت الإغلاق:</span>
          <span className="font-mono font-bold">{formatDate(report.closedAt)}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-black">المسؤول عن الإغلاق:</span>
          <span className="font-black">{report.closedBy || storeSettings.cashierName}</span>
        </div>
      </div>

      {/* Financial Matrix */}
      <div className="py-2 border-b-2 border-black space-y-1.5 text-[10px] text-black">
        <div className="font-black border-b-2 border-black pb-1 text-center text-xs">
          ملخص حركة النقدية اليومية
        </div>

        {/* Inflows & Sales */}
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
            <span>3. إجمالي الصرفيات اليومية:</span>
            <span className="font-mono font-black">-{dailyExpenses.toLocaleString()} {storeSettings.currency}</span>
          </div>
        </div>

        {/* Net Cash In Drawer */}
        <div className="pt-2 border-t-2 border-black">
          <div className="p-2 border-2 border-black text-center space-y-1 bg-white text-black">
            <div className="text-[10.5px] font-black">صافي النقد الفعلي بالصندوق</div>
            <div className="text-xl font-mono font-black tracking-tight">
              {(report.netCash || 0).toLocaleString()} {storeSettings.currency}
            </div>
            <div className="text-[9.5px] font-bold italic leading-snug">
              {numberToArabicWords(report.netCash || 0, storeSettings.currency === 'د.ع' ? 'دينار عراقي' : storeSettings.currency)}
            </div>
          </div>
        </div>
      </div>

      {/* Counts & Statistics */}
      <div className="py-2 border-b-2 border-black grid grid-cols-2 gap-2 text-center text-[10px] text-black">
        <div className="p-1.5 border-2 border-black">
          <span className="block text-[9px] font-bold">فواتير البيع</span>
          <span className="font-mono font-black text-sm">{report.salesCount || 0}</span>
        </div>
        <div className="p-1.5 border-2 border-black">
          <span className="block text-[9px] font-bold">سندات الصرف</span>
          <span className="font-mono font-black text-sm">{report.expensesCount || 0}</span>
        </div>
      </div>

      {report.notes && (
        <div className="py-1.5 border-b-2 border-black text-[9.5px] text-black">
          <span className="font-black">ملاحظات الإغلاق:</span>
          <div className="font-bold pr-1">{report.notes}</div>
        </div>
      )}

      {/* Concise Footer - No Signatures */}
      <div className="pt-2 text-center space-y-1 text-black">
        <div className="text-[10px] font-black">
          تم تصفير الصندوق بنجاح وأرشفة اليومية إلكترونياً
        </div>
        <div className="text-[8.5px] font-bold">
          مسك وزعفران للمخبوزات والحلويات الملكية
        </div>
      </div>
    </div>
  );
}

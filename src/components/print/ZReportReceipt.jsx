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
    <div className="receipt-container text-black bg-white select-none">
      {/* Header */}
      <div className="text-center pb-2 border-b-2 border-black">
        <div className="text-sm font-black tracking-wide">{storeSettings.storeNameAr}</div>
        <div className="text-[10px] font-semibold text-gray-700">{storeSettings.storeNameEn}</div>
        <div className="text-xs font-black bg-black text-white px-3 py-1 mt-1.5 inline-block tracking-wider">
          تقرير الإغلاق وتصفير الصندوق (Z-REPORT)
        </div>
        <div className="text-[9px] mt-1 font-mono text-gray-700">رقم التقرير: {report.reportNo}</div>
      </div>

      {/* Shift Meta */}
      <div className="py-2 border-b border-dashed border-black space-y-1 text-[9.5px]">
        <div className="flex justify-between">
          <span className="font-bold">رقم الجلسة:</span>
          <span className="font-mono text-[9px]">{report.sessionId}</span>
        </div>
        <div className="flex justify-between">
          <span>وقت فتح الصندوق:</span>
          <span className="font-mono">{formatDate(report.openedAt)}</span>
        </div>
        <div className="flex justify-between">
          <span>وقت الإغلاق:</span>
          <span className="font-mono">{formatDate(report.closedAt)}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-bold">المسؤول عن الإغلاق:</span>
          <span className="font-bold">{report.closedBy || storeSettings.cashierName}</span>
        </div>
      </div>

      {/* Financial Matrix */}
      <div className="py-2 border-b-2 border-black space-y-1.5 text-[10px]">
        <div className="font-bold border-b border-gray-300 pb-0.5 text-center text-[10.5px]">
          ملخص حركة النقدية اليومية
        </div>

        {/* Inflows & Sales */}
        <div className="space-y-1">
          <div className="flex justify-between text-gray-800">
            <span>1. إجمالي المبيعات المباشرة:</span>
            <span className="font-mono font-bold">{directSales.toLocaleString()} {storeSettings.currency}</span>
          </div>

          {salesReturns > 0 && (
            <div className="flex justify-between text-red-700">
              <span>مردود ومسترجع مبيعات (-):</span>
              <span className="font-mono font-bold">-{salesReturns.toLocaleString()} {storeSettings.currency}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span>2. مقبوضات العربون (مفصلة):</span>
            <span className="font-mono font-bold">+{collectedDeposits.toLocaleString()} {storeSettings.currency}</span>
          </div>

          <div className="flex justify-between font-bold text-[10px] border-t border-dotted border-gray-400 pt-0.5">
            <span>إجمالي المقبوضات الصافية:</span>
            <span className="font-mono">{netInflows.toLocaleString()} {storeSettings.currency}</span>
          </div>
        </div>

        {/* Outflows */}
        <div className="space-y-1 pt-1 border-t border-dashed border-black">
          <div className="flex justify-between">
            <span>3. إجمالي الصرفيات اليومية:</span>
            <span className="font-mono font-bold">-{dailyExpenses.toLocaleString()} {storeSettings.currency}</span>
          </div>
        </div>

        {/* Net Cash In Drawer */}
        <div className="pt-2 border-t-2 border-black">
          <div className="bg-gray-100 p-2 border-2 border-black text-center space-y-1">
            <div className="text-[10px] font-bold">صافي النقد الفعلي بالصندوق</div>
            <div className="text-base font-mono font-black tracking-tight">
              {(report.netCash || 0).toLocaleString()} {storeSettings.currency}
            </div>
            <div className="text-[8.5px] text-gray-800 italic leading-snug">
              {numberToArabicWords(report.netCash || 0, storeSettings.currency === 'د.ع' ? 'دينار عراقي' : storeSettings.currency)}
            </div>
          </div>
        </div>
      </div>

      {/* Counts & Statistics */}
      <div className="py-2 border-b border-dashed border-black grid grid-cols-2 gap-2 text-center text-[9.5px]">
        <div className="bg-gray-50 p-1 border border-gray-200 rounded">
          <span className="text-gray-600 block text-[8.5px]">فواتير البيع:</span>
          <span className="font-mono font-bold text-xs">{report.salesCount || 0}</span>
        </div>
        <div className="bg-gray-50 p-1 border border-gray-200 rounded">
          <span className="text-gray-600 block text-[8.5px]">سندات الصرف:</span>
          <span className="font-mono font-bold text-xs">{report.expensesCount || 0}</span>
        </div>
      </div>

      {report.notes && (
        <div className="py-1.5 border-b border-dashed border-black text-[9px]">
          <span className="font-bold">ملاحظات الإغلاق:</span>
          <div className="text-gray-700 pr-1">{report.notes}</div>
        </div>
      )}

      {/* Signatures */}
      <div className="pt-3 space-y-4 text-[9px]">
        <div className="flex justify-between">
          <div className="text-center">
            <div>كاشير الوردية:</div>
            <div className="font-bold mt-1">{report.closedBy}</div>
            <div className="mt-4">....................</div>
          </div>
          <div className="text-center">
            <div>مدير الفرع / الإدارة:</div>
            <div className="font-bold mt-1">المصادقة</div>
            <div className="mt-4">....................</div>
          </div>
        </div>
        <div className="text-[7.5px] text-center text-gray-500 font-mono border-t border-dotted border-gray-300 pt-1">
          تم تصفير الصندوق بنجاح وتمت أرشفة البيانات تلقائياً
        </div>
      </div>
    </div>
  );
}

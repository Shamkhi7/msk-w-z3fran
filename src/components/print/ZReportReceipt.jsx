import React from 'react';
import { numberToArabicWords } from '../../utils/arabicNumberToWords';

export function ZReportReceipt({ report, storeSettings }) {
  if (!report) return null;

  const formatDate = (isoString) => {
    if (!isoString) return '-';
    const d = new Date(isoString);
    return `${d.toLocaleDateString('ar-IQ')} ${d.toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const totalInflows = (report.directSales || 0) + (report.collectedDeposits || 0);

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

        {/* Inflows */}
        <div className="space-y-1">
          <div className="flex justify-between text-gray-800">
            <span>1. إجمالي المبيعات المباشرة:</span>
            <span className="font-mono font-bold">{(report.directSales || 0).toLocaleString()} {storeSettings.currency}</span>
          </div>

          <div className="flex justify-between text-emerald-800 bg-emerald-50 px-1 py-0.5 rounded border border-dashed border-emerald-300">
            <span>2. مقبوضات العربون (مفصلة):</span>
            <span className="font-mono font-bold">+{(report.collectedDeposits || 0).toLocaleString()} {storeSettings.currency}</span>
          </div>

          <div className="flex justify-between font-bold text-[10.5px] border-t border-dotted border-gray-400 pt-0.5">
            <span>إجمالي المقبوضات (1 + 2):</span>
            <span className="font-mono">{totalInflows.toLocaleString()} {storeSettings.currency}</span>
          </div>
        </div>

        {/* Outflows */}
        <div className="space-y-1 pt-1 border-t border-dashed border-black">
          <div className="flex justify-between text-rose-800 bg-rose-50 px-1 py-0.5 rounded border border-dashed border-rose-300">
            <span>3. إجمالي الصرفيات اليومية:</span>
            <span className="font-mono font-bold">-{(report.dailyExpenses || 0).toLocaleString()} {storeSettings.currency}</span>
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
          <span className="text-gray-600 block text-[8.5px]">عدد فواتير البيع:</span>
          <span className="font-mono font-bold text-xs">{report.salesCount || 0}</span>
        </div>
        <div className="bg-gray-50 p-1 border border-gray-200 rounded">
          <span className="text-gray-600 block text-[8.5px]">عدد سندات الصرف:</span>
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

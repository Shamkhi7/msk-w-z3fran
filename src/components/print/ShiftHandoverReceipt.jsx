import React from 'react';
import { numberToArabicWords } from '../../utils/arabicNumberToWords';
import { ReceiptBrandingFooter } from './ReceiptBrandingFooter';

export function ShiftHandoverReceipt({ handoverData, storeSettings }) {
  if (!handoverData) return null;

  const formatDate = (isoString) => {
    if (!isoString) return '-';
    const d = new Date(isoString);
    return `${d.toLocaleDateString('ar-IQ')} - ${d.toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const isMorning = handoverData.shiftType === 'صباحي';
  const shiftLabel = isMorning ? 'الشفت الصباحي ☀️' : 'الشفت المسائي 🌙';

  const directSales = Number(handoverData.directSales) || 0;
  const salesReturns = Number(handoverData.salesReturns) || 0;
  const collectedDeposits = Number(handoverData.collectedDeposits) || 0;
  const dailyExpenses = Number(handoverData.dailyExpenses) || 0;
  const netInflows = (directSales - salesReturns) + collectedDeposits;
  const netCash = Number(handoverData.netCash) || 0;

  return (
    <div
      className="receipt-container text-black bg-white select-none font-bold"
      style={{
        color: '#000000',
        width: '72.1mm',
        maxWidth: '72.1mm',
        margin: '0 auto',
        padding: '2mm',
        fontSize: '11px',
        lineHeight: '1.25',
      }}
    >
      {/* Header */}
      <div className="text-center pb-2 border-b-2 border-black">
        <div className="text-base font-black tracking-wide text-black" style={{ color: '#000000' }}>
          {storeSettings?.storeNameAr || 'مسك وزعفران'}
        </div>
        <div className="text-[10px] font-bold tracking-wider text-black" style={{ color: '#000000' }}>
          {storeSettings?.storeNameEn || 'Meska & Zafran'}
        </div>
        <div
          className="text-xs font-black bg-white text-black border-2 border-black px-3 py-1 mt-1.5 inline-block tracking-wider"
          style={{ backgroundColor: '#ffffff', color: '#000000' }}
        >
          وصل تسليم الوردية (HANDOVER)
        </div>
        <div className="text-xs font-black mt-1 text-black" style={{ color: '#000000' }}>
          {shiftLabel}
        </div>
      </div>

      {/* Meta Information */}
      <div className="py-2 border-b-2 border-black space-y-1 text-[10px] text-black" style={{ color: '#000000' }}>
        <div className="flex justify-between">
          <span className="font-bold">رقم الجلسة:</span>
          <span className="font-mono font-black text-[9px]">{handoverData.sessionId}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-bold">تاريخ ووقت التسليم:</span>
          <span className="font-mono font-black">{formatDate(handoverData.handoverTime)}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-black">الكاشير المسلّم:</span>
          <span className="font-black text-[11px]">{handoverData.cashierName || storeSettings?.cashierName || 'كاشير'}</span>
        </div>
      </div>

      {/* Shift Financials */}
      <div className="py-2 border-b-2 border-black space-y-1.5 text-[10px] text-black" style={{ color: '#000000' }}>
        <div className="font-black border-b border-black pb-0.5 text-center text-[11px]">
          خلاصة حركة نقدية الشفت
        </div>

        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="font-bold">1. مبيعات الشفت المباشرة:</span>
            <span className="font-mono font-black">{directSales.toLocaleString()} {storeSettings?.currency || 'د.ع'}</span>
          </div>

          {salesReturns > 0 && (
            <div className="flex justify-between">
              <span className="font-bold">مردودات مبيعات الشفت (-):</span>
              <span className="font-mono font-black">-{salesReturns.toLocaleString()} {storeSettings?.currency || 'د.ع'}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="font-bold">2. مقبوضات العربون:</span>
            <span className="font-mono font-black">+{collectedDeposits.toLocaleString()} {storeSettings?.currency || 'د.ع'}</span>
          </div>

          <div className="flex justify-between font-black text-[10.5px] border-t border-dashed border-black pt-1">
            <span>صافي المقبوضات:</span>
            <span className="font-mono font-black">{netInflows.toLocaleString()} {storeSettings?.currency || 'د.ع'}</span>
          </div>
        </div>

        <div className="space-y-1 pt-1 border-t border-black">
          <div className="flex justify-between font-bold">
            <span>3. صرفيات الشفت (-):</span>
            <span className="font-mono font-black">-{dailyExpenses.toLocaleString()} {storeSettings?.currency || 'د.ع'}</span>
          </div>
        </div>

        {/* Net Shift Balance */}
        <div className="pt-2 border-t-2 border-black">
          <div className="p-2 border-2 border-black text-center space-y-1 bg-white text-black" style={{ borderColor: '#000000', color: '#000000' }}>
            <div className="text-[10.5px] font-black">صافي نقدية عهدة الشفت</div>
            <div className="text-xl font-mono font-black tracking-tight" style={{ color: '#000000' }}>
              {netCash.toLocaleString()} {storeSettings?.currency || 'د.ع'}
            </div>
            <div className="text-[9.5px] font-bold italic leading-snug" style={{ color: '#000000' }}>
              {numberToArabicWords(netCash, (storeSettings?.currency === 'د.ع' ? 'دينار عراقي' : storeSettings?.currency) || 'دينار عراقي')}
            </div>
          </div>
        </div>
      </div>

      {/* Operations Counts */}
      <div className="py-2 border-b-2 border-black grid grid-cols-2 gap-1.5 text-center text-[10px] text-black" style={{ color: '#000000' }}>
        <div className="p-1 border border-black">
          <span className="block text-[8.5px] font-bold">فواتير البيع</span>
          <span className="font-mono font-black text-xs">{handoverData.salesCount || 0}</span>
        </div>
        <div className="p-1 border border-black">
          <span className="block text-[8.5px] font-bold">سندات الصرف</span>
          <span className="font-mono font-black text-xs">{handoverData.expensesCount || 0}</span>
        </div>
      </div>

      {/* Footer - No Signatures */}
      <div className="pt-2 text-center space-y-1 text-black" style={{ color: '#000000' }}>
        <div className="text-[9.5px] font-black">
          تم استخراج ملخص تسليم الوردية بنجاح
        </div>
        <div className="text-[8px] font-bold">
          مسك وزعفران للمخبوزات والحلويات الملكية
        </div>
      </div>

      {/* Universal Footer Branding */}
      <ReceiptBrandingFooter />
    </div>
  );
}

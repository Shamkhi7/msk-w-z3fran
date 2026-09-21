import React from 'react';
import { numberToArabicWords } from '../../utils/arabicNumberToWords';

export function ReservationReceipt({ reservation, storeSettings }) {
  if (!reservation) return null;

  return (
    <div className="receipt-container text-black bg-white select-none font-bold" style={{ color: '#000' }}>
      {/* Header */}
      <div className="text-center pb-2 border-b-2 border-black">
        <div className="text-base font-black tracking-wide text-black">{storeSettings.storeNameAr}</div>
        <div className="text-[11px] font-bold text-black">{storeSettings.storeNameEn}</div>
        <div className="text-xs font-black border-2 border-black px-3 py-0.5 mt-1 inline-block">
          وصل حجز قالب كيك
        </div>
        <div className="text-[10px] mt-1 font-mono font-bold text-black">{storeSettings.phone}</div>
      </div>

      {/* Booking Details */}
      <div className="py-2 border-b-2 border-black space-y-1 text-[10.5px] text-black">
        <div className="flex justify-between">
          <span className="font-black">رقم الحجز:</span>
          <span className="font-mono font-black">{reservation.receiptNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-black">اسم الزبون:</span>
          <span className="font-bold">{reservation.customerName}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-black">رقم الهاتف:</span>
          <span className="font-mono font-black">{reservation.phone}</span>
        </div>
        <div className="flex justify-between border-2 border-black p-1">
          <span className="font-black">موعد الاستلام:</span>
          <span className="font-black text-[11px]">
            {reservation.pickupDate} ({reservation.pickupTime})
          </span>
        </div>
      </div>

      {/* Cake Specifications */}
      <div className="py-2 border-b-2 border-black space-y-1.5 text-[10.5px] text-black">
        <div className="flex justify-between items-center">
          <span className="font-black">قياس القالب:</span>
          <span className="font-black px-2 py-0.5 bg-black text-white text-xs">
            قياس {reservation.cakeSize}
          </span>
        </div>

        {reservation.cakeFlavor && (
          <div>
            <span className="font-black text-[9.5px] block">نكهة وحشوة الكيك:</span>
            <div className="font-bold text-[10px] pr-1">{reservation.cakeFlavor}</div>
          </div>
        )}

        {reservation.writtenText && (
          <div className="border-2 border-black p-1.5 text-center">
            <span className="font-black text-[9.5px] block">العبارة المطلوبة على الكيك:</span>
            <div className="font-black text-xs mt-0.5 text-black font-serif">
              "{reservation.writtenText}"
            </div>
          </div>
        )}

        {reservation.cakeDesign && (
          <div>
            <span className="font-black text-[9.5px] block">تفاصيل التصميم والشكل:</span>
            <div className="font-bold text-[9.5px] pr-1">{reservation.cakeDesign}</div>
          </div>
        )}

        {reservation.notes && (
          <div>
            <span className="font-black text-[9.5px] block">ملاحظات إضافية:</span>
            <div className="text-[9.5px] font-bold text-black pr-1">{reservation.notes}</div>
          </div>
        )}
      </div>

      {/* Financials & Balance */}
      <div className="py-2 border-b-2 border-black space-y-1 text-[11px] text-black">
        <div className="flex justify-between">
          <span>المبلغ الإجمالي للكيك:</span>
          <span className="font-mono font-bold">{reservation.totalCost.toLocaleString()} {storeSettings.currency}</span>
        </div>
        <div className="flex justify-between">
          <span>العربون المقبوض:</span>
          <span className="font-mono font-bold">{reservation.depositPaid.toLocaleString()} {storeSettings.currency}</span>
        </div>
        <div className="flex justify-between text-xs font-black pt-1 border-t-2 border-black">
          <span>المبلغ المتبقي عند الاستلام:</span>
          <span className="font-mono text-sm font-black">{reservation.remainingBalance.toLocaleString()} {storeSettings.currency}</span>
        </div>
        <div className="text-[9.5px] font-bold italic leading-snug">
          {numberToArabicWords(reservation.remainingBalance, storeSettings.currency === 'د.ع' ? 'دينار عراقي' : storeSettings.currency)}
        </div>
      </div>

      {/* Footer Terms (Strictly concise, NO signatures) */}
      <div className="pt-2 text-center text-[9.5px] font-bold leading-tight text-black">
        * يرجى إبراز هذا الوصل عند استلام الطلبية في الموعد المحدد.
        <br />* العربون غير قابل للاسترداد بعد البدء بتجهيز الكيك.
      </div>
    </div>
  );
}

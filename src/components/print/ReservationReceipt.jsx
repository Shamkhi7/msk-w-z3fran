import React from 'react';
import { numberToArabicWords } from '../../utils/arabicNumberToWords';

export function ReservationReceipt({ reservation, storeSettings }) {
  if (!reservation) return null;

  return (
    <div className="receipt-container text-black bg-white select-none">
      {/* Header */}
      <div className="text-center pb-2 border-b border-dashed border-black">
        <div className="text-sm font-black tracking-wide">{storeSettings.storeNameAr}</div>
        <div className="text-[10px] font-semibold text-gray-700">{storeSettings.storeNameEn}</div>
        <div className="text-[11px] font-black border border-black rounded px-2 py-0.5 mt-1 inline-block bg-gray-100">
          وصل حجز قالب كيك
        </div>
        <div className="text-[9px] mt-1 font-mono">{storeSettings.phone}</div>
      </div>

      {/* Booking Details */}
      <div className="py-2 border-b border-dashed border-black space-y-1 text-[10px]">
        <div className="flex justify-between">
          <span className="font-bold">رقم الحجز:</span>
          <span className="font-mono font-bold">{reservation.receiptNumber}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-bold">اسم الزبون:</span>
          <span className="font-semibold">{reservation.customerName}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-bold">رقم الهاتف:</span>
          <span className="font-mono">{reservation.phone}</span>
        </div>
        <div className="flex justify-between bg-gray-50 p-1 border border-dashed border-gray-400 rounded">
          <span className="font-bold">موعد الاستلام:</span>
          <span className="font-bold text-[10.5px]">
            {reservation.pickupDate} ({reservation.pickupTime})
          </span>
        </div>
      </div>

      {/* Cake Specifications */}
      <div className="py-2 border-b border-dashed border-black space-y-1.5 text-[10px]">
        <div className="flex justify-between items-center">
          <span className="font-bold">قياس القالب:</span>
          <span className="font-black px-2 py-0.5 bg-black text-white text-[11px] rounded">
            قياس {reservation.cakeSize}
          </span>
        </div>

        {reservation.cakeFlavor && (
          <div>
            <span className="font-bold text-[9px] text-gray-600 block">نكهة وحشوة الكيك:</span>
            <div className="font-medium text-[9.5px] pr-1">{reservation.cakeFlavor}</div>
          </div>
        )}

        {reservation.writtenText && (
          <div className="bg-gray-50 p-1.5 border border-dashed border-black rounded">
            <span className="font-bold text-[9px] block text-gray-700">العبارة المطلوبة على الكيك:</span>
            <div className="font-black text-center text-xs mt-0.5 text-black font-serif">
              "{reservation.writtenText}"
            </div>
          </div>
        )}

        {reservation.cakeDesign && (
          <div>
            <span className="font-bold text-[9px] text-gray-600 block">تفاصيل التصميم والشكل:</span>
            <div className="font-medium text-[9px] pr-1">{reservation.cakeDesign}</div>
          </div>
        )}

        {reservation.notes && (
          <div>
            <span className="font-bold text-[9px] text-gray-600 block">ملاحظات إضافية:</span>
            <div className="text-[9px] text-gray-800 pr-1">{reservation.notes}</div>
          </div>
        )}
      </div>

      {/* Financials & Balance */}
      <div className="py-2 border-b border-dashed border-black space-y-1 text-[10.5px]">
        <div className="flex justify-between">
          <span>المبلغ الإجمالي للكيك:</span>
          <span className="font-mono font-bold">{reservation.totalCost.toLocaleString()} {storeSettings.currency}</span>
        </div>
        <div className="flex justify-between font-semibold">
          <span>العربون المقبوض:</span>
          <span className="font-mono">{reservation.depositPaid.toLocaleString()} {storeSettings.currency}</span>
        </div>
        <div className="flex justify-between text-xs font-black pt-1 border-t border-black">
          <span>المبلغ المتبقي عند الاستلام:</span>
          <span className="font-mono">{reservation.remainingBalance.toLocaleString()} {storeSettings.currency}</span>
        </div>
        <div className="text-[8.5px] text-gray-600 italic">
          {numberToArabicWords(reservation.remainingBalance, storeSettings.currency === 'د.ع' ? 'دينار عراقي' : storeSettings.currency)}
        </div>
      </div>

      {/* Terms & Signature */}
      <div className="pt-2 text-center space-y-2">
        <div className="text-[8px] text-gray-600 leading-tight">
          * يرجى إبراز هذا الوصل عند استلام الطلبية في الموعد المحدد.
          <br />* العربون غير قابل للاسترداد بعد البدء بتجهيز الكيك.
        </div>
        <div className="flex justify-between pt-4 text-[9px] border-t border-dotted border-gray-400">
          <span>توقيع الكاشير: ............</span>
          <span>توقيع الزبون: ............</span>
        </div>
      </div>
    </div>
  );
}

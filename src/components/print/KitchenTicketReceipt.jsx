import React from 'react';
import { formatPickupDateTime } from '../../utils/dateFormatter';
import { ReceiptBrandingFooter } from './ReceiptBrandingFooter';

export function KitchenTicketReceipt({ reservation, storeSettings }) {
  if (!reservation) return null;

  const formattedSchedule = formatPickupDateTime(reservation.pickupDate, reservation.pickupTime);

  const cakeMolds = (reservation.cakeMolds && reservation.cakeMolds.length > 0)
    ? reservation.cakeMolds
    : ((reservation.hasMold !== false && (reservation.cakeSize || reservation.hasMold))
        ? [{
            cakeSize: reservation.cakeSize,
            cakeFlavor: reservation.cakeFlavor,
            cakeDesign: reservation.cakeDesign,
            writtenText: reservation.writtenText,
          }]
        : []);
  const hasMold = cakeMolds.length > 0;

  const hasSlices =
    reservation.hasSlices === true ||
    reservation.reservationType === 'cake_slices' ||
    (reservation.sliceTiers && reservation.sliceTiers.length > 0) ||
    Number(reservation.totalPieces) > 0;

  return (
    <div className="receipt-container text-black bg-white select-none font-bold" style={{ color: '#000' }}>
      {/* Header */}
      <div className="text-center pb-2 border-b-2 border-black">
        <div className="text-base font-black text-black">{storeSettings.storeNameAr}</div>
        <div className="text-[11px] font-bold text-black">{storeSettings.storeNameEn}</div>
        <div className="text-xs font-black border-2 border-black px-3 py-1 mt-1.5 inline-block bg-white text-black">
          بون المعمل والإنتاج (للشيف) 👨‍🍳
        </div>
      </div>

      {/* Booking Identification & Pickup Schedule */}
      <div className="py-2 border-b-2 border-black space-y-1 text-[10.5px] text-black">
        {reservation.manualBookingNo && (
          <div className="border-2 border-black p-1.5 text-center my-1 bg-white">
            <span className="font-black text-[10px] block">رقم الحجز اليدوي:</span>
            <div className="font-mono font-black text-base text-black">
              #{reservation.manualBookingNo}
            </div>
          </div>
        )}
        <div className="flex justify-between">
          <span className="font-black">رقم الحجز بالنظام:</span>
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
        {reservation.workerName && (
          <div className="flex justify-between">
            <span className="font-black">الموظف المستلم للحجز:</span>
            <span className="font-bold">{reservation.workerName}</span>
          </div>
        )}

        {/* Prominent Pickup Schedule */}
        <div className="border-2 border-black p-2 text-center my-1.5 bg-white">
          <div className="text-[10px] font-black text-black">تاريخ وموعد تسليم الطلبية للشيف:</div>
          <div className="font-black text-sm text-black mt-0.5" dir="rtl">
            {formattedSchedule}
          </div>
        </div>
      </div>

      {/* SECTION 1: CAKE MOLDS PRODUCTION SPECIFICATIONS (NO PRICES) */}
      {hasMold && (
        <div className="py-2 border-b-2 border-black space-y-2.5 text-[10.5px] text-black">
          {cakeMolds.map((mold, idx) => (
            <div key={mold.id || idx} className="space-y-1.5 pb-2 border-b border-dashed border-black last:border-b-0 last:pb-0">
              <div className="flex justify-between items-center bg-white text-black border-2 border-black px-2 py-1 text-xs font-black">
                <span>
                  {cakeMolds.length > 1 ? `مواصفات قالب (${idx + 1}):` : 'مواصفات قالب الكيك:'}
                </span>
                <span className="font-mono font-black text-sm">قياس {mold.cakeSize}</span>
              </div>

              {/* Custom Written Text - Highly Prominent */}
              {mold.writtenText ? (
                <div className="border-2 border-black p-1.5 text-center my-1 bg-white">
                  <span className="font-black text-[9.5px] block underline">العبارة المطلوبة على القالب:</span>
                  <div className="font-black text-sm mt-0.5 text-black font-serif">
                    "{mold.writtenText}"
                  </div>
                </div>
              ) : (
                <div className="text-[9.5px] text-stone-600 font-normal">
                  (لا توجد عبارة كتابة على هذا القالب)
                </div>
              )}

              {/* Cake Design / Shape - Prominent */}
              {mold.cakeDesign && (
                <div className="border-2 border-black p-1.5 text-center my-1 bg-white">
                  <span className="font-black text-[9.5px] block underline">تفاصيل الشكل والتصميم:</span>
                  <div className="font-black text-xs mt-0.5 text-black leading-snug">
                    {mold.cakeDesign}
                  </div>
                </div>
              )}

              {/* Flavor / Filling */}
              {mold.cakeFlavor && (
                <div className="text-[10.5px] pt-0.5 flex justify-between">
                  <span className="font-black">نكهة وحشوة القالب:</span>
                  <span className="font-bold">{mold.cakeFlavor}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* SECTION 2: ACCOMPANYING ITEMS / SLICES ALERT BOX (ZERO PRICES) */}
      {hasSlices && (
        <div className="py-2 border-b-2 border-black space-y-1.5 text-[10.5px] text-black">
          {/* High-Visibility Chef Alert Box */}
          <div className="border-2 border-black p-2 text-center my-1 bg-white">
            <div className="font-black text-xs leading-snug">
              ⚠️ تنبيه مهم للشيف: توجد أصناف وقطع إضافية مع الطلبية ⚠️
            </div>
          </div>

          <div className="flex justify-between items-center px-1 font-black text-xs">
            <span>إجمالي قطع الكيك المرفقة:</span>
            <span className="font-mono text-sm">{reservation.totalPieces || 0} قطعة</span>
          </div>

          {/* Slices Breakdown by Quantity (NO PRICES) */}
          {reservation.sliceTiers && reservation.sliceTiers.length > 0 && (
            <div className="border border-black my-1">
              <div className="flex justify-between bg-white border-b border-black px-2 py-0.5 text-[9.5px] font-black">
                <span>الفئة المطلوبة</span>
                <span>الكمية</span>
              </div>
              {reservation.sliceTiers.map((tier, idx) => (
                <div key={idx} className="flex justify-between px-2 py-0.5 border-b border-stone-300 last:border-b-0 text-[10px]">
                  <span>فئة {Number(tier.tierPrice).toLocaleString()}</span>
                  <span className="font-mono font-black">{tier.quantity} قطعة</span>
                </div>
              ))}
            </div>
          )}

          {/* Packaging specification */}
          {reservation.hasPackaging && (
            <div className="border border-black p-1 text-center text-[10px] font-black bg-white">
              📦 يتطلب تعليب وتغليف مخصص للقطع
            </div>
          )}

          {reservation.slicesFlavor && (
            <div className="text-[10px] pt-0.5">
              <span className="font-black text-[9.5px]">نكهات وتشكيلة القطع: </span>
              <span className="font-bold">{reservation.slicesFlavor}</span>
            </div>
          )}
        </div>
      )}

      {/* General Kitchen Notes */}
      {reservation.notes && (
        <div className="py-2 border-b-2 border-black text-[10.5px] text-black space-y-1">
          <span className="font-black text-[10px] block underline">ملاحظات خاصة بالشيف والمعمل:</span>
          <div className="font-bold pr-1 leading-snug">{reservation.notes}</div>
        </div>
      )}

      {/* End of Production Ticket Notice */}
      <div className="pt-2 text-center text-[9px] font-bold text-black">
        --- بون خاص بقسم الإنتاج والتحضير - لا يحتوي على مبالغ مالية ---
      </div>

      {/* Universal Receipt Footer Branding */}
      <ReceiptBrandingFooter />
    </div>
  );
}

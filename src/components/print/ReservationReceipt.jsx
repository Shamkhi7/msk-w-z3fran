import React from 'react';
import { numberToArabicWords } from '../../utils/arabicNumberToWords';
import { formatPickupDateTime } from '../../utils/dateFormatter';
import { ReceiptBrandingFooter } from './ReceiptBrandingFooter';

export function ReservationReceipt({ reservation, storeSettings }) {
  if (!reservation) return null;

  const formattedSchedule = formatPickupDateTime(reservation.pickupDate, reservation.pickupTime);

  const cakeMolds = (reservation.cakeMolds && reservation.cakeMolds.length > 0)
    ? reservation.cakeMolds
    : ((reservation.hasMold !== false && (reservation.cakeSize || reservation.hasMold))
        ? [{
            cakeSize: reservation.cakeSize,
            moldPrice: reservation.moldPrice,
            cakeFlavor: reservation.cakeFlavor,
            cakeDesign: reservation.cakeDesign,
            writtenText: reservation.writtenText,
          }]
        : []);
  const hasMold = cakeMolds.length > 0;

  const hasSlices =
    reservation.hasSlices === true ||
    reservation.reservationType === 'cake_slices' ||
    (reservation.sliceTiers && reservation.sliceTiers.length > 0);

  let headerTitle = 'وصل حجز قالب كيك';
  if (cakeMolds.length > 1 && hasSlices) {
    headerTitle = `وصل حجز طلبية مجمعة (${cakeMolds.length} قوالب + قطع)`;
  } else if (cakeMolds.length > 1) {
    headerTitle = `وصل حجز (${cakeMolds.length}) قوالب كيك`;
  } else if (hasMold && hasSlices) {
    headerTitle = 'وصل حجز طلبية مجمعة (قالب + قطع)';
  } else if (hasSlices) {
    headerTitle = 'وصل حجز قطع كيك';
  }

  return (
    <div className="receipt-container text-black bg-white select-none font-bold" style={{ color: '#000' }}>
      {/* Header */}
      <div className="text-center pb-2 border-b-2 border-black">
        <div className="text-base font-black tracking-wide text-black">{storeSettings.storeNameAr}</div>
        <div className="text-[11px] font-bold text-black">{storeSettings.storeNameEn}</div>
        <div className="text-xs font-black border-2 border-black px-3 py-1 mt-1 inline-block bg-white text-black">
          {headerTitle}
        </div>
        <div className="text-[10px] mt-1 font-mono font-bold text-black">{storeSettings.phone}</div>
      </div>

      {/* Booking Details */}
      <div className="py-2 border-b-2 border-black space-y-1 text-[10.5px] text-black">
        {reservation.manualBookingNo && (
          <div className="border-2 border-black p-1.5 text-center my-1 bg-white">
            <span className="font-black text-[10px] block">رقم الحجز اليدوي:</span>
            <div className="font-mono font-black text-sm text-black">
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
        {/* Prominent Pickup Schedule with Day of Week */}
        <div className="border-2 border-black p-1.5 text-center my-1 bg-white">
          <div className="text-[10px] font-black text-black">تاريخ ووقت الاستلام:</div>
          <div className="font-black text-xs text-black tracking-wide mt-0.5" dir="rtl">
            {formattedSchedule}
          </div>
        </div>
      </div>

      {/* SECTION A: CAKE MOLDS SPECIFICATIONS (IF INCLUDED) */}
      {hasMold && (
        <div className="py-2 border-b-2 border-black space-y-2 text-[10.5px] text-black">
          {cakeMolds.map((mold, idx) => (
            <div key={mold.id || idx} className="space-y-1 pb-1.5 border-b border-dashed border-black last:border-b-0 last:pb-0">
              <div className="flex justify-between items-center bg-white text-black border-2 border-black px-2 py-1 text-xs font-black">
                <span>
                  {cakeMolds.length > 1 ? `مواصفات قالب (${idx + 1}):` : 'مواصفات قالب الكيك:'}
                </span>
                <span>قياس {mold.cakeSize}</span>
              </div>

              {Number(mold.moldPrice) > 0 && (
                <div className="flex justify-between font-bold text-[10px]">
                  <span>سعر القالب:</span>
                  <span className="font-mono font-black">
                    {Number(mold.moldPrice).toLocaleString()} {storeSettings.currency}
                  </span>
                </div>
              )}

              {mold.writtenText && (
                <div className="border-2 border-black p-1 text-center my-1 bg-white">
                  <span className="font-black text-[9px] block">العبارة المطلوبة على القالب:</span>
                  <div className="font-black text-xs mt-0.5 text-black font-serif">
                    "{mold.writtenText}"
                  </div>
                </div>
              )}

              {mold.cakeDesign && (
                <div className="border-2 border-black p-1 text-center my-1 bg-white">
                  <span className="font-black text-[9px] block">تفاصيل الشكل والتصميم:</span>
                  <div className="font-black text-xs mt-0.5 text-black">
                    {mold.cakeDesign}
                  </div>
                </div>
              )}

              {mold.cakeFlavor && (
                <div className="text-[10px] pt-0.5">
                  <span className="font-black text-[9px]">نكهة وحشوة القالب: </span>
                  <span className="font-bold">{mold.cakeFlavor}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* SECTION B: CAKE SLICES SPECIFICATIONS (IF INCLUDED) */}
      {hasSlices && (
        <div className="py-2 border-b-2 border-black space-y-1 text-[10.5px] text-black">
          <div className="flex justify-between items-center bg-white text-black border-2 border-black px-2 py-1 text-xs font-black">
            <span>تفاصيل قطع الكيك:</span>
            <span>{reservation.totalPieces} قطعة</span>
          </div>

          {/* Slices Table */}
          <div className="border border-black my-1">
            <div className="flex justify-between bg-white border-b border-black px-1.5 py-0.5 text-[9.5px] font-black">
              <span>الفئة والكمية</span>
              <span>المجموع</span>
            </div>
            {reservation.sliceTiers && reservation.sliceTiers.length > 0 ? (
              reservation.sliceTiers.map((tier, idx) => (
                <div key={idx} className="flex justify-between px-1.5 py-0.5 border-b border-stone-300 last:border-b-0 text-[10px]">
                  <span>
                    فئة {Number(tier.tierPrice).toLocaleString()} د.ع × {tier.quantity} قطعة
                  </span>
                  <span className="font-mono font-bold">
                    {Number(tier.subtotal || (tier.quantity * tier.tierPrice)).toLocaleString()} {storeSettings.currency}
                  </span>
                </div>
              ))
            ) : (
              <div className="px-1.5 py-0.5 text-[10px]">قطع متنوعة ({reservation.totalPieces} قطعة)</div>
            )}
          </div>

          {/* Packaging Fee Line Item (if enabled) */}
          {reservation.hasPackaging && (
            <div className="flex justify-between items-center border border-black p-1 bg-stone-50 text-[10.5px]">
              <span className="font-black">أجور تعليب ({reservation.totalPieces} قطعة × 250 د.ع):</span>
              <span className="font-mono font-black">
                {Number(reservation.packagingTotal || 0).toLocaleString()} {storeSettings.currency}
              </span>
            </div>
          )}

          {reservation.slicesFlavor && (
            <div className="text-[10px]">
              <span className="font-black text-[9px]">تشكيلة ونكهات القطع: </span>
              <span className="font-bold">{reservation.slicesFlavor}</span>
            </div>
          )}
        </div>
      )}

      {/* General Notes */}
      {reservation.notes && (
        <div className="py-1.5 border-b-2 border-black text-[10px] text-black">
          <span className="font-black text-[9px] block">ملاحظات إضافية:</span>
          <div className="font-bold pr-1">{reservation.notes}</div>
        </div>
      )}

      {/* Financials & Balance */}
      <div className="py-2 border-b-2 border-black space-y-1 text-[11px] text-black">
        <div className="flex justify-between">
          <span className="font-black">المجموع الكلي للطلبية:</span>
          <span className="font-mono font-bold text-xs">{reservation.totalCost.toLocaleString()} {storeSettings.currency}</span>
        </div>
        <div className="flex justify-between">
          <span>العربون المستلم الآن:</span>
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

      {/* Footer Terms */}
      <div className="pt-2 text-center text-[9.5px] font-bold leading-tight text-black">
        * يرجى إبراز هذا الوصل عند استلام الطلبية في الموعد المحدد أعلاه.
        <br />* العربون غير قابل للاسترداد بعد البدء بتجهيز الطلب.
      </div>

      {/* Universal Footer Branding */}
      <ReceiptBrandingFooter />
    </div>
  );
}

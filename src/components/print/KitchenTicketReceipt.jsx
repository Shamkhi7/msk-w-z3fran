import React from 'react';
import { formatPickupDateTime } from '../../utils/dateFormatter';
import { ReceiptBrandingFooter } from './ReceiptBrandingFooter';
import { getKitchenTicketTypography } from '../../utils/receiptTypographyHelper';

export function KitchenTicketReceipt({ reservation, storeSettings }) {
  if (!reservation) return null;

  const typo = getKitchenTicketTypography(storeSettings);
  const kitCfg = typo.config;
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
    <div className="receipt-container text-black bg-white select-none font-bold" style={typo.containerStyle}>
      {/* Header */}
      <div className={`pb-2 ${typo.dividerClass} text-center`}>
        {kitCfg.showLogo && storeSettings.logo && (
          <div className="flex justify-center mb-1">
            <img
              src={storeSettings.logo}
              alt="Store Logo"
              style={{
                filter: typo.logoFilter,
                maxHeight: `${kitCfg.logoSize || 48}px`,
              }}
              className="max-w-[120px] object-contain"
            />
          </div>
        )}

        <div
          style={{
            fontSize: `${typo.sizes.title}px`,
            fontWeight: typo.blackWeightCss,
          }}
          className="text-black leading-tight"
        >
          {storeSettings.storeNameAr}
        </div>

        {storeSettings.storeNameEn && (
          <div style={{ fontSize: `${typo.sizes.sub}px`, fontWeight: typo.weightCss }} className="text-black">
            {storeSettings.storeNameEn}
          </div>
        )}

        <div
          style={{ fontSize: `${kitCfg.pickupBannerSize || 18}px`, fontWeight: typo.blackWeightCss }}
          className="border-2 border-black px-3 py-1 mt-1.5 inline-block bg-white text-black"
        >
          {kitCfg.ticketTitle || 'بون المعمل والإنتاج (للشيف)'}
        </div>
      </div>

      {/* Booking Identification & Pickup Schedule */}
      <div style={{ fontSize: `${kitCfg.specsAndNotesSize || 14}px` }} className={`py-2 ${typo.dividerClass} space-y-1 text-black`}>
        {reservation.manualBookingNo && (
          <div className="border-2 border-black p-1.5 text-center my-1 bg-white space-y-0.5">
            <span style={{ fontSize: `${typo.sizes.small}px` }} className="font-bold block">
              {kitCfg.manualTicketLabel || 'رقم الحجز اليدوي:'}
            </span>
            <div
              className="font-mono text-black leading-none"
              style={{
                fontSize: `${kitCfg.manualTicketSize || 24}px`,
                fontWeight: kitCfg.manualTicketBold !== false ? typo.blackWeightCss : typo.weightCss,
              }}
            >
              #{reservation.manualBookingNo}
            </div>
          </div>
        )}
        <div className="flex justify-between items-baseline">
          <span className="font-black">{kitCfg.systemTicketLabel || 'رقم الحجز بالنظام:'}</span>
          <span className="font-mono font-black" style={{ fontSize: `${kitCfg.customerNameSize || 16}px` }}>
            {reservation.receiptNumber}
          </span>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="font-black">{kitCfg.customerLabel || 'اسم الزبون:'}</span>
          <span
            style={{
              fontSize: `${kitCfg.customerNameSize || 16}px`,
              fontWeight: kitCfg.customerNameBold !== false ? typo.blackWeightCss : typo.weightCss,
            }}
          >
            {reservation.customerName}
          </span>
        </div>
        {kitCfg.showCustomerPhone !== false && reservation.phone && (
          <div className="flex justify-between items-baseline">
            <span className="font-black">{kitCfg.phoneLabel || 'رقم الهاتف:'}</span>
            <span
              className="font-mono font-black"
              style={{
                fontSize: `${kitCfg.customerPhoneSize || 14}px`,
                fontWeight: kitCfg.customerPhoneBold !== false ? typo.blackWeightCss : typo.weightCss,
              }}
            >
              {reservation.phone}
            </span>
          </div>
        )}
        {reservation.workerName && (
          <div className="flex justify-between">
            <span className="font-black">{kitCfg.workerLabel || 'الموظف المستلم للحجز:'}</span>
            <span className="font-bold">{reservation.workerName}</span>
          </div>
        )}

        {/* Clean Delivery Info */}
        {kitCfg.showDeliveryAddress !== false && reservation.isDelivery && (
          <div style={{ fontSize: `${typo.sizes.small}px` }} className="pt-1 mt-1 border-t border-dashed border-black space-y-0.5">
            <div className="flex justify-between">
              <span className="font-black">نوع الاستلام:</span>
              <span className="font-bold">توصيل خارجي</span>
            </div>
            {reservation.deliveryAddress && (
              <div className="flex justify-between">
                <span className="font-black">عنوان التوصيل:</span>
                <span className="font-bold break-words">{reservation.deliveryAddress}</span>
              </div>
            )}
            {reservation.deliveryPhone && reservation.deliveryPhone !== reservation.phone && (
              <div className="flex justify-between">
                <span className="font-black">هاتف التوصيل:</span>
                <span className="font-mono font-bold">{reservation.deliveryPhone}</span>
              </div>
            )}
            {reservation.deliveryNotes && (
              <div className="flex justify-between">
                <span className="font-black">ملاحظات التوصيل:</span>
                <span className="font-bold">{reservation.deliveryNotes}</span>
              </div>
            )}
          </div>
        )}

        {/* Prominent Pickup Schedule */}
        <div className="border-2 border-black p-2 text-center my-1.5 bg-white">
          <div style={{ fontSize: `${typo.sizes.small}px` }} className="font-black text-black">
            {kitCfg.pickupHeaderLabel || 'تاريخ وموعد تسليم الطلبية للشيف:'}
          </div>
          <div
            className="text-black mt-0.5 leading-tight"
            style={{
              fontSize: `${kitCfg.pickupBannerSize || 18}px`,
              fontWeight: kitCfg.pickupBannerBold !== false ? typo.blackWeightCss : typo.weightCss,
            }}
            dir="rtl"
          >
            {formattedSchedule}
          </div>
        </div>
      </div>

      {/* SECTION 1: CAKE MOLDS PRODUCTION SPECIFICATIONS (NO PRICES) */}
      {hasMold && (
        <div style={{ fontSize: `${kitCfg.specsAndNotesSize || 14}px` }} className={`py-2 ${typo.dividerClass} space-y-2.5 text-black`}>
          {cakeMolds.map((mold, idx) => (
            <div key={mold.id || idx} className="space-y-1.5 pb-2 border-b border-dashed border-black last:border-b-0 last:pb-0">
              <div
                className="flex justify-between items-center bg-white text-black border-2 border-black px-2 py-1 font-black"
                style={{ fontSize: `${(kitCfg.specsAndNotesSize || 14) + 1}px` }}
              >
                <span>
                  {cakeMolds.length > 1 ? `مواصفات قالب (${idx + 1}):` : 'مواصفات قالب الكيك:'}
                </span>
                <span className="font-mono font-black">قياس {mold.cakeSize}</span>
              </div>

              {/* Custom Written Text - Decorated Frame Option */}
              {mold.writtenText && kitCfg.showWrittenText !== false && (
                <div
                  className={`text-center my-1 ${
                    kitCfg.decoratedInscriptionFrame !== false
                      ? 'border-4 border-double border-black p-2 bg-stone-50'
                      : 'border-2 border-black p-1.5 bg-white'
                  }`}
                >
                  <span style={{ fontSize: `${typo.sizes.small}px` }} className="font-black block underline">
                    {kitCfg.decoratedInscriptionFrame !== false
                      ? `${kitCfg.inscriptionLabel || 'العبارة المطلوبة بالكريمة'} (مطلوبة بدقة للشيف):`
                      : (kitCfg.inscriptionLabel || 'العبارة المطلوبة بالكريمة:')}
                  </span>
                  <div
                    className="mt-0.5 text-black font-serif break-words leading-tight"
                    style={{
                      fontSize: `${kitCfg.inscriptionSize || 18}px`,
                      fontWeight: kitCfg.inscriptionBold !== false ? typo.blackWeightCss : typo.weightCss,
                    }}
                  >
                    "{mold.writtenText}"
                  </div>
                </div>
              )}

              {/* Cake Design / Shape - Prominent */}
              {mold.cakeDesign && kitCfg.showDesign !== false && (
                <div className="border-2 border-black p-1.5 text-center my-1 bg-white">
                  <span style={{ fontSize: `${typo.sizes.small}px` }} className="font-black block underline">
                    {kitCfg.designLabel || 'تفاصيل الشكل والتصميم:'}
                  </span>
                  <div
                    className="mt-0.5 text-black leading-snug break-words"
                    style={{
                      fontSize: `${kitCfg.specsAndNotesSize || 14}px`,
                      fontWeight: kitCfg.specsAndNotesBold !== false ? typo.blackWeightCss : typo.weightCss,
                    }}
                  >
                    {mold.cakeDesign}
                  </div>
                </div>
              )}

              {/* Flavor / Filling */}
              {mold.cakeFlavor && kitCfg.showFlavor !== false && (
                <div
                  className="pt-0.5 flex justify-between"
                  style={{
                    fontSize: `${kitCfg.specsAndNotesSize || 14}px`,
                    fontWeight: kitCfg.specsAndNotesBold !== false ? typo.blackWeightCss : typo.weightCss,
                  }}
                >
                  <span className="font-black">{kitCfg.flavorLabel || 'نكهة وحشوة القالب:'}</span>
                  <span className="font-bold">{mold.cakeFlavor}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* SECTION 2: ACCOMPANYING ITEMS / SLICES ALERT BOX (ZERO PRICES) */}
      {hasSlices && (
        <div style={{ fontSize: `${kitCfg.specsAndNotesSize || 14}px` }} className={`py-2 ${typo.dividerClass} space-y-1.5 text-black`}>
          {/* High-Visibility Chef Alert Box */}
          <div className="border-2 border-black p-2 text-center my-1 bg-white">
            <div className="font-black leading-snug" style={{ fontSize: `${kitCfg.specsAndNotesSize || 14}px` }}>
              تنبيه مهم للشيف: توجد أصناف وقطع إضافية مع الطلبية
            </div>
          </div>

          <div className="flex justify-between items-center px-1 font-black" style={{ fontSize: `${kitCfg.specsAndNotesSize || 14}px` }}>
            <span>إجمالي قطع الكيك المرفقة:</span>
            <span className="font-mono font-black" style={{ fontSize: `${kitCfg.customerNameSize || 16}px` }}>{reservation.totalPieces || 0} قطعة</span>
          </div>

          {/* Slices Breakdown by Quantity (NO PRICES) */}
          {reservation.sliceTiers && reservation.sliceTiers.length > 0 && (
            <div className="border border-black my-1">
              <div
                className="flex justify-between bg-white border-b border-black px-2 py-0.5 font-black"
                style={{ fontSize: `${typo.sizes.small}px` }}
              >
                <span>الفئة المطلوبة</span>
                <span>الكمية</span>
              </div>
              {reservation.sliceTiers.map((tier, idx) => (
                <div
                  key={idx}
                  className="flex justify-between px-2 py-0.5 border-b border-stone-300 last:border-b-0"
                  style={{ fontSize: `${kitCfg.specsAndNotesSize || 14}px` }}
                >
                  <span>فئة {Number(tier.tierPrice).toLocaleString()}</span>
                  <span className="font-mono font-black">{tier.quantity} قطعة</span>
                </div>
              ))}
            </div>
          )}

          {/* Packaging specification */}
          {reservation.hasPackaging && (
            <div
              className="border border-black p-1 text-center font-black bg-white"
              style={{ fontSize: `${typo.sizes.small}px` }}
            >
              يتطلب تعليب وتغليف مخصص للقطع
            </div>
          )}

          {reservation.slicesFlavor && kitCfg.showFlavor !== false && (
            <div className="pt-0.5" style={{ fontSize: `${kitCfg.specsAndNotesSize || 14}px` }}>
              <span className="font-black">نكهات وتشكيلة القطع: </span>
              <span className="font-bold">{reservation.slicesFlavor}</span>
            </div>
          )}
        </div>
      )}

      {/* General Kitchen Notes */}
      {reservation.notes && kitCfg.showChefNotes !== false && (
        <div style={{ fontSize: `${kitCfg.specsAndNotesSize || 14}px` }} className={`py-2 ${typo.dividerClass} text-black space-y-1`}>
          <span style={{ fontSize: `${typo.sizes.small}px` }} className="font-black block underline">ملاحظات خاصة بالشيف والمعمل:</span>
          <div
            className="pr-1 leading-snug break-words"
            style={{
              fontSize: `${kitCfg.specsAndNotesSize || 14}px`,
              fontWeight: kitCfg.specsAndNotesBold !== false ? typo.blackWeightCss : typo.weightCss,
            }}
          >
            {reservation.notes}
          </div>
        </div>
      )}

      {/* End of Production Ticket Notice */}
      <div style={{ fontSize: `${kitCfg.footerSize || 10}px` }} className="pt-2 text-center font-bold text-black border-t border-dashed border-black">
        --- بون خاص بقسم الإنتاج والتحضير - لا يحتوي على مبالغ مالية ---
      </div>

      {/* Universal Receipt Footer Branding */}
      {kitCfg.showBrandCredits !== false && <ReceiptBrandingFooter />}
    </div>
  );
}

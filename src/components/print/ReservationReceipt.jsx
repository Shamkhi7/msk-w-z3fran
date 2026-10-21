import React from 'react';
import { numberToArabicWords } from '../../utils/arabicNumberToWords';
import { formatPickupDateTime } from '../../utils/dateFormatter';
import { ReceiptBrandingFooter } from './ReceiptBrandingFooter';
import { getReservationReceiptTypography } from '../../utils/receiptTypographyHelper';

export function ReservationReceipt({ reservation, storeSettings }) {
  if (!reservation) return null;

  const typo = getReservationReceiptTypography(storeSettings);
  const resCfg = typo.config;
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

  const itemsSubtotal = Number(reservation.totalCost || 0);
  const deliveryFee = reservation.isDelivery ? Number(reservation.deliveryFee || 0) : 0;
  const totalDue = itemsSubtotal + deliveryFee;
  const depositPaid = Number(reservation.depositPaid || 0);
  const remainingDue = Math.max(0, totalDue - depositPaid);

  const headerAlignClass = resCfg.storeHeaderAlign === 'right' ? 'text-right' : 'text-center';

  return (
    <div className="receipt-container text-black bg-white select-none font-bold" style={typo.containerStyle}>
      {/* Header */}
      <div className={`pb-2 ${typo.dividerClass} ${headerAlignClass}`}>
        {resCfg.showLogo !== false && storeSettings?.logo && (
          <div className="flex justify-center mb-1">
            <img
              src={storeSettings.logo}
              alt="Store Logo"
              style={{
                filter: typo.logoFilter,
                maxHeight: `${resCfg.logoSize || 48}px`,
              }}
              className="max-w-[120px] object-contain"
            />
          </div>
        )}
        <div
          style={{
            fontSize: `${resCfg.storeHeaderSize || typo.sizes.title}px`,
            fontWeight: resCfg.storeHeaderBold !== false ? typo.blackWeightCss : typo.weightCss,
          }}
          className="text-black leading-tight"
        >
          {storeSettings.storeNameAr}
        </div>

        {resCfg.showStoreNameEn !== false && storeSettings.storeNameEn && (
          <div style={{ fontSize: `${typo.sizes.sub}px`, fontWeight: typo.weightCss }} className="text-black">
            {storeSettings.storeNameEn}
          </div>
        )}

        <div
          style={{
            fontSize: `${resCfg.pickupBannerSize || typo.sizes.body}px`,
            fontWeight: typo.blackWeightCss,
          }}
          className="border-2 border-black px-3 py-1 mt-1 inline-block bg-white text-black"
        >
          {resCfg.ticketTitle || headerTitle}
        </div>

        {resCfg.showPhones !== false && (storeSettings.phone || storeSettings.phone2) && (
          <div style={{ fontSize: `${typo.sizes.small}px` }} className="mt-1 font-mono font-bold text-black">
            {storeSettings.phone} {storeSettings.phone2 ? `• ${storeSettings.phone2}` : ''}
          </div>
        )}

        {resCfg.showAddress !== false && storeSettings.address && (
          <div style={{ fontSize: `${typo.sizes.small}px` }} className="text-black font-medium">
            {storeSettings.address}
          </div>
        )}
      </div>

      {/* Booking Details */}
      <div style={{ fontSize: `${typo.sizes.sub}px` }} className={`py-2 ${typo.dividerClass} space-y-1 text-black`}>
        {reservation.manualBookingNo && (
          <div className="border-2 border-black p-1.5 text-center my-1 bg-white space-y-0.5">
            <span style={{ fontSize: `${typo.sizes.small}px` }} className="font-bold block">
              {resCfg.manualTicketLabel || 'رقم الحجز اليدوي:'}
            </span>
            <div
              className="font-mono text-black leading-none"
              style={{
                fontSize: `${resCfg.manualTicketSize || 22}px`,
                fontWeight: resCfg.manualTicketBold !== false ? typo.blackWeightCss : typo.weightCss,
              }}
            >
              #{reservation.manualBookingNo}
            </div>
          </div>
        )}
        <div className="flex justify-between items-baseline">
          <span className="font-black">{resCfg.systemTicketLabel || 'رقم الحجز بالنظام:'}</span>
          <span className="font-mono font-black" style={{ fontSize: `${resCfg.customerNameSize || typo.sizes.crucial}px` }}>
            {reservation.receiptNumber}
          </span>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="font-black">{resCfg.customerLabel || 'اسم الزبون:'}</span>
          <span
            style={{
              fontSize: `${resCfg.customerNameSize || typo.sizes.customerName}px`,
              fontWeight: resCfg.customerNameBold !== false ? typo.blackWeightCss : typo.weightCss,
            }}
          >
            {reservation.customerName}
          </span>
        </div>
        {resCfg.showCustomerPhone !== false && reservation.phone && (
          <div className="flex justify-between items-baseline">
            <span className="font-black">{resCfg.phoneLabel || 'رقم الهاتف:'}</span>
            <span
              className="font-mono font-black"
              style={{
                fontSize: `${resCfg.customerPhoneSize || typo.sizes.customerPhone}px`,
                fontWeight: resCfg.customerPhoneBold !== false ? typo.blackWeightCss : typo.weightCss,
              }}
            >
              {reservation.phone}
            </span>
          </div>
        )}
        {resCfg.showWorkerName !== false && reservation.workerName && (
          <div className="flex justify-between">
            <span className="font-black">{resCfg.workerLabel || 'الموظف المسجل:'}</span>
            <span className="font-bold">{reservation.workerName}</span>
          </div>
        )}

        {/* Clean Delivery Info */}
        {resCfg.showDeliveryAddress !== false && reservation.isDelivery && (
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

        {/* Prominent Pickup Schedule with Day of Week */}
        {resCfg.showPickupDateTime !== false && (
          <div className="border-2 border-black p-1.5 text-center my-1 bg-white">
            <div style={{ fontSize: `${typo.sizes.small}px` }} className="font-black text-black">
              {resCfg.pickupHeaderLabel || 'تاريخ ووقت الاستلام:'}
            </div>
            <div
              className="text-black mt-0.5 leading-tight"
              style={{
                fontSize: `${resCfg.pickupBannerSize || 17}px`,
                fontWeight: resCfg.pickupBannerBold !== false ? typo.blackWeightCss : typo.weightCss,
              }}
              dir="rtl"
            >
              {formattedSchedule}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 1: CAKE MOLDS SPECIFICATIONS (IF INCLUDED) */}
      {hasMold && (
        <div style={{ fontSize: `${typo.sizes.sub}px` }} className={`py-2 ${typo.dividerClass} space-y-2 text-black`}>
          {cakeMolds.map((mold, idx) => (
            <div key={mold.id || idx} className="space-y-1 pb-1.5 border-b border-dashed border-black last:border-b-0 last:pb-0">
              <div
                className="flex justify-between items-center bg-white text-black border-2 border-black px-2 py-1"
                style={{
                  fontSize: `${(resCfg.specsSize || 12) + 2}px`,
                  fontWeight: typo.blackWeightCss,
                }}
              >
                <span>
                  {cakeMolds.length > 1 ? `القسم 1: مواصفات قالب (${idx + 1}):` : 'القسم 1: مواصفات قالب الكيك:'}
                </span>
                <span>قياس {mold.cakeSize}</span>
              </div>

              {Number(mold.moldPrice) > 0 && (
                <div className="flex justify-between font-bold" style={{ fontSize: `${typo.sizes.small}px` }}>
                  <span>سعر القالب:</span>
                  <span className="font-mono font-black">
                    {Number(mold.moldPrice).toLocaleString()} {storeSettings.currency}
                  </span>
                </div>
              )}

              {mold.writtenText && resCfg.showWrittenText !== false && (
                <div className="border-2 border-black p-1 text-center my-1 bg-white">
                  <span style={{ fontSize: `${typo.sizes.small}px` }} className="font-black block">
                    {resCfg.inscriptionLabel || 'العبارة المطلوبة على القالب:'}
                  </span>
                  <div
                    className="mt-0.5 text-black font-serif break-words"
                    style={{
                      fontSize: `${resCfg.inscriptionSize || 16}px`,
                      fontWeight: resCfg.inscriptionBold !== false ? typo.blackWeightCss : typo.weightCss,
                    }}
                  >
                    "{mold.writtenText}"
                  </div>
                </div>
              )}

              {mold.cakeDesign && resCfg.showDesign !== false && (
                <div className="border-2 border-black p-1 text-center my-1 bg-white">
                  <span style={{ fontSize: `${typo.sizes.small}px` }} className="font-black block">
                    {resCfg.designLabel || 'تفاصيل الشكل والتصميم:'}
                  </span>
                  <div
                    className="mt-0.5 text-black break-words"
                    style={{
                      fontSize: `${resCfg.specsSize || 12}px`,
                      fontWeight: resCfg.specsBold !== false ? typo.blackWeightCss : typo.weightCss,
                    }}
                  >
                    {mold.cakeDesign}
                  </div>
                </div>
              )}

              {mold.cakeFlavor && resCfg.showFlavor !== false && (
                <div className="pt-0.5" style={{ fontSize: `${resCfg.specsSize || 12}px` }}>
                  <span className="font-black">{resCfg.flavorLabel || 'نكهة وحشوة القالب:'} </span>
                  <span style={{ fontWeight: resCfg.specsBold !== false ? typo.blackWeightCss : typo.weightCss }}>
                    {mold.cakeFlavor}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* SECTION 2: CAKE SLICES & PACKAGING SPECIFICATIONS (IF INCLUDED) */}
      {hasSlices && (
        <div style={{ fontSize: `${typo.sizes.sub}px` }} className={`py-2 ${typo.dividerClass} space-y-1 text-black`}>
          <div
            className="flex justify-between items-center bg-white text-black border-2 border-black px-2 py-1 font-black"
            style={{ fontSize: `${(resCfg.specsSize || 12) + 2}px` }}
          >
            <span>القسم 2: تفاصيل القطع الإضافية والتعليب:</span>
            <span>{reservation.totalPieces} قطعة</span>
          </div>

          {/* Slices Table */}
          <div className="border border-black my-1">
            <div
              className="flex justify-between bg-white border-b border-black px-1.5 py-0.5 font-black"
              style={{ fontSize: `${typo.sizes.small}px` }}
            >
              <span>الفئة والكمية</span>
              <span>المجموع</span>
            </div>
            {reservation.sliceTiers && reservation.sliceTiers.length > 0 ? (
              reservation.sliceTiers.map((tier, idx) => (
                <div
                  key={idx}
                  className="flex justify-between px-1.5 py-0.5 border-b border-stone-300 last:border-b-0"
                  style={{ fontSize: `${resCfg.specsSize || 12}px` }}
                >
                  <span>
                    فئة {Number(tier.tierPrice).toLocaleString()} د.ع × {tier.quantity} قطعة
                  </span>
                  <span className="font-mono font-bold">
                    {Number(tier.subtotal || (tier.quantity * tier.tierPrice)).toLocaleString()} {storeSettings.currency}
                  </span>
                </div>
              ))
            ) : (
              <div className="px-1.5 py-0.5" style={{ fontSize: `${typo.sizes.small}px` }}>
                قطع متنوعة ({reservation.totalPieces} قطعة)
              </div>
            )}
          </div>

          {/* Packaging Fee Line Item (if enabled) */}
          {reservation.hasPackaging && (
            <div
              className="flex justify-between items-center border border-black p-1 bg-stone-50"
              style={{ fontSize: `${typo.sizes.sub}px` }}
            >
              <span className="font-black">أجور تعليب ({reservation.totalPieces} قطعة × 250 د.ع):</span>
              <span className="font-mono font-black">
                {Number(reservation.packagingTotal || 0).toLocaleString()} {storeSettings.currency}
              </span>
            </div>
          )}

          {reservation.slicesFlavor && resCfg.showFlavor !== false && (
            <div style={{ fontSize: `${resCfg.specsSize || 12}px` }}>
              <span className="font-black">{resCfg.flavorLabel || 'تشكيلة ونكهات القطع:'} </span>
              <span style={{ fontWeight: resCfg.specsBold !== false ? typo.blackWeightCss : typo.weightCss }}>
                {reservation.slicesFlavor}
              </span>
            </div>
          )}
        </div>
      )}

      {/* General Notes */}
      {reservation.notes && resCfg.showChefNotes !== false && (
        <div style={{ fontSize: `${typo.sizes.sub}px` }} className={`py-1.5 ${typo.dividerClass} text-black`}>
          <span style={{ fontSize: `${typo.sizes.small}px` }} className="font-black block">ملاحظات إضافية:</span>
          <div
            className="pr-1 break-words"
            style={{
              fontSize: `${resCfg.specsSize || 12}px`,
              fontWeight: resCfg.specsBold !== false ? typo.blackWeightCss : typo.weightCss,
            }}
          >
            {reservation.notes}
          </div>
        </div>
      )}

      {/* SECTION 3: FINANCIALS & BALANCE */}
      <div
        style={{ fontSize: `${typo.sizes.body}px` }}
        className={`py-2 ${typo.dividerClass} space-y-1 text-black`}
      >
        <div
          className="font-black border-b border-dashed border-black pb-0.5 text-center"
          style={{ fontSize: `${typo.sizes.sub}px` }}
        >
          القسم 3: الحسابات والمالية والمتبقي
        </div>
        <div className="flex justify-between">
          <span>مجموع المواد:</span>
          <span className="font-mono font-bold">{itemsSubtotal.toLocaleString()} {storeSettings.currency}</span>
        </div>
        {deliveryFee > 0 && (
          <div className="flex justify-between">
            <span>أجور التوصيل:</span>
            <span className="font-mono font-bold">+{deliveryFee.toLocaleString()} {storeSettings.currency}</span>
          </div>
        )}
        <div className="flex justify-between font-black border-t border-dashed border-black pt-0.5">
          <span>المبلغ الكلي:</span>
          <span className="font-mono font-bold">{totalDue.toLocaleString()} {storeSettings.currency}</span>
        </div>

        {/* Deposit Paid Row with Highlighting */}
        <div
          className={`flex justify-between items-center ${
            resCfg.highlightDeposit ? 'bg-stone-100 p-1 border border-black rounded-xs' : ''
          }`}
          style={{
            fontSize: `${resCfg.depositSize || 15}px`,
          }}
        >
          <span className="font-black">
            العربون المدفوع{reservation.depositPaymentMethod === 'بطاقة' ? ' (إلكتروني / بطاقة)' : ' (نقداً)'}:
          </span>
          <span className="font-mono font-bold">{depositPaid.toLocaleString()} {storeSettings.currency}</span>
        </div>

        {/* Remaining Balance Row with Highlighting */}
        <div
          className={`flex justify-between items-baseline pt-1.5 border-t-2 border-black font-black ${
            resCfg.highlightRemaining ? 'bg-stone-100 p-1 mt-1 border-2 border-black rounded-xs' : ''
          }`}
          style={{
            fontSize: `${resCfg.remainingBalanceSize || 18}px`,
            fontWeight: typo.blackWeightCss,
          }}
        >
          <span>المتبقي عند الاستلام:</span>
          <span
            className="font-mono"
            style={{ fontSize: `${resCfg.remainingBalanceSize || 18}px`, fontWeight: typo.blackWeightCss }}
          >
            {remainingDue.toLocaleString()} {storeSettings.currency}
          </span>
        </div>
        <div style={{ fontSize: `${typo.sizes.small}px` }} className="font-bold italic leading-snug">
          {numberToArabicWords(remainingDue, storeSettings.currency === 'د.ع' ? 'دينار عراقي' : storeSettings.currency)}
        </div>
      </div>

      {/* Footer Terms / Policy Disclaimer */}
      {resCfg.policyDisclaimer && (
        <div
          style={{ fontSize: `${resCfg.footerSize || 10}px` }}
          className="pt-2 text-center font-bold leading-tight text-black whitespace-pre-line"
        >
          {resCfg.policyDisclaimer}
        </div>
      )}

      {/* Universal Footer Branding */}
      {resCfg.showBrandCredits !== false && <ReceiptBrandingFooter />}
    </div>
  );
}

import React from 'react';
import { numberToArabicWords } from '../../utils/arabicNumberToWords';
import { ReceiptBrandingFooter } from './ReceiptBrandingFooter';
import { isWeightedProduct, getCartItemLineTotal } from '../../utils/productAnalyticsHelper';
import { getSalesReceiptTypography } from '../../utils/receiptTypographyHelper';

export function SalesReceipt({ sale, storeSettings }) {
  if (!sale) return null;

  const typo = getSalesReceiptTypography(storeSettings);
  const salesCfg = typo.config;
  const layout = storeSettings?.receiptLayout || {};

  const dateObj = new Date(sale.date);
  const formattedDate = dateObj.toLocaleDateString('ar-IQ', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
  const formattedTime = dateObj.toLocaleTimeString('ar-IQ', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const headerAlignClass = salesCfg.storeHeaderAlign === 'right' ? 'text-right' : 'text-center';

  return (
    <div className="receipt-container text-black bg-white select-none font-bold" style={typo.containerStyle}>
      {/* Header */}
      <div className={`pb-2 ${typo.dividerClass} ${headerAlignClass}`}>
        {/* Optional Store Logo */}
        {salesCfg.showLogo !== false && (storeSettings?.logo || true) && (
          <div className="flex justify-center mb-1">
            <img
              src={storeSettings?.logo || './logo.png'}
              alt="Logo"
              style={{
                filter: typo.logoFilter,
                maxHeight: `${salesCfg.logoSize || 48}px`,
              }}
              className="max-w-[120px] object-contain mx-auto"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
        )}

        <div
          style={{
            fontSize: `${salesCfg.storeHeaderSize || typo.sizes.title}px`,
            fontWeight: salesCfg.storeHeaderBold !== false ? typo.blackWeightCss : typo.weightCss,
          }}
          className="tracking-wide text-black leading-tight"
        >
          {layout.header?.storeNameAr || storeSettings.storeNameAr}
        </div>

        {layout.header?.showStoreNameEn !== false && salesCfg.showStoreNameEn !== false && (
          <div style={{ fontSize: `${typo.sizes.sub}px`, fontWeight: typo.weightCss }} className="tracking-wider text-black">
            {layout.header?.storeNameEn || storeSettings.storeNameEn}
          </div>
        )}

        {layout.header?.showTagline !== false && salesCfg.showTagline !== false && (
          <div style={{ fontSize: `${typo.sizes.small}px` }} className="text-black font-semibold mt-0.5">
            {layout.header?.tagline || storeSettings.tagline}
          </div>
        )}

        {salesCfg.ticketTitle && (
          <div
            style={{ fontSize: `${typo.sizes.body}px`, fontWeight: typo.blackWeightCss }}
            className="border-2 border-black px-3 py-1 mt-1 inline-block bg-white text-black"
          >
            {salesCfg.ticketTitle}
          </div>
        )}

        {layout.header?.showPhones !== false && salesCfg.showPhones !== false && (
          <div style={{ fontSize: `${typo.sizes.small}px` }} className="mt-1 font-mono font-bold text-black">
            {layout.header?.phone || storeSettings.phone}
            {layout.header?.phone2 && ` | ${layout.header.phone2}`}
          </div>
        )}

        {layout.header?.showAddress !== false && salesCfg.showAddress !== false && (
          <div style={{ fontSize: `${typo.sizes.small}px` }} className="text-black font-medium">
            {layout.header?.address || storeSettings.address}
          </div>
        )}
      </div>

      {/* Invoice Meta */}
      <div style={{ fontSize: `${typo.sizes.sub}px` }} className={`py-2 ${typo.dividerClass} space-y-0.5 text-black`}>
        <div className="flex justify-between items-baseline">
          <span className="font-black">رقم الفاتورة:</span>
          <span
            style={{
              fontSize: `${salesCfg.itemNameSize || typo.sizes.crucial}px`,
              fontWeight: typo.blackWeightCss,
            }}
            className="font-mono"
          >
            {sale.receiptNo}
          </span>
        </div>
        <div className="flex justify-between">
          <span>التاريخ: {formattedDate}</span>
          <span>الوقت: {formattedTime}</span>
        </div>
        <div className="flex justify-between items-baseline">
          {layout.customer?.showWorker !== false && (
            <span>{salesCfg.cashierLabel || 'الكاشير:'} {sale.cashierName || storeSettings.cashierName}</span>
          )}
          <span className="font-bold">
            {salesCfg.customerLabel || 'الزبون:'}{' '}
            <span
              style={{
                fontSize: `${salesCfg.customerNameSize || typo.sizes.customerName}px`,
                fontWeight: salesCfg.customerNameBold !== false ? typo.blackWeightCss : typo.weightCss,
              }}
            >
              {sale.customerName || 'زبون عام'}
            </span>
          </span>
        </div>
        {salesCfg.showCustomerPhone !== false && sale.customerPhone && (
          <div className="flex justify-between items-baseline">
            <span className="font-black">{salesCfg.phoneLabel || 'رقم الهاتف:'}</span>
            <span
              className="font-mono font-black"
              style={{
                fontSize: `${salesCfg.customerPhoneSize || typo.sizes.customerPhone}px`,
                fontWeight: salesCfg.customerPhoneBold !== false ? typo.blackWeightCss : typo.weightCss,
              }}
            >
              {sale.customerPhone}
            </span>
          </div>
        )}
        <div className="flex justify-between items-center">
          <span>طريقة الدفع:</span>
          {salesCfg.showPaymentMethodBadge !== false ? (
            <span className="font-bold border border-black px-1.5 py-0.2 rounded text-[10.5px]">
              {sale.paymentMethod === 'بطاقة' || sale.paymentMethod?.includes('بطاقة') ? 'بطاقة إلكترونية' : 'نقداً (كاش)'}
            </span>
          ) : (
            <span className="font-bold">{sale.paymentMethod || 'نقداً'}</span>
          )}
        </div>
      </div>

      {/* Line Items Table */}
      <div className={`py-2 ${typo.dividerClass} text-black`}>
        <table className="w-full text-right" style={{ fontSize: `${typo.sizes.sub}px` }}>
          <thead>
            <tr className={`border-b-2 border-black`} style={{ fontWeight: typo.blackWeightCss }}>
              <th className="py-1 w-11 text-center">الكمية</th>
              <th className="py-1 pr-1">الصنف</th>
              <th className="py-1 text-center">السعر</th>
              <th className="py-1 text-left">الإجمالي</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black">
            {sale.items.map((item, idx) => {
              const lineTotal = getCartItemLineTotal(item);
              const isWeighted = isWeightedProduct(item.product) || item.product?.unit === 'kg' || (item.quantity % 1 !== 0);
              return (
                <tr key={idx} className="align-top">
                  <td
                    className="py-1.5 text-center font-mono whitespace-nowrap"
                    style={{
                      fontSize: `${salesCfg.priceSize || typo.sizes.price}px`,
                      fontWeight: salesCfg.priceBold !== false ? typo.blackWeightCss : typo.weightCss,
                    }}
                  >
                    {isWeighted ? `${item.quantity} كغم` : item.quantity}
                  </td>
                  <td className="py-1.5 pr-1">
                    <div
                      style={{
                        fontSize: `${salesCfg.itemNameSize || typo.sizes.productName}px`,
                        fontWeight: salesCfg.itemNameBold !== false ? typo.blackWeightCss : typo.weightCss,
                      }}
                      className="leading-tight text-black break-words"
                    >
                      {item.product.name}
                    </div>
                    <div
                      style={{
                        fontSize: `${Math.max(10, (salesCfg.itemNameSize || 15) - 3)}px`,
                        fontWeight: typo.weightCss,
                      }}
                      className="text-black font-mono font-bold"
                    >
                      {isWeighted
                        ? `${item.quantity} كغم × ${item.unitPrice.toLocaleString()} ${storeSettings.currency}`
                        : `${item.quantity} × ${item.unitPrice.toLocaleString()} ${storeSettings.currency}`}
                    </div>
                    {item.isOverridden && (
                      <div
                        style={{
                          fontSize: `${Math.max(10, (salesCfg.itemNameSize || 15) - 3)}px`,
                        }}
                        className="text-black font-bold"
                      >
                        (سعر خاص - الأصلي: {item.originalPrice.toLocaleString()})
                      </div>
                    )}
                    {item.discount > 0 && (
                      <div
                        style={{
                          fontSize: `${Math.max(10, (salesCfg.itemNameSize || 15) - 3)}px`,
                        }}
                        className="text-black font-bold font-mono"
                      >
                        خصم: -{item.discount.toLocaleString()} ${storeSettings.currency}
                      </div>
                    )}
                  </td>
                  <td
                    className="py-1.5 text-center font-mono font-bold"
                    style={{ fontSize: `${salesCfg.priceSize || typo.sizes.price}px` }}
                  >
                    {item.unitPrice.toLocaleString()}
                  </td>
                  <td
                    className="py-1.5 text-left font-mono"
                    style={{
                      fontSize: `${salesCfg.priceSize || typo.sizes.price}px`,
                      fontWeight: salesCfg.priceBold !== false ? typo.blackWeightCss : typo.weightCss,
                    }}
                  >
                    {lineTotal.toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Totals Breakdown */}
      <div
        style={{ fontSize: `${salesCfg.totalsSize || typo.sizes.body}px` }}
        className={`py-2 ${typo.dividerClass} space-y-1 text-black`}
      >
        {salesCfg.showSubtotal !== false && sale.totalDiscount > 0 && (
          <>
            <div className="flex justify-between">
              <span>المجموع قبل الخصم:</span>
              <span className="font-mono font-bold">{sale.subtotal.toLocaleString()} {storeSettings.currency}</span>
            </div>
            <div className="flex justify-between">
              <span>إجمالي الخصم:</span>
              <span className="font-mono font-black">-{sale.totalDiscount.toLocaleString()} {storeSettings.currency}</span>
            </div>
          </>
        )}

        {salesCfg.showRoundingDiscount !== false && Number(sale.roundingDiscount) > 0 && (
          <div className="flex justify-between">
            <span>خصم تقريب الكاش:</span>
            <span className="font-mono font-bold">-{Number(sale.roundingDiscount).toLocaleString()} {storeSettings.currency}</span>
          </div>
        )}

        {Number(sale.deliveryFee) > 0 && (
          <>
            <div className="flex justify-between">
              <span>مجموع المواد:</span>
              <span className="font-mono font-bold">
                {((sale.itemsNet !== undefined ? sale.itemsNet : (sale.subtotal - (sale.totalDiscount || 0)))).toLocaleString()} {storeSettings.currency}
              </span>
            </div>
            <div className="flex justify-between font-black">
              <span>أجور التوصيل (للسائق):</span>
              <span className="font-mono font-black">+{Number(sale.deliveryFee).toLocaleString()} {storeSettings.currency}</span>
            </div>
          </>
        )}

        <div
          className={`flex justify-between items-baseline pt-1.5 border-t-2 border-black`}
          style={{
            fontSize: `${Math.round((salesCfg.totalsSize || 15) * 1.25)}px`,
            fontWeight: salesCfg.totalsBold !== false ? typo.blackWeightCss : typo.weightCss,
          }}
        >
          <span>المجموع الكلي المطلوب:</span>
          <span className="font-mono">
            {sale.netTotal.toLocaleString()} {storeSettings.currency}
          </span>
        </div>

        <div style={{ fontSize: `${typo.sizes.small}px` }} className="text-black font-bold italic pt-0.5 leading-snug">
          {numberToArabicWords(sale.netTotal, storeSettings.currency === 'د.ع' ? 'دينار عراقي' : storeSettings.currency)}
        </div>

        <div style={{ fontSize: `${typo.sizes.sub}px` }} className="flex justify-between pt-1">
          <span>المبلغ المستلم:</span>
          <span className="font-mono font-black">{(sale.amountReceived || sale.netTotal).toLocaleString()} {storeSettings.currency}</span>
        </div>

        {sale.changeDue > 0 && (
          <div style={{ fontSize: `${typo.sizes.sub}px` }} className="flex justify-between font-black">
            <span>الباقي للزبون:</span>
            <span className="font-mono">{sale.changeDue.toLocaleString()} {storeSettings.currency}</span>
          </div>
        )}
      </div>

      {/* Barcode & Footer */}
      <div className="pt-2 text-center space-y-1 text-black">
        {salesCfg.showBarcode !== false && (
          <div
            className="inline-block border-2 border-black px-3 py-1 font-mono font-black tracking-widest"
            style={{ fontSize: `${typo.sizes.crucial}px` }}
          >
            *{sale.receiptNo}*
          </div>
        )}
        <div style={{ fontSize: `${salesCfg.footerSize || typo.sizes.small}px` }} className="font-bold text-black leading-snug">
          {salesCfg.footerMessage || layout.footer?.noteText || storeSettings.receiptFooterNote}
        </div>
      </div>

      {/* Universal Footer Branding */}
      {salesCfg.showBrandCredits !== false && <ReceiptBrandingFooter />}
    </div>
  );
}

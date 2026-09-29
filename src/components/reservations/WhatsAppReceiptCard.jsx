import React from 'react';
import { formatPickupDateTime } from '../../utils/dateFormatter';

/**
 * Dedicated, pixel-perfect Receipt Card component specifically tailored
 * for high-resolution image generation (WhatsApp Sharing).
 * Uses robust table-based layouts and zero letter-spacing to prevent
 * any Arabic text clipping, overlapping, or disconnected ligatures.
 */
export function WhatsAppReceiptCard({ reservation, storeSettings, receiptType = 'kitchen' }) {
  if (!reservation) return null;

  const currency = storeSettings?.currency || 'د.ع';
  const formattedPickup = formatPickupDateTime(reservation.pickupDate, reservation.pickupTime);
  const bookingNo = reservation.manualBookingNo || reservation.receiptNumber || '-';

  // Normalize molds array
  const cakeMolds = Array.isArray(reservation.cakeMolds) && reservation.cakeMolds.length > 0
    ? reservation.cakeMolds
    : (reservation.hasMold !== false && (reservation.cakeSize || reservation.hasMold)
        ? [{
            cakeSize: reservation.cakeSize || '2',
            moldPrice: reservation.moldPrice || 0,
            cakeFlavor: reservation.cakeFlavor || '',
            cakeDesign: reservation.cakeDesign || '',
            writtenText: reservation.writtenText || '',
          }]
        : []);

  const hasMold = cakeMolds.length > 0;
  const hasSlices =
    reservation.hasSlices === true ||
    reservation.reservationType === 'cake_slices' ||
    (Array.isArray(reservation.sliceTiers) && reservation.sliceTiers.length > 0) ||
    Number(reservation.totalPieces) > 0;

  const showFinancials = receiptType === 'reservation' || receiptType === 'dual';
  const showKitchenOnly = receiptType === 'kitchen';

  return (
    <div
      style={{
        width: '430px',
        backgroundColor: '#ffffff',
        color: '#111827',
        fontFamily: "'Segoe UI', Tahoma, Arial, sans-serif",
        padding: '24px 20px',
        margin: '0 auto',
        boxSizing: 'border-box',
        direction: 'rtl',
        textAlign: 'right',
        lineHeight: 1.5,
        letterSpacing: '0px',
        border: '3px solid #1e293b',
        borderRadius: '12px',
      }}
    >
      {/* 1. Header Banner */}
      <div style={{ textAlign: 'center', borderBottom: '2.5px solid #1e293b', paddingBottom: '14px', marginBottom: '14px' }}>
        <div style={{ fontSize: '22px', fontWeight: '900', color: '#881337', marginBottom: '2px', letterSpacing: '0px' }}>
          {storeSettings?.storeNameAr || 'مسك وزعفران'}
        </div>
        <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', letterSpacing: '0px' }}>
          {storeSettings?.storeNameEn || 'Meska & Zafran'}
        </div>

        {/* Badge Indicator */}
        <div
          style={{
            display: 'inline-block',
            backgroundColor: showKitchenOnly ? '#fef3c7' : '#f1f5f9',
            color: showKitchenOnly ? '#92400e' : '#0f172a',
            border: `2px solid ${showKitchenOnly ? '#d97706' : '#334155'}`,
            borderRadius: '8px',
            padding: '4px 14px',
            marginTop: '8px',
            fontSize: '13px',
            fontWeight: '900',
            letterSpacing: '0px',
          }}
        >
          {showKitchenOnly
            ? '👨‍🍳 بون المعمل والإنتاج (طلب تحضير كيك)'
            : receiptType === 'dual'
            ? '📑 وصل الحجز المزدوج (الزبون + المعمل)'
            : '🧾 وصل حجز الكيك المالي'}
        </div>
      </div>

      {/* 2. Booking Core Info Table */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginBottom: '12px',
          fontSize: '12.5px',
        }}
      >
        <tbody>
          {reservation.manualBookingNo && (
            <tr style={{ backgroundColor: '#fffbeb', border: '1.5px solid #d97706' }}>
              <td style={{ padding: '6px 8px', fontWeight: '900', color: '#b45309' }}>
                رقم الحجز اليدوي:
              </td>
              <td style={{ padding: '6px 8px', fontWeight: '900', color: '#92400e', textAlign: 'left', fontSize: '15px' }}>
                #{reservation.manualBookingNo}
              </td>
            </tr>
          )}
          <tr>
            <td style={{ padding: '4px 2px', fontWeight: '800', color: '#475569' }}>رقم النظام:</td>
            <td style={{ padding: '4px 2px', fontWeight: '900', color: '#0f172a', textAlign: 'left', fontFamily: 'monospace', fontSize: '13px' }}>
              {reservation.receiptNumber || '-'}
            </td>
          </tr>
          <tr>
            <td style={{ padding: '4px 2px', fontWeight: '800', color: '#475569' }}>اسم الزبون:</td>
            <td style={{ padding: '4px 2px', fontWeight: '900', color: '#0f172a', textAlign: 'left', fontSize: '14px' }}>
              {reservation.customerName || 'زبون عام'}
            </td>
          </tr>
          <tr>
            <td style={{ padding: '4px 2px', fontWeight: '800', color: '#475569' }}>رقم الهاتف:</td>
            <td style={{ padding: '4px 2px', fontWeight: '900', color: '#0f172a', textAlign: 'left', fontFamily: 'monospace', fontSize: '13px' }}>
              {reservation.phone || '-'}
            </td>
          </tr>
          {reservation.workerName && (
            <tr>
              <td style={{ padding: '4px 2px', fontWeight: '800', color: '#475569' }}>الموظف المستلم للحجز:</td>
              <td style={{ padding: '4px 2px', fontWeight: '900', color: '#0369a1', textAlign: 'left' }}>
                {reservation.workerName}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* 3. Highlighted Pickup Appointment Box */}
      <div
        style={{
          backgroundColor: '#f8fafc',
          border: '2.5px solid #0f172a',
          borderRadius: '10px',
          padding: '10px 12px',
          margin: '12px 0',
          textAlign: 'center',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ fontSize: '11px', fontWeight: '900', color: '#64748b', marginBottom: '3px', letterSpacing: '0px' }}>
          ⏰ موعد وتاريخ تسليم الطلبية للشيف / الاستلام:
        </div>
        <div
          style={{
            fontSize: '17px',
            fontWeight: '900',
            color: '#0f172a',
            letterSpacing: '0px',
            lineHeight: 1.4,
          }}
        >
          {formattedPickup}
        </div>
      </div>

      {/* 4. Cake Molds Specifications */}
      {hasMold && (
        <div style={{ margin: '14px 0', borderTop: '2px dashed #cbd5e1', paddingTop: '10px' }}>
          <div style={{ fontSize: '13px', fontWeight: '900', color: '#881337', marginBottom: '8px' }}>
            🎂 مواصفات قوالب الكيك المطلوبة ({cakeMolds.length}):
          </div>

          {cakeMolds.map((mold, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: '#fffdf5',
                border: '1.5px solid #fbbf24',
                borderRadius: '8px',
                padding: '10px',
                marginBottom: '8px',
                boxSizing: 'border-box',
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', borderBottom: '1.5px dashed #d97706', marginBottom: '6px', paddingBottom: '4px' }}>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: '900', fontSize: '13px', color: '#92400e', textAlign: 'right', padding: '0 0 4px 0' }}>
                      قالب {cakeMolds.length > 1 ? `#${idx + 1} ` : ''}(قياس {mold.cakeSize || '2'})
                    </td>
                    {showFinancials && mold.moldPrice > 0 && (
                      <td style={{ fontWeight: '900', fontSize: '12px', color: '#047857', textAlign: 'left', padding: '0 0 4px 0' }}>
                        {Number(mold.moldPrice).toLocaleString()} {currency}
                      </td>
                    )}
                  </tr>
                </tbody>
              </table>

              {mold.cakeFlavor && (
                <div style={{ fontSize: '12px', marginBottom: '4px' }}>
                  <strong style={{ color: '#475569' }}>النكهة والحشوة: </strong>
                  <span style={{ fontWeight: '800', color: '#0f172a' }}>{mold.cakeFlavor}</span>
                </div>
              )}

              {mold.cakeDesign && (
                <div style={{ fontSize: '12px', marginBottom: '4px' }}>
                  <strong style={{ color: '#475569' }}>الديزاين والشكل: </strong>
                  <span style={{ fontWeight: '800', color: '#0f172a' }}>{mold.cakeDesign}</span>
                </div>
              )}

              {/* Written Text on Cake - Bold Box */}
              <div
                style={{
                  backgroundColor: mold.writtenText ? '#ecfdf5' : '#f8fafc',
                  border: `1.5px solid ${mold.writtenText ? '#059669' : '#cbd5e1'}`,
                  borderRadius: '6px',
                  padding: '6px 8px',
                  marginTop: '6px',
                  fontSize: '12px',
                }}
              >
                <span style={{ fontWeight: '800', color: mold.writtenText ? '#065f46' : '#64748b' }}>
                  الكتابة على القالب:{' '}
                </span>
                <span
                  style={{
                    fontWeight: '900',
                    color: mold.writtenText ? '#047857' : '#94a3b8',
                    fontStyle: mold.writtenText ? 'normal' : 'italic',
                  }}
                >
                  {mold.writtenText ? `"${mold.writtenText}"` : '(لا توجد عبارة كتابة على هذا القالب)'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. Cake Slices Specifications (if any) */}
      {hasSlices && (
        <div style={{ margin: '14px 0', borderTop: '2px dashed #cbd5e1', paddingTop: '10px' }}>
          <div style={{ fontSize: '13px', fontWeight: '900', color: '#881337', marginBottom: '6px' }}>
            🍰 مواصفات قطع الكيك ({reservation.totalPieces || 0} قطعة):
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1' }}>
            <thead>
              <tr style={{ backgroundColor: '#e2e8f0', borderBottom: '1px solid #94a3b8' }}>
                <th style={{ padding: '4px 6px', textAlign: 'right' }}>الفئة</th>
                <th style={{ padding: '4px 6px', textAlign: 'center' }}>العدد</th>
                {showFinancials && <th style={{ padding: '4px 6px', textAlign: 'left' }}>المبلغ</th>}
              </tr>
            </thead>
            <tbody>
              {reservation.sliceTiers &&
                reservation.sliceTiers.map((tier, tIdx) => (
                  <tr key={tIdx} style={{ borderBottom: '1px dashed #e2e8f0' }}>
                    <td style={{ padding: '4px 6px' }}>فئة {tier.tierPrice} {currency}</td>
                    <td style={{ padding: '4px 6px', textAlign: 'center', fontWeight: '900' }}>
                      {tier.quantity} قطعة
                    </td>
                    {showFinancials && (
                      <td style={{ padding: '4px 6px', textAlign: 'left', fontWeight: '800' }}>
                        {Number(tier.subtotal || tier.quantity * tier.tierPrice).toLocaleString()} {currency}
                      </td>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>

          {reservation.slicesFlavor && (
            <div style={{ fontSize: '12px', marginTop: '4px' }}>
              <strong>نكهات القطع: </strong>
              <span>{reservation.slicesFlavor}</span>
            </div>
          )}
          {reservation.hasPackaging && (
            <div style={{ fontSize: '11px', color: '#92400e', fontWeight: '800', marginTop: '2px' }}>
              ✓ مع تغليف هدايا خاص للقطع
            </div>
          )}
        </div>
      )}

      {/* 6. Financial Breakdown (for reservation & dual mode) */}
      {showFinancials && (
        <div
          style={{
            margin: '14px 0',
            border: '2px solid #0f172a',
            borderRadius: '8px',
            backgroundColor: '#fafafa',
            padding: '10px 12px',
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: '900', color: '#0f172a', borderBottom: '1.5px solid #cbd5e1', paddingBottom: '4px', marginBottom: '6px' }}>
            💰 الحساب المالي للحجز:
          </div>
          <table style={{ width: '100%', fontSize: '12.5px' }}>
            <tbody>
              <tr>
                <td style={{ padding: '3px 0', color: '#475569' }}>المبلغ الإجمالي:</td>
                <td style={{ padding: '3px 0', textAlign: 'left', fontWeight: '900', fontSize: '14px' }}>
                  {Number(reservation.totalCost || 0).toLocaleString()} {currency}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '3px 0', color: '#047857', fontWeight: '800' }}>العربون الواصل (المدفوع):</td>
                <td style={{ padding: '3px 0', textAlign: 'left', fontWeight: '900', color: '#047857' }}>
                  {Number(reservation.depositPaid || 0).toLocaleString()} {currency} ✅
                </td>
              </tr>
              <tr style={{ borderTop: '1px solid #cbd5e1' }}>
                <td style={{ padding: '4px 0', fontWeight: '900', color: Number(reservation.remainingBalance) > 0 ? '#b91c1c' : '#047857' }}>
                  المتبقي عند الاستلام:
                </td>
                <td
                  style={{
                    padding: '4px 0',
                    textAlign: 'left',
                    fontWeight: '900',
                    fontSize: '15px',
                    color: Number(reservation.remainingBalance) > 0 ? '#b91c1c' : '#047857',
                  }}
                >
                  {Number(reservation.remainingBalance || 0) > 0
                    ? `${Number(reservation.remainingBalance).toLocaleString()} ${currency} ⚠️`
                    : 'واصل بالكامل ✨'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* 7. Special Notes */}
      {reservation.notes && reservation.notes.trim() && (
        <div
          style={{
            backgroundColor: '#eff6ff',
            border: '1.5px solid #3b82f6',
            borderRadius: '8px',
            padding: '8px 10px',
            margin: '10px 0',
            fontSize: '12px',
          }}
        >
          <strong style={{ color: '#1d4ed8', display: 'block', marginBottom: '2px' }}>
            📝 ملاحظات الشغل والتحضير:
          </strong>
          <span style={{ color: '#1e3a8a', fontWeight: '700' }}>{reservation.notes.trim()}</span>
        </div>
      )}

      {/* 8. Footer */}
      <div
        style={{
          borderTop: '2px solid #1e293b',
          paddingTop: '10px',
          marginTop: '14px',
          textAlign: 'center',
          fontSize: '10.5px',
          color: '#64748b',
          lineHeight: 1.4,
        }}
      >
        {showKitchenOnly ? (
          <div style={{ color: '#b45309', fontWeight: '900', marginBottom: '2px' }}>
            --- بون خاص بقسم الإنتاج والتحضير (المعمل) ---
          </div>
        ) : (
          <div style={{ fontWeight: '800', color: '#0f172a', marginBottom: '2px' }}>
            يسعدنا خدمتكم بأفخر أصناف الكيك والحلويات الملكية ✨
          </div>
        )}
        <div style={{ fontFamily: 'monospace', fontSize: '10px' }}>
          مسك وزعفران POS • {new Date().toLocaleDateString('ar-EG')}
        </div>
      </div>
    </div>
  );
}

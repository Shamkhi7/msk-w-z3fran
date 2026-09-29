import { formatPickupDateTime } from './dateFormatter';

/**
 * Generates an elegantly formatted WhatsApp message representing a full cake/bakery reservation
 * tailored specifically for kitchen chefs and employee staff groups.
 */
export function generateReservationWhatsAppText(res, storeSettings = {}) {
  if (!res) return '';

  const currency = storeSettings.currency || 'د.ع';
  const lines = [];

  // Header Banner
  lines.push('🎂 *طلب حجز كيك جديد - مسك وزعفران* 🎂');
  lines.push('━━━━━━━━━━━━━━━━━━━━━━');

  // Booking Identification
  let bookingIdText = `🧾 *رقم الحجز:* ${res.receiptNumber || '-'}`;
  if (res.manualBookingNo) {
    bookingIdText += ` • *وصل يدوي:* #${res.manualBookingNo}`;
  }
  lines.push(bookingIdText);

  // Customer Information
  lines.push(`👤 *الزبون:* ${res.customerName || 'زبون عام'}`);
  if (res.phone) {
    lines.push(`📞 *رقم الهاتف:* ${res.phone}`);
  }

  // Pickup Appointment (Highlighted)
  lines.push('');
  lines.push('⏰ *موعد وتاريخ الاستلام المطلوب:*');
  const formattedPickup = formatPickupDateTime(res.pickupDate, res.pickupTime);
  lines.push(`📅 *${formattedPickup}*`);

  // Cake Molds Section
  const molds = Array.isArray(res.cakeMolds) && res.cakeMolds.length > 0
    ? res.cakeMolds
    : (res.hasMold ? [{
        cakeSize: res.cakeSize || '2',
        moldPrice: res.moldPrice || 0,
        cakeFlavor: res.cakeFlavor || '',
        cakeDesign: res.cakeDesign || '',
        writtenText: res.writtenText || '',
      }] : []);

  if (molds.length > 0) {
    lines.push('');
    lines.push(`🎂 *تفاصيل قوالب الكيك المطلوبة (${molds.length}):*`);
    molds.forEach((m, idx) => {
      const moldNum = molds.length > 1 ? ` ${idx + 1}` : '';
      lines.push(`▫️ *قالب${moldNum}:* قياس ${m.cakeSize || '2'}`);
      if (m.cakeFlavor) lines.push(`   • *النكهة والحشوة:* ${m.cakeFlavor}`);
      if (m.cakeDesign) lines.push(`   • *الديزاين والشكل:* ${m.cakeDesign}`);
      if (m.writtenText) lines.push(`   • *الكتابة على القالب:* "${m.writtenText}"`);
      if (m.moldPrice) lines.push(`   • *السعر:* ${Number(m.moldPrice).toLocaleString()} ${currency}`);
    });
  }

  // Cake Slices Section
  if (res.hasSlices && Array.isArray(res.sliceTiers) && res.sliceTiers.length > 0) {
    lines.push('');
    lines.push(`🍰 *قطع الكيك (${res.totalPieces || 0} قطعة):*`);
    res.sliceTiers.forEach((tier) => {
      const sub = Number(tier.subtotal || tier.quantity * tier.tierPrice);
      lines.push(`▫️ ${tier.quantity} قطعة × ${tier.tierPrice} ${currency} = ${sub.toLocaleString()} ${currency}`);
    });
    if (res.slicesFlavor) lines.push(`   • *النكهة:* ${res.slicesFlavor}`);
    if (res.hasPackaging) {
      lines.push(`   • *تغليف هدايا خاص* (+${Number(res.packagingTotal || 0).toLocaleString()} ${currency})`);
    }
  }

  // Financial Breakdown
  lines.push('');
  lines.push('💰 *الحساب المالي:*');
  lines.push(`▫️ *الإجمالي:* ${Number(res.totalCost || 0).toLocaleString()} ${currency}`);
  lines.push(`▫️ *العربون المدفوع:* ${Number(res.depositPaid || 0).toLocaleString()} ${currency} ✅`);
  const rem = Number(res.remainingBalance || 0);
  if (rem > 0) {
    lines.push(`▫️ *المتبقي بذمة الزبون:* ${rem.toLocaleString()} ${currency} ⚠️`);
  } else {
    lines.push('▫️ *الحساب واصل بالكامل* ✨');
  }

  // Special Notes
  if (res.notes && res.notes.trim()) {
    lines.push('');
    lines.push(`📝 *ملاحظات الشغل والتحضير:*`);
    lines.push(`${res.notes.trim()}`);
  }

  // Staff Attribution Footer
  lines.push('');
  lines.push('━━━━━━━━━━━━━━━━━━━━━━');
  if (res.workerName) {
    lines.push(`👨‍🍳 *الموظف مسؤول الحجز:* ${res.workerName}`);
  }
  if (res.shiftType) {
    lines.push(`🏪 *شفت التسجيل:* شفت ${res.shiftType}`);
  }
  lines.push('✨ مسك وزعفران للحلويات الملكية وقوالب الكيك ✨');

  return lines.join('\n');
}

/**
 * Opens WhatsApp to send the reservation directly to the staff/kitchen group.
 * If a custom staff phone is defined in settings, sends to that number.
 * Otherwise, opens WhatsApp share dialog allowing 1-click selection of any group or employee.
 * Automatically copies the text to the clipboard as well.
 */
export function sendReservationToStaffGroup(res, storeSettings = {}) {
  const text = generateReservationWhatsAppText(res, storeSettings);
  if (!text) return { success: false };

  // Copy to clipboard for immediate pasting if preferred
  try {
    if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
  } catch (err) {
    console.warn('Clipboard write failed', err);
  }

  const staffPhone = (storeSettings.staffWhatsAppPhone || '').trim();
  let url = '';

  if (staffPhone) {
    let clean = staffPhone.replace(/[^0-9]/g, '');
    if (clean.startsWith('07')) {
      clean = '964' + clean.slice(1);
    } else if (clean.startsWith('7')) {
      clean = '964' + clean;
    }
    url = `https://wa.me/${clean}?text=${encodeURIComponent(text)}`;
  } else {
    // Standard WhatsApp forward/share endpoint: prompts user to pick a group or contact
    url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  }

  window.open(url, '_blank');
  return { success: true, text };
}

/**
 * Copies formatted reservation message to clipboard with guaranteed fallback.
 */
export async function copyReservationToClipboard(res, storeSettings = {}) {
  const text = generateReservationWhatsAppText(res, storeSettings);
  if (!text) return false;

  try {
    if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fallback for older browsers
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Generates a polite, customer-facing reservation confirmation message.
 */
export function sendReservationToCustomer(res, storeSettings = {}) {
  if (!res || !res.phone) return { success: false };

  let cleanPhone = String(res.phone).replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('07')) {
    cleanPhone = '964' + cleanPhone.slice(1);
  } else if (cleanPhone.startsWith('7')) {
    cleanPhone = '964' + cleanPhone;
  }

  const currency = storeSettings.currency || 'د.ع';
  const bookingNo = res.manualBookingNo || res.receiptNumber || '';
  const pickupFormatted = formatPickupDateTime(res.pickupDate, res.pickupTime);
  const remaining = Number(res.remainingBalance || 0);

  const msg = [
    `مرحباً بك زبوننا العزيز ${res.customerName || ''} في مسك وزعفران 🌸`,
    `نود إعلامكم بتفاصيل وتأكيد حجزكم رقم (${bookingNo}):`,
    `📅 موعد الاستلام: ${pickupFormatted}`,
    remaining > 0
      ? `💰 المبلغ المتبقي عند الاستلام: ${remaining.toLocaleString()} ${currency}`
      : '💰 الحساب: واصل بالكامل ✅',
    'نشكر ثقتكم ونتمنى لكم مناسبة سعيدة وأطيب الأوقات ✨',
  ].join('\n');

  const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
  return { success: true };
}

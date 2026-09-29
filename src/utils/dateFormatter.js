export const ARABIC_WEEKDAYS = [
  'الأحد',
  'الإثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت',
];

/**
 * Get the Arabic weekday name for a date (e.g. 'الأربعاء')
 */
export function getArabicWeekday(dateInput) {
  if (!dateInput) return '';
  try {
    let d;
    if (dateInput instanceof Date) {
      d = dateInput;
    } else if (typeof dateInput === 'string') {
      const clean = dateInput.split('T')[0].trim();
      let parts = [];
      if (clean.includes('-')) parts = clean.split('-');
      else if (clean.includes('/')) parts = clean.split('/');

      if (parts.length === 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        d = new Date(y, m, day);
      } else {
        d = new Date(dateInput);
      }
    } else {
      d = new Date(dateInput);
    }

    if (isNaN(d.getTime())) return '';
    return ARABIC_WEEKDAYS[d.getDay()] || '';
  } catch {
    return '';
  }
}

/**
 * Format date into: [اليوم بالعربية] YYYY/MM/DD (e.g. الأربعاء 2026/09/23)
 */
export function formatArabicDateWithDay(dateStr) {
  if (!dateStr) return '-';
  const weekday = getArabicWeekday(dateStr);

  let yyyy = '', mm = '', dd = '';
  if (typeof dateStr === 'string') {
    if (dateStr.includes('-')) {
      const parts = dateStr.split('T')[0].split('-');
      if (parts.length === 3) [yyyy, mm, dd] = parts;
    } else if (dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) [yyyy, mm, dd] = parts;
    }
  }

  const formattedDate = (yyyy && mm && dd)
    ? `${yyyy}/${String(mm).padStart(2, '0')}/${String(dd).padStart(2, '0')}`
    : String(dateStr);

  return weekday ? `${weekday} ${formattedDate}` : formattedDate;
}

/**
 * Format pickup date and time into a standardized Arabic format:
 * [اليوم بالعربية] YYYY/MM/DD - hh:mm م/ص (e.g. الأربعاء 2026/09/23 - 06:00 م)
 */
export function formatPickupDateTime(dateStr, timeStr) {
  if (!dateStr) return '-';

  const dateWithDay = formatArabicDateWithDay(dateStr);
  if (!timeStr) return dateWithDay;

  const timeParts = String(timeStr).trim().split(':');
  let hours = parseInt(timeParts[0], 10);
  const minutes = timeParts[1] ? timeParts[1].slice(0, 2) : '00';

  if (isNaN(hours)) {
    return `${dateWithDay} - ${timeStr}`;
  }

  const period = hours >= 12 ? 'م' : 'ص';
  hours = hours % 12 || 12;
  const formattedHours = String(hours).padStart(2, '0');

  return `${dateWithDay} - ${formattedHours}:${minutes} ${period}`;
}

/**
 * Determine expected active shift ('صباحي' | 'مسائي') based on local system time and store settings.
 */
export function getShiftByLocalTime(date = new Date(), settings = {}) {
  const mStartStr = settings.morningShiftStart || '08:00';
  const mEndStr = settings.morningShiftEnd || '16:00';
  const eStartStr = settings.eveningShiftStart || '16:00';
  const eEndStr = settings.eveningShiftEnd || '02:00';

  const toMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const parts = String(timeStr).split(':');
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1] || '0', 10);
  };

  const nowMinutes = date.getHours() * 60 + date.getMinutes();
  const mStart = toMinutes(mStartStr);
  const mEnd = toMinutes(mEndStr);
  const eStart = toMinutes(eStartStr);
  const eEnd = toMinutes(eEndStr);

  // Check Morning Shift range [mStart, mEnd)
  if (mStart < mEnd) {
    if (nowMinutes >= mStart && nowMinutes < mEnd) {
      return 'صباحي';
    }
  } else {
    // Crosses midnight
    if (nowMinutes >= mStart || nowMinutes < mEnd) {
      return 'صباحي';
    }
  }

  // Check Evening Shift range (usually crosses midnight, e.g. 16:00 to 02:00)
  if (eStart < eEnd) {
    if (nowMinutes >= eStart && nowMinutes < eEnd) {
      return 'مسائي';
    }
  } else {
    if (nowMinutes >= eStart || nowMinutes < eEnd) {
      return 'مسائي';
    }
  }

  // Fallback for transitional hours (e.g. 02:00 - 08:00)
  return nowMinutes < mStart ? 'صباحي' : 'مسائي';
}

/**
 * Calculates due urgency status for a reservation.
 * Returns: { isToday, isOverdue, isUrgent, diffMinutes, label, badgeClass }
 */
export function getReservationDueStatus(pickupDate, pickupTime, status = 'قيد التحضير') {
  if (!pickupDate) {
    return {
      isToday: false,
      isOverdue: false,
      isUrgent: false,
      diffMinutes: 0,
      label: '-',
      badgeClass: 'bg-stone-100 text-stone-600 border-stone-200',
    };
  }

  // If already delivered or cancelled, urgency is not active
  const isFinalized = status === 'تم التسليم' || status === 'ملغي';
  const cleanDateStr = String(pickupDate).split('T')[0].replace(/\//g, '-');
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;
  const isToday = cleanDateStr === todayStr;

  // Build target Date object safely
  let targetDateTime;
  try {
    const timeClean = String(pickupTime || '18:00').trim();
    const parts = timeClean.split(':');
    const h = parseInt(parts[0], 10) || 0;
    const m = parseInt(parts[1], 10) || 0;
    const dateParts = cleanDateStr.split('-').map(Number);
    if (dateParts.length === 3 && !isNaN(dateParts[0]) && !isNaN(dateParts[1]) && !isNaN(dateParts[2])) {
      targetDateTime = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], h, m, 0);
    } else {
      targetDateTime = new Date(pickupDate);
    }
  } catch {
    targetDateTime = new Date(pickupDate);
  }

  const diffMs = targetDateTime.getTime() - now.getTime();
  const diffMinutes = Math.round(diffMs / 60000);

  if (isFinalized) {
    return {
      isToday,
      isOverdue: false,
      isUrgent: false,
      diffMinutes,
      label: status === 'تم التسليم' ? 'مُسلّم ✓' : 'ملغي',
      badgeClass: status === 'تم التسليم' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-stone-100 text-stone-600 border-stone-300',
    };
  }

  // Not finalized (قيد التحضير or جاهز)
  if (diffMinutes < 0) {
    // Overdue
    const absMin = Math.abs(diffMinutes);
    let timeText = `${absMin} دقيقة`;
    if (absMin >= 60) {
      const hours = Math.floor(absMin / 60);
      const rem = absMin % 60;
      timeText = rem > 0 ? `${hours} س و ${rem} د` : `${hours} ساعة`;
    }
    return {
      isToday,
      isOverdue: true,
      isUrgent: true,
      diffMinutes,
      label: `متأخر بـ ${timeText} ⚠️`,
      badgeClass: 'bg-rose-600 text-white border-rose-700 animate-pulse font-black shadow-xs',
    };
  } else if (diffMinutes <= 120) {
    // Due within 2 hours: Urgent!
    let timeText = `${diffMinutes} دقيقة`;
    if (diffMinutes >= 60) {
      const hours = Math.floor(diffMinutes / 60);
      const rem = diffMinutes % 60;
      timeText = rem > 0 ? `${hours} س و ${rem} د` : `${hours} ساعة`;
    }
    return {
      isToday: true,
      isOverdue: false,
      isUrgent: true,
      diffMinutes,
      label: `متبقي ${timeText} ⚡`,
      badgeClass: 'bg-amber-500 text-stone-950 border-amber-600 font-black shadow-xs',
    };
  } else if (isToday) {
    // Today but more than 2 hours away
    const hours = Math.floor(diffMinutes / 60);
    return {
      isToday: true,
      isOverdue: false,
      isUrgent: false,
      diffMinutes,
      label: `اليوم (متبقي ${hours} س)`,
      badgeClass: 'bg-blue-100 text-blue-900 border-blue-300 font-bold',
    };
  } else {
    // Future date
    const days = Math.round(diffMinutes / (60 * 24));
    return {
      isToday: false,
      isOverdue: false,
      isUrgent: false,
      diffMinutes,
      label: days <= 1 ? 'غداً' : `بعد ${days} أيام`,
      badgeClass: 'bg-warm-100 text-stone-700 border-warm-300 font-medium',
    };
  }
}


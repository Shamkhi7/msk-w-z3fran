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


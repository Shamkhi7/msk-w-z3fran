/**
 * Format pickup date and time into a standardized format:
 * YYYY/MM/DD - hh:mm A (e.g. 2026/09/22 - 06:00 PM)
 */
export function formatPickupDateTime(dateStr, timeStr) {
  if (!dateStr) return '-';

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

  if (!timeStr) return formattedDate;

  const timeParts = String(timeStr).trim().split(':');
  let hours = parseInt(timeParts[0], 10);
  const minutes = timeParts[1] ? timeParts[1].slice(0, 2) : '00';

  if (isNaN(hours)) {
    return `${formattedDate} - ${timeStr}`;
  }

  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const formattedHours = String(hours).padStart(2, '0');

  return `${formattedDate} - ${formattedHours}:${minutes} ${period}`;
}

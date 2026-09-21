// Simple Arabic Number to Words (Tafqeet) for thermal receipts & expense vouchers

export function numberToArabicWords(number, currencyName = 'دينار عراقي') {
  if (number === 0 || !number) return `صفر ${currencyName}`;

  const ones = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
  const tens = ['', 'عشرة', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
  const teens = ['عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
  const hundreds = ['', 'مائة', 'مئتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];

  function convertGroup(num) {
    let result = '';
    const h = Math.floor(num / 100);
    const t = Math.floor((num % 100) / 10);
    const o = num % 10;

    if (h > 0) {
      result += hundreds[h];
    }

    if (t === 1 && o > 0) {
      result += (result ? ' و' : '') + teens[o];
    } else {
      if (o > 0) {
        result += (result ? ' و' : '') + ones[o];
      }
      if (t > 0) {
        result += (result ? ' و' : '') + tens[t];
      }
    }
    return result;
  }

  let n = Math.floor(Math.abs(number));
  let parts = [];

  // Billions
  const billions = Math.floor(n / 1000000000);
  if (billions > 0) {
    parts.push(convertGroup(billions) + ' مليار');
    n %= 1000000000;
  }

  // Millions
  const millions = Math.floor(n / 1000000);
  if (millions > 0) {
    if (millions === 1) parts.push('مليون');
    else if (millions === 2) parts.push('مليونان');
    else if (millions >= 3 && millions <= 10) parts.push(convertGroup(millions) + ' ملايين');
    else parts.push(convertGroup(millions) + ' مليون');
    n %= 1000000;
  }

  // Thousands
  const thousands = Math.floor(n / 1000);
  if (thousands > 0) {
    if (thousands === 1) parts.push('ألف');
    else if (thousands === 2) parts.push('ألفان');
    else if (thousands >= 3 && thousands <= 10) parts.push(convertGroup(thousands) + ' آلاف');
    else parts.push(convertGroup(thousands) + ' ألف');
    n %= 1000;
  }

  // Remaining < 1000
  if (n > 0) {
    parts.push(convertGroup(n));
  }

  const words = parts.join(' و');
  return `فقط ${words} ${currencyName} لا غير`;
}

const MONTHS = {
  en: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
  th: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'],
};

export const MONTHS_FULL = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  th: ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'],
};

export const WEEKDAYS = {
  en: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  th: ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'],
};

export function toKey(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

// Accepts YYYY-MM-DD, returns a local Date or null.
export function parseDate(str) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec((str || '').trim());
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  if (d.getFullYear() !== Number(m[1]) || d.getMonth() !== Number(m[2]) - 1 || d.getDate() !== Number(m[3])) return null;
  return d;
}

export function daysUntil(str) {
  const d = parseDate(str);
  if (!d) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((d - today) / 86400000);
}

// When the concert starts; tickets without a time count from 09:00.
export function eventDate(event) {
  const d = parseDate(event.date);
  const m = /^(\d{1,2}):(\d{2})$/.exec(event.time || '');
  if (!d) return null;
  d.setHours(m ? Number(m[1]) : 9, m ? Number(m[2]) : 0, 0, 0);
  return d;
}

// Upcoming until its date and time have passed.
export function isUpcoming(event) {
  const at = eventDate(event);
  return !!at && at.getTime() > Date.now();
}

export function daysLabel(event, t) {
  const n = daysUntil(event.date);
  if (n === null) return '';
  if (n === 0) return t('today');
  if (n > 0) return t('daysLeft', { n });
  return t('ended');
}

export function dateParts(event, lang) {
  const d = parseDate(event.date);
  if (!d) return { month: '---', day: '--' };
  return { month: MONTHS[lang][d.getMonth()], day: String(d.getDate()).padStart(2, '0') };
}

export function formatDate(event, lang) {
  const d = parseDate(event.date);
  if (!d) return event.date;
  const year = lang === 'th' ? d.getFullYear() + 543 : d.getFullYear();
  return `${d.getDate()} ${MONTHS[lang][d.getMonth()]} ${year}`;
}

// Buddhist-era year for Thai, Gregorian for English.
export function yearLabel(event, lang) {
  const d = parseDate(event.date);
  if (!d) return '';
  return String(lang === 'th' ? d.getFullYear() + 543 : d.getFullYear());
}

// Money like "฿3,500" / "$120".
const SYMBOLS = { THB: '฿', USD: '$', KRW: '₩', JPY: '¥' };
export function formatMoney(amount, currency = 'THB') {
  const n = Number(amount);
  if (amount === '' || amount == null || Number.isNaN(n)) return '';
  return `${SYMBOLS[currency] ?? currency + ' '}${n.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
}

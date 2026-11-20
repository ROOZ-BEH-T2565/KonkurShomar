import * as jalaali from 'jalaali-js';

export type JDate = { jy: number; jm: number; jd: number };

// Iran has no DST since 2022 -> fixed UTC+03:30 offset keeps us on Asia/Tehran time
// regardless of the device timezone.
const TEHRAN_OFFSET_MS = 3.5 * 3600 * 1000;

export const pad = (n: number) => String(n).padStart(2, '0');

export const JALALI_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
];
export const WEEKDAYS_SHORT = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

export const toFa = (v: number | string): string =>
  String(v).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);

export const jKey = (d: JDate) => `${d.jy}-${pad(d.jm)}-${pad(d.jd)}`;

export function parseKey(key: string): JDate {
  const [jy, jm, jd] = key.split('-').map(Number);
  return { jy, jm, jd };
}

export function todayJalali(): JDate {
  const t = new Date(Date.now() + TEHRAN_OFFSET_MS);
  const j = jalaali.toJalaali(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate());
  return { jy: j.jy, jm: j.jm, jd: j.jd };
}
export const todayKey = () => jKey(todayJalali());

export function jalaliToGregorian(d: JDate) {
  return jalaali.toGregorian(d.jy, d.jm, d.jd);
}

/** yyyy-MM-dd Gregorian, consumed by the native service. */
export function keyToIso(key: string): string {
  const g = jalaliToGregorian(parseKey(key));
  return `${g.gy}-${pad(g.gm)}-${pad(g.gd)}`;
}

const epochDay = (gy: number, gm: number, gd: number) =>
  Math.floor(Date.UTC(gy, gm - 1, gd) / 86400000);

/** Whole days from today (Tehran) to the given Jalali key. Negative if past. */
export function daysUntil(key: string): number {
  const t = new Date(Date.now() + TEHRAN_OFFSET_MS);
  const today = epochDay(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate());
  const g = jalaliToGregorian(parseKey(key));
  return epochDay(g.gy, g.gm, g.gd) - today;
}

export const monthLength = (jy: number, jm: number) => jalaali.jalaaliMonthLength(jy, jm);

/** 0 = Saturday ... 6 = Friday */
export function weekdayIndex(d: JDate): number {
  const g = jalaliToGregorian(d);
  return (new Date(Date.UTC(g.gy, g.gm - 1, g.gd)).getUTCDay() + 1) % 7;
}

export function formatJalali(key: string): string {
  const d = parseKey(key);
  return `${toFa(d.jd)} ${JALALI_MONTHS[d.jm - 1]} ${toFa(d.jy)}`;
}

export function formatMinutes(min: number): string {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  if (h === 0) return `${toFa(m)} دقیقه`;
  if (m === 0) return `${toFa(h)} ساعت`;
  return `${toFa(h)} ساعت و ${toFa(m)} دقیقه`;
}

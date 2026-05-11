/**
 * Format date to Indonesian style.
 *
 * @param date - Date object or date string.
 * @param options - Optional format settings.
 * @param options.withDay - Show day name (example: Senin).
 * @param options.withTime - Show time in HH:mm format.
 *
 * @returns Formatted Indonesian date string.
 * Returns '-' if the date is invalid.
 *
 * @example
 * formatIndo(new Date())
 * // "11 Mei 2026"
 *
 * @example
 * formatIndo('2026-01-01', { withDay: true })
 * // "Kamis, 1 Januari 2026"
 *
 * @example
 * formatIndo('2026-01-01', { withDay: true, withTime: true })
 * // "Kamis, 1 Januari 2026, 00:00"
 */

export function formatIndo(
  date: Date | string,
  options?: {
    withDay?: boolean;
    withTime?: boolean;   
  }
): string {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';

  const MONTHS_ID = [
    'Januari','Februari','Maret','April','Mei','Juni',
    'Juli','Agustus','September','Oktober','November','Desember',
  ];

  const DAYS_ID = [
    'Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu',
  ];

  const day = d.getDate();
  const month = MONTHS_ID[d.getMonth()];
  const year = d.getFullYear();

  let result = `${day} ${month} ${year}`;

  // add day name if enabled
  if (options?.withDay) {
    result = `${DAYS_ID[d.getDay()]}, ${result}`;
  }

  // add time if enabled
  if (options?.withTime) {
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    result += `, ${hours}:${minutes}`;
  }

  return result;
}
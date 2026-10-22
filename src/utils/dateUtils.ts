import { ExpiryCalculation, ExpiryStatusType, AedItem } from '../types/aed';

/**
 * Format date string into YYYY년 MM월 (or YYYY-MM)
 * Handles both "YYYY-MM" and legacy "YYYY-MM-DD"
 */
export function formatYearMonth(dateStr: string): string {
  if (!dateStr) return '-';
  const clean = dateStr.slice(0, 7); // extract YYYY-MM
  const parts = clean.split('-');
  if (parts.length === 2) {
    return `${parts[0]}년 ${parts[1]}월`;
  }
  return dateStr;
}

/**
 * Normalizes input date string into YYYY-MM format
 */
export function toYearMonthString(dateStr: string): string {
  if (!dateStr) return '';
  return dateStr.slice(0, 7);
}

/**
 * Calculate D-Day and Expiry status for a Year-Month expiration.
 * In consumable medical standards, an item expiring in YYYY-MM is valid through the end of that month.
 */
export function calculateExpiryYM(targetYM: string, baseDate: Date = new Date()): ExpiryCalculation {
  if (!targetYM) {
    return { daysLeft: 0, status: 'warning', formattedDate: '-' };
  }

  const ym = toYearMonthString(targetYM);
  const [yearStr, monthStr] = ym.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  if (isNaN(year) || isNaN(month)) {
    return { daysLeft: 0, status: 'warning', formattedDate: ym };
  }

  // End of the specified month (last day, 23:59:59)
  const lastDayOfMonth = new Date(year, month, 0, 23, 59, 59, 999).getTime();
  const baseMidnight = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate()).getTime();

  const diffTime = lastDayOfMonth - baseMidnight;
  const daysLeft = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  let status: ExpiryStatusType = 'normal';
  if (daysLeft < 0) {
    status = 'expired';
  } else if (daysLeft <= 90) {
    status = 'warning';
  }

  return {
    daysLeft,
    status,
    formattedDate: formatYearMonth(ym),
  };
}

export function formatDDay(daysLeft: number): string {
  if (daysLeft < 0) return `만료 (D+${Math.abs(daysLeft)})`;
  if (daysLeft === 0) return 'D-Day (이달 만료)';
  return `D-${daysLeft}`;
}

/**
 * Get current year-month formatted as YYYY-MM
 */
export function getCurrentYearMonth(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

/**
 * Get today's full date string formatted as YYYY-MM-DD (for replacement log timestamps)
 */
export function getTodayDateString(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Returns YYYY-MM offset by N years from current date
 */
export function getYearMonthPlusYears(years: number): string {
  const now = new Date();
  const futureYear = now.getFullYear() + years;
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${futureYear}-${m}`;
}

/**
 * Check overall health of AED based on Year-Month consumable expirations
 */
export function checkAedExpiryHealth(aed: AedItem, baseDate: Date = new Date()) {
  const pad = calculateExpiryYM(aed.padExpiryDate, baseDate);
  const battery = calculateExpiryYM(aed.batteryExpiryDate, baseDate);
  const body = calculateExpiryYM(aed.bodyExpiryDate, baseDate);

  const hasExpired = pad.status === 'expired' || battery.status === 'expired' || body.status === 'expired';
  const hasWarning = pad.status === 'warning' || battery.status === 'warning' || body.status === 'warning';

  return {
    pad,
    battery,
    body,
    needsReplacement: hasExpired || hasWarning,
    isExpired: hasExpired,
  };
}

import { TrendPeriod } from './dto/trend-period.dto';

export type BucketUnit = 'hour' | 'day' | 'week' | 'month' | 'year';

export interface BucketWindow {
  unit: BucketUnit;
  start: Date;
  count: number;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function getBucketWindow(period: TrendPeriod): BucketWindow {
  const now = new Date();
  switch (period) {
    case TrendPeriod.DAILY: {
      const start = new Date(now);
      start.setUTCHours(0, 0, 0, 0);
      return { unit: 'hour', start, count: 24 };
    }
    case TrendPeriod.LAST_7_DAYS: {
      const start = new Date(now);
      start.setUTCHours(0, 0, 0, 0);
      start.setUTCDate(start.getUTCDate() - 6);
      return { unit: 'day', start, count: 7 };
    }
    case TrendPeriod.WEEKLY: {
      const start = new Date(now);
      start.setUTCHours(0, 0, 0, 0);
      const day = start.getUTCDay();
      const sinceMonday = (day + 6) % 7;
      start.setUTCDate(start.getUTCDate() - sinceMonday - 7 * 7);
      return { unit: 'week', start, count: 8 };
    }
    case TrendPeriod.MONTHLY: {
      const start = new Date(now);
      start.setUTCDate(1);
      start.setUTCHours(0, 0, 0, 0);
      start.setUTCMonth(start.getUTCMonth() - 11);
      return { unit: 'month', start, count: 12 };
    }
    case TrendPeriod.YEARLY: {
      const start = new Date(now);
      start.setUTCMonth(0, 1);
      start.setUTCHours(0, 0, 0, 0);
      start.setUTCFullYear(start.getUTCFullYear() - 4);
      return { unit: 'year', start, count: 5 };
    }
  }
}

export function addToBucket(date: Date, unit: BucketUnit, n: number): Date {
  const d = new Date(date);
  switch (unit) {
    case 'hour':
      d.setUTCHours(d.getUTCHours() + n);
      break;
    case 'day':
      d.setUTCDate(d.getUTCDate() + n);
      break;
    case 'week':
      d.setUTCDate(d.getUTCDate() + n * 7);
      break;
    case 'month':
      d.setUTCMonth(d.getUTCMonth() + n);
      break;
    case 'year':
      d.setUTCFullYear(d.getUTCFullYear() + n);
      break;
  }
  return d;
}

export function formatBucketLabel(bucket: Date, unit: BucketUnit): string {
  switch (unit) {
    case 'hour':
      return `${String(bucket.getUTCHours()).padStart(2, '0')}:00`;
    case 'day':
    case 'week':
      return `${bucket.getUTCDate()} ${MONTHS[bucket.getUTCMonth()]}`;
    case 'month':
      return `${MONTHS[bucket.getUTCMonth()]} ${bucket.getUTCFullYear()}`;
    case 'year':
      return `${bucket.getUTCFullYear()}`;
  }
}

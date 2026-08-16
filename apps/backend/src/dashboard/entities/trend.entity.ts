import { TrendPeriod } from '../dto/trend-period.dto';

export interface TrendBucketEntity {
  bucket: string;
  label: string;
  count: number;
}

export interface TrendEntity {
  period: TrendPeriod;
  buckets: TrendBucketEntity[];
}

export interface NewAcknowledgedBucketEntity {
  bucket: string;
  label: string;
  new: number;
  acknowledged: number;
}

export interface NewAcknowledgedEntity {
  period: TrendPeriod;
  buckets: NewAcknowledgedBucketEntity[];
}

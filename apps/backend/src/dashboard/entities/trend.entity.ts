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

export interface ResolvedEscalatedBucketEntity {
  bucket: string;
  label: string;
  resolved: number;
  escalated: number;
}

export interface ResolvedEscalatedEntity {
  period: TrendPeriod;
  buckets: ResolvedEscalatedBucketEntity[];
}

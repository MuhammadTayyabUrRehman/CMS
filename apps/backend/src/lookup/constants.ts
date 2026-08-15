export interface LookupItem {
  value: string | number;
  label: string;
}

export const RANKS: LookupItem[] = [
  { value: 22, label: 'Finance Secretary / HOD' },
  { value: 21, label: 'Additional Secretary' },
  { value: 20, label: 'Joint Senior Secretary' },
  { value: 19, label: 'Joint Secretary' },
  { value: 18, label: 'Deputy Secretary' },
];

export const BLOCKS: LookupItem[] = [
  { value: 'Q', label: 'Q Block' },
  { value: 'S', label: 'S Block' },
];

export interface ReferralItem {
  id: number;
  username: string;
  referrer: string;
  created: string;
  rewarded: number;
  v: number;
}

export interface ReferralItems {
  data: ReferralItem[];
}

export interface ReferralStat {
  total: number;
  rewarded: number;
}

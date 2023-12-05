export interface CurationItem {
  efficiency: number;
  account: string;
  vests: number;
  votes: number;
  uniques: number;
}

export type CurationDuration = "day" | "week" | "month";

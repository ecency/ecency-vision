export interface LeaderBoardItem {
  _id: string;
  count: number;
  points: string;
}

export type LeaderBoardDuration = "day" | "week" | "month";

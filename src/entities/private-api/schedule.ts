export interface Schedule {
  _id: string;
  username: string;
  permlink: string;
  title: string;
  body: string;
  tags: string[];
  tags_arr: string;
  schedule: string;
  original_schedule: string;
  reblog: boolean;
  status: 1 | 2 | 3 | 4;
  message: string | null;
}

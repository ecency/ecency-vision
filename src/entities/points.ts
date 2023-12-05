import { TransactionType } from "@/enums";

export interface PointTransaction {
  id: number;
  type: TransactionType;
  created: string;
  memo: string | null;
  amount: string;
  sender: string | null;
  receiver: string | null;
}

export interface Points {
  points: string;
  uPoints: string;
  transactions: PointTransaction[];
  loading: boolean;
  filter: number;
}

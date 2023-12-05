import { ThreeSpeakVideo } from "@/api/threespeak";
import { BeneficiaryRoute, MetaData, RewardType } from "../operations";

export interface DraftMetadata extends MetaData {
  beneficiaries: BeneficiaryRoute[];
  rewardType: RewardType;
  videos?: Record<string, ThreeSpeakVideo>;
}

export interface Draft {
  body: string;
  created: string;
  post_type: string;
  tags_arr: string[];
  tags: string;
  timestamp: number;
  title: string;
  _id: string;
  meta?: DraftMetadata;
}

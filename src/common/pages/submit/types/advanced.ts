import { BeneficiaryRoute, RewardType } from "../../../api/operations";

export interface Advanced {
  reward: RewardType;
  beneficiaries: BeneficiaryRoute[];
  schedule: string | null;
  reblogSwitch: boolean;
  description: string | null;
  // Speak Advanced
  isThreespeak: boolean;
  videoId: string;
  speakPermlink: string;
  speakAuthor: string;
  isNsfw: boolean;
  videoMetadata: any;
}

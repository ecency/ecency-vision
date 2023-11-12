import { CommunityModerator } from "./community-moderator";

export type Metadata = {
  name: string;
  about: string;
  picture: string;
  communityName?: string;
  communityModerators?: CommunityModerator[];
  hiddenMessageIds?: string[];
  removedUserIds?: string[];
};

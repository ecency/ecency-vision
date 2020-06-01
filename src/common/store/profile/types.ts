export interface Profile {
  id: number;
  name: string;
  created: string;
  active: string;
  post_count: number;
  reputation: number;
  stats: {
    sp: number;
    rank: number;
    following: number;
    followers: number;
  };
  metadata: {
    profile: {
      name?: string;
      about?: string;
      website?: string;
      location?: string;
      cover_image?: string;
      profile_image?: string;
    };
  };
}

export type State = Profile[];

export enum ActionTypes {
  ADD = "@account/ADD",
}

export interface AddAction {
  type: ActionTypes.ADD;
  data: Profile;
}

export type Actions = AddAction; // | .. | ..

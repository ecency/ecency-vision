export enum ROLES {
  OWNER = "owner",
  ADMIN = "admin",
  MOD = "mod",
  MEMBER = "member",
  GUEST = "guest",
  MUTED = "muted"
}

export const roleMap: Record<string, string[]> = {
  [ROLES.OWNER]: [ROLES.ADMIN, ROLES.MOD, ROLES.MEMBER, ROLES.GUEST, ROLES.MUTED],
  [ROLES.ADMIN]: [ROLES.MOD, ROLES.MEMBER, ROLES.GUEST, ROLES.MUTED],
  [ROLES.MOD]: [ROLES.MEMBER, ROLES.GUEST, ROLES.MUTED]
};

export type CommunityTeam = Array<Array<string>>;

export interface Community {
  about: string;
  admins?: string[];
  avatar_url: string;
  created_at: string;
  description: string;
  flag_text: string;
  id: number;
  is_nsfw: boolean;
  lang: string;
  name: string;
  num_authors: number;
  num_pending: number;
  subscribers: number;
  sum_pending: number;
  settings?: any;
  team: CommunityTeam;
  title: string;
  type_id: number;
}

export type Communities = Community[];

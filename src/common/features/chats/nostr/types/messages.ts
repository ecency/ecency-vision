export type PublicMessage = {
  id: string;
  root: string;
  content: string;
  creator: string;
  created: number;
  children?: PublicMessage[];
  mentions: string[];
  sent?: number;
};

export type DirectMessage = {
  id: string;
  root?: string;
  content: string;
  peer: string;
  creator: string;
  created: number;
  children?: DirectMessage[];
  decrypted: boolean;
  sent?: number;
};

export type Message = PublicMessage | DirectMessage;

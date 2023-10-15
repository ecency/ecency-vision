export interface NostrKeysType {
  pub: string;
  priv: string;
}

export interface profileData {
  joiningData: string;
  about: string | undefined;
  followers: number | undefined;
}

export interface AccountWithReputation {
  account: string;
  reputation: number;
}

export interface EmojiPickerStyleProps {
  width: string;
  bottom: string;
  left: string | number;
  marginLeft: string;
  borderTopLeftRadius: string;
  borderTopRightRadius: string;
  borderBottomLeftRadius: string;
}

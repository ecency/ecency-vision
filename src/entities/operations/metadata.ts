export interface MetaData {
  image?: string[];
  image_ratios?: any;
  thumbnails?: string[];
  tags?: string[];
  app?: string;
  format?: string;
  community?: string;
  description?: string | null;
  video?: any;
  type?: string;
  pinned_reply?: string; // author/permlink
}

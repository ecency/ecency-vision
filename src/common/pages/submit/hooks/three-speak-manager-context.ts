import { ThreeSpeakVideo } from "../../../api/threespeak";
import { createContext } from "react";

export interface ThreeSpeakManagerContext {
  videos: Record<string, ThreeSpeakVideo>;
  isNsfw: boolean;
  setIsNsfw: (v: boolean) => void;
  isEditing: boolean;
  setIsEditing: (v: boolean) => void;
  clear: () => void;
  attach: (item: ThreeSpeakVideo) => void;
  remove: (itemId: string) => void;
  hasMultipleUnpublishedVideo: boolean;
  buildBody: (v: string) => string;
  checkBodyForVideos: (v: string) => void;

  // getters
  hasUnpublishedVideo: boolean;
}

export const ThreeSpeakVideoContext = createContext<ThreeSpeakManagerContext>({
  videos: {},
  isNsfw: false,
  setIsNsfw: () => {},
  clear: () => {},
  isEditing: false,
  setIsEditing: () => {},
  hasUnpublishedVideo: false,
  attach: () => {},
  remove: () => {},
  hasMultipleUnpublishedVideo: false,
  buildBody: () => "",
  checkBodyForVideos: () => {}
});

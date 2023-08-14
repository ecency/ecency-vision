import React, { createContext, ReactNode, useContext, useState } from "react";
import { ThreeSpeakVideo } from "../../../api/threespeak";

export interface ThreeSpeakManagerContext {
  clear: () => void;
  is3Speak: boolean;
  setIs3Speak: (is3Speak: boolean) => void;
  videoId: string;
  setVideoId: (videoId: string) => void;
  speakPermlink: string;
  setSpeakPermlink: (speakPermlink: string) => void;
  speakAuthor: string;
  setSpeakAuthor: (speakAuthor: string) => void;
  isNsfw: boolean;
  setIsNsfw: (isNsfw: boolean) => void;
  videoMetadata?: ThreeSpeakVideo;
  setVideoMetadata: (videoMetadata?: ThreeSpeakVideo) => void;
}

export interface ThreeSpeakManagerRef extends ThreeSpeakManagerContext {}

export const ThreeSpeakVideoContext = createContext<ThreeSpeakManagerContext>({
  is3Speak: false,
  setIs3Speak: () => {},
  videoId: "",
  setVideoId: () => {},
  speakPermlink: "",
  setSpeakPermlink: () => {},
  speakAuthor: "",
  setSpeakAuthor: () => {},
  isNsfw: false,
  setIsNsfw: () => {},
  videoMetadata: undefined,
  setVideoMetadata: () => {},
  clear: () => {}
});

export function useThreeSpeakManager() {
  return useContext(ThreeSpeakVideoContext);
}

export function ThreeSpeakManager(props: { children: ReactNode }) {
  const [is3Speak, setIs3Speak] = useState(false);
  const [videoId, setVideoId] = useState("");
  const [speakPermlink, setSpeakPermlink] = useState("");
  const [speakAuthor, setSpeakAuthor] = useState("");
  const [isNsfw, setIsNsfw] = useState(false);
  const [videoMetadata, setVideoMetadata] = useState<ThreeSpeakVideo>();

  return (
    <ThreeSpeakVideoContext.Provider
      value={{
        is3Speak,
        setIs3Speak,
        videoId,
        setVideoId,
        speakPermlink,
        setSpeakPermlink,
        speakAuthor,
        setSpeakAuthor,
        isNsfw,
        setIsNsfw,
        videoMetadata,
        setVideoMetadata,

        clear: () => {
          setIs3Speak(false);
          setVideoId("");
          setSpeakPermlink("");
          setSpeakAuthor("");
          setIsNsfw(false);
          setVideoMetadata(undefined);
        }
      }}
    >
      {props.children}
    </ThreeSpeakVideoContext.Provider>
  );
}

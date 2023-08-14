import React, { createContext, forwardRef, MutableRefObject, ReactNode, useState } from "react";
import { ThreeSpeakVideo } from "../../../api/threespeak";
import useMount from "react-use/lib/useMount";

export interface ThreeSpeakManagerContext {
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

export interface ThreeSpeakManagerRef extends ThreeSpeakManagerContext {
  clear: () => void;
}

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
  setVideoMetadata: () => {}
});

export function useThreeSpeakManager() {
  const context = React.useContext(ThreeSpeakVideoContext);
  return context;
}

export const ThreeSpeakManager = forwardRef<ThreeSpeakManagerRef, { children: ReactNode }>(
  (props, ref) => {
    const [is3Speak, setIs3Speak] = useState(false);
    const [videoId, setVideoId] = useState("");
    const [speakPermlink, setSpeakPermlink] = useState("");
    const [speakAuthor, setSpeakAuthor] = useState("");
    const [isNsfw, setIsNsfw] = useState(false);
    const [videoMetadata, setVideoMetadata] = useState<ThreeSpeakVideo>();

    useMount(() => {
      (ref as MutableRefObject<unknown>).current = {
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
      };
    });

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
          setVideoMetadata
        }}
      >
        {props.children}
      </ThreeSpeakVideoContext.Provider>
    );
  }
);

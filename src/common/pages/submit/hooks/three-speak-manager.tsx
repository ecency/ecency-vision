import React, { createContext, ReactNode, useContext } from "react";
import { ThreeSpeakVideo } from "../../../api/threespeak";
import useLocalStorage from "react-use/lib/useLocalStorage";
import { PREFIX } from "../../../util/local-storage";

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
  const [is3Speak, setIs3Speak] = useLocalStorage(PREFIX + "_sa_3s", false);
  const [videoId, setVideoId] = useLocalStorage(PREFIX + "_sa_3s_vid", "");
  const [speakPermlink, setSpeakPermlink] = useLocalStorage(PREFIX + "_sa_3s_p", "");
  const [speakAuthor, setSpeakAuthor] = useLocalStorage(PREFIX + "_sa_3s_a", "");
  const [isNsfw, setIsNsfw] = useLocalStorage(PREFIX + "_sa_3s_n", false);
  const [videoMetadata, setVideoMetadata] = useLocalStorage<ThreeSpeakVideo>(PREFIX + "_sa_3s_vm");

  return (
    <ThreeSpeakVideoContext.Provider
      value={{
        is3Speak: is3Speak!!,
        setIs3Speak,
        videoId: videoId!!,
        setVideoId,
        speakPermlink: speakPermlink!!,
        setSpeakPermlink,
        speakAuthor: speakAuthor!!,
        setSpeakAuthor,
        isNsfw: isNsfw!!,
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

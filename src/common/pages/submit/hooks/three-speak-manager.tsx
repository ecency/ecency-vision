import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { ThreeSpeakVideo } from "../../../api/threespeak";
import useLocalStorage from "react-use/lib/useLocalStorage";
import { PREFIX } from "../../../util/local-storage";
import { useBodyVersioningManager } from "./body-versioning-manager";

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
  isEditing: boolean;
  setIsEditing: (v: boolean) => void;

  // getters
  hasUnpublishedVideo: boolean;

  // funcs
  has3SpeakVideo: (body: string) => boolean;
  findAndClearUnpublished3SpeakVideo: (body: string) => void;
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
  setVideoMetadata: () => {},
  clear: () => {},
  isEditing: false,
  setIsEditing: () => {},
  hasUnpublishedVideo: false,
  has3SpeakVideo: () => false,
  findAndClearUnpublished3SpeakVideo: () => {}
});

export function useThreeSpeakManager() {
  return useContext(ThreeSpeakVideoContext);
}

const THREE_SPEAK_VIDEO_PATTERN =
  /\[!\[\]\(https:\/\/ipfs-3speak\.b-cdn\.net\/ipfs.*\)\]\(https:\/\/3speak\.tv\/watch\?.*\)\[Source\]\(https:\/\/ipfs-3speak\.b-cdn\.net\/ipfs\/(.*)\)/g;

export function ThreeSpeakManager(props: { children: ReactNode }) {
  const [is3Speak, setIs3Speak, clearIs3Speak] = useLocalStorage(PREFIX + "_sa_3s", false);
  const [videoId, setVideoId, clearVideoId] = useLocalStorage(PREFIX + "_sa_3s_vid", "");
  const [speakPermlink, setSpeakPermlink, clearSpeakPermlink] = useLocalStorage(
    PREFIX + "_sa_3s_p",
    ""
  );
  const [speakAuthor, setSpeakAuthor, clearSpeakAuthor] = useLocalStorage(PREFIX + "_sa_3s_a", "");
  const [isNsfw, setIsNsfw, clearIsNsfw] = useLocalStorage(PREFIX + "_sa_3s_n", false);
  const [videoMetadata, setVideoMetadata, clearVideoMetadata] = useLocalStorage<ThreeSpeakVideo>(
    PREFIX + "_sa_3s_vm"
  );
  const [isEditing, setIsEditing] = useState(false);

  const hasUnpublishedVideo = useMemo(
    () => (videoMetadata ? videoMetadata.status !== "published" : false),
    [videoMetadata]
  );

  const bodyManager = useBodyVersioningManager(({ metadata }) => {
    const { videoMetadata } = metadata as {
      videoMetadata: {
        videoMetadata: ThreeSpeakVideo;
        is3Speak: boolean;
        isNsfw: boolean;
        videoId: string;
        speakPermlink: string;
        speakAuthor: string;
      };
    };

    if (videoMetadata) {
      setVideoMetadata(videoMetadata.videoMetadata);
      setIs3Speak(videoMetadata.is3Speak);
      setVideoId(videoMetadata.videoId);
      setSpeakPermlink(videoMetadata.speakPermlink);
      setSpeakAuthor(videoMetadata.speakAuthor);
      setIsNsfw(videoMetadata.isNsfw);
    }
  });

  useEffect(() => {
    bodyManager.updateMetadata({
      videoMetadata: {
        is3Speak,
        videoId,
        speakPermlink,
        speakAuthor,
        isNsfw,
        videoMetadata
      }
    });
  }, [speakAuthor]);

  const has3SpeakVideo = (body: string) => {
    const groups = body.matchAll(THREE_SPEAK_VIDEO_PATTERN);
    let has = false;
    for (const group of groups) {
      const match = group[1];

      has = `ipfs://${match}` === videoMetadata?.filename;
    }

    return has;
  };

  const findAndClearUnpublished3SpeakVideo = (body: string) => {
    const groups = body.matchAll(THREE_SPEAK_VIDEO_PATTERN);
    for (const group of groups) {
      const match = group[1];

      /// <center>[![](https://ipfs-3speak.b-cdn.net/ipfs/bafkreic3bnsxobtm2va6j3i6v44gc2p2wazi4iuiqqci23tdt7eba5ad5e)](https://3speak.tv/watch?v=demo.com/meohyozpiu)</center>
      // Has unpublished video
      if (`ipfs://${match}` === videoMetadata?.filename && videoMetadata?.status !== "published") {
        body.replace(
          new RegExp(
            `\[!\[\]\(https:\/\/ipfs-3speak\.b-cdn\.net\/ipfs\/${videoMetadata?.thumbnail.replace(
              "ipfs://",
              ""
            )}\)\]\(https:\/\/3speak\.tv\/watch\?.*\)`
          ),
          ""
        );
      }
    }
  };

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
        isEditing,
        setIsEditing,
        hasUnpublishedVideo,
        has3SpeakVideo,
        findAndClearUnpublished3SpeakVideo,

        clear: () => {
          clearIs3Speak();
          clearIsNsfw();
          clearVideoId();
          clearVideoMetadata();
          clearSpeakPermlink();
          clearSpeakAuthor();
        }
      }}
    >
      {props.children}
    </ThreeSpeakVideoContext.Provider>
  );
}

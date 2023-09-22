import React, { ReactNode, useContext, useMemo, useState } from "react";
import { ThreeSpeakVideo } from "../../../api/threespeak";
import useLocalStorage from "react-use/lib/useLocalStorage";
import { PREFIX } from "../../../util/local-storage";
import { ThreeSpeakVideoContext } from "./three-speak-manager-context";

export function useThreeSpeakManager() {
  return useContext(ThreeSpeakVideoContext);
}

export function ThreeSpeakManager(props: { children: ReactNode }) {
  // Each post could contain multiple published and only one unpublished video itself
  const [videos, setVideos] = useLocalStorage<Record<string, ThreeSpeakVideo>>(
    PREFIX + "_sa_3s_v",
    {}
  );

  const [isNsfw, setIsNsfw, clearIsNsfw] = useLocalStorage(PREFIX + "_sa_3s_n", false);
  const [isEditing, setIsEditing] = useState(false);

  const hasUnpublishedVideo = useMemo(
    () => [...Object.values(videos!!)].some((item) => item.status === "publish_manual"),
    [videos]
  );

  const hasMultipleUnpublishedVideo = useMemo(
    () =>
      [...Object.values(videos!!)].filter((item) => item.status === "publish_manual").length > 1,
    [videos]
  );

  return (
    <ThreeSpeakVideoContext.Provider
      value={{
        videos: videos!!,
        setVideos,
        isNsfw: isNsfw!!,
        setIsNsfw,
        isEditing,
        setIsEditing,
        hasUnpublishedVideo,

        attach: (item: ThreeSpeakVideo) => {
          setVideos({ ...videos, [item._id]: item });
        },
        remove: (itemId: string) => {
          const temp = { ...videos };
          delete temp[itemId];
          setVideos(temp);
        },
        hasMultipleUnpublishedVideo,

        clear: () => {
          setVideos({});
        },

        // Building body based on tokens
        buildBody: (body: string) => {
          let nextBody = `${body}`;
          // Build the preview with 3Speak videos
          const existingVideos = nextBody.match(/\[3speak]\(.*\)/gm);
          existingVideos
            ?.map((group) => ({ group, id: group.replace("[3speak](", "").replace(")", "") }))
            ?.filter(({ id }) => !!videos!![id])
            ?.forEach(({ group, id }) => {
              const video = videos!![id];
              nextBody = nextBody.replace(
                group,
                `<center>[![](https://ipfs-3speak.b-cdn.net/ipfs/${video.thumbUrl})](https://3speak.tv/watch?v=${video.owner}/${video.permlink})</center>`
              );
            });
          return nextBody;
        },

        checkBodyForVideos: (body: string) => {
          if (body) {
            const nextVideos = {};
            const existingVideos = body.match(/\[3speak]\(.*\)/gm);
            existingVideos
              ?.map((group) => ({ id: group.replace("[3speak](", "").replace(")", "") }))
              ?.filter(({ id }) => !!videos!![id])
              ?.forEach(({ id }) => {
                nextVideos[id] = videos!![id];
              });

            setVideos(nextVideos);
          }
        }
      }}
    >
      {props.children}
    </ThreeSpeakVideoContext.Provider>
  );
}

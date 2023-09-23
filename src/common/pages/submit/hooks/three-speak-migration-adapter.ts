import { useThreeSpeakManager } from "./three-speak-manager";
import { useThreeSpeakVideo } from "../../../api/threespeak";
import { useEffect } from "react";

const SPEAK_VIDEO_PATTERN =
  /\[\!\[\]\(https:\/\/ipfs-3speak\.b-cdn\.net\/ipfs\/.*\)\]\(https:\/\/3speak\.tv\/watch\?v=.*\/.*\)\[Source\]\(https:\/\/ipfs-3speak\.b-cdn\.net\/ipfs\/.*\)/g;

interface Props {
  body: string;
  setBody: (v: string) => void;
}

/**
 * This adapter hook translates old 3speak attached posts to new format
 * It needs for drafts or post editing
 */
export function useThreeSpeakMigrationAdapter({ body, setBody }: Props) {
  const { attach } = useThreeSpeakManager();
  const { data: videoList } = useThreeSpeakVideo("all");

  useEffect(() => {
    let nextBody = body;
    if (body) {
      try {
        const videosInPost = body.match(SPEAK_VIDEO_PATTERN);
        if (videosInPost && videosInPost.length > 0) {
          videosInPost?.forEach((video) => {
            const v = video.matchAll(/.*watch\?v=(.+)\/(.+)\)\[Source\]/g);
            const [_, username, permlink] = v.next().value;

            const existingVideo = videoList.find(
              (video) => video.permlink === permlink && video.owner === username
            );
            if (existingVideo) {
              nextBody = nextBody.replace(video, `[3speak](${existingVideo._id})`);
              setTimeout(() => attach(existingVideo), 1); // Drop from callstack to end
            }
          });
        }
        setBody(nextBody);
      } catch (e) {
        console.error("[Old 3Speak video migration error]: Failed to migrate old 3speak video", e);
      }
    }
  }, [body, videoList]);
}

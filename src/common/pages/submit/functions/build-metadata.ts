import { extractMetaData, makeJsonMetaData } from "../../../helper/posting";
import * as ls from "../../../util/local-storage";
import { postBodySummary } from "@ecency/render-helper";
import { ThreeSpeakVideo } from "../../../api/threespeak";
import { version } from "../../../../../package.json";

export function buildMetadata({
  tags,
  title,
  body,
  description,
  selectedThumbnail,
  selectionTouched,
  videoMetadata,
  images
}: {
  tags: string[];
  title: string;
  body: string;
  description: string | null;
  selectedThumbnail?: string;
  selectionTouched: boolean;
  videoMetadata?: ThreeSpeakVideo;
  images?: string[];
}) {
  const { thumbnails, ...meta } = extractMetaData(body);
  let localThumbnail = ls.get("draft_selected_image");

  if (images?.length) {
    meta.image = [...images, ...(meta.image || [])];
  }

  if (meta.image) {
    if (selectionTouched && selectedThumbnail) {
      meta.image = [selectedThumbnail, ...meta.image!.splice(0, 9)];
    } else {
      meta.image = [...meta.image!.splice(0, 9)];
    }
  } else if (selectedThumbnail === localThumbnail) {
    ls.remove("draft_selected_image");
  } else {
    meta.image = selectedThumbnail ? [selectedThumbnail] : [];
  }
  if (meta.image) {
    meta.image = [...new Set(meta.image)];
  }
  if (videoMetadata) {
    meta.video = {
      info: {
        platform: "3speak",
        title: title || videoMetadata.title,
        author: videoMetadata.owner,
        permlink: videoMetadata.permlink,
        duration: videoMetadata.duration,
        filesize: videoMetadata.size,
        file: videoMetadata.filename,
        lang: videoMetadata.language,
        firstUpload: videoMetadata.firstUpload,
        ipfs: null,
        ipfsThumbnail: null,
        video_v2: videoMetadata.video_v2,
        sourceMap: [
          {
            type: "video",
            url: videoMetadata.video_v2,
            format: "m3u8"
          },
          {
            type: "thumbnail",
            url: videoMetadata.thumbUrl
          }
        ]
      },
      content: {
        description: description || videoMetadata.description,
        tags: videoMetadata.tags_v2
      }
    };
  }

  const summary = description === null ? postBodySummary(body, 200) : description;

  return makeJsonMetaData(meta, tags, summary, version);
}

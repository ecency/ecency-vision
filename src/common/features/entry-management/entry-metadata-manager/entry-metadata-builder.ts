import { MetaData } from "../../../api/operations";
import { Entry } from "../../../store/entries/types";
import { postBodySummary, proxifyImageSrc } from "@ecency/render-helper";
import { ThreeSpeakVideo } from "../../../api/threespeak";
import { PollSnapshot } from "../../polls";
import { extractMetaData, makeApp } from "../../../helper/posting";
import { version } from "../../../../../package.json";
import * as ls from "../../../util/local-storage";
import { getDimensionsFromDataUrl } from "./get-dimensions-from-data-url";

const DEFAULT_TAGS = ["ecency"];

const DEFAULT_METADATA = {
  app: makeApp(version),
  tags: [...DEFAULT_TAGS],
  format: "markdown+html"
};

export class EntryMetadataBuilder {
  private temporaryMetadata: MetaData = {};

  public extend(entry?: Entry): this {
    this.temporaryMetadata = {
      ...entry?.json_metadata
    };
    return this;
  }

  public default(): this {
    this.temporaryMetadata = {
      ...DEFAULT_METADATA
    };
    return this;
  }

  public extractFromBody(body: string): this {
    const meta = extractMetaData(body);
    this.temporaryMetadata = {
      ...this.temporaryMetadata,
      ...meta
    };
    return this;
  }

  public withPinnedReply(reply: Entry, pinned: boolean): this {
    return this.withField("pinned_reply", pinned ? `${reply.author}/${reply.permlink}` : undefined);
  }

  public withSummary(bodyOrDescription: string): this {
    return this.withField("description", postBodySummary(bodyOrDescription, 200));
  }

  public withTags(tags?: string[]): this {
    return this.withField("tags", tags?.concat(DEFAULT_TAGS) ?? DEFAULT_TAGS);
  }

  public async withImages(
    selectedThumbnail: string | undefined,
    selectionTouched: boolean,
    images?: string[]
  ): Promise<this> {
    const localThumbnail = ls.get("draft_selected_image");
    const { image, thumbnails } = this.temporaryMetadata;
    let nextImages: string[] = [];

    if (images?.length) {
      nextImages = [...images, ...(image || [])];
    }

    if (nextImages) {
      if (selectionTouched && selectedThumbnail) {
        nextImages = [selectedThumbnail, ...image!.splice(0, 9)];
      } else {
        nextImages = [...image!.splice(0, 9)];
      }
    } else if (selectedThumbnail === localThumbnail) {
      ls.remove("draft_selected_image");
    } else {
      nextImages = selectedThumbnail ? [selectedThumbnail] : [];
    }
    if (nextImages) {
      nextImages = [...new Set(nextImages)];
    }
    this.withField("image", nextImages);
    this.withField(
      "image_ratios",
      await Promise.all(
        nextImages
          .slice(0, 5)
          .map((element: string) => getDimensionsFromDataUrl(proxifyImageSrc(element)))
      )
    );
    return this;
  }

  public withVideo(
    title: string,
    description: string | null,
    videoMetadata?: ThreeSpeakVideo
  ): this {
    return this.withField(
      "video",
      videoMetadata
        ? {
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
          }
        : undefined
    );
  }

  public withPoll(poll?: PollSnapshot): this {
    this.temporaryMetadata = {
      ...this.temporaryMetadata,
      ...(poll
        ? {
            content_type: "poll",
            version: 0.6,
            question: poll.title,
            choices: poll.choices,
            preferred_interpretation: poll.interpretation,
            token: null,
            hide_votes: poll.hideVotes,
            vote_change: poll.voteChange,
            filters: {
              account_age: poll.filters.accountAge
            },
            end_time: Math.round(poll.endTime.getTime() / 1000)
          }
        : {})
    } as MetaData;
    return this;
  }

  public build(): MetaData {
    return { ...this.temporaryMetadata };
  }

  private withField(fieldName: keyof MetaData, value: MetaData[typeof fieldName]): this {
    this.temporaryMetadata[fieldName] = value;
    return this;
  }
}

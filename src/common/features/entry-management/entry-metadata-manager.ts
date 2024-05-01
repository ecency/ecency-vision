import { Entry, JsonMetadata } from "../../store/entries/types";
import { makeApp } from "../../helper/posting";
import { version } from "../../../../package.json";

export namespace EntryMetadataManagement {
  const DEFAULT_TAGS = ["ecency"];

  const DEFAULT_METADATA = {
    app: makeApp(version),
    tags: [...DEFAULT_TAGS],
    format: "markdown+html"
  };

  class EntryMetadataBuilder {
    private temporaryMetadata: JsonMetadata = {};

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

    public setPinnedReply(reply: Entry, pinned: boolean): this {
      this.temporaryMetadata.pinned_reply = pinned
        ? `${reply.author}/${reply.permlink}`
        : undefined;
      return this;
    }

    public assignTags(tags?: string[]): this {
      this.temporaryMetadata.tags = tags?.concat(DEFAULT_TAGS) ?? DEFAULT_TAGS;
      return this;
    }

    public build(): JsonMetadata {
      return { ...this.temporaryMetadata };
    }
  }

  export class EntryMetadataManager {
    public static shared = new EntryMetadataManager();

    public builder(): EntryMetadataBuilder {
      return new EntryMetadataBuilder();
    }
  }
}

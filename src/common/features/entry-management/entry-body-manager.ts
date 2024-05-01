import { diff_match_patch } from "diff-match-patch";
import { Entry } from "../../store/entries/types";

export namespace EntryBodyManagement {
  class EntryBodyBuilder {
    public buildClearBody(entry: Entry) {
      return entry.body.replace(/[\x00-\x09\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, "");
    }

    public buildPatchFrom(entry: Entry, newBody: string) {
      const dmp = new diff_match_patch();
      if (entry.body === "") {
        return "";
      }
      const clearBody = this.buildClearBody(entry);
      const patches = dmp.patch_make(clearBody, newBody);
      const patch = dmp.patch_toText(patches);

      if (patch && patch.length < Buffer.from(clearBody, "utf-8").length) {
        return patch;
      }

      return newBody;
    }
  }

  export class EntryBodyManager {
    public static shared = new EntryBodyManager();

    public builder(): EntryBodyBuilder {
      return new EntryBodyBuilder();
    }
  }
}

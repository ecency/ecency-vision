import { EntryFilter } from "@/enums";
import { isCommunity } from "@/utils";

export namespace PageDetector {
  interface Props {
    params: { slugs: string[] };
  }
  type Page = "index" | "entry" | "community" | "profile" | "edit" | "not-detected";

  export function detect({ params: { slugs } }: Props): Page {
    const isEntryPage = slugs.length > 2;
    const isEditPage = slugs[2] === "edit";
    const isProfilePage = slugs[0].startsWith("@") || (slugs[0].startsWith("%40") && !isEditPage);
    const isCommunityPage = slugs[1] ? isCommunity(slugs[1]) : false;
    const isIndexPage = Object.values<string>(EntryFilter).includes(slugs[0]);

    if (isIndexPage && !isEditPage && !isProfilePage && !isEntryPage && !isCommunityPage) {
      return "index";
    }

    if (isProfilePage && !isEntryPage && !isEditPage && !isCommunityPage) {
      return "profile";
    }

    if (isEditPage && isEntryPage && !isCommunityPage) {
      return "edit";
    }

    if (isEntryPage && !isCommunityPage) {
      return "entry";
    }

    if (isCommunityPage) {
      return "community";
    }

    return "not-detected";
  }
}

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

    if (isIndexPage && !isProfilePage && !isEntryPage && !isCommunityPage) {
      return "index";
    }

    if (isProfilePage && !isIndexPage && !isEntryPage && !isCommunityPage) {
      return "profile";
    }

    if (isEntryPage && !isEditPage && !isProfilePage && !isIndexPage && !isCommunityPage) {
      return "entry";
    }

    if (isEditPage && isEntryPage && !isProfilePage && !isIndexPage && !isCommunityPage) {
      return "edit";
    }

    if (isCommunityPage && !isEntryPage && !isProfilePage && !isIndexPage) {
      return "community";
    }

    return "not-detected";
  }
}

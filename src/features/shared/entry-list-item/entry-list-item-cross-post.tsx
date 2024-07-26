import { EntryLink, ProfileLink } from "@/features/shared";
import i18next from "i18next";
import { truncate } from "@/utils";
import { TagLink } from "@/features/shared/tag";
import React from "react";
import { Entry } from "@/entities";

interface Props {
  entry: Entry;
}

export function EntryListItemCrossPost({ entry }: Props) {
  const isCrossPost = !!entry.original_entry;

  return isCrossPost ? (
    <div className="cross-item">
      <ProfileLink username={entry.author}>
        <span className="cross-item-author notranslate">{`@${entry.author}`}</span>
      </ProfileLink>{" "}
      {i18next.t("entry-list-item.cross-posted")}{" "}
      <EntryLink entry={entry.original_entry!}>
        <a className="cross-item-link">
          {truncate(`@${entry.original_entry!.author}/${entry.original_entry!.permlink}`, 40)}
        </a>
      </EntryLink>{" "}
      {i18next.t("entry-list-item.cross-posted-to")}{" "}
      <TagLink
        type="link"
        tag={
          entry.community && entry.community_title
            ? { name: entry.community, title: entry.community_title }
            : entry.category
        }
      >
        <a className="community-name">{entry.community_title || entry.category}</a>
      </TagLink>
    </div>
  ) : (
    <> </>
  );
}

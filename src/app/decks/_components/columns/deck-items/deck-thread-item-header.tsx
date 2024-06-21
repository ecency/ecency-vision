import React from "react";
import { ThreadItemEntry } from "../deck-threads-manager";
import { Spinner } from "@ui/spinner";
import { UserAvatar } from "@/features/shared";
import Link from "next/link";
import { useGlobalStore } from "@/core/global-store";
import i18next from "i18next";
import { dateToRelative } from "@/utils";

interface Props {
  entry: ThreadItemEntry;
  hasParent: boolean;
  pure: boolean;
  status: string;
}

export const DeckThreadItemHeader = ({ entry, hasParent, pure, status }: Props) => {
  const activeUser = useGlobalStore((s) => s.activeUser);

  return (
    <div className="thread-item-header">
      <UserAvatar size="deck-item" username={entry.author} />
      <div className="username truncate">
        <Link href={`/@${entry.author}`}>{entry.author}</Link>
        {activeUser?.username === entry.author && (
          <span className="you">{`(${i18next.t("g.you")})`}</span>
        )}
        {hasParent && !pure && (
          <>
            <span>{i18next.t("decks.columns.replied-to")}</span>
            <Link href={`/@${entry.parent_author}`}>{entry.parent_author}</Link>
          </>
        )}
      </div>
      <div className="host">
        <Link target="_blank" href={`/created/${entry.category}`}>
          #{entry.host}
        </Link>
      </div>

      <div className="date">
        {status === "default" && (
          <Link target="_blank" href={`/@${entry.author}/${entry.permlink}`}>
            {`${dateToRelative(entry.created)}`}
          </Link>
        )}
        {status === "pending" && <Spinner className="w-4 h-4" />}
      </div>
    </div>
  );
};

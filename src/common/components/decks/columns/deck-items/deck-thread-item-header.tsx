import { UserAvatar } from "../../../user-avatar";
import { Link } from "react-router-dom";
import { _t } from "../../../../i18n";
import { dateToRelative } from "../../../../helper/parse-date";
import React from "react";
import { useMappedStore } from "../../../../store/use-mapped-store";
import { ThreadItemEntry } from "../deck-threads-manager";
import { Spinner } from "@ui/spinner";

interface Props {
  entry: ThreadItemEntry;
  hasParent: boolean;
  pure: boolean;
  status: string;
}

export const DeckThreadItemHeader = ({ entry, hasParent, pure, status }: Props) => {
  const { activeUser, global } = useMappedStore();

  return (
    <div className="thread-item-header">
      <UserAvatar size="deck-item" global={global} username={entry.author} />
      <div className="username text-truncate">
        <Link to={`/@${entry.author}`}>{entry.author}</Link>
        {activeUser?.username === entry.author && <span className="you">{`(${_t("g.you")})`}</span>}
        {hasParent && !pure && (
          <>
            <span>{_t("decks.columns.replied-to")}</span>
            <Link to={`/@${entry.parent_author}`}>{entry.parent_author}</Link>
          </>
        )}
      </div>
      <div className="host">
        <Link target="_blank" to={`/created/${entry.category}`}>
          #{entry.host}
        </Link>
      </div>

      <div className="date">
        {status === "default" && (
          <Link target="_blank" to={`/@${entry.author}/${entry.permlink}`}>
            {`${dateToRelative(entry.created)}`}
          </Link>
        )}
        {status === "pending" && <Spinner className="w-4 h-4" />}
      </div>
    </div>
  );
};

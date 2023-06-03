import ProfileLink from "../profile-link";
import { _t } from "../../i18n";
import Tag from "../tag";
import React from "react";
import UserAvatar from "../user-avatar";
import BookmarkBtn from "../bookmark-btn";
import EntryMenu from "../entry-menu";
import { useMappedStore } from "../../store/use-mapped-store";
import { History } from "history";
import accountReputation from "../../helper/account-reputation";
import { Entry } from "../../store/entries/types";
import moment from "moment/moment";
import parseDate from "../../helper/parse-date";
import "./_index.scss";

interface Props {
  entry: Entry;
  history: History;
}

export const EntryInfo = ({ entry, history }: Props) => {
  const {
    addAccount,
    global,
    activeUser,
    setActiveUser,
    users,
    ui,
    deleteUser,
    updateActiveUser,
    toggleUIProp
  } = useMappedStore();

  const reputation = accountReputation(entry.author_reputation);
  const published = moment(parseDate(entry.created));

  return (
    <div className="entry-info">
      <ProfileLink history={history} addAccount={addAccount} username={entry.author}>
        <div className="author-avatar">
          <UserAvatar username={entry.author!!} size="medium" />
        </div>
      </ProfileLink>

      <div className="entry-info-inner">
        <div className="info-line-1">
          <ProfileLink history={history} addAccount={addAccount} username={entry.author}>
            <div className="author notranslate">
              <span className="author-name">
                <span itemProp="author" itemScope={true} itemType="http://schema.org/Person">
                  <span itemProp="name">{entry.author}</span>
                </span>
              </span>
              <span className="author-reputation" title={_t("entry.author-reputation")}>
                {reputation}
              </span>
            </div>
          </ProfileLink>
        </div>

        <div className="info-line-2">
          <span className="date" title={published.format("LLLL")}>
            {published.fromNow()}
          </span>
          <span className="separator circle-separator" />
          <div className="entry-tag">
            <span className="in-tag">{_t("entry.community-in")}</span>
            <Tag global={global} history={history} tag={entry.category} type="link">
              <div className="tag-name">
                {entry.community ? entry.community_title : `#${entry.category}`}
              </div>
            </Tag>
          </div>
        </div>
      </div>
      <span className="flex-spacer" />
      {global.usePrivate && (
        <BookmarkBtn
          entry={entry}
          activeUser={activeUser}
          setActiveUser={setActiveUser}
          users={users}
          ui={ui}
          deleteUser={deleteUser}
          updateActiveUser={updateActiveUser}
          toggleUIProp={toggleUIProp}
        />
      )}
      <EntryMenu history={history} entry={entry} separatedSharing={true} />
    </div>
  );
};

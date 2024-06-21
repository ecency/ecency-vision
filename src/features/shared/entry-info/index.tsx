import moment from "moment";
import "./_index.scss";
import { accountReputation, parseDate } from "@/utils";
import { Entry } from "@/entities";
import { BookmarkBtn, EntryMenu, ProfileLink, UserAvatar } from "@/features/shared";
import i18next from "i18next";
import { TagLink } from "@/features/shared/tag";
import { useGlobalStore } from "@/core/global-store";

interface Props {
  entry: Entry;
}

export const EntryInfo = ({ entry }: Props) => {
  const usePrivate = useGlobalStore((s) => s.usePrivate);

  const reputation = accountReputation(entry.author_reputation);
  const published = moment(parseDate(entry.created));

  return (
    <div className="entry-info">
      <ProfileLink username={entry.author}>
        <div className="author-avatar">
          <UserAvatar username={entry.author!!} size="medium" />
        </div>
      </ProfileLink>

      <div className="entry-info-inner">
        <div className="info-line-1">
          <ProfileLink username={entry.author}>
            <div className="author notranslate">
              <span className="author-name">
                <span itemProp="author" itemScope={true} itemType="http://schema.org/Person">
                  <span itemProp="name">{entry.author}</span>
                </span>
              </span>
              <span className="author-reputation" title={i18next.t("entry.author-reputation")}>
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
            <span className="in-tag">{i18next.t("entry.community-in")}</span>
            <TagLink tag={entry.category} type="link">
              <div className="tag-name">
                {entry.community ? entry.community_title : `#${entry.category}`}
              </div>
            </TagLink>
          </div>
        </div>
      </div>
      <span className="flex-spacer" />
      {usePrivate && <BookmarkBtn entry={entry} />}
      <EntryMenu entry={entry} separatedSharing={true} />
    </div>
  );
};

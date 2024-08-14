import { BookmarkBtn, ProfileLink, UserAvatar } from "@/features/shared";
import i18next from "i18next";
import { Entry } from "@/entities";
import ReadTime from "@/app/[...slugs]/_entry-components/entry-read-time";
import { useGlobalStore } from "@/core/global-store";
import moment from "moment/moment";
import { accountReputation, parseDate } from "@/utils";
import { TagLink } from "@/features/shared/tag";
import { EntryPageMainInfoMenu } from "@/app/[...slugs]/_entry-components/entry-page-main-info-menu";

interface Props {
  entry: Entry;
}

export function EntryPageMainInfo({ entry }: Props) {
  const usePrivate = useGlobalStore((s) => s.usePrivate);
  const isComment = !!entry.parent_author;

  const published = moment(parseDate(entry.created));
  const reputation = accountReputation(entry.original_entry?.author_reputation ?? 0);

  return (
    <div className="entry-info">
      <ProfileLink username={entry.author}>
        <div className="author-avatar">
          <UserAvatar username={entry.author} size="medium" />
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

        <div className="info-line-2 gap-1">
          <span className="date" title={published.format("LLLL")}>
            {published.fromNow()}
          </span>
          <span className="separator circle-separator" />
          <div className="entry-tag">
            <span className="in-tag mr-2">{i18next.t("entry.community-in")}</span>
            <TagLink tag={entry.category} type="link">
              <div className="tag-name">
                {entry.community ? entry.community_title : `#${entry.category}`}
              </div>
            </TagLink>
          </div>
        </div>
      </div>
      <span className="flex-spacer" />

      <ReadTime entry={entry} toolTip={true} />

      {!isComment && usePrivate && <BookmarkBtn entry={entry} />}
      {!isComment && <EntryPageMainInfoMenu entry={entry} />}
    </div>
  );
}

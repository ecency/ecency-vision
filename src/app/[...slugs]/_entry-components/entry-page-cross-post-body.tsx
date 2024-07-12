import { BookmarkBtn, EntryMenu, ProfileLink, UserAvatar } from "@/features/shared";
import i18next from "i18next";
import moment from "moment";
import { accountReputation, parseDate } from "@/utils";
import { Entry } from "@/entities";
import { renderPostBody } from "@ecency/render-helper";
import { useGlobalStore } from "@/core/global-store";
import { TagLink } from "@/features/shared/tag";

interface Props {
  entry: Entry;
}

export function EntryPageCrossPostBody({ entry }: Props) {
  const canUseWebp = useGlobalStore((s) => s.canUseWebp);
  const usePrivate = useGlobalStore((s) => s.usePrivate);

  if (!entry.original_entry) {
    return <></>;
  }

  const published = moment(parseDate(entry.original_entry.created));
  const reputation = accountReputation(entry.original_entry.author_reputation);
  const renderedBody = {
    __html: renderPostBody(entry.original_entry.body, false, canUseWebp)
  };

  return (
    <>
      <div className="entry-header">
        <h1 className="entry-title">{entry.original_entry.title}</h1>
        <div className="entry-info">
          <ProfileLink username={entry.original_entry.author}>
            <div className="author-avatar">
              <UserAvatar username={entry.original_entry.author} size="medium" />
            </div>
          </ProfileLink>

          <div className="entry-info-inner">
            <div className="info-line-1">
              <ProfileLink username={entry.original_entry.author}>
                <div className="author notranslate">
                  <span className="author-name">
                    <span itemProp="author" itemScope={true} itemType="http://schema.org/Person">
                      <span itemProp="name">{entry.original_entry.author}</span>
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
                <TagLink tag={entry.original_entry.category} type="link">
                  <div className="tag-name">
                    {entry.original_entry.community
                      ? entry.original_entry.community_title
                      : `#${entry.original_entry.category}`}
                  </div>
                </TagLink>
              </div>
            </div>
          </div>
          <span className="flex-spacer" />
          {usePrivate && <BookmarkBtn entry={entry.original_entry} />}
          <EntryMenu entry={entry} separatedSharing={true} />
        </div>
      </div>
      <div
        itemProp="articleBody"
        className="entry-body markdown-view user-selectable"
        dangerouslySetInnerHTML={renderedBody}
        onMouseUp={(e) => {}}
      />
    </>
  );
}

import i18next from "i18next";
import { ProfileLink, UserAvatar } from "@/features/shared";
import { TagLink } from "@/features/shared/tag";
import { crossPostMessage } from "@/utils/cross-post";
import { Entry } from "@/entities";

interface Props {
  entry: Entry;
}

export function EntryPageCrossPostHeader({ entry }: Props) {
  return entry.original_entry ? (
    <div className="cross-post">
      <div className="cross-post-info">
        {i18next.t("entry.cross-post-by")}
        <ProfileLink username={entry.author}>
          <div className="cross-post-author">
            <UserAvatar username={entry.author} size="medium" />
            {`@${entry.author}`}
          </div>
        </ProfileLink>
      </div>
      <div className="cross-post-community">
        <TagLink tag={entry.category} type="link">
          <div className="community-link">{entry.community_title}</div>
        </TagLink>
        {i18next.t("entry.cross-post-community")}
      </div>
      <div className="cross-post-message">
        {'"'}
        {crossPostMessage(entry.body)}
        {'"'}
      </div>
    </div>
  ) : (
    <></>
  );
}

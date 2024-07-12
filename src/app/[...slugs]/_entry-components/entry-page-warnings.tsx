import i18next from "i18next";
import { Tsx } from "@/features/i18n/helper";
import { Entry } from "@/entities";
import { EntryPageMightContainsMutedCommentsWarning } from "@/app/[...slugs]/_entry-components/entry-page-might-contains-muted-comments-warning";

interface Props {
  entry: Entry;
}

export function EntryPageWarnings({ entry }: Props) {
  const isMuted = !!entry.stats?.gray && entry.net_rshares >= 0 && entry.author_reputation >= 0;
  const isHidden = entry?.net_rshares < -7000000000 && entry?.active_votes?.length > 3; // 1000 HP
  const isLowReputation =
    !!entry.stats?.gray && entry.net_rshares >= 0 && entry.author_reputation < 0;

  return (
    <>
      {isMuted && (
        <div className="hidden-warning">
          <span>
            <Tsx
              k="entry.muted-warning"
              args={{ community: entry.community ? entry.community_title : "" }}
            >
              <span />
            </Tsx>
          </span>
        </div>
      )}

      {isHidden && (
        <div className="hidden-warning">
          <span>{i18next.t("entry.hidden-warning")}</span>
        </div>
      )}

      {isLowReputation && (
        <div className="hidden-warning">
          <span>{i18next.t("entry.lowrep-warning")}</span>
        </div>
      )}
      <EntryPageMightContainsMutedCommentsWarning entry={entry} />
    </>
  );
}

import { ProfileLink } from "@/features/shared";
import i18next from "i18next";
import { Tsx } from "@/features/i18n/helper";
import { Entry } from "@/entities";
import { accountReputation, appName, parseDate } from "@/utils";
import moment from "moment";

interface Props {
  entry: Entry;
}

export function EntryFooterInfo({ entry }: Props) {
  const app = appName(entry.json_metadata.app);
  const appShort = app.split("/")[0].split(" ")[0];
  const published = moment(parseDate(entry.created));
  const reputation = accountReputation(entry.author_reputation ?? 0);

  return (
    <div className="entry-info text-sm">
      <div className="date" title={published.format("LLLL")}>
        {published.fromNow()}
      </div>
      <span className="separator circle-separator" />
      <ProfileLink username={entry.author}>
        <div className="author notranslate">
          <span className="author-name">{entry.author}</span>
          <span className="author-reputation" title={i18next.t("entry.author-reputation")}>
            {reputation}
          </span>
        </div>
      </ProfileLink>
      {app && (
        <>
          <span className="separator circle-separator" />
          <span itemProp="publisher" itemScope={true} itemType="http://schema.org/Person">
            <meta itemProp="name" content={entry.author} />
          </span>
          <div className="app" title={app}>
            <Tsx k="entry.via-app" args={{ app: appShort }}>
              <a href="/faq#source-label" />
            </Tsx>
          </div>
        </>
      )}
    </div>
  );
}

import { EntryPageNsfwWarning } from "@/app/[...slugs]/_entry-components/entry-page-nsfw-warning";
import { EntryPageCrossPostBody } from "@/app/[...slugs]/_entry-components/entry-page-cross-post-body";
import { EntryPageWarnings } from "@/app/[...slugs]/_entry-components/entry-page-warnings";
import { EntryPageIsCommentHeader } from "@/app/[...slugs]/_entry-components/entry-page-is-comment-header";
import { EntryPageBodyViewer } from "@/app/[...slugs]/_entry-components/entry-page-body-viewer";
import { EntryPageMainInfo } from "@/app/[...slugs]/_entry-components/entry-page-main-info";
import { EntryPageProfileBox } from "@/app/[...slugs]/_entry-components/entry-page-profile-box";
import { EntryTags } from "@/app/[...slugs]/_entry-components/entry-tags";
import { EntryFooterInfo } from "@/app/[...slugs]/_entry-components/entry-footer-info";
import { EntryFooterControls } from "@/app/[...slugs]/_entry-components/entry-footer-controls";
import { EntryPageShowOriginal } from "@/app/[...slugs]/_entry-components/entry-page-show-original";
import { EntryPageSimilarEntries } from "@/app/[...slugs]/_entry-components/entry-page-similar-entries";
import { EntryPageDiscussions } from "@/app/[...slugs]/_entry-components/entry-page-discussions";
import { Entry } from "@/entities";
import { useGlobalStore } from "@/core/global-store";
import { EcencyClientServerBridge } from "@/core/bridge";
import { EntryPageContext } from "@/app/[...slugs]/_entry-components/context";

interface Props {
  entry: Entry;
  rawParam: string;
  isEdit: boolean;
  category: string;
}

export function EntryPageContent({ entry, rawParam, isEdit, category }: Props) {
  const globalNsfw = useGlobalStore((s) => s.nsfw);

  const { showIfNsfw } = EcencyClientServerBridge.useSafeContext(EntryPageContext);

  const showNsfwWarning =
    (entry.json_metadata.tags?.includes("nsfw") ?? false) && !showIfNsfw && !globalNsfw;

  return (
    <>
      {showNsfwWarning && <EntryPageNsfwWarning />}
      {!showNsfwWarning && (
        <>
          <EntryPageCrossPostBody entry={entry} />
          <div className="entry-header">
            <EntryPageWarnings entry={entry} />
            <EntryPageIsCommentHeader entry={entry} />
            <h1 className="entry-title">{entry.title}</h1>
            <EntryPageBodyViewer entry={entry} rawParam={rawParam} isEdit={isEdit} />
          </div>
          <EntryPageMainInfo entry={entry} />
          <EntryPageProfileBox entry={entry} />
          <div className="entry-footer">
            <EntryTags entry={entry} />
            <EntryFooterInfo entry={entry} />
            <EntryFooterControls entry={entry} />
          </div>
          <EntryPageShowOriginal entry={entry} />
          <EntryPageSimilarEntries entry={entry} />
          <EntryPageDiscussions category={category} entry={entry} />
        </>
      )}
    </>
  );
}

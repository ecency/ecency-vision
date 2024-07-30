import { Entry } from "@/entities";
import { PollWidget, useEntryPollExtractor } from "@/features/polls";
import { renderPostBody } from "@ecency/render-helper";
import { useGlobalStore } from "@/core/global-store";
import { EntryPageEdit } from "@/app/[...slugs]/_entry-components/entry-page-edit";
import { SelectionPopover } from "@/app/[...slugs]/_entry-components/selection-popover";
import { EntryPageViewerManager } from "@/app/[...slugs]/_entry-components/entry-page-viewer-manager";

interface Props {
  entry: Entry;
  rawParam: string;
  isEdit: boolean;
}

export function EntryPageBodyViewer({ entry, rawParam, isEdit }: Props) {
  const canUseWebp = useGlobalStore((s) => s.canUseWebp);

  const postPoll = useEntryPollExtractor(entry);

  const preparedEntryBody = entry.body.replace(/<a id="/g, '<a data-id="');
  const renderedBody = {
    __html: renderPostBody(preparedEntryBody, false, canUseWebp)
  };

  return (
    <EntryPageViewerManager entry={entry}>
      {!isEdit && (
        <>
          <SelectionPopover postUrl={entry.url}>
            <div
              itemProp="articleBody"
              className="entry-body markdown-view user-selectable"
              dangerouslySetInnerHTML={renderedBody}
            />
            {postPoll && (
              <div className="pb-6">
                <PollWidget entry={entry} poll={postPoll} isReadOnly={false} />
              </div>
            )}
          </SelectionPopover>
        </>
      )}
      {isEdit && <EntryPageEdit entry={entry} />}
    </EntryPageViewerManager>
  );
}

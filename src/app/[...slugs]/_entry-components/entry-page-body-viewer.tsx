import { Entry } from "@/entities";
import { PollWidget, useEntryPollExtractor } from "@/features/polls";
import { renderPostBody } from "@ecency/render-helper";
import { useGlobalStore } from "@/core/global-store";
import { EcencyClientServerBridge } from "@/core/bridge";
import { EntryPageContext } from "@/app/[...slugs]/_entry-components/context";
import { EntryPageEdit } from "@/app/[...slugs]/_entry-components/entry-page-edit";
import { SelectionPopover } from "@/app/[...slugs]/_entry-components/selection-popover";

interface Props {
  entry: Entry;
  rawParam: string;
  isEdit: boolean;
}

export function EntryPageBodyViewer({ entry, rawParam, isEdit }: Props) {
  const canUseWebp = useGlobalStore((s) => s.canUseWebp);
  const usePrivate = useGlobalStore((s) => s.usePrivate);

  const { isRawContent } = EcencyClientServerBridge.useSafeContext(EntryPageContext);
  const postPoll = useEntryPollExtractor(entry);

  const preparedEntryBody = entry.body.replace(/<a id="/g, '<a data-id="');
  const renderedBody = {
    __html: renderPostBody(preparedEntryBody, false, canUseWebp)
  };

  return !isRawContent ? (
    <>
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
    </>
  ) : (
    <pre className="entry-body markdown-view user-selectable">{entry.body}</pre>
  );
}

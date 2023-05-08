import { Entry } from "../../../../store/entries/types";
import { History } from "history";
import React, { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { arrowLeftSvg } from "../../../../img/svg";
import { _t } from "../../../../i18n";
import { useMappedStore } from "../../../../store/use-mapped-store";
import { useLocation } from "react-router";
import useMount from "react-use/lib/useMount";
import { ThreadItem } from "../deck-items";
import { getDiscussion } from "../../../../api/bridge";
import { IdentifiableEntry } from "../deck-threads-manager";
import { DeckThreadsForm } from "../../deck-threads-form";

interface Props {
  entry: IdentifiableEntry;
  history: History;
  backTitle?: string;
  onClose: () => void;
}

type EntryWithReplies = IdentifiableEntry & { replies: IdentifiableEntry[] };

export const DeckThreadItemViewer = ({ entry, history, backTitle, onClose }: Props) => {
  const [data, setData] = useState<EntryWithReplies[]>([]);

  const [isMounted, setIsMounted] = useState(false);
  useMount(() => setIsMounted(true));

  useEffect(() => {
    fetch();
  }, []);

  const fetch = async () => {
    const response = await getDiscussion(entry.author, entry.permlink);

    if (response) {
      const tempResponse = { ...response } as Record<string, IdentifiableEntry>;
      const builtDataTree = Object.values(tempResponse)
        .filter((i) => i.post_id !== entry.id)
        .map((i) => {
          i.replies = i.replies.map((r) => {
            const replyInstance = tempResponse[r];
            delete tempResponse[r];
            return replyInstance;
          });
          i.host = entry.host;
          return i;
        });
      setData(builtDataTree);
    }
  };

  return (
    <div className={"deck-post-viewer " + (isMounted ? "visible" : "")}>
      <div className="deck-post-viewer-header">
        <div className="actions d-flex pt-3 mr-3">
          <Button
            variant="link"
            onClick={() => {
              setIsMounted(false);
              onClose();
            }}
          >
            {arrowLeftSvg}
            {backTitle}
          </Button>
          <Button variant="outline-primary" href={entry.url} target="_blank" size="sm">
            {_t("decks.columns.view-full-post")}
          </Button>
        </div>
      </div>
      <ThreadItem
        pure={true}
        entry={entry}
        onEntryView={() => {}}
        history={history}
        onMounted={() => {}}
        onResize={() => {}}
      />
      <DeckThreadsForm inline={true} placeholder={_t("decks.threads-form.write-your-reply")} />
      <div className="deck-thread-item-viewer-replies">
        {data.map((item) => (
          <div key={item.id}>
            {[item, ...item.replies].map((item) => (
              <ThreadItem
                entry={item}
                history={history}
                onMounted={() => {}}
                onEntryView={() => {}}
                onResize={() => {}}
                key={item.id}
                hideHost={true}
                pure={true}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

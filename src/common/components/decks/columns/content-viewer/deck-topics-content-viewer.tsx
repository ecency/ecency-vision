import React, { useState } from "react";
import useMount from "react-use/lib/useMount";
import { arrowLeftSvg } from "../../../../img/svg";
import { Entry } from "../../../../store/entries/types";
import { getPostsRanked } from "../../../../api/bridge";
import { ListItemSkeleton, SearchListItem } from "../deck-items";
import { makePath } from "../../../entry-link";
import { Button } from "@ui/button";

interface Props {
  topic: string;
  backTitle?: string;
  onClose: () => void;
}

export const DeckTopicsContentViewer = ({ onClose, backTitle, topic }: Props) => {
  const [isMounted, setIsMounted] = useState(false);
  const [data, setData] = useState<Entry[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useMount(() => {
    setIsMounted(true);
    fetch();
  });

  const fetch = async () => {
    try {
      const response = await getPostsRanked("trending", "", "", 20, topic);
      if (response) {
        setData(response);
      }
    } catch (e) {
    } finally {
      setIsLoaded(true);
    }
  };

  return (
    <div
      className={
        "deck-post-viewer deck-topic-content-viewer w-full " + (isMounted ? "visible" : "")
      }
    >
      <div className="deck-post-viewer-header">
        <div className="actions flex pt-3 mr-3">
          <Button
            appearance="link"
            onClick={() => {
              setIsMounted(false);
              setTimeout(() => onClose(), 300);
            }}
            icon={arrowLeftSvg}
            iconPlacement="left"
          >
            {backTitle}
          </Button>
        </div>
        <div className="title p-3 flex">
          <span>#{topic}</span>
        </div>
      </div>
      <div>
        {isLoaded &&
          data.map((item: any, index) => (
            <div className="virtual-list-item" key={item.post_id}>
              <SearchListItem
                index={index + 1}
                entry={{
                  ...item,
                  toggleNotNeeded: true
                }}
                {...item}
                children=""
                onMounted={() => {}}
                onEntryView={() =>
                  window.open(makePath(item.category, item.author, item.permlink), "_blank")
                }
              />
            </div>
          ))}
        {!isLoaded && (
          <div className="skeleton-list pt-0">
            {Array.from(Array(20).keys()).map((i) => (
              <div key={i}>
                <ListItemSkeleton />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

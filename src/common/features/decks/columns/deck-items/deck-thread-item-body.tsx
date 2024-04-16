import { createPortal } from "react-dom";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useMappedStore } from "../../../../store/use-mapped-store";
import { renderPostBody } from "@ecency/render-helper";
import { IdentifiableEntry } from "../deck-threads-manager";
import { classNameObject } from "../../../../helper/class-name-object";
import {
  renderAuthors,
  renderCurrencies,
  renderExternalLinks,
  renderImages,
  renderPostLinks,
  renderTags,
  renderTweets,
  renderVideos
} from "./deck-thread-item-body-render-helper";
import { renderLiketu } from "../helpers";

interface Props {
  entry: IdentifiableEntry;
  renderInitiated: boolean;
  setRenderInitiated: (v: boolean) => void;
  onResize: () => void;
  height: number | undefined;
}

export const DeckThreadItemBody = ({
  renderInitiated,
  setRenderInitiated,
  entry,
  onResize,
  height
}: Props) => {
  const { global } = useMappedStore();
  const renderAreaRef = useRef<HTMLDivElement | null>(null);

  const [currentViewingImage, setCurrentViewingImage] = useState<string | null>(null);
  const [currentViewingImageRect, setCurrentViewingImageRect] = useState<DOMRect | null>(null);
  const [isCurrentViewingImageShowed, setIsCurrentViewingImageShowed] = useState(false);

  useEffect(() => {
    if (currentViewingImage) {
      setTimeout(() => {
        setIsCurrentViewingImageShowed(true);
      }, 1);
    }
  }, [currentViewingImage]);

  useEffect(() => {
    onResize();
    if (!renderInitiated) {
      renderBody();
    }
  }, [height, entry]);

  const renderBody = async () => {
    setRenderInitiated(true);

    if (renderAreaRef.current) {
      renderAreaRef.current.innerHTML = await renderCurrencies(renderAreaRef?.current?.innerHTML);
    }

    if (entry.parent_author === "liketu.moments") {
      return;
    }

    renderTags(renderAreaRef);
    renderAuthors(renderAreaRef, global);
    renderPostLinks(renderAreaRef);
    renderExternalLinks(renderAreaRef);
    renderImages(renderAreaRef, {
      setCurrentViewingImageRect,
      setCurrentViewingImage
    });
    renderVideos(renderAreaRef);
    renderTweets(renderAreaRef);
  };

  const renderContentBody = useCallback(() => {
    if (entry.parent_author === "liketu.moments") {
      return renderLiketu(entry);
    }

    return renderPostBody(entry, true, global.canUseWebp);
  }, [entry, global.canUseWebp]);

  return (
    <div className="thread-item-body">
      <div
        ref={renderAreaRef}
        className="thread-render"
        dangerouslySetInnerHTML={{ __html: renderContentBody() }}
      />
      {currentViewingImage &&
        createPortal(
          <div
            className={classNameObject({
              "deck-full-image-view": true,
              show: isCurrentViewingImageShowed
            })}
            onClick={(e) => {
              e.stopPropagation();

              setIsCurrentViewingImageShowed(false);
              setTimeout(() => {
                setCurrentViewingImageRect(null);
                setCurrentViewingImage(null);
              }, 400);
            }}
          >
            <img
              src={currentViewingImage}
              alt=""
              style={{
                transform: `translate(${currentViewingImageRect?.left}px, ${currentViewingImageRect?.top}px)`,
                width: currentViewingImageRect?.width,
                height: currentViewingImageRect?.height
              }}
            />
          </div>,
          document.querySelector("#deck-media-view-container")!!
        )}
    </div>
  );
};

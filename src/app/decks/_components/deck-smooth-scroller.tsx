import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import useQueue from "react-use/lib/useQueue";
import { DeckGridContext } from "./deck-manager";

interface Props {
  children: JSX.Element;
}

export const DeckSmoothScroller = ({ children }: Props) => {
  const { setScrollHandler } = useContext(DeckGridContext);

  const [offset, setOffset] = useState(0);
  const [startTouchX, setStartTouchX] = useState<number | undefined>(undefined);

  const queue = useQueue<number | undefined>();
  let wheelTimeoutRef = useRef<any>();

  const getColumnWidth = () => {
    const anyDeckColumn = document.querySelector(".deck");
    if (anyDeckColumn) {
      return anyDeckColumn.clientWidth + 2; // 2 is border
    }
    return 0;
  };

  const scrollToSpecificColumn = useCallback((key: number) => {
    const deckList = document.querySelectorAll("[data-rbd-draggable-context-id]");
    const index = Array.from(deckList.values()).findIndex(
      (el) => Number(el.getAttribute("id") ?? -1) === key
    );
    if (index > -1) {
      const nextOffset = index * getColumnWidth();
      setOffset(-nextOffset);
    }
  }, []);

  useEffect(() => {
    setScrollHandler({ handle: scrollToSpecificColumn });
  }, [scrollToSpecificColumn, setScrollHandler]);

  useEffect(() => {
    if (typeof queue.first === "number") {
      const addColumnRect = document
        .querySelector(".add-new-column-button")
        ?.getBoundingClientRect();

      if (addColumnRect) {
        const addColumnOffset = addColumnRect.x + addColumnRect.width;
        const isAddColumnOutOfView = addColumnOffset > window.innerWidth;

        const isAbleToScrollLeft = queue.first > offset && queue.first <= 0;
        const isAbleToScrollRight = queue.first <= offset && isAddColumnOutOfView;

        if (isAbleToScrollLeft || isAbleToScrollRight) {
          setOffset(queue.first);
        }
      }
    }
    clearTimeout(wheelTimeoutRef.current);
    wheelTimeoutRef.current = setTimeout(() => queue.remove(), 400);
  }, [queue.first, offset, queue]);

  return (
    <div
      className="deck-smooth-scroller"
      style={{ transform: `translateX(${offset}px)` }}
      onWheel={({ deltaX }) => {
        if (queue.size > 0) {
          return;
        }
        queue.add(offset + getColumnWidth() * Math.sign(-deltaX));
      }}
      onTouchStart={({ touches }) => {
        setStartTouchX(touches.item(0).pageX);
      }}
      onTouchMove={({ touches }) => {
        if (typeof startTouchX === "number") {
          if (queue.size > 0) {
            return;
          }

          const deltaX = startTouchX - touches.item(0).pageX;
          queue.add(offset + getColumnWidth() * Math.sign(-deltaX));
        }
      }}
    >
      {children}
    </div>
  );
};

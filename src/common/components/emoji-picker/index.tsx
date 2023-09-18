import React, { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import useMountedState from "react-use/lib/useMountedState";
import "./_index.scss";
import { v4 } from "uuid";
import Picker from "@emoji-mart/react";
import { useMappedStore } from "../../store/use-mapped-store";
import useClickAway from "react-use/lib/useClickAway";

interface Props {
  anchor: Element | null;
  onSelect: (e: string) => void;
}

/**
 * Renders an emoji picker dialog.
 *
 * @param {Props} anchor - The anchor element to position the picker relative to.
 * @param {function} onSelect - The callback function to be called when an emoji is selected.
 * @return The rendered emoji picker dialog.
 */
export function EmojiPicker({ anchor, onSelect }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  const { global } = useMappedStore();

  const [show, setShow] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  // Due to ability to hold multiple dialogs we have to identify them
  const dialogId = useMemo(() => v4(), []);

  useClickAway(ref, () => {
    setShow(false);
  });

  const isMounted = useMountedState();

  useEffect(() => {
    if (anchor) {
      anchor.addEventListener("click", () => {
        const { x, y } = anchor.getBoundingClientRect();
        setPosition({ x: x + window.scrollX, y: y + window.scrollY });
        setShow(true);
      });
    }
  }, [anchor]);

  return isMounted() ? (
    createPortal(
      <div
        ref={ref}
        id={dialogId}
        key={dialogId}
        className="emoji-picker-dialog"
        style={{
          top: position.y + 40,
          left: position.x,
          display: show ? "flex" : "none"
        }}
      >
        <Picker
          dynamicWidth={true}
          onEmojiSelect={(e: { native: string }) => onSelect(e.native)}
          previewPosition="none"
          set="apple"
          theme={global.theme === "day" ? "light" : "dark"}
        />
      </div>,
      document.querySelector("#root")!!
    )
  ) : (
    <></>
  );
}

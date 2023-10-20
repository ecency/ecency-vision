import React, { useEffect, useMemo, useRef, useState } from "react";
import useMountedState from "react-use/lib/useMountedState";
import "./_index.scss";
import { v4 } from "uuid";
import Picker from "@emoji-mart/react";
import { useMappedStore } from "../../store/use-mapped-store";
import useClickAway from "react-use/lib/useClickAway";
import { classNameObject } from "../../helper/class-name-object";

interface Props {
  anchor: Element | null;
  onSelect: (e: string) => void;
  position?: "top" | "bottom";
}

/**
 * Renders an emoji picker dialog.
 *
 * @param {Props} anchor - The anchor element to position the picker relative to.
 * @param {function} onSelect - The callback function to be called when an emoji is selected.
 * @param position
 * @return The rendered emoji picker dialog.
 */
export function EmojiPicker({ anchor, onSelect, position }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);

  const { global } = useMappedStore();

  const [show, setShow] = useState(false);

  // Due to ability to hold multiple dialogs we have to identify them
  const dialogId = useMemo(() => v4(), []);

  useClickAway(ref, () => {
    setShow(false);
  });

  const isMounted = useMountedState();

  useEffect(() => {
    if (anchor) {
      anchor.addEventListener("click", () => {
        (anchor as HTMLElement).style.position = "relative !important";
        setShow(true);
      });
    }
  }, [anchor]);

  return isMounted() ? (
    <div
      ref={ref}
      id={dialogId}
      key={dialogId}
      className={classNameObject({
        "emoji-picker-dialog": true,
        "top-[100%]": (position ?? "bottom") === "bottom",
        "bottom-[100%] right-0": position === "top"
      })}
      style={{
        display: show ? "block" : "none"
      }}
    >
      <Picker
        dynamicWidth={true}
        onEmojiSelect={(e: { native: string }) => onSelect(e.native)}
        previewPosition="none"
        set="apple"
        theme={global.theme === "day" ? "light" : "dark"}
      />
    </div>
  ) : (
    <></>
  );
}

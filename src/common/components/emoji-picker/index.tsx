import React, { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { QueryIdentifiers } from "../../core";
import { Picker } from "emoji-mart";
import { createPortal } from "react-dom";
import useClickAway from "react-use/lib/useClickAway";
import useMountedState from "react-use/lib/useMountedState";
import "./_index.scss";
import { useMappedStore } from "../../store/use-mapped-store";

export const DEFAULT_EMOJI_DATA = {
  categories: [],
  emojis: {},
  aliases: {},
  sheet: {
    cols: 0,
    rows: 0
  }
};

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
  const [pickerInstance, setPickerInstance] = useState<Picker>();

  useClickAway(ref, () => {
    setShow(false);
  });

  const { data } = useQuery(
    [QueryIdentifiers.EMOJI_PICKER],
    async () => {
      try {
        const data = await import(/* webpackChunkName: "emojis" */ "@emoji-mart/data");
        return data.default as typeof DEFAULT_EMOJI_DATA;
      } catch (e) {
        console.error("Failed to load emoji data");
      }

      return DEFAULT_EMOJI_DATA;
    },
    {
      initialData: DEFAULT_EMOJI_DATA
    }
  );

  const isMounted = useMountedState();

  useEffect(() => {
    if (data.categories.length > 0) {
      setPickerInstance(
        new Picker({
          dynamicWidth: true,
          onEmojiSelect: (e: { native: string }) => onSelect(e.native),
          previewPosition: "none",
          ref,
          set: "apple",
          theme: global.theme === "day" ? "light" : "dark"
        })
      );
    }
  }, [data, global.theme]);

  useEffect(() => {
    if (anchor) {
      anchor.addEventListener("click", () => {
        const { x, y } = anchor.getBoundingClientRect();
        setPosition({ x: x + window.scrollX, y: y + window.scrollY });
        setShow(true);
      });
    }
  }, [anchor]);

  return createPortal(
    <div
      className="emoji-picker-dialog"
      ref={ref}
      style={{
        top: position.y + 40,
        left: position.x,
        display: show ? "flex" : "none"
      }}
    />,
    document.querySelector("#root")!!
  );
}

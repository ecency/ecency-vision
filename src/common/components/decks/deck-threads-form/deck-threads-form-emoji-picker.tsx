import React, { useRef } from "react";
import { emojiIconSvg } from "../icons";
import { _t } from "../../../i18n";
import Tooltip from "../../tooltip";
import { EmojiPicker } from "../../emoji-picker";

interface Props {
  onPick: (v: string) => void;
}

export const DeckThreadsFormEmojiPicker = ({ onPick }: Props) => {
  const anchorRef = useRef<HTMLDivElement | null>(null);

  return (
    <div
      className="btn btn-link d-flex align-items-center justify-content-center deck-threads-form-emoji-picker"
      ref={anchorRef}
    >
      <Tooltip content={_t("editor-toolbar.image")}>{emojiIconSvg}</Tooltip>
      <EmojiPicker anchor={anchorRef.current} onSelect={(value) => onPick(value)} />
    </div>
  );
};

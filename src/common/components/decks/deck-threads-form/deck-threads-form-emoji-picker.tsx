import React, { useRef } from "react";
import { emojiIconSvg } from "../icons";
import { _t } from "../../../i18n";
import Tooltip from "../../tooltip";
import { EmojiPicker } from "../../emoji-picker";
import { Button } from "@ui/button";

interface Props {
  onPick: (v: string) => void;
}

export const DeckThreadsFormEmojiPicker = ({ onPick }: Props) => {
  const anchorRef = useRef<HTMLButtonElement | null>(null);

  return (
    <Button
      appearance="link"
      className="deck-threads-form-emoji-picker"
      ref={anchorRef}
      icon={<Tooltip content={_t("editor-toolbar.image")}>{emojiIconSvg}</Tooltip>}
    >
      <EmojiPicker anchor={anchorRef.current} onSelect={(value) => onPick(value)} />
    </Button>
  );
};

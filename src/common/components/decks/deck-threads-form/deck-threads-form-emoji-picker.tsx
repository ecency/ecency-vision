import React from "react";
import { emojiIconSvg } from "../icons";
import { _t } from "../../../i18n";
import { PopperDropdown } from "../../popper-dropdown";
import Tooltip from "../../tooltip";
import { EmojiPicker } from "../../emoji-picker";

interface Props {
  onPick: (v: string) => void;
}

export const DeckThreadsFormEmojiPicker = ({ onPick }: Props) => {
  return (
    <div className="deck-threads-form-emoji-picker">
      <Tooltip content={_t("editor-toolbar.image")}>
        <PopperDropdown toggle={emojiIconSvg}>
          <div className="emoji-picker-container">
            <EmojiPicker onSelect={(value) => onPick(value)} />
          </div>
        </PopperDropdown>
      </Tooltip>
    </div>
  );
};

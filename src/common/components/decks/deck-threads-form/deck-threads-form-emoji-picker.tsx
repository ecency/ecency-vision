import React, { useRef } from "react";
import { EmojiPicker } from "../../emoji-picker";
import { Button } from "@ui/button";
import { UilEmoji } from "@iconscout/react-unicons";

interface Props {
  onPick: (v: string) => void;
}

export const DeckThreadsFormEmojiPicker = ({ onPick }: Props) => {
  const anchorRef = useRef<HTMLButtonElement | null>(null);

  return (
    <Button
      appearance="gray-link"
      className="deck-threads-form-emoji-picker"
      ref={anchorRef}
      icon={<UilEmoji />}
    >
      <EmojiPicker anchor={anchorRef.current} onSelect={(value) => onPick(value)} />
    </Button>
  );
};

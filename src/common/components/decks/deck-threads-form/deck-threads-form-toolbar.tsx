import React from "react";
import { DeckThreadsFormToolbarImagePicker } from "./deck-threads-form-toolbar-image-picker";
import { DeckThreadsFormEmojiPicker } from "./deck-threads-form-emoji-picker";

interface Props {
  onAddImage: (url: string, name: string) => void;
  onEmojiPick: (value: string) => void;
}

export const DeckThreadsFormToolbar = ({ onAddImage, onEmojiPick }: Props) => {
  return (
    <div className="deck-threads-form-toolbar">
      <DeckThreadsFormToolbarImagePicker onAddImage={onAddImage} />
      <DeckThreadsFormEmojiPicker onPick={onEmojiPick} />
    </div>
  );
};

import React from "react";
import { DeckThreadsFormToolbarImagePicker } from "./deck-threads-form-toolbar-image-picker";
import { DeckThreadsFormEmojiPicker } from "./deck-threads-form-emoji-picker";
import { DeckThreadsFormToolbarVideoPicker } from "./deck-threads-form-toolbar-video-picker";

interface Props {
  onAddImage: (url: string, name: string) => void;
  onEmojiPick: (value: string) => void;
  onAddVideo: (value: string) => void;
}

export const DeckThreadsFormToolbar = ({ onAddImage, onEmojiPick, onAddVideo }: Props) => {
  return (
    <div className="deck-threads-form-toolbar">
      <DeckThreadsFormToolbarImagePicker onAddImage={onAddImage} />
      <DeckThreadsFormEmojiPicker onPick={onEmojiPick} />
      <DeckThreadsFormToolbarVideoPicker onSelect={onAddVideo} />
    </div>
  );
};

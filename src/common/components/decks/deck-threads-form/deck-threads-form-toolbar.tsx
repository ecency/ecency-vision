import React from "react";
import { DeckThreadsFormToolbarImagePicker } from "./deck-threads-form-toolbar-image-picker";

interface Props {
  onAddImage: (url: string, name: string) => void;
}

export const DeckThreadsFormToolbar = ({ onAddImage }: Props) => {
  return (
    <div className="deck-threads-form-toolbar">
      <DeckThreadsFormToolbarImagePicker onAddImage={onAddImage} />
    </div>
  );
};

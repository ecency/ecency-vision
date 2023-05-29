import { _t } from "../../../i18n";
import React from "react";
import TextareaAutosize from "react-textarea-autosize";
import { DeckThreadsFormToolbar } from "./deck-threads-form-toolbar";
import { closeSvg } from "../../../img/svg";

interface Props {
  text: string;
  setText: (v: string) => void;
  selectedImage: string | null;
  setSelectedImage: (url: string | null) => void;
  onAddImage: (url: string, name: string) => void;
  placeholder?: string;
}

export const DeckThreadsFormControl = ({
  text,
  setText,
  onAddImage,
  selectedImage,
  setSelectedImage,
  placeholder
}: Props) => {
  return (
    <>
      <div className="comment-body">
        <div className="editor">
          <TextareaAutosize
            className="editor-control"
            placeholder={placeholder ?? _t("decks.threads-form.input-placeholder")}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        {selectedImage && (
          <div className="deck-threads-form-selected-image">
            <img src={selectedImage} alt="" />
            <div className="remove" onClick={() => setSelectedImage(null)}>
              {closeSvg}
            </div>
          </div>
        )}
        <DeckThreadsFormToolbar onAddImage={onAddImage} />
      </div>
    </>
  );
};

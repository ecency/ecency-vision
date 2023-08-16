import { _t } from "../../../i18n";
import React from "react";
import TextareaAutosize from "react-textarea-autosize";
import { DeckThreadsFormToolbar } from "./deck-threads-form-toolbar";
import { closeSvg } from "../../../img/svg";

interface Props {
  text: string;
  setText: (v: string) => void;
  video: string | null;
  selectedImage: string | null;
  setSelectedImage: (url: string | null) => void;
  onAddImage: (url: string, name: string) => void;
  onAddVideo: (value: string | null) => void;
  placeholder?: string;
  onTextareaFocus: () => void;
}

export const DeckThreadsFormControl = ({
  text,
  setText,
  onAddImage,
  selectedImage,
  setSelectedImage,
  placeholder,
  onTextareaFocus,
  onAddVideo,
  video
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
            onFocus={onTextareaFocus}
          />
          <div className="length-prompt">{text.length}/255</div>
        </div>
        {selectedImage && (
          <div className="deck-threads-form-selected-image border mb-3">
            <div className="type">image</div>
            <img src={selectedImage} alt="" />
            <div className="remove" onClick={() => setSelectedImage(null)}>
              {closeSvg}
            </div>
          </div>
        )}
        {video && (
          <div className="deck-threads-form-selected-image border mb-3">
            <div className="type">video</div>
            <img
              src={video
                .matchAll(/<center>\[!\[](.*)].*<\/center>/g)
                .next()
                .value[1].replace("(", "")
                .replace(")", "")}
              alt=""
            />
            <div className="remove" onClick={() => onAddVideo(null)}>
              {closeSvg}
            </div>
          </div>
        )}
        <DeckThreadsFormToolbar
          onAddImage={onAddImage}
          onEmojiPick={(v) => setText(`${text}${v}`)}
          onAddVideo={onAddVideo}
        />
      </div>
    </>
  );
};

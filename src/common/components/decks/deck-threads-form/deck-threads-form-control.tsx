import { _t } from "../../../i18n";
import React from "react";
import TextareaAutosize from "react-textarea-autosize";
import { DeckThreadsFormToolbar } from "./deck-threads-form-toolbar";

interface Props {
  text: string;
  setText: (v: string) => void;
}

export const DeckThreadsFormControl = ({ text, setText }: Props) => {
  return (
    <>
      <div className="comment-body">
        <div className="editor">
          <TextareaAutosize
            className="editor-control"
            placeholder={_t("decks.threads-form.input-placeholder")}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <DeckThreadsFormToolbar />
      </div>
    </>
  );
};

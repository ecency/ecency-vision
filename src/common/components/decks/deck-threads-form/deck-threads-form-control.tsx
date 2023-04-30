import { _t } from "../../../i18n";
import React, { useState } from "react";
import { useMappedStore } from "../../../store/use-mapped-store";
import TextareaAutosize from "react-textarea-autosize";
import { DeckThreadsFormToolbar } from "./deck-threads-form-toolbar";

interface Props {}

export const DeckThreadsFormControl = ({}: Props) => {
  const { global, users, activeUser } = useMappedStore();

  const [text, setText] = useState("");

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

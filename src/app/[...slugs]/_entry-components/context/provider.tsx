"use client";

import { PropsWithChildren, useRef, useState } from "react";
import { EntryPageContext } from "./instance";

export function EntryPageContextProvider(props: PropsWithChildren) {
  const commentsInputRef = useRef<HTMLInputElement>(null);

  const [showProfileBox, setShowProfileBox] = useState(false);
  const [editHistory, setEditHistory] = useState(false);
  const [showWordCount, setShowWordCount] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showIfNsfw, setShowIfNsfw] = useState(false);
  const [isRawContent, setIsRawContent] = useState(false);
  const [selection, setSelection] = useState("");

  return (
    <EntryPageContext.ClientContextProvider
      value={{
        showWordCount,
        setShowWordCount,
        showProfileBox,
        setShowProfileBox,
        editHistory,
        setEditHistory,
        loading,
        setLoading,
        showIfNsfw,
        setShowIfNsfw,
        isRawContent,
        setIsRawContent,
        setSelection,
        selection,
        commentsInputRef
      }}
    >
      {props.children}
    </EntryPageContext.ClientContextProvider>
  );
}

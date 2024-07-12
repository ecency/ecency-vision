"use client";

import React, { useState } from "react";
import { Manager, Popper } from "react-popper";

import SelectionReference from "./selection-reference";
import "./index.scss";
import { ClickAwayListener, success } from "@/features/shared";
import i18next from "i18next";
import { copyContent, quotes, twitterSvg } from "@ui/svg";
import { EcencyClientServerBridge } from "@/core/client-server-bridge";
import { EntryPageContext } from "@/app/[...slugs]/_entry-components";

let tooltipStyle = {
  background: "rgb(0 0 0 / 78%)",
  maxWidth: "50%",
  borderRadius: 6
};

export const SelectionPopover = ({ children, postUrl }: any) => {
  const { setSelection, commentsInputRef } =
    EcencyClientServerBridge.useSafeContext(EntryPageContext);

  let [selectedText, setSelectedText] = useState("");

  const copyToClipboard = (text: string) => {
    const textField = document.createElement("textarea");
    textField.innerText = text;
    document.body.appendChild(textField);
    textField.select();
    document.execCommand("copy");
    textField.remove();
    success(i18next.t("entry.content-copied"));
    setSelectedText("");
  };

  const onQuotesClick = (text: string) => {
    setSelection(`>${text}\n\n`);
    commentsInputRef?.current?.focus();
  };

  return (
    <div>
      <Manager>
        <SelectionReference onSelect={(selection: any) => setSelectedText(selection.toString())}>
          {(
            getProps: (arg0: {
              onMouseUp: () => void;
            }) => JSX.IntrinsicAttributes &
              React.ClassAttributes<HTMLParagraphElement> &
              React.HTMLAttributes<HTMLParagraphElement>
          ) => (
            <div
              {...getProps({
                onMouseUp: () => {}
              })}
            >
              {children}
            </div>
          )}
        </SelectionReference>

        <Popper placement="top">
          {({ ref, style, placement, arrowProps }) => {
            return (
              selectedText.length !== 0 && (
                <ClickAwayListener
                  onClickAway={() => {
                    setSelectedText("");
                  }}
                >
                  <div
                    ref={ref}
                    style={{ ...style, ...tooltipStyle }}
                    className="p-2 flex icons-container items-center"
                  >
                    <div onClick={() => copyToClipboard(selectedText)} className="pointer">
                      {copyContent}
                    </div>
                    <a
                      onClick={() => setSelectedText("")}
                      href={`https://twitter.com/intent/tweet?text=${selectedText} https://ecency.com${postUrl}`}
                      target="_blank"
                      className="mx-2 pointer twitter"
                    >
                      {twitterSvg}
                    </a>
                    <div
                      onClick={() => {
                        setSelectedText("");
                        onQuotesClick(selectedText);
                        document
                          .getElementsByClassName("comment-box")[0]
                          .scrollIntoView({ block: "center" });
                      }}
                      className="pointer quotes"
                    >
                      {quotes}
                    </div>
                  </div>
                </ClickAwayListener>
              )
            );
          }}
        </Popper>
      </Manager>
    </div>
  );
};

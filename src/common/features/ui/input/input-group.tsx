import React, { HTMLAttributes, PropsWithChildren, ReactElement, ReactNode } from "react";
import { classNameObject } from "../../../helper/class-name-object";
import { INPUT_IN_GROUP } from "./form-controls/input-styles";
import { Spinner } from "../spinner";
import { BUTTON_IN_GROUP } from "@ui/button/styles";
import { Button } from "@ui/button";

interface Props {
  append?: ReactNode;
  onAppendClick?: () => void;
  prepend?: ReactNode;
  onPrependClick?: () => void;
  className?: string;
  transparentPrepend?: boolean;
  transparentAppend?: boolean;
}

// TODO: Make styles for childrens: buttons

export function InputGroup({
  children,
  prepend,
  append,
  className,
  onPrependClick,
  onAppendClick,
  onClick,
  transparentPrepend,
  transparentAppend
}: PropsWithChildren<Props> & HTMLAttributes<HTMLElement>) {
  return (
    <div
      className={classNameObject({
        "ecency-input-group flex items-stretch w-full": true,
        [className ?? ""]: !!className,
        [INPUT_IN_GROUP]: true,
        [BUTTON_IN_GROUP]: true
      })}
      onClick={onClick}
    >
      {prepend ? (
        <div
          className={classNameObject({
            "ecency-input-group-part ecency-input-group-prepend flex items-center justify-center border-r-0 rounded-tl-full rounded-bl-full dark:border-gray-600":
              true,
            "px-2.5": typeof prepend === "string" || (prepend as ReactElement)?.type === Spinner,
            "[&>.ecency-spinner]:w-3.5 [&>.ecency-spinner]:h-3.5":
              (prepend as ReactElement)?.type === Spinner,
            "[&>svg]:w-4 [&>svg]:h-4 px-2": true,
            "border-2": (prepend as ReactElement)?.type !== Button,
            "bg-gray-200 dark:bg-gray-600": !transparentPrepend ?? true
          })}
          onClick={() => onPrependClick?.()}
        >
          {prepend}
        </div>
      ) : (
        <></>
      )}
      {children}
      {append ? (
        <div
          className={classNameObject({
            "ecency-input-group-part ecency-input-group-append border-l-0 rounded-tr-full rounded-br-full dark:border-gray-600":
              true,
            "flex items-center justify-center px-2.5":
              typeof append === "string" || (prepend as ReactElement)?.type === Spinner,
            "[&>.ecency-spinner]:w-3.5 [&>.ecency-spinner]:h-3.5":
              (prepend as ReactElement)?.type === Spinner,
            "border-2": (append as ReactElement)?.type !== Button,
            "bg-gray-200 dark:bg-gray-600": !transparentAppend ?? true
          })}
          onClick={() => onAppendClick?.()}
        >
          {append}
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}

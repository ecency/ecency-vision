import React, { HTMLAttributes, PropsWithChildren, ReactElement, ReactNode } from "react";
import { INPUT_IN_GROUP } from "./form-controls/input-styles";
import { Spinner } from "../spinner";
import { Button } from "@ui/button";
import { classNameObject } from "@/features/ui/util";
import { BUTTON_IN_GROUP } from "@/features/ui/button/styles";

interface Props {
  append?: ReactNode;
  onAppendClick?: () => void;
  prepend?: ReactNode;
  onPrependClick?: () => void;
  className?: string;
}

// TODO: Make styles for childrens: buttons

export function InputGroup({
  children,
  prepend,
  append,
  className,
  onPrependClick,
  onAppendClick,
  onClick
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
            "ecency-input-group-part ecency-input-group-prepend flex items-center justify-center border-r-0 rounded-tl-full rounded-bl-full bg-gray-200 dark:bg-gray-600 dark:border-gray-600":
              true,
            "px-2.5": typeof prepend === "string" || (prepend as ReactElement)?.type === Spinner,
            "[&>.ecency-spinner]:w-3.5 [&>.ecency-spinner]:h-3.5":
              (prepend as ReactElement)?.type === Spinner,
            "[&>svg]:w-4 [&>svg]:h-4 px-2": true,
            "border-2": (prepend as ReactElement)?.type !== Button
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
            "ecency-input-group-part ecency-input-group-append border-l-0 rounded-tr-full rounded-br-full bg-gray-200 dark:bg-gray-600 dark:border-gray-600":
              true,
            "flex items-center justify-center px-2.5":
              typeof append === "string" || (prepend as ReactElement)?.type === Spinner,
            "[&>.ecency-spinner]:w-3.5 [&>.ecency-spinner]:h-3.5":
              (prepend as ReactElement)?.type === Spinner,
            "border-2": (append as ReactElement)?.type !== Button
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

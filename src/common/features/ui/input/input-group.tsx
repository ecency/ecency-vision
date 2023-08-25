import React, { HTMLAttributes, PropsWithChildren, ReactElement, ReactNode } from "react";
import { classNameObject } from "../../../helper/class-name-object";
import { INPUT_IN_GROUP } from "./form-controls/input-styles";
import { Spinner } from "../spinner";

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
  console.log(prepend);

  return (
    <div
      className={classNameObject({
        "ecency-input-group flex items-stretch w-full": true,
        [className ?? ""]: !!className,
        [INPUT_IN_GROUP]: true
      })}
      onClick={onClick}
    >
      {prepend ? (
        <div
          className={classNameObject({
            "ecency-input-group-prepend flex items-center justify-center border-2 border-r-0 rounded-tl-full rounded-bl-full bg-gray-200":
              true,
            "px-2.5": typeof prepend === "string" || (prepend as ReactElement)?.type === Spinner,
            "[&>.ecency-spinner]:w-3.5 [&>.ecency-spinner]:h-3.5":
              (prepend as ReactElement)?.type === Spinner
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
            "border-2 border-l-0 rounded-tr-full rounded-br-full bg-gray-200": true,
            "flex items-center justify-center px-2.5":
              typeof append === "string" || (prepend as ReactElement)?.type === Spinner,
            "[&>.ecency-spinner]:w-3.5 [&>.ecency-spinner]:h-3.5":
              (prepend as ReactElement)?.type === Spinner
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

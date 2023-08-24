import React, { HTMLAttributes, PropsWithChildren, ReactNode } from "react";
import { classNameObject } from "../../../helper/class-name-object";

interface Props {
  append?: ReactNode;
  onAppendClick?: () => void;
  prepend?: ReactNode;
  onPrependClick?: () => void;
  className?: string;
}

// TODO: Make styles for childrens: buttons, inputs

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
    <div className={"flex items-stretch w-full " + className} onClick={onClick}>
      {prepend ? (
        <div
          className={classNameObject({
            "border-2 border-r-0 rounded-tl-full rounded-bl-full": true,
            "flex items-center justify-center px-2": typeof prepend === "string"
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
            "border-2 border-l-0 rounded-tr-full rounded-br-full": true,
            "flex items-center justify-center px-2": typeof append === "string"
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

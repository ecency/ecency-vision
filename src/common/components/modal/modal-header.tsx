import React, { HTMLProps, useContext } from "react";
import { classNameObject } from "../../helper/class-name-object";
import { closeSvg } from "../../img/svg";
import { ModalContext } from "./index";

interface Props {
  closeButton: boolean;
}

export function ModalHeader(props: HTMLProps<HTMLDivElement> & Props) {
  const context = useContext(ModalContext);

  return (
    <div
      {...props}
      className={classNameObject({
        "p-3 flex items-center justify-between": true,
        [props.className ?? ""]: true
      })}
    >
      {props.children}
      {props.closeButton && (
        <button
          className="w-5 h-5 opacity-50 hover:opacity-100"
          onClick={() => context.setShow(false)}
        >
          {closeSvg}
        </button>
      )}
    </div>
  );
}

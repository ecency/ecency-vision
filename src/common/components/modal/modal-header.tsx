import React, { HTMLProps, useContext } from "react";
import { classNameObject } from "../../helper/class-name-object";
import { closeSvg } from "../../img/svg";
import { ModalContext } from "./index";

interface Props {
  closeButton: boolean;
  thin?: boolean;
}

export function ModalHeader(props: HTMLProps<HTMLDivElement> & Props) {
  const context = useContext(ModalContext);

  return (
    <div
      {...props}
      className={classNameObject({
        "flex relative items-center": true,
        "justify-between": !!props.children,
        "justify-end": !props.children,
        [props.className ?? ""]: true,
        "p-0": props.thin,
        "p-3": !props.thin
      })}
    >
      {props.children}
      {props.closeButton && (
        <button
          className="w-5 h-5 opacity-50 absolute top-5 right-3 hover:opacity-100"
          onClick={() => context.setShow(false)}
        >
          {closeSvg}
        </button>
      )}
    </div>
  );
}

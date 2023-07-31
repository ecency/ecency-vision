import { createPortal } from "react-dom";
import React, { createContext, HTMLProps, useEffect, useState } from "react";
import { classNameObject } from "../../helper/class-name-object";

interface Props {
  show: boolean;
  onHide: () => void;
  centered: boolean;
  animation: boolean;
}

export const ModalContext = createContext<{
  show: boolean | undefined;
  setShow: (v: boolean) => void;
}>({
  show: false,
  setShow: () => {}
});

export function Modal(props: HTMLProps<HTMLDivElement> & Props) {
  const [show, setShow] = useState<boolean>();

  useEffect(() => {
    if (props.show) {
      setShow(props.show);
    }
  }, [props.show]);

  useEffect(() => {
    if (typeof show === "boolean") {
      if (!show) {
        props.onHide();
      }
    }
  }, [show]);

  return (
    <ModalContext.Provider value={{ show, setShow }}>
      {show &&
        createPortal(
          <div className="bg-black opacity-[50%] z-[1040] fixed top-0 left-0 right-0 bottom-0" />,
          document.querySelector("#modal-overlay-container")!!
        )}
      {show &&
        createPortal(
          <div
            {...props}
            className={classNameObject({
              "z-[1050] fixed top-0 left-0 right-0 bottom-0": true,
              [props.className ?? ""]: true,
              "flex items-center justify-center": props.centered
            })}
          >
            <div className="bg-white rounded-xl max-w-[500px] w-full">{props.children}</div>
          </div>,
          document.querySelector("#modal-dialog-container")!!
        )}
    </ModalContext.Provider>
  );
}

export * from "./modal-title";
export * from "./modal-body";
export * from "./modal-header";

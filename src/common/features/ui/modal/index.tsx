import { createPortal } from "react-dom";
import React, { createContext, HTMLProps, useEffect, useState } from "react";
import { classNameObject } from "../../../helper/class-name-object";

interface Props {
  show: boolean;
  onHide: () => void;
  centered?: boolean;
  animation?: boolean;
  size?: "md" | "lg";
  dialogClassName?: string;
}

export const ModalContext = createContext<{
  show: boolean | undefined;
  setShow: (v: boolean) => void;
}>({
  show: false,
  setShow: () => {}
});

export function Modal(props: Omit<HTMLProps<HTMLDivElement>, "size"> & Props) {
  const [show, setShow] = useState<boolean>();

  useEffect(() => {
    setShow(props.show);
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
              "z-[1050] fixed top-0 py-8 left-0 right-0 bottom-0 overflow-y-auto h-full": true,
              [props.className ?? ""]: true,
              "flex justify-center items-center": props.centered
            })}
            onClick={() => setShow(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className={classNameObject({
                "bg-white rounded-xl w-[calc(100%-2rem)] ecency-modal-content overflow-x-hidden overflow-y-auto max-h-[calc(100vh-3rem)] my-[3rem] mx-3":
                  true,
                "max-w-[500px]": !props.size || props.size === "md",
                "max-w-[800px]": props.size === "lg",
                [props.dialogClassName ?? ""]: true
              })}
            >
              {props.children}
            </div>
          </div>,
          document.querySelector("#modal-dialog-container")!!
        )}
    </ModalContext.Provider>
  );
}

export * from "./modal-title";
export * from "./modal-body";
export * from "./modal-header";
export * from "./modal-footer";

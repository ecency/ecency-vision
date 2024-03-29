import { createPortal } from "react-dom";
import React, { createContext, HTMLProps, useEffect, useState } from "react";
import { classNameObject } from "../../../helper/class-name-object";
import { useFilteredProps } from "../../../util/props-filter";
import useMount from "react-use/lib/useMount";
import useUnmount from "react-use/lib/useUnmount";

interface Props {
  show: boolean;
  onHide: () => void;
  centered?: boolean;
  animation?: boolean;
  size?: "md" | "lg";
  dialogClassName?: string;
  overlayClassName?: string;
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

  const nativeProps = useFilteredProps(props, [
    "size",
    "animation",
    "show",
    "onHide",
    "centered",
    "dialogClassName"
  ]);

  useMount(() => document.addEventListener("keyup", onKeyUp));
  useUnmount(() => document.removeEventListener("keyup", onKeyUp));

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

  const onKeyUp = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setShow(false);
    }
  };

  return (
    <ModalContext.Provider value={{ show, setShow }}>
      {show &&
        createPortal(
          <div
            className={classNameObject({
              "bg-black opacity-[50%] z-[1040] fixed top-0 left-0 right-0 bottom-0": true,
              [props.overlayClassName ?? ""]: !!props.overlayClassName
            })}
          />,
          document.querySelector("#modal-overlay-container")!!
        )}
      {show &&
        createPortal(
          <div
            {...nativeProps}
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

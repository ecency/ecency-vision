"use client";

import { createPortal } from "react-dom";
import React, { createContext, HTMLProps, useEffect, useMemo, useState } from "react";
import { classNameObject, useFilteredProps } from "@ui/util";
import { AnimatePresence, motion } from "framer-motion";
import { useLockBodyScroll, useMount, useUnmount } from "react-use";

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
  const isAnimated = useMemo(() => props.animation ?? true, [props.animation]);

  useLockBodyScroll(show);

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
          <AnimatePresence>
            <motion.div
              key="overlay"
              initial={{
                opacity: 0
              }}
              animate={{
                opacity: 0.5
              }}
              exit={{
                opacity: 0
              }}
              className={classNameObject({
                "bg-black z-[1040] fixed top-0 left-0 right-0 bottom-0": true,
                [props.overlayClassName ?? ""]: !!props.overlayClassName
              })}
            />
          </AnimatePresence>,
          document.querySelector("#modal-dialog-container")!!
        )}

      {show &&
        createPortal(
          <div
            {...nativeProps}
            className={classNameObject({
              "z-[1040] fixed top-0 py-8 left-0 right-0 bottom-0 overflow-y-auto h-full": true,
              [props.className ?? ""]: true,
              "flex justify-center items-center": props.centered
            })}
            onClick={() => setShow(false)}
          >
            <motion.div
              initial={
                isAnimated && {
                  opacity: 0,
                  scale: 0.95,
                  y: 8
                }
              }
              animate={
                isAnimated && {
                  opacity: 1,
                  scale: 1,
                  y: 0
                }
              }
              exit={
                isAnimated
                  ? {
                      opacity: 0,
                      scale: 0.95,
                      y: 8
                    }
                  : {}
              }
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
            </motion.div>
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

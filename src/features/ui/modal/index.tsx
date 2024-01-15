import { createPortal } from "react-dom";
import React, { createContext, HTMLProps, useEffect, useMemo, useState } from "react";
import useMount from "react-use/lib/useMount";
import useUnmount from "react-use/lib/useUnmount";
import { classNameObject, useFilteredProps } from "@/features/ui/util";
import { animated, Transition, TransitionFrom, TransitionTo } from "@react-spring/web";

interface Props {
  show: boolean;
  onHide: () => void;
  centered?: boolean;
  animation?: boolean;
  size?: "md" | "lg";
  dialogClassName?: string;
  transitionFrom?: TransitionFrom<any>;
  transitionEnter?: TransitionTo<any>;
  transitionLeave?: TransitionTo<any>;
}

export const ModalContext = createContext<{
  show: boolean | undefined;
  setShow: (v: boolean) => void;
}>({
  show: false,
  setShow: () => {}
});

export function Modal(props: Omit<HTMLProps<HTMLDivElement>, "size"> & Props) {
  const [show, setShow] = useState<boolean>(false);

  const transitionsTriggers = useMemo(() => (show ? [show] : []), [show]);
  const nativeProps = useFilteredProps(props, [
    "size",
    "animation",
    "show",
    "onHide",
    "centered",
    "dialogClassName",
    "transitionFrom",
    "transitionEnter",
    "transitionLeave"
  ]);

  useMount(() => document.addEventListener("keyup", onKeyUp));
  useUnmount(() => document.removeEventListener("keyup", onKeyUp));

  useEffect(() => {
    setShow(props.show);
  }, [props.show]);

  useEffect(() => {
    if (!show) {
      props.onHide();
    }
  }, [show]);

  const onKeyUp = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setShow(false);
    }
  };

  return (
    <ModalContext.Provider value={{ show, setShow }}>
      {createPortal(
        <Transition
          items={transitionsTriggers}
          keys={Array.from(transitionsTriggers.keys())}
          from={{ opacity: 0 }}
          enter={{ opacity: 0.5 }}
          leave={{ opacity: 0 }}
        >
          {(values, item, t, index) => (
            <animated.div
              key={index}
              style={values}
              className="bg-black z-[1040] fixed top-0 left-0 right-0 bottom-0"
            />
          )}
        </Transition>,
        document.querySelector("#modal-overlay-container")!!
      )}
      {createPortal(
        <Transition
          items={transitionsTriggers}
          keys={Array.from(transitionsTriggers.keys())}
          from={
            props.transitionFrom ?? {
              opacity: 0,
              scale: 0.95
            }
          }
          leave={
            props.transitionLeave ?? {
              opacity: 0,
              scale: 0.95
            }
          }
          enter={
            props.transitionEnter ?? {
              opacity: 1,
              scale: 1
            }
          }
        >
          {(values, item, _, index) => (
            <animated.div
              {...nativeProps}
              style={values}
              key={index}
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
            </animated.div>
          )}
        </Transition>,
        document.querySelector("#modal-dialog-container")!!
      )}
    </ModalContext.Provider>
  );
}

export * from "./modal-title";
export * from "./modal-body";
export * from "./modal-header";
export * from "./modal-footer";

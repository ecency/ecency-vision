import React, { ReactNode, useState } from "react";
import { createPortal } from "react-dom";
import { usePopper } from "react-popper";

interface Props {
  content: string | JSX.Element;
  children: JSX.Element;
}

// TODO: create styled tooltip
export default function ({ content, children }: Props) {
  return React.cloneElement(children, { title: content });
}

interface StyledProps {
  children: ReactNode;
  content: ReactNode;
}

export function StyledTooltip({ children, content }: StyledProps) {
  const [ref, setRef] = useState<any>();
  const [popperElement, setPopperElement] = useState<any>();
  const [show, setShow] = useState(false);

  const popper = usePopper(ref, popperElement);

  return (
    <div
      ref={setRef}
      className="styled-tooltip"
      onMouseEnter={() => {
        setShow(true);
        popper.update?.();
      }}
      onMouseLeave={() => {
        setShow(false);
        popper.update?.();
      }}
      onClick={() => {
        setShow(!show);
        popper.update?.();
      }}
    >
      {children}
      {createPortal(
        <div
          className={
            "bg-blue-powder dark:bg-dark-200 z-10 p-3 rounded-lg duration-300 " +
            (show ? "opacity-100" : "opacity-0")
          }
          ref={setPopperElement}
          style={{ ...popper.styles.popper, visibility: show ? "visible" : "hidden" }}
          {...popper.attributes.popper}
        >
          {content}
        </div>,
        document.querySelector("#popper-container") ?? document.createElement("div")
      )}
    </div>
  );
}

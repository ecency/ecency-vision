import React, { HTMLProps, useState } from "react";
import { AccordionContext } from "./accordion-context";
import { classNameObject } from "../../../helper/class-name-object";

export * from "./accordion-collapse";
export * from "./accordion-toggle";

export function Accordion(props: HTMLProps<HTMLDivElement> & { defaultActiveKey?: string }) {
  const [show, setShow] = useState<Record<string, boolean>>({
    ...(props.defaultActiveKey ? { [props.defaultActiveKey]: true } : {})
  });

  return (
    <AccordionContext.Provider value={{ show, setShow }}>
      <div
        {...props}
        className={classNameObject({
          "ecency-accordion": true,
          [props.className ?? ""]: !!props.className
        })}
      >
        {props.children}
      </div>
    </AccordionContext.Provider>
  );
}

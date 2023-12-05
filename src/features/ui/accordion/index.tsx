import React, { HTMLProps, useState } from "react";
import { AccordionContext } from "./accordion-context";
import { classNameObject, useFilteredProps } from "@/features/ui/util";

export * from "./accordion-collapse";
export * from "./accordion-toggle";

export function Accordion(props: HTMLProps<HTMLDivElement> & { defaultActiveKey?: string }) {
  const [show, setShow] = useState<Record<string, boolean>>({
    ...(props.defaultActiveKey ? { [props.defaultActiveKey]: true } : {})
  });
  const nativeProps = useFilteredProps(props, ["defaultActiveKey"]);

  return (
    <AccordionContext.Provider value={{ show, setShow }}>
      <div
        {...nativeProps}
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

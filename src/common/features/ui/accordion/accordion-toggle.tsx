import { createElement, PropsWithChildren, useContext } from "react";
import { AccordionContext } from "./accordion-context";

interface Props extends PropsWithChildren<any> {
  as: any;
  eventKey: string;
}

export function AccordionToggle(props: Props) {
  const { show, setShow } = useContext(AccordionContext);

  return createElement(
    props.as,
    {
      ...props,
      onClick: () =>
        setShow({
          ...show,
          [props.eventKey]: !show[props.eventKey] ?? false
        })
    },
    props.children
  );
}

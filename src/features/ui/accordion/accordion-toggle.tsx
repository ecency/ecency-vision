import { createElement, PropsWithChildren, useContext } from "react";
import { AccordionContext } from "./accordion-context";
import { useFilteredProps } from "@/features/ui/util";

interface Props extends PropsWithChildren<any> {
  as?: any;
  eventKey: string;
}

export function AccordionToggle(props: Props) {
  const { show, setShow } = useContext(AccordionContext);
  const nativeProps = useFilteredProps(props, ["eventKey", "as"]);

  return createElement(
    props.as ?? "div",
    {
      ...nativeProps,
      onClick: () =>
        setShow({
          ...show,
          [props.eventKey]: !show[props.eventKey] ?? false
        })
    },
    props.children
  );
}

import { createContext } from "react";

export const AccordionContext = createContext({
  show: {} as Record<string, boolean>,
  setShow: (value: Record<string, boolean>) => {}
});

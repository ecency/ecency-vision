import { createContext } from "react";

export const DropdownContext = createContext({
  show: false,
  setShow: (value: boolean) => {}
});

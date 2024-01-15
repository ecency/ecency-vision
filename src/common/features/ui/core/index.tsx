import React, { createContext, PropsWithChildren } from "react";
import { useSet } from "react-use";

export const UIContext = createContext<{
  openPopovers: Set<string>;
  addOpenPopover: (v: string) => void;
  removeOpenPopover: (v: string) => void;
}>({
  openPopovers: new Set(),
  addOpenPopover: () => {},
  removeOpenPopover: () => {}
});

export function UIManager({ children }: PropsWithChildren<unknown>) {
  const [openPopovers, { add: addOpenPopover, remove: removeOpenPopover }] = useSet(
    new Set<string>()
  );

  return (
    <UIContext.Provider value={{ openPopovers, addOpenPopover, removeOpenPopover }}>
      {children}
    </UIContext.Provider>
  );
}

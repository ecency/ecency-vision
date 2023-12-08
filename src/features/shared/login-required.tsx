import { cloneElement, PropsWithChildren, ReactElement } from "react";
import { useGlobalStore } from "@/core/global-store";

export function LoginRequired({ children }: PropsWithChildren) {
  const activeUser = useGlobalStore((state) => state.activeUser);
  const toggleUiProp = useGlobalStore((state) => state.toggleUiProp);

  return activeUser
    ? children
    : cloneElement(children as ReactElement, {
        onClick: () => toggleUiProp("login")
      });
}

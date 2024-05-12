import { PropsWithChildren } from "react";

export function SSRSafe(props: PropsWithChildren) {
  return typeof window !== "undefined" && typeof document !== "undefined" ? props.children : null;
}

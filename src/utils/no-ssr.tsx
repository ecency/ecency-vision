import { PropsWithChildren, ReactNode } from "react";

export function SSRSafe(props: PropsWithChildren<{ fallback?: ReactNode }>) {
  return typeof window !== "undefined" && typeof document !== "undefined"
    ? props.children
    : props.fallback ?? null;
}

"use client";

import { createContext, useContext } from "react";
import { SafeContext } from "@/core/client-server-bridge/type";

export function useClientContext<T>(ctx: SafeContext<T>) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useContext(ctx.ClientContext!!);
}

export function createClientContext<T>(ctxState: T) {
  return createContext(ctxState);
}

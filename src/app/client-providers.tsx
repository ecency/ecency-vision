"use client";

import { PropsWithChildren, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { UIManager } from "@ui/core";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ChatProvider } from "@/app/chat-provider";
import { ClientInit } from "@/app/client-init";
import { getQueryClient } from "@/core/react-query";
import { useGlobalStore } from "@/core/global-store";
import { AppWindow } from "@/types";

export function ClientProviders(props: PropsWithChildren) {
  const usePrivate = useGlobalStore((s) => s.usePrivate);

  useEffect(() => {
    (window as unknown as AppWindow).usePrivate = usePrivate;
  }, [usePrivate]);

  return (
    <QueryClientProvider client={getQueryClient()}>
      <UIManager>
        <ClientInit />
        <ChatProvider>{props.children}</ChatProvider>
      </UIManager>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

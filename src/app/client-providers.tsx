"use client";

import { PropsWithChildren } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { UIManager } from "@ui/core";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ChatProvider } from "@/app/chat-provider";
import { ClientInit } from "@/app/client-init";
import { getQueryClient } from "@/core/react-query";

export function ClientProviders(props: PropsWithChildren) {
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

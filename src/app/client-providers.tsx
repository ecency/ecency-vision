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
import { UserActivityRecorder } from "@/features/user-activity";
import { Tracker } from "@/features/monitoring";
import { Announcements } from "@/features/announcement";
import { FloatingFAQ } from "@/features/faq";

export function ClientProviders(props: PropsWithChildren) {
  const usePrivate = useGlobalStore((s) => s.usePrivate);

  useEffect(() => {
    (window as unknown as AppWindow).usePrivate = usePrivate;
  }, [usePrivate]);

  return (
    <QueryClientProvider client={getQueryClient()}>
      <UIManager>
        <ClientInit />
        <UserActivityRecorder />
        <Tracker />
        <ChatProvider>{props.children}</ChatProvider>
        <Announcements />
        <FloatingFAQ />
      </UIManager>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

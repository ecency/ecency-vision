"use client";

import { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function Providers({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider
      client={
        new QueryClient({
          defaultOptions: {
            queries: {
              refetchOnWindowFocus: false
            }
          }
        })
      }
    >
      {children}
      <div id="modal-overlay-container" />
      <div id="modal-dialog-container" />
    </QueryClientProvider>
  );
}

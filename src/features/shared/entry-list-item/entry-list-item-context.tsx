"use client";

import { EcencyClientServerBridge } from "@/core/client-server-bridge";
import { PropsWithChildren, useState } from "react";

export const EntryListItemContext = EcencyClientServerBridge.createSafeContext<{
  showNsfw: boolean;
  setShowNsfw: (v: boolean) => void;
}>({
  showNsfw: false,
  setShowNsfw: () => {}
});

export function EntryListItemProvider(props: PropsWithChildren) {
  const [showNsfw, setShowNsfw] = useState(false);

  return (
    <EntryListItemContext.ClientContextProvider value={{ setShowNsfw, showNsfw }}>
      {props.children}
    </EntryListItemContext.ClientContextProvider>
  );
}

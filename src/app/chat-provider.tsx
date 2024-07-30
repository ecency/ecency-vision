import defaults from "@/defaults.json";
import { PropsWithChildren, useMemo } from "react";
import { ChatContextProvider } from "@ecency/ns-query";
import { useGlobalStore } from "@/core/global-store";
import { getAccountFullQuery } from "@/api/queries";
import { getAccessToken } from "@/utils";
import { ChatPopUp } from "@/app/chats/_components/chat-popup";

export function ChatProvider(props: PropsWithChildren) {
  const activeUser = useGlobalStore((state) => state.activeUser);

  const { data: activeUserAccount } = getAccountFullQuery(activeUser?.username).useClientQuery();
  const accessToken = useMemo(
    () => (activeUser ? getAccessToken(activeUser.username) ?? "" : ""),
    [activeUser]
  );

  return (
    <ChatContextProvider
      storage={typeof window !== "undefined" ? window.localStorage : undefined}
      privateApiHost={defaults.base}
      activeUsername={activeUser?.username}
      activeUserData={activeUserAccount}
      ecencyAccessToken={accessToken}
    >
      {props.children}
      <ChatPopUp />
    </ChatContextProvider>
  );
}

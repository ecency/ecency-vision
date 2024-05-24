import defaults from "@/defaults.json";
import { PropsWithChildren, useMemo } from "react";
import { ChatContextProvider } from "@ecency/ns-query";
import { useGlobalStore } from "@/core/global-store";
import { useGetAccountFullQuery } from "@/api/queries";
import { getAccessToken } from "@/utils";
import { SSRSafe } from "@/utils/no-ssr";

export function ChatProvider(props: PropsWithChildren) {
  const activeUser = useGlobalStore((state) => state.activeUser);

  const { data: activeUserAccount } = useGetAccountFullQuery(activeUser?.username);
  const accessToken = useMemo(
    () => (activeUser ? getAccessToken(activeUser.username) ?? "" : ""),
    [activeUser]
  );

  return (
    <SSRSafe fallback={props.children}>
      <ChatContextProvider
        storage={typeof window !== "undefined" ? window.localStorage : undefined}
        privateApiHost={defaults.base}
        activeUsername={activeUser?.username}
        activeUserData={activeUserAccount}
        ecencyAccessToken={accessToken}
      >
        {props.children}
      </ChatContextProvider>
    </SSRSafe>
  );
}

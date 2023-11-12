import React, { useState } from "react";
import { useKeysQuery } from "./queries/keys-query";
import { NostrListenerQueriesProvider, NostrProvider } from "./nostr";
import { useListenMessagesQuery } from "./queries/listen-messages-query";
import { useActiveUserSwitching } from "./hooks";

interface Context {
  revealPrivateKey: boolean;
  receiverPubKey: string;
  hasUserJoinedChat: boolean;
  setRevealPrivateKey: (d: boolean) => void;
  setReceiverPubKey: (key: string) => void;
}

interface Props {
  children: JSX.Element | JSX.Element[];
}

export const ChatContext = React.createContext<Context>({
  revealPrivateKey: false,
  receiverPubKey: "",
  hasUserJoinedChat: false,
  setRevealPrivateKey: () => {},
  setReceiverPubKey: () => {}
});

export const ChatContextProvider = (props: Props) => {
  const [revealPrivateKey, setRevealPrivateKey] = useState(false);
  const [receiverPubKey, setReceiverPubKey] = useState("");

  const { hasKeys } = useKeysQuery();

  useListenMessagesQuery();
  useActiveUserSwitching();

  return (
    <NostrListenerQueriesProvider>
      <ChatContext.Provider
        value={{
          revealPrivateKey,
          receiverPubKey,
          hasUserJoinedChat: hasKeys,
          setRevealPrivateKey,
          setReceiverPubKey
        }}
      >
        <NostrProvider>{props.children}</NostrProvider>
      </ChatContext.Provider>
    </NostrListenerQueriesProvider>
  );
};

import React, { useEffect, useState } from "react";
import { match } from "react-router";
import { History } from "history";
import { Account } from "../../store/accounts/types";
import { ActiveUser } from "../../store/active-user/types";
import { Chat } from "../../store/chat/types";
import { ToggleType, UI } from "../../store/ui/types";
import { User } from "../../store/users/types";
import ChatsMessagesHeader from "../chats-messages-header";
import ChatsMessagesView from "../chats-messages-view";
import { Global } from "../../store/global/types";

import "./index.scss";
import { NostrKeysType } from "../../helper/chat-utils";

interface MatchParams {
  filter: string;
  name: string;
  path: string;
  url: string;
  username: string;
}

interface Props {
  match: match<MatchParams>;
  chat: Chat;
  global: Global;
  users: User[];
  history: History | null;
  activeUser: ActiveUser | null;
  ui: UI;
  activeUserKeys: NostrKeysType;
  setActiveUser: (username: string | null) => void;
  updateActiveUser: (data?: Account) => void;
  deleteUser: (username: string) => void;
  toggleUIProp: (what: ToggleType) => void;
}

export default function ChatsMessagesBox(props: Props) {
  const { match } = props;
  const username = match.params.username;

  const [maxHeight, setMaxHeight] = useState(0);

  useEffect(() => {
    setMaxHeight(window.innerHeight - 68);
  }, [typeof window !== "undefined"]);

  return (
    <>
      <div className="chats-messages-box" style={{ maxHeight: maxHeight }}>
        {match.url == "/chats" ? (
          <div className="no-chat-select d-flex justify-content-center align-items-center">
            <p className="start-chat text-center">Select a chat or start a new conversation</p>
          </div>
        ) : (
          <>
            <ChatsMessagesHeader username={username} {...props} />
            <ChatsMessagesView {...props} username={username} />
          </>
        )}
      </div>
    </>
  );
}

import { Button } from "@ui/button";
import { arrowBackSvg, closeSvg, syncSvg } from "../../../../img/svg";
import Tooltip from "../../../../components/tooltip";
import { _t } from "../../../../i18n";
import ChatsDropdownMenu from "../chats-dropdown-menu";
import React, { useContext } from "react";
import { ChatContext } from "../../chat-context-provider";
import { setNostrkeys } from "../../../../../managers/message-manager";
import { useMappedStore } from "../../../../store/use-mapped-store";
import { History } from "history";

interface Props {
  history: History;
}

export function ChatSidebarHeader({ history }: Props) {
  const { resetChat } = useMappedStore();
  const {
    activeUserKeys,
    setShowSpinner,
    revealPrivKey,
    chatPrivKey,
    windowWidth,
    setShowSideBar,
    setRevealPrivKey
  } = useContext(ChatContext);

  const handleRefreshChat = () => {
    resetChat();
    setNostrkeys(activeUserKeys!);
    setShowSpinner(true);
  };

  return (
    <div className="sticky top-0 z-10 bg-white flex items-center justify-between border-b border-[--border-color] p-3 gap-4">
      <div className="flex items-center gap-3">
        {windowWidth < 768 && (
          <Button appearance="link" icon={closeSvg} onClick={() => setShowSideBar(false)} />
        )}
        {revealPrivKey && windowWidth > 768 && (
          <Tooltip content={_t("chat.back")}>
            <Button appearance="link" icon={arrowBackSvg} onClick={() => setRevealPrivKey(false)} />
          </Tooltip>
        )}
        <div className="font-semibold text-gray-600 text-sm">{_t("chat.title")}</div>
      </div>
      <div className="flex items-center">
        <Tooltip content={_t("chat.refresh")}>
          <Button icon={syncSvg} appearance="link" onClick={handleRefreshChat} />
        </Tooltip>
        {chatPrivKey && (
          <div className="chat-menu">
            <ChatsDropdownMenu
              onManageChatKey={() => {
                setRevealPrivKey(!revealPrivKey);
                if (windowWidth < 768) {
                  setShowSideBar(false);
                }
              }}
              history={history}
            />
          </div>
        )}
      </div>
    </div>
  );
}

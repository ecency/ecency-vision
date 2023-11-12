import { Button } from "@ui/button";
import { arrowBackSvg } from "../../../../img/svg";
import Tooltip from "../../../../components/tooltip";
import { _t } from "../../../../i18n";
import ChatsDropdownMenu from "../chats-dropdown-menu";
import React, { useContext } from "react";
import { ChatContext } from "../../chat-context-provider";
import { History } from "history";
import { useKeysQuery } from "../../queries/keys-query";

interface Props {
  history: History;
}

export function ChatSidebarHeader({ history }: Props) {
  const { privateKey } = useKeysQuery();
  const { revealPrivateKey, setRevealPrivateKey } = useContext(ChatContext);

  return (
    <div className="sticky top-0 z-10 bg-white flex items-center justify-between border-b border-[--border-color] pl-4 pr-2 py-3 gap-4">
      <div className="flex items-center gap-2">
        {revealPrivateKey && (
          <Tooltip content={_t("chat.back")}>
            <Button
              className="hidden md:flex"
              noPadding={true}
              appearance="gray-link"
              icon={arrowBackSvg}
              onClick={() => setRevealPrivateKey(false)}
            />
          </Tooltip>
        )}
        <div className="font-semibold text-gray-600 text-sm">
          {revealPrivateKey ? _t("chat.manage-chat-key") : _t("chat.title")}
        </div>
      </div>
      <div className="flex items-center">
        {!!privateKey && (
          <div className="chat-menu">
            <ChatsDropdownMenu
              onManageChatKey={() => setRevealPrivateKey(!revealPrivateKey)}
              history={history}
            />
          </div>
        )}
      </div>
    </div>
  );
}

import { Button } from "@ui/button";
import { arrowBackSvg } from "../../../img/svg";
import { _t } from "../../../i18n";
import ManageChatKey from "../components/manage-chat-key";
import React, { useContext } from "react";
import { ChatContext } from "../chat-context-provider";

export function ChatsManageKeySection() {
  const { setRevealPrivateKey } = useContext(ChatContext);

  return (
    <div className="h-full">
      <div className="flex gap-4 items-center sticky z-[10] top-0 bg-white border-b border-[--border-color] px-4 h-[57px]">
        <Button
          noPadding={true}
          appearance="gray-link"
          icon={arrowBackSvg}
          onClick={() => setRevealPrivateKey(false)}
        />
        {_t("chat.manage-chat-key")}
      </div>
      <div className="max-w-[400px] mx-auto my-6 bg-gray-100 dark:bg-gray-900 w-full rounded-2xl border border-[--border-color] p-4">
        <ManageChatKey />
      </div>
      <div className="h-[1rem]" />
    </div>
  );
}

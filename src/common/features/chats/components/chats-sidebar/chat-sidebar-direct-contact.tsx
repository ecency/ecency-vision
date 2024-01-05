import React, { useContext, useMemo } from "react";
import UserAvatar from "../../../../components/user-avatar";
import { classNameObject } from "../../../../helper/class-name-object";
import {
  ChatContext,
  DirectContact,
  getRelativeDate,
  getUserChatPublicKey,
  useLastMessageQuery
} from "@ecency/ns-query";
import { useGetAccountFullQuery } from "../../../../api/queries";
import { _t } from "../../../../i18n";
import Tooltip from "../../../../components/tooltip";
import { informationOutlineSvg } from "../../../../img/svg";
import { Button } from "@ui/button";

interface Props {
  contact: DirectContact;
  username: string;
}

export function ChatSidebarDirectContact({ contact, username }: Props) {
  const { receiverPubKey, setReceiverPubKey, revealPrivateKey, setRevealPrivateKey } =
    useContext(ChatContext);

  const { data: contactData } = useGetAccountFullQuery(contact.name);
  const lastMessage = useLastMessageQuery(contact);
  const rawUsername = useMemo(() => username?.replace("@", "") ?? "", [username]);
  const lastMessageDate = useMemo(() => getRelativeDate(lastMessage?.created), [lastMessage]);

  const isReadOnly = useMemo(
    () => (contactData ? contact.pubkey !== getUserChatPublicKey(contactData) : false),
    [contactData, contact]
  );

  return (
    <div
      className={classNameObject({
        "flex items-center text-dark-200 gap-3 p-3 border-b border-[--border-color] last:border-0 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer":
          true,
        "bg-gray-100 dark:bg-gray-800":
          rawUsername === contact.name && receiverPubKey === contact.pubkey
      })}
      onClick={() => {
        setReceiverPubKey(contact.pubkey);
        if (revealPrivateKey) {
          setRevealPrivateKey(false);
        }
      }}
    >
      <div
        className={classNameObject({
          grayscale: isReadOnly
        })}
      >
        <UserAvatar username={contact.name} size="medium" />
      </div>
      <div className="flex flex-col w-[calc(100%-40px-0.75rem)]">
        <div className="flex justify-between w-full items-center">
          <div>
            {isReadOnly && (
              <div className="text-gray-600 flex items-center text-xs">
                {_t("chat.read-only")}
                <Tooltip content={_t("chat.why-read-only")}>
                  <Button icon={informationOutlineSvg} size="xxs" appearance="gray-link" />
                </Tooltip>
              </div>
            )}
            <div className="font-semibold truncate dark:text-white">{contact.name}</div>
          </div>
          <div className="text-xs text-gray-500">{lastMessageDate}</div>
        </div>
        <div className="text-sm text-gray-600 truncate">{lastMessage?.content}</div>
      </div>
    </div>
  );
}

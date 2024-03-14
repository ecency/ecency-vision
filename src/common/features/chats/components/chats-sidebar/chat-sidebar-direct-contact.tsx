import React, { useContext, useEffect, useMemo, useState } from "react";
import UserAvatar from "../../../../components/user-avatar";
import { classNameObject } from "../../../../helper/class-name-object";
import {
  ChatContext,
  DirectContact,
  getRelativeDate,
  useGetPublicKeysQuery,
  useKeysQuery,
  useLastMessageQuery,
  usePinContact,
  useUnreadCountQuery
} from "@ecency/ns-query";
import { _t } from "../../../../i18n";
import Tooltip from "../../../../components/tooltip";
import { informationOutlineSvg, pinSvg } from "../../../../img/svg";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";
import { ChatSidebarSavedMessagesAvatar } from "./chat-sidebar-saved-messages-avatar";
import { Dropdown, DropdownItemWithIcon, DropdownMenu } from "@ui/dropdown";
import { error, success } from "../../../../components/feedback";
import { history } from "../../../../store";
import useDebounce from "react-use/lib/useDebounce";

interface Props {
  contact: DirectContact;
  isLink?: boolean;
  onClick?: () => void;
}

export function ChatSidebarDirectContact({ contact, onClick, isLink = true }: Props) {
  const { receiverPubKey, setReceiverPubKey, revealPrivateKey, setRevealPrivateKey } =
    useContext(ChatContext);

  const [holdStarted, setHoldStarted] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);

  const { publicKey } = useKeysQuery();
  const { data: contactKeys, isLoading: isContactKeysLoading } = useGetPublicKeysQuery(
    contact.name
  );
  const lastMessage = useLastMessageQuery(contact);
  const unread = useUnreadCountQuery(contact);

  const lastMessageDate = useMemo(() => getRelativeDate(lastMessage?.created), [lastMessage]);
  const isJoined = useMemo(() => (contactKeys ? contactKeys.pubkey : false), [contactKeys]);
  const isReadOnly = useMemo(
    () => (contactKeys && isJoined ? contact.pubkey !== contactKeys.pubkey : false),
    [contactKeys, contact, isJoined]
  );
  const isActiveUser = useMemo(() => contact.pubkey === publicKey, [publicKey, contact]);

  const {
    mutateAsync: pinContact,
    isLoading: isContactPinning,
    isSuccess: isPinned,
    isError: isPinFailed
  } = usePinContact();

  useEffect(() => {
    if (isPinned) {
      success(_t("g.success"));
    }
  }, [isPinned]);

  useEffect(() => {
    if (isPinFailed) {
      error(_t("g.error"));
    }
  }, [isPinFailed]);

  useDebounce(
    () => {
      if (holdStarted) {
        setHoldStarted(false);
        setShowContextMenu(true);
      }
    },
    500,
    [holdStarted]
  );

  const content = (
    <>
      <div
        className={classNameObject({
          grayscale: isContactKeysLoading ? true : isReadOnly || !isJoined
        })}
      >
        {isActiveUser ? (
          <ChatSidebarSavedMessagesAvatar />
        ) : (
          <UserAvatar username={contact.name} size="medium" />
        )}
      </div>
      <div className="flex flex-col w-[calc(100%-40px-0.75rem)]">
        <div className="flex justify-between w-full items-center">
          <div>
            {isReadOnly && !isContactKeysLoading && (
              <div className="text-gray-600 flex items-center text-xs">
                {_t("chat.read-only")}
                <Tooltip content={_t("chat.why-read-only")}>
                  <Button icon={informationOutlineSvg} size="xxs" appearance="gray-link" />
                </Tooltip>
              </div>
            )}
            {!isJoined && !isContactKeysLoading && (
              <div className="text-gray-600 flex items-center text-xs">
                {_t("chat.user-not-joined")}
                <Tooltip content={_t("chat.not-joined")}>
                  <Button icon={informationOutlineSvg} size="xxs" appearance="gray-link" />
                </Tooltip>
              </div>
            )}
            <div className="font-semibold truncate dark:text-white flex items-center gap-2">
              {isActiveUser ? _t("chat.saved-messages") : contact.name}
              {contact.pinned && <span className="rotate-45 opacity-25 w-3.5">{pinSvg}</span>}
            </div>
          </div>
          <div className="text-xs text-gray-500">{lastMessageDate}</div>
        </div>
        <div className="flex justify-between">
          <div className="text-sm text-gray-600 truncate">
            {lastMessage?.creator === publicKey && !isActiveUser && (
              <span className="mr-1 text-gray-500 dark:text-gray-700">{_t("g.you")}:</span>
            )}
            {lastMessage?.content}
          </div>
          {!!unread && !isActiveUser && <Badge appearance="secondary">{unread}</Badge>}
        </div>
      </div>
    </>
  );

  return (
    <Dropdown
      closeOnClickOutside={true}
      show={showContextMenu}
      setShow={(v) => setShowContextMenu(v)}
    >
      <div
        onMouseDown={() => setHoldStarted(true)}
        onMouseUp={() => {
          setHoldStarted(false);

          setTimeout(() => {
            if (!holdStarted) {
              return;
            }

            if (isLink) {
              history?.push("/chats");
            }

            setReceiverPubKey(contact.pubkey);
            if (revealPrivateKey) {
              setRevealPrivateKey(false);
            }
            onClick?.();
          }, 500);
        }}
        onTouchStart={() => setHoldStarted(true)}
        onTouchEnd={() => {
          setHoldStarted(false);
          console.log("touch ended");

          setTimeout(() => {
            if (!holdStarted) {
              return;
            }

            if (isLink) {
              history?.push("/chats");
            }

            setReceiverPubKey(contact.pubkey);
            if (revealPrivateKey) {
              setRevealPrivateKey(false);
            }
            onClick?.();
          }, 500);
        }}
        onContextMenu={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setShowContextMenu(true);
        }}
        className={classNameObject({
          "flex items-center text-dark-200 gap-3 p-3 border-b border-[--border-color] last:border-0 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer":
            true,
          "bg-gray-100 dark:bg-gray-800": receiverPubKey === contact.pubkey
        })}
      >
        {content}
      </div>
      <DropdownMenu className="top-[70%]">
        <DropdownItemWithIcon
          icon={pinSvg}
          label={contact.pinned ? _t("chat.unpin") : _t("chat.pin")}
          onClick={() => pinContact({ contact, pinned: !contact.pinned })}
        />
      </DropdownMenu>
    </Dropdown>
  );
}

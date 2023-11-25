import Tooltip from "../../../../components/tooltip";
import { _t } from "../../../../i18n";
import { Button } from "@ui/button";
import { addMessageSvg, arrowBackSvg, expandArrow, extendedView } from "../../../../img/svg";
import ChatsCommunityDropdownMenu from "../chats-community-actions";
import { history } from "../../../../store";
import ChatsDropdownMenu from "../chats-dropdown-menu";
import { classNameObject } from "../../../../helper/class-name-object";
import React, { useContext, useMemo } from "react";
import UserAvatar from "../../../../components/user-avatar";
import { ChatContext } from "../../chat-context-provider";
import { useKeysQuery } from "../../queries/keys-query";

interface Props {
  currentUser: string;
  communityName: string;
  showSearchUser: boolean;
  expanded: boolean;
  canSendMessage: boolean;
  isCommunity: boolean;
  isCurrentUser: boolean;
  handleBackArrowSvg: () => void;
  handleMessageSvgClick: () => void;
  handleExtendedView: () => void;
  setExpanded: (v: boolean) => void;
}

export function ChatPopupHeader({
  currentUser,
  communityName,
  showSearchUser,
  expanded,
  canSendMessage,
  isCommunity,
  isCurrentUser,
  handleBackArrowSvg,
  handleMessageSvgClick,
  handleExtendedView,
  setExpanded
}: Props) {
  const { revealPrivateKey, setRevealPrivateKey } = useContext(ChatContext);

  const { privateKey } = useKeysQuery();
  const title = useMemo(() => {
    if (revealPrivateKey) {
      return _t("chat.manage-chat-key");
    }

    if (currentUser) {
      return currentUser;
    }

    if (isCommunity) {
      return communityName;
    }

    if (showSearchUser) {
      return _t("chat.new-message");
    }

    return _t("chat.page-title");
  }, [currentUser, isCommunity, communityName, showSearchUser, revealPrivateKey]);

  return (
    <div
      className="flex items-center justify-between border-b border-[--border-color] px-4 py-2 gap-2 cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center gap-2">
        {(currentUser || communityName || showSearchUser || revealPrivateKey) && expanded && (
          <Tooltip content={_t("chat.back")}>
            <Button
              size="sm"
              noPadding={true}
              appearance="link"
              onClick={(e: { stopPropagation: () => void }) => {
                e.stopPropagation();
                handleBackArrowSvg();
              }}
              icon={arrowBackSvg}
            />
          </Tooltip>
        )}
        <div className="flex items-center gap-3" onClick={() => setExpanded(!expanded)}>
          {(currentUser || isCommunity) && (
            <UserAvatar username={isCurrentUser ? currentUser : communityName || ""} size="small" />
          )}

          <div className="text-lg truncate max-w-[180px] font-semibold">{title}</div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Tooltip content={_t("chat.extended-view")}>
          <Button
            noPadding={true}
            size="sm"
            appearance="gray-link"
            icon={extendedView}
            onClick={(e: { stopPropagation: () => void }) => {
              e.stopPropagation();
              handleExtendedView();
            }}
          />
        </Tooltip>
        {canSendMessage && (
          <Tooltip content={_t("chat.new-message")}>
            <Button
              noPadding={true}
              size="sm"
              appearance="gray-link"
              icon={addMessageSvg}
              onClick={(e: { stopPropagation: () => void }) => {
                e.stopPropagation();
                handleMessageSvgClick();
              }}
            />
          </Tooltip>
        )}
        {isCommunity && <ChatsCommunityDropdownMenu history={history!} username={communityName} />}
        {!isCommunity && !isCurrentUser && privateKey && (
          <div
            className="flex items-center"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(true);
            }}
          >
            <ChatsDropdownMenu
              history={history!}
              onManageChatKey={() => setRevealPrivateKey(!revealPrivateKey)}
            />
          </div>
        )}
        <Tooltip content={expanded ? _t("chat.collapse") : _t("chat.expand")}>
          <Button
            noPadding={true}
            size="sm"
            appearance="gray-link"
            className={classNameObject({
              "duration-300": true,
              "rotate-180": !expanded
            })}
            onClick={(e: { stopPropagation: () => void }) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            icon={expandArrow}
          />
        </Tooltip>
      </div>
    </div>
  );
}
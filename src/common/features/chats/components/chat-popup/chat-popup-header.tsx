import Tooltip from "../../../../components/tooltip";
import { _t } from "../../../../i18n";
import { Button } from "@ui/button";
import { addMessageSvg, arrowBackSvg, expandArrow } from "../../../../img/svg";
import ChatsCommunityDropdownMenu from "../chats-community-actions";
import { history } from "../../../../store";
import ChatsDropdownMenu from "../chats-dropdown-menu";
import { classNameObject } from "../../../../helper/class-name-object";
import React, { useContext, useMemo } from "react";
import UserAvatar from "../../../../components/user-avatar";
import { ChatContext, useKeysQuery } from "@ecency/ns-query";
import { useCommunityCache } from "../../../../core";

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
  setExpanded
}: Props) {
  const { revealPrivateKey, setRevealPrivateKey } = useContext(ChatContext);

  const { data: community } = useCommunityCache(communityName);
  const { privateKey } = useKeysQuery();
  const title = useMemo(() => {
    if (revealPrivateKey) {
      return _t("chat.manage-chat-key");
    }

    if (currentUser) {
      return currentUser;
    }

    if (isCommunity && community) {
      return community.title;
    }

    if (showSearchUser) {
      return _t("chat.new-message");
    }

    return _t("chat.page-title");
  }, [currentUser, isCommunity, communityName, showSearchUser, revealPrivateKey]);
  const isExpanded = useMemo(
    () => (currentUser || communityName || showSearchUser || revealPrivateKey) && expanded,
    [currentUser, communityName, showSearchUser, revealPrivateKey, expanded]
  );

  return (
    <div
      className="flex items-center justify-between border-b border-[--border-color] px-2 py-2 gap-2 cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center">
        {isExpanded && (
          <Tooltip content={_t("chat.back")}>
            <Button
              size="sm"
              appearance="link"
              onClick={(e: { stopPropagation: () => void }) => {
                e.stopPropagation();
                handleBackArrowSvg();
              }}
              icon={arrowBackSvg}
            />
          </Tooltip>
        )}
        <div className="flex items-center" onClick={() => setExpanded(!expanded)}>
          {(currentUser || isCommunity) && (
            <UserAvatar username={isCurrentUser ? currentUser : communityName || ""} size="small" />
          )}

          <div
            className={classNameObject({
              "truncate max-w-[180px] font-semibold pl-4": true
            })}
          >
            {title}
          </div>

          <Tooltip content={expanded ? _t("chat.collapse") : _t("chat.expand")}>
            <Button
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
      <div className="flex items-center gap-4">
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
              communityName={communityName}
              currentUser={currentUser}
              onManageChatKey={() => setRevealPrivateKey(!revealPrivateKey)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

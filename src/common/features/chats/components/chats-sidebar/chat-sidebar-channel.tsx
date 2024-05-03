import { Link } from "react-router-dom";
import React, { useContext, useMemo } from "react";
import UserAvatar from "../../../../components/user-avatar";
import { classNameObject } from "../../../../helper/class-name-object";
import {
  Channel,
  ChatContext,
  getRelativeDate,
  useKeysQuery,
  useLastMessageQuery,
  useUnreadCountQuery
} from "@ecency/ns-query";
import { _t } from "../../../../i18n";
import { Badge } from "@ui/badge";
import { useCommunityCache } from "../../../../core";
import { UilUsersAlt } from "@iconscout/react-unicons";

interface Props {
  username: string;
  channel: Channel;
  isChannel: boolean;
  isLink?: boolean;
  onClick?: () => void;
}

export function ChatSidebarChannel({
  channel,
  username,
  isChannel,
  isLink = true,
  onClick
}: Props) {
  const { revealPrivateKey, setRevealPrivateKey, setReceiverPubKey } = useContext(ChatContext);

  const { data: community } = useCommunityCache(channel?.communityName);
  const { publicKey } = useKeysQuery();
  const unread = useUnreadCountQuery(undefined, channel);
  const lastMessage = useLastMessageQuery(undefined, channel, community ?? undefined);

  const rawUsername = useMemo(() => username?.replace("@", "") ?? "", [username]);
  const lastMessageDate = useMemo(() => getRelativeDate(lastMessage?.created), [lastMessage]);

  const content = (
    <>
      <UserAvatar username={channel.communityName!} size="medium" />
      <div className="absolute bottom-2.5 left-2.5 w-5 h-5 text-blue-dark-sky flex items-center justify-center rounded-full bg-white">
        <UilUsersAlt size={14} />
      </div>
      <div className="flex flex-col w-[calc(100%-40px-0.75rem)]">
        <div className="flex justify-between w-full items-center">
          <div className="font-semibold truncate dark:text-white">{channel.name}</div>
          <div className="text-xs text-gray-500">{lastMessageDate}</div>
        </div>
        <div className="flex justify-between">
          <div className="text-sm text-gray-600 truncate">
            {lastMessage?.creator === publicKey && (
              <span className="mr-1 text-gray-500 dark:text-gray-700">{_t("g.you")}:</span>
            )}
            {lastMessage?.content}
          </div>
          {!!unread && <Badge appearance="secondary">{unread}</Badge>}
        </div>
      </div>
    </>
  );

  return isLink ? (
    <Link
      className={classNameObject({
        "flex items-center relative text-dark-200 gap-3 p-3 border-b border-[--border-color] last:border-0 hover:bg-gray-100 dark:hover:bg-gray-800":
          true,
        "bg-gray-100 dark:bg-gray-800": rawUsername === channel.communityName && isChannel
      })}
      to={`/chats/${channel.communityName}/channel`}
      onClick={() => {
        setReceiverPubKey("");
        if (revealPrivateKey) {
          setRevealPrivateKey(false);
        }
        onClick?.();
      }}
    >
      {content}
    </Link>
  ) : (
    <div
      className={classNameObject({
        "flex items-center relative text-dark-200 gap-3 p-3 border-b border-[--border-color] last:border-0 hover:bg-gray-100 dark:hover:bg-gray-800":
          true,
        "bg-gray-100 dark:bg-gray-800": rawUsername === channel.communityName && isChannel
      })}
      onClick={() => {
        setReceiverPubKey("");
        if (revealPrivateKey) {
          setRevealPrivateKey(false);
        }
        onClick?.();
      }}
    >
      {content}
    </div>
  );
}

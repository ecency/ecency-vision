import React, { useMemo } from "react";
import UserAvatar from "../../../../components/user-avatar";
import {
  Channel,
  DirectContact,
  getUserChatPublicKey,
  isCommunity,
  useLastMessageQuery
} from "@ecency/ns-query";
import { useCommunityCache } from "../../../../core";
import { classNameObject } from "../../../../helper/class-name-object";
import { useGetAccountFullQuery } from "../../../../api/queries";
import { _t } from "../../../../i18n";
import Tooltip from "../../../../components/tooltip";
import { Button } from "@ui/button";
import { informationOutlineSvg } from "../../../../img/svg";

interface Props {
  username: string;
  contact?: DirectContact;
  channel?: Channel;
  userClicked: (username: string) => void;
}

export function ChatDirectContactOrChannelItem({ contact, channel, username, userClicked }: Props) {
  const lastMessage = useLastMessageQuery(contact, channel);
  const { data: community } = useCommunityCache(channel?.communityName);

  const { data: contactData } = useGetAccountFullQuery(contact?.name);

  const isJoined = useMemo(
    () => (contactData ? !!getUserChatPublicKey(contactData) : false),
    [contactData]
  );
  const isReadOnly = useMemo(
    () => (contactData && isJoined ? contact?.pubkey !== getUserChatPublicKey(contactData) : false),
    [contactData, contact, isJoined]
  );
  return (
    <div
      className="flex items-center gap-3 px-3 border-b border-[--border-color] py-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-dark-300"
      onClick={() => userClicked(username)}
    >
      <div
        className={classNameObject({
          grayscale: isReadOnly || !isJoined
        })}
      >
        <UserAvatar username={username} size="medium" />
      </div>

      <div>
        <div className="flex flex-col">
          {isReadOnly && (
            <div className="text-gray-600 flex items-center text-xs">
              {_t("chat.read-only")}
              <Tooltip content={_t("chat.why-read-only")}>
                <Button icon={informationOutlineSvg} size="xxs" appearance="gray-link" />
              </Tooltip>
            </div>
          )}
          {!isJoined && (
            <div className="text-gray-600 flex items-center text-xs">
              {_t("chat.user-not-joined")}
              <Tooltip content={_t("chat.not-joined")}>
                <Button icon={informationOutlineSvg} size="xxs" appearance="gray-link" />
              </Tooltip>
            </div>
          )}
          <div className="font-semibold">
            {isCommunity(username) && community ? community.title : username}
          </div>
        </div>
        <p className="text-gray-600 text-sm">{lastMessage?.content}</p>
      </div>
    </div>
  );
}

import React, { useEffect, useMemo, useState } from "react";
import { useMappedStore } from "../../../store/use-mapped-store";
import { _t } from "../../../i18n";
import { ChatMessageItem } from "./chat-message-item";
import { Dropdown, DropdownItemWithIcon, DropdownMenu } from "@ui/dropdown";
import { hideSvg, removeUserSvg } from "../../../img/svg";
import { Spinner } from "@ui/spinner";
import {
  Channel,
  checkContiguousMessage,
  Message,
  PublicMessage,
  useHideMessageInChannel,
  useJoinedCommunityTeamQuery,
  useKeysQuery,
  useMuteUserInChannel,
  usePublicMessagesQuery
} from "@ecency/ns-query";
import { groupMessages } from "../utils";
import { ChatFloatingDate } from "./chat-floating-date";
import { differenceInCalendarDays } from "date-fns";
import useDebounce from "react-use/lib/useDebounce";
import { useCommunityCache } from "../../../core";
import { ROLES } from "../../../store/communities";
import { ForwardMessageDialog } from "./forward-message-dialog";
import { UilCommentAltMessage, UilMessage } from "@iconscout/react-unicons";
import { usePersistentReplyToMessage } from "../hooks";

interface Props {
  publicMessages: PublicMessage[];
  currentChannel: Channel;
  isPage?: boolean;
}

export function ChatsChannelMessages({ publicMessages, currentChannel, isPage }: Props) {
  const { activeUser } = useMappedStore();

  const channelMessagesRef = React.createRef<HTMLDivElement>();

  // Message where users interacted with context menu
  const [currentInteractingMessageId, setCurrentInteractingMessageId] = useState<string>();
  const [needFetchNextPage, setNeedFetchNextPage] = useState(false);
  const [forwardingMessage, setForwardingMessage] = useState<Message>();
  const [_, setReply] = usePersistentReplyToMessage(currentChannel);

  const { data: community } = useCommunityCache(currentChannel?.communityName);
  const { data: joinedCommunityTeamKeys, isSuccess: isJoinedCommunityTeamKeysFetched } =
    useJoinedCommunityTeamQuery(community ?? undefined);
  const { publicKey } = useKeysQuery();
  const { fetchNextPage, refetch } = usePublicMessagesQuery(
    currentChannel,
    joinedCommunityTeamKeys.map(({ pubkey }) => pubkey)
  );

  const { mutateAsync: muteUserInChannel, isLoading: isUserMutingLoading } =
    useMuteUserInChannel(currentChannel);
  const { mutateAsync: hideMessage, isLoading: isHideMessageLoading } =
    useHideMessageInChannel(currentChannel);

  const isCommunityTeamMember = useMemo(
    () =>
      community?.team.some(
        ([name, role]) =>
          name === activeUser?.username &&
          [ROLES.MOD, ROLES.ADMIN, ROLES.OWNER].includes(role as ROLES)
      ) ?? false,
    [community, activeUser]
  );
  const groupedMessages = useMemo(() => groupMessages(publicMessages), [publicMessages]);

  useEffect(() => {
    if (publicMessages.length === 0 && isJoinedCommunityTeamKeysFetched) {
      refetch();
    }
  }, [publicMessages, isJoinedCommunityTeamKeysFetched]);

  useDebounce(
    () => {
      if (needFetchNextPage) {
        fetchNextPage();
      }
    },
    500,
    [needFetchNextPage]
  );

  return (
    <>
      <div className="channel-messages" ref={channelMessagesRef}>
        {groupedMessages.map(([date, group], i) => (
          <div className="relative" key={date.getTime()}>
            {(i > 0 ? differenceInCalendarDays(date, groupedMessages[i - 1][0]) : 1) ? (
              <ChatFloatingDate key={date.getTime()} currentDate={date} isPage={isPage} />
            ) : (
              <></>
            )}
            {group.map((message, j) => (
              <>
                <Dropdown
                  key={message.id}
                  closeOnClickOutside={true}
                  show={currentInteractingMessageId === message.id}
                  setShow={(v) =>
                    setCurrentInteractingMessageId(v ? currentInteractingMessageId : undefined)
                  }
                >
                  <ChatMessageItem
                    currentChannel={currentChannel}
                    type={message.creator !== publicKey ? "receiver" : "sender"}
                    message={message}
                    isSameUser={checkContiguousMessage(message, i, publicMessages)}
                    onContextMenu={() => setCurrentInteractingMessageId(message.id)}
                    onAppear={() =>
                      setTimeout(
                        () =>
                          publicMessages?.length - 1 === i
                            ? document
                                .querySelector(`[data-message-id="${message.id}"]`)
                                ?.scrollIntoView({ block: "nearest" })
                            : {},
                        100
                      )
                    }
                    onInViewport={(inViewport) =>
                      i === 0 && j === 0 && setNeedFetchNextPage(inViewport)
                    }
                  />
                  <DropdownMenu
                    className="top-[70%]"
                    align={message.creator === publicKey ? "right" : "left"}
                  >
                    <DropdownItemWithIcon
                      icon={<UilMessage />}
                      label={_t("chat.forward")}
                      onClick={() => setForwardingMessage(message)}
                    />
                    <DropdownItemWithIcon
                      icon={<UilCommentAltMessage />}
                      label={_t("chat.reply")}
                      onClick={() => setReply(message)}
                    />
                    {isCommunityTeamMember && (
                      <>
                        <DropdownItemWithIcon
                          icon={
                            isHideMessageLoading ? <Spinner className="w-3.5 h-3.5" /> : hideSvg
                          }
                          label={_t("chat.hide-message")}
                          onClick={() => hideMessage({ messageId: message.id, status: 0 })}
                        />
                        {message.creator !== publicKey && (
                          <DropdownItemWithIcon
                            icon={
                              isUserMutingLoading ? (
                                <Spinner className="w-3.5 h-3.5" />
                              ) : (
                                removeUserSvg
                              )
                            }
                            label={_t("chat.block-author")}
                            onClick={() =>
                              muteUserInChannel({ pubkey: message.creator, status: 0 })
                            }
                          />
                        )}
                      </>
                    )}
                  </DropdownMenu>
                </Dropdown>
              </>
            ))}
          </div>
        ))}

        <ForwardMessageDialog
          message={forwardingMessage!!}
          show={!!forwardingMessage}
          setShow={() => setForwardingMessage(undefined)}
        />
      </div>
    </>
  );
}

import React, { useContext, useEffect, useState } from "react";
import mediumZoom, { Zoom } from "medium-zoom";
import { Channel, PublicMessage } from "../../managers/message-manager-types";
import { History } from "history";
import { useMappedStore } from "../../../../store/use-mapped-store";
import usePrevious from "react-use/lib/usePrevious";
import { _t } from "../../../../i18n";
import ChatsConfirmationModal from "../chats-confirmation-modal";
import { error } from "../../../../components/feedback";
import { Theme } from "../../../../store/global/types";
import { checkContiguousMessage, formatMessageDateAndDay } from "../../utils";
import { ChatContext } from "../../chat-context-provider";

import "./index.scss";
import { ChatMessageItem } from "../chat-message-item";

interface Props {
  publicMessages: PublicMessage[];
  currentChannel: Channel;
  username: string;
  from?: string;
  history: History;
  isScrollToBottom: boolean;
  isScrolled?: boolean;
  scrollToBottom?: () => void;
}

let zoom: Zoom | null = null;
export default function ChatsChannelMessages(props: Props) {
  const { publicMessages, isScrollToBottom, isScrolled, currentChannel, scrollToBottom } = props;
  const {
    chat,
    global,
    activeUser,
    ui,
    users,
    deletePublicMessage,
    setActiveUser,
    updateActiveUser,
    deleteUser,
    toggleUIProp
  } = useMappedStore();

  const { messageServiceInstance, activeUserKeys, windowWidth, isActiveUserRemoved } =
    useContext(ChatContext);

  let prevGlobal = usePrevious(global);

  const channelMessagesRef = React.createRef<HTMLDivElement>();

  const [step, setStep] = useState(0);
  const [clickedMessage, setClickedMessage] = useState("");
  const [removedUserId, setRemovedUserID] = useState("");
  const [hiddenMsgId, setHiddenMsgId] = useState("");
  const [resendMessage, setResendMessage] = useState<PublicMessage>();

  useEffect(() => {
    if (prevGlobal?.theme !== global.theme) {
      setBackground();
    }
    prevGlobal = global;
  }, [global.theme, activeUser]);

  useEffect(() => {
    if (publicMessages.length !== 0) {
      zoomInitializer();
    }
    if (!isScrollToBottom && publicMessages.length !== 0 && !isScrolled) {
      scrollToBottom && scrollToBottom();
    }
  }, [publicMessages, isScrollToBottom, channelMessagesRef]);

  useEffect(() => {
    if (currentChannel) {
      zoomInitializer();
    }
  }, [currentChannel]);

  const zoomInitializer = () => {
    const elements: HTMLElement[] = [...document.querySelectorAll<HTMLElement>(".chat-image img")];
    zoom = mediumZoom(elements);
    setBackground();
  };

  const setBackground = () => {
    if (global.theme === Theme.day) {
      zoom?.update({ background: "#ffffff" });
    } else {
      zoom?.update({ background: "#131111" });
    }
  };

  const handleConfirm = () => {
    let updatedMetaData = {
      name: currentChannel?.name!,
      about: currentChannel?.about!,
      picture: "",
      communityName: currentChannel?.communityName!,
      communityModerators: currentChannel?.communityModerators,
      hiddenMessageIds: currentChannel?.hiddenMessageIds,
      removedUserIds: currentChannel?.removedUserIds
    };

    switch (step) {
      case 1:
        const updatedHiddenMessages = [...(currentChannel?.hiddenMessageIds || []), hiddenMsgId!];
        updatedMetaData.hiddenMessageIds = updatedHiddenMessages;
        break;
      case 2:
        const updatedRemovedUsers = [...(currentChannel?.removedUserIds || []), removedUserId!];
        updatedMetaData.removedUserIds = updatedRemovedUsers;

        const isRemovedUserModerator = currentChannel?.communityModerators?.find(
          (x) => x.pubkey === removedUserId
        );
        const isModerator = !!isRemovedUserModerator;
        if (isModerator) {
          const NewUpdatedRoles = currentChannel?.communityModerators?.filter(
            (item) => item.pubkey !== removedUserId
          );
          updatedMetaData.communityModerators = NewUpdatedRoles;
        }
        break;
      case 3:
        const newUpdatedRemovedUsers =
          currentChannel &&
          currentChannel?.removedUserIds!.filter((item) => item !== removedUserId);

        updatedMetaData.removedUserIds = newUpdatedRemovedUsers;
        break;
      case 4:
        if (resendMessage) {
          deletePublicMessage(currentChannel.id, resendMessage?.id);
          messageServiceInstance?.sendPublicMessage(
            currentChannel!,
            resendMessage?.content,
            [],
            ""
          );
        }
        break;
      default:
        break;
    }

    try {
      messageServiceInstance?.updateChannel(currentChannel!, updatedMetaData);
      // currentChannelSetter({ ...currentChannel!, ...updatedMetaData });
      setStep(0);
    } catch (err) {
      error(_t("chat.error-updating-community"));
    }
  };

  return (
    <>
      <div className="channel-messages" ref={channelMessagesRef}>
        {publicMessages.length !== 0 &&
          activeUserKeys &&
          publicMessages.map((pMsg, i) => {
            const dayAndMonth = formatMessageDateAndDay(pMsg, i, publicMessages);

            const isSameUserMessage = checkContiguousMessage(pMsg, i, publicMessages);

            return (
              <React.Fragment key={pMsg.id}>
                {dayAndMonth && (
                  <div className="custom-divider">
                    <span className="flex justify-center items-center mt-3 custom-divider-text">
                      {dayAndMonth}
                    </span>
                  </div>
                )}

                <ChatMessageItem
                  currentChannel={currentChannel}
                  type={pMsg.creator !== activeUserKeys?.pub ? "receiver" : "sender"}
                  message={pMsg}
                  isSameUser={isSameUserMessage}
                />
              </React.Fragment>
            );
          })}
        {isActiveUserRemoved && (
          <span className="flex justify-center items-center mt-3">
            You have been blocked from this community
          </span>
        )}
      </div>
      {step !== 0 && (
        <ChatsConfirmationModal
          actionType={"Confirmation"}
          content={"Are you sure?"}
          onClose={() => {
            setStep(0);
          }}
          onConfirm={handleConfirm}
        />
      )}
    </>
  );
}

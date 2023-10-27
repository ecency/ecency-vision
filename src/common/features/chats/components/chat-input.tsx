import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Channel } from "../../../../managers/message-manager-types";
import { EmojiPicker } from "../../../components/emoji-picker";
import { error } from "../../../components/feedback";
import {
  attachFileSvg,
  chatBoxImageSvg,
  emoticonHappyOutlineSvg,
  gifIcon,
  messageSendSvg
} from "../../../img/svg";
import { CHAT_FILE_CONTENT_TYPES, GifImagesStyle, UPLOADING } from "./chat-popup/chat-constants";
import { useMappedStore } from "../../../store/use-mapped-store";
import { _t } from "../../../i18n";
import { ChatContext } from "../chat-context-provider";
import { Form } from "@ui/form";
import { FormControl } from "@ui/input";
import { Button } from "@ui/button";
import { useChatFileUpload } from "../mutations";
import { Dropdown, DropdownItemWithIcon, DropdownMenu, DropdownToggle } from "@ui/dropdown";
import GifPicker from "../../../components/gif-picker";
import useClickAway from "react-use/lib/useClickAway";

interface Props {
  isCurrentUser: boolean;
  isCommunity: boolean;
  currentChannel: Channel;
  currentUser: string;
  isCurrentUserJoined: boolean;
}

export default function ChatInput({
  isCommunity,
  isCurrentUser,
  currentChannel,
  currentUser
}: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const emojiButtonRef = useRef<HTMLButtonElement | null>(null);
  const gifPickerRef = useRef<HTMLDivElement | null>(null);

  const { chat } = useMappedStore();
  const { messageServiceInstance, isActveUserRemoved, receiverPubKey } = useContext(ChatContext);

  const [message, setMessage] = useState("");
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [isMessageText, setIsMessageText] = useState(false);

  const { mutateAsync } = useChatFileUpload(setMessage, setIsMessageText);

  const isDisabled = useMemo(
    () => (isCurrentUser && !receiverPubKey) || isActveUserRemoved,
    [isCurrentUser, receiverPubKey, isActveUserRemoved]
  );

  useClickAway(gifPickerRef, () => setShowGifPicker(false));

  useEffect(() => {
    if (!isCurrentUser && !isCommunity) {
      setMessage("");
    }
  }, [isCommunity, isCurrentUser]);

  const sendMessage = () => {
    if (message.length !== 0 && !message.includes(UPLOADING)) {
      if (isCommunity) {
        if (!isActveUserRemoved) {
          messageServiceInstance?.sendPublicMessage(currentChannel, message, [], "");
        } else {
          error(_t("chat.message-warning"));
        }
      }
      if (isCurrentUser) {
        messageServiceInstance?.sendDirectMessage(receiverPubKey!, message);
      }
      setMessage("");
      setIsMessageText(false);
    }
    if (
      receiverPubKey &&
      !chat.directContacts.some((contact) => contact.name === currentUser) &&
      isCurrentUser
    ) {
      messageServiceInstance?.publishContacts(currentUser, receiverPubKey);
    }
  };

  const checkFile = (filename: string) => {
    const filenameLow = filename.toLowerCase();
    return CHAT_FILE_CONTENT_TYPES.some((el) => filenameLow.endsWith(el));
  };

  const fileInputChanged = (e: React.ChangeEvent<HTMLInputElement>): void => {
    let files = [...(e.target.files as FileList)].filter((i) => checkFile(i.name)).filter((i) => i);

    if (files.length > 0) {
      e.stopPropagation();
      e.preventDefault();
    }

    files.forEach((file) => mutateAsync(file));

    // reset input
    e.target.value = "";
  };

  return (
    <div className="chat-input">
      {/*{message.length === 0 && (*/}
      {/*  <React.Fragment>*/}

      {/*    <Tooltip content="Image">*/}
      {/*      <div*/}
      {/*        className="chatbox-image"*/}
      {/*        onClick={(e: React.MouseEvent<HTMLElement>) => {*/}
      {/*          e.stopPropagation();*/}
      {/*          const el = fileInputRef.current;*/}
      {/*          if (el) el.click();*/}
      {/*        }}*/}
      {/*      >*/}
      {/*        <div className="chatbox-image-icon">{chatBoxImageSvg}</div>*/}
      {/*      </div>*/}
      {/*    </Tooltip>*/}

      {/*    <input*/}
      {/*      onChange={fileInputChanged}*/}
      {/*      className="file-input d-none"*/}
      {/*      ref={fileInputRef}*/}
      {/*      type="file"*/}
      {/*      accept="image/*"*/}
      {/*      multiple={true}*/}
      {/*    />*/}
      {/*  </React.Fragment>*/}
      {/*)}*/}

      {showGifPicker && (
        <GifPicker
          rootRef={gifPickerRef}
          pureStyle={true}
          gifImagesStyle={GifImagesStyle}
          shGif={true}
          changeState={(gifState) => setShowGifPicker(gifState!)}
          fallback={(e) =>
            isCurrentUser
              ? messageServiceInstance?.sendDirectMessage(receiverPubKey!, e)
              : messageServiceInstance?.sendPublicMessage(currentChannel, e, [], "")
          }
        />
      )}

      <Form
        onSubmit={(e: React.FormEvent) => {
          e.preventDefault();
          e.stopPropagation();
          sendMessage();
        }}
        className="w-full flex items-center gap-2 p-2"
      >
        <Dropdown>
          <DropdownToggle>
            <Button className="mr-2" noPadding={true} icon={attachFileSvg} appearance="gray-link" />
          </DropdownToggle>
          <DropdownMenu align="top">
            <DropdownItemWithIcon
              icon={gifIcon}
              label="GIF"
              onClick={() => setShowGifPicker(true)}
            />
            <DropdownItemWithIcon
              icon={chatBoxImageSvg}
              label="Image"
              onClick={() => fileInputRef.current?.click()}
            />
          </DropdownMenu>
        </Dropdown>
        <FormControl
          value={message}
          autoFocus={true}
          onChange={(e) => {
            setMessage(e.target.value);
            setIsMessageText(e.target.value.length !== 0);
          }}
          required={true}
          type="text"
          placeholder={_t("chat.start-chat-placeholder")}
          autoComplete="off"
          disabled={isDisabled}
        />
        <div className="flex items-center px-2 h-full gap-3">
          <div className="relative">
            <Button
              ref={emojiButtonRef}
              noPadding={true}
              appearance="gray-link"
              disabled={isDisabled}
              icon={emoticonHappyOutlineSvg}
            />
            <EmojiPicker
              position="top"
              anchor={emojiButtonRef.current}
              onSelect={(e: string) => setMessage((prevMessage) => prevMessage + e)}
            />
          </div>
          <Button
            noPadding={true}
            appearance="gray-link"
            icon={messageSendSvg}
            disabled={isDisabled}
            onClick={sendMessage}
          />
        </div>
      </Form>
    </div>
  );
}

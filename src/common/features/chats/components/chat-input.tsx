import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { EmojiPicker } from "../../../components/emoji-picker";
import {
  attachFileSvg,
  chatBoxImageSvg,
  emoticonHappyOutlineSvg,
  gifIcon,
  messageSendSvg
} from "../../../img/svg";
import { CHAT_FILE_CONTENT_TYPES, GifImagesStyle } from "./chat-popup/chat-constants";
import { _t } from "../../../i18n";
import { ChatContext } from "../chat-context-provider";
import { Form } from "@ui/form";
import { FormControl } from "@ui/input";
import { Button } from "@ui/button";
import { useChatFileUpload, useSendMessage } from "../mutations";
import { Dropdown, DropdownItemWithIcon, DropdownMenu, DropdownToggle } from "@ui/dropdown";
import GifPicker from "../../../components/gif-picker";
import useClickAway from "react-use/lib/useClickAway";
import { Spinner } from "@ui/spinner";
import { useChannelsQuery } from "../queries";
import { Channel } from "../nostr";

interface Props {
  currentChannel?: Channel;
  currentUser?: string;
}

export default function ChatInput({ currentChannel, currentUser }: Props) {
  useChannelsQuery();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const emojiButtonRef = useRef<HTMLButtonElement | null>(null);
  const gifPickerRef = useRef<HTMLDivElement | null>(null);

  const { isActiveUserRemoved, receiverPubKey } = useContext(ChatContext);

  const [message, setMessage] = useState("");
  const [showGifPicker, setShowGifPicker] = useState(false);

  const { mutateAsync: upload } = useChatFileUpload(setMessage);
  const { mutateAsync: sendMessage, isLoading: isSendMessageLoading } = useSendMessage(
    currentChannel,
    currentUser,
    () => {
      setMessage("");
    }
  );

  const isCurrentUser = useMemo(() => !!currentUser, [currentUser]);
  const isCommunity = useMemo(() => !!currentChannel, [currentChannel]);

  const isDisabled = useMemo(
    () => (isCurrentUser && !receiverPubKey) || isActiveUserRemoved,
    [isCurrentUser, receiverPubKey, isActiveUserRemoved]
  );

  useClickAway(gifPickerRef, () => setShowGifPicker(false));

  useEffect(() => {
    if (!isCurrentUser && !isCommunity) {
      setMessage("");
    }
  }, [isCommunity, isCurrentUser]);

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

    files.forEach((file) => upload(file));

    // reset input
    e.target.value = "";
  };

  return (
    <div className="chat-input">
      {showGifPicker && (
        <GifPicker
          rootRef={gifPickerRef}
          pureStyle={true}
          gifImagesStyle={GifImagesStyle}
          shGif={true}
          changeState={(gifState) => setShowGifPicker(gifState!)}
          fallback={(e) => sendMessage(e)}
        />
      )}
      <input
        onChange={fileInputChanged}
        className="hidden"
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={true}
      />

      <Form
        onSubmit={(e: React.FormEvent) => {
          e.preventDefault();
          e.stopPropagation();
          sendMessage(message);
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
              label="Upload image"
              onClick={() => fileInputRef.current?.click()}
            />
          </DropdownMenu>
        </Dropdown>
        <FormControl
          value={message}
          autoFocus={true}
          onChange={(e) => {
            setMessage(e.target.value);
          }}
          required={true}
          type="text"
          placeholder={_t("chat.start-chat-placeholder")}
          autoComplete="off"
          disabled={isDisabled || isSendMessageLoading}
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
            icon={isSendMessageLoading ? <Spinner className="w-3.5 h-3.5" /> : messageSendSvg}
            disabled={isDisabled || isSendMessageLoading}
            onClick={() => sendMessage(message)}
          />
        </div>
      </Form>
    </div>
  );
}

import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { EmojiPicker } from "../../../components/emoji-picker";
import {
  attachFileSvg,
  chatBoxImageSvg,
  emoticonHappyOutlineSvg,
  gifIcon,
  imageSvg,
  informationOutlineSvg,
  messageSendSvg
} from "../../../img/svg";
import { GifImagesStyle } from "./chat-popup/chat-constants";
import { _t } from "../../../i18n";
import { Form } from "@ui/form";
import { FormControl } from "@ui/input";
import { Button } from "@ui/button";
import { Dropdown, DropdownItemWithIcon, DropdownMenu, DropdownToggle } from "@ui/dropdown";
import GifPicker from "../../../components/gif-picker";
import useClickAway from "react-use/lib/useClickAway";
import { Spinner } from "@ui/spinner";
import {
  Channel,
  ChatContext,
  DirectContact,
  useChannelsQuery,
  useGetPublicKeysQuery,
  useSendMessage
} from "@ecency/ns-query";
import Tooltip from "../../../components/tooltip";
import { ChatInputFiles } from "./chat-input-files";
import Gallery from "../../../components/gallery";
import useWindowSize from "react-use/lib/useWindowSize";

interface Props {
  currentChannel?: Channel;
  currentContact?: DirectContact;
}

export default function ChatInput({ currentChannel, currentContact }: Props) {
  const size = useWindowSize();
  useChannelsQuery();

  const inputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const emojiButtonRef = useRef<HTMLButtonElement | null>(null);
  const gifPickerRef = useRef<HTMLDivElement | null>(null);

  const { receiverPubKey } = useContext(ChatContext);

  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFileLinks, setUploadedFileLinks] = useState<string[]>([]);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [showGallery, setShowGallery] = useState(false);

  const { data: contactKeys, isLoading: isContactKeysLoading } = useGetPublicKeysQuery(
    currentContact?.name
  );
  const { mutateAsync: sendMessage, isLoading: isSendMessageLoading } = useSendMessage(
    currentChannel,
    currentContact,
    () => {
      setMessage("");
    }
  );

  const isCurrentUser = useMemo(() => !!currentContact, [currentContact]);
  const isCommunity = useMemo(() => !!currentChannel, [currentChannel]);

  const isDisabled = useMemo(
    () => isCurrentUser && !receiverPubKey,
    [isCurrentUser, receiverPubKey]
  );
  const isJoined = useMemo(() => (contactKeys ? contactKeys.pubkey : false), [contactKeys]);
  const isReadOnly = useMemo(
    () => (contactKeys && isJoined ? currentContact?.pubkey !== contactKeys.pubkey : false),
    [contactKeys, currentContact, isJoined]
  );
  const isFilesUploading = useMemo(
    () => (files.length > 0 ? files.length !== uploadedFileLinks.length : false),
    [files, uploadedFileLinks]
  );

  useClickAway(gifPickerRef, () => setShowGifPicker(false));

  useEffect(() => {
    if (!isCurrentUser && !isCommunity) {
      setMessage("");
    }
  }, [isCommunity, isCurrentUser]);

  const submit = async () => {
    if (isDisabled || isSendMessageLoading || isFilesUploading || !message) {
      return;
    }
    const nextMessage = buildImages(message);
    await sendMessage(nextMessage);
    setFiles([]);
    setUploadedFileLinks([]);
    // Re-focus to input because when DOM changes and input position changes then
    //  focus is lost
    setTimeout(() => inputRef.current?.focus(), 1);
  };

  const buildImages = (message: string) =>
    `${message}${uploadedFileLinks.map((link) => `\n![](${link})`)}`;

  return (
    <div className="chat-input">
      {isReadOnly ? (
        <div className="p-5 text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-3">
          {_t("chat.read-only")}
          <Tooltip content={_t("chat.why-read-only")}>
            <Button icon={informationOutlineSvg} size="xxs" appearance="gray-link" />
          </Tooltip>
        </div>
      ) : (
        <>
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
          {(files.length > 0 || uploadedFileLinks.length > 0) && !showGifPicker && (
            <ChatInputFiles
              files={files}
              setFiles={setFiles}
              uploadedFileLinks={uploadedFileLinks}
              setUploadedFileLinks={setUploadedFileLinks}
            />
          )}
          {showGallery && (
            <Gallery
              onHide={() => setShowGallery(false)}
              onPick={(e) => {
                setUploadedFileLinks((links) => [...links, e]);
                setShowGallery(false);
              }}
            />
          )}
          <input
            onChange={(e) => setFiles([...(e.target.files ?? [])])}
            className="hidden"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple={true}
          />

          <Form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              submit();
            }}
            className="w-full flex items-center gap-2 p-1.5"
          >
            <Dropdown>
              <DropdownToggle>
                <Button
                  disabled={isDisabled || isSendMessageLoading}
                  className="mr-2"
                  noPadding={true}
                  icon={attachFileSvg}
                  appearance="gray-link"
                />
              </DropdownToggle>
              <DropdownMenu align="top">
                <DropdownItemWithIcon
                  icon={gifIcon}
                  label="GIF"
                  onClick={() => setShowGifPicker(true)}
                />
                <DropdownItemWithIcon
                  icon={chatBoxImageSvg}
                  label={_t("chat.upload-image")}
                  onClick={() => fileInputRef.current?.click()}
                />
                <DropdownItemWithIcon
                  icon={imageSvg}
                  label={_t("user-nav.gallery")}
                  onClick={() => setShowGallery(true)}
                />
              </DropdownMenu>
            </Dropdown>
            <FormControl
              ref={inputRef}
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
                {size.width > 768 && (
                  <Button
                    ref={emojiButtonRef}
                    noPadding={true}
                    appearance="gray-link"
                    disabled={isDisabled}
                    icon={emoticonHappyOutlineSvg}
                  />
                )}
                <EmojiPicker
                  isDisabled={isDisabled || isSendMessageLoading}
                  position="top"
                  anchor={emojiButtonRef.current}
                  onSelect={(e: string) => setMessage((prevMessage) => prevMessage + e)}
                />
              </div>
              <Button
                noPadding={true}
                appearance="gray-link"
                icon={isSendMessageLoading ? <Spinner className="w-3.5 h-3.5" /> : messageSendSvg}
                disabled={isDisabled || isSendMessageLoading || isFilesUploading}
                onClick={() => submit()}
              />
            </div>
          </Form>
        </>
      )}
    </div>
  );
}

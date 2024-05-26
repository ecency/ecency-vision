"use client";

import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  attachFileSvg,
  chatBoxImageSvg,
  emoticonHappyOutlineSvg,
  gifIcon,
  imageSvg,
  informationOutlineSvg,
  messageSendSvg
} from "@/assets/img/svg";
import { GifImagesStyle } from "../chat-popup/chat-constants";
import { Form } from "@ui/form";
import { FormControl } from "@ui/input";
import { Button } from "@ui/button";
import { Dropdown, DropdownItemWithIcon, DropdownMenu, DropdownToggle } from "@ui/dropdown";
import useClickAway from "react-use/lib/useClickAway";
import { Spinner } from "@ui/spinner";
import { Channel, ChatContext, DirectContact, useGetPublicKeysQuery } from "@ecency/ns-query";
import { ChatInputFiles } from "../chat-input-files";
import useWindowSize from "react-use/lib/useWindowSize";
import "./_chats.scss";
import { ChatReplyDirectMessage, ChatReplyPublicMessage } from "../reply-to-messages";
import { useChatInputSubmit } from "./hooks";
import i18next from "i18next";
import { EmojiPicker, Tooltip } from "@/features/ui";
import { GifPicker } from "@ui/gif-picker";
import { GalleryDialog } from "@/features/shared/gallery";
import { useGlobalStore } from "@/core/global-store";

interface Props {
  currentChannel?: Channel;
  currentContact?: DirectContact;
}

export function ChatInput({ currentChannel, currentContact }: Props) {
  const size = useWindowSize();
  const isMobile = useGlobalStore((state) => state.isMobile);

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

  const isCurrentUser = useMemo(() => !!currentContact, [currentContact]);
  const isCommunity = useMemo(() => !!currentChannel, [currentChannel]);

  const isDisabled = useMemo(
    () => isCurrentUser && !receiverPubKey,
    [isCurrentUser, receiverPubKey]
  );
  const isJoined = useMemo(() => (contactKeys ? contactKeys.pubkey : false), [contactKeys]);
  const isReadOnly = useMemo(
    () => (contactKeys && isJoined ? currentContact?.pubkey !== contactKeys.pubkey : false),
    [contactKeys, isJoined, currentContact?.pubkey]
  );
  const isFilesUploading = useMemo(
    () => (files.length > 0 ? files.length !== uploadedFileLinks.length : false),
    [files.length, uploadedFileLinks.length]
  );

  useClickAway(gifPickerRef, () => setShowGifPicker(false));

  useEffect(() => {
    if (!isCurrentUser && !isCommunity) {
      setMessage("");
    }
  }, [isCommunity, isCurrentUser]);

  const { submit, sendMessage, isSendMessageLoading } = useChatInputSubmit({
    currentChannel,
    currentContact,
    inputRef,
    message,
    setMessage,
    uploadedFileLinks,
    setUploadedFileLinks,
    setFiles,
    isDisabled,
    isFilesUploading
  });

  // @ts-ignore
  return (
    <div className="chat-input">
      {isReadOnly ? (
        <div className="p-5 text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-3">
          {i18next.t("chat.read-only")}
          <Tooltip content={i18next.t("chat.why-read-only")}>
            <Button icon={informationOutlineSvg} size="xxs" appearance="gray-link" />
          </Tooltip>
        </div>
      ) : (
        <>
          {currentContact && <ChatReplyDirectMessage currentContact={currentContact} />}
          {currentChannel && <ChatReplyPublicMessage currentChannel={currentChannel} />}
          {showGifPicker && (
            <GifPicker
              rootRef={gifPickerRef}
              pureStyle={true}
              gifImagesStyle={GifImagesStyle}
              shGif={true}
              changeState={(gifState) => setShowGifPicker(gifState!)}
              fallback={(e) => sendMessage({ message: e })}
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
          <GalleryDialog
            onPick={(e) => {
              setUploadedFileLinks((links) => [...links, e]);
              setShowGallery(false);
            }}
            setShow={(v) => setShowGallery(v)}
            show={showGallery}
          />
          <input
            onChange={(e) => setFiles(e.target.files ? Array.from(e.target.files) : [])}
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
                  label={i18next.t("chat.upload-image")}
                  onClick={() => fileInputRef.current?.click()}
                />
                <DropdownItemWithIcon
                  icon={imageSvg}
                  label={i18next.t("user-nav.gallery")}
                  onClick={() => setShowGallery(true)}
                />
              </DropdownMenu>
            </Dropdown>
            <FormControl
              ref={inputRef}
              value={message}
              autoFocus={!isMobile}
              onChange={(e) => {
                setMessage(e.target.value);
              }}
              required={true}
              type="text"
              placeholder={i18next.t("chat.start-chat-placeholder")}
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

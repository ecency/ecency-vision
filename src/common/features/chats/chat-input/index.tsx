import React, { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { Channel } from "../../../../managers/message-manager-types";
import { EmojiPickerStyleProps } from "../types";
import ClickAwayListener from "../../../components/clickaway-listener";
import EmojiPicker from "../../../components/emoji-picker/index-old";
// import { EmojiPicker } from "../../emoji-picker";
import GifPicker from "../../../components/gif-picker";
import { error } from "../../../components/feedback";
import Tooltip from "../../../components/tooltip";

import {
  chatBoxImageSvg,
  emoticonHappyOutlineSvg,
  gifIcon,
  messageSendSvg
} from "../../../img/svg";
import { CHAT_FILE_CONTENT_TYPES, GifImagesStyle, UPLOADING } from "../chat-popup/chat-constants";
import { classNameObject } from "../../../helper/class-name-object";

import { useMappedStore } from "../../../store/use-mapped-store";
import { _t } from "../../../i18n";
import { getAccessToken } from "../../../helper/user-token";
import { uploadImage } from "../../../api/misc";
import { addImage } from "../../../api/private-api";

import "./index.scss";
import { ChatContext } from "../chat-context-provider";
import { Form } from "@ui/form";
import { FormControl, InputGroup } from "@ui/input";
import { Button } from "@ui/button";

interface Props {
  isCurrentUser: boolean;
  isCommunity: boolean;
  currentChannel: Channel;
  currentUser: string;
  isCurrentUserJoined: boolean;
  emojiPickerStyles: EmojiPickerStyleProps;
  gifPickerStyle: EmojiPickerStyleProps;
}

export default function ChatInput(props: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { global, activeUser, chat } = useMappedStore();

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [message, setMessage] = useState("");
  const [shGif, setShGif] = useState(false);
  const [isMessageText, setIsMessageText] = useState(false);

  const { messageServiceInstance, isActveUserRemoved, receiverPubKey } = useContext(ChatContext);

  const {
    isCommunity,
    isCurrentUser,
    currentChannel,
    currentUser,
    isCurrentUserJoined,
    emojiPickerStyles,
    gifPickerStyle
  } = props;

  useEffect(() => {
    if (!isCurrentUser && !isCommunity) {
      setMessage("");
    }
  }, [isCommunity, isCurrentUser]);

  const handleEmojiSelection = (emoji: string) => {
    setMessage((prevMessage) => prevMessage + emoji);
  };

  const toggleGif = (e?: React.MouseEvent<HTMLElement>) => {
    if (e) {
      e.stopPropagation();
    }
    setShGif(!shGif);
  };

  const handleGifSelection = (gif: string) => {
    isCurrentUser
      ? messageServiceInstance?.sendDirectMessage(receiverPubKey!, gif)
      : messageServiceInstance?.sendPublicMessage(currentChannel, gif, [], "");
  };

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

    const { isElectron } = global;

    if (files.length > 0) {
      e.stopPropagation();
      e.preventDefault();
    }

    if (files.length > 1 && isElectron) {
      let isWindows = process.platform === "win32";
      if (isWindows) {
        files = files.reverse();
      }
    }

    files.forEach((file) => upload(file));

    // reset input
    e.target.value = "";
  };
  const upload = async (file: File) => {
    const username = activeUser?.username!;

    const tempImgTag = `![Uploading ${file.name} #${Math.floor(Math.random() * 99)}]()\n\n`;

    setMessage(tempImgTag);

    let imageUrl: string;
    try {
      let token = getAccessToken(username);
      if (token) {
        const resp = await uploadImage(file, token);
        imageUrl = resp.url;

        if (global.usePrivate && imageUrl.length > 0) {
          addImage(username, imageUrl).then();
        }

        const imgTag = imageUrl.length > 0 && `![](${imageUrl})\n\n`;

        imgTag && setMessage(imgTag);
        setIsMessageText(true);
      } else {
        error(_t("editor-toolbar.image-error-cache"));
      }
    } catch (e) {
      if (axios.isAxiosError(e) && e.response?.status === 413) {
        error(_t("editor-toolbar.image-error-size"));
      } else {
        error(_t("editor-toolbar.image-error"));
      }
      return;
    }
  };

  return (
    <>
      <div
        className={`chat ${
          isActveUserRemoved || !isCurrentUserJoined || (isCurrentUser && !receiverPubKey)
            ? "disable"
            : ""
        }`}
      >
        <ClickAwayListener onClickAway={() => showEmojiPicker && setShowEmojiPicker(false)}>
          <div className="chatbox-emoji-picker">
            <div className="chatbox-emoji">
              <Tooltip content={_t("editor-toolbar.emoji")}>
                <div className="emoji-icon" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                  {emoticonHappyOutlineSvg}
                </div>
              </Tooltip>
              {showEmojiPicker && (
                <EmojiPicker
                  style={emojiPickerStyles}
                  fallback={(e) => {
                    handleEmojiSelection(e);
                  }}
                />
              )}
            </div>
          </div>
        </ClickAwayListener>

        {/* <div className="chatbox-emoji-picker" id="chatbox-emoji-picker" role="none">
          <div className="chatbox-emoji">
            <Tooltip content={_t("editor-toolbar.emoji")}>
              <div className="emoji-icon">{emoticonHappyOutlineSvg}</div>
            </Tooltip>
            {showEmojiPicker && isMounted && (
              <EmojiPicker
                anchor={document.querySelector("#chatbox-emoji-picker")!!}
                onSelect={(e) => handleEmojiSelection(e)}
              />
            )}
          </div>
        </div> */}
        {message.length === 0 && (
          <React.Fragment>
            <ClickAwayListener onClickAway={() => shGif && setShGif(false)}>
              <div className="chatbox-emoji-picker">
                <div className="chatbox-emoji">
                  <Tooltip content={_t("Gif")}>
                    <div className="emoji-icon" onClick={toggleGif}>
                      {" "}
                      {gifIcon}
                    </div>
                  </Tooltip>
                  {shGif && (
                    <GifPicker
                      style={gifPickerStyle}
                      gifImagesStyle={GifImagesStyle}
                      shGif={true}
                      changeState={(gifState) => {
                        setShGif(gifState!);
                      }}
                      fallback={(e) => {
                        handleGifSelection(e);
                      }}
                    />
                  )}
                </div>
              </div>
            </ClickAwayListener>

            <Tooltip content={"Image"}>
              <div
                className="chatbox-image"
                onClick={(e: React.MouseEvent<HTMLElement>) => {
                  e.stopPropagation();
                  const el = fileInputRef.current;
                  if (el) el.click();
                }}
              >
                <div className="chatbox-image-icon">{chatBoxImageSvg}</div>
              </div>
            </Tooltip>

            <input
              onChange={fileInputChanged}
              className="file-input d-none"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple={true}
            />
          </React.Fragment>
        )}

        <Form
          onSubmit={(e: React.FormEvent) => {
            e.preventDefault();
            e.stopPropagation();
            sendMessage();
          }}
          className="w-full"
        >
          <InputGroup
            className="chat-input-group"
            append={
              <Button
                className={classNameObject({
                  "msg-svg": true,
                  active: isMessageText || message.length !== 0
                })}
                icon={messageSendSvg}
                onClick={sendMessage}
              />
            }
          >
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
              className="chat-input"
              disabled={(isCurrentUser && !receiverPubKey) || isActveUserRemoved}
            />
          </InputGroup>
        </Form>
      </div>
    </>
  );
}

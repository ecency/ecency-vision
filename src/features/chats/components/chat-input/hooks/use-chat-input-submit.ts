import { MutableRefObject, useCallback } from "react";
import { usePersistentReplyToMessage } from "../../../hooks";
import { Channel, DirectContact, useSendMessage } from "@ecency/ns-query";

interface Props {
  message: string;
  isDisabled: boolean;
  isFilesUploading: boolean;
  currentChannel?: Channel;
  currentContact?: DirectContact;
  setMessage: (message: string) => void;
  setFiles: (files: File[]) => void;
  setUploadedFileLinks: (links: string[]) => void;
  uploadedFileLinks: string[];
  inputRef: MutableRefObject<HTMLInputElement | null>;
}

export function useChatInputSubmit({
  message,
  isFilesUploading,
  isDisabled,
  currentChannel,
  currentContact,
  setMessage,
  setFiles,
  setUploadedFileLinks,
  uploadedFileLinks,
  inputRef
}: Props) {
  const [reply, _, clearReply] = usePersistentReplyToMessage(currentChannel, currentContact);

  const { mutateAsync: sendMessage, isLoading: isSendMessageLoading } = useSendMessage(
    currentChannel,
    currentContact,
    () => {
      setMessage("");
    }
  );

  const submit = useCallback(async () => {
    const nextMessage = buildImages(message);

    if (isDisabled || isSendMessageLoading || isFilesUploading || !nextMessage) {
      return;
    }

    const request: Parameters<typeof sendMessage>[0] = { message: nextMessage };
    if (reply) {
      request.parentMessage = reply;
    }

    await sendMessage(request);

    clearReply();
    setFiles([]);
    setUploadedFileLinks([]);
    // Re-focus to input because when DOM changes and input position changes then
    //  focus is lost
    setTimeout(() => inputRef.current?.focus(), 1);
  }, [message, isDisabled, isSendMessageLoading, isFilesUploading, sendMessage, reply, clearReply]);

  const buildImages = (message: string) =>
    `${message}${uploadedFileLinks.map((link) => `\n![](${link})`)}`;

  return { submit, sendMessage, isSendMessageLoading } as const;
}

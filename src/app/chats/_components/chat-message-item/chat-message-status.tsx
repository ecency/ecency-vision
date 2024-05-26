import { format } from "date-fns";
import { Spinner } from "@ui/spinner";
import { Button } from "@ui/button";
import React from "react";
import { Channel, DirectContact, Message, useResendMessage } from "@ecency/ns-query";
import { failedMessageSvg } from "@/assets/img/svg";
import i18next from "i18next";

interface Props {
  message: Message;
  showDate?: boolean;
  currentChannel?: Channel;
  currentContact?: DirectContact;
}

export function ChatMessageStatus({ message, showDate, currentContact, currentChannel }: Props) {
  const { mutateAsync: resendMessage } = useResendMessage(currentChannel, currentContact);

  return (
    <>
      {message.sent == 1 && showDate && (
        <div className="text-gray-600 dark:text-gray-400 text-xs px-2">
          {format(new Date(message.created * 1000), "HH:mm")}
        </div>
      )}
      {message.sent === 0 && <Spinner className="w-3 h-3 mx-2" />}
      {message.sent === 2 && (
        <div className="flex items-center gap-1">
          {failedMessageSvg}
          <Button
            size="xs"
            className="text-xs"
            appearance="link"
            noPadding={true}
            onClick={() => resendMessage(message)}
          >
            {i18next.t("g.resend")}
          </Button>
        </div>
      )}
    </>
  );
}

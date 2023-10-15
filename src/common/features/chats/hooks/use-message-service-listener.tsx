import { useEffect, useState } from "react";
import { Channel } from "../../../../managers/message-manager-types";
import MessageService from "../../../helper/message-service";

export const useMessageServiceListener = (
  messageServiceReady: boolean,
  messageService: MessageService | undefined,
  chatChannels: Channel[]
) => {
  const [since, setSince] = useState(0);

  useEffect(() => {
    if (!messageServiceReady) return;

    const timer = setTimeout(
      () => {
        messageService?.listen(
          chatChannels.map((x) => x.id),
          Math.floor((since || Date.now()) / 1000)
        );
        setSince(Date.now());
      },
      since === 0 ? 500 : 10000
    );

    return () => {
      clearTimeout(timer);
    };
  }, [since, messageServiceReady, messageService, chatChannels]);
};

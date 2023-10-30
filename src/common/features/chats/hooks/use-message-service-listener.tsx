import { useEffect, useState } from "react";
import MessageService from "../../../helper/message-service";
import { useMappedStore } from "../../../store/use-mapped-store";

export const useMessageServiceListener = (
  messageServiceReady: boolean,
  messageService: MessageService | undefined
) => {
  const {
    chat: { channels }
  } = useMappedStore();

  const [since, setSince] = useState(0);

  useEffect(() => {
    if (!messageServiceReady) return;

    const timer = setTimeout(
      () => {
        messageService?.listen(
          channels.map((x) => x.id),
          Math.floor((since || Date.now()) / 1000)
        );
        setSince(Date.now());
      },
      since === 0 ? 500 : 10000
    );

    return () => {
      clearTimeout(timer);
    };
  }, [since, messageServiceReady, messageService, channels]);
};

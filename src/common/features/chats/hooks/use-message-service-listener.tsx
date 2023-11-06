import { useEffect, useState } from "react";
import MessageService from "../../../helper/message-service";
import { useChannelsQuery } from "../queries";

export const useMessageServiceListener = (
  messageServiceReady: boolean,
  messageService: MessageService | undefined
) => {
  const { data: channels } = useChannelsQuery();

  const [since, setSince] = useState(0);

  useEffect(() => {
    if (!messageServiceReady) return;

    const timer = setTimeout(
      () => {
        if (!channels || channels.length === 0) {
          return;
        }

        // TODO THIS THING
        messageService?.listen(
          channels?.map((x) => x.id),
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

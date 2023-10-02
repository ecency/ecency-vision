import { useEffect, useRef, useState } from "react";
import { Channel } from "../../../../managers/message-manager-types";
import MessageService from "../../../helper/message-service";

function useMessageServiceListener(
  messageServiceReady: boolean,
  messageService: MessageService | undefined,
  chatChannels: Channel[]
) {
  const [since, setSince] = useState(0);
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!messageServiceReady) return;

    timerRef.current = window.setTimeout(
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
      clearTimeout(timerRef.current);
    };
  }, [since, messageServiceReady, messageService, chatChannels, setSince]);
}

export default useMessageServiceListener;

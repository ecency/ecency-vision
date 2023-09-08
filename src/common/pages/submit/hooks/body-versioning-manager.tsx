import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useState
} from "react";
import md5 from "js-md5";

const BUFFER_SIZE = 100;

interface QueueItem {
  value: string;
  hash: string;
  metadata: Record<string, unknown>;
  status: "restored" | "new";
}

export const BodyContext = createContext<{
  body: string;
  activeQueueItem?: QueueItem;
  setBody: (value: string) => void;
  updateMetadata: (value: Record<string, unknown>) => void;
}>({
  body: "",
  setBody: () => {},
  updateMetadata: () => {}
});

export function useBodyVersioningManager(onVersionChange?: (value: QueueItem) => void) {
  const context = useContext(BodyContext);

  useEffect(() => {
    if (context.activeQueueItem?.status === "restored") {
      onVersionChange?.(context.activeQueueItem);
    }
  }, [context.activeQueueItem]);

  return context;
}

/**
 * Body versioning manager is a queue of all body changes
 *
 * Each queue item could contain additional metadata object
 * Each body updating causes queue updating but if queue contains the same state then it will be restored
 *
 * Use cases:
 * 1. If user added the video which contains metadata information and has removed it wrongly
 *    then he will do UNDO operation. In that case We may restore video metadata easily from the queue
 *
 * @note Active user changing causes queue clearing due to security reasons
 * @note Active queue item is the last queue item
 */
export function BodyVersioningManager({ children }: PropsWithChildren<unknown>) {
  const [rawBody, setRawBody] = useState("");

  const [historyQueue, setHistoryQueue] = useState<QueueItem[]>([]);
  const activeQueueItem = useRef<QueueItem>({
    value: "",
    hash: "",
    metadata: {},
    status: "new"
  });

  useEffect(() => {
    const hash = md5(rawBody);
    const existingState = historyQueue.find((x) => x.hash === hash);

    const nextItem: QueueItem = {
      value: rawBody,
      hash,
      metadata: activeQueueItem.current.metadata,
      status: "new"
    };
    if (existingState) {
      nextItem.status = "restored";
      nextItem.metadata = JSON.parse(JSON.stringify(existingState.metadata));
    }
    setHistoryQueue([...historyQueue, nextItem]);
    activeQueueItem.current = nextItem;
  }, [rawBody]);

  useEffect(() => {
    if (historyQueue.length > BUFFER_SIZE) {
      const temp = [...historyQueue];
      temp.shift();
      setHistoryQueue(temp);
    }
  }, [historyQueue]);

  const updateMetadata = (metadata: Record<string, unknown>) => {
    activeQueueItem.current = {
      ...activeQueueItem.current,
      metadata: {
        ...activeQueueItem.current.metadata,
        ...metadata
      }
    };
  };

  return (
    <BodyContext.Provider
      value={{
        body: rawBody,
        activeQueueItem: activeQueueItem.current,
        setBody: setRawBody,
        updateMetadata
      }}
    >
      {children}
    </BodyContext.Provider>
  );
}

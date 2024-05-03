import React, { createContext, PropsWithChildren } from "react";
import { PollSnapshot } from "../../../features/polls";
import useLocalStorage from "react-use/lib/useLocalStorage";
import { PREFIX } from "../../../util/local-storage";

export const PollsContext = createContext<{
  activePoll?: PollSnapshot;
  setActivePoll: (v: PollSnapshot | undefined) => void;
  clearActivePoll: () => void;
}>({
  activePoll: undefined,
  setActivePoll: () => {},
  clearActivePoll: () => {}
});

export function PollsManager(props: PropsWithChildren<unknown>) {
  const [activePoll, setActivePoll, clearActivePoll] = useLocalStorage<PollSnapshot | undefined>(
    PREFIX + "_sa_pll",
    undefined,
    {
      raw: false,
      deserializer: (value) => {
        if (value) {
          const parsedInstance = JSON.parse(value) as PollSnapshot;
          parsedInstance.endTime = new Date(parsedInstance.endTime);
          return parsedInstance;
        }
        return undefined;
      },
      serializer: (value) => (value ? JSON.stringify(value) : "")
    }
  );

  return (
    <PollsContext.Provider value={{ activePoll, setActivePoll, clearActivePoll }}>
      {props.children}
    </PollsContext.Provider>
  );
}

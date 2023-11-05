import { useMessageListenerQuery } from "./message-listener-query";
import { ChatQueries } from "./queries";
import { MessageEvents } from "../../../helper/message-service";
import { Channel } from "../managers/message-manager-types";

export function useChannelsQuery() {
  console.log("starting");

  useMessageListenerQuery<Channel[], ChatQueries[]>(
    [ChatQueries.CHANNELS],
    MessageEvents.ChannelCreation,
    (data, nextData, resolver) => {
      console.log(nextData);
      resolver([...data, ...nextData.filter((ch) => !data.some((dCh) => ch.id === dCh.id))]);
    },
    {
      initialData: []
    }
  );

  useMessageListenerQuery<Channel[], ChatQueries[]>(
    [ChatQueries.CHANNELS],
    MessageEvents.ChannelUpdate,
    (data, nextData, resolver) => {
      console.log(nextData);
      resolver([...data, ...nextData.filter((ch) => !data.some((dCh) => ch.id === dCh.id))]);
    },
    {
      initialData: []
    }
  );

  useMessageListenerQuery<Channel[], ChatQueries[]>(
    [ChatQueries.CHANNELS],
    MessageEvents.LeftChannelList,
    (data, nextData, resolver) => {
      console.log(nextData);
      resolver([...data, ...nextData.filter((ch) => !data.some((dCh) => ch.id === dCh.id))]);
    },
    {
      initialData: []
    }
  );
}

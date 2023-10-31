import { useMessageListenerQuery } from "./message-listener-query";
import { ChatQueries } from "./queries";
import { MessageEvents } from "../../../helper/message-service";
import { Profile } from "../managers/message-manager-types";

export function useChatProfilesQuery() {
  return useMessageListenerQuery<Profile[], ChatQueries[]>(
    [ChatQueries.PROFILES],
    MessageEvents.ProfileUpdate,
    (_, nextData, resolver) => {
      resolver(nextData);
    },
    {
      initialData: [],
      queryFn: () => []
    }
  );
}

import { PREFIX } from "../../../util/local-storage";
import { Channel, DirectContact, Message } from "@ecency/ns-query";
import { useSynchronizedLocalStorage } from "../../../util/use-synchronized-local-storage";

export function usePersistentReplyToMessage(
  currentChannel?: Channel,
  currentContact?: DirectContact
) {
  const [reply, setReply, clearReply] = useSynchronizedLocalStorage<Message>(
    PREFIX + "_chts_rpl_" + (currentChannel?.id ?? currentContact?.pubkey),
    undefined,
    {
      raw: false,
      deserializer: (v) => JSON.parse(v) as Message,
      serializer: (v) => JSON.stringify(v)
    }
  );

  return [reply, setReply, clearReply] as const;
}

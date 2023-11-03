import { useContext, useMemo } from "react";
import { ChatContext } from "../chat-context-provider";
import { MessageEvents } from "../../../helper/message-service";
import { useMessageListenerQuery } from "./message-listener-query";
import { ChatQueries } from "./queries";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DirectMessage, Message, PublicMessage } from "../managers/message-manager-types";
import { useDirectContactsQuery } from "./direct-contacts-query";
import isCommunity from "../../../helper/is-community";
import { useChatProfilesQuery } from "./chat-profiles-query";

export function useMessagesQuery(username?: string) {
  const { messageServiceInstance } = useContext(ChatContext);
  const queryClient = useQueryClient();

  const { data: directContacts } = useDirectContactsQuery();
  const { data: profiles } = useChatProfilesQuery();

  const hasContacts = useMemo(() => (directContacts?.length ?? 0) > 0, [directContacts]);

  // const checkDirectMessageSending = (peer: string, data: DirectMessage) => {
  //   setTimeout(() => {
  //     verifyDirectMessageSending(peer, data);
  //   }, 20000);
  // };
  //
  // const handleDirectMessageBeforeSent = (data: DirectMessage[]) => {
  //   data.map((m) => {
  //     const { peer, id } = m;
  //     setReplacedDirectMessagesBuffer((prevBuffer) => [...prevBuffer, id]);
  //     addDirectMessages(peer, m);
  //     checkDirectMessageSending(peer, m);
  //   });
  // };
  // });
  // const handlePublicMessageBeforeSent = (data: PublicMessage[]) => {
  //     data.map((m) => {
  //       const { id, root } = m;
  //       setReplacedPublicMessagesBuffer((prevBuffer) => [...prevBuffer, id]);
  //       addPublicMessage(root, m);
  //       checkPublicMessageSending(root, m);
  //     });
  //   };

  const updateQueries = (nextData: Message[] | undefined) => {
    let nextMessages: Message[] = [
      ...(queryClient.getQueryData<PublicMessage[]>([ChatQueries.MESSAGES]) ?? []),
      ...(nextData ?? [])
    ];

    directContacts?.forEach((contact) => {
      queryClient.setQueryData(
        [ChatQueries.MESSAGES, contact.name],
        nextMessages.filter((i) =>
          !isCommunity(contact.name) && "peer" in i
            ? i.peer === contact?.pubkey
            : i.root === contact?.pubkey
        ) ?? []
      );
      queryClient.invalidateQueries([ChatQueries.MESSAGES, contact.name]);
    });

    queryClient.setQueryData([ChatQueries.MESSAGES, "all"], nextMessages);
    queryClient.invalidateQueries([ChatQueries.MESSAGES, "all"]);
  };

  useMessageListenerQuery<Message[], ChatQueries[]>(
    [ChatQueries.BEFORE_DIRECT_MESSAGES_TEMP],
    MessageEvents.DirectMessageBeforeSent,
    (_, nextData, resolver) => {
      updateQueries(nextData);
      resolver(nextData);
    },
    {
      queryFn: () => [],
      enabled: hasContacts,
      initialData: []
    }
  );

  useMessageListenerQuery<DirectMessage[], ChatQueries[]>(
    [ChatQueries.AFTER_DIRECT_MESSAGES_TEMP],
    MessageEvents.DirectMessageAfterSent,
    (_, nextData, resolver) => {
      updateQueries(nextData);
      resolver(nextData);

      messageServiceInstance?.checkProfiles(nextData.map((x) => x.peer));
    },
    {
      queryFn: () => [],
      enabled: hasContacts,
      initialData: []
    }
  );

  useMessageListenerQuery<PublicMessage[], ChatQueries[]>(
    [ChatQueries.BEFORE_PUBLIC_MESSAGES_TEMP],
    MessageEvents.PublicMessageBeforeSent,
    (_, nextData, resolver) => {
      updateQueries(nextData);
      resolver(nextData);
    },
    {
      queryFn: () => [],
      enabled: hasContacts,
      initialData: []
    }
  );

  useMessageListenerQuery<PublicMessage[], ChatQueries[]>(
    [ChatQueries.AFTER_PUBLIC_MESSAGES_TEMP],
    MessageEvents.PublicMessageAfterSent,
    (_, nextData, resolver) => {
      updateQueries(nextData);
      resolver(nextData);

      const uniqueUsers = nextData
        .filter((message) => profiles?.find((profile) => profile.creator !== message.creator))
        .reduce<Set<string>>((acc, next) => acc.add(next.creator), new Set());
      messageServiceInstance?.loadProfiles(Array.from(uniqueUsers.values()));
    },
    {
      queryFn: () => [],
      enabled: hasContacts,
      initialData: []
    }
  );

  useMessageListenerQuery<PublicMessage[], ChatQueries[]>(
    [ChatQueries.PREVIOUS_PUBLIC_MESSAGES],
    MessageEvents.PreviousPublicMessages,
    (_, nextData, resolver) => {
      queryClient.setQueryData(
        [ChatQueries.MESSAGES, username],
        [
          ...(queryClient.getQueryData<PublicMessage[]>([ChatQueries.MESSAGES, username]) ?? []),
          ...(nextData ?? [])
        ]
      );
      queryClient.invalidateQueries([ChatQueries.MESSAGES, username]);

      resolver(nextData);
    },
    {
      queryFn: () => [],
      enabled: hasContacts,
      initialData: []
    }
  );

  return useQuery<Message[]>(
    [ChatQueries.MESSAGES, username],
    () => queryClient.getQueryData<Message[]>([ChatQueries.MESSAGES, username]) ?? [],
    {
      enabled: hasContacts,
      initialData: [],
      select: (data) => [...data]?.sort((a, b) => a.created - b.created)
    }
  );
}

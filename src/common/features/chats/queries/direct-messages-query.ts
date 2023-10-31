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

export function useDirectMessagesQuery(username?: string) {
  const { messageServiceInstance } = useContext(ChatContext);
  const queryClient = useQueryClient();

  const { data: directContacts } = useDirectContactsQuery();
  const { data: profiles } = useChatProfilesQuery();

  const contact = useMemo(
    () => directContacts?.find((i) => i.name === username),
    [directContacts, username]
  );
  const isPublic = useMemo(() => isCommunity(username ?? ""), [username]);

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

  // TODO: CONCACT MESSAGES AND CHECK FOR DUPLICATES
  const onBeforeSent = (nextData: Message[] | undefined) => {
    const nextMessages = [
      ...(queryClient.getQueryData<Message[]>([ChatQueries.DIRECT_MESSAGES, username]) ?? []),
      ...(nextData?.filter((i) =>
        !isPublic && "peer" in i ? i.peer === contact?.pubkey : i.root === contact?.pubkey
      ) ?? [])
    ];
    queryClient.setQueryData([ChatQueries.DIRECT_MESSAGES, username], nextMessages);
    queryClient.invalidateQueries([ChatQueries.DIRECT_MESSAGES, username]);
  };

  const onAfterSent = (nextData: Message[]) => {
    const nextMessages = [
      ...(queryClient.getQueryData<Message[]>([ChatQueries.DIRECT_MESSAGES, username]) ?? []),
      ...(nextData?.filter((i) =>
        !isPublic && "peer" in i ? i.peer === contact?.pubkey : i.root === contact?.pubkey
      ) ?? [])
    ];
    queryClient.setQueryData([ChatQueries.DIRECT_MESSAGES, username], nextMessages);
    queryClient.invalidateQueries([ChatQueries.DIRECT_MESSAGES, username]);
  };

  useMessageListenerQuery<Message[], ChatQueries[]>(
    [ChatQueries.BEFORE_DIRECT_MESSAGES_TEMP],
    MessageEvents.DirectMessageBeforeSent,
    (_, nextData, resolver) => {
      onBeforeSent(nextData);
      resolver(nextData);
    },
    {
      queryFn: () => [],
      enabled: !!contact,
      initialData: []
    }
  );

  useMessageListenerQuery<DirectMessage[], ChatQueries[]>(
    [ChatQueries.AFTER_DIRECT_MESSAGES_TEMP],
    MessageEvents.DirectMessageAfterSent,
    (_, nextData, resolver) => {
      onAfterSent(nextData);
      resolver(nextData);

      messageServiceInstance?.checkProfiles(nextData.map((x) => x.peer));
    },
    {
      queryFn: () => [],
      enabled: !!contact,
      initialData: []
    }
  );

  useMessageListenerQuery<PublicMessage[], ChatQueries[]>(
    [ChatQueries.BEFORE_PUBLIC_MESSAGES_TEMP],
    MessageEvents.PublicMessageBeforeSent,
    (_, nextData, resolver) => {
      onBeforeSent(nextData);
      resolver(nextData);
    },
    {
      queryFn: () => [],
      enabled: !!contact,
      initialData: []
    }
  );

  useMessageListenerQuery<PublicMessage[], ChatQueries[]>(
    [ChatQueries.AFTER_PUBLIC_MESSAGES_TEMP],
    MessageEvents.PublicMessageAfterSent,
    (_, nextData, resolver) => {
      onAfterSent(nextData);
      resolver(nextData);

      const uniqueUsers = nextData
        .filter((message) => profiles?.find((profile) => profile.creator !== message.creator))
        .reduce<Set<string>>((acc, next) => acc.add(next.creator), new Set());
      messageServiceInstance?.loadProfiles(Array.from(uniqueUsers.values()));
    },
    {
      queryFn: () => [],
      enabled: !!contact,
      initialData: []
    }
  );

  useMessageListenerQuery<PublicMessage[], ChatQueries[]>(
    [ChatQueries.PREVIOUS_PUBLIC_MESSAGES],
    MessageEvents.PreviousPublicMessages,
    (_, nextData, resolver) => {
      queryClient.setQueryData(
        [ChatQueries.DIRECT_MESSAGES, username],
        [
          ...(queryClient.getQueryData<PublicMessage[]>([ChatQueries.DIRECT_MESSAGES]) ?? []),
          ...(nextData ?? [])
        ]
      );

      resolver(nextData);
    },
    {
      queryFn: () => [],
      enabled: !!contact,
      initialData: []
    }
  );

  return useQuery<Message[]>(
    [ChatQueries.DIRECT_MESSAGES, username],
    () => queryClient.getQueryData<DirectMessage[]>([ChatQueries.DIRECT_MESSAGES, username]) ?? [],
    {
      enabled: !!contact,
      initialData: []
    }
  );
}

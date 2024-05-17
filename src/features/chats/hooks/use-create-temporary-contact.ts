import { useContext, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ChatContext, ChatQueries, DirectContact, useGetPublicKeysQuery } from "@ecency/ns-query";

export function useCreateTemporaryContact(selectedAccount: string) {
  const queryClient = useQueryClient();
  const { setReceiverPubKey, activeUsername } = useContext(ChatContext);

  const { data: contactKeys, isFetched, isError } = useGetPublicKeysQuery(selectedAccount);

  // Create temporary contact and select it when searching users
  // `not_joined_${selectedAccount}` – special constructor for creating a temporary contact
  return useEffect(() => {
    if (selectedAccount && (isFetched || isError)) {
      queryClient.setQueryData<DirectContact[]>(
        [ChatQueries.DIRECT_CONTACTS, activeUsername],
        [
          ...(queryClient.getQueryData<DirectContact[]>([
            ChatQueries.DIRECT_CONTACTS,
            activeUsername
          ]) ?? []),
          {
            name: selectedAccount,
            pubkey: contactKeys?.pubkey ?? `not_joined_${selectedAccount}`
          }
        ]
      );
      setReceiverPubKey(contactKeys?.pubkey ?? `not_joined_${selectedAccount}`);
    }
  }, [selectedAccount, contactKeys, isFetched, isError]);
}

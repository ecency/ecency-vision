import { useContext, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ChatContext, ChatQueries, DirectContact, getUserChatPublicKey } from "@ecency/ns-query";
import { useGetAccountFullQuery } from "../../../api/queries";

export function useCreateTemporaryContact(selectedAccount: string) {
  const queryClient = useQueryClient();
  const { setReceiverPubKey, activeUsername } = useContext(ChatContext);

  const { data: selectedAccountData } = useGetAccountFullQuery(selectedAccount);

  // Create temporary contact and select it when searching users
  // `not_joined_${selectedAccount}` – special constructor for creating a temporary contact
  return useEffect(() => {
    if (selectedAccount && selectedAccountData) {
      queryClient.setQueryData<DirectContact[]>(
        [ChatQueries.DIRECT_CONTACTS, activeUsername],
        [
          ...(queryClient.getQueryData<DirectContact[]>([
            ChatQueries.DIRECT_CONTACTS,
            activeUsername
          ]) ?? []),
          {
            name: selectedAccount,
            pubkey: getUserChatPublicKey(selectedAccountData) ?? `not_joined_${selectedAccount}`
          }
        ]
      );
      setReceiverPubKey(
        getUserChatPublicKey(selectedAccountData) ?? `not_joined_${selectedAccount}`
      );
    }
  }, [selectedAccount, selectedAccountData]);
}

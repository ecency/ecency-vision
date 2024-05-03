import { useContext, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ChatContext,
  ChatQueries,
  DirectContact,
  useDirectContactsQuery,
  useGetPublicKeysQuery
} from "@ecency/ns-query";
import useDebounce from "react-use/lib/useDebounce";
import { useLocation } from "react-router";

export function useCreateTemporaryContactFromParam() {
  const queryClient = useQueryClient();
  const { setReceiverPubKey, activeUsername } = useContext(ChatContext);
  const { search } = useLocation();
  const usernameParam = useMemo(() => new URLSearchParams(search).get("username") ?? "", [search]);

  const { isFetched: isContactsFetched } = useDirectContactsQuery();
  const { data: contactKeys, isFetched, isError } = useGetPublicKeysQuery(usernameParam);

  // Create temporary contact and select it when searching users
  // `not_joined_${selectedAccount}` – special constructor for creating a temporary contact
  return useDebounce(
    () => {
      if (usernameParam && isContactsFetched && (isFetched || isError)) {
        const pubkey = contactKeys?.pubkey ?? `not_joined_${usernameParam}`;
        queryClient.setQueryData<DirectContact[]>(
          [ChatQueries.DIRECT_CONTACTS, activeUsername],
          (data) => [
            ...(
              queryClient.getQueryData<DirectContact[]>([
                ChatQueries.DIRECT_CONTACTS,
                activeUsername
              ]) ?? []
            ).filter((dc) => dc.pubkey !== pubkey),
            {
              name: usernameParam,
              pubkey
            }
          ]
        );
        setReceiverPubKey(pubkey);
      }
    },
    1000,
    [usernameParam, isContactsFetched, contactKeys, isFetched, isError]
  );
}

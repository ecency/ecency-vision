import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChatQueries } from "../queries";
import { useMappedStore } from "../../../store/use-mapped-store";
import { PREFIX } from "../../../util/local-storage";

export function useLogoutFromChats() {
  const queryClient = useQueryClient();
  const { activeUser } = useMappedStore();

  return useMutation(["chats/logout-from-chats"], async () => {
    localStorage.removeItem(PREFIX + "_nostr_pr_" + activeUser?.username);
    queryClient.setQueryData([ChatQueries.PUBLIC_KEY, activeUser?.username], "");
    queryClient.setQueryData([ChatQueries.PRIVATE_KEY, activeUser?.username], "");
    queryClient.setQueryData([ChatQueries.CHANNELS, activeUser?.username], []);
    queryClient.setQueryData([ChatQueries.DIRECT_CONTACTS, activeUser?.username], []);
  });
}

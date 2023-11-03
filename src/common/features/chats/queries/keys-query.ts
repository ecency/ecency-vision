import { useQueries } from "@tanstack/react-query";
import { ChatQueries } from "./queries";
import { getPrivateKey, getUserChatPublicKey } from "../utils";
import { useMappedStore } from "../../../store/use-mapped-store";
import { NostrKeysType } from "../types";
import { useMemo } from "react";

/**
 * Custom React hook for managing queries related to a user's public and private keys in a chat application.
 *
 * This hook handles querying and managing the user's public and private keys, as well as providing a
 * method for manual data refetch.
 *
 * @returns An object containing the user's public and private keys, along with a refetch method.
 *   - publicKey: The user's public key for secure communication.
 *   - privateKey: The user's private key for secure communication.
 *   - refetch: A function to manually trigger a refetch of the public and private keys.
 */
export function useKeysQuery(
  activeUserKeys?: NostrKeysType,
  setActiveUserKeys?: (keys: Partial<NostrKeysType>) => void
) {
  const { activeUser } = useMappedStore();

  const [
    { data: publicKey, refetch: refetchPublicKey },
    { data: privateKey, refetch: refetchPrivateKey }
  ] = useQueries({
    queries: [
      {
        queryKey: [ChatQueries.PUBLIC_KEY],
        queryFn: () => getUserChatPublicKey(activeUser?.username!),
        onSuccess: (key: string | null) => {
          if (key) {
            setActiveUserKeys?.({
              ...(activeUserKeys ?? {}),
              pub: key
            });
          }
        }
      },
      {
        queryKey: [ChatQueries.PRIVATE_KEY],
        queryFn: () => getPrivateKey(activeUser?.username!),
        onSuccess: (key: string | null) => {
          if (key) {
            setActiveUserKeys?.({
              ...(activeUserKeys ?? {}),
              priv: key
            });
          }
        }
      }
    ]
  });

  const hasKeys = useMemo(() => !!publicKey && !!privateKey, [publicKey, privateKey]);

  return {
    publicKey,
    privateKey,
    hasKeys,
    refetch: () => {
      refetchPublicKey();
      refetchPrivateKey();
    }
  };
}

import { useQuery } from "@tanstack/react-query";
import * as bridgeApi from "../../../api/bridge";
import { formatError } from "@/api/operations";
import { useEffect } from "react";
import { Entry } from "@/entities";
import { useEntryCache } from "@/core/caches";
import { QueryIdentifiers } from "@/core/react-query";
import { useRouter } from "next/navigation";
import { error } from "@/features/shared";

export function useEntryDetector(
  username: string | undefined,
  permlink: string | undefined,
  onEntryDetected: (entry?: Entry) => void
) {
  const router = useRouter();

  const { data } = useEntryCache("", username?.replace("@", ""), permlink);
  const { data: normalizedEntry } = useQuery({
    queryKey: [QueryIdentifiers.NORMALIZED_ENTRY, username?.replace("@", ""), permlink],
    queryFn: async () => {
      try {
        const response = await bridgeApi.normalizePost(data);

        if (!response) {
          error("Could not fetch post data.");
          router.push("/submit");
          return;
        }

        return response;
      } catch (e) {
        error(...formatError(e));
        return;
      }
    },
    enabled: !!data
  });

  useEffect(() => {
    onEntryDetected(normalizedEntry);
  }, [normalizedEntry, onEntryDetected]);
}

import { useEffect } from "react";
import { Entry } from "@/entities";
import { EcencyEntriesCacheManagement } from "@/core/caches";
import { useRouter } from "next/navigation";
import { error } from "@/features/shared";
import useMount from "react-use/lib/useMount";

export function useEntryDetector(
  username: string | undefined,
  permlink: string | undefined,
  onEntryDetected: (entry?: Entry) => void
) {
  const router = useRouter();

  const { data, refetch } = EcencyEntriesCacheManagement.getEntryQueryByPath(
    username?.replace("@", ""),
    permlink
  ).useClientQuery();
  const { data: normalizedEntry, isSuccess } =
    EcencyEntriesCacheManagement.getNormalizedPostQuery(data).useClientQuery();

  useMount(() => refetch());

  useEffect(() => {
    if (!normalizedEntry && isSuccess) {
      error("Could not fetch post data.");
      router.push("/submit");
      return;
    }

    if (normalizedEntry) onEntryDetected(normalizedEntry);
  }, [isSuccess, normalizedEntry, onEntryDetected, router]);
}

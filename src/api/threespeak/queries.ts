import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllVideoStatuses } from "./api";
import { ThreeSpeakVideo } from "./types";
import { useAsyncFn, usePrevious } from "react-use";
import { QueryIdentifiers } from "@/core/react-query";
import { useGlobalStore } from "@/core/global-store";

export function useThreeSpeakVideo(
  filterStatus: ThreeSpeakVideo["status"] | "all",
  enabled = true
) {
  const activeUser = useGlobalStore((state) => state.activeUser);
  const prevActiveUser = usePrevious(activeUser);

  const queryClient = useQueryClient();

  const apiQuery = useQuery({
    queryKey: [QueryIdentifiers.THREE_SPEAK_VIDEO_LIST, activeUser?.username ?? ""],
    queryFn: async () => {
      if (!activeUser) {
        return [];
      }

      try {
        return await getAllVideoStatuses(activeUser!.username);
      } catch (e) {
        console.error(e);
      }
      return [];
    },
    initialData: [],
    enabled
  });

  const filteredQuery = useQuery({
    queryKey: [QueryIdentifiers.THREE_SPEAK_VIDEO_LIST_FILTERED, filterStatus],
    queryFn: () => {
      if (filterStatus === "all") {
        return apiQuery.data!!;
      }
      return apiQuery.data!!.filter((video: ThreeSpeakVideo) => video.status === filterStatus);
    },
    initialData: [],
    enabled: apiQuery.data?.length > 0
  });

  useAsyncFn(async () => {
    if (activeUser?.username !== prevActiveUser?.username) {
      await queryClient.invalidateQueries({
        queryKey: [QueryIdentifiers.THREE_SPEAK_VIDEO_LIST, activeUser?.username ?? ""]
      });
      await queryClient.invalidateQueries({
        queryKey: [QueryIdentifiers.THREE_SPEAK_VIDEO_LIST, "all"]
      });
    }
  }, [activeUser]);

  return {
    ...filteredQuery,
    isFetching: apiQuery.isFetching,
    refresh: () => {
      queryClient.setQueryData(
        [QueryIdentifiers.THREE_SPEAK_VIDEO_LIST, activeUser?.username ?? ""],
        []
      );
      queryClient.invalidateQueries({
        queryKey: [QueryIdentifiers.THREE_SPEAK_VIDEO_LIST, activeUser?.username ?? ""]
      });
    }
  };
}

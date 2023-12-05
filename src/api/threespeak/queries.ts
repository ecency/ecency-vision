import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAllVideoStatuses } from "./api";
import { ThreeSpeakVideo } from "./types";
import { useAsyncFn, usePrevious } from "react-use";
import { QueryIdentifiers } from "@/core/react-query";

export function useThreeSpeakVideo(
  filterStatus: ThreeSpeakVideo["status"] | "all",
  enabled = true
) {
  const { activeUser } = useMappedStore();
  const prevActiveUser = usePrevious(activeUser);

  const queryClient = useQueryClient();

  const apiQuery = useQuery(
    [QueryIdentifiers.THREE_SPEAK_VIDEO_LIST, activeUser?.username ?? ""],
    async () => {
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
    {
      initialData: [],
      enabled
    }
  );

  const filteredQuery = useQuery(
    [QueryIdentifiers.THREE_SPEAK_VIDEO_LIST_FILTERED, filterStatus],
    () => {
      if (filterStatus === "all") {
        return apiQuery.data!!;
      }
      return apiQuery.data!!.filter((video: ThreeSpeakVideo) => video.status === filterStatus);
    },
    {
      initialData: [],
      enabled: apiQuery.data?.length > 0
    }
  );

  useAsyncFn(async () => {
    if (activeUser?.username !== prevActiveUser?.username) {
      await queryClient.invalidateQueries([
        QueryIdentifiers.THREE_SPEAK_VIDEO_LIST,
        activeUser?.username ?? ""
      ]);
      await queryClient.invalidateQueries([QueryIdentifiers.THREE_SPEAK_VIDEO_LIST, "all"]);
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
      queryClient.invalidateQueries([
        QueryIdentifiers.THREE_SPEAK_VIDEO_LIST,
        activeUser?.username ?? ""
      ]);
    }
  };
}

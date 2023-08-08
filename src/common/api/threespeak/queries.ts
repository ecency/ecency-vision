import { useQuery, useQueryClient } from "@tanstack/react-query";
import { QueryIdentifiers } from "../../core";
import { getAllVideoStatuses } from "./api";
import { useMappedStore } from "../../store/use-mapped-store";
import { ThreeSpeakVideo } from "./types";
import { usePrevious } from "../../util/use-previous";
import { useAsyncFn } from "react-use";

export function useThreeSpeakVideo(
  filterStatus: ThreeSpeakVideo["status"] | "all",
  enabled = true
) {
  const { activeUser } = useMappedStore();
  const prevActiveUser = usePrevious(activeUser);

  const queryClient = useQueryClient();

  const apiQuery = useQuery(
    [QueryIdentifiers.THREE_SPEAK_VIDEO_LIST],
    async () => {
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
      await queryClient.invalidateQueries([QueryIdentifiers.THREE_SPEAK_VIDEO_LIST]);
      await queryClient.invalidateQueries([QueryIdentifiers.THREE_SPEAK_VIDEO_LIST, "all"]);
    }
  }, [activeUser]);

  return {
    ...filteredQuery,
    isFetching: apiQuery.isFetching,
    refresh: () => {
      queryClient.setQueryData([QueryIdentifiers.THREE_SPEAK_VIDEO_LIST], []);
      queryClient.invalidateQueries([QueryIdentifiers.THREE_SPEAK_VIDEO_LIST]);
    }
  };
}

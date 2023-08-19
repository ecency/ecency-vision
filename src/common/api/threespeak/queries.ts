import { useQuery, useQueryClient } from "@tanstack/react-query";
import { QueryIdentifiers } from "../../../core/react-query";
import { getAllVideoStatuses } from "./api";
import { ThreeSpeakVideo } from "./types";
import { usePrevious } from "../../util/use-previous";
import { useAsyncFn } from "react-use";
import { ActiveUser } from "../../store/active-user/types";

export function useThreeSpeakVideo(
  filterStatus: ThreeSpeakVideo["status"] | "all",
  activeUser: ActiveUser,
  enabled = true,
) {
  const prevActiveUser = usePrevious(activeUser);

  const queryClient = useQueryClient();

  const apiQuery = useQuery(
    [QueryIdentifiers.THREE_SPEAK_VIDEO_LIST, activeUser?.username ?? ""],
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

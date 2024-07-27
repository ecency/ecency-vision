import { useMutation } from "@tanstack/react-query";
import { error, success } from "@/features/shared";
import { Entry } from "@/entities";
import { addBookmark } from "@/api/private-api";
import { getAccessToken } from "@/utils";
import { appAxios } from "@/api/axios";
import { apiBase } from "@/api/helper";
import { useGlobalStore } from "@/core/global-store";
import i18next from "i18next";
import { getQueryClient, QueryIdentifiers } from "@/core/react-query";

export function useBookmarkAdd(entry: Entry) {
  const activeUser = useGlobalStore((s) => s.activeUser);

  return useMutation({
    mutationKey: ["bookmarks", "addBookmark"],
    mutationFn: async () => {
      if (!activeUser) {
        throw new Error("No active user");
      }

      const data = {
        code: getAccessToken(activeUser?.username),
        author: entry.author,
        permlink: entry.permlink
      };
      const response = await appAxios.post(apiBase(`/private-api/bookmarks-add`), data);
      return response.data;
    },
    onSuccess: () => {
      success(i18next.t("bookmark-btn.added"));
      getQueryClient().invalidateQueries({
        queryKey: [QueryIdentifiers.BOOKMARKS, activeUser?.username]
      });
    },
    onError: (e) => error(i18next.t("g.server-error"))
  });
}

export function useBookmarkDelete(bookmarkId?: string) {
  const activeUser = useGlobalStore((s) => s.activeUser);

  return useMutation({
    mutationKey: ["bookmarks", "deleteBookmark"],
    mutationFn: async () => {
      if (!activeUser) {
        throw new Error("No active user");
      }

      const data = { code: getAccessToken(activeUser.username), id: bookmarkId };
      const response = await appAxios.post(apiBase(`/private-api/bookmarks-delete`), data);
      return response.data;
    },
    onSuccess: () => {
      success(i18next.t("bookmark-btn.deleted"));
      getQueryClient().invalidateQueries({
        queryKey: [QueryIdentifiers.BOOKMARKS, activeUser?.username]
      });
    },
    onError: (e) => error(i18next.t("g.server-error"))
  });
}

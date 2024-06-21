import { EcencyQueriesManager, QueryIdentifiers } from "@/core/react-query";
import { getAccessToken } from "@/utils";
import { appAxios } from "@/api/axios";
import { apiBase } from "@/api/helper";
import { UserImage } from "@/api/private-api";

export const getImagesQuery = (username?: string) =>
  EcencyQueriesManager.generateClientServerQuery({
    queryKey: [QueryIdentifiers.GET_IMAGES],
    queryFn: async () => {
      if (!username) {
        return [];
      }

      const data = { code: getAccessToken(username) };
      const response = await appAxios.post<UserImage[]>(apiBase(`/private-api/images`), data);
      return response.data;
    },
    select: (items) =>
      items.sort((a, b) => {
        return new Date(b.created).getTime() > new Date(a.created).getTime() ? 1 : -1;
      })
  });

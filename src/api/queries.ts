import { useQuery } from "@tanstack/react-query";
import { getPoints, getPointTransactions } from "./private-api";
import axios from "axios";
import { catchPostImage } from "@ecency/render-helper";
import { useGlobalStore } from "@/core/global-store";
import { QueryIdentifiers } from "@/core/react-query";
import { Entry } from "@/entities";

const DEFAULT = {
  points: "0.000",
  uPoints: "0.000",
  transactions: []
};

export function usePointsQuery(username: string, filter = 0) {
  const global = useGlobalStore((state) => state.global);

  return useQuery(
    [QueryIdentifiers.POINTS, username, filter],
    async () => {
      const name = username.replace("@", "");

      try {
        const points = await getPoints(name, global.usePrivate);
        const transactions = await getPointTransactions(name, filter);
        return {
          points: points.points,
          uPoints: points.unclaimed_points,
          transactions
        };
      } catch (e) {
        return DEFAULT;
      }
    },
    {
      initialData: DEFAULT,
      retryDelay: 30000
    }
  );
}

export function useImageDownloader(
  entry: Entry,
  noImage: string,
  width: number,
  height: number,
  enabled: boolean
) {
  const global = useGlobalStore((state) => state.global);

  const blobToBase64 = (blob: Blob) => {
    const reader = new FileReader();

    reader.readAsDataURL(blob);

    return new Promise((resolve, reject) => {
      reader.onloadend = function () {
        const base64data = reader.result;
        resolve(base64data);
      };
      reader.onerror = function (e) {
        reject(e);
      };
    });
  };

  return useQuery(
    [QueryIdentifiers.ENTRY_THUMB, entry.author, entry.permlink, width, height],
    async () => {
      try {
        const response = await axios.get(
          global.canUseWebp
            ? catchPostImage(entry, width, height, "webp")
            : catchPostImage(entry, width, height) || noImage,
          {
            responseType: "blob"
          }
        );

        return (await blobToBase64(response.data)) as string;
      } catch (e) {
        return noImage;
      }
    },
    {
      enabled,
      retryDelay: 3000
    }
  );
}

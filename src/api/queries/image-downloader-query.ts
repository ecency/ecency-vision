import { Entry } from "@/entities";
import { useGlobalStore } from "@/core/global-store";
import { useQuery } from "@tanstack/react-query";
import { QueryIdentifiers } from "@/core/react-query";
import axios from "axios";
import { catchPostImage } from "@ecency/render-helper";

export function useImageDownloader(
  entry: Entry,
  noImage: string,
  width: number,
  height: number,
  enabled: boolean
) {
  const canUseWebp = useGlobalStore((state) => state.canUseWebp);

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

  return useQuery({
    queryKey: [QueryIdentifiers.ENTRY_THUMB, entry.author, entry.permlink, width, height],
    queryFn: async () => {
      try {
        const response = await axios.get(
          canUseWebp
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
    enabled,
    retryDelay: 3000
  });
}

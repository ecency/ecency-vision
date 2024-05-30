import { useMutation } from "@tanstack/react-query";
import defaults from "@/defaults.json";
import { appAxios } from "@/api/axios";
import { getAccessToken } from "@/utils";
import { useGlobalStore } from "@/core/global-store";
import { error, success } from "@/features/shared";
import i18next from "i18next";

export function useImageUpload() {
  const activeUser = useGlobalStore((state) => state.activeUser);

  return useMutation({
    mutationKey: ["upload-image"],
    mutationFn: async ({ file }: { file: File }) => {
      const fData = new FormData();
      fData.append("file", file);

      const token = getAccessToken(activeUser!.username);
      const postUrl = `${defaults.imageServer}/hs/${token}`;

      const r = await appAxios.post(postUrl, fData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      return r.data;
    },
    onSuccess: () => success(i18next.t("image-upload-button.uploaded")),
    onError: () => error(i18next.t("g.server-error"))
  });
}

import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useGlobalStore } from "@/core/global-store";
import { getAccessToken } from "@/utils";
import { uploadImage } from "@/api/misc";
import { addImage } from "@/api/private-api";
import { error } from "@/features/shared";
import i18next from "i18next";

class FileUploadingError {
  constructor(
    public code: number,
    public message: string
  ) {}
}

export function useChatFileUpload(onSuccess: (file: File, v: string) => void) {
  const activeUser = useGlobalStore((state) => state.activeUser);
  const usePrivate = useGlobalStore((state) => state.usePrivate);

  return useMutation({
    mutationKey: ["chats/file-upload"],
    mutationFn: async (file: File) => {
      const username = activeUser?.username;

      if (!username) {
        throw new FileUploadingError(0, "[Chat][File uploading] No user");
      }

      const token = getAccessToken(username);

      if (!token) {
        throw new FileUploadingError(1, "[Chat][File uploading] No token");
      }

      let imageUrl: string;
      const resp = await uploadImage(file, token);
      imageUrl = resp.url;

      if (usePrivate && imageUrl.length > 0) {
        await addImage(username, imageUrl);
      }

      return [file, imageUrl] as const;
    },
    onError: (e) => {
      if (axios.isAxiosError(e) && e.response?.status === 413) {
        error(i18next.t("editor-toolbar.image-error-size"));
      } else if (axios.isAxiosError(e) && e.response?.status === 409) {
        error(i18next.t("editor-toolbar.image-error-conflict-name"));
      } else if (e instanceof FileUploadingError) {
        error(i18next.t("editor-toolbar.image-error-cache"));
        throw new Error(e.message);
      } else {
        error(i18next.t("editor-toolbar.image-error"));
      }
    },
    onSuccess: ([file, imageUrl]) => onSuccess(file, imageUrl)
  });
}

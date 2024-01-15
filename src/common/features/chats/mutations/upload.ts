import { useMutation } from "@tanstack/react-query";
import { getAccessToken } from "../../../helper/user-token";
import { uploadImage } from "../../../api/misc";
import { addImage } from "../../../api/private-api";
import { error } from "../../../components/feedback";
import { _t } from "../../../i18n";
import axios from "axios";
import { useMappedStore } from "../../../store/use-mapped-store";

class FileUploadingError {
  constructor(public code: number, public message: string) {}
}

export function useChatFileUpload(onSuccess: (file: File, v: string) => void) {
  const { activeUser, global } = useMappedStore();

  return useMutation(
    ["chats/file-upload"],
    async (file: File) => {
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

      if (global.usePrivate && imageUrl.length > 0) {
        await addImage(username, imageUrl);
      }

      return [file, imageUrl] as const;
    },
    {
      onError: (e) => {
        if (axios.isAxiosError(e) && e.response?.status === 413) {
          error(_t("editor-toolbar.image-error-size"));
        } else if (axios.isAxiosError(e) && e.response?.status === 409) {
          error(_t("editor-toolbar.image-error-conflict-name"));
        } else if (e instanceof FileUploadingError) {
          error(_t("editor-toolbar.image-error-cache"));
          throw new Error(e.message);
        } else {
          error(_t("editor-toolbar.image-error"));
        }
      },
      onSuccess: ([file, imageUrl]) => onSuccess(file, imageUrl)
    }
  );
}

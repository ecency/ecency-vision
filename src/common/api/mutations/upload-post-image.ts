import { useMutation } from "@tanstack/react-query";
import { getAccessToken } from "../../helper/user-token";
import { uploadImage } from "../misc";
import { addImage } from "../private-api";
import { error } from "../../components/feedback";
import { _t } from "../../i18n";
import axios from "axios";
import { useMappedStore } from "../../store/use-mapped-store";

export function useUploadPostImage() {
  const { activeUser, global } = useMappedStore();
  const { mutateAsync: upload } = useMutation({
    mutationKey: ["uploadPostImage"],
    mutationFn: async ({ file }: { file: File }) => {
      const username = activeUser?.username!;
      let token = getAccessToken(username);

      if (!token) {
        error(_t("editor-toolbar.image-error-cache"));
        throw new Error("Token missed");
      }

      return uploadImage(file, token);
    },
    onError: (e: Error) => {
      if (axios.isAxiosError(e) && e.response?.status === 413) {
        error(_t("editor-toolbar.image-error-size"));
      } else if (e.message === "Token missed") {
        error(_t("g.image-error-cache"));
      } else {
        error(_t("editor-toolbar.image-error"));
      }
    }
  });

  const { mutateAsync: add } = useMutation({
    mutationKey: ["addPostImage"],
    mutationFn: async ({ url }: { url: string }) => {
      const username = activeUser?.username!;
      let token = getAccessToken(username);

      if (!token) {
        error(_t("editor-toolbar.image-error-cache"));
        throw new Error("Token missed");
      }

      if (global.usePrivate && url.length > 0) {
        await addImage(username, url);
        return;
      }

      throw new Error("URL missed");
    },
    onError: (e: Error) => {
      if (axios.isAxiosError(e)) {
        error(_t("editor-toolbar.image-error-network"));
      } else if (e.message === "Token missed") {
        error(_t("g.image-error-cache"));
      } else if (e.message === "URL missed") {
        error(_t("editor-toolbar.image-error-url-missed"));
      } else {
        error(_t("editor-toolbar.image-error"));
      }
    }
  });

  return useMutation({
    mutationKey: ["uploadAndAddPostImage"],
    mutationFn: async ({ file }: { file: File }) => {
      const response = await upload({ file });
      await add(response);
      return response;
    }
  });
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { uploadFile, uploadVideoInfo } from "./api";
import { QueryIdentifiers } from "../../core";
import { useThreeSpeakVideo } from "./queries";

export function useThreeSpeakVideoUpload(type: "video" | "thumbnail") {
  const [completed, setCompleted] = useState<number>(0);

  const mutation = useMutation(
    ["threeSpeakVideoUpload", type],
    async ({ file }: { file: File }) => {
      try {
        return uploadFile(file, type, (percentage) => setCompleted(percentage));
      } catch (e) {
        console.error(e);
      } finally {
        setCompleted(0);
      }
      return null;
    }
  );

  return { ...mutation, completed, setCompleted };
}

export function useUploadVideoInfo() {
  const queryClient = useQueryClient();
  const { data, refetch } = useThreeSpeakVideo("all");

  return useMutation(
    ["threeSpeakVideoUploadInfo"],
    async ({
      fileName,
      fileSize,
      videoUrl,
      thumbUrl,
      activeUser,
      duration
    }: {
      fileName: string;
      fileSize: number;
      videoUrl: string;
      thumbUrl: string;
      activeUser: string;
      duration: string;
    }) => {
      try {
        return await uploadVideoInfo(fileName, fileSize, videoUrl, thumbUrl, activeUser, duration);
      } catch (e) {
        console.error(e);
      }
      return null;
    },

    {
      onSuccess: async (response) => {
        if (response) {
          let current = data;
          if (current.length === 0) {
            const response = await refetch();
            current = response.data ?? [];
          }

          const next = [response, ...current];
          queryClient.setQueryData([QueryIdentifiers.THREE_SPEAK_VIDEO_LIST], next);
          queryClient.setQueryData([QueryIdentifiers.THREE_SPEAK_VIDEO_LIST_FILTERED, "all"], next);
        }
      }
    }
  );
}

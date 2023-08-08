import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { uploadFile, uploadVideoInfo } from "./api";
import { QueryIdentifiers } from "../../core";
import { useThreeSpeakVideo } from "./queries";

export function useThreeSpeakVideoUpload() {
  const [completedByType, setCompletedByType] = useState<Record<string, number>>({});

  const mutation = useMutation(
    ["threespeakVideoUpload"],
    async ({ file, type }: { file: File; type: string }) => {
      try {
        return uploadFile(file, type, (percentage) =>
          setCompletedByType({ ...completedByType, [type]: percentage })
        );
      } catch (e) {
        console.error(e);
      } finally {
        setCompletedByType({ ...completedByType, [type]: 0 });
      }
      return null;
    }
  );

  return { ...mutation, completedByType, setCompletedByType };
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

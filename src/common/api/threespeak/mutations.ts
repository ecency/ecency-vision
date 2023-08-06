import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { uploadFile, uploadVideoInfo } from "./api";
import { QueryIdentifiers } from "../../core";
import { ThreeSpeakVideo } from "./types";

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
      onSuccess: (response) => {
        if (response) {
          const next = [
            response,
            ...(queryClient.getQueryData<ThreeSpeakVideo[]>([
              QueryIdentifiers.THREE_SPEAK_VIDEO_LIST
            ]) ?? [])
          ];
          queryClient.setQueryData([QueryIdentifiers.THREE_SPEAK_VIDEO_LIST], next);
          queryClient.setQueryData([QueryIdentifiers.THREE_SPEAK_VIDEO_LIST_FILTERED, "all"], next);
        }
      }
    }
  );
}

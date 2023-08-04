import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { uploadFile } from "./api";
import { QueryIdentifiers } from "../../core";

export function useThreeSpeakVideoUpload() {
  const queryClient = useQueryClient();

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
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries([QueryIdentifiers.THREE_SPEAK_VIDEO_LIST]);
        queryClient.invalidateQueries([QueryIdentifiers.THREE_SPEAK_VIDEO_LIST_FILTERED, "all"]);
      }
    }
  );

  return { ...mutation, completedByType };
}

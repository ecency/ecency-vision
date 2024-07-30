import { useMutation } from "@tanstack/react-query";
import { usrActivity } from "../private-api";

interface Params {
  bl?: string | number;
  tx?: string | number;
}

export function useUserActivity(username: string | undefined, ty: number) {
  return useMutation({
    mutationKey: ["user-activity", username, ty],
    mutationFn: async (params: Params | undefined) => {
      if (username) {
        await usrActivity(username, ty, params?.bl, params?.tx);
      }
    }
  });
}

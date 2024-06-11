import { useMutation } from "@tanstack/react-query";
import { useGlobalStore } from "@/core/global-store";
import { getAccessToken } from "@/utils";
import { appAxios } from "@/api/axios";
import { apiBase } from "@/api/helper";

export function useRecordUserActivity() {
  const activeUser = useGlobalStore((s) => s.activeUser);
  const usePrivate = useGlobalStore((s) => s.usePrivate);

  return useMutation({
    mutationKey: ["recordUserActivity", activeUser?.username],
    mutationFn: ({
      ty,
      bl = "",
      tx = ""
    }: {
      ty: number;
      bl: string | number;
      tx: string | number;
    }) => {
      if (!usePrivate) {
        return new Promise((resolve) => resolve(null));
      }

      const params: {
        code: string | undefined;
        ty: number;
        bl?: string | number;
        tx?: string | number;
      } = { code: getAccessToken(activeUser!.username), ty };

      if (bl) params.bl = bl;
      if (tx) params.tx = tx;

      return appAxios.post(apiBase(`/private-api/usr-activity`), params);
    }
  });
}

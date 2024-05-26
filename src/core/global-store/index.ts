import { useClientGlobalStore } from "@/core/global-store/client-init";
import { useServerGlobalStore } from "@/core/global-store/server-init";

export const useGlobalStore =
  typeof window !== "undefined" ? useClientGlobalStore : useServerGlobalStore;

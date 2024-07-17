import { useClientGlobalStore } from "@/core/global-store/initialization/client-init";
import { useServerGlobalStore } from "@/core/global-store/initialization/server-init";

export const useGlobalStore =
  typeof window !== "undefined" ? useClientGlobalStore : useServerGlobalStore;

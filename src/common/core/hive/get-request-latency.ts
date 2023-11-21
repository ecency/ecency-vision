import { useMutation } from "@tanstack/react-query";
import axios from "axios";

export function useGetRequestLatency() {
  return useMutation(["hive", "ping-nearest-server"], async (url: string) => {
    const startDate = new Date();
    await axios.get(url);

    const endDate = new Date();
    return {
      startDate,
      endDate,
      latency: endDate.getTime() - startDate.getTime() // in ms
    };
  });
}

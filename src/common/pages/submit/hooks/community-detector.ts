import useMount from "react-use/lib/useMount";
import queryString from "query-string";
import { Location } from "history";

export function useCommunityDetector(location: Location, onDetected: (community: string) => void) {
  useMount(() => {
    const qs = queryString.parse(location.search);
    if (qs.com) {
      onDetected(qs.com as string);
    }
  });
}

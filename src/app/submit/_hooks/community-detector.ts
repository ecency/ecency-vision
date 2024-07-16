import useMount from "react-use/lib/useMount";
import { useSearchParams } from "next/navigation";

export function useCommunityDetector(onDetected: (community: string) => void) {
  const searchParams = useSearchParams();

  useMount(() => {
    const com = searchParams.get("com");
    if (com) {
      onDetected(com as string);
    }
  });
}
